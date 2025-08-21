import { CANVAS_CONFIG, isDecorativeFont, calculatePadding, calculateFontSize } from '../constants/canvasConstants'

// 統一されたテキスト描画関数
export const renderText = (ctx, settings, canvasSize = CANVAS_CONFIG.SIZE) => {
  
  const lines = settings.text.split('\n').filter(line => line.trim())
  const lineCount = lines.length
  
  if (lineCount === 0) return
  
  // フォントファミリー
  const fontFamily = settings.fontFamily
  
  // 装飾的フォントの判定
  const isDecorative = isDecorativeFont(fontFamily)
  
  // キャンバスの余白を考慮した描画エリア
  const padding = calculatePadding(canvasSize, isDecorative)
  const maxWidth = canvasSize - (padding * 2)
  const maxHeight = canvasSize - (padding * 2)
  
  // ベースフォントサイズ
  const baseFontSize = calculateFontSize(canvasSize, isDecorative)
  
  ctx.save()
  ctx.translate(canvasSize / 2, canvasSize / 2) // 中心を原点に
  
  // フォントスタイルの設定
  let fontWeight = settings.fontWeight || 'bold'
  let fontStyle = settings.fontStyle || 'normal'
  
  // フォントファミリーに応じたウェイト調整
  if (fontWeight === 'bold') {
    if (fontFamily.includes('M PLUS') || fontFamily.includes('M+')) {
      fontWeight = '900'
    } else if (isDecorative) {
      fontWeight = 'normal'  // 装飾的フォントはnormalウェイト
    }
  }
  
  // フォントスタイル文字列の構築
  const fontStyleStr = fontStyle === 'italic' ? 'italic ' : ''
  
  // 各行の幅を計測
  ctx.font = `${fontStyleStr}${fontWeight} ${baseFontSize}px ${fontFamily}`
  const maxLineWidth = Math.max(...lines.map(line => ctx.measureText(line).width))
  
  // テキスト全体の高さを計算（装飾的フォントは行間を広く）
  const lineHeight = isDecorative ? baseFontSize * 1.1 : baseFontSize * 0.9
  const totalHeight = lineHeight * lineCount
  
  // 縦横独立でスケールを計算（文字を枠いっぱいに表示）
  let scaleX = 1
  let scaleY = 1
  
  if (maxLineWidth > 0) {
    scaleX = maxWidth / maxLineWidth
  }
  if (totalHeight > 0) {
    scaleY = maxHeight / totalHeight
  }
  
  // 装飾的フォントはスケールをさらに制限（はみ出し防止）
  if (isDecorative) {
    scaleX = Math.min(scaleX, 0.9)  // 最大90%にスケール制限
    scaleY = Math.min(scaleY, 0.9)
  }
  
  // スケール適用前の座標情報を保存（装飾用）
  const linePositions = []
  const lineMetrics = []
  
  // 実際のテキスト高さを計算
  const lineGap = lineHeight - baseFontSize
  const actualTextHeight = baseFontSize * lineCount + lineGap * (lineCount - 1)
  const startY = -(actualTextHeight / 2) + (baseFontSize / 2)
  
  lines.forEach((line, index) => {
    const y = startY + (index * lineHeight)
    linePositions.push(y)
    lineMetrics.push(ctx.measureText(line))
  })
  
  // 縦横独立でスケールを適用（文字を枠いっぱいに表示）
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
    gradient.addColorStop(1, settings.gradientColor2 || settings.secondaryColor || CANVAS_CONFIG.DEFAULT_SECONDARY_COLOR)
    ctx.fillStyle = gradient
  } else {
    // 単色
    ctx.fillStyle = settings.fontColor
  }
  
  // フォント設定にtext-decorationを追加
  let fontDecoration = ''
  if (settings.textDecoration === 'underline') {
    fontDecoration = 'underline'
  } else if (settings.textDecoration === 'line-through') {
    fontDecoration = 'line-through'
  }
  
  // Canvas 2D APIにはtext-decorationがないため、手動で装飾線を描画
  ctx.font = `${fontStyleStr}${fontWeight} ${baseFontSize}px ${fontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  // テキストを描画
  lines.forEach((line, index) => {
    const y = linePositions[index]
    ctx.fillText(line, 0, y)
    
    // 打ち消し線の描画
    if (settings.textLineThrough) {
      const metrics = lineMetrics[index]
      ctx.save()
      
      // 打ち消し線の色をテキストと同じにする
      if (settings.textColorType === 'gradient') {
        ctx.strokeStyle = ctx.fillStyle
      } else {
        ctx.strokeStyle = settings.fontColor
      }
      
      // 線の太さを適切に設定
      ctx.lineWidth = Math.max(1, baseFontSize * 0.06)
      
      // 打ち消し線を描画（テキストの中央）
      const lineY = y - baseFontSize * 0.05
      ctx.beginPath()
      ctx.moveTo(-metrics.width / 2, lineY)
      ctx.lineTo(metrics.width / 2, lineY)
      ctx.stroke()
      
      ctx.restore()
    }
  })
  
  ctx.restore()
}