import { useEffect, useRef } from 'react';
import { generateIconData, drawAnimationFrame, drawTextIcon } from '../../utils/canvasUtils';

import { FlatSettings } from '../../types/settings';

export interface PreviewCanvasProps {
  iconSettings: FlatSettings;
  size: number;
  className?: string;
  style?: React.CSSProperties;
  'aria-labelledby'?: string;
  'aria-description'?: string;
}

export function PreviewCanvas({ 
  iconSettings, 
  size, 
  className = '',
  style,
  'aria-labelledby': ariaLabelledBy,
  'aria-description': ariaDescription
}: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    // アニメーション停止
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // フォントロード待機処理
    const loadFonts = async () => {
      if (iconSettings.fontFamily && iconSettings.fontFamily !== "sans-serif") {
        const fontFamily = iconSettings.fontFamily;
        const isDecorativeFont = fontFamily.includes("Pacifico") || fontFamily.includes("Caveat");
        
        let fontWeight = "bold";
        if (fontFamily.includes("M PLUS") || fontFamily.includes("M+")) {
          fontWeight = "900";
        } else if (isDecorativeFont) {
          fontWeight = "normal";
        }

        try {
          await document.fonts.load(`${fontWeight} 16px ${fontFamily}`);
        } catch (e) {
          // フォント読み込みエラーは無視して描画を続行
        }
      }
    };

    loadFonts().then(() => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const canvasSize = iconSettings.canvasSize || 128;
      canvas.width = size;
      canvas.height = size;
      
      const ctx = canvas.getContext("2d", { alpha: true, willReadFrequently: true });
      if (!ctx) return;

      // アニメーションがある場合はリアルタイムで描画
      const hasTextAnimation = iconSettings.animation && iconSettings.animation !== "none";
      const hasImageAnimation = iconSettings.imageData && iconSettings.imageAnimation && iconSettings.imageAnimation !== "none";
      
      if (hasTextAnimation || hasImageAnimation) {
        frameRef.current = 0;
        const frameCount = iconSettings.gifFrames || 30;
        const requestedDelay = iconSettings.animationSpeed || 33;
        const delay = requestedDelay < 30 ? 30 : requestedDelay;
        let lastTime = 0;

        const animate = (currentTime: number) => {
          if (!lastTime) lastTime = currentTime;
          const deltaTime = currentTime - lastTime;

          if (deltaTime >= delay) {
            frameRef.current = (frameRef.current + 1) % frameCount;
            
            // キャンバスをクリア
            ctx.clearRect(0, 0, size, size);
            
            // スケール調整
            ctx.save();
            const scale = size / canvasSize;
            ctx.scale(scale, scale);
            
            // 背景色を描画
            ctx.fillStyle = iconSettings.backgroundColor || "#FFFFFF";
            ctx.fillRect(0, 0, canvasSize, canvasSize);
            
            // アニメーションフレームを描画
            drawAnimationFrame(ctx, iconSettings, frameRef.current, frameCount);
            
            ctx.restore();
            lastTime = currentTime;
          }

          animationRef.current = requestAnimationFrame(animate);
        };

        animate(0);
      } else {
        // アニメーションなしの場合は静止画を生成
        ctx.clearRect(0, 0, size, size);
        
        ctx.save();
        const scale = size / canvasSize;
        ctx.scale(scale, scale);
        
        drawTextIcon(ctx, iconSettings);
        
        ctx.restore();
      }
    });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [iconSettings, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={className}
      style={style}
      role="img"
      aria-labelledby={ariaLabelledBy}
      aria-description={ariaDescription}
    />
  );
}