import { GIFEncoder, quantize, applyPalette } from 'gifenc'

export const generateIconData = async (settings, canvas) => {
  // アニメーションがある場合は専用の処理
  if (settings.animation !== 'none') {
    // GIF生成用の新しいキャンバスを作成
    const gifCanvas = document.createElement('canvas')
    gifCanvas.width = 128
    gifCanvas.height = 128
    return await generateAnimatedGIFWithGifenc(gifCanvas, settings)
  }
  
  // 静止画の場合
  if (!canvas) {
    canvas = document.createElement('canvas')
  }
  
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  
  // Clear canvas
  ctx.clearRect(0, 0, 128, 128)
  
  // テキストベースのアイコン
  drawTextIcon(ctx, settings)
  
  return canvas.toDataURL('image/png')
}

export const drawTextIcon = (ctx, settings) => {
  // テキストを描画（改行対応、常に透明背景）
  drawTextWithLineBreaks(ctx, settings)
}

// 改行対応のテキスト描画
const drawTextWithLineBreaks = (ctx, settings) => {
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
  ctx.translate(canvasSize / 2, canvasSize / 2) // 中心を原点に
  
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

const generateAnimatedGIFWithGifenc = async (canvas, settings) => {
  const frameCount = 30
  const delayMs = settings.animationSpeed === 'slow' ? 50 : 
                  settings.animationSpeed === 'fast' ? 20 : 33
  
  // gifencでGIFエンコーダーを作成
  const gif = GIFEncoder()
  
  // 一時キャンバスを作成（各フレーム描画用）
  const frameCanvas = document.createElement('canvas')
  frameCanvas.width = 128
  frameCanvas.height = 128
  const frameCtx = frameCanvas.getContext('2d', { willReadFrequently: true })
  
  // すべてのフレームを収集
  const frames = []
  
  for (let i = 0; i < frameCount; i++) {
    // フレームキャンバスを白で塗りつぶす（GIFの透明処理のため）
    frameCtx.fillStyle = '#FFFFFF'
    frameCtx.fillRect(0, 0, 128, 128)
    
    // 各フレームを描画
    drawAnimationFrame(frameCtx, settings, i, frameCount)
    
    // ImageDataを取得
    const imageData = frameCtx.getImageData(0, 0, 128, 128)
    frames.push({
      data: imageData.data,
      delay: delayMs
    })
  }
  
  // 最初のフレームから色パレットを生成
  const firstFrame = frames[0].data
  const palette = quantize(firstFrame, 256, { format: 'rgba4444' })
  
  // GIFストリームを開始
  const format = 'rgba4444'
  gif.writeHeader()
  
  // 白色のインデックスを透明色として使用
  let transparentIndex = -1
  for (let i = 0; i < palette.length; i++) {
    // 白色（またはそれに近い色）を探す
    const color = palette[i]
    const r = (color >> 12) & 0xF
    const g = (color >> 8) & 0xF
    const b = (color >> 4) & 0xF
    if (r >= 0xE && g >= 0xE && b >= 0xE) {
      transparentIndex = i
      break
    }
  }
  
  // 最初のフレームを追加（applyPaletteを使用）
  const indexedFirstFrame = applyPalette(firstFrame, palette, format)
  gif.writeFrame(indexedFirstFrame, 128, 128, { 
    palette,
    delay: frames[0].delay,
    transparent: transparentIndex >= 0,
    transparentIndex: transparentIndex >= 0 ? transparentIndex : undefined,
    disposal: 2  // 前のフレームをクリア
  })
  
  // 残りのフレームを追加
  for (let i = 1; i < frames.length; i++) {
    const indexedFrame = applyPalette(frames[i].data, palette, format)
    gif.writeFrame(indexedFrame, 128, 128, {
      delay: frames[i].delay,
      transparent: transparentIndex >= 0,
      transparentIndex: transparentIndex >= 0 ? transparentIndex : undefined,
      disposal: 2
    })
  }
  
  // GIFストリームを終了
  gif.finish()
  
  // Uint8ArrayをBlobに変換してData URLを作成
  const buffer = gif.bytes()
  const blob = new Blob([buffer], { type: 'image/gif' })
  
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.readAsDataURL(blob)
  })
}

export const drawAnimationFrame = (ctx, settings, frame, totalFrames) => {
  const progress = frame / totalFrames
  
  // キャンバスサイズを取得
  const canvasSize = ctx.canvas.width
  
  // キャンバスをクリア
  ctx.clearRect(0, 0, canvasSize, canvasSize)
  
  // テキストまたは画像にアニメーションを適用
  ctx.save()
  
  switch (settings.animation) {
    case 'rainbow':
      // HSL色空間で色を変化させる
      const hue = progress * 360
      const color = `hsl(${hue}, 100%, 50%)`
      // オリジナルのfontColorを上書き
      break
      
    case 'blink':
      // 点滅
      ctx.globalAlpha = Math.sin(progress * Math.PI * 4) > 0 ? 1 : 0.2
      break
      
    case 'rotate':
      // 回転
      const center = canvasSize / 2
      ctx.translate(center, center)
      ctx.rotate(progress * Math.PI * 2)
      ctx.translate(-center, -center)
      break
      
    case 'bounce':
      // バウンス
      const bounceHeight = canvasSize * 0.15
      const bounce = Math.abs(Math.sin(progress * Math.PI * 2)) * bounceHeight
      ctx.translate(0, -bounce)
      break
      
    case 'pulse':
      // パルス（拡大縮小）
      const scale = 1 + Math.sin(progress * Math.PI * 2) * 0.2
      const pulseCenter = canvasSize / 2
      ctx.translate(pulseCenter, pulseCenter)
      ctx.scale(scale, scale)
      ctx.translate(-pulseCenter, -pulseCenter)
      break
      
    case 'glow':
      // グロー効果
      const glow = Math.abs(Math.sin(progress * Math.PI * 2))
      ctx.shadowColor = settings.fontColor
      ctx.shadowBlur = glow * 30 + 5
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      break
      
    case 'slide':
      // スライド
      const slideDistance = canvasSize * 0.23
      const slideX = Math.sin(progress * Math.PI * 2) * slideDistance
      ctx.translate(slideX, 0)
      break
      
    case 'fade':
      // フェード
      ctx.globalAlpha = (Math.sin(progress * Math.PI * 2) + 1) / 2
      break
  }
  
  // テキストを描画
  // レインボーアニメーションの場合は色を変更
  if (settings.animation === 'rainbow') {
    const hue = progress * 360
    const modifiedSettings = { ...settings, fontColor: `hsl(${hue}, 100%, 50%)` }
    drawTextOnly(ctx, modifiedSettings)
  } else {
    drawTextOnly(ctx, settings)
  }
  
  ctx.restore()
}

// テキストのみを描画（背景なし、アニメーション用）
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