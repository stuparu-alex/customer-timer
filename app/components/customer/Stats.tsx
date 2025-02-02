'use client';
import { useState } from 'react';
import { Customer } from '@/app/types/customer';

interface StatsProps {
  totalCustomers: number;
  checkedIn: number;
  checkedOut: number;
  onViewDetails: (type: 'all' | 'checked-in' | 'checked-out') => void;
}

export default function Stats({ totalCustomers, checkedIn, checkedOut, onViewDetails }: StatsProps) {
  const [showDetails, setShowDetails] = useState(false);

  const stats = [
    { name: 'Total Customers', value: totalCustomers, type: 'all' as const },
    { name: 'Currently Present', value: checkedIn, type: 'checked-in' as const },
    { name: 'Checked Out', value: checkedOut, type: 'checked-out' as const }
  ];

  return (
    <div className="bg-black/40 shadow-lg rounded-lg border border-amber-500/20">
      <dl className="grid grid-cols-1 md:grid-cols-3">
        {stats.map((stat, index) => (
          <button
            key={stat.name}
            onClick={() => onViewDetails(stat.type)}
            className={`px-4 py-5 sm:p-6 hover:bg-amber-500/10 cursor-pointer transition-colors ${
              index < stats.length - 1 ? 'border-b md:border-b-0 md:border-r' : ''
            } border-amber-500/20`}
          >
            <dt className="text-base font-normal text-amber-200">{stat.name}</dt>
            <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
              <div className="flex items-baseline text-2xl font-semibold text-amber-400">
                {stat.value}
              </div>
              <div className="inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium bg-amber-500/10 text-amber-300 md:mt-2 lg:mt-0">
                View Details
              </div>
            </dd>
          </button>
        ))}
      </dl>
    </div>
  );
} 