'use client';
import { CustomerBase } from '@/app/types/customer';

interface StatsDetailProps {
  customers: CustomerBase[];
  type: 'all' | 'checked-in' | 'checked-out';
  onClose: () => void;
}

export default function StatsDetail({ customers, type, onClose }: StatsDetailProps) {
  const filteredCustomers = type === 'all' 
    ? customers
    : customers.filter(c => 
        type === 'checked-in' 
          ? c.status === 'checked-in' 
          : c.status === 'checked-out'
      );

  const getTitle = () => {
    switch(type) {
      case 'checked-in': return 'Currently Present Customers';
      case 'checked-out': return 'Checked Out Customers';
      default: return 'All Customers';
    }
  };

  const formatTime = (timestamp: number | null | undefined) => {
    if (!timestamp) return '-';
    try {
      return new Date(timestamp).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return '-';
    }
  };

  const formatTimeSince = (timestamp: number | null) => {
    if (!timestamp) return null;
    try {
      const minutes = Math.floor((Date.now() - timestamp) / (1000 * 60));
      if (minutes < 60) {
        return `${minutes} minutes ago`;
      }
      const hours = Math.floor(minutes / 60);
      if (hours < 24) {
        return `${hours} hours ago`;
      }
      const days = Math.floor(hours / 24);
      return `${days} days ago`;
    } catch (error) {
      return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">{getTitle()}</h3>
          <button
            onClick={onClose}
            className="rounded-md text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-4 py-5 sm:p-6 overflow-auto max-h-[calc(80vh-8rem)]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-in Time
                </th>
                {type !== 'checked-in' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-out Time
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Extensions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer._id} className={customer.status === 'checked-out' ? 'bg-gray-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {customer.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.checkInTime}
                  </td>
                  {type !== 'checked-in' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.status === 'checked-out' 
                        ? formatTime(customer.interval.endTime)
                        : '-'
                      }
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.interval.duration} minutes
                    {customer.interval.hasExtended && (
                      <span className="ml-2 text-xs text-indigo-600">
                        (Extended)
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      customer.status === 'checked-in'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {customer.status === 'checked-in' ? 'Present' : 'Checked Out'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.interval.extensionCount || 0}
                    {customer.interval.lastExtensionTime && (
                      <span className="ml-2 text-xs text-gray-400">
                        {formatTimeSince(customer.interval.lastExtensionTime) && (
                          `(Last: ${formatTimeSince(customer.interval.lastExtensionTime)})`
                        )}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 