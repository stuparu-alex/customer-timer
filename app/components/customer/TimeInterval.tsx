'use client';
import { useEffect, useState } from 'react';
import { TIME_OPTIONS } from '@/app/types/customer';

interface TimeIntervalProps {
  startTime: number;
  endTime: number;
  duration: number;
  onExtend: () => void;
  onFinish: () => void;
  isNearingEnd: boolean;
  hasExtended: boolean;
}

export default function TimeInterval({ 
  startTime, 
  endTime,
  duration,
  onExtend, 
  onFinish,
  isNearingEnd,
  hasExtended 
}: TimeIntervalProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const total = endTime - startTime;
      const elapsed = now - startTime;
      const remaining = endTime - now;

      // Calculate progress percentage
      const newProgress = Math.max(0, Math.min(100, ((total - elapsed) / total) * 100));
      setProgress(newProgress);

      if (remaining <= 0) {
        setTimeLeft("Time's up");
        onFinish(); // Automatically check out when time is up
        return;
      }

      // Format remaining time
      const minutes = Math.floor(remaining / 1000 / 60);
      const seconds = Math.floor((remaining / 1000) % 60);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    const timer = setInterval(updateTimer, 1000);
    updateTimer(); // Initial call

    return () => clearInterval(timer);
  }, [startTime, endTime, onFinish]);

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            Session duration: {duration} minutes
          </span>
          {hasExtended && (
            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
              Extended
            </span>
          )}
        </div>
        <span className="text-sm font-medium text-gray-700 min-w-[60px]">
          {timeLeft}
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-1000 ${
              progress > 30 
                ? 'bg-green-500' 
                : progress > 10 
                  ? 'bg-yellow-500' 
                  : 'bg-red-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      {isNearingEnd && (
        <div className="flex space-x-2">
          <button
            onClick={onExtend}
            disabled={hasExtended}
            className="flex-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {hasExtended ? 'Already Extended' : 'Extend Time (+30min)'}
          </button>
          <button
            onClick={onFinish}
            className="flex-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors"
          >
            Finish Now
          </button>
        </div>
      )}
    </div>
  );
} 