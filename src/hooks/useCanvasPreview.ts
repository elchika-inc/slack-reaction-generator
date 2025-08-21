import { useEffect, useRef } from 'react';
import { canvasManager } from '../utils/CanvasManager';
import { registerDefaultPipelines, selectOptimalPipeline } from '../utils/RenderingPipelines';
import { handleError, ErrorTypes } from '../utils/errorHandler';
import { drawAnimationFrame, drawTextIcon } from '../utils/canvasUtils';

export const useCanvasPreview = (iconSettings, isMobile) => {
  const canvasRef = useRef(null);
  const smallCanvasRef = useRef(null);
  const managerInitialized = useRef(false);
  const animationRef = useRef(null);
  const smallAnimationRef = useRef(null);
  const frameRef = useRef(0);
  const smallFrameRef = useRef(0);

  useEffect(() => {
    // アニメーション停止
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (smallAnimationRef.current) {
      cancelAnimationFrame(smallAnimationRef.current);
      smallAnimationRef.current = null;
    }

    // モバイルの場合のみ、App.tsxのcanvasを直接操作
    if (!isMobile) return;

    const initializeCanvases = async () => {
      try {
        if (canvasRef.current && smallCanvasRef.current) {
          const canvasSize = iconSettings.canvasSize || 128;
          const canvas = canvasRef.current;
          const smallCanvas = smallCanvasRef.current;
          
          // キャンバスサイズ設定
          canvas.width = canvasSize;
          canvas.height = canvasSize;
          smallCanvas.width = 32;
          smallCanvas.height = 32;
          
          const ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: true });
          const smallCtx = smallCanvas.getContext('2d', { alpha: true, willReadFrequently: true });
          
          // アニメーションチェック
          const hasTextAnimation = iconSettings.animation && iconSettings.animation !== 'none';
          const hasImageAnimation = iconSettings.imageData && iconSettings.imageAnimation && iconSettings.imageAnimation !== 'none';
          
          if (hasTextAnimation || hasImageAnimation) {
            // アニメーションがある場合
            frameRef.current = 0;
            smallFrameRef.current = 0;
            const frameCount = iconSettings.gifFrames || 30;
            const requestedDelay = iconSettings.animationSpeed || 33;
            const delay = requestedDelay < 30 ? 30 : requestedDelay;
            let lastTime = 0;
            let smallLastTime = 0;
            
            const animate = (currentTime) => {
              if (!lastTime) lastTime = currentTime;
              const deltaTime = currentTime - lastTime;
              
              if (deltaTime >= delay) {
                frameRef.current = (frameRef.current + 1) % frameCount;
                // 背景色を描画
                ctx.fillStyle = iconSettings.backgroundColor || '#FFFFFF';
                ctx.fillRect(0, 0, canvasSize, canvasSize);
                // アニメーションフレームを描画
                drawAnimationFrame(ctx, iconSettings, frameRef.current, frameCount);
                lastTime = currentTime;
              }
              
              animationRef.current = requestAnimationFrame(animate);
            };
            
            const animateSmall = (currentTime) => {
              if (!smallLastTime) smallLastTime = currentTime;
              const deltaTime = currentTime - smallLastTime;
              
              if (deltaTime >= delay) {
                smallFrameRef.current = (smallFrameRef.current + 1) % frameCount;
                // 32x32キャンバスをクリア
                smallCtx.clearRect(0, 0, 32, 32);
                // 32x32にスケールダウンして描画
                smallCtx.save();
                const scale = 32 / canvasSize;
                smallCtx.scale(scale, scale);
                // 背景色を描画
                smallCtx.fillStyle = iconSettings.backgroundColor || '#FFFFFF';
                smallCtx.fillRect(0, 0, canvasSize, canvasSize);
                drawAnimationFrame(smallCtx, iconSettings, smallFrameRef.current, frameCount);
                smallCtx.restore();
                smallLastTime = currentTime;
              }
              
              smallAnimationRef.current = requestAnimationFrame(animateSmall);
            };
            
            animate(0);
            animateSmall(0);
          } else {
            // 静止画の場合
            ctx.clearRect(0, 0, canvasSize, canvasSize);
            smallCtx.clearRect(0, 0, 32, 32);
            
            // メインキャンバスに描画
            drawTextIcon(ctx, iconSettings);
            
            // 32x32にスケールダウン
            smallCtx.save();
            const scale = 32 / canvasSize;
            smallCtx.scale(scale, scale);
            drawTextIcon(smallCtx, iconSettings);
            smallCtx.restore();
          }
        }
      } catch (error) {
        handleError(ErrorTypes.CANVAS_OPERATION, error);
      }
    };

    initializeCanvases();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (smallAnimationRef.current) {
        cancelAnimationFrame(smallAnimationRef.current);
        smallAnimationRef.current = null;
      }
    };
  }, [iconSettings, isMobile]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (smallAnimationRef.current) {
        cancelAnimationFrame(smallAnimationRef.current);
      }
    };
  }, []);

  return {
    canvasRef,
    smallCanvasRef
  };
};