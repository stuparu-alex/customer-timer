class ImageCache {
  private cache = new Map<string, {
    blob: Blob;
    timestamp: number;
    attempts: number;
  }>();
  private maxAge = 1000 * 60 * 60; // 1 hour
  private maxAttempts = 3;

  async get(url: string): Promise<Blob | null> {
    const cached = this.cache.get(url);
    if (cached) {
      if (Date.now() - cached.timestamp < this.maxAge) {
        return cached.blob;
      }
      this.cache.delete(url);
    }
    return null;
  }

  set(url: string, blob: Blob) {
    this.cache.set(url, {
      blob,
      timestamp: Date.now(),
      attempts: 0
    });
  }

  incrementAttempts(url: string): boolean {
    const cached = this.cache.get(url);
    if (cached) {
      cached.attempts++;
      if (cached.attempts >= this.maxAttempts) {
        this.cache.delete(url);
        return false;
      }
      return true;
    }
    return true;
  }

  clear() {
    this.cache.clear();
  }
}

export const imageCache = new ImageCache(); 