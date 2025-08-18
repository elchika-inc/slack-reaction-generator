// GIFライブラリを遅延読み込み
let GIF = null;
const loadGIF = async () => {
  if (!GIF) {
    const module = await import('gif.js');
    GIF = module.default;
  }
  return GIF;
};
import { CANVAS_CONFIG, isDecorativeFont, calculatePadding, calculateFontSize } from '../constants/canvasConstants'
import { renderText } from './textRenderer'
import { getOrLoadImage, preloadImage } from './imageCache'

export const generateIconData = async (settings, canvas) => {
  // テキストまたは画像のアニメーションがある場合は専用の処理
  const hasTextAnimation = settings.animation && settings.animation !== 'none';
  const hasImageAnimation = settings.imageData && settings.imageAnimation && settings.imageAnimation !== 'none';
  
  if (hasTextAnimation || hasImageAnimation) {
    // GIF生成用の新しいキャンバスを作成
    const gifCanvas = document.createElement('canvas')
    gifCanvas.width = CANVAS_CONFIG.SIZE
    gifCanvas.height = CANVAS_CONFIG.SIZE
    return await generateAnimatedGIF(gifCanvas, settings)
  }
  
  // 静止画の場合
  if (!canvas) {
    canvas = document.createElement('canvas')
  }
  
  canvas.width = CANVAS_CONFIG.SIZE
  canvas.height = CANVAS_CONFIG.SIZE
  const ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: true })  // アルファチャンネルを明示的に有効化、頻繁な読み込みを最適化
  
  // Clear canvas with transparent background
  ctx.clearRect(0, 0, CANVAS_CONFIG.SIZE, CANVAS_CONFIG.SIZE)
  
  // 透明背景の場合、globalCompositeOperationを設定
  if (settings.backgroundType === 'transparent') {
    ctx.globalCompositeOperation = 'source-over'
  }
  
  // テキストベースのアイコン
  drawTextIcon(ctx, settings)
  
  return canvas.toDataURL('image/png')
}

export const drawTextIcon = (ctx, settings) => {
  // 背景を設定
  // アニメーションがある場合は常に背景色を塗る（GIFは透明非対応）
  // アニメーションがない場合は、backgroundTypeに応じて背景を設定
  const hasTextAnimation = settings.animation && settings.animation !== 'none';
  const hasImageAnimation = settings.imageData && settings.imageAnimation && settings.imageAnimation !== 'none';
  
  if (hasTextAnimation || hasImageAnimation || settings.backgroundType === 'color') {
    ctx.fillStyle = settings.backgroundColor || CANVAS_CONFIG.DEFAULT_BACKGROUND_COLOR
    // 固定サイズで背景を描画
    ctx.fillRect(0, 0, CANVAS_CONFIG.SIZE, CANVAS_CONFIG.SIZE)
  }
  // backgroundType === 'transparent' の場合は何も塗らない（透明背景）
  
  // 画像が後ろの場合は先に描画
  if (settings.imageData && settings.imagePosition === 'back') {
    drawImageLayer(ctx, settings, 0)  // 静止画の場合はprogress=0
  }
  
  // テキストを描画（改行対応）
  renderText(ctx, settings)
  
  // 画像が前の場合は後に描画
  if (settings.imageData && settings.imagePosition === 'front') {
    drawImageLayer(ctx, settings, 0)  // 静止画の場合はprogress=0
  }
}

