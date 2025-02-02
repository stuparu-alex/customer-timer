import { CustomerBase } from '../types/customer';

export function sortCustomers(customers: CustomerBase[]): CustomerBase[] {
  return customers.sort((a, b) => {
    // First sort by status (checked-in first)
    if (a.status !== b.status) {
      return a.status === 'checked-in' ? -1 : 1;
    }

    // For checked-in customers, sort by remaining time
    if (a.status === 'checked-in' && b.status === 'checked-in') {
      const remainingTimeA = a.interval.endTime - Date.now();
      const remainingTimeB = b.interval.endTime - Date.now();
      return remainingTimeA - remainingTimeB;
    }

    // For checked-out customers, sort by check-in time (most recent first)
    return new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime();
  });
}

// Helper function to calculate remaining time
export function getRemainingTime(customer: CustomerBase): number {
  if (customer.status !== 'checked-in') return Infinity;
  return customer.interval.endTime - Date.now();
}

// Helper function to format time
export function formatTimeLeft(milliseconds: number): string {
  if (milliseconds <= 0) return "Time's up";
  const minutes = Math.floor(milliseconds / 1000 / 60);
  const seconds = Math.floor((milliseconds / 1000) % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
} 