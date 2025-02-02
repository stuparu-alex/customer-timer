'use client';
import { useState, useEffect } from 'react';

interface TimeIntervalProps {
  startTime: number;
  endTime: number;
  duration: number;
  onExtend: () => void;
  onFinish: () => void;
  isNearingEnd: boolean;
  hasExtended: boolean;
  extensionCount: number;
  lastExtensionTime: number | null;
}

export default function TimeInterval({
  startTime,
  endTime,
  duration,
  onExtend,
  onFinish,
  isNearingEnd,
  hasExtended,
  extensionCount = 0,
  lastExtensionTime
}: TimeIntervalProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = endTime - now;
      
      // Calculate cooldown time if max extensions reached
      if (extensionCount >= 3 && lastExtensionTime) {
        const cooldownEnd = lastExtensionTime + (60 * 60 * 1000); // 1 hour cooldown
        if (now < cooldownEnd) {
          setCooldownTimeLeft(Math.ceil((cooldownEnd - now) / (1000 * 60))); // minutes
        } else {
          setCooldownTimeLeft(null);
        }
      }

      if (remaining <= 0) {
        setTimeLeft('Time expired');
        onFinish();
        clearInterval(timer);
      } else {
        const minutes = Math.floor(remaining / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        
        setTimeLeft(
          hours > 0 
            ? `${hours}h ${remainingMinutes}m remaining`
            : `${remainingMinutes}m remaining`
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onFinish, extensionCount, lastExtensionTime]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-500">Session Duration: {duration} minutes</span>
        <span className={`text-sm font-medium ${
          isNearingEnd ? 'text-red-600' : 'text-gray-900'
        }`}>
          {timeLeft}
        </span>
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={onExtend}
          disabled={extensionCount >= 3 || Boolean(cooldownTimeLeft)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
            ${extensionCount >= 3 || cooldownTimeLeft
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
        >
          {cooldownTimeLeft
            ? `Wait ${cooldownTimeLeft}m to extend`
            : `Extend Time (${3 - extensionCount} remaining)`}
        </button>
        
        {extensionCount > 0 && (
          <div className="text-sm text-gray-500">
            <span>Extended {extensionCount} time{extensionCount !== 1 ? 's' : ''}</span>
            {hasExtended && <span className="ml-2">•</span>}
          </div>
        )}
      </div>

      {isNearingEnd && (
        <p className="text-sm text-red-600 mt-2">
          Session ending soon
        </p>
      )}
    </div>
  );
} 