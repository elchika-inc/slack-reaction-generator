// Canvas関連の定数
export const CANVAS_CONFIG = {
  // サイズ
  SIZE: 128,
  
  // パディング設定（パーセンテージ）
  DECORATIVE_FONT_PADDING_RATIO: 0.1,    // 10%
  NORMAL_FONT_PADDING_RATIO: 0.02,       // 2%
  
  // フォントサイズ設定（パーセンテージ）
  DECORATIVE_FONT_SIZE_RATIO: 0.6,       // 60%
  NORMAL_FONT_SIZE_RATIO: 0.8,           // 80%
  
  // グラデーション角度（ラジアン）
  GRADIENT_ANGLE_VERTICAL: 0,
  GRADIENT_ANGLE_HORIZONTAL: Math.PI / 2,
  
  // デフォルトカラー
  DEFAULT_BACKGROUND_COLOR: '#FFFFFF',
  DEFAULT_SECONDARY_COLOR: '#FFD700',
  
  // アニメーション設定
  DEFAULT_ANIMATION_SPEED: 50,
  MIN_ANIMATION_SPEED: 30,  // GIF互換性のため30msに変更
  MAX_ANIMATION_SPEED: 100,
  ANIMATION_SPEED_INVERT_BASE: 130,      // UIの速度スライダー逆転用（30ms基準に調整）
  
  // フォントファミリー判定
  DECORATIVE_FONTS: ['Pacifico', 'Caveat'],
  
  // GIF設定
  GIF_QUALITY: 10,
  GIF_WORKERS: 2,
  MAX_GIF_SIZE_KB: 128,
  
  // 角度変換
  DEGREE_TO_RADIAN: Math.PI / 180,
  
  // スライドアニメーション範囲
  SLIDE_RANGE: 0.2,  // 20%の範囲でスライド
}

// アニメーション速度ラベル
export const ANIMATION_SPEED_LABELS = {
  ULTRA_FAST: { maxMs: 20, label: '超高速' },
  FAST: { maxMs: 30, label: '高速' },
  NORMAL: { maxMs: 40, label: '標準' },
  SLOW: { maxMs: 60, label: '低速' },
  ULTRA_SLOW: { maxMs: Infinity, label: '超低速' },
}

// アニメーションタイプ
export const ANIMATION_TYPES = {
  NONE: 'none',
  RAINBOW: 'rainbow',
  BLINK: 'blink',
  ROTATE: 'rotate',
  BOUNCE: 'bounce',
  PULSE: 'pulse',
  GLOW: 'glow',
  SLIDE: 'slide',
  FADE: 'fade',
}

// ヘルパー関数
export const isDecorativeFont = (fontFamily) => {
  return CANVAS_CONFIG.DECORATIVE_FONTS.some(font => fontFamily.includes(font))
}

export const getSpeedLabel = (ms) => {
  for (const [, config] of Object.entries(ANIMATION_SPEED_LABELS)) {
    if (ms <= config.maxMs) {
      return config.label
    }
  }
  return ANIMATION_SPEED_LABELS.ULTRA_SLOW.label
}

export const calculateFPS = (ms) => {
  return (1000 / ms).toFixed(1)
}

export const calculatePadding = (size, isDecorative) => {
  const ratio = isDecorative 
    ? CANVAS_CONFIG.DECORATIVE_FONT_PADDING_RATIO 
    : CANVAS_CONFIG.NORMAL_FONT_PADDING_RATIO
  return size * ratio
}

export const calculateFontSize = (size, isDecorative) => {
  const ratio = isDecorative
    ? CANVAS_CONFIG.DECORATIVE_FONT_SIZE_RATIO
    : CANVAS_CONFIG.NORMAL_FONT_SIZE_RATIO
  return size * ratio
}