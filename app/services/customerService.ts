import { Customer, CustomerRecord, VisitRecord } from '../types/customer';

class CustomerService {
  private readonly STORAGE_KEY = 'customer_data';
  private readonly AUTO_SAVE_INTERVAL = 30000; // 30 seconds

  // Initialize with auto-save
  constructor() {
    if (typeof window !== 'undefined') {
      setInterval(() => this.saveToStorage(), this.AUTO_SAVE_INTERVAL);
    }
  }

  // Load customers from storage
  loadCustomers(): Customer[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (!saved) return [];

      const customers = JSON.parse(saved) as Customer[];
      
      // Rehydrate date objects and clean up expired sessions
      return customers.map(customer => ({
        ...customer,
        interval: {
          ...customer.interval,
          startTime: Number(customer.interval.startTime),
          endTime: Number(customer.interval.endTime)
        }
      })).filter(this.filterExpiredSessions);
    } catch (error) {
      console.error('Error loading customers:', error);
      return [];
    }
  }

  // Save customers to storage
  saveToStorage(customers: Customer[] = []): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(customers));
    } catch (error) {
      console.error('Error saving customers:', error);
    }
  }

  // Filter out sessions older than 24 hours
  private filterExpiredSessions(customer: Customer): boolean {
    const ONE_DAY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const now = Date.now();
    
    // Keep active sessions and recent checkouts (within last 24 hours)
    if (customer.status === 'checked-in') return true;
    return (now - customer.interval.endTime) < ONE_DAY;
  }

  // Export customer data to CSV
  exportToCSV(customers: Customer[]): void {
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

  updateCustomerRecord(customer: Customer, timeEnded: boolean = false) {
    const records = this.loadCustomerRecords();
    const now = new Date();
    const visitRecord: VisitRecord = {
      checkInTime: customer.checkInTime,
      checkOutTime: now.toLocaleTimeString(),
      duration: customer.interval.duration,
      wasExtended: customer.interval.hasExtended,
      completedSession: !timeEnded,
      timeEnded
    };

    const existingRecord = records.find(r => r.id === customer.id);
    
    if (existingRecord) {
      existingRecord.totalVisits += 1;
      existingRecord.lastVisit = now.toLocaleString();
      existingRecord.history.unshift(visitRecord);
      existingRecord.status = 'active';
    } else {
      records.push({
        id: customer.id,
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

  exportData(): string {
    try {
      const data = {
        customers: this.loadCustomers(),
        records: this.loadCustomerRecords(),
        exportDate: new Date().toISOString(),
        version: '1.0',
        metadata: {
          totalCustomers: this.loadCustomers().length,
          totalRecords: this.loadCustomerRecords().length,
          activeCustomers: this.loadCustomers().filter(c => c.status === 'checked-in').length
        }
      };
      
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      const fileName = `customer_data_backup_${new Date().toISOString().split('T')[0]}.json`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return 'Export successful';
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
      const isValidCustomer = (customer: any): customer is Customer => {
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

  async loadCustomers() {
    const response = await fetch('/api/customers');
    if (!response.ok) {
      throw new Error('Failed to fetch customers');
    }
    return response.json();
  }

  async addCustomer(name: string, duration: number) {
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

  async updateCustomer(id: string, data: Partial<Customer>) {
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
}

export const customerService = new CustomerService(); 