/**
 * 画像処理最適化ユーティリティ
 * - 画像リサイズとフォーマット変換の最適化
 * - Web WorkerまたはOffscreenCanvasを活用
 * - メモリ効率的な画像処理
 */

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'png' | 'jpeg' | 'webp';
  maintainAspectRatio?: boolean;
  enableSmoothScaling?: boolean;
}

export interface OptimizedImageResult {
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
}

export class ImageOptimizer {
  private static instance: ImageOptimizer | null = null;
  private canvas: HTMLCanvasElement | OffscreenCanvas | null = null;
  private ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null = null;
  private supportsOffscreenCanvas: boolean = false;

  private constructor() {
    this.initializeCanvas();
  }

  static getInstance(): ImageOptimizer {
    if (!ImageOptimizer.instance) {
      ImageOptimizer.instance = new ImageOptimizer();
    }
    return ImageOptimizer.instance;
  }

  /**
   * Canvas初期化
   */
  private initializeCanvas(): void {
    try {
      // OffscreenCanvasのサポート確認
      if (typeof OffscreenCanvas !== 'undefined') {
        this.canvas = new OffscreenCanvas(1024, 1024);
        this.ctx = this.canvas.getContext('2d');
        this.supportsOffscreenCanvas = true;
      } else {
        // フォールバック: 通常のCanvas
        this.canvas = document.createElement('canvas');
        this.canvas.width = 1024;
        this.canvas.height = 1024;
        this.ctx = this.canvas.getContext('2d');
      }
    } catch (error) {
      console.error('Canvas initialization failed:', error);
    }
  }

  /**
   * 画像の最適化処理
   */
  async optimizeImage(
    imageSource: HTMLImageElement | ImageBitmap | Blob | string,
    options: ImageOptimizationOptions = {}
  ): Promise<OptimizedImageResult> {
    const {
      maxWidth = 1024,
      maxHeight = 1024,
      quality = 0.8,
      format = 'png',
      maintainAspectRatio = true,
      enableSmoothScaling = true
    } = options;

    try {
      // 画像の読み込み
      const image = await this.loadImage(imageSource);
      const originalSize = await this.getImageSize(imageSource);
      
      // サイズ計算
      const dimensions = this.calculateOptimalDimensions(
        image.width, 
        image.height, 
        maxWidth, 
        maxHeight, 
        maintainAspectRatio
      );

      // Canvas設定
      if (!this.canvas || !this.ctx) {
        throw new Error('Canvas not initialized');
      }

      this.canvas.width = dimensions.width;
      this.canvas.height = dimensions.height;

      // 高品質描画設定
      if (enableSmoothScaling) {
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
      }

      // 画像描画
      this.ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      this.ctx.drawImage(image, 0, 0, dimensions.width, dimensions.height);

      // 最適化された画像の生成
      const result = await this.createOptimizedResult(
        format,
        quality,
        dimensions.width,
        dimensions.height,
        originalSize
      );

      return result;

    } catch (error) {
      throw new Error(`画像最適化エラー: ${error.message}`);
    }
  }

  /**
   * 画像の読み込み
   */
  private async loadImage(source: HTMLImageElement | ImageBitmap | Blob | string): Promise<HTMLImageElement | ImageBitmap> {
    if (source instanceof HTMLImageElement) {
      await this.waitForImageLoad(source);
      return source;
    }

    if (source instanceof ImageBitmap) {
      return source;
    }

    if (source instanceof Blob) {
      const imageBitmap = await createImageBitmap(source);
      return imageBitmap;
    }

    if (typeof source === 'string') {
      // Data URLまたはURL
      const image = new Image();
      image.crossOrigin = 'anonymous';
      
      return new Promise((resolve, reject) => {
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Image load failed'));
        image.src = source;
      });
    }

    throw new Error('Unsupported image source type');
  }

