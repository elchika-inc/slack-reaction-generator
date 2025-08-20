// フレームレンダリング機能を分割・整理

import { renderText } from './textRenderer';
import { calculateAnimationValue, applyTextAnimation } from './animationHelpers';

// テキスト色の決定
export const getTextColor = (settings, progress) => {
  if (settings.animation === 'rainbow') {
    const hue = calculateAnimationValue('rainbow', progress);
    return {
      textColorType: 'solid',
      fontColor: `hsl(${hue}, 100%, 50%)`
    };
  }
  
  if (settings.animation === 'blink') {
    const useSecondary = calculateAnimationValue('blink', progress);
    if (useSecondary) {
      return {
        textColorType: 'solid',
        fontColor: settings.secondaryColor || '#FFD700'
      };
    }
  }
  
  return settings;
};

// 画像レイヤーの描画（前景・背景）- 簡略版
const renderImageLayer = (ctx, settings, progress, canvasSize, position) => {
  if (!settings.imageData || settings.imagePosition !== position) return;
  
  // 簡略化された画像描画
  const img = new Image();
  img.src = settings.imageData;
  if (img.complete) {
    const size = canvasSize * (settings.imageSize || 50) / 100;
    const x = canvasSize * (settings.imageX || 50) / 100 - size / 2;
    const y = canvasSize * (settings.imageY || 50) / 100 - size / 2;
    ctx.drawImage(img, x, y, size, size);
  }
};

// 単一フレームのレンダリング（分割版）
export const renderAnimationFrame = (ctx, settings, frame, totalFrames, canvasSize) => {
  const progress = frame / totalFrames;
  
  // 背景画像描画
  renderImageLayer(ctx, settings, progress, canvasSize, 'back');
  
  // テキストアニメーション適用
  ctx.save();
  applyTextAnimation(ctx, settings.animation, progress, settings.animationAmplitude, settings.secondaryColor, canvasSize);
  
  // テキスト色決定・描画
  const textSettings = getTextColor(settings, progress);
  renderText(ctx, textSettings, canvasSize);
  
  ctx.restore();
  
  // 前景画像描画
  renderImageLayer(ctx, settings, progress, canvasSize, 'front');
};

// GIF遅延値の計算
export const calculateGifDelay = (requestedDelay) => {
  const MINIMUM_GIF_DELAY = 30;
  const GIF_DELAY_PRECISION = 10;
  
  let gifDelay = requestedDelay;
  if (requestedDelay < MINIMUM_GIF_DELAY) {
    gifDelay = MINIMUM_GIF_DELAY;
  }
  
  return Math.round(gifDelay / GIF_DELAY_PRECISION) * GIF_DELAY_PRECISION;
};

// GIFフレーム生成
export const generateGifFrames = (gif, settings, frameCount, canvasSize) => {
  const frameCanvas = document.createElement('canvas');
  frameCanvas.width = canvasSize;
  frameCanvas.height = canvasSize;
  const frameCtx = frameCanvas.getContext('2d', { willReadFrequently: true });
  
  const gifDelay = calculateGifDelay(settings.animationSpeed || 33);
  
  for (let i = 0; i < frameCount; i++) {
    // フレームキャンバスを背景色で塗りつぶす
    frameCtx.fillStyle = settings.backgroundColor || '#FFFFFF';
    frameCtx.fillRect(0, 0, canvasSize, canvasSize);
    
    // フレーム描画
    renderAnimationFrame(frameCtx, settings, i, frameCount, canvasSize);
    
    // フレームを追加
    gif.addFrame(frameCanvas, { copy: true, delay: gifDelay });
  }
};