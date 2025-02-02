'use client';
import { useState } from 'react';
import { Customer } from '../types/customer';

export default function ViewDatabase() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchDatabaseContents = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/customers');
      if (!response.ok) {
        throw new Error('Failed to fetch database contents');
      }
      const customers = await response.json();
      setData(customers);
      setIsOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const getRemainingTime = (endTime: number) => {
    const now = Date.now();
    const remaining = endTime - now;
    
    if (remaining <= 0) return 'Time expired';
    
    const minutes = Math.floor(remaining / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m remaining`;
    }
    return `${remainingMinutes}m remaining`;
  };

  return (
    <>
      <button
        onClick={fetchDatabaseContents}
        disabled={loading}
        className="inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium shadow-sm
          bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading...
          </>
        ) : (
          'View Database'
        )}
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold">Database Contents</h2>
                <p className="text-sm text-gray-500">Total Records: {data.length}</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {error ? (
              <div className="text-red-600 p-4 bg-red-50 rounded">
                {error}
              </div>
            ) : data.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No records found in database
              </div>
            ) : (
              <div className="space-y-4">
                {data.map((customer) => (
                  <div
                    key={customer._id}
                    className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    {/* Header with Name and Status */}
                    <div className="flex justify-between items-start mb-3 pb-2 border-b">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          {customer.name}
                          <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${customer.status === 'checked-in' ? 'bg-green-100 text-green-800' : 
                              customer.status === 'checked-out' ? 'bg-red-100 text-red-800' : 
                              'bg-gray-100 text-gray-800'}`}>
                            {customer.status}
                          </span>
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">MongoDB ID: {customer._id}</p>
                      </div>
                      <p className="text-sm text-gray-600">
                        Checked in: {customer.checkInTime}
                      </p>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Interval Details */}
                      <div className="bg-white p-3 rounded-md shadow-sm">
                        <h4 className="font-medium text-gray-900 mb-2">Session Details</h4>
                        <div className="space-y-1">
                          {customer.status === 'checked-in' && (
                            <p className="text-sm font-medium mb-2">
                              <span className={`${
                                customer.interval.endTime - Date.now() < 15 * 60 * 1000 
                                  ? 'text-red-600' 
                                  : 'text-blue-600'
                              }`}>
                                {getRemainingTime(customer.interval.endTime)}
                              </span>
                            </p>
                          )}
                          <p className="text-sm">
                            <span className="text-gray-500">Duration:</span>{' '}
                            <span className="font-medium">{customer.interval.duration} minutes</span>
                          </p>
                          <p className="text-sm">
                            <span className="text-gray-500">Start Time:</span>{' '}
                            <span className="font-medium">{formatDate(customer.interval.startTime)}</span>
                          </p>
                          <p className="text-sm">
                            <span className="text-gray-500">End Time:</span>{' '}
                            <span className="font-medium">{formatDate(customer.interval.endTime)}</span>
                          </p>
                          <p className="text-sm">
                            <span className="text-gray-500">Extended:</span>{' '}
                            <span className={`font-medium ${customer.interval.hasExtended ? 'text-green-600' : 'text-gray-600'}`}>
                              {customer.interval.hasExtended ? 'Yes' : 'No'}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* History Section */}
                      {customer.history && customer.history.length > 0 && (
                        <div className="bg-white p-3 rounded-md shadow-sm">
                          <h4 className="font-medium text-gray-900 mb-2">Visit History</h4>
                          <div className="max-h-40 overflow-auto">
                            {customer.history.map((record, index) => (
                              <div key={index} className="text-sm border-b last:border-0 py-2">
                                <div className="flex justify-between text-gray-600">
                                  <span>Check-in: {record.checkIn}</span>
                                  <span>Duration: {record.duration}m</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                  <span>Check-out: {record.checkOut}</span>
                                  <span className={record.completedSession ? 'text-green-600' : 'text-red-600'}>
                                    {record.completedSession ? 'Completed' : 'Incomplete'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
} 