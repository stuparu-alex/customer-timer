import { Customer, CustomerRecord } from '../types/customer';

export const StorageKeys = {
  CUSTOMERS: 'customers',
  CUSTOMER_RECORDS: 'customerRecords',
} as const;

export const loadFromStorage = <T>(key: string): T[] => {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : [];
};

export const saveToStorage = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const loadCustomers = (): Customer[] => 
  loadFromStorage<Customer>(StorageKeys.CUSTOMERS);

export const saveCustomers = (customers: Customer[]): void => 
  saveToStorage(StorageKeys.CUSTOMERS, customers);

export const loadCustomerRecords = (): CustomerRecord[] => 
  loadFromStorage<CustomerRecord>(StorageKeys.CUSTOMER_RECORDS);

export const saveCustomerRecords = (records: CustomerRecord[]): void => 
  saveToStorage(StorageKeys.CUSTOMER_RECORDS, records); 