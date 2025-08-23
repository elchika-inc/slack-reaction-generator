import { CANVAS_CONFIG } from '../../constants/canvasConstants';
import { renderText } from '../textRenderer';
import { getOrLoadImage } from '../imageCache';
import { FlatSettings } from '../../types/settings';

export class StaticIconGenerator {
  /**
   * 静止画のPNGを生成する
   */
  static async generatePNG(settings: FlatSettings, canvas?: HTMLCanvasElement): Promise<string> {
    const canvasSize = settings.canvasSize || CANVAS_CONFIG.SIZE;
    
    if (!canvas) {
      canvas = document.createElement('canvas');
    }
    
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    
    const ctx = canvas.getContext('2d', { 
      alpha: true, 
      willReadFrequently: true,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high'
    });
    
    if (!ctx) {
      throw new Error('Canvas context could not be obtained');
    }
    
    // キャンバスをクリア（透明背景）
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    
    // 背景色描画
    if (settings.backgroundType === 'solid' && settings.backgroundColor) {
      ctx.fillStyle = settings.backgroundColor;
      ctx.fillRect(0, 0, canvasSize, canvasSize);
    }
    
    // 背景画像描画
    if (settings.imageData && settings.imagePosition === 'back') {
      await this.drawImage(ctx, settings);
    }
    
    // テキスト描画
    if (settings.text) {
      await this.drawText(ctx, settings);
    }
    
    // 前景画像描画
    if (settings.imageData && settings.imagePosition === 'front') {
      await this.drawImage(ctx, settings);
    }
    
    return canvas.toDataURL('image/png');
  }
  
  /**
   * テキストを描画する
   */
  private static async drawText(ctx: CanvasRenderingContext2D, settings: FlatSettings): Promise<void> {
    return renderText(ctx, settings);
  }
  
  /**
   * 画像を描画する
   */
  private static async drawImage(ctx: CanvasRenderingContext2D, settings: FlatSettings): Promise<void> {
    if (!settings.imageData) return;
    
    try {
      const img = await getOrLoadImage(settings.imageData);
      if (!img) return;
      
      const canvasSize = settings.canvasSize || CANVAS_CONFIG.SIZE;
      const imageSize = (settings.imageSize / 100) * canvasSize;
      const x = (settings.imageX / 100) * canvasSize - imageSize / 2;
      const y = (settings.imageY / 100) * canvasSize - imageSize / 2;
      
      ctx.save();
      ctx.globalAlpha = (settings.imageOpacity || 100) / 100;
      ctx.drawImage(img, x, y, imageSize, imageSize);
      ctx.restore();
    } catch (error) {
      console.warn('Image drawing failed:', error);
    }
  }
}