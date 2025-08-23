import { CANVAS_CONFIG } from '../../constants/canvasConstants';
import { gifWorkerManager, GifGenerationResult } from '../GifWorkerManager';
import { CanvasRenderer } from './CanvasRenderer';
import { FlatSettings } from '../../types/settings';

export class AnimatedIconGenerator {
  /**
   * アニメーションGIFを生成する
   */
  static async generateGIF(settings: FlatSettings): Promise<string> {
    const hasTextAnimation = settings.animation && settings.animation !== 'none';
    const hasImageAnimation = settings.imageData && settings.imageAnimation && settings.imageAnimation !== 'none';
    
    if (!hasTextAnimation && !hasImageAnimation) {
      throw new Error('No animation settings found');
    }
    
    // Web Workerを使用したGIF生成を試行
    try {
      const result = await this.generateWithWorker(settings);
      return result.url;
    } catch (workerError) {
      console.warn('Worker generation failed, falling back to main thread:', workerError);
      return this.generateWithMainThread(settings);
    }
  }
  
  /**
   * Web Workerを使用してGIFを生成
   */
  private static async generateWithWorker(settings: FlatSettings): Promise<GifGenerationResult> {
    const canvasSize = settings.canvasSize || CANVAS_CONFIG.SIZE;
    const frameCount = settings.gifFrames || 30;
    const delay = Math.max(settings.animationSpeed || 33, 30); // 最小30ms
    
    // フレームデータを生成
    const frames: ImageData[] = [];
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasSize;
    tempCanvas.height = canvasSize;
    
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) {
      throw new Error('Cannot get canvas context');
    }
    
    for (let frame = 0; frame < frameCount; frame++) {
      ctx.clearRect(0, 0, canvasSize, canvasSize);
      await CanvasRenderer.drawFrame(ctx, settings, frame, frameCount);
      frames.push(ctx.getImageData(0, 0, canvasSize, canvasSize));
    }
    
    // Workerにフレームデータを送信してGIF生成
    return gifWorkerManager.generateGIF(frames, delay, settings.gifQuality || 20);
  }
  
  /**
   * メインスレッドでGIFを生成（フォールバック）
   */
  private static async generateWithMainThread(settings: FlatSettings): Promise<string> {
    // gif.jsを動的インポート
    const GIFModule = await import('gif.js');
    const GIF = GIFModule.default;
    
    const canvasSize = settings.canvasSize || CANVAS_CONFIG.SIZE;
    const frameCount = settings.gifFrames || 30;
    const delay = Math.max(settings.animationSpeed || 33, 30);
    
    const gif = new GIF({
      workers: 2,
      quality: settings.gifQuality || 20,
      width: canvasSize,
      height: canvasSize,
      workerScript: '/gif.js'
    });
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasSize;
    tempCanvas.height = canvasSize;
    const ctx = tempCanvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Cannot get canvas context');
    }
    
    // フレームを生成してGIFに追加
    for (let frame = 0; frame < frameCount; frame++) {
      ctx.clearRect(0, 0, canvasSize, canvasSize);
      await CanvasRenderer.drawFrame(ctx, settings, frame, frameCount);
      gif.addFrame(tempCanvas, { delay });
    }
    
    return new Promise((resolve, reject) => {
      gif.on('finished', (blob: Blob) => {
        resolve(URL.createObjectURL(blob));
      });
      
      gif.on('error', (error: Error) => {
        reject(error);
      });
      
      gif.render();
    });
  }
}