// 画像レイヤーを描画
const drawImageLayer = (ctx, settings, progress = 0) => {
  if (!settings.imageData) return
  
  // キャッシュから画像を取得
  const img = getOrLoadImage(settings.imageData)
  if (!img) return
  
  // 画像が読み込み済みまたはキャッシュされている場合
  if (img.complete || img.naturalWidth > 0) {
    ctx.save()
    
    // 透過度設定（フェードアニメーションの場合は後で適用）
    let baseAlpha = (settings.imageOpacity || 100) / 100
    
    // 画像のサイズ計算（%ベース）
    const maxSize = CANVAS_CONFIG.SIZE * (settings.imageSize || 50) / 100
    
    // アスペクト比を保持してサイズ計算
    const scale = Math.min(maxSize / img.width, maxSize / img.height)
    const width = img.width * scale
    const height = img.height * scale
    
    // 位置計算（0-100%を0-128pxに変換）
    const centerX = CANVAS_CONFIG.SIZE * (settings.imageX || 50) / 100
    const centerY = CANVAS_CONFIG.SIZE * (settings.imageY || 50) / 100
    
    // 画像アニメーションを適用（画像の中心を基準に）
    if (settings.imageAnimation && settings.imageAnimation !== 'none') {
      // フェードアニメーションの特別処理
      if (settings.imageAnimation === 'fade') {
        const fadeAlpha = (Math.sin(progress * Math.PI * 2) + 1) / 2
        ctx.globalAlpha = baseAlpha * fadeAlpha
      } else {
        ctx.globalAlpha = baseAlpha
        
        // その他のアニメーション（回転、バウンス、パルス、スライド）
        switch (settings.imageAnimation) {
          case 'rotate':
            // 画像自体の中心で回転
            ctx.translate(centerX, centerY)
            ctx.rotate(progress * Math.PI * 2)
            ctx.translate(-centerX, -centerY)
            break
            
          case 'bounce':
            // バウンス（上下に跳ねる）
            const amplitudeFactor = (settings.imageAnimationAmplitude || 50) / 100
            const bounceHeight = 19.2 * amplitudeFactor
            const bounce = Math.abs(Math.sin(progress * Math.PI * 2)) * bounceHeight
            ctx.translate(0, -bounce)
            break
            
          case 'pulse':
            // 画像自体の中心で拡大縮小
            const pulseAmplitudeFactor = (settings.imageAnimationAmplitude || 50) / 100
            const scaleRange = 0.2 * pulseAmplitudeFactor
            const scaleValue = 1 + Math.sin(progress * Math.PI * 2) * scaleRange
            ctx.translate(centerX, centerY)
            ctx.scale(scaleValue, scaleValue)
            ctx.translate(-centerX, -centerY)
            break
            
          case 'slide':
            // スライド（左右に移動）
            const slideAmplitudeFactor = (settings.imageAnimationAmplitude || 50) / 100
            const slideDistance = 29.44 * slideAmplitudeFactor
            const slideX = Math.sin(progress * Math.PI * 2) * slideDistance
            ctx.translate(slideX, 0)
            break
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



const drawImage = async (ctx, settings) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      // 画像をキャンバスにフィットさせる
      const scale = Math.min(128 / img.width, 128 / img.height)
      const width = img.width * scale
      const height = img.height * scale
      const x = (128 - width) / 2
      const y = (128 - height) / 2
      
      ctx.drawImage(img, x, y, width, height)
      resolve()
    }
    img.src = settings.imageData
  })
}

const drawBackground = (ctx, color, shape) => {
  ctx.fillStyle = color
  drawShape(ctx, shape, 'fill')
}

const drawShape = (ctx, shape, method) => {
  ctx.beginPath()
  
  switch (shape) {
    case 'circle':
      ctx.arc(64, 64, 60, 0, Math.PI * 2)
      break
      
    case 'rounded':
      roundRect(ctx, 4, 4, 120, 120, 20)
      break
      
    case 'triangle':
      ctx.moveTo(64, 10)
      ctx.lineTo(118, 118)
      ctx.lineTo(10, 118)
      ctx.closePath()
      break
      
    case 'star':
      drawStar(ctx, 64, 64, 5, 50, 25)
      break
      
    case 'heart':
      drawHeart(ctx, 64, 64, 50)
      break
      
    case 'hexagon':
      drawPolygon(ctx, 64, 64, 6, 60)
      break
      
    case 'speech':
      roundRect(ctx, 10, 10, 100, 80, 15)
      ctx.moveTo(30, 90)
      ctx.lineTo(20, 110)
      ctx.lineTo(50, 90)
      break
      
    case 'square':
    default:
      ctx.rect(4, 4, 120, 120)
      break
  }
  
  if (method === 'fill') {
    ctx.fill()
  } else {
    ctx.stroke()
  }
}

const roundRect = (ctx, x, y, width, height, radius) => {
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
}

const drawStar = (ctx, cx, cy, spikes, outerRadius, innerRadius) => {
  let rot = Math.PI / 2 * 3
  let x = cx
  let y = cy
  const step = Math.PI / spikes
  
  ctx.moveTo(cx, cy - outerRadius)
  
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius
    y = cy + Math.sin(rot) * outerRadius
    ctx.lineTo(x, y)
    rot += step
    
    x = cx + Math.cos(rot) * innerRadius
    y = cy + Math.sin(rot) * innerRadius
    ctx.lineTo(x, y)
    rot += step
  }
  
  ctx.lineTo(cx, cy - outerRadius)
  ctx.closePath()
}

