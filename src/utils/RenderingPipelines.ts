/**
 * レンダリングパイプラインの定義と管理
 * - 各種レンダリング戦略の実装
 * - パフォーマンス最適化
 * - リソース管理
 */

import { CANVAS_CONFIG } from '../constants/canvasConstants';
import { drawTextIcon, drawAnimationFrame } from './canvasUtils';
import { renderText } from './textRenderer';
import { getOrLoadImage } from './imageCache';
import { handleError, ErrorTypes } from './errorHandler';
import { RenderingPipeline } from './CanvasManager';

/**
 * 基本的な静止画レンダリングパイプライン
 */
export const StaticRenderingPipeline: RenderingPipeline = {
  prepare: async (settings: any) => {
    try {
      // フォントのプリロード
      if (settings.fontFamily && settings.fontFamily !== 'sans-serif') {
        const fontWeight = settings.fontFamily.includes('M PLUS') ? '900' : 'bold';
        await document.fonts.load(`${fontWeight} 16px ${settings.fontFamily}`);
      }

      // 画像のプリロード
      if (settings.imageData) {
        await getOrLoadImage(settings.imageData);
      }
    } catch (error) {
      handleError(ErrorTypes.RESOURCE_LOADING, error);
    }
  },

  render: (ctx: CanvasRenderingContext2D, settings: any) => {
    try {
      const canvasSize = settings.canvasSize || CANVAS_CONFIG.SIZE;
      
      // 背景クリア
      ctx.clearRect(0, 0, canvasSize, canvasSize);
      
      // 静止画描画
      drawTextIcon(ctx, settings);
    } catch (error) {
      handleError(ErrorTypes.RENDERING, error);
    }
  },

  cleanup: () => {
    // 特別なクリーンアップは不要
  }
};

/**
 * アニメーションレンダリングパイプライン
 */
export const AnimationRenderingPipeline: RenderingPipeline = {
  prepare: async (settings: any) => {
    try {
      // フォントプリロード
      if (settings.fontFamily && settings.fontFamily !== 'sans-serif') {
        const fontWeight = settings.fontFamily.includes('M PLUS') ? '900' : 'bold';
        await document.fonts.load(`${fontWeight} 16px ${settings.fontFamily}`);
      }

      // 画像プリロード
      if (settings.imageData) {
        await getOrLoadImage(settings.imageData);
      }
    } catch (error) {
      handleError(ErrorTypes.RESOURCE_LOADING, error);
    }
  },

  render: (ctx: CanvasRenderingContext2D, settings: any, frame: number = 0, totalFrames: number = 30) => {
    try {
      const canvasSize = settings.canvasSize || CANVAS_CONFIG.SIZE;
      
      // 背景塗りつぶし
      ctx.fillStyle = settings.backgroundColor || CANVAS_CONFIG.DEFAULT_BACKGROUND_COLOR;
      ctx.fillRect(0, 0, canvasSize, canvasSize);
      
      // アニメーションフレーム描画
      drawAnimationFrame(ctx, settings, frame, totalFrames);
    } catch (error) {
      handleError(ErrorTypes.RENDERING, error);
    }
  },

  cleanup: () => {
    // アニメーション特有のクリーンアップ
  }
};

/**
 * 高品質レンダリングパイプライン（エクスポート用）
 */
export const HighQualityRenderingPipeline: RenderingPipeline = {
  prepare: async (settings: any) => {
    try {
      // より詳細なフォントロード
      if (settings.fontFamily && settings.fontFamily !== 'sans-serif') {
        const fontFamily = settings.fontFamily;
        const isDecorativeFont = fontFamily.includes('Pacifico') || fontFamily.includes('Caveat');
        
        let fontWeight = 'bold';
        if (fontFamily.includes('M PLUS') || fontFamily.includes('M+')) {
          fontWeight = '900';
        } else if (isDecorativeFont) {
          fontWeight = 'normal';
        }

        // 複数サイズでのプリロード
        const sizes = [12, 16, 20, 24, 32, 48];
        await Promise.all(
          sizes.map(size => document.fonts.load(`${fontWeight} ${size}px ${fontFamily}`))
        );
      }

      // 高解像度画像の準備
      if (settings.imageData) {
        const img = await getOrLoadImage(settings.imageData);
        // 画像の完全読み込み待機
        if (img && !img.complete) {
          await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        }
      }
    } catch (error) {
      handleError(ErrorTypes.RESOURCE_LOADING, error);
    }
  },

  render: (ctx: CanvasRenderingContext2D, settings: any, frame?: number, totalFrames?: number) => {
    try {
      const canvasSize = settings.canvasSize || CANVAS_CONFIG.SIZE;
      
      // 高品質レンダリング設定
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.textRenderingOptimization = 'optimizeQuality';
      
      // 背景処理
      if (settings.backgroundType === 'transparent') {
        ctx.clearRect(0, 0, canvasSize, canvasSize);
      } else {
        ctx.fillStyle = settings.backgroundColor || CANVAS_CONFIG.DEFAULT_BACKGROUND_COLOR;
        ctx.fillRect(0, 0, canvasSize, canvasSize);
      }
      
      // レンダリング実行
      if (frame !== undefined && totalFrames !== undefined) {
        drawAnimationFrame(ctx, settings, frame, totalFrames);
      } else {
        drawTextIcon(ctx, settings);
      }
    } catch (error) {
      handleError(ErrorTypes.RENDERING, error);
    }
  },

  cleanup: () => {
    // 高品質レンダリング後のクリーンアップ
  }
};