  /**
   * 画像読み込み完了待機
   */
  private waitForImageLoad(image: HTMLImageElement): Promise<void> {
    return new Promise((resolve, reject) => {
      if (image.complete) {
        resolve();
      } else {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('Image load failed'));
      }
    });
  }

  /**
   * 画像サイズ取得
   */
  private async getImageSize(source: any): Promise<number> {
    if (source instanceof Blob) {
      return source.size;
    }
    
    if (typeof source === 'string' && source.startsWith('data:')) {
      // Data URLのサイズ概算
      const base64 = source.split(',')[1];
      return Math.round((base64.length * 3) / 4);
    }
    
    return 0; // 不明な場合
  }

  /**
   * 最適なサイズの計算
   */
  private calculateOptimalDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number,
    maintainAspectRatio: boolean
  ): { width: number; height: number } {
    if (!maintainAspectRatio) {
      return {
        width: Math.min(originalWidth, maxWidth),
        height: Math.min(originalHeight, maxHeight)
      };
    }

    const aspectRatio = originalWidth / originalHeight;
    
    let newWidth = originalWidth;
    let newHeight = originalHeight;

    if (originalWidth > maxWidth) {
      newWidth = maxWidth;
      newHeight = newWidth / aspectRatio;
    }

    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = newHeight * aspectRatio;
    }

    return {
      width: Math.round(newWidth),
      height: Math.round(newHeight)
    };
  }

  /**
   * 最適化結果の作成
   */
  private async createOptimizedResult(
    format: string,
    quality: number,
    width: number,
    height: number,
    originalSize: number
  ): Promise<OptimizedImageResult> {
    if (!this.canvas) {
      throw new Error('Canvas not available');
    }

    let blob: Blob;
    let mimeType: string;

    if (this.supportsOffscreenCanvas && this.canvas instanceof OffscreenCanvas) {
      // OffscreenCanvasの場合
      switch (format) {
        case 'jpeg':
          mimeType = 'image/jpeg';
          blob = await this.canvas.convertToBlob({ type: mimeType, quality });
          break;
        case 'webp':
          mimeType = 'image/webp';
          blob = await this.canvas.convertToBlob({ type: mimeType, quality });
          break;
        default:
          mimeType = 'image/png';
          blob = await this.canvas.convertToBlob({ type: mimeType });
      }
    } else {
      // 通常のCanvasの場合
      const canvas = this.canvas as HTMLCanvasElement;
      
      return new Promise((resolve, reject) => {
        const callback = (blob: Blob | null) => {
          if (!blob) {
            reject(new Error('Blob creation failed'));
            return;
          }

          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result as string;
            const compressionRatio = originalSize > 0 ? (originalSize - blob.size) / originalSize : 0;

            resolve({
              dataUrl,
              blob,
              width,
              height,
              originalSize,
              optimizedSize: blob.size,
              compressionRatio
            });
          };
          reader.onerror = () => reject(new Error('DataURL creation failed'));
          reader.readAsDataURL(blob);
        };

        switch (format) {
          case 'jpeg':
            mimeType = 'image/jpeg';
            canvas.toBlob(callback, mimeType, quality);
            break;
          case 'webp':
            mimeType = 'image/webp';
            canvas.toBlob(callback, mimeType, quality);
            break;
          default:
            mimeType = 'image/png';
            canvas.toBlob(callback, mimeType);
        }
      });
    }

    // OffscreenCanvasの場合のDataURL生成
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('DataURL creation failed'));
      reader.readAsDataURL(blob);
    });

    const compressionRatio = originalSize > 0 ? (originalSize - blob.size) / originalSize : 0;

    return {
      dataUrl,
      blob,
      width,
      height,
      originalSize,
      optimizedSize: blob.size,
      compressionRatio
    };
  }

  /**
   * 複数画像の一括最適化
   */
  async optimizeBatch(
    images: Array<{ source: any; options?: ImageOptimizationOptions }>,
    onProgress?: (completed: number, total: number) => void
  ): Promise<OptimizedImageResult[]> {
    const results: OptimizedImageResult[] = [];
    
    for (let i = 0; i < images.length; i++) {
      const { source, options } = images[i];
      
      try {
        const result = await this.optimizeImage(source, options);
        results.push(result);
      } catch (error) {
        console.error(`Batch optimization failed for image ${i}:`, error);
        // エラーの場合もプレースホルダーを追加
        results.push({
          dataUrl: '',
          blob: new Blob(),
          width: 0,
          height: 0,
          originalSize: 0,
          optimizedSize: 0,
          compressionRatio: 0
        });
      }
      
      if (onProgress) {
        onProgress(i + 1, images.length);
      }
    }
    
    return results;
  }

  /**
   * Canvas品質設定
   */
  setCanvasQuality(quality: 'low' | 'medium' | 'high'): void {
    if (!this.ctx) return;

    switch (quality) {
      case 'low':
        this.ctx.imageSmoothingEnabled = false;
        break;
      case 'medium':
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'medium';
        break;
      case 'high':
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        break;
    }
  }

  /**
   * リソースクリーンアップ
   */
  cleanup(): void {
    if (this.canvas && !this.supportsOffscreenCanvas) {
      const canvas = this.canvas as HTMLCanvasElement;
      canvas.width = 1;
      canvas.height = 1;
    }
    this.ctx = null;
  }
}

// グローバルインスタンス
export const imageOptimizer = ImageOptimizer.getInstance();