const drawHeart = (ctx, x, y, size) => {
  ctx.moveTo(x, y + size / 4)
  ctx.quadraticCurveTo(x, y, x - size / 4, y)
  ctx.quadraticCurveTo(x - size / 2, y, x - size / 2, y + size / 4)
  ctx.quadraticCurveTo(x - size / 2, y + size / 2, x, y + size * 3 / 4)
  ctx.quadraticCurveTo(x + size / 2, y + size / 2, x + size / 2, y + size / 4)
  ctx.quadraticCurveTo(x + size / 2, y, x + size / 4, y)
  ctx.quadraticCurveTo(x, y, x, y + size / 4)
}

const drawPolygon = (ctx, x, y, sides, radius) => {
  const angle = (Math.PI * 2) / sides
  
  ctx.moveTo(
    x + radius * Math.cos(0),
    y + radius * Math.sin(0)
  )
  
  for (let i = 1; i <= sides; i++) {
    ctx.lineTo(
      x + radius * Math.cos(angle * i),
      y + radius * Math.sin(angle * i)
    )
  }
  
  ctx.closePath()
}

const generateAnimatedGIF = async (canvas, settings) => {
  // GIFライブラリを先に読み込む
  const GIFConstructor = await loadGIF();
  
  return new Promise((resolve) => {
    // 一時キャンバスを作成（各フレーム描画用）
    const frameCanvas = document.createElement('canvas')
    frameCanvas.width = 128
    frameCanvas.height = 128
    const frameCtx = frameCanvas.getContext('2d', { willReadFrequently: true })
    
    // GIFアニメーションでは透明色を使用しない（背景色を持つため）
    const gif = new GIFConstructor({
      workers: 2,
      quality: 10,
      width: 128,
      height: 128,
      workerScript: '/gif.worker.js',
      // transparent オプションを削除（透明色を使用しない）
      repeat: 0,  // ループ再生
      // ビューア互換性を向上させるためのオプション
      dither: false  // ディザリングを無効化してより一貫した再生速度を実現
    })
    
    // フレーム数を30に固定
    const frameCount = 30
    // animationSpeedは既にミリ秒単位で保存されている
    const requestedDelay = settings.animationSpeed || 33
    
    // GIFの遅延値設定
    // 多くのGIFビューアは20ms未満を100msに強制変更するため、最小30msに設定
    let gifDelay = requestedDelay
    if (requestedDelay < 30) {
      gifDelay = 30  // より安全な最小値を30msに設定
    }
    
    // GIF遅延は1/100秒単位（10ms刻み）なので、最も近い値に丸める
    gifDelay = Math.round(gifDelay / 10) * 10
    
    // デバッグ用：実際の遅延値をコンソールに出力
    console.log(`Animation Speed Settings: requested=${requestedDelay}ms, final=${gifDelay}ms, frames=${frameCount}`)
    
    for (let i = 0; i < frameCount; i++) {
      // フレームキャンバスを背景色で塗りつぶす
      frameCtx.fillStyle = settings.backgroundColor || '#FFFFFF'
      frameCtx.fillRect(0, 0, 128, 128)
      
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
  
  // 画像が後ろの場合は先に描画（独立した処理）
  if (settings.imageData && settings.imagePosition === 'back') {
    drawImageLayer(ctx, settings, progress)
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
        
      case 'rotate':
        // 回転（テキストのみに適用）
        const center = 64
        ctx.translate(center, center)
        ctx.rotate(progress * Math.PI * 2)
        ctx.translate(-center, -center)
        break
        
      case 'bounce':
        // バウンス - amplitudeで高さを制御（テキストのみに適用）
        const amplitudeFactor = (settings.animationAmplitude || 50) / 100
        const bounceHeight = 19.2 * amplitudeFactor  // 128 * 0.15 * amplitude
        const bounce = Math.abs(Math.sin(progress * Math.PI * 2)) * bounceHeight
        ctx.translate(0, -bounce)
        break
        
      case 'pulse':
        // パルス（拡大縮小）- amplitudeで変化量を制御（テキストのみに適用）
        const pulseAmplitudeFactor = (settings.animationAmplitude || 50) / 100
        const scaleRange = 0.2 * pulseAmplitudeFactor  // 基本の0.2に振幅を乗算
        const scale = 1 + Math.sin(progress * Math.PI * 2) * scaleRange
        const pulseCenter = 64
        ctx.translate(pulseCenter, pulseCenter)
        ctx.scale(scale, scale)
        ctx.translate(-pulseCenter, -pulseCenter)
        break
        
      case 'glow':
        // グロー効果 - セカンドカラーで光らせる（テキストのみに適用）
        const glow = Math.abs(Math.sin(progress * Math.PI * 2))
        ctx.shadowColor = settings.secondaryColor || '#FFD700'
        ctx.shadowBlur = glow * 30 + 5
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
        break
        
      case 'slide':
        // スライド - amplitudeで距離を制御（テキストのみに適用）
        const slideAmplitudeFactor = (settings.animationAmplitude || 50) / 100
        const slideDistance = 29.44 * slideAmplitudeFactor  // 128 * 0.23 * amplitude
        const slideX = Math.sin(progress * Math.PI * 2) * slideDistance
        ctx.translate(slideX, 0)
        break
        
      case 'fade':
        // フェード（テキストのみに適用）
        ctx.globalAlpha = (Math.sin(progress * Math.PI * 2) + 1) / 2
        break
    }
  }
  
  // テキストを描画（アニメーションに応じて色を変更）
  if (settings.animation === 'rainbow') {
    // レインボーアニメーション時はグラデーションを無効化してレインボー色を使用
    const hue = progress * 360
    const modifiedSettings = { 
      ...settings, 
      textColorType: 'solid',  // グラデーションを無効化
      fontColor: `hsl(${hue}, 100%, 50%)` 
    }
    renderText(ctx, modifiedSettings, { skipBackground: true })
  } else if (settings.animation === 'blink') {
    // 点滅効果：グラデーションとセカンドカラーで切り替え
    const useSecondary = Math.sin(progress * Math.PI * 4) > 0
    if (useSecondary) {
      // セカンドカラーを単色で表示
      const modifiedSettings = { 
        ...settings, 
        textColorType: 'solid',  // グラデーションを無効化
        fontColor: settings.secondaryColor || '#FFD700'
      }
      renderText(ctx, modifiedSettings, { skipBackground: true })
    } else {
      // 通常の設定（グラデーションが設定されていればグラデーションを使用）
      renderText(ctx, settings, { skipBackground: true })
    }
  } else {
    // 通常の設定でテキストを描画
    renderText(ctx, settings, { skipBackground: true })
  }
  
  ctx.restore()
  
  // 画像が前の場合は後に描画（独立した処理）
  if (settings.imageData && settings.imagePosition === 'front') {
    drawImageLayer(ctx, settings, progress)
  }
}

// テキストのみを描画
const drawTextOnly = (ctx, settings) => {
  const lines = settings.text.split('\n').filter(line => line.trim())
  const lineCount = lines.length
  
  if (lineCount === 0) return
  
  // キャンバスサイズを取得
  const canvasSize = ctx.canvas.width
  
  // キャンバスの余白を考慮した描画エリア
  const padding = canvasSize * 0.078
  const maxWidth = canvasSize - (padding * 2)
  const maxHeight = canvasSize - (padding * 2)
  
  // ベースフォントサイズ（キャンバスサイズに応じて調整）
  const baseFontSize = canvasSize * 0.47
  
  ctx.save()
  
  // 現在のトランスフォームを保持しつつ、中心を原点に
  const currentTransform = ctx.getTransform()
  ctx.translate(canvasSize / 2, canvasSize / 2)
  
  // 各行の幅を計測
  ctx.font = `bold ${baseFontSize}px ${settings.fontFamily}`
  const maxLineWidth = Math.max(...lines.map(line => ctx.measureText(line).width))
  
  // テキスト全体の高さを計算
  const lineHeight = baseFontSize * 1.1
  const totalHeight = lineHeight * lineCount
  
  // 横方向と縦方向のスケールを計算
  let scaleX = 1
  let scaleY = 1
  
  if (maxLineWidth > 0) {
    scaleX = maxWidth / maxLineWidth
  }
  if (totalHeight > 0) {
    scaleY = maxHeight / totalHeight
  }
  
  // スケールを適用（縦横独立してスケーリング）
  ctx.scale(scaleX, scaleY)
  
  ctx.fillStyle = settings.fontColor
  ctx.font = `bold ${baseFontSize}px ${settings.fontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  // 各行を描画
  const startY = -(totalHeight / 2) + (lineHeight / 2)
  lines.forEach((line, index) => {
    const y = startY + (index * lineHeight)
    ctx.fillText(line, 0, y)
  })
  
  ctx.restore()
}

// 画像のみを描画
const drawImageOnly = async (ctx, settings) => {
  const img = new Image()
  img.src = settings.imageData
  if (img.complete) {
    const scale = Math.min(128 / img.width, 128 / img.height)
    const width = img.width * scale
    const height = img.height * scale
    const x = (128 - width) / 2
    const y = (128 - height) / 2
    ctx.drawImage(img, x, y, width, height)
  }
}