/**
 * デバッグ用レンダリングパイプライン
 */
export const DebugRenderingPipeline: RenderingPipeline = {
  prepare: (settings: any) => {
    console.log('Debug Pipeline - Preparing render:', settings);
  },

  render: (ctx: CanvasRenderingContext2D, settings: any, frame?: number, totalFrames?: number) => {
    try {
      const canvasSize = settings.canvasSize || CANVAS_CONFIG.SIZE;
      
      // デバッグ情報を描画
      ctx.save();
      
      // 通常のレンダリング
      if (frame !== undefined && totalFrames !== undefined) {
        AnimationRenderingPipeline.render(ctx, settings, frame, totalFrames);
        
        // フレーム情報をオーバーレイ
        ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
        ctx.font = '12px monospace';
        ctx.fillText(`Frame: ${frame}/${totalFrames}`, 5, 15);
      } else {
        StaticRenderingPipeline.render(ctx, settings);
        
        // 静止画デバッグ情報
        ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
        ctx.font = '12px monospace';
        ctx.fillText('Static Render', 5, 15);
      }

      // Canvas境界線を描画
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, canvasSize - 2, canvasSize - 2);
      
      ctx.restore();
    } catch (error) {
      handleError(ErrorTypes.RENDERING, error);
    }
  },

  cleanup: () => {
    console.log('Debug Pipeline - Cleanup completed');
  }
};

/**
 * パフォーマンス最適化パイプライン
 */
export const OptimizedRenderingPipeline: RenderingPipeline = {
  prepare: async (settings: any) => {
    // 最小限のリソースロードのみ
    if (settings.fontFamily && settings.fontFamily !== 'sans-serif') {
      try {
        await document.fonts.load(`bold 16px ${settings.fontFamily}`);
      } catch {
        // フォントロード失敗時はフォールバック
      }
    }
  },

  render: (ctx: CanvasRenderingContext2D, settings: any, frame?: number, totalFrames?: number) => {
    try {
      // パフォーマンス重視の設定
      ctx.imageSmoothingEnabled = false; // 高速化
      
      const canvasSize = settings.canvasSize || CANVAS_CONFIG.SIZE;
      
      // 簡略化された背景描画
      ctx.fillStyle = settings.backgroundColor || '#FFFFFF';
      ctx.fillRect(0, 0, canvasSize, canvasSize);
      
      // 簡略化されたレンダリング
      if (frame !== undefined && totalFrames !== undefined) {
        // 最小限のアニメーション描画
        const progress = frame / totalFrames;
        renderText(ctx, settings, canvasSize);
      } else {
        // 最小限の静止画描画
        renderText(ctx, settings, canvasSize);
      }
    } catch (error) {
      handleError(ErrorTypes.RENDERING, error);
    }
  },

  cleanup: () => {
    // 最小限のクリーンアップ
  }
};

/**
 * パイプライン登録ヘルパー
 */
export const registerDefaultPipelines = (canvasManager: any) => {
  canvasManager.registerPipeline('static', StaticRenderingPipeline);
  canvasManager.registerPipeline('animation', AnimationRenderingPipeline);
  canvasManager.registerPipeline('high-quality', HighQualityRenderingPipeline);
  canvasManager.registerPipeline('debug', DebugRenderingPipeline);
  canvasManager.registerPipeline('optimized', OptimizedRenderingPipeline);
};

/**
 * パイプライン選択ヘルパー
 */
export const selectOptimalPipeline = (settings: any, context: 'preview' | 'export' | 'debug'): string => {
  switch (context) {
    case 'export':
      return 'high-quality';
    case 'debug':
      return 'debug';
    case 'preview':
      // パフォーマンス重視
      const hasComplexAnimations = settings.animation && settings.animation !== 'none';
      const hasImages = settings.imageData;
      
      if (hasComplexAnimations || hasImages) {
        return 'optimized';
      }
      return 'static';
    default:
      return 'static';
  }
};