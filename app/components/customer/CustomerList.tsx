'use client';
import { Customer } from '@/app/types/customer';
import TimeInterval from './TimeInterval';
import CustomerActions from './CustomerActions';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import PhotoUploadWrapper from './PhotoUploadWrapper';

interface CustomerListProps {
  customers: Customer[];
  onCheckOut: (id: string) => void;
  onExtendTime: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Customer>) => void;
  onDelete: (id: string) => void;
}

export default function CustomerList({ 
  customers, 
  onCheckOut, 
  onExtendTime,
  onUpdate,
  onDelete 
}: CustomerListProps) {
  const [sortedCustomers, setSortedCustomers] = useState<Customer[]>([]);

  // Sort customers function
  const sortCustomers = (customerList: Customer[]) => {
    return [...customerList].sort((a, b) => {
      // First sort by status
      if (a.status !== b.status) {
        return a.status === 'checked-in' ? -1 : 1;
      }
      
      // Then sort checked-in customers by remaining time
      if (a.status === 'checked-in' && b.status === 'checked-in') {
        const timeLeftA = a.interval.endTime - Date.now();
        const timeLeftB = b.interval.endTime - Date.now();
        return timeLeftA - timeLeftB;
      }
      
      // Sort checked-out customers by check-out time (most recent first)
      return new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime();
    });
  };

  // Update sorted customers whenever the customers prop changes
  useEffect(() => {
    setSortedCustomers(sortCustomers(customers));
  }, [customers]);

  // Check for expired timers and update sorting
  useEffect(() => {
    const timer = setInterval(() => {
      setSortedCustomers(prevCustomers => {
        const now = Date.now();
        let needsUpdate = false;

        const updatedCustomers = prevCustomers.map(customer => {
          if (customer.status === 'checked-in' && customer.interval.endTime <= now) {
            needsUpdate = true;
            onCheckOut(customer._id); // Trigger checkout
            return {
              ...customer,
              status: 'checked-out'
            };
          }
          return customer;
        });

        if (needsUpdate) {
          return sortCustomers(updatedCustomers);
        }
        return prevCustomers;
      });
    }, 1000); // Check every second

    return () => clearInterval(timer);
  }, [onCheckOut]);

  const getCardStyle = (customer: Customer) => {
    if (customer.status === 'checked-out') {
      return 'border-gray-200 bg-gray-100 opacity-75';
    }
    
    const timeLeft = customer.interval.endTime - Date.now();
    const isNearingEnd = timeLeft <= 15 * 60 * 1000; // 15 minutes
    
    if (isNearingEnd) return 'border-red-300 bg-red-50';
    return 'border-green-200';
  };

  return (
    <div className="w-full">
      {sortedCustomers.length === 0 ? (
        <div className="text-center py-6">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No customers</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by checking in a new customer.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedCustomers.map((customer) => (
            <div
              key={customer._id}
              className={`rounded-lg shadow-sm border-2 transition-all duration-300 ${getCardStyle(customer)}`}
            >
              {/* Timer Section - Only for checked-in customers */}
              {customer.status === 'checked-in' && (
                <div className="p-4 border-b border-gray-100">
                  <TimeInterval
                    startTime={customer.interval.startTime}
                    endTime={customer.interval.endTime}
                    duration={customer.interval.duration}
                    onExtend={() => onExtendTime(customer._id)}
                    onFinish={() => onCheckOut(customer._id)}
                    isNearingEnd={customer.interval.isNearingEnd}
                    hasExtended={customer.interval.hasExtended}
                    extensionCount={customer.interval.extensionCount || 0}
                    lastExtensionTime={customer.interval.lastExtensionTime}
                  />
                </div>
              )}

              {/* Customer Header - Update background for checked-out state */}
              <div className={`p-4 border-b border-gray-100 ${
                customer.status === 'checked-out' ? 'bg-gray-50' : 'bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <PhotoUploadWrapper
                        customerId={customer._id}
                        currentPhoto={customer.photo}
                        onPhotoUpdate={(photoUrl) => onUpdate(customer._id, { photo: photoUrl })}
                        onError={(message) => {
                          console.error(message);
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{customer.name}</h3>
                      <p className="text-xs text-gray-500">Checked in at {customer.checkInTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${customer.status === 'checked-in'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                      {customer.status === 'checked-in' ? 'Present' : 'Checked Out'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Update background for checked-out state */}
              <div className={`p-4 rounded-b-lg flex items-center justify-between ${
                customer.status === 'checked-out' ? 'bg-gray-50' : 'bg-white'
              }`}>
                <div className="flex items-center space-x-2">
                  <CustomerActions
                    customer={customer}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                  />
                  {customer.status === 'checked-in' && (
                    <button
                      onClick={() => onCheckOut(customer._id)}
                      className="inline-flex items-center p-1.5 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                      title="Check Out"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
                  )}
                </div>
                <button
                  onClick={() => onDelete(customer._id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"
                  title="Delete"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 