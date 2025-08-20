import { useEffect, useRef } from 'react';
import { canvasManager } from '../utils/CanvasManager';
import { registerDefaultPipelines, selectOptimalPipeline } from '../utils/RenderingPipelines';
import { handleError, ErrorTypes } from '../utils/errorHandler';

export const useCanvasPreview = (iconSettings, isMobile) => {
  const canvasRef = useRef(null);
  const smallCanvasRef = useRef(null);
  const managerInitialized = useRef(false);

  useEffect(() => {
    if (!isMobile) return;

    const initializeCanvases = async () => {
      try {
        // Canvas Manager初期化
        if (!managerInitialized.current) {
          registerDefaultPipelines(canvasManager);
          managerInitialized.current = true;
        }

        if (canvasRef.current && smallCanvasRef.current) {
          const canvasSize = iconSettings.canvasSize || 128;
          
          // 既存のキャンバスを使用してCanvasManagerに登録
          canvasRef.current.width = canvasSize;
          canvasRef.current.height = canvasSize;
          
          smallCanvasRef.current.width = 32;
          smallCanvasRef.current.height = 32;
          
          // willReadFrequently 属性を設定してパフォーマンスを向上
          const mainCtx = canvasRef.current.getContext('2d', { willReadFrequently: true });
          const smallCtx = smallCanvasRef.current.getContext('2d', { willReadFrequently: true });

          // CanvasManagerにキャンバスを登録
          if (!canvasManager.getCanvas('main')) {
            const mainCanvas = canvasManager.createCanvas('main', canvasSize, canvasSize);
            // 既存のDOM要素と置き換え
            mainCtx.drawImage(mainCanvas.canvas, 0, 0);
          }

          if (!canvasManager.getCanvas('small')) {
            const smallCanvas = canvasManager.createCanvas('small', 32, 32);
            smallCtx.drawImage(smallCanvas.canvas, 0, 0);
          }

          // 最適なパイプラインを選択
          const pipelineName = selectOptimalPipeline(iconSettings, 'preview');
          
          // メインキャンバスのレンダリング開始
          const hasAnimations = (iconSettings.animation && iconSettings.animation !== 'none') ||
                               (iconSettings.imageData && iconSettings.imageAnimation && iconSettings.imageAnimation !== 'none');
          
          if (hasAnimations) {
            await canvasManager.startAnimation('main', iconSettings, 30, pipelineName);
          } else {
            await canvasManager.renderStatic('main', iconSettings, pipelineName);
          }

          // 小さなキャンバスをメインキャンバスからスケールコピー
          let animationFrameId = null;
          const updateSmallCanvas = () => {
            // nullチェックを追加
            if (!canvasRef.current || !smallCanvasRef.current) {
              return;
            }
            
            const scale = 32 / canvasSize;
            canvasManager.renderScaled('main', 'small', scale);
            
            // DOM要素に反映
            const mainCanvasInstance = canvasManager.getCanvas('main');
            const smallCanvasInstance = canvasManager.getCanvas('small');
            
            if (mainCanvasInstance && smallCanvasInstance) {
              mainCtx.clearRect(0, 0, canvasSize, canvasSize);
              mainCtx.drawImage(mainCanvasInstance.canvas, 0, 0);
              
              smallCtx.clearRect(0, 0, 32, 32);
              smallCtx.drawImage(smallCanvasInstance.canvas, 0, 0);
            }
            
            if (hasAnimations) {
              animationFrameId = requestAnimationFrame(updateSmallCanvas);
            }
          };

          updateSmallCanvas();
          
          // クリーンアップ関数内でanimationFrameIdを参照できるようにする
          return () => {
            if (animationFrameId) {
              cancelAnimationFrame(animationFrameId);
            }
          };
        }
      } catch (error) {
        handleError(ErrorTypes.CANVAS_OPERATION, error);
      }
    };

    initializeCanvases();

    return () => {
      canvasManager.stopAnimation('main');
      canvasManager.stopAnimation('small');
    };
  }, [iconSettings, isMobile]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (managerInitialized.current) {
        canvasManager.stopAllAnimations();
        managerInitialized.current = false;
      }
    };
  }, []);

  return {
    canvasRef,
    smallCanvasRef
  };
};