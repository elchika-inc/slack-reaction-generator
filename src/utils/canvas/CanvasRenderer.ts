import { CANVAS_CONFIG } from '../../constants/canvasConstants';
import { renderText } from '../textRenderer';
import { getOrLoadImage } from '../imageCache';
import { applyTextAnimation, applyImageAnimation } from '../animationHelpers';
import { FlatSettings } from '../../types/settings';

export class CanvasRenderer {
  /**
   * 単一フレームを描画する（アニメーション用）
   */
  static async drawFrame(
    ctx: CanvasRenderingContext2D, 
    settings: FlatSettings, 
    frame: number, 
    totalFrames: number
  ): Promise<void> {
    const canvasSize = settings.canvasSize || CANVAS_CONFIG.SIZE;
    
    // 背景色描画
    if (settings.backgroundType === 'solid' && settings.backgroundColor) {
      ctx.fillStyle = settings.backgroundColor;
      ctx.fillRect(0, 0, canvasSize, canvasSize);
    }
    
    // 背景画像描画
    if (settings.imageData && settings.imagePosition === 'back') {
      await this.drawAnimatedImage(ctx, settings, frame, totalFrames);
    }
    
    // アニメーションテキスト描画
    if (settings.text) {
      await this.drawAnimatedText(ctx, settings, frame, totalFrames);
    }
    
    // 前景画像描画
    if (settings.imageData && settings.imagePosition === 'front') {
      await this.drawAnimatedImage(ctx, settings, frame, totalFrames);
    }
  }
  
  /**
   * 静的テキストを描画する
   */
  static async drawStaticText(ctx: CanvasRenderingContext2D, settings: FlatSettings): Promise<void> {
    if (!settings.text) return;
    return renderText(ctx, settings);
  }
  
  /**
   * アニメーションテキストを描画する
   */
  private static async drawAnimatedText(
    ctx: CanvasRenderingContext2D, 
    settings: FlatSettings, 
    frame: number, 
    totalFrames: number
  ): Promise<void> {
    if (!settings.text) return;
    
    ctx.save();
    
    // アニメーション変換を適用
    if (settings.animation && settings.animation !== 'none') {
      applyTextAnimation(ctx, settings, frame, totalFrames);
    }
    
    // テキストを描画
    await renderText(ctx, settings);
    
    ctx.restore();
  }
  
  /**
   * アニメーション画像を描画する
   */
  private static async drawAnimatedImage(
    ctx: CanvasRenderingContext2D, 
    settings: FlatSettings, 
    frame: number, 
    totalFrames: number
  ): Promise<void> {
    if (!settings.imageData) return;
    
    try {
      const img = await getOrLoadImage(settings.imageData);
      if (!img) return;
      
      ctx.save();
      
      // 不透明度を設定
      ctx.globalAlpha = (settings.imageOpacity || 100) / 100;
      
      // アニメーション変換を適用
      if (settings.imageAnimation && settings.imageAnimation !== 'none') {
        applyImageAnimation(ctx, settings, frame, totalFrames);
      }
      
      // 画像を描画
      const canvasSize = settings.canvasSize || CANVAS_CONFIG.SIZE;
      const imageSize = (settings.imageSize / 100) * canvasSize;
      const x = (settings.imageX / 100) * canvasSize - imageSize / 2;
      const y = (settings.imageY / 100) * canvasSize - imageSize / 2;
      
      ctx.drawImage(img, x, y, imageSize, imageSize);
      
      ctx.restore();
    } catch (error) {
      console.warn('Animated image drawing failed:', error);
    }
  }
  
  /**
   * 静的画像を描画する
   */
  static async drawStaticImage(ctx: CanvasRenderingContext2D, settings: FlatSettings): Promise<void> {
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
      console.warn('Static image drawing failed:', error);
    }
  }
}