export interface Customer {
  id: string;
  name: string;
  checkInTime: string;
  status: 'checked-in' | 'checked-out';
}

export interface CustomerRecord {
  id: string;
  name: string;
  totalVisits: number;
  lastVisit: string;
  status: 'active' | 'inactive';
}

// Home page storage functions
export const loadCustomers = (): Customer[] => {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem('customers');
  return saved ? JSON.parse(saved) : [];
};

export const saveCustomers = (customers: Customer[]) => {
  localStorage.setItem('customers', JSON.stringify(customers));
};

// About page storage functions
export const loadCustomerRecords = (): CustomerRecord[] => {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem('customerRecords');
  return saved ? JSON.parse(saved) : [];
};

export const saveCustomerRecords = (records: CustomerRecord[]) => {
  localStorage.setItem('customerRecords', JSON.stringify(records));
}; 