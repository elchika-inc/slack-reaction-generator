import { CANVAS_CONFIG } from '../constants/canvasConstants';
import { renderText } from './textRenderer';
import { getOrLoadImage } from './imageCache';
import { 
  ANIMATION_CONSTANTS, 
  applyTextAnimation,
  applyImageAnimation 
} from './animationHelpers';
import { gifWorkerManager, GifGenerationResult, GifGenerationProgress } from './GifWorkerManager';
import { handleError, ErrorTypes } from './errorHandler';

// GIF生成のフォールバック用（Worker使用不可の場合）
let GIF = null;
const loadGIF = async () => {
  if (!GIF) {
    const module = await import('gif.js');
    GIF = module.default;
  }
  return GIF;
};

import { FlatSettings } from '../types/settings';

export const generateIconData = async (settings: FlatSettings, canvas?: HTMLCanvasElement | null): Promise<string> => {
  // キャンバスサイズを取得（デフォルト128）
  const canvasSize = settings.canvasSize || CANVAS_CONFIG.SIZE;
  
  // テキストまたは画像のアニメーションがある場合は専用の処理
  const hasTextAnimation = settings.animation && settings.animation !== 'none';
  const hasImageAnimation = settings.imageData && settings.imageAnimation && settings.imageAnimation !== 'none';
  
  if (hasTextAnimation || hasImageAnimation) {
    // Web Workerを使用したGIF生成
    return await generateAnimatedGIFWithWorker(settings);
  }
  
  // 静止画の場合
  if (!canvas) {
    canvas = document.createElement('canvas')
  }
  
  canvas.width = canvasSize
  canvas.height = canvasSize
  const ctx = canvas.getContext('2d', { 
    alpha: true, 
    willReadFrequently: true,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high'
  })  // アルファチャンネルを明示的に有効化、頻繁な読み込みを最適化
  
  // Clear canvas with transparent background
  ctx.clearRect(0, 0, canvasSize, canvasSize)
  
  // 透明背景の場合、globalCompositeOperationを設定
  if (settings.backgroundType === 'transparent') {
    ctx.globalCompositeOperation = 'source-over'
  }
  
  // テキストベースのアイコン
  drawTextIcon(ctx, settings)
  
  // PNG品質設定を適用（toDataURLはPNGでは品質パラメータを受け付けないため、デフォルトで出力）
  // 実際のファイルサイズ最適化は出力サイズで制御
  return canvas.toDataURL('image/png')
}

export const drawTextIcon = (ctx: CanvasRenderingContext2D, settings: FlatSettings): void => {
  // キャンバスサイズを取得
  const canvasSize = settings.canvasSize || CANVAS_CONFIG.SIZE;
  
  // 背景を設定
  // アニメーションがある場合は常に背景色を塗る（GIFは透明非対応）
  // アニメーションがない場合は、backgroundTypeに応じて背景を設定
  const hasTextAnimation = settings.animation && settings.animation !== 'none';
  const hasImageAnimation = settings.imageData && settings.imageAnimation && settings.imageAnimation !== 'none';
  
  if (hasTextAnimation || hasImageAnimation || settings.backgroundType === 'color') {
    ctx.fillStyle = settings.backgroundColor || CANVAS_CONFIG.DEFAULT_BACKGROUND_COLOR
    // 動的サイズで背景を描画
    ctx.fillRect(0, 0, canvasSize, canvasSize)
  }
  // backgroundType === 'transparent' の場合は何も塗らない（透明背景）
  
  // 画像が後ろの場合は先に描画
  if (settings.imageData && settings.imagePosition === 'back') {
    drawImageLayer(ctx, settings, 0, canvasSize)  // 静止画の場合はprogress=0
  }
  
  // テキストを描画（改行対応）
  renderText(ctx, settings, canvasSize)
  
  // 画像が前の場合は後に描画
  if (settings.imageData && settings.imagePosition === 'front') {
    drawImageLayer(ctx, settings, 0, canvasSize)  // 静止画の場合はprogress=0
  }
}

