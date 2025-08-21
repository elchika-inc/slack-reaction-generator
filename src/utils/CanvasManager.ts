/**
 * Canvas操作を一元化するCanvasManagerクラス
 * - Canvas作成とライフサイクル管理
 * - レンダリングパイプラインの統一
 * - アニメーション制御
 * - リソース管理とクリーンアップ
 */

import { CANVAS_CONFIG } from '../constants/canvasConstants';
import { drawTextIcon, drawAnimationFrame, generateIconData } from './canvasUtils';
import { handleError, ErrorTypes } from './errorHandler';

export interface CanvasInstance {
  id: string;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  animationId: number | null;
  lastTime: number;
  frame: number;
  isActive: boolean;
}

export interface RenderingPipeline {
  prepare: (settings: any) => Promise<void> | void;
  render: (ctx: CanvasRenderingContext2D, settings: any, frame?: number, totalFrames?: number) => void;
  cleanup: () => void;
}

export class CanvasManager {
  private canvases: Map<string, CanvasInstance> = new Map();
  private renderingPipelines: Map<string, RenderingPipeline> = new Map();
  private static instance: CanvasManager | null = null;

  constructor() {
    this.setupDefaultPipelines();
  }

  /**
   * シングルトンインスタンスの取得
   */
  static getInstance(): CanvasManager {
    if (!CanvasManager.instance) {
      CanvasManager.instance = new CanvasManager();
    }
    return CanvasManager.instance;
  }

  /**
   * デフォルトのレンダリングパイプラインをセットアップ
   */
  private setupDefaultPipelines(): void {
    // 静止画レンダリングパイプライン
    this.registerPipeline('static', {
      prepare: async (settings: any) => {
        // フォントのプリロード等
      },
      render: (ctx: CanvasRenderingContext2D, settings: any) => {
        drawTextIcon(ctx, settings);
      },
      cleanup: () => {
        // リソースクリーンアップ
      }
    });

    // アニメーションレンダリングパイプライン
    this.registerPipeline('animation', {
      prepare: async (settings: any) => {
        // アニメーション用の準備
      },
      render: (ctx: CanvasRenderingContext2D, settings: any, frame: number = 0, totalFrames: number = 30) => {
        // 背景クリア
        const canvasSize = settings.canvasSize || CANVAS_CONFIG.SIZE;
        ctx.fillStyle = settings.backgroundColor || CANVAS_CONFIG.DEFAULT_BACKGROUND_COLOR;
        ctx.fillRect(0, 0, canvasSize, canvasSize);
        
        // フレーム描画
        drawAnimationFrame(ctx, settings, frame, totalFrames);
      },
      cleanup: () => {
        // アニメーション用クリーンアップ
      }
    });
  }

