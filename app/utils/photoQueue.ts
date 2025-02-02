type QueueItem = {
  file: File;
  customerId: string;
  onProgress: (progress: number) => void;
  onComplete: (url: string) => void;
  onError: (error: string) => void;
  retryCount?: number;
  maxRetries?: number;
};

export interface QueueStatus {
  id: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  error?: string;
  retryCount: number;
  speed: number;
  paused: boolean;
  size: number;
  startTime?: number;
}

class PhotoQueue {
  private queue: QueueItem[] = [];
  private processing = false;
  private statusMap = new Map<string, QueueStatus>();
  private speeds = new Map<string, number>();
  private startTimes = new Map<string, number>();
  private pausedItems = new Set<string>();

  getStatus(): QueueStatus[] {
    return Array.from(this.statusMap.values());
  }

  add(item: QueueItem) {
    const id = `${item.customerId}-${Date.now()}`;
    this.statusMap.set(id, {
      id,
      fileName: item.file.name,
      progress: 0,
      status: 'pending',
      retryCount: 0,
      speed: 0,
      paused: false,
      size: item.file.size
    });

    this.queue.push({
      ...item,
      retryCount: 0,
      maxRetries: 3,
      onProgress: (progress) => {
        this.updateStatus(id, { progress, status: 'uploading' });
        item.onProgress(progress);
      },
      onComplete: (url) => {
        this.updateStatus(id, { progress: 100, status: 'completed' });
        item.onComplete(url);
      },
      onError: (error) => {
        this.updateStatus(id, { status: 'failed', error });
        item.onError(error);
      }
    });

    this.process();
  }

  private updateStatus(id: string, update: Partial<QueueStatus>) {
    const current = this.statusMap.get(id);
    if (current) {
      this.statusMap.set(id, { ...current, ...update });
    }
  }

  private async process() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    const item = this.queue[0];
    const id = `${item.customerId}-${Date.now()}`;

    if (this.pausedItems.has(id)) {
      this.processing = false;
      return;
    }

    try {
      const formData = new FormData();
      formData.append('photo', item.file);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `/api/customers/${item.customerId}/photo`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          this.updateSpeed(id, event.loaded, event.total);
          item.onProgress(Math.round(progress));
        }
      };

      xhr.onload = async () => {
        try {
          const response = await this.parseResponse(xhr);
          if (xhr.status >= 200 && xhr.status < 300 && response.photoUrl) {
            item.onComplete(response.photoUrl);
          } else {
            const errorMessage = response.error || 'Upload failed';
            item.onError(errorMessage);
          }
        } catch (error) {
          item.onError('Failed to process server response');
        }
      };

      xhr.onerror = () => {
        item.onError('Network error occurred');
      };

      xhr.ontimeout = () => {
        item.onError('Request timed out');
      };

      xhr.send(formData);
    } catch (error) {
      item.onError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      this.queue.shift();
      this.processing = false;
      this.process();
    }
  }

  private parseResponse(xhr: XMLHttpRequest): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const response = JSON.parse(xhr.responseText);
        resolve(response);
      } catch (error) {
        reject(new Error('Invalid server response'));
      }
    });
  }

  clear() {
    this.queue = [];
  }

  getQueueLength() {
    return this.queue.length;
  }

  retry(id: string) {
    const status = this.statusMap.get(id);
    const queueItem = this.queue.find(item => 
      `${item.customerId}-${Date.now()}` === id
    );

    if (status && queueItem && status.status === 'failed') {
      if (queueItem.retryCount! < queueItem.maxRetries!) {
        queueItem.retryCount!++;
        this.updateStatus(id, { 
          status: 'pending', 
          retryCount: queueItem.retryCount!,
          error: undefined 
        });
        this.process();
      }
    }
  }

  remove(id: string) {
    this.statusMap.delete(id);
    this.queue = this.queue.filter(item => 
      `${item.customerId}-${Date.now()}` !== id
    );
  }

  pauseAll() {
    this.queue.forEach(item => {
      const id = `${item.customerId}-${Date.now()}`;
      this.pausedItems.add(id);
      this.updateStatus(id, { paused: true });
    });
  }

  resumeAll() {
    this.pausedItems.clear();
    this.queue.forEach(item => {
      const id = `${item.customerId}-${Date.now()}`;
      this.updateStatus(id, { paused: false });
    });
    this.process();
  }

  cancelAll() {
    this.queue = [];
    this.statusMap.clear();
    this.speeds.clear();
    this.startTimes.clear();
    this.pausedItems.clear();
  }

  togglePause(id: string) {
    if (this.pausedItems.has(id)) {
      this.pausedItems.delete(id);
      this.updateStatus(id, { paused: false });
      this.process();
    } else {
      this.pausedItems.add(id);
      this.updateStatus(id, { paused: true });
    }
  }

  getAverageSpeed(): number {
    const speeds = Array.from(this.speeds.values());
    if (speeds.length === 0) return 0;
    return speeds.reduce((a, b) => a + b, 0) / speeds.length;
  }

  getTotalSize(): number {
    return Array.from(this.statusMap.values())
      .reduce((total, status) => total + (status.size || 0), 0);
  }

  private updateSpeed(id: string, loaded: number, total: number) {
    const startTime = this.startTimes.get(id) || Date.now();
    const elapsed = (Date.now() - startTime) / 1000; // seconds
    const speed = loaded / elapsed; // bytes per second
    this.speeds.set(id, speed);
    this.updateStatus(id, { speed });
  }
}

export const photoQueue = new PhotoQueue(); 