// 画像レイヤーを描画
const drawImageLayer = (ctx, settings, progress = 0, canvasSize = CANVAS_CONFIG.SIZE) => {
  if (!settings.imageData) return;
  
  const img = getOrLoadImage(settings.imageData);
  if (!img || !(img.complete || img.naturalWidth > 0)) return;
  
  ctx.save();
  
  const baseAlpha = (settings.imageOpacity || ANIMATION_CONSTANTS.OPACITY_MAX) / ANIMATION_CONSTANTS.OPACITY_MAX;
  const maxSize = canvasSize * (settings.imageSize || ANIMATION_CONSTANTS.CENTER_POSITION) / ANIMATION_CONSTANTS.SIZE_MAX;
  const scale = Math.min(maxSize / img.width, maxSize / img.height);
  const width = img.width * scale;
  const height = img.height * scale;
  const centerX = canvasSize * (settings.imageX || ANIMATION_CONSTANTS.CENTER_POSITION) / ANIMATION_CONSTANTS.POSITION_MAX;
  const centerY = canvasSize * (settings.imageY || ANIMATION_CONSTANTS.CENTER_POSITION) / ANIMATION_CONSTANTS.POSITION_MAX;
  
  applyImageAnimation(ctx, settings.imageAnimation, progress, settings.imageAnimationAmplitude, centerX, centerY, baseAlpha);
  
  const x = centerX - (width / 2);
  const y = centerY - (height / 2);
  ctx.drawImage(img, x, y, width, height);
  ctx.restore();
};










/**
 * Web Workerを使用したGIF生成
 */
const generateAnimatedGIFWithWorker = async (settings): Promise<string> => {
  return new Promise((resolve, reject) => {
    const onProgress = (_progress: GifGenerationProgress) => {
      // 進捗処理（必要に応じてUI更新）
    };
    
    const onComplete = (result: GifGenerationResult) => {
      resolve(result.dataUrl);
    };
    
    const onError = (error: Error) => {
      // Workerでエラーが発生した場合、フォールバック処理
      generateAnimatedGIFFallback(settings)
        .then(result => {
          resolve(result);
        })
        .catch(fallbackError => {
          reject(fallbackError);
        });
    };
    
    // Web Workerを使用してGIF生成を開始
    try {
      gifWorkerManager.generateGIF(settings, onProgress, onComplete, onError);
    } catch (error) {
      // Worker初期化エラーの場合もフォールバック
      generateAnimatedGIFFallback(settings).then(resolve).catch(reject);
    }
  });
};

/**
 * フォールバック用GIF生成（メインスレッド）
 */
const generateAnimatedGIFFallback = async (settings): Promise<string> => {
  try {
    const GIFConstructor = await loadGIF();
    const canvasSize = settings.canvasSize || CANVAS_CONFIG.SIZE;
    
    return new Promise((resolve) => {
      const frameCanvas = document.createElement('canvas');
      frameCanvas.width = canvasSize;
      frameCanvas.height = canvasSize;
      const frameCtx = frameCanvas.getContext('2d', { 
        willReadFrequently: true,
        alpha: false, // GIF用はアルファを無効化
        imageSmoothingEnabled: false, // GIFはピクセルパーフェクト
        imageSmoothingQuality: 'low'
      });
      
      const gif = new GIFConstructor({
        workers: 2,
        quality: settings.gifQuality || 10,
        width: canvasSize,
        height: canvasSize,
        workerScript: '/gif.worker.js',
        repeat: 0,
        dither: false
      });
      
      const frameCount = settings.gifFrames || 30;
      const requestedDelay = settings.animationSpeed || CANVAS_CONFIG.DEFAULT_ANIMATION_SPEED;
      let validFramesAdded = 0;
      
      for (let i = 0; i < frameCount; i++) {
        // 背景を必ず先に塗りつぶす（GIFのアルファ非対応対策）
        frameCtx.fillStyle = settings.backgroundColor || '#FFFFFF';
        frameCtx.fillRect(0, 0, canvasSize, canvasSize);
        
        // フレーム描画
        drawAnimationFrame(frameCtx, settings, i, frameCount);
        
        // フレームが有効であることを確認
        try {
          const imageData = frameCtx.getImageData(0, 0, canvasSize, canvasSize);
          if (imageData && imageData.data && imageData.data.length > 0) {
            // gif.jsのdelayはミリ秒単位（プレビューと同じ）
            // プレビューとGIFで同じ速度にする - CANVAS_CONFIG.MIN_ANIMATION_SPEEDを使用
            const normalizedDelay = Math.max(CANVAS_CONFIG.MIN_ANIMATION_SPEED, requestedDelay);
            
            gif.addFrame(imageData, { 
              copy: true, 
              delay: normalizedDelay,
              dispose: -1
            });
            
            validFramesAdded++;
          }
        } catch (error) {
          // フレーム処理エラー時はスキップ
        }
      }
      
      if (validFramesAdded === 0) {
        throw new Error('No valid frames were generated for GIF');
      }
      
      gif.on('finished', (blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = (error) => {
          handleError(ErrorTypes.GIF_GENERATION, error);
          reject(error);
        };
        reader.readAsDataURL(blob);
      });
      
      gif.on('error', (error) => {
        handleError(ErrorTypes.GIF_GENERATION, error);
        reject(error);
      });
      
      gif.render();
    });
  } catch (error) {
    handleError(ErrorTypes.GIF_GENERATION, error);
    throw error;
  }
};

