import { useEffect, useRef } from 'react';
import { renderingEngine } from '../utils/renderingEngine';
import { handleError, ErrorTypes } from '../utils/errorHandler';

export const useCanvasPreview = (iconSettings, isMobile) => {
  const canvasRef = useRef(null);
  const smallCanvasRef = useRef(null);
  const engineInitialized = useRef(false);

  const loadFonts = async (fontFamily) => {
    if (!fontFamily || fontFamily === 'sans-serif') return;
    
    const isDecorativeFont = fontFamily.includes('Pacifico') || fontFamily.includes('Caveat');
    let fontWeight = 'bold';
    
    if (fontFamily.includes('M PLUS') || fontFamily.includes('M+')) {
      fontWeight = '900';
    } else if (isDecorativeFont) {
      fontWeight = 'normal';  
    }

    try {
      await document.fonts.load(`${fontWeight} 16px ${fontFamily}`);
    } catch (error) {
      handleError(ErrorTypes.FONT_LOADING, error);
    }
  };

  useEffect(() => {
    if (!isMobile) return;

    const initializeCanvases = async () => {
      await loadFonts(iconSettings.fontFamily);

      if (canvasRef.current && smallCanvasRef.current && !engineInitialized.current) {
        const canvasSize = iconSettings.canvasSize || 128;
        
        // メインCanvas初期化
        canvasRef.current.width = canvasSize;
        canvasRef.current.height = canvasSize;
        renderingEngine.canvases.set('main', {
          canvas: canvasRef.current,
          ctx: canvasRef.current.getContext('2d', { alpha: true, willReadFrequently: true }),
          width: canvasSize,
          height: canvasSize,
          animationId: null,
          lastTime: 0,
          frame: 0
        });

        // 小Canvas初期化  
        smallCanvasRef.current.width = 32;
        smallCanvasRef.current.height = 32;
        renderingEngine.canvases.set('small', {
          canvas: smallCanvasRef.current,
          ctx: smallCanvasRef.current.getContext('2d', { alpha: true, willReadFrequently: true }),
          width: 32,
          height: 32,
          animationId: null,
          lastTime: 0,
          frame: 0
        });

        engineInitialized.current = true;
      }

      // レンダリング開始
      if (engineInitialized.current) {
        renderingEngine.startAnimation('main', iconSettings);
        
        // 小Canvas用の独立アニメーション
        const smallCanvas = renderingEngine.getCanvas('small');
        if (smallCanvas) {
          const hasTextAnimation = iconSettings.animation && iconSettings.animation !== 'none';
          const hasImageAnimation = iconSettings.imageData && iconSettings.imageAnimation && iconSettings.imageAnimation !== 'none';

          if (hasTextAnimation || hasImageAnimation) {
            const requestedDelay = iconSettings.animationSpeed || 33;
            const delay = requestedDelay < 30 ? 30 : requestedDelay;
            const frameCount = 30;

            const animateSmall = (currentTime) => {
              if (!smallCanvas.lastTime) smallCanvas.lastTime = currentTime;
              const deltaTime = currentTime - smallCanvas.lastTime;

              if (deltaTime >= delay) {
                smallCanvas.frame = (smallCanvas.frame + 1) % frameCount;
                const scale = 32 / (iconSettings.canvasSize || 128);
                
                smallCanvas.ctx.clearRect(0, 0, 32, 32);
                smallCanvas.ctx.save();
                smallCanvas.ctx.scale(scale, scale);
                smallCanvas.ctx.fillStyle = iconSettings.backgroundColor || '#FFFFFF';
                smallCanvas.ctx.fillRect(0, 0, iconSettings.canvasSize || 128, iconSettings.canvasSize || 128);
                
                renderingEngine.renderFrame('main', iconSettings, smallCanvas.frame, frameCount);
                smallCanvas.ctx.drawImage(renderingEngine.getCanvas('main').canvas, 0, 0);
                smallCanvas.ctx.restore();
                smallCanvas.lastTime = currentTime;
              }

              smallCanvas.animationId = requestAnimationFrame(animateSmall);
            };

            animateSmall(0);
          } else {
            const scale = 32 / (iconSettings.canvasSize || 128);
            smallCanvas.ctx.clearRect(0, 0, 32, 32);
            smallCanvas.ctx.save();
            smallCanvas.ctx.scale(scale, scale);
            renderingEngine.renderStatic('main', iconSettings);
            smallCanvas.ctx.drawImage(renderingEngine.getCanvas('main').canvas, 0, 0);
            smallCanvas.ctx.restore();
          }
        }
      }
    };

    initializeCanvases();

    return () => {
      renderingEngine.stopAnimation('main');
      renderingEngine.stopAnimation('small');
    };
  }, [iconSettings, isMobile]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (engineInitialized.current) {
        renderingEngine.stopAllAnimations();
        engineInitialized.current = false;
      }
    };
  }, []);

  return {
    canvasRef,
    smallCanvasRef
  };
};