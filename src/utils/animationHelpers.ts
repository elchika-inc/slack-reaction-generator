// Animation helpers - 各種アニメーション計算を統一化

// アニメーション定数
export const ANIMATION_CONSTANTS = {
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
};

// 振幅係数を計算する統一関数
export const getAmplitudeFactor = (amplitude) => {
  return (amplitude || ANIMATION_CONSTANTS.DEFAULT_AMPLITUDE) / ANIMATION_CONSTANTS.OPACITY_MAX;
};

// 汎用アニメーション値計算関数
export const calculateAnimationValue = (type, progress, amplitude = ANIMATION_CONSTANTS.DEFAULT_AMPLITUDE) => {
  const amplitudeFactor = getAmplitudeFactor(amplitude);
  
  switch (type) {
    case 'bounce':
      return Math.abs(Math.sin(progress * ANIMATION_CONSTANTS.FULL_ROTATION)) * 
             ANIMATION_CONSTANTS.BOUNCE_HEIGHT_FACTOR * amplitudeFactor;
    
    case 'pulse':
      return 1 + Math.sin(progress * ANIMATION_CONSTANTS.FULL_ROTATION) * 
             ANIMATION_CONSTANTS.PULSE_SCALE_RANGE * amplitudeFactor;
    
    case 'slide':
      return Math.sin(progress * ANIMATION_CONSTANTS.FULL_ROTATION) * 
             ANIMATION_CONSTANTS.SLIDE_DISTANCE_FACTOR * amplitudeFactor;
    
    case 'fade':
      return (Math.sin(progress * ANIMATION_CONSTANTS.FULL_ROTATION) + 1) / 2;
    
    case 'rotate':
      return progress * ANIMATION_CONSTANTS.FULL_ROTATION;
    
    case 'glow':
      return Math.abs(Math.sin(progress * ANIMATION_CONSTANTS.FULL_ROTATION)) * 
             ANIMATION_CONSTANTS.GLOW_BLUR_MAX + ANIMATION_CONSTANTS.GLOW_BLUR_MIN;
    
    case 'rainbow':
      return progress * ANIMATION_CONSTANTS.RAINBOW_HUE_FULL;
    
    case 'blink':
      return Math.sin(progress * ANIMATION_CONSTANTS.FULL_ROTATION * ANIMATION_CONSTANTS.BLINK_FREQUENCY) > 0;
    
    default:
      return 0;
  }
};

// テキストアニメーション適用関数
export const applyTextAnimation = (ctx, animationType, progress, amplitude, secondaryColor) => {
  if (!animationType || animationType === 'none') return;

  switch (animationType) {
    case 'rotate': {
      const center = 64;
      ctx.translate(center, center);
      ctx.rotate(calculateAnimationValue('rotate', progress));
      ctx.translate(-center, -center);
      break;
    }
    
    case 'bounce': {
      const bounce = calculateAnimationValue('bounce', progress, amplitude);
      ctx.translate(0, -bounce);
      break;
    }
    
    case 'pulse': {
      const scale = calculateAnimationValue('pulse', progress, amplitude);
      const center = 64;
      ctx.translate(center, center);
      ctx.scale(scale, scale);
      ctx.translate(-center, -center);
      break;
    }
    
    case 'glow': {
      const blur = calculateAnimationValue('glow', progress);
      ctx.shadowColor = secondaryColor || '#FFD700';
      ctx.shadowBlur = blur;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      break;
    }
    
    case 'slide': {
      const slideX = calculateAnimationValue('slide', progress, amplitude);
      ctx.translate(slideX, 0);
      break;
    }
    
    case 'fade': {
      const alpha = calculateAnimationValue('fade', progress);
      ctx.globalAlpha = alpha;
      break;
    }
  }
};

// 画像アニメーション適用関数
export const applyImageAnimation = (ctx, animationType, progress, amplitude, centerX, centerY, baseAlpha) => {
  if (!animationType || animationType === 'none') {
    ctx.globalAlpha = baseAlpha;
    return;
  }

  switch (animationType) {
    case 'fade': {
      const fadeAlpha = calculateAnimationValue('fade', progress);
      ctx.globalAlpha = baseAlpha * fadeAlpha;
      break;
    }
    
    case 'rotate': {
      ctx.globalAlpha = baseAlpha;
      ctx.translate(centerX, centerY);
      ctx.rotate(calculateAnimationValue('rotate', progress));
      ctx.translate(-centerX, -centerY);
      break;
    }
    
    case 'bounce': {
      ctx.globalAlpha = baseAlpha;
      const bounce = calculateAnimationValue('bounce', progress, amplitude);
      ctx.translate(0, -bounce);
      break;
    }
    
    case 'pulse': {
      ctx.globalAlpha = baseAlpha;
      const scale = calculateAnimationValue('pulse', progress, amplitude);
      ctx.translate(centerX, centerY);
      ctx.scale(scale, scale);
      ctx.translate(-centerX, -centerY);
      break;
    }
    
    case 'slide': {
      ctx.globalAlpha = baseAlpha;
      const slideX = calculateAnimationValue('slide', progress, amplitude);
      ctx.translate(slideX, 0);
      break;
    }
    
    default:
      ctx.globalAlpha = baseAlpha;
  }
};