export const drawAnimationFrame = (ctx: CanvasRenderingContext2D, settings: FlatSettings, frame: number, totalFrames: number): void => {
  const progress = frame / totalFrames;
  const canvasSize = settings.canvasSize || CANVAS_CONFIG.SIZE;
  
  if (settings.imageData && settings.imagePosition === 'back') {
    drawImageLayer(ctx, settings, progress, canvasSize);
  }
  
  // 紙吹雪アニメーション用の処理
  if (settings.animation === 'confetti') {
    // 紙吹雪パーティクルを描画
    drawConfettiParticles(ctx, progress, canvasSize, settings.animationAmplitude || 50);
  } else if (settings.animation === 'confetti-cannon') {
    // 左右から発射する紙吹雪を描画
    drawConfettiCannon(ctx, progress, canvasSize, settings.animationAmplitude || 50);
  } else if (settings.animation === 'stars') {
    // 星型パーティクルを描画
    drawStarsAnimation(ctx, progress, canvasSize, settings.animationAmplitude || 50);
  } else if (settings.animation === 'snow') {
    // 雪のパーティクルを描画
    drawSnowAnimation(ctx, progress, canvasSize, settings.animationAmplitude || 50);
  }
  
  ctx.save();
  applyTextAnimation(ctx, settings.animation, progress, settings.animationAmplitude, settings.secondaryColor, canvasSize);
  
  // テキスト設定を決定
  let textSettings = settings;
  if (settings.animation === 'rainbow') {
    const hue = progress * 360;
    textSettings = { 
      ...settings, 
      textColorType: 'solid',
      fontColor: `hsl(${hue}, 100%, 50%)` 
    };
  } else if (settings.animation === 'blink') {
    const useSecondary = Math.sin(progress * Math.PI * 2 * 4) > 0;
    if (useSecondary) {
      textSettings = { 
        ...settings, 
        textColorType: 'solid',
        fontColor: settings.secondaryColor || '#FFD700'
      };
    }
  }
  renderText(ctx, textSettings, canvasSize);
  ctx.restore();
  
  if (settings.imageData && settings.imagePosition === 'front') {
    drawImageLayer(ctx, settings, progress, canvasSize);
  }
}

