'use client';
import { useState } from 'react';

export default function InstallationPage() {
  const [activeTab, setActiveTab] = useState('setup');

  const tabs = [
    { id: 'setup', label: 'Setup Guide' },
    { id: 'usage', label: 'Usage Guide' },
    { id: 'features', label: 'Features' },
    { id: 'troubleshooting', label: 'Troubleshooting' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow-sm rounded-lg">
        {/* Header */}
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Installation &amp; Usage Guide
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Complete guide for setting up and using the Customer Timer System
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {activeTab === 'setup' && (
            <div className="space-y-6">
              <section>
                <h2 className="text-lg font-medium text-gray-900">System Requirements</h2>
                <div className="mt-3 text-sm text-gray-600">
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Node.js 18.0 or higher</li>
                    <li>MongoDB 5.0 or higher</li>
                    <li>Modern web browser (Chrome, Firefox, Safari, Edge)</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-medium text-gray-900">Installation Steps</h2>
                <div className="mt-3 text-sm text-gray-600 space-y-4">
                  <div className="bg-gray-50 rounded-md p-4">
                    <p className="font-medium text-gray-900">1. Clone the Repository</p>
                    <pre className="mt-2 bg-black text-white p-3 rounded-md overflow-x-auto">
                      git clone https://github.com/yourusername/customer-timer.git
                    </pre>
                  </div>

                  <div className="bg-gray-50 rounded-md p-4">
                    <p className="font-medium text-gray-900">2. Install Dependencies</p>
                    <pre className="mt-2 bg-black text-white p-3 rounded-md overflow-x-auto">
                      npm install
                    </pre>
                  </div>

                  <div className="bg-gray-50 rounded-md p-4">
                    <p className="font-medium text-gray-900">3. Configure Environment</p>
                    <pre className="mt-2 bg-black text-white p-3 rounded-md overflow-x-auto">
                      MONGODB_URI=your_mongodb_connection_string
                      NEXT_PUBLIC_API_URL=your_api_url
                    </pre>
                  </div>

                  <div className="bg-gray-50 rounded-md p-4">
                    <p className="font-medium text-gray-900">4. Run the Application</p>
                    <pre className="mt-2 bg-black text-white p-3 rounded-md overflow-x-auto">
                      npm run dev
                    </pre>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="space-y-6">
              <section>
                <h2 className="text-lg font-medium text-gray-900">Basic Usage</h2>
                <div className="mt-3 text-sm text-gray-600 space-y-3">
                  <h3 className="font-medium">Adding a Customer</h3>
                  <p>1. Click "New Check-in" button</p>
                  <p>2. Enter customer name</p>
                  <p>3. Select duration</p>
                  <p>4. Click "Check In"</p>

                  <h3 className="font-medium mt-4">Managing Time</h3>
                  <p>• View remaining time in the customer card</p>
                  <p>• Extend time up to 3 times per session</p>
                  <p>• Automatic notifications when time is running low</p>

                  <h3 className="font-medium mt-4">Checking Out</h3>
                  <p>• Manual checkout with "Check Out" button</p>
                  <p>• Automatic checkout when time expires</p>
                  <p>• View visit history in customer records</p>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-6">
              <section>
                <h2 className="text-lg font-medium text-gray-900">Key Features</h2>
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium text-gray-900">Time Management</h3>
                    <ul className="mt-2 text-sm text-gray-600 list-disc pl-5 space-y-1">
                      <li>Real-time countdown timer</li>
                      <li>Time extension capability</li>
                      <li>Automatic notifications</li>
                      <li>Session history tracking</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium text-gray-900">Customer Management</h3>
                    <ul className="mt-2 text-sm text-gray-600 list-disc pl-5 space-y-1">
                      <li>Quick check-in/out</li>
                      <li>Customer search</li>
                      <li>Visit history</li>
                      <li>Status tracking</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium text-gray-900">Data Management</h3>
                    <ul className="mt-2 text-sm text-gray-600 list-disc pl-5 space-y-1">
                      <li>Data export capability</li>
                      <li>Automatic backups</li>
                      <li>History retention</li>
                      <li>Database monitoring</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium text-gray-900">System Features</h3>
                    <ul className="mt-2 text-sm text-gray-600 list-disc pl-5 space-y-1">
                      <li>Real-time updates</li>
                      <li>Responsive design</li>
                      <li>Error handling</li>
                      <li>Performance optimization</li>
                    </ul>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'troubleshooting' && (
            <div className="space-y-6">
              <section>
                <h2 className="text-lg font-medium text-gray-900">Common Issues</h2>
                <div className="mt-3 space-y-4">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium text-gray-900">Database Connection Issues</h3>
                    <p className="mt-2 text-sm text-gray-600">
                      If you're having trouble connecting to the database:
                    </p>
                    <ul className="mt-2 text-sm text-gray-600 list-disc pl-5 space-y-1">
                      <li>Verify MongoDB is running</li>
                      <li>Check connection string in .env file</li>
                      <li>Ensure network connectivity</li>
                      <li>Verify database user permissions</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium text-gray-900">Timer Synchronization</h3>
                    <p className="mt-2 text-sm text-gray-600">
                      If timers seem out of sync:
                    </p>
                    <ul className="mt-2 text-sm text-gray-600 list-disc pl-5 space-y-1">
                      <li>Refresh the page</li>
                      <li>Check system time settings</li>
                      <li>Clear browser cache</li>
                      <li>Ensure stable internet connection</li>
                    </ul>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 