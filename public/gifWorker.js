/**
 * GIF生成専用Web Worker
 * メインスレッドをブロックしないGIF生成処理
 */

// gif.js動的インポート用のキャッシュ
let GIFConstructor = null;

/**
 * gif.jsライブラリの遅延読み込み
 */
const loadGIF = async () => {
  if (!GIFConstructor) {
    try {
      // Web Worker環境でimportScriptsを使用
      if (typeof importScripts !== 'undefined') {
        importScripts('https://unpkg.com/gif.js@0.2.0/dist/gif.js');
        GIFConstructor = self.GIF;
      } else {
        // fallback: try dynamic import
        const module = await import('gif.js');
        GIFConstructor = module.default;
      }
      
      if (!GIFConstructor) {
        throw new Error('GIFConstructorが利用できません');
      }
    } catch (error) {
      throw new Error(`GIFライブラリの読み込みに失敗: ${error.message}`);
    }
  }
  return GIFConstructor;
};

/**
 * フレームデータからGIFを生成
 */
const generateGIF = async (config) => {
  try {
    const GIFClass = await loadGIF();
    
    const gif = new GIFClass({
      workers: 2,
      quality: config.quality || 10,
      width: config.width,
      height: config.height,
      workerScript: '/gif.worker.js',
      repeat: config.repeat || 0,
      dither: config.dither || false
    });

    // フレーム追加
    config.frames.forEach((frameData, _index) => {
      try {
        // ImageDataからCanvasを作成（gif.js互換性を重視）
        const canvas = new OffscreenCanvas(config.width, config.height);
        const ctx = canvas.getContext('2d', { 
          alpha: false, // gif.jsはアルファチャンネルをサポートしない
          willReadFrequently: false,
          imageSmoothingEnabled: false // GIFはピクセルパーフェクトであるべき
        });
        
        if (!ctx) {
          console.warn(`Frame ${_index}: Failed to create canvas context`);
          return; // フレームをスキップ
        }
        
        // 背景を白で塗りつぶす（アルファの代わり）
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, config.width, config.height);
        
        // フレームデータを描画
        if (frameData.type === 'imageData') {
          if (frameData.data && frameData.data.data && frameData.data.data.length > 0) {
            // ImageDataのサイズを確認
            if (frameData.data.width === config.width && frameData.data.height === config.height) {
              ctx.putImageData(frameData.data, 0, 0);
            } else {
              console.warn(`Frame ${_index}: ImageData size mismatch (${frameData.data.width}x${frameData.data.height} vs ${config.width}x${config.height})`);
              return;
            }
          } else {
            console.warn(`Frame ${_index}: Invalid ImageData structure`);
            return;
          }
        } else {
          console.warn(`Frame ${_index}: Unsupported frame type: ${frameData.type}`);
          return;
        }
        
        // Canvasの有効性を確認
        try {
          const verifyData = ctx.getImageData(0, 0, config.width, config.height);
          if (!verifyData || !verifyData.data || verifyData.data.length === 0) {
            console.warn(`Frame ${_index}: Canvas verification failed - empty data`);
            return;
          }
        } catch (error) {
          console.warn(`Frame ${_index}: Canvas verification error:`, error);
          return;
        }
        
        // gif.jsのdelayはミリ秒単位（プレビューと同じ）
        const normalizedDelay = Math.max(20, frameData.delay || 100); // 20ms未満はGIFビューアがデフォルト速度にする
        
        // gif.jsはImageDataを直接渡すことでみつめょう
        try {
          // CanvasからImageDataを取得
          const imageData = ctx.getImageData(0, 0, config.width, config.height);
          
          // gif.jsにImageDataを渡す
          gif.addFrame(imageData, {
            copy: true,
            delay: normalizedDelay,
            dispose: -1
          });
          // フレーム追加成功
        } catch (error) {
          // フレーム追加失敗時はスキップ
        }
        
      } catch (error) {
        // エラーが発生したフレームはスキップ
      }
    });

    // GIF生成完了を待機
    return new Promise((resolve, reject) => {
      gif.on('finished', (blob) => {
        resolve(blob);
      });
      
      gif.on('error', (error) => {
        reject(error);
      });
      
      gif.render();
    });
    
  } catch (error) {
    throw new Error(`GIF生成エラー: ${error.message}`);
  }
};

/**
 * フレーム描画処理
 */
const renderFrame = (settings, frameIndex, totalFrames) => {
  try {
    const canvas = new OffscreenCanvas(settings.canvasSize, settings.canvasSize);
    const ctx = canvas.getContext('2d', {
      alpha: false, // GIFはアルファ非対応
      willReadFrequently: false,
      imageSmoothingEnabled: false
    });
    
    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }
    
    // 背景を必ず白で塗りつぶす（GIFのアルファ非対応対策）
    ctx.fillStyle = settings.backgroundColor || '#FFFFFF';
    ctx.fillRect(0, 0, settings.canvasSize, settings.canvasSize);
    
    // アニメーションフレーム描画
    const progress = frameIndex / totalFrames;
    
    // テキストアニメーション処理
    ctx.save();
    applyTextAnimation(ctx, settings, progress);
    renderTextToCanvas(ctx, settings);
    ctx.restore();
    
    // 画像レイヤー処理
    if (settings.imageData) {
      drawImageLayer(ctx, settings, progress);
    }
    
    // ImageDataとして返す
    const imageData = ctx.getImageData(0, 0, settings.canvasSize, settings.canvasSize);
    
    if (!imageData || !imageData.data || imageData.data.length === 0) {
      throw new Error('Invalid image data generated');
    }
    
    return imageData;
  } catch (error) {
    throw new Error(`Frame rendering error: ${error.message}`);
  }
};

