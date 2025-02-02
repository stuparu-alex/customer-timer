'use client';
import { useState } from 'react';
import { customerService } from '../../services/customerService';
import { CustomerBase, CustomerRecord, VisitRecord } from '../../types/customer';
import SearchBar from '../../components/customer/SearchBar';

export default function CustomerHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const records = customerService.loadCustomerRecords();
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);

  const filteredRecords = records.filter(record =>
    record.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-sm w-full max-w-7xl mx-auto">
      <div className="mb-8 border-b border-gray-200 pb-5">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Customer History
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              View customer visit history and expired sessions
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search customer history..."
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Customer List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Customers</h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {filteredRecords.map(record => (
              <div
                key={record.id}
                className={`px-4 py-4 cursor-pointer hover:bg-gray-50 ${
                  selectedCustomer?.id === record.id ? 'bg-purple-50' : ''
                }`}
                onClick={() => setSelectedCustomer(record)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{record.name}</h3>
                    <p className="text-sm text-gray-500">
                      Total visits: {record.totalVisits}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      record.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {record.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visit History */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Visit History</h2>
          </div>
          <div className="p-4">
            {selectedCustomer ? (
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-medium text-gray-900">{selectedCustomer.name}</h3>
                  <p className="text-sm text-gray-500">
                    Last visit: {selectedCustomer.lastVisit}
                  </p>
                </div>
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {selectedCustomer.history.map((visit, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-4 space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-gray-900">
                            Check-in: {visit.checkIn}
                          </p>
                          <p className="text-sm text-gray-900">
                            Check-out: {visit.checkOut}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {visit.wasExtended && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              Extended
                            </span>
                          )}
                          {visit.timeEnded && (
                            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                              Time Ended
                            </span>
                          )}
                          {visit.completedSession && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              Completed
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">
                        Duration: {visit.duration} minutes
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                Select a customer to view their visit history
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 