// 紙吹雪パーティクル描画関数
const drawConfettiParticles = (ctx: CanvasRenderingContext2D, progress: number, canvasSize: number, amplitude: number) => {
  ctx.save();
  
  const particleCount = 15;
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#FFD93D', '#6C5CE7'];
  
  for (let i = 0; i < particleCount; i++) {
    const seed = i * 137.5; // 黄金角
    const x = ((seed * 2.3) % canvasSize);
    const baseY = (seed * 1.7) % canvasSize;
    const y = (baseY + progress * canvasSize * 2) % canvasSize;
    
    // 紙吹雪の回転
    const rotation = (progress * Math.PI * 4 + seed) % (Math.PI * 2);
    
    // 横揺れ
    const swayX = Math.sin(progress * Math.PI * 2 + seed) * (amplitude / 2);
    
    ctx.save();
    ctx.translate(x + swayX, y);
    ctx.rotate(rotation);
    
    // 紙吹雪の形状
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(-4, -2, 8, 4);
    
    ctx.restore();
  }
  
  ctx.restore();
}

// 左右から発射する紙吹雪（キャノンタイプ）
const drawConfettiCannon = (ctx: CanvasRenderingContext2D, progress: number, canvasSize: number, amplitude: number) => {
  ctx.save();
  
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#FFD93D', '#6C5CE7', '#A29BFE'];
  const particlesPerBurst = 12;
  
  // 4回のバーストサイクル（左→右→左→右）
  const burstCount = 4;
  const cycle = progress * burstCount;
  const currentBurst = Math.floor(cycle);
  const burstProgress = cycle - currentBurst;
  
  // パーティクルの物理演算
  const drawParticles = (fromLeft: boolean, burst: number) => {
    for (let i = 0; i < particlesPerBurst; i++) {
      const particleSeed = burst * 100 + i * 7;
      
      // 発射角度：上向き60度から120度の範囲で扇状に
      const spreadAngle = ((i / particlesPerBurst) - 0.5) * Math.PI / 3; // 60度の範囲
      const baseAngle = fromLeft ? -Math.PI * 5 / 12 : -Math.PI * 7 / 12; // 左側は75度、右側は105度
      const angle = baseAngle - spreadAngle; // 扇状に広がる
      
      // 初速度（ランダム性を追加）
      const velocityVariation = 0.8 + (Math.sin(particleSeed) * 0.4);
      const initialVelocity = canvasSize * velocityVariation * 1.2; // 速度を上げる
      
      // 位置計算（下から少し上の位置から発射、サイズに比例）
      const startX = fromLeft ? canvasSize * 0.08 : canvasSize * 0.92; // 端から8%内側
      const startY = canvasSize * 0.77; // 下から23%上の位置から発射
      const x = startX + Math.cos(angle) * initialVelocity * burstProgress;
      const y = startY + Math.sin(angle) * initialVelocity * burstProgress;
      
      // 重力効果（時間の2乗に比例、上に飛んでから落ちる）
      const gravity = burstProgress * burstProgress * canvasSize * 0.8;
      const finalY = y + gravity;
      
      // 横風効果（amplitudeで制御）
      const wind = Math.sin(burstProgress * Math.PI * 2 + particleSeed) * (amplitude / 100) * 20;
      const finalX = x + wind;
      
      // 画面内にある場合のみ描画
      if (finalX >= -10 && finalX <= canvasSize + 10 && finalY >= -10 && finalY <= canvasSize + 10) {
        ctx.save();
        ctx.translate(finalX, finalY);
        
        // 回転（空気抵抗で減速）
        const rotation = burstProgress * Math.PI * 6 * (1 - burstProgress * 0.5) + particleSeed;
        ctx.rotate(rotation);
        
        // 色とアルファ
        ctx.fillStyle = colors[i % colors.length];
        ctx.globalAlpha = Math.max(0, 1 - burstProgress * 0.7);
        
        // パーティクルサイズ（大きめに）
        const size = 10 * (1 - burstProgress * 0.3);
        ctx.fillRect(-size/2, -size/3, size, size/1.5);
        
        ctx.restore();
      }
    }
  };
  
  // 現在のバーストを描画
  if (currentBurst < burstCount) {
    const isLeftSide = currentBurst % 2 === 0;
    drawParticles(isLeftSide, currentBurst);
  }
  
  // 前のバーストの残り（フェードアウト中）も描画
  if (currentBurst > 0 && burstProgress < 0.3) {
    const prevBurst = currentBurst - 1;
    const prevIsLeftSide = prevBurst % 2 === 0;
    const prevProgress = 0.7 + burstProgress;
    
    // 前のバーストの残りを描画（透明度を下げて）
    ctx.globalAlpha = 0.5;
    drawParticles(prevIsLeftSide, prevBurst);
  }
  
  ctx.restore();
}

