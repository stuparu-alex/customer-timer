'use client';
import { useState, useEffect } from "react";
import { Customer } from "../types/customer";
import { customerService } from '../services/customerService';
import CustomerForm from "../components/customer/CustomerForm";
import CustomerList from "../components/customer/CustomerList";
import SearchBar from "../components/customer/SearchBar";
import Stats from "../components/customer/Stats";
import { TIME_OPTIONS } from "../types/customer";
import { useRouter } from 'next/navigation';
import DataManagement from '../components/customer/DataManagement';
import StatsDetail from '../components/customer/StatsDetail';
import UploadDashboard from '../components/customer/UploadDashboard';

const DEFAULT_INTERVAL = 60; // 60 minutes
const WARNING_THRESHOLD = 5; // 5 minutes before end
const EXTENSION_TIME = 30; // 30 minutes
const MAX_EXTENSIONS = 3;
const EXTENSION_COOLDOWN = 60 * 60 * 1000; // 1 hour in milliseconds

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const router = useRouter();
  const [statsView, setStatsView] = useState<'all' | 'checked-in' | 'checked-out' | null>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerService.loadCustomers();
      setCustomers(data);
    } catch (err) {
      setError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    customerService.saveToStorage(customers);
  }, [customers]);

  useEffect(() => {
    // Check for customers nearing end of their interval
    const timer = setInterval(() => {
      setCustomers(prevCustomers => {
        const updatedCustomers = prevCustomers.map(customer => {
          if (customer.status !== 'checked-in') return customer;
          
          const timeLeft = customer.interval.endTime - Date.now();
          const isNearingEnd = timeLeft <= WARNING_THRESHOLD * 60 * 1000 && timeLeft > 0;
          
          // Handle expired sessions
          if (timeLeft <= 0 && !customer.interval.isNearingEnd) {
            customerService.updateCustomerRecord(customer, true);
            return {
              ...customer,
              status: 'checked-out',
              interval: {
                ...customer.interval,
                isNearingEnd: false
              }
            };
          }
          
          return {
            ...customer,
            interval: {
              ...customer.interval,
              isNearingEnd
            }
          };
        });

        // Sort by remaining time
        return updatedCustomers.sort((a, b) => getRemainingTime(a) - getRemainingTime(b));
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(timer);
  }, []);

  // Helper function to calculate remaining time
  const getRemainingTime = (customer: Customer): number => {
    if (customer.status !== 'checked-in') return Infinity;
    return customer.interval.endTime - Date.now();
  };

  // Sort customers by remaining time
  const sortedCustomers = customers
    .filter(customer => 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // First sort by status (checked-in first)
      if (a.status !== b.status) {
        return a.status === 'checked-in' ? -1 : 1;
      }
      // Then sort by remaining time for checked-in customers
      return getRemainingTime(a) - getRemainingTime(b);
    });

  const handleCheckIn = async (name: string, duration: number) => {
    try {
      const newCustomer = await customerService.addCustomer(name, duration);
      // Update customers and maintain sort order
      setCustomers(prev => [...prev, newCustomer].sort((a, b) => 
        getRemainingTime(a) - getRemainingTime(b)
      ));
    } catch (err) {
      setError('Failed to check in customer');
    }
  };

  const handleCheckOut = async (customerId: string) => {
    try {
      const customer = customers.find(c => c._id === customerId);
      if (customer) {
        // First update the database
        await customerService.updateCustomer(customerId, {
          status: 'checked-out',
          interval: {
            ...customer.interval,
            endTime: Date.now(),  // Set end time to now
            isNearingEnd: false
          },
          history: [
            ...customer.history || [],
            {
              checkIn: customer.checkInTime,
              checkOut: new Date().toLocaleTimeString(),
              duration: customer.interval.duration,
              wasExtended: customer.interval.hasExtended,
              completedSession: true,
              timeEnded: false,
              extensionsUsed: customer.interval.extensionCount || 0
            }
          ]
        });

        // Then update local state
        setCustomers(prevCustomers => 
          prevCustomers.map(c => 
            c._id === customerId 
              ? {
                  ...c,
                  status: 'checked-out',
                  interval: {
                    ...c.interval,
                    endTime: Date.now(),
                    isNearingEnd: false
                  }
                }
              : c
          )
        );

        // Update customer record
        customerService.updateCustomerRecord(customer, false);
      }
    } catch (err) {
      setError('Failed to check out customer');
      // Reload customers to ensure UI is in sync with database
      loadCustomers();
    }
  };

  const handleExtendTime = async (customerId: string) => {
    try {
      const customer = customers.find(c => c._id === customerId);
      if (!customer) return;

      const extensionCount = customer.interval.extensionCount || 0;
      const lastExtensionTime = customer.interval.lastExtensionTime;
      const now = Date.now();

      // Check if max extensions reached
      if (extensionCount >= MAX_EXTENSIONS) {
        // Check cooldown period
        if (lastExtensionTime && (now - lastExtensionTime) < EXTENSION_COOLDOWN) {
          const waitMinutes = Math.ceil((EXTENSION_COOLDOWN - (now - lastExtensionTime)) / (1000 * 60));
          setError(`Please wait ${waitMinutes} minutes before extending again`);
          return;
        }
      }

      const newEndTime = now + (EXTENSION_TIME * 60 * 1000);
      const newExtensionCount = extensionCount >= MAX_EXTENSIONS ? 1 : extensionCount + 1;

      // Update UI first
      setCustomers(prevCustomers => 
        prevCustomers.map(c => 
          c._id === customerId
            ? {
                ...c,
                interval: {
                  ...c.interval,
                  endTime: newEndTime,
                  isNearingEnd: false,
                  hasExtended: true,
                  extensionCount: newExtensionCount,
                  lastExtensionTime: now
                }
              }
            : c
        )
      );

      // Then update database
      await customerService.updateCustomer(customerId, {
        interval: {
          ...customer.interval,
          duration: customer.interval.duration + EXTENSION_TIME,
          endTime: newEndTime,
          isNearingEnd: false,
          hasExtended: true,
          extensionCount: newExtensionCount,
          lastExtensionTime: now
        }
      });

    } catch (err) {
      setError('Failed to extend time');
      loadCustomers(); // Reload from database to ensure consistency
    }
  };

  const handleExport = () => {
    customerService.exportToCSV(customers);
  };

  const handleUpdateCustomer = async (customerId: string, updates: Partial<Customer>) => {
    try {
      const customer = customers.find(c => c._id === customerId);
      if (!customer) return;

      // If interval is being updated, set status to checked-in
      const shouldCheckIn = updates.interval && customer.status === 'checked-out';
      const updatedData = {
        ...updates,
        ...(shouldCheckIn && { status: 'checked-in' })
      };

      // Update in database first
      await customerService.updateCustomer(customerId, updatedData);

      // Then update local state
      setCustomers(prevCustomers => 
        prevCustomers.map(c => 
          c._id === customerId
            ? { 
                ...c, 
                ...updatedData,
                // Reset extension count when checking back in
                interval: {
                  ...c.interval,
                  ...(updates.interval || {}),
                  ...(shouldCheckIn && {
                    extensionCount: 0,
                    lastExtensionTime: null,
                    isNearingEnd: false,
                    hasExtended: false
                  })
                }
              }
            : c
        ).sort((a, b) => getRemainingTime(a) - getRemainingTime(b)) // Maintain sort order
      );
    } catch (err) {
      setError('Failed to update customer');
      loadCustomers(); // Reload to ensure consistency
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await customerService.deleteCustomer(customerId);
        setCustomers(customers.filter(customer => customer._id !== customerId));
      } catch (err) {
        setError('Failed to delete customer');
      }
    }
  };

  const handleViewHistory = (customerId: string) => {
    router.push('/customers/history');
  };

  const checkedInCount = customers.filter(c => c.status === 'checked-in').length;
  const checkedOutCount = customers.filter(c => c.status === 'checked-out').length;

  // Handler for stats view
  const handleViewDetails = (type: 'all' | 'checked-in' | 'checked-out') => {
    setStatsView(type);
  };

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Header Section */}
        <div className="mb-4 sm:mb-8 bg-black/40 rounded-lg shadow-lg p-4 sm:p-6 border border-amber-500/20">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-amber-400">
                Customer Management Portal
              </h1>
              <p className="mt-1 text-sm text-amber-200/70">
                Manage and monitor customer activity in real-time
              </p>
            </div>
            {/* Check-in Form */}
            <div className="w-full sm:w-auto">
              <CustomerForm onSubmit={handleCheckIn} />
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-4 sm:mb-8 overflow-x-auto">
          <div className="min-w-[640px] sm:min-w-0">
            <Stats
              totalCustomers={customers.length}
              checkedIn={checkedInCount}
              checkedOut={checkedOutCount}
              onViewDetails={handleViewDetails}
            />
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4 sm:mb-6">
          <SearchBar 
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by customer name..."
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Present Customers Column */}
          <div className="bg-black/40 rounded-lg shadow-lg flex flex-col border border-amber-500/20">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-amber-500/20">
              <h2 className="text-base sm:text-lg font-medium text-amber-400 flex items-center">
                <span className="h-2 w-2 bg-green-400 rounded-full mr-2"></span>
                Present Customers
                <span className="ml-2 text-sm text-amber-200/70">
                  ({customers.filter(c => c.status === 'checked-in').length})
                </span>
              </h2>
            </div>
            <div className="p-4 sm:p-6 flex-1 overflow-x-auto">
              <div className="min-w-[640px] sm:min-w-0">
                <CustomerList
                  customers={sortedCustomers.filter(c => c.status === 'checked-in')}
                  onCheckOut={handleCheckOut}
                  onExtendTime={handleExtendTime}
                  onUpdate={handleUpdateCustomer}
                  onDelete={handleDeleteCustomer}
                />
              </div>
            </div>
          </div>

          {/* Checked Out Column */}
          <div className="bg-black/40 rounded-lg shadow-lg flex flex-col border border-amber-500/20">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-amber-500/20">
              <h2 className="text-base sm:text-lg font-medium text-amber-400 flex items-center">
                <span className="h-2 w-2 bg-amber-400 rounded-full mr-2"></span>
                Recently Checked Out
                <span className="ml-2 text-sm text-amber-200/70">
                  ({customers.filter(c => c.status === 'checked-out').length})
                </span>
              </h2>
            </div>
            <div className="p-4 sm:p-6 flex-1 overflow-x-auto">
              <div className="min-w-[640px] sm:min-w-0">
                <CustomerList
                  customers={sortedCustomers.filter(c => c.status === 'checked-out')}
                  onCheckOut={handleCheckOut}
                  onExtendTime={handleExtendTime}
                  onUpdate={handleUpdateCustomer}
                  onDelete={handleDeleteCustomer}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Detail Modal */}
        {statsView && (
          <StatsDetail
            customers={customers}
            type={statsView}
            onClose={() => setStatsView(null)}
          />
        )}

        <UploadDashboard />
      </div>
    </div>
  );
} 