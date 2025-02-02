import { CustomerBase, CustomerRecord } from '../types/customer';

export const StorageKeys = {
  CUSTOMERS: 'customers',
  CUSTOMER_RECORDS: 'customer_records',
  SETTINGS: 'settings'
} as const;

export interface StorageManager {
  getCustomers(): CustomerBase[];
  saveCustomers(customers: CustomerBase[]): void;
  getCustomerRecords(): CustomerRecord[];
  saveCustomerRecords(records: CustomerRecord[]): void;
  clear(): void;
}

class LocalStorageManager implements StorageManager {
  getCustomers(): CustomerBase[] {
    try {
      const data = localStorage.getItem(StorageKeys.CUSTOMERS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading customers from storage:', error);
      return [];
    }
  }

  saveCustomers(customers: CustomerBase[]): void {
    try {
      localStorage.setItem(StorageKeys.CUSTOMERS, JSON.stringify(customers));
    } catch (error) {
      console.error('Error saving customers to storage:', error);
    }
  }

  getCustomerRecords(): CustomerRecord[] {
    try {
      const data = localStorage.getItem(StorageKeys.CUSTOMER_RECORDS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading customer records from storage:', error);
      return [];
    }
  }

  saveCustomerRecords(records: CustomerRecord[]): void {
    try {
      localStorage.setItem(StorageKeys.CUSTOMER_RECORDS, JSON.stringify(records));
    } catch (error) {
      console.error('Error saving customer records to storage:', error);
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(StorageKeys.CUSTOMERS);
      localStorage.removeItem(StorageKeys.CUSTOMER_RECORDS);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
}

export const storageManager = typeof window !== 'undefined' 
  ? new LocalStorageManager() 
  : null; 