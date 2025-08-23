import { StaticIconGenerator } from './StaticIconGenerator';
import { AnimatedIconGenerator } from './AnimatedIconGenerator';
import { CanvasRenderer } from './CanvasRenderer';
import { FlatSettings } from '../../types/settings';

/**
 * メインのアイコン生成API（下位互換性維持）
 */
export const generateIconData = async (settings: FlatSettings, canvas?: HTMLCanvasElement): Promise<string> => {
  const hasTextAnimation = settings.animation && settings.animation !== 'none';
  const hasImageAnimation = settings.imageData && settings.imageAnimation && settings.imageAnimation !== 'none';
  
  if (hasTextAnimation || hasImageAnimation) {
    return AnimatedIconGenerator.generateGIF(settings);
  } else {
    return StaticIconGenerator.generatePNG(settings, canvas);
  }
};

/**
 * アニメーションフレーム描画API（下位互換性維持）
 */
export const drawAnimationFrame = async (
  ctx: CanvasRenderingContext2D, 
  settings: FlatSettings, 
  frame: number, 
  totalFrames: number
): Promise<void> => {
  return CanvasRenderer.drawFrame(ctx, settings, frame, totalFrames);
};

/**
 * 静的テキスト描画API（下位互換性維持）
 */
export const drawTextIcon = async (ctx: CanvasRenderingContext2D, settings: FlatSettings): Promise<void> => {
  return CanvasRenderer.drawStaticText(ctx, settings);
};

// 新しいモジュール化されたAPIもエクスポート
export { StaticIconGenerator, AnimatedIconGenerator, CanvasRenderer };