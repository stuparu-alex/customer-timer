'use client';
import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import EasyCrop from 'react-easy-crop';
import ImageGallery from 'react-image-gallery';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ImageFilter } from 'react-image-filter';
import 'react-image-gallery/styles/css/image-gallery.css';
import { photoQueue } from '@/app/utils/photoQueue';
import { loadImage } from '@/app/utils/imageLoader';
import PhotoFallback from './PhotoFallback';
import { imageProcessor } from '@/app/utils/imageProcessor';
import { errorReporter } from '@/app/utils/errorReporter';

interface PhotoUploadProps {
  customerId: string;
  currentPhoto: string | null;
  onPhotoUpdate: (photoUrl: string) => void;
  onError: (message: string) => void;
  maxPhotos?: number;
  optimizationOptions?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  };
}

type Filter = 'none' | 'grayscale' | 'sepia' | 'blur' | 'brightness' | 'contrast';

export default function PhotoUpload({ 
  customerId, 
  currentPhoto, 
  onPhotoUpdate,
  onError,
  maxPhotos = 1,
  optimizationOptions = {
    maxWidth: 800,
    maxHeight: 800,
    quality: 0.8
  }
}: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<Filter>('none');
  const [photos, setPhotos] = useState<string[]>(currentPhoto ? [currentPhoto] : []);
  const imageRef = useRef<HTMLImageElement>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const filters: { name: Filter; matrix: number[] }[] = [
    { name: 'none', matrix: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0] },
    { name: 'grayscale', matrix: [0.33, 0.33, 0.33, 0, 0, 0.33, 0.33, 0.33, 0, 0, 0.33, 0.33, 0.33, 0, 0, 0, 0, 0, 1, 0] },
    { name: 'sepia', matrix: [0.393, 0.769, 0.189, 0, 0, 0.349, 0.686, 0.168, 0, 0, 0.272, 0.534, 0.131, 0, 0, 0, 0, 0, 1, 0] },
    { name: 'brightness', matrix: [1.5, 0, 0, 0, 0, 0, 1.5, 0, 0, 0, 0, 0, 1.5, 0, 0, 0, 0, 0, 1, 0] },
    { name: 'contrast', matrix: [2, 0, 0, 0, -0.5, 0, 2, 0, 0, -0.5, 0, 0, 2, 0, -0.5, 0, 0, 0, 1, 0] },
  ];

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const processImage = async (file: File): Promise<Blob> => {
    try {
      return await imageProcessor.processImage(file, {
        maxWidth: optimizationOptions.maxWidth,
        maxHeight: optimizationOptions.maxHeight,
        quality: optimizationOptions.quality,
        progressive: true,
        format: file.type.includes('png') ? 'png' : 'jpeg',
        compressionLevel: 9
      });
    } catch (error) {
      errorReporter.report(error as Error, {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });
      throw error;
    }
  };

  const createImage = async (url: string): Promise<HTMLImageElement> => {
    try {
      return await loadImage({
        url,
        maxRetries: 3,
        retryDelay: 1000,
        timeout: 10000
      });
    } catch (error) {
      throw new Error('Failed to load image for editing');
    }
  };

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: any,
    rotation = 0,
    flip = { horizontal: false, vertical: false }
  ) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    // Set canvas size to match the cropped image size
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Draw rotated image
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Draw the cropped image
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    // Apply selected filter
    if (selectedFilter !== 'none') {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const filter = filters.find(f => f.name === selectedFilter);
      if (filter) {
        applyFilter(imageData, filter.matrix);
        ctx.putImageData(imageData, 0, 0);
      }
    }

    ctx.restore();

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        blob => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas is empty'));
          }
        },
        'image/jpeg',
        0.95
      );
    });
  };

  const applyFilter = (imageData: ImageData, matrix: number[]) => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      data[i] = r * matrix[0] + g * matrix[1] + b * matrix[2] + matrix[3] * 255 + matrix[4];
      data[i + 1] = r * matrix[5] + g * matrix[6] + b * matrix[7] + matrix[8] * 255 + matrix[9];
      data[i + 2] = r * matrix[10] + g * matrix[11] + b * matrix[12] + matrix[13] * 255 + matrix[14];
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (photos.length >= maxPhotos) {
      onError(`Maximum ${maxPhotos} photos allowed`);
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    try {
      // Create preview for cropping
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      setShowCropper(true);
    } catch (error) {
      onError('Failed to prepare image');
    }
  }, [maxPhotos, photos.length, onError]);

  const uploadImage = async (blob: Blob) => {
    try {
      setUploading(true);
      setProgress(0);

      await new Promise<string>((resolve, reject) => {
        photoQueue.add({
          file: new File([blob], 'photo.jpg', { type: 'image/jpeg' }),
          customerId,
          onProgress: setProgress,
          onComplete: (url) => {
            onPhotoUpdate(url);
            setPhotos(prev => [...prev, url]);
            resolve(url);
          },
          onError: (error) => {
            errorReporter.report(new Error(error), {
              customerId,
              blobSize: blob.size
            });
            reject(new Error(error));
          }
        });
      });

      setUploading(false);
      setProgress(100);
      setShowCropper(false);
      setPreview(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload photo';
      errorReporter.report(error as Error, {
        customerId,
        action: 'upload'
      });
      setUploading(false);
      setProgress(0);
      setShowCropper(false);
      setPreview(null);
      onError(errorMessage);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: 5242880, // 5MB
    multiple: maxPhotos > 1
  });

  const handleDelete = async (photoUrl: string) => {
    try {
      const response = await fetch(`/api/customers/${customerId}/photo`, {
        method: 'DELETE',
        body: JSON.stringify({ photoUrl })
      });

      if (!response.ok) throw new Error('Failed to delete photo');
      setPhotos(prev => prev.filter(p => p !== photoUrl));
      onPhotoUpdate('');
    } catch (error) {
      onError('Failed to delete photo');
    }
  };

  return (
    <div className="relative group">
      {/* Photo Grid with Carousel */}
      <div className="grid grid-cols-1 gap-2">
        {photos.length > 0 ? (
          <div onClick={() => setShowGallery(true)} className="cursor-pointer relative">
            <div className="h-10 w-10 rounded-full overflow-hidden">
              {loadError ? (
                <PhotoFallback
                  name={photos[0].split('/').pop() || ''}
                  onRetry={() => {
                    setLoadError(null);
                    // Trigger reload
                    const newPhotos = [...photos];
                    setPhotos([]);
                    setTimeout(() => setPhotos(newPhotos), 100);
                  }}
                />
              ) : (
                <Image
                  src={photos[0]}
                  alt="Customer photo"
                  width={40}
                  height={40}
                  className="object-cover"
                  unoptimized
                  onError={() => setLoadError('Failed to load image')}
                  loading="eager"
                  priority
                />
              )}
            </div>
            {photos.length > 1 && (
              <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                +{photos.length - 1}
              </span>
            )}
          </div>
        ) : (
          <div {...getRootProps()} className="cursor-pointer">
            <input {...getInputProps()} />
            <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
              isDragActive ? 'bg-amber-100' : 'bg-gray-100'
            }`}>
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Image Cropper Modal */}
      {showCropper && preview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="relative h-[60vh]">
              <EasyCrop
                image={preview}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                rotation={rotation}
              />
            </div>
            
            {/* Controls */}
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-x-4">
                  <label className="text-sm text-gray-600">Zoom</label>
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-32"
                  />
                </div>
                <div className="space-x-4">
                  <label className="text-sm text-gray-600">Rotate</label>
                  <input
                    type="range"
                    value={rotation}
                    min={0}
                    max={360}
                    step={1}
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="w-32"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-4">
                <label className="text-sm text-gray-600">Filters:</label>
                <div className="flex space-x-2">
                  {filters.map(filter => (
                    <button
                      key={filter.name}
                      onClick={() => setSelectedFilter(filter.name)}
                      className={`px-3 py-1 rounded ${
                        selectedFilter === filter.name
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {filter.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowCropper(false);
                    setPreview(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (croppedAreaPixels) {
                      const croppedImage = await getCroppedImg(
                        preview,
                        croppedAreaPixels,
                        rotation
                      );
                      if (croppedImage) {
                        await uploadImage(croppedImage);
                      }
                    }
                  }}
                  className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600"
                >
                  Save & Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50">
          <button
            onClick={() => setShowGallery(false)}
            className="absolute top-4 right-4 text-white text-xl z-10"
          >
            ×
          </button>
          <ImageGallery
            items={photos.map(photo => ({
              original: photo,
              thumbnail: photo
            }))}
            showPlayButton={false}
            showFullscreenButton={true}
            showNav={true}
            showThumbnails={true}
            thumbnailPosition="bottom"
          />
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full rounded-full bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-xs text-white font-medium">
              {progress}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 