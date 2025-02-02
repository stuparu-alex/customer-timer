'use client';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Customer Timer App
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          A simple, efficient way to manage customer time slots and track sessions
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/customers"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Launch App
          </Link>
          <Link
            href="/install"
            className="px-6 py-3 bg-white text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
          >
            Installation Guide
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {[
          {
            title: 'Time Management',
            description: 'Track customer sessions with automatic timers and notifications',
            icon: '⏱️'
          },
          {
            title: 'Session History',
            description: 'Keep detailed records of all customer visits and durations',
            icon: '📊'
          },
          {
            title: 'Data Backup',
            description: 'Export and import your data for safe keeping',
            icon: '💾'
          }
        ].map((feature, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-3xl mb-4">{feature.icon}</div>
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Quick Start Steps */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold mb-6">Quick Start Guide</h2>
        <div className="space-y-4">
          {[
            {
              step: 1,
              title: 'Installation',
              description: 'Follow our step-by-step installation guide',
              link: '/install'
            },
            {
              step: 2,
              title: 'Start Managing',
              description: 'Begin managing customer sessions',
              link: '/customers'
            }
          ].map((step, index) => (
            <Link 
              key={index}
              href={step.link}
              className="block p-4 border border-gray-200 rounded-lg hover:border-purple-500 transition-colors"
            >
              <div className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-semibold">
                  {step.step}
                </span>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