/**
 * テキストアニメーション適用
 */
const applyTextAnimation = (ctx, settings, progress) => {
  const canvasSize = settings.canvasSize;
  const centerX = canvasSize / 2;
  const centerY = canvasSize / 2;
  
  switch (settings.animation) {
    case 'bounce': {
      const bounceOffset = Math.sin(progress * Math.PI * 2) * (settings.animationAmplitude || 10);
      ctx.translate(0, bounceOffset);
      break;
    }
      
    case 'rotate': {
      const angle = progress * Math.PI * 2;
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);
      ctx.translate(-centerX, -centerY);
      break;
    }
      
    case 'scale': {
      const scale = 1 + Math.sin(progress * Math.PI * 2) * (settings.animationAmplitude || 0.2);
      ctx.translate(centerX, centerY);
      ctx.scale(scale, scale);
      ctx.translate(-centerX, -centerY);
      break;
    }
      
    case 'shake': {
      const shakeX = (Math.random() - 0.5) * (settings.animationAmplitude || 5);
      const shakeY = (Math.random() - 0.5) * (settings.animationAmplitude || 5);
      ctx.translate(shakeX, shakeY);
      break;
    }
  }
};

/**
 * テキストをCanvasに描画
 */
const renderTextToCanvas = (ctx, settings) => {
  const canvasSize = settings.canvasSize;
  const text = settings.text || '';
  
  // フォント設定
  const fontSize = settings.fontSize || 40;
  const fontFamily = settings.fontFamily || 'sans-serif';
  const fontWeight = settings.fontFamily?.includes('M PLUS') ? '900' : 'bold';
  
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // テキスト色設定
  if (settings.textColorType === 'gradient') {
    const gradient = ctx.createLinearGradient(0, 0, canvasSize, canvasSize);
    gradient.addColorStop(0, settings.fontColor || '#000000');
    gradient.addColorStop(1, settings.secondaryColor || '#FF0000');
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = settings.fontColor || '#000000';
  }
  
  // テキスト描画
  const centerX = canvasSize / 2;
  const centerY = canvasSize / 2;
  ctx.fillText(text, centerX, centerY);
  
  // アウトライン描画
  if (settings.hasOutline && settings.outlineColor) {
    ctx.strokeStyle = settings.outlineColor;
    ctx.lineWidth = settings.outlineWidth || 2;
    ctx.strokeText(text, centerX, centerY);
  }
};

/**
 * 画像レイヤー描画
 */
const drawImageLayer = (_ctx, _settings, _progress) => {
  // 画像処理は複雑になるため、基本的な実装のみ
  // 実際の実装では、メインスレッドで事前処理された画像データを受け取る
};

/**
 * ワーカーメッセージハンドラー
 */
self.onmessage = async function(event) {
  const { type, data } = event.data;
  
  try {
    switch (type) {
      case 'generateGIF': {
        // フレーム生成とGIF作成を並行処理
        const frames = [];
        const { settings } = data;
        const frameCount = settings.gifFrames || 30;
        
        // 進捗報告
        self.postMessage({
          type: 'progress',
          data: { message: 'フレーム生成開始', progress: 0 }
        });
        
        // 全フレームを生成
        for (let i = 0; i < frameCount; i++) {
          const frameData = renderFrame(settings, i, frameCount);
          frames.push({
            type: 'imageData',
            data: frameData,
            delay: Math.max(30, Math.round((settings.animationSpeed || 33) / 10) * 10)
          });
          
          // 進捗報告
          const progress = ((i + 1) / frameCount) * 50; // フレーム生成は全体の50%
          self.postMessage({
            type: 'progress',
            data: { 
              message: `フレーム ${i + 1}/${frameCount} 生成完了`, 
              progress 
            }
          });
        }
        
        self.postMessage({
          type: 'progress',
          data: { message: 'GIF生成開始', progress: 50 }
        });
        
        // GIF生成
        const gifConfig = {
          width: settings.canvasSize,
          height: settings.canvasSize,
          quality: settings.gifQuality || 10,
          repeat: 0,
          dither: false,
          frames: frames
        };
        
        const gifBlob = await generateGIF(gifConfig);
        
        // Blobを配列バッファに変換
        const arrayBuffer = await gifBlob.arrayBuffer();
        
        self.postMessage({
          type: 'complete',
          data: { 
            gif: arrayBuffer,
            mimeType: gifBlob.type,
            message: 'GIF生成完了'
          }
        });
        
        break;
      }
        
      case 'renderFrame': {
        // 単一フレーム描画
        const frameImageData = renderFrame(data.settings, data.frameIndex, data.totalFrames);
        self.postMessage({
          type: 'frameComplete',
          data: {
            frameIndex: data.frameIndex,
            imageData: frameImageData
          }
        });
        break;
      }
        
      default:
        throw new Error(`未知のワーカータスク: ${type}`);
    }
    
  } catch (error) {
    self.postMessage({
      type: 'error',
      data: {
        message: error.message,
        stack: error.stack
      }
    });
  }
};

// エラーハンドラー
self.onerror = function(error) {
  self.postMessage({
    type: 'error',
    data: {
      message: `ワーカーエラー: ${error.message}`,
      filename: error.filename,
      lineno: error.lineno
    }
  });
};