interface ProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  progressive?: boolean;
  format?: 'jpeg' | 'png' | 'webp';
  compressionLevel?: number;
}

class ImageProcessor {
  private worker: Worker | null = null;

  private initWorker() {
    if (typeof window === 'undefined') return;
    
    const workerCode = `
      self.onmessage = async function(e) {
        const { imageData, options } = e.data;
        try {
          const result = await processImage(imageData, options);
          self.postMessage({ success: true, result });
        } catch (error) {
          self.postMessage({ success: false, error: error.message });
        }
      };

      async function processImage(imageData, options) {
        // Image processing logic here
        return imageData;
      }
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    this.worker = new Worker(URL.createObjectURL(blob));
  }

  async processImage(file: File, options: ProcessingOptions = {}): Promise<Blob> {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      progressive = true,
      format = 'jpeg',
      compressionLevel = 9
    } = options;

    // Generate low-quality preview first
    const preview = await this.generatePreview(file);

    // Process the full image
    const processed = await this.processFullImage(file, {
      maxWidth,
      maxHeight,
      quality,
      progressive,
      format
    });

    return processed;
  }

  private async generatePreview(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Generate tiny preview
          canvas.width = 20;
          canvas.height = (20 * img.height) / img.width;
          
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.1));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  private async processFullImage(file: File, options: ProcessingOptions): Promise<Blob> {
    const { maxWidth, maxHeight, quality, progressive, format } = options;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Calculate dimensions
          let { width, height } = img;
          if (width > maxWidth!) {
            height *= maxWidth! / width;
            width = maxWidth!;
          }
          if (height > maxHeight!) {
            width *= maxHeight! / height;
            height = maxHeight!;
          }

          canvas.width = width;
          canvas.height = height;

          // Apply progressive rendering
          if (progressive) {
            this.renderProgressive(ctx!, img, width, height);
          } else {
            ctx?.drawImage(img, 0, 0, width, height);
          }

          // Convert to desired format
          const mimeType = `image/${format}`;
          canvas.toBlob(
            blob => blob ? resolve(blob) : reject(new Error('Conversion failed')),
            mimeType,
            quality
          );
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  private renderProgressive(ctx: CanvasRenderingContext2D, img: HTMLImageElement, width: number, height: number) {
    const steps = [0.1, 0.3, 0.5, 0.7, 1];
    let currentStep = 0;

    const render = () => {
      const scale = steps[currentStep];
      const w = width * scale;
      const h = height * scale;

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext('2d');

      tempCtx?.drawImage(img, 0, 0, w, h);
      ctx.drawImage(tempCanvas, 0, 0, w, h, 0, 0, width, height);

      if (currentStep < steps.length - 1) {
        currentStep++;
        requestAnimationFrame(render);
      }
    };

    render();
  }
}

export const imageProcessor = new ImageProcessor(); 