import GIF from 'gif.js'

export const generateIconData = async (settings, canvas) => {
  // アニメーションがある場合は専用の処理
  if (settings.animation !== 'none') {
    // GIF生成用の新しいキャンバスを作成
    const gifCanvas = document.createElement('canvas')
    gifCanvas.width = 128
    gifCanvas.height = 128
    return await generateAnimatedGIF(gifCanvas, settings)
  }
  
  // 静止画の場合
  if (!canvas) {
    canvas = document.createElement('canvas')
  }
  
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d', { alpha: true })  // アルファチャンネルを明示的に有効化
  
  // Clear canvas with transparent background
  ctx.clearRect(0, 0, 128, 128)
  
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
  if (settings.animation !== 'none' || settings.backgroundType === 'color') {
    ctx.fillStyle = settings.backgroundColor || '#FFFFFF'
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  }
  // backgroundType === 'transparent' の場合は何も塗らない（透明背景）
  
  // テキストを描画（改行対応）
  drawTextWithLineBreaks(ctx, settings)
}

// 改行対応のテキスト描画
const drawTextWithLineBreaks = (ctx, settings) => {
  const lines = settings.text.split('\n').filter(line => line.trim())
  const lineCount = lines.length
  
  if (lineCount === 0) return
  
  // キャンバスサイズを取得
  const canvasSize = ctx.canvas.width
  
  // フォントファミリーはそのまま使用（引用符も含めて）
  const fontFamily = settings.fontFamily
  
  // 装飾的フォントの判定
  const isDecorativeFont = fontFamily.includes('Pacifico') || fontFamily.includes('Caveat')
  
  // キャンバスの余白を考慮した描画エリア（装飾的フォントはより余白を取る）
  const padding = isDecorativeFont ? canvasSize * 0.1 : canvasSize * 0.02  // 装飾的フォントは10%、通常は2%
  const maxWidth = canvasSize - (padding * 2)
  const maxHeight = canvasSize - (padding * 2)
  
  // ベースフォントサイズ（装飾的フォントは小さめに）
  const baseFontSize = isDecorativeFont ? canvasSize * 0.6 : canvasSize * 0.8  // 装飾的フォントは60%、通常は80%
  
  ctx.save()
  ctx.translate(canvasSize / 2, canvasSize / 2) // 中心を原点に
  
  // 各行の幅を計測
  // 装飾的フォントにはnormalウェイトを使用
  let fontWeight = 'bold'
  if (fontFamily.includes('M PLUS') || fontFamily.includes('M+')) {
    fontWeight = '900'
  } else if (isDecorativeFont) {
    fontWeight = 'normal'  // 装飾的フォントはnormalウェイト
  }
  ctx.font = `${fontWeight} ${baseFontSize}px ${fontFamily}`
  const maxLineWidth = Math.max(...lines.map(line => ctx.measureText(line).width))
  
  // テキスト全体の高さを計算（装飾的フォントは行間を広く）
  const lineHeight = isDecorativeFont ? baseFontSize * 1.1 : baseFontSize * 0.9
  const totalHeight = lineHeight * lineCount
  
  // 縦横独立でスケールを計算（枠いっぱいに表示）
  let scaleX = 1
  let scaleY = 1
  
  if (maxLineWidth > 0) {
    scaleX = maxWidth / maxLineWidth
  }
  if (totalHeight > 0) {
    scaleY = maxHeight / totalHeight
  }
  
  // 装飾的フォントはスケールをさらに制限（はみ出し防止）
  if (isDecorativeFont) {
    scaleX = Math.min(scaleX, 0.9)  // 最大90%にスケール制限
    scaleY = Math.min(scaleY, 0.9)
  }
  
  // 縦横独立でスケールを適用（アスペクト比は崩れる）
  ctx.scale(scaleX, scaleY)
  
  // グラデーションまたは単色を設定
  if (settings.textColorType === 'gradient') {
    // グラデーションを作成
    let gradient
    if (settings.gradientDirection === 'horizontal') {
      // 左右グラデーション（テキストの幅に合わせる）
      gradient = ctx.createLinearGradient(-maxLineWidth/2, 0, maxLineWidth/2, 0)
    } else {
      // 上下グラデーション（テキストの高さに合わせる）
      gradient = ctx.createLinearGradient(0, -totalHeight/2, 0, totalHeight/2)
    }
    gradient.addColorStop(0, settings.gradientColor1 || settings.fontColor)
    gradient.addColorStop(1, settings.gradientColor2 || settings.secondaryColor || '#FFD700')
    ctx.fillStyle = gradient
  } else {
    // 単色
    ctx.fillStyle = settings.fontColor
  }
  
  ctx.font = `${fontWeight} ${baseFontSize}px ${fontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  // 各行を描画（完全に中央に配置）
  const lineGap = lineHeight - baseFontSize  // 実際の行間
  const actualTextHeight = baseFontSize * lineCount + lineGap * (lineCount - 1)
  const startY = -(actualTextHeight / 2) + (baseFontSize / 2)
  
  lines.forEach((line, index) => {
    const y = startY + (index * lineHeight)
    ctx.fillText(line, 0, y)
  })
  
  ctx.restore()
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
  return new Promise((resolve) => {
    // 一時キャンバスを作成（各フレーム描画用）
    const frameCanvas = document.createElement('canvas')
    frameCanvas.width = 128
    frameCanvas.height = 128
    const frameCtx = frameCanvas.getContext('2d')
    
    // GIFアニメーションでは透明色を使用しない（背景色を持つため）
    const gif = new GIF({
      workers: 2,
      quality: 10,
      width: 128,
      height: 128,
      workerScript: '/gif.worker.js',
      // transparent オプションを削除（透明色を使用しない）
      repeat: 0  // ループ再生
    })
    
    // フレーム数を30に固定
    const frameCount = 30
    // animationSpeedは既にミリ秒単位で保存されている
    const requestedDelay = settings.animationSpeed || 33
    
    // GIFビューアには最小遅延の制限がある（通常20ms）
    // 20ms未満の値は無視されて100msになる可能性がある
    // 安全な範囲: 20ms以上
    let gifDelay = requestedDelay
    if (requestedDelay < 20) {
      // 20ms未満の場合は20msに設定（これ以下だと100msになる可能性）
      gifDelay = 20
      console.warn(`警告: 要求された速度${requestedDelay}msは速すぎます。20msに調整しました。`)
    }
    
    // デバッグ用ログ
    console.log('GIF生成設定:', {
      frameCount,
      requestedDelay,
      actualDelay: gifDelay,
      expectedFPS: (1000 / gifDelay).toFixed(1)
    })
    
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
  
  // キャンバスサイズを取得
  const canvasSize = ctx.canvas.width
  
  // キャンバスをクリアしない（白背景を維持）
  // ctx.clearRect(0, 0, canvasSize, canvasSize)
  
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
      // 点滅 - セカンドカラーと交互に切り替え
      // Math.sin(progress * Math.PI * 4) > 0 でタイミングを判定
      // セカンドカラーを使用する場合は後でfontColorを変更
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
      // グロー効果 - セカンドカラーで光らせる
      const glow = Math.abs(Math.sin(progress * Math.PI * 2))
      ctx.shadowColor = settings.secondaryColor || '#FFD700'
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
  // アニメーションに応じて色を変更
  if (settings.animation === 'rainbow') {
    const hue = progress * 360
    const modifiedSettings = { ...settings, fontColor: `hsl(${hue}, 100%, 50%)` }
    drawTextOnly(ctx, modifiedSettings)
  } else if (settings.animation === 'blink') {
    // 点滅効果：セカンドカラーと交互に切り替え
    const useSecondary = Math.sin(progress * Math.PI * 4) > 0
    const modifiedSettings = { 
      ...settings, 
      fontColor: useSecondary ? settings.fontColor : (settings.secondaryColor || '#FFD700')
    }
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
  
  // フォントファミリーはそのまま使用（引用符も含めて）
  const fontFamily = settings.fontFamily
  
  // 装飾的フォントの判定
  const isDecorativeFont = fontFamily.includes('Pacifico') || fontFamily.includes('Caveat')
  
  // キャンバスの余白を考慮した描画エリア（装飾的フォントはより余白を取る）
  const padding = isDecorativeFont ? canvasSize * 0.1 : canvasSize * 0.02  // 装飾的フォントは10%、通常は2%
  const maxWidth = canvasSize - (padding * 2)
  const maxHeight = canvasSize - (padding * 2)
  
  // ベースフォントサイズ（装飾的フォントは小さめに）
  const baseFontSize = isDecorativeFont ? canvasSize * 0.6 : canvasSize * 0.8  // 装飾的フォントは60%、通常は80%
  
  ctx.save()
  
  // 現在のトランスフォームを保持しつつ、中心を原点に
  const currentTransform = ctx.getTransform()
  ctx.translate(canvasSize / 2, canvasSize / 2)
  
  // 各行の幅を計測
  // 装飾的フォントにはnormalウェイトを使用
  let fontWeight = 'bold'
  if (fontFamily.includes('M PLUS') || fontFamily.includes('M+')) {
    fontWeight = '900'
  } else if (isDecorativeFont) {
    fontWeight = 'normal'  // 装飾的フォントはnormalウェイト
  }
  ctx.font = `${fontWeight} ${baseFontSize}px ${fontFamily}`
  const maxLineWidth = Math.max(...lines.map(line => ctx.measureText(line).width))
  
  // テキスト全体の高さを計算（装飾的フォントは行間を広く）
  const lineHeight = isDecorativeFont ? baseFontSize * 1.1 : baseFontSize * 0.9
  const totalHeight = lineHeight * lineCount
  
  // 縦横独立でスケールを計算（枠いっぱいに表示）
  let scaleX = 1
  let scaleY = 1
  
  if (maxLineWidth > 0) {
    scaleX = maxWidth / maxLineWidth
  }
  if (totalHeight > 0) {
    scaleY = maxHeight / totalHeight
  }
  
  // 装飾的フォントはスケールをさらに制限（はみ出し防止）
  if (isDecorativeFont) {
    scaleX = Math.min(scaleX, 0.9)  // 最大90%にスケール制限
    scaleY = Math.min(scaleY, 0.9)
  }
  
  // 縦横独立でスケールを適用（アスペクト比は崩れる）
  ctx.scale(scaleX, scaleY)
  
  // グラデーションまたは単色を設定
  if (settings.textColorType === 'gradient') {
    // グラデーションを作成
    let gradient
    if (settings.gradientDirection === 'horizontal') {
      // 左右グラデーション（テキストの幅に合わせる）
      gradient = ctx.createLinearGradient(-maxLineWidth/2, 0, maxLineWidth/2, 0)
    } else {
      // 上下グラデーション（テキストの高さに合わせる）
      gradient = ctx.createLinearGradient(0, -totalHeight/2, 0, totalHeight/2)
    }
    gradient.addColorStop(0, settings.gradientColor1 || settings.fontColor)
    gradient.addColorStop(1, settings.gradientColor2 || settings.secondaryColor || '#FFD700')
    ctx.fillStyle = gradient
  } else {
    // 単色
    ctx.fillStyle = settings.fontColor
  }
  
  ctx.font = `${fontWeight} ${baseFontSize}px ${fontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  // 各行を描画（完全に中央に配置）
  const lineGap = lineHeight - baseFontSize  // 実際の行間
  const actualTextHeight = baseFontSize * lineCount + lineGap * (lineCount - 1)
  const startY = -(actualTextHeight / 2) + (baseFontSize / 2)
  
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