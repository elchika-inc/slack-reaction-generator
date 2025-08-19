// 設定の型定義と構造化

export const SettingCategories = {
  BASIC: 'basic',
  ANIMATION: 'animation', 
  IMAGE: 'image',
  OPTIMIZATION: 'optimization'
};

// デフォルト設定の構造化
export const createDefaultSettings = () => {
  const getRandomColor = () => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FD79A8', '#A29BFE',
      '#6C5CE7', '#00B894', '#FDCB6E', '#E17055', '#74B9FF',
      '#55A3FF', '#00CEC9'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return {
    // 基本設定
    basic: {
      text: 'いいかも',
      fontSize: 60,
      fontFamily: '"Noto Sans JP", sans-serif',
      fontColor: getRandomColor(),
      textColorType: 'solid',
      gradientColor1: getRandomColor(),
      gradientColor2: getRandomColor(), 
      gradientDirection: 'vertical',
      backgroundType: 'transparent',
      backgroundColor: '#FFFFFF'
    },

    // アニメーション設定
    animation: {
      animation: 'none',
      animationSpeed: 20,
      animationAmplitude: 50,
      secondaryColor: '#FFD700'
    },

    // 画像設定
    image: {
      imageData: null,
      imageX: 50,
      imageY: 50,
      imageSize: 50,
      imageOpacity: 100,
      imagePosition: 'back',
      imageAnimation: 'none',
      imageAnimationAmplitude: 50
    },

    // 最適化設定
    optimization: {
      canvasSize: 128,
      pngQuality: 85,
      gifQuality: 20,
      gifFrames: 30
    }
  };
};

// フラット化された設定を構造化設定に変換
export const structureSettings = (flatSettings) => {
  const structured = createDefaultSettings();
  
  // 基本設定
  if (flatSettings.text !== undefined) structured.basic.text = flatSettings.text;
  if (flatSettings.fontSize !== undefined) structured.basic.fontSize = flatSettings.fontSize;
  if (flatSettings.fontFamily !== undefined) structured.basic.fontFamily = flatSettings.fontFamily;
  if (flatSettings.fontColor !== undefined) structured.basic.fontColor = flatSettings.fontColor;
  if (flatSettings.textColorType !== undefined) structured.basic.textColorType = flatSettings.textColorType;
  if (flatSettings.gradientColor1 !== undefined) structured.basic.gradientColor1 = flatSettings.gradientColor1;
  if (flatSettings.gradientColor2 !== undefined) structured.basic.gradientColor2 = flatSettings.gradientColor2;
  if (flatSettings.gradientDirection !== undefined) structured.basic.gradientDirection = flatSettings.gradientDirection;
  if (flatSettings.backgroundType !== undefined) structured.basic.backgroundType = flatSettings.backgroundType;
  if (flatSettings.backgroundColor !== undefined) structured.basic.backgroundColor = flatSettings.backgroundColor;

  // アニメーション設定
  if (flatSettings.animation !== undefined) structured.animation.animation = flatSettings.animation;
  if (flatSettings.animationSpeed !== undefined) structured.animation.animationSpeed = flatSettings.animationSpeed;
  if (flatSettings.animationAmplitude !== undefined) structured.animation.animationAmplitude = flatSettings.animationAmplitude;
  if (flatSettings.secondaryColor !== undefined) structured.animation.secondaryColor = flatSettings.secondaryColor;

  // 画像設定
  if (flatSettings.imageData !== undefined) structured.image.imageData = flatSettings.imageData;
  if (flatSettings.imageX !== undefined) structured.image.imageX = flatSettings.imageX;
  if (flatSettings.imageY !== undefined) structured.image.imageY = flatSettings.imageY;
  if (flatSettings.imageSize !== undefined) structured.image.imageSize = flatSettings.imageSize;
  if (flatSettings.imageOpacity !== undefined) structured.image.imageOpacity = flatSettings.imageOpacity;
  if (flatSettings.imagePosition !== undefined) structured.image.imagePosition = flatSettings.imagePosition;
  if (flatSettings.imageAnimation !== undefined) structured.image.imageAnimation = flatSettings.imageAnimation;
  if (flatSettings.imageAnimationAmplitude !== undefined) structured.image.imageAnimationAmplitude = flatSettings.imageAnimationAmplitude;

  // 最適化設定
  if (flatSettings.canvasSize !== undefined) structured.optimization.canvasSize = flatSettings.canvasSize;
  if (flatSettings.pngQuality !== undefined) structured.optimization.pngQuality = flatSettings.pngQuality;
  if (flatSettings.gifQuality !== undefined) structured.optimization.gifQuality = flatSettings.gifQuality;
  if (flatSettings.gifFrames !== undefined) structured.optimization.gifFrames = flatSettings.gifFrames;

  return structured;
};

// 構造化設定をフラット化（下位互換性のため）
export const flattenSettings = (structuredSettings) => {
  return {
    // 基本設定
    ...structuredSettings.basic,
    
    // アニメーション設定
    ...structuredSettings.animation,
    
    // 画像設定
    ...structuredSettings.image,
    
    // 最適化設定
    ...structuredSettings.optimization
  };
};

// 設定検証
export const validateSettings = (settings) => {
  const errors = [];
  
  if (!settings.basic?.text || settings.basic.text.length === 0) {
    errors.push('テキストは必須です');
  }
  
  if (settings.basic?.fontSize < 10 || settings.basic?.fontSize > 200) {
    errors.push('フォントサイズは10-200の範囲で指定してください');
  }
  
  if (settings.optimization?.canvasSize !== 64 && settings.optimization?.canvasSize !== 128) {
    errors.push('キャンバスサイズは64または128を指定してください');
  }
  
  return errors;
};