  /**
   * Canvas作成と登録
   */
  createCanvas(
    id: string, 
    width: number = CANVAS_CONFIG.SIZE, 
    height: number = CANVAS_CONFIG.SIZE,
    options: CanvasRenderingContext2DSettings = {}
  ): CanvasInstance {
    try {
      // 既存のCanvasが存在する場合は削除
      if (this.canvases.has(id)) {
        this.removeCanvas(id);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const contextOptions: CanvasRenderingContext2DSettings = {
        alpha: true,
        willReadFrequently: true,
        ...options
      };

      const ctx = canvas.getContext('2d', contextOptions);
      if (!ctx) {
        throw new Error(`Failed to create 2D context for canvas ${id}`);
      }

      const canvasInstance: CanvasInstance = {
        id,
        canvas,
        ctx,
        width,
        height,
        animationId: null,
        lastTime: 0,
        frame: 0,
        isActive: true
      };

      this.canvases.set(id, canvasInstance);
      return canvasInstance;
    } catch (error) {
      handleError(ErrorTypes.CANVAS_OPERATION, error);
      throw error;
    }
  }

  /**
   * Canvas取得
   */
  getCanvas(id: string): CanvasInstance | undefined {
    return this.canvases.get(id);
  }

  /**
   * レンダリングパイプライン登録
   */
  registerPipeline(name: string, pipeline: RenderingPipeline): void {
    this.renderingPipelines.set(name, pipeline);
  }

  /**
   * 静止画レンダリング
   */
  async renderStatic(canvasId: string, settings: any, pipelineName: string = 'static'): Promise<void> {
    const canvasInstance = this.getCanvas(canvasId);
    const pipeline = this.renderingPipelines.get(pipelineName);

    if (!canvasInstance || !pipeline) {
      handleError(ErrorTypes.CANVAS_OPERATION, new Error(`Canvas ${canvasId} or pipeline ${pipelineName} not found`));
      return;
    }

    try {
      // アニメーション停止
      this.stopAnimation(canvasId);

      // レンダリングパイプライン実行
      await pipeline.prepare(settings);
      
      const { ctx, width, height } = canvasInstance;
      ctx.clearRect(0, 0, width, height);
      
      pipeline.render(ctx, settings);
    } catch (error) {
      handleError(ErrorTypes.RENDERING, error);
    }
  }

  /**
   * アニメーション開始
   */
  async startAnimation(
    canvasId: string, 
    settings: any, 
    frameCount: number = 30,
    pipelineName: string = 'animation'
  ): Promise<void> {
    const canvasInstance = this.getCanvas(canvasId);
    const pipeline = this.renderingPipelines.get(pipelineName);

    if (!canvasInstance || !pipeline) {
      handleError(ErrorTypes.CANVAS_OPERATION, new Error(`Canvas ${canvasId} or pipeline ${pipelineName} not found`));
      return;
    }

    try {
      // 既存のアニメーション停止
      this.stopAnimation(canvasId);

      // アニメーションの必要性チェック
      const hasTextAnimation = settings.animation && settings.animation !== 'none';
      const hasImageAnimation = settings.imageData && settings.imageAnimation && settings.imageAnimation !== 'none';

      if (!hasTextAnimation && !hasImageAnimation) {
        // 静止画として描画
        this.renderStatic(canvasId, settings);
        return;
      }

      // パイプライン準備
      await pipeline.prepare(settings);

      // アニメーション設定
      const requestedDelay = settings.animationSpeed || CANVAS_CONFIG.DEFAULT_ANIMATION_SPEED;
      const delay = Math.max(CANVAS_CONFIG.MIN_ANIMATION_SPEED, requestedDelay);

      const animate = (currentTime: number) => {
        if (!canvasInstance.isActive) return;

        if (!canvasInstance.lastTime) {
          canvasInstance.lastTime = currentTime;
        }

        const deltaTime = currentTime - canvasInstance.lastTime;

        if (deltaTime >= delay) {
          canvasInstance.frame = (canvasInstance.frame + 1) % frameCount;
          
          // フレーム描画
          pipeline.render(canvasInstance.ctx, settings, canvasInstance.frame, frameCount);
          
          canvasInstance.lastTime = currentTime;
        }

        canvasInstance.animationId = requestAnimationFrame(animate);
      };

      canvasInstance.animationId = requestAnimationFrame(animate);
    } catch (error) {
      handleError(ErrorTypes.RENDERING, error);
    }
  }

  /**
   * アニメーション停止
   */
  stopAnimation(canvasId: string): void {
    const canvasInstance = this.getCanvas(canvasId);
    if (!canvasInstance) return;

    if (canvasInstance.animationId) {
      cancelAnimationFrame(canvasInstance.animationId);
      canvasInstance.animationId = null;
      canvasInstance.lastTime = 0;
      canvasInstance.frame = 0;
    }
  }

  /**
   * スケール描画（小サイズ用）
   */
  renderScaled(sourceCanvasId: string, targetCanvasId: string, scale: number): void {
    const sourceCanvas = this.getCanvas(sourceCanvasId);
    const targetCanvas = this.getCanvas(targetCanvasId);

    if (!sourceCanvas || !targetCanvas) {
      handleError(ErrorTypes.CANVAS_OPERATION, new Error('Source or target canvas not found'));
      return;
    }

    try {
      const { ctx: targetCtx, width: targetWidth, height: targetHeight } = targetCanvas;
      
      targetCtx.clearRect(0, 0, targetWidth, targetHeight);
      targetCtx.save();
      targetCtx.scale(scale, scale);
      targetCtx.drawImage(sourceCanvas.canvas, 0, 0);
      targetCtx.restore();
    } catch (error) {
      handleError(ErrorTypes.RENDERING, error);
    }
  }

  /**
   * Canvas削除
   */
  removeCanvas(canvasId: string): void {
    const canvasInstance = this.getCanvas(canvasId);
    if (!canvasInstance) return;

    // アニメーション停止
    this.stopAnimation(canvasId);
    
    // 非アクティブ化
    canvasInstance.isActive = false;
    
    // パイプラインクリーンアップ
    this.renderingPipelines.forEach(pipeline => {
      try {
        pipeline.cleanup();
      } catch (error) {
        handleError(ErrorTypes.CLEANUP, error);
      }
    });

    // マップから削除
    this.canvases.delete(canvasId);
  }

  /**
   * 全アニメーション停止
   */
  stopAllAnimations(): void {
    this.canvases.forEach((_, canvasId) => {
      this.stopAnimation(canvasId);
    });
  }

  /**
   * 全Canvas削除とクリーンアップ
   */
  cleanup(): void {
    this.stopAllAnimations();
    
    this.canvases.forEach((canvasInstance) => {
      canvasInstance.isActive = false;
    });
    
    this.canvases.clear();
    
    // パイプラインクリーンアップ
    this.renderingPipelines.forEach(pipeline => {
      try {
        pipeline.cleanup();
      } catch (error) {
        handleError(ErrorTypes.CLEANUP, error);
      }
    });
  }

  /**
   * デバッグ情報取得
   */
  getDebugInfo(): any {
    return {
      canvasCount: this.canvases.size,
      pipelineCount: this.renderingPipelines.size,
      activeAnimations: Array.from(this.canvases.values())
        .filter(canvas => canvas.animationId !== null)
        .map(canvas => canvas.id),
      canvasList: Array.from(this.canvases.keys())
    };
  }

  /**
   * ファイル生成の統一インターフェース
   */
  async generateFile(settings: any): Promise<string> {
    try {
      return await generateIconData(settings);
    } catch (error) {
      handleError(ErrorTypes.FILE_GENERATION, error);
      throw error;
    }
  }
}

// グローバルインスタンス
export const canvasManager = CanvasManager.getInstance();