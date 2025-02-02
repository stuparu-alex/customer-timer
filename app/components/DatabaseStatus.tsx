'use client';
import { useState } from 'react';

export default function DatabaseStatus() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const testConnection = async () => {
    try {
      setStatus('loading');
      const response = await fetch('/api/test-connection');
      const data = await response.json();
      
      if (response.ok) {
        setStatus('success');
        setMessage(data.message);
      } else {
        setStatus('error');
        setMessage(data.message);
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to test connection');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={testConnection}
        disabled={status === 'loading'}
        className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium shadow-sm
          ${status === 'loading' ? 'bg-gray-300 cursor-not-allowed' :
          status === 'success' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' :
          status === 'error' ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' :
          'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
      >
        {status === 'loading' ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Testing...
          </>
        ) : (
          <>
            <span className={`mr-1 ${status === 'idle' ? 'hidden' : ''}`}>
              {status === 'success' ? '✓' : status === 'error' ? '✕' : ''}
            </span>
            Test Database Connection
          </>
        )}
      </button>
      {message && (
        <span className={`text-sm ${
          status === 'success' ? 'text-green-600' : 
          status === 'error' ? 'text-red-600' : 'text-gray-600'
        }`}>
          {message}
        </span>
      )}
    </div>
  );
} 