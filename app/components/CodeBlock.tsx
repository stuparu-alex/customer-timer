'use client';
import { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export default function CodeBlock({ code, language = 'bash' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className="absolute right-2 top-2 z-10">
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 text-xs font-medium text-gray-200 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="relative">
        <div className="absolute top-0 right-0 px-2 py-1 text-xs text-gray-400 bg-gray-800 rounded-bl">
          {language}
        </div>
        <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto font-mono text-sm leading-relaxed">
          {code.split('\n').map((line, i) => (
            <div key={i} className="whitespace-pre">
              {line}
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
} 