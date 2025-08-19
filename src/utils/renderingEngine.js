// 統一レンダリングエンジン - モバイル・デスクトップ共通

import { drawAnimationFrame, drawTextIcon } from './canvasUtils';

export class RenderingEngine {
  constructor() {
    this.animationIds = new Map();
    this.canvases = new Map();
  }

  // Canvas作成・初期化
  createCanvas(id, width, height, options = {}) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d', {
      alpha: true,
      willReadFrequently: true,
      ...options
    });

    const canvasData = {
      canvas,
      ctx,
      width,
      height,
      animationId: null,
      lastTime: 0,
      frame: 0
    };

    this.canvases.set(id, canvasData);
    return canvasData;
  }

  // Canvas取得
  getCanvas(id) {
    return this.canvases.get(id);
  }

  // アニメーション開始
  startAnimation(id, settings, frameCount = 30) {
    const canvasData = this.getCanvas(id);
    if (!canvasData) return;

    this.stopAnimation(id); // 既存のアニメーション停止

    const hasTextAnimation = settings.animation && settings.animation !== 'none';
    const hasImageAnimation = settings.imageData && settings.imageAnimation && settings.imageAnimation !== 'none';

    if (!hasTextAnimation && !hasImageAnimation) {
      // 静止画の場合
      this.renderStatic(id, settings);
      return;
    }

    // アニメーション描画
    const requestedDelay = settings.animationSpeed || 33;
    const delay = requestedDelay < 30 ? 30 : requestedDelay;

    const animate = (currentTime) => {
      if (!canvasData.lastTime) canvasData.lastTime = currentTime;
      const deltaTime = currentTime - canvasData.lastTime;

      if (deltaTime >= delay) {
        canvasData.frame = (canvasData.frame + 1) % frameCount;
        this.renderFrame(id, settings, canvasData.frame, frameCount);
        canvasData.lastTime = currentTime;
      }

      canvasData.animationId = requestAnimationFrame(animate);
    };

    canvasData.animationId = requestAnimationFrame(animate);
  }

  // アニメーション停止
  stopAnimation(id) {
    const canvasData = this.getCanvas(id);
    if (!canvasData) return;

    if (canvasData.animationId) {
      cancelAnimationFrame(canvasData.animationId);
      canvasData.animationId = null;
      canvasData.lastTime = 0;
      canvasData.frame = 0;
    }
  }

  // 静止画描画
  renderStatic(id, settings) {
    const canvasData = this.getCanvas(id);
    if (!canvasData) return;

    const { ctx, width, height } = canvasData;
    ctx.clearRect(0, 0, width, height);
    drawTextIcon(ctx, settings);
  }

  // フレーム描画
  renderFrame(id, settings, frame, totalFrames) {
    const canvasData = this.getCanvas(id);
    if (!canvasData) return;

    const { ctx, width, height } = canvasData;
    
    // 背景描画
    ctx.fillStyle = settings.backgroundColor || '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    
    // アニメーションフレーム描画
    drawAnimationFrame(ctx, settings, frame, totalFrames);
  }

  // スケール描画（小サイズ用）
  renderScaled(sourceId, targetId, scale) {
    const sourceCanvas = this.getCanvas(sourceId);
    const targetCanvas = this.getCanvas(targetId);
    
    if (!sourceCanvas || !targetCanvas) return;

    const { ctx: targetCtx, width: targetWidth, height: targetHeight } = targetCanvas;
    
    targetCtx.clearRect(0, 0, targetWidth, targetHeight);
    targetCtx.save();
    targetCtx.scale(scale, scale);
    targetCtx.drawImage(sourceCanvas.canvas, 0, 0);
    targetCtx.restore();
  }

  // 全アニメーション停止
  stopAllAnimations() {
    for (const [id] of this.canvases) {
      this.stopAnimation(id);
    }
  }

  // Canvas削除
  removeCanvas(id) {
    this.stopAnimation(id);
    this.canvases.delete(id);
  }

  // 全Canvas削除
  clear() {
    this.stopAllAnimations();
    this.canvases.clear();
  }
}

// グローバルインスタンス（シングルトン）
export const renderingEngine = new RenderingEngine();