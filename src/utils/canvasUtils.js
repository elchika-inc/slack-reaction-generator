// GIFライブラリを遅延読み込み
let GIF = null;
const loadGIF = async () => {
  if (!GIF) {
    const module = await import('gif.js');
    GIF = module.default;
  }
  return GIF;
};
import { CANVAS_CONFIG } from '../constants/canvasConstants'
import { renderText } from './textRenderer'
import { getOrLoadImage } from './imageCache'

// アニメーション定数
const ANIMATION_CONSTANTS = {
  FULL_ROTATION: Math.PI * 2,
  BOUNCE_HEIGHT_FACTOR: 19.2,
  PULSE_SCALE_RANGE: 0.2,
  SLIDE_DISTANCE_FACTOR: 29.44,
  GLOW_BLUR_MAX: 30,
  GLOW_BLUR_MIN: 5,
  FADE_AMPLITUDE: 0.5,
  RAINBOW_HUE_FULL: 360,
  BLINK_FREQUENCY: 4,
  HSL_SATURATION: 100,
  HSL_LIGHTNESS: 50,
  MINIMUM_GIF_DELAY: 30,
  GIF_DELAY_PRECISION: 10,
  DEFAULT_AMPLITUDE: 50,
  OPACITY_MAX: 100,
  SIZE_MAX: 100,
  POSITION_MAX: 100,
  CENTER_POSITION: 50
}

export const generateIconData = async (settings, canvas) => {
  // キャンバスサイズを取得（デフォルト128）
  const canvasSize = settings.canvasSize || CANVAS_CONFIG.SIZE;
  
  // テキストまたは画像のアニメーションがある場合は専用の処理
  const hasTextAnimation = settings.animation && settings.animation !== 'none';
  const hasImageAnimation = settings.imageData && settings.imageAnimation && settings.imageAnimation !== 'none';
  
  if (hasTextAnimation || hasImageAnimation) {
    // GIF生成用の新しいキャンバスを作成
    const gifCanvas = document.createElement('canvas')
    gifCanvas.width = canvasSize
    gifCanvas.height = canvasSize
    return await generateAnimatedGIF(gifCanvas, settings)
  }
  
  // 静止画の場合
  if (!canvas) {
    canvas = document.createElement('canvas')
  }
  
  canvas.width = canvasSize
  canvas.height = canvasSize
  const ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: true })  // アルファチャンネルを明示的に有効化、頻繁な読み込みを最適化
  
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
  if (!settings.imageData) return
  
  // キャッシュから画像を取得
  const img = getOrLoadImage(settings.imageData)
  if (!img) return
  
  // 画像が読み込み済みまたはキャッシュされている場合
  if (img.complete || img.naturalWidth > 0) {
    ctx.save()
    
    // 透過度設定（フェードアニメーションの場合は後で適用）
    let baseAlpha = (settings.imageOpacity || ANIMATION_CONSTANTS.OPACITY_MAX) / ANIMATION_CONSTANTS.OPACITY_MAX
    
    // 画像のサイズ計算（%ベース）
    const maxSize = canvasSize * (settings.imageSize || ANIMATION_CONSTANTS.CENTER_POSITION) / ANIMATION_CONSTANTS.SIZE_MAX
    
    // アスペクト比を保持してサイズ計算
    const scale = Math.min(maxSize / img.width, maxSize / img.height)
    const width = img.width * scale
    const height = img.height * scale
    
    // 位置計算（0-100%を0-128pxに変換）
    const centerX = canvasSize * (settings.imageX || ANIMATION_CONSTANTS.CENTER_POSITION) / ANIMATION_CONSTANTS.POSITION_MAX
    const centerY = canvasSize * (settings.imageY || ANIMATION_CONSTANTS.CENTER_POSITION) / ANIMATION_CONSTANTS.POSITION_MAX
    
    // 画像アニメーションを適用（画像の中心を基準に）
    if (settings.imageAnimation && settings.imageAnimation !== 'none') {
      // フェードアニメーションの特別処理
      if (settings.imageAnimation === 'fade') {
        const fadeAlpha = (Math.sin(progress * ANIMATION_CONSTANTS.FULL_ROTATION) + 1) / 2
        ctx.globalAlpha = baseAlpha * fadeAlpha
      } else {
        ctx.globalAlpha = baseAlpha
        
        // その他のアニメーション（回転、バウンス、パルス、スライド）
        switch (settings.imageAnimation) {
          case 'rotate':
            // 画像自体の中心で回転
            ctx.translate(centerX, centerY)
            ctx.rotate(progress * ANIMATION_CONSTANTS.FULL_ROTATION)
            ctx.translate(-centerX, -centerY)
            break
            
          case 'bounce': {
            // バウンス（上下に跳ねる）
            const amplitudeFactor = (settings.imageAnimationAmplitude || ANIMATION_CONSTANTS.DEFAULT_AMPLITUDE) / ANIMATION_CONSTANTS.OPACITY_MAX
            const bounceHeight = ANIMATION_CONSTANTS.BOUNCE_HEIGHT_FACTOR * amplitudeFactor
            const bounce = Math.abs(Math.sin(progress * ANIMATION_CONSTANTS.FULL_ROTATION)) * bounceHeight
            ctx.translate(0, -bounce)
            break
          }
            
          case 'pulse': {
            // 画像自体の中心で拡大縮小
            const pulseAmplitudeFactor = (settings.imageAnimationAmplitude || ANIMATION_CONSTANTS.DEFAULT_AMPLITUDE) / ANIMATION_CONSTANTS.OPACITY_MAX
            const scaleRange = ANIMATION_CONSTANTS.PULSE_SCALE_RANGE * pulseAmplitudeFactor
            const scaleValue = 1 + Math.sin(progress * ANIMATION_CONSTANTS.FULL_ROTATION) * scaleRange
            ctx.translate(centerX, centerY)
            ctx.scale(scaleValue, scaleValue)
            ctx.translate(-centerX, -centerY)
            break
          }
            
          case 'slide': {
            // スライド（左右に移動）
            const slideAmplitudeFactor = (settings.imageAnimationAmplitude || ANIMATION_CONSTANTS.DEFAULT_AMPLITUDE) / ANIMATION_CONSTANTS.OPACITY_MAX
            const slideDistance = ANIMATION_CONSTANTS.SLIDE_DISTANCE_FACTOR * slideAmplitudeFactor
            const slideX = Math.sin(progress * ANIMATION_CONSTANTS.FULL_ROTATION) * slideDistance
            ctx.translate(slideX, 0)
            break
          }
        }
      }
    } else {
      ctx.globalAlpha = baseAlpha
    }
    
    // 画像を描画（中心座標から左上座標を計算）
    const x = centerX - (width / 2)
    const y = centerY - (height / 2)
    
    ctx.drawImage(img, x, y, width, height)
    ctx.restore()
  } else {
    // 画像が読み込まれていない場合、読み込み完了後に再描画
    img.onload = () => {
      // 既に描画済みの内容と同じロジック
      drawImageLayer(ctx, settings, progress)
    }
  }
}










const generateAnimatedGIF = async (canvas, settings) => {
  // GIFライブラリを先に読み込む
  const GIFConstructor = await loadGIF();
  const canvasSize = settings.canvasSize || CANVAS_CONFIG.SIZE;
  
  return new Promise((resolve) => {
    // 一時キャンバスを作成（各フレーム描画用）
    const frameCanvas = document.createElement('canvas')
    frameCanvas.width = canvasSize
    frameCanvas.height = canvasSize
    const frameCtx = frameCanvas.getContext('2d', { willReadFrequently: true })
    
    // GIFアニメーションでは透明色を使用しない（背景色を持つため）
    const gif = new GIFConstructor({
      workers: 2,
      quality: settings.gifQuality || 10,
      width: canvasSize,
      height: canvasSize,
      workerScript: '/gif.worker.js',
      // transparent オプションを削除（透明色を使用しない）
      repeat: 0,  // ループ再生
      // ビューア互換性を向上させるためのオプション
      dither: false  // ディザリングを無効化してより一貫した再生速度を実現
    })
    
    // フレーム数を設定で調整可能に
    const frameCount = settings.gifFrames || 30
    // animationSpeedは既にミリ秒単位で保存されている
    const requestedDelay = settings.animationSpeed || 33
    
    // GIFの遅延値設定
    // 多くのGIFビューアは20ms未満を100msに強制変更するため、最小30msに設定
    let gifDelay = requestedDelay
    if (requestedDelay < ANIMATION_CONSTANTS.MINIMUM_GIF_DELAY) {
      gifDelay = ANIMATION_CONSTANTS.MINIMUM_GIF_DELAY  // より安全な最小値を設定
    }
    
    // GIF遅延は1/100秒単位（10ms刻み）なので、最も近い値に丸める
    gifDelay = Math.round(gifDelay / ANIMATION_CONSTANTS.GIF_DELAY_PRECISION) * ANIMATION_CONSTANTS.GIF_DELAY_PRECISION
    
    // デバッグ用：実際の遅延値をコンソールに出力
    
    for (let i = 0; i < frameCount; i++) {
      // フレームキャンバスを背景色で塗りつぶす
      frameCtx.fillStyle = settings.backgroundColor || '#FFFFFF'
      frameCtx.fillRect(0, 0, canvasSize, canvasSize)
      
      // 背景の上に各フレームを描画
      drawAnimationFrame(frameCtx, settings, i, frameCount)
      
      // フレームを追加
      gif.addFrame(frameCanvas, { copy: true, delay: gifDelay })
    }
    
    gif.on('finished', (blob) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        resolve(reader.result)
      }
      reader.readAsDataURL(blob)
    })
    
    gif.render()
  })
}

export const drawAnimationFrame = (ctx, settings, frame, totalFrames) => {
  const progress = frame / totalFrames
  const canvasSize = settings.canvasSize || CANVAS_CONFIG.SIZE;
  
  // 画像が後ろの場合は先に描画（独立した処理）
  if (settings.imageData && settings.imagePosition === 'back') {
    drawImageLayer(ctx, settings, progress, canvasSize)
  }
  
  // テキストアニメーションを独立して適用
  ctx.save()
  
  // settings.animation が none の場合はスキップ
  if (settings.animation && settings.animation !== 'none') {
    switch (settings.animation) {
      case 'rainbow':
        // HSL色空間で色を変化させる（色のみの変更、トランスフォームなし）
        break
        
      case 'blink':
        // 点滅 - セカンドカラーと交互に切り替え（色のみの変更、トランスフォームなし）
        break
        
      case 'rotate': {
        // 回転（テキストのみに適用）
        const center = 64
        ctx.translate(center, center)
        ctx.rotate(progress * ANIMATION_CONSTANTS.FULL_ROTATION)
        ctx.translate(-center, -center)
        break
      }
        
      case 'bounce': {
        // バウンス - amplitudeで高さを制御（テキストのみに適用）
        const amplitudeFactor = (settings.animationAmplitude || ANIMATION_CONSTANTS.DEFAULT_AMPLITUDE) / ANIMATION_CONSTANTS.OPACITY_MAX
        const bounceHeight = ANIMATION_CONSTANTS.BOUNCE_HEIGHT_FACTOR * amplitudeFactor  // 128 * 0.15 * amplitude
        const bounce = Math.abs(Math.sin(progress * ANIMATION_CONSTANTS.FULL_ROTATION)) * bounceHeight
        ctx.translate(0, -bounce)
        break
      }
        
      case 'pulse': {
        // パルス（拡大縮小）- amplitudeで変化量を制御（テキストのみに適用）
        const pulseAmplitudeFactor = (settings.animationAmplitude || ANIMATION_CONSTANTS.DEFAULT_AMPLITUDE) / ANIMATION_CONSTANTS.OPACITY_MAX
        const scaleRange = ANIMATION_CONSTANTS.PULSE_SCALE_RANGE * pulseAmplitudeFactor  // 基本の0.2に振幅を乗算
        const scale = 1 + Math.sin(progress * ANIMATION_CONSTANTS.FULL_ROTATION) * scaleRange
        const pulseCenter = 64
        ctx.translate(pulseCenter, pulseCenter)
        ctx.scale(scale, scale)
        ctx.translate(-pulseCenter, -pulseCenter)
        break
      }
        
      case 'glow': {
        // グロー効果 - セカンドカラーで光らせる（テキストのみに適用）
        const glow = Math.abs(Math.sin(progress * ANIMATION_CONSTANTS.FULL_ROTATION))
        ctx.shadowColor = settings.secondaryColor || '#FFD700'
        ctx.shadowBlur = glow * ANIMATION_CONSTANTS.GLOW_BLUR_MAX + ANIMATION_CONSTANTS.GLOW_BLUR_MIN
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
        break
      }
        
      case 'slide': {
        // スライド - amplitudeで距離を制御（テキストのみに適用）
        const slideAmplitudeFactor = (settings.animationAmplitude || ANIMATION_CONSTANTS.DEFAULT_AMPLITUDE) / ANIMATION_CONSTANTS.OPACITY_MAX
        const slideDistance = ANIMATION_CONSTANTS.SLIDE_DISTANCE_FACTOR * slideAmplitudeFactor  // 128 * 0.23 * amplitude
        const slideX = Math.sin(progress * ANIMATION_CONSTANTS.FULL_ROTATION) * slideDistance
        ctx.translate(slideX, 0)
        break
      }
        
      case 'fade':
        // フェード（テキストのみに適用）
        ctx.globalAlpha = (Math.sin(progress * ANIMATION_CONSTANTS.FULL_ROTATION) + 1) / 2
        break
    }
  }
  
  // テキストを描画（アニメーションに応じて色を変更）
  if (settings.animation === 'rainbow') {
    // レインボーアニメーション時はグラデーションを無効化してレインボー色を使用
    const hue = progress * ANIMATION_CONSTANTS.RAINBOW_HUE_FULL
    const modifiedSettings = { 
      ...settings, 
      textColorType: 'solid',  // グラデーションを無効化
      fontColor: `hsl(${hue}, ${ANIMATION_CONSTANTS.HSL_SATURATION}%, ${ANIMATION_CONSTANTS.HSL_LIGHTNESS}%)` 
    }
    renderText(ctx, modifiedSettings, canvasSize)
  } else if (settings.animation === 'blink') {
    // 点滅効果：グラデーションとセカンドカラーで切り替え
    const useSecondary = Math.sin(progress * ANIMATION_CONSTANTS.FULL_ROTATION * ANIMATION_CONSTANTS.BLINK_FREQUENCY) > 0
    if (useSecondary) {
      // セカンドカラーを単色で表示
      const modifiedSettings = { 
        ...settings, 
        textColorType: 'solid',  // グラデーションを無効化
        fontColor: settings.secondaryColor || '#FFD700'
      }
      renderText(ctx, modifiedSettings, canvasSize)
    } else {
      // 通常の設定（グラデーションが設定されていればグラデーションを使用）
      renderText(ctx, settings, canvasSize)
    }
  } else {
    // 通常の設定でテキストを描画
    renderText(ctx, settings, canvasSize)
  }
  
  ctx.restore()
  
  // 画像が前の場合は後に描画（独立した処理）
  if (settings.imageData && settings.imagePosition === 'front') {
    drawImageLayer(ctx, settings, progress, canvasSize)
  }
}