// 星型アニメーション
const drawStarsAnimation = (ctx: CanvasRenderingContext2D, progress: number, canvasSize: number, amplitude: number) => {
  ctx.save();
  
  const colors = ['#FFD700', '#FFF8DC', '#FFFF99', '#F0E68C', '#FFE4B5', '#FFEFD5', '#FFFAF0'];
  const starCount = 12;
  
  for (let i = 0; i < starCount; i++) {
    const seed = i * 29.5; // 素数で分散
    const x = ((seed * 3.7 + progress * canvasSize * 0.3) % canvasSize);
    const baseY = (seed * 2.1) % canvasSize;
    const y = (baseY + progress * canvasSize * 1.5) % canvasSize;
    
    // 星の回転とキラキラ効果
    const rotation = progress * Math.PI * 3 + seed;
    const twinkle = Math.abs(Math.sin(progress * Math.PI * 6 + seed));
    const scale = 0.5 + twinkle * 0.7; // キラキラするサイズ変化
    
    // 横揺れ（amplitudeで制御）
    const swayX = Math.sin(progress * Math.PI * 2 + seed) * (amplitude / 3);
    
    ctx.save();
    ctx.translate(x + swayX, y);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);
    
    // 星の描画
    ctx.fillStyle = colors[i % colors.length];
    ctx.globalAlpha = 0.7 + twinkle * 0.3; // キラキラする透明度変化
    
    drawStar(ctx, 0, 0, 5, canvasSize * 0.05, canvasSize * 0.025);
    
    ctx.restore();
  }
  
  ctx.restore();
}

// 星型を描画するヘルパー関数
const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
  let rot = Math.PI / 2 * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;
  
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;
    
    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
}

// 雪のアニメーション
const drawSnowAnimation = (ctx: CanvasRenderingContext2D, progress: number, canvasSize: number, amplitude: number) => {
  ctx.save();
  
  const snowflakeCount = 20;
  
  for (let i = 0; i < snowflakeCount; i++) {
    const seed = i * 31.7; // 素数で分散
    const x = ((seed * 2.8 + progress * canvasSize * 0.2) % canvasSize);
    const baseY = (seed * 1.9) % canvasSize;
    const y = (baseY + progress * canvasSize * 1.2) % canvasSize;
    
    // 雪の横揺れ（amplitudeで制御）
    const swayX = Math.sin(progress * Math.PI * 1.5 + seed) * (amplitude / 4);
    const finalX = x + swayX;
    
    // 雪片のサイズ（ランダム）
    const size = 3 + (Math.sin(seed) * 0.5 + 0.5) * 4; // 3-7ピクセル
    
    // 雪片の透明度（遠近感）
    const opacity = 0.6 + (Math.sin(seed * 1.3) * 0.5 + 0.5) * 0.4; // 0.6-1.0
    
    ctx.save();
    ctx.translate(finalX, y);
    
    // 雪片を描画（六角形風の雪の結晶）
    ctx.fillStyle = 'white';
    ctx.globalAlpha = opacity;
    
    // 中心の円
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // 6本の線（雪の結晶風）
    ctx.strokeStyle = 'white';
    ctx.lineWidth = size * 0.15;
    ctx.globalAlpha = opacity * 0.8;
    
    for (let j = 0; j < 6; j++) {
      const angle = (j * Math.PI) / 3;
      ctx.save();
      ctx.rotate(angle);
      
      // 主軸
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -size);
      ctx.stroke();
      
      // 小さな枝
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.7);
      ctx.lineTo(-size * 0.2, -size * 0.5);
      ctx.moveTo(0, -size * 0.7);
      ctx.lineTo(size * 0.2, -size * 0.5);
      ctx.stroke();
      
      ctx.restore();
    }
    
    ctx.restore();
  }
  
  ctx.restore();
}


