import { CustomerBase, CustomerRecord, VisitRecord } from '../types/customer';

class CustomerService {
  private readonly STORAGE_KEY = 'customer_data';
  private readonly AUTO_SAVE_INTERVAL = 30000; // 30 seconds
  private currentCustomers: CustomerBase[] = [];

  // Initialize with auto-save
  constructor() {
    if (typeof window !== 'undefined') {
      // Load initial customers
      this.loadCustomers().then(customers => {
        this.currentCustomers = customers;
      });

      // Set up auto-save interval
      setInterval(() => {
        this.saveToStorage(this.currentCustomers);
      }, this.AUTO_SAVE_INTERVAL);
    }
  }

  // Load customers from API or storage
  async loadCustomers(): Promise<CustomerBase[]> {
    if (typeof window === 'undefined') return [];
    
    try {
      // Try to fetch from API first
      const response = await fetch('/api/customers');
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      const data = await response.json();
      return data as CustomerBase[];
    } catch (apiError) {
      console.error('API fetch failed, falling back to local storage:', apiError);
      
      // Fall back to local storage if API fails
      try {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (!saved) return [];

        const customers = JSON.parse(saved) as CustomerBase[];
        
        // Rehydrate date objects and clean up expired sessions
        return customers
          .map(customer => ({
            ...customer,
            interval: {
              ...customer.interval,
              startTime: Number(customer.interval.startTime),
              endTime: Number(customer.interval.endTime)
            }
          }))
          .filter(this.filterExpiredSessions);
      } catch (storageError) {
        console.error('Error loading from storage:', storageError);
        return [];
      }
    }
  }

  // Save customers to storage
  saveToStorage(customers: CustomerBase[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(customers));
      this.currentCustomers = customers; // Update current customers
    } catch (error) {
      console.error('Error saving customers:', error);
    }
  }

  // Filter out sessions older than 24 hours
  private filterExpiredSessions(customer: CustomerBase): boolean {
    const ONE_DAY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const now = Date.now();
    
    // Keep active sessions and recent checkouts (within last 24 hours)
    if (customer.status === 'checked-in') return true;
    return (now - customer.interval.endTime) < ONE_DAY;
  }

  // Export customer data to CSV
  exportToCSV(customers: CustomerBase[]): void {
    const headers = ['Name', 'Check-in Time', 'Status', 'Duration', 'End Time'];
    const rows = customers.map(customer => [
      customer.name,
      customer.checkInTime,
      customer.status,
      `${customer.interval.duration} minutes`,
      new Date(customer.interval.endTime).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `customers_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  loadCustomerRecords(): CustomerRecord[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const saved = localStorage.getItem('customer_records');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading customer records:', error);
      return [];
    }
  }

  saveCustomerRecords(records: CustomerRecord[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('customer_records', JSON.stringify(records));
    } catch (error) {
      console.error('Error saving customer records:', error);
    }
  }

  updateCustomerRecord(customer: CustomerBase, timeEnded: boolean = false) {
    const records = this.loadCustomerRecords();
    const now = new Date();
    const visitRecord: VisitRecord = {
      checkIn: customer.checkInTime,
      checkOut: now.toLocaleTimeString(),
      duration: customer.interval.duration,
      wasExtended: customer.interval.hasExtended,
      completedSession: !timeEnded,
      timeEnded,
      extensionsUsed: customer.interval.extensionCount || 0
    };

    const existingRecord = records.find(r => r.id === customer._id);
    
    if (existingRecord) {
      existingRecord.totalVisits += 1;
      existingRecord.lastVisit = now.toLocaleString();
      existingRecord.history.unshift(visitRecord);
      existingRecord.status = 'active';
    } else {
      records.push({
        id: customer._id,
        name: customer.name,
        totalVisits: 1,
        lastVisit: now.toLocaleString(),
        status: 'active',
        history: [visitRecord]
      });
    }

    this.saveCustomerRecords(records);
  }

  markCustomerInactive(customerId: string) {
    const records = this.loadCustomerRecords();
    const record = records.find(r => r.id === customerId);
    if (record) {
      record.status = 'inactive';
      this.saveCustomerRecords(records);
    }
  }

  async exportData(): Promise<Blob> {
    try {
      const customers = await this.loadCustomers();
      const records = this.loadCustomerRecords();
      
      const data = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        metadata: {
          totalCustomers: customers.length,
          totalRecords: records.length,
          activeCustomers: customers.filter(c => c.status === 'checked-in').length
        },
        customers,
        records
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      });

      return blob;
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error('Failed to export data');
    }
  }

  async importData(file: File): Promise<string> {
    try {
      if (!file.name.endsWith('.json')) {
        throw new Error('Please select a valid JSON file');
      }

      const fileContent = await file.text();
      const data = JSON.parse(fileContent);
      
      // Enhanced data validation
      if (!data.version || !data.exportDate) {
        throw new Error('Invalid backup file format');
      }

      if (!Array.isArray(data.customers) || !Array.isArray(data.records)) {
        throw new Error('Invalid data structure');
      }

      // Validate customer data structure
      const isValidCustomer = (customer: any): customer is CustomerBase => {
        return customer._id && 
               customer.name && 
               customer.checkInTime && 
               customer.status &&
               customer.interval &&
               typeof customer.interval.duration === 'number';
      };

      // Validate customer records
      const isValidRecord = (record: any): record is CustomerRecord => {
        return record.id &&
               record.name &&
               typeof record.totalVisits === 'number' &&
               record.lastVisit &&
               Array.isArray(record.history);
      };

      if (!data.customers.every(isValidCustomer) || !data.records.every(isValidRecord)) {
        throw new Error('Invalid data format in backup file');
      }

      // Store the imported data
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data.customers));
      localStorage.setItem('customer_records', JSON.stringify(data.records));
      
      return 'Import successful';
    } catch (error) {
      console.error('Import failed:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to import data');
    }
  }

  async addCustomer(name: string, duration: number): Promise<CustomerBase> {
    const response = await fetch('/api/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        status: 'checked-in',
        interval: {
          duration,
          startTime: Date.now(),
          endTime: Date.now() + (duration * 60 * 1000),
          isNearingEnd: false,
          hasExtended: false
        }
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to add customer');
    }
    return response.json();
  }

  async updateCustomer(id: string, data: Partial<CustomerBase>): Promise<CustomerBase> {
    const response = await fetch(`/api/customers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update customer');
    }
    return response.json();
  }

  async deleteCustomer(id: string) {
    const response = await fetch(`/api/customers/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete customer');
    }
    return response.json();
  }

  // Update current customers
  private updateCurrentCustomers(customers: CustomerBase[]): void {
    this.currentCustomers = customers;
    this.saveToStorage(customers);
  }
}

export const customerService = new CustomerService(); 