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

          // CanvasManagerにキャンバスを登録
          if (!canvasManager.getCanvas('main')) {
            const mainCanvas = canvasManager.createCanvas('main', canvasSize, canvasSize);
            // 既存のDOM要素と置き換え
            canvasRef.current.getContext('2d').drawImage(mainCanvas.canvas, 0, 0);
          }

          if (!canvasManager.getCanvas('small')) {
            const smallCanvas = canvasManager.createCanvas('small', 32, 32);
            smallCanvasRef.current.getContext('2d').drawImage(smallCanvas.canvas, 0, 0);
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
          const updateSmallCanvas = () => {
            const scale = 32 / canvasSize;
            canvasManager.renderScaled('main', 'small', scale);
            
            // DOM要素に反映
            const mainCanvasInstance = canvasManager.getCanvas('main');
            const smallCanvasInstance = canvasManager.getCanvas('small');
            
            if (mainCanvasInstance && smallCanvasInstance) {
              canvasRef.current.getContext('2d').clearRect(0, 0, canvasSize, canvasSize);
              canvasRef.current.getContext('2d').drawImage(mainCanvasInstance.canvas, 0, 0);
              
              smallCanvasRef.current.getContext('2d').clearRect(0, 0, 32, 32);
              smallCanvasRef.current.getContext('2d').drawImage(smallCanvasInstance.canvas, 0, 0);
            }
            
            if (hasAnimations) {
              requestAnimationFrame(updateSmallCanvas);
            }
          };

          updateSmallCanvas();
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