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

export const generateIconData = async (settings, canvas) => {
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

export const drawTextIcon = (ctx, settings) => {
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
      const requestedDelay = settings.animationSpeed || 33;
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
            // プレビューとGIFで同じ速度にする
            const normalizedDelay = Math.max(20, requestedDelay); // 20ms未満はGIFビューアによりデフォルト速度になるため
            
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

export const drawAnimationFrame = (ctx, settings, frame, totalFrames) => {
  const progress = frame / totalFrames;
  const canvasSize = settings.canvasSize || CANVAS_CONFIG.SIZE;
  
  if (settings.imageData && settings.imagePosition === 'back') {
    drawImageLayer(ctx, settings, progress, canvasSize);
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


