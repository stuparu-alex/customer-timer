'use client';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from '../ErrorBoundary';

const PhotoUpload = dynamic(() => import('./PhotoUpload'), {
  loading: () => (
    <div className="h-10 w-10 rounded-full bg-gray-100 animate-pulse" />
  ),
  ssr: false
});

interface PhotoUploadWrapperProps {
  customerId: string;
  currentPhoto: string | null;
  onPhotoUpdate: (photoUrl: string) => void;
  onError: (message: string) => void;
}

export default function PhotoUploadWrapper(props: PhotoUploadWrapperProps) {
  return (
    <ErrorBoundary
      fallback={
        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
          <span className="text-lg font-medium text-gray-600">
            {props.currentPhoto ? '!' : '+'}
          </span>
        </div>
      }
    >
      <PhotoUpload {...props} />
    </ErrorBoundary>
  );
} 