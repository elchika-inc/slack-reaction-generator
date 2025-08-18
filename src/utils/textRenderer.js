import { CANVAS_CONFIG, isDecorativeFont, calculatePadding, calculateFontSize } from '../constants/canvasConstants'

// 統一されたテキスト描画関数
export const renderText = (ctx, settings) => {
  
  const lines = settings.text.split('\n').filter(line => line.trim())
  const lineCount = lines.length
  
  if (lineCount === 0) return
  
  // キャンバスサイズ
  const canvasSize = CANVAS_CONFIG.SIZE
  
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
  
  // フォントウェイトの設定
  let fontWeight = 'bold'
  if (fontFamily.includes('M PLUS') || fontFamily.includes('M+')) {
    fontWeight = '900'
  } else if (isDecorative) {
    fontWeight = 'normal'  // 装飾的フォントはnormalウェイト
  }
  
  // 各行の幅を計測
  ctx.font = `${fontWeight} ${baseFontSize}px ${fontFamily}`
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