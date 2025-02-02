'use client';
import { useState, useEffect } from 'react';
import { photoQueue, QueueStatus } from '@/app/utils/photoQueue';

interface UploadStats {
  totalUploaded: number;
  totalFailed: number;
  averageSpeed: number;
  totalSize: number;
}

export default function UploadDashboard() {
  const [uploads, setUploads] = useState<QueueStatus[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState<UploadStats>({
    totalUploaded: 0,
    totalFailed: 0,
    averageSpeed: 0,
    totalSize: 0
  });
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const status = photoQueue.getStatus();
      setUploads(status);
      
      // Update stats
      const completed = status.filter(s => s.status === 'completed');
      const failed = status.filter(s => s.status === 'failed');
      
      setStats({
        totalUploaded: completed.length,
        totalFailed: failed.length,
        averageSpeed: photoQueue.getAverageSpeed(),
        totalSize: photoQueue.getTotalSize()
      });

      // Auto-close if all uploads are complete
      if (status.every(s => s.status === 'completed')) {
        setTimeout(() => setIsOpen(false), 2000);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatSpeed = (bytesPerSecond: number) => {
    return `${formatSize(bytesPerSecond)}/s`;
  };

  if (uploads.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex flex-col items-end space-y-2">
        {/* Batch Controls */}
        <div className="flex space-x-2">
          <button
            onClick={() => photoQueue.pauseAll()}
            className="bg-gray-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-gray-600"
          >
            Pause All
          </button>
          <button
            onClick={() => photoQueue.resumeAll()}
            className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600"
          >
            Resume All
          </button>
          <button
            onClick={() => photoQueue.cancelAll()}
            className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600"
          >
            Cancel All
          </button>
        </div>

        {/* Main Upload Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-amber-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-amber-600 transition-colors"
        >
          Uploads ({uploads.filter(u => u.status === 'completed').length}/{uploads.length})
        </button>

        {/* Upload Panel */}
        {isOpen && (
          <div className="absolute bottom-full right-0 mb-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200">
            {/* Stats Toggle */}
            <div className="border-b border-gray-200 p-2 flex justify-between items-center">
              <button
                onClick={() => setShowStats(!showStats)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {showStats ? 'Hide Stats' : 'Show Stats'}
              </button>
              <div className="text-xs text-gray-500">
                {formatSize(stats.totalSize)} total
              </div>
            </div>

            {/* Stats Panel */}
            {showStats && (
              <div className="bg-gray-50 p-4 border-b border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Completed</p>
                    <p className="text-sm font-medium text-gray-900">{stats.totalUploaded}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Failed</p>
                    <p className="text-sm font-medium text-gray-900">{stats.totalFailed}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Average Speed</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatSpeed(stats.averageSpeed)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Success Rate</p>
                    <p className="text-sm font-medium text-gray-900">
                      {uploads.length > 0
                        ? `${Math.round((stats.totalUploaded / uploads.length) * 100)}%`
                        : '0%'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Upload List */}
            <div className="max-h-96 overflow-y-auto p-4 space-y-4">
              {uploads.map((upload) => (
                <div
                  key={upload.id}
                  className="border-b border-gray-100 last:border-0 pb-4 last:pb-0"
                >
                  {/* Existing upload item content */}
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {upload.fileName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {upload.status === 'failed' 
                          ? upload.error 
                          : `${upload.progress}% ${upload.status}`}
                      </p>
                      {upload.speed > 0 && (
                        <p className="text-xs text-gray-400">
                          {formatSpeed(upload.speed)}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {upload.status === 'uploading' && (
                        <button
                          onClick={() => photoQueue.togglePause(upload.id)}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                          {upload.paused ? 'Resume' : 'Pause'}
                        </button>
                      )}
                      {upload.status === 'failed' && (
                        <>
                          <button
                            onClick={() => photoQueue.retry(upload.id)}
                            disabled={upload.retryCount >= 3}
                            className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded hover:bg-amber-200 disabled:opacity-50"
                          >
                            Retry ({3 - upload.retryCount} left)
                          </button>
                          <button
                            onClick={() => photoQueue.remove(upload.id)}
                            className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        upload.status === 'failed'
                          ? 'bg-red-500'
                          : upload.status === 'completed'
                          ? 'bg-green-500'
                          : upload.paused
                          ? 'bg-gray-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 