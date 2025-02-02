'use client';
import { useState } from 'react';
import { customerService } from '@/app/services/customerService';
import { useRouter } from 'next/navigation';

export default function DataManagement() {
  const router = useRouter();
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleExport = async () => {
    try {
      await customerService.exportData();
      showMessage('Data exported successfully', 'success');
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'Export failed', 'error');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      await customerService.importData(file);
      showMessage('Data imported successfully. Refreshing...', 'success');
      
      setTimeout(() => {
        router.refresh();
        window.location.reload();
      }, 1500);
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'Import failed', 'error');
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handleExport}
        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        title="Export all customer data"
      >
        <svg className="mr-2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l-6-6 6-6m6 12l6-6-6-6" />
        </svg>
        Export Backup
      </button>

      <div className="relative">
        <input
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
          id="import-file"
          disabled={importing}
        />
        <label
          htmlFor="import-file"
          className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer ${
            importing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Import customer data from backup"
        >
          <svg className="mr-2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l6 6 6-6m-6 6V4" />
          </svg>
          {importing ? 'Importing...' : 'Import Backup'}
        </label>
      </div>

      {message && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg z-50 ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
} 