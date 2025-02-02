'use client';
import { useState, useEffect } from 'react';
import { CustomerRecord, loadCustomerRecords, saveCustomerRecords } from '../utils/customerStorage';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        About Customer Timer
      </h1>
      
      <div className="prose prose-purple max-w-none">
        <p className="text-lg text-gray-600 mb-8">
          Customer Timer is a simple yet powerful application designed to help businesses 
          manage customer sessions efficiently and effectively.
        </p>

        <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
        <ul className="space-y-4 mb-8">
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-3 mt-1">✓</span>
            <div>
              <h3 className="font-medium">Time Management</h3>
              <p className="text-gray-600">Accurate tracking of customer sessions with automatic notifications</p>
            </div>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-3 mt-1">✓</span>
            <div>
              <h3 className="font-medium">Session History</h3>
              <p className="text-gray-600">Complete history of all customer visits and durations</p>
            </div>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-3 mt-1">✓</span>
            <div>
              <h3 className="font-medium">Data Management</h3>
              <p className="text-gray-600">Easy export and import of customer data</p>
            </div>
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mb-4">Technology Stack</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-600 mb-8">
          <li>Next.js 14 for the framework</li>
          <li>React 18 for the UI</li>
          <li>TypeScript for type safety</li>
          <li>Tailwind CSS for styling</li>
          <li>Local Storage for data persistence</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
        <p className="text-gray-600 mb-4">
          To get started with Customer Timer, check out our:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-600">
          <li><a href="/install" className="text-purple-600 hover:text-purple-700">Installation Guide</a></li>
          <li><a href="/setup" className="text-purple-600 hover:text-purple-700">Setup Documentation</a></li>
          <li><a href="/customers" className="text-purple-600 hover:text-purple-700">Customer Management App</a></li>
        </ul>
      </div>
    </div>
  );
} 