'use client';

interface PhotoFallbackProps {
  name: string;
  size?: number;
  onRetry?: () => void;
}

export default function PhotoFallback({ name, size = 40, onRetry }: PhotoFallbackProps) {
  return (
    <div 
      className="relative bg-gray-100 rounded-full flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <span className="text-lg font-medium text-gray-600">
        {name.charAt(0).toUpperCase()}
      </span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      )}
    </div>
  );
} 