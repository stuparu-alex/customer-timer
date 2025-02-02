'use client';
import { useState, useRef, useEffect } from 'react';
import { CustomerBase } from '@/app/types/customer';
import { TIME_OPTIONS } from '@/app/types/customer';

interface CustomerActionsProps {
  customer: CustomerBase;
  onUpdate: (id: string, updates: Partial<CustomerBase>) => void;
  onDelete: (id: string) => void;
}

export default function CustomerActions({ customer, onUpdate, onDelete }: CustomerActionsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(30); // Default to 30 minutes
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsEditing(false);
      }
    }

    // Add click event listener when dropdown is open
    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup listener when component unmounts or dropdown closes
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing]);

  const handleTimeUpdate = () => {
    const now = Date.now();
    const newEndTime = now + (selectedDuration * 60 * 1000);

    onUpdate(customer._id, {
      status: 'checked-in', // Force status to checked-in
      interval: {
        ...customer.interval,
        duration: selectedDuration,
        startTime: now,
        endTime: newEndTime,
        isNearingEnd: false,
        hasExtended: false,
        extensionCount: 0,
        lastExtensionTime: null
      }
    });
    setIsEditing(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {isEditing ? (
        <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
              Select New Duration
            </div>
            {TIME_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setSelectedDuration(option.value);
                  handleTimeUpdate();
                }}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              >
                {option.label}
              </button>
            ))}
            <button
              onClick={() => setIsEditing(false)}
              className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 border-t border-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg className="h-4 w-4 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Edit Time
        </button>
      )}
    </div>
  );
} 