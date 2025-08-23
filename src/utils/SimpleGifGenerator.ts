import { ANIMATION_CONSTANTS, WORKER_CONSTANTS, FILE_CONSTANTS } from '../constants/appConstants';

/**
 * シンプルなGIF生成ユーティリティ
 * 過度な状態管理を排除し、シンプルな関数ベースのアプローチを採用
 */

interface GifGenerationOptions {
  frames: ImageData[];
  delay?: number;
  quality?: number;
  workers?: number;
}

/**
 * GIFを生成する（シンプルな実装）
 */
export async function generateGif(options: GifGenerationOptions): Promise<string> {
  const { 
    frames, 
    delay = ANIMATION_CONSTANTS.MIN_DELAY,
    quality = FILE_CONSTANTS.DEFAULT_GIF_QUALITY,
    workers = WORKER_CONSTANTS.DEFAULT_WORKERS
  } = options;

  if (!frames || frames.length === 0) {
    throw new Error('No frames provided for GIF generation');
  }

  // gif.jsを動的インポート
  const GIFModule = await import('gif.js');
  const GIF = GIFModule.default;

  // 最初のフレームからサイズを取得
  const { width, height } = frames[0];

  const gif = new GIF({
    workers,
    quality,
    width,
    height,
    workerScript: '/gif.worker.js'
  });

  // フレームを追加
  for (const frame of frames) {
    const canvas = createCanvasFromImageData(frame);
    gif.addFrame(canvas, { delay });
  }

  // GIF生成を実行
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('GIF generation timeout'));
    }, WORKER_CONSTANTS.WORKER_TIMEOUT);

    gif.on('finished', (blob: Blob) => {
      clearTimeout(timeout);
      resolve(URL.createObjectURL(blob));
    });

    gif.on('error', (error: Error) => {
      clearTimeout(timeout);
      reject(error);
    });

    gif.render();
  });
}

/**
 * ImageDataからCanvasを作成する
 */
function createCanvasFromImageData(imageData: ImageData): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Canvas要素の配列からGIFを生成する（別の入力形式をサポート）
 */
export async function generateGifFromCanvases(
  canvases: HTMLCanvasElement[],
  delay = ANIMATION_CONSTANTS.MIN_DELAY,
  quality = FILE_CONSTANTS.DEFAULT_GIF_QUALITY
): Promise<string> {
  if (!canvases || canvases.length === 0) {
    throw new Error('No canvases provided for GIF generation');
  }

  const frames: ImageData[] = [];
  
  for (const canvas of canvases) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    frames.push(imageData);
  }

  return generateGif({ frames, delay, quality });
}

/**
 * 設定からGIFフレームを生成する（統合API）
 */
export async function generateGifFromSettings(
  settings: any, // FlatSettingsを使用すべきだが、簡素化のため
  frameCount = ANIMATION_CONSTANTS.DEFAULT_FRAMES,
  delay = ANIMATION_CONSTANTS.MIN_DELAY
): Promise<string> {
  const canvasSize = settings.canvasSize || 128;
  const frames: ImageData[] = [];

  // 各フレームを生成
  for (let i = 0; i < frameCount; i++) {
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // ここでフレーム描画を行う（別モジュールから呼び出し）
    // drawAnimationFrame(ctx, settings, i, frameCount);
    
    const imageData = ctx.getImageData(0, 0, canvasSize, canvasSize);
    frames.push(imageData);
  }

  return generateGif({
    frames,
    delay,
    quality: settings.gifQuality || FILE_CONSTANTS.DEFAULT_GIF_QUALITY
  });
}