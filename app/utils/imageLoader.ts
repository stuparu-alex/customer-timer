import { imageCache } from './imageCache';

interface LoadImageOptions {
  url: string;
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
}

export async function loadImage({
  url,
  maxRetries = 3,
  retryDelay = 1000,
  timeout = 10000
}: LoadImageOptions): Promise<HTMLImageElement> {
  let attempts = 0;

  const load = async (): Promise<HTMLImageElement> => {
    try {
      // Try to get from cache first
      const cached = await imageCache.get(url);
      if (cached) {
        const objectUrl = URL.createObjectURL(cached);
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const image = document.createElement('img');
          image.onload = () => resolve(image);
          image.onerror = reject;
          image.src = objectUrl;
          image.crossOrigin = 'anonymous';

          // Add timeout
          const timeoutId = setTimeout(() => {
            reject(new Error('Image load timeout'));
          }, timeout);

          image.onload = () => {
            clearTimeout(timeoutId);
            resolve(image);
          };
        });
        URL.revokeObjectURL(objectUrl);
        return img;
      }

      // Fetch and cache if not found
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch image');
      
      const blob = await response.blob();
      imageCache.set(url, blob);
      
      const objectUrl = URL.createObjectURL(blob);
      const img = document.createElement('img');
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = objectUrl;
        img.crossOrigin = 'anonymous';
      });
      URL.revokeObjectURL(objectUrl);
      
      return img;
    } catch (error) {
      attempts++;
      if (attempts >= maxRetries) throw error;
      
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempts));
      return load();
    }
  };

  return load();
} 