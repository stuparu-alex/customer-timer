'use client';
import { useState } from 'react';
import { TimeOption, TIME_OPTIONS } from '@/app/types/customer';

interface CustomerFormProps {
  onSubmit: (name: string, duration: number) => void;
  buttonText?: string;
}

export default function CustomerForm({ onSubmit, buttonText = 'Check In' }: CustomerFormProps) {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState<number>(60); // Default to 1 hour

  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit(name.trim(), duration);
      setName('');
      setDuration(60); // Reset to default
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && name.trim()) {
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1 flex gap-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter customer name"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <select
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="w-40 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          {TIME_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={handleSubmit}
        disabled={!name.trim()}
        className="whitespace-nowrap px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {buttonText}
      </button>
    </div>
  );
} 