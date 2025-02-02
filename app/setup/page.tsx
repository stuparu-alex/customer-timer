'use client';
import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function SetupPage() {
  const [activeTab, setActiveTab] = useState<'manual' | 'script'>('manual');

  const setupScript = `#!/bin/bash
# Customer Timer App Setup Script

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Git is installed
if ! command -v git &> /dev/null; then
    echo "Git is not installed. Please install Git first."
    exit 1
fi

# Clone the repository
git clone https://github.com/yourusername/customer-timer.git
cd customer-timer

# Install dependencies
npm install

# Create environment file
cat > .env.local << EOL
NEXT_PUBLIC_APP_NAME="Customer Timer"
NEXT_PUBLIC_VERSION="1.0.0"
EOL

# Build the application
npm run build

# Start the application
npm start

echo "Setup complete! Application is running at http://localhost:3000"`;

  const manualSteps = [
    {
      title: "Prerequisites",
      steps: [
        "Node.js 18 or higher installed",
        "Git installed",
        "npm or yarn package manager",
        "A code editor (VS Code recommended)"
      ]
    },
    {
      title: "Installation Steps",
      steps: [
        "Clone the repository: git clone https://github.com/yourusername/customer-timer.git",
        "Navigate to project directory: cd customer-timer",
        "Install dependencies: npm install",
        "Create .env.local file with required environment variables",
        "Run development server: npm run dev",
        "Or build for production: npm run build && npm start"
      ]
    },
    {
      title: "Required Dependencies",
      content: `{
  "dependencies": {
    "@types/node": "20.11.5",
    "@types/react": "18.2.48",
    "@types/react-dom": "18.2.18",
    "autoprefixer": "10.4.17",
    "next": "14.1.0",
    "postcss": "8.4.33",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "tailwindcss": "3.4.1",
    "typescript": "5.3.3"
  }
}`
    },
    {
      title: "Environment Variables",
      content: `NEXT_PUBLIC_APP_NAME="Customer Timer"
NEXT_PUBLIC_VERSION="1.0.0"`
    },
    {
      title: "Development Commands",
      steps: [
        "npm run dev - Start development server",
        "npm run build - Build for production",
        "npm start - Start production server",
        "npm run lint - Run linting",
        "npm run test - Run tests (if configured)"
      ]
    },
    {
      title: "Backup and Restore",
      steps: [
        "Regular backups: Use the Export Backup button in the app",
        "Restore data: Use the Import Backup button to restore from .json backup",
        "Backup files are stored in JSON format with timestamp",
        "Keep backups in a secure location"
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Installation Guide
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Follow these steps to set up the Customer Timer application
        </p>
      </div>

      <div className="mb-6">
        <div className="sm:hidden">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as 'manual' | 'script')}
            className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          >
            <option value="manual">Manual Setup</option>
            <option value="script">Setup Script</option>
          </select>
        </div>

        <div className="hidden sm:block">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {['manual', 'script'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as 'manual' | 'script')}
                  className={`
                    ${activeTab === tab
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }
                    whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
                  `}
                >
                  {tab === 'manual' ? 'Manual Setup' : 'Setup Script'}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {activeTab === 'manual' ? (
        <div className="space-y-8">
          {manualSteps.map((section, index) => (
            <div key={index} className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {section.title}
              </h2>
              {section.steps ? (
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  {section.steps.map((step, stepIndex) => (
                    <li key={stepIndex}>{step}</li>
                  ))}
                </ul>
              ) : section.content ? (
                <SyntaxHighlighter
                  language={section.title.toLowerCase().includes('variables') ? 'bash' : 'json'}
                  style={tomorrow}
                  className="rounded-md"
                >
                  {section.content}
                </SyntaxHighlighter>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Automated Setup Script
            </h2>
            <button
              onClick={() => {
                navigator.clipboard.writeText(setupScript);
                alert('Script copied to clipboard!');
              }}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Copy Script
            </button>
          </div>
          <SyntaxHighlighter
            language="bash"
            style={tomorrow}
            className="rounded-md"
          >
            {setupScript}
          </SyntaxHighlighter>
          <p className="mt-4 text-sm text-gray-500">
            Save this script as setup.sh and run it using: bash setup.sh
          </p>
        </div>
      )}
    </div>
  );
} 