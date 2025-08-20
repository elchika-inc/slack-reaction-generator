// Canvas作成の統一ファクトリー

export const createCanvas = (width = 128, height = 128, options = {}) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const contextOptions = {
    alpha: true,
    willReadFrequently: true,
    ...options
  };
  
  const ctx = canvas.getContext('2d', contextOptions);
  
  return { canvas, ctx };
};

export const createPreviewCanvas = (size) => {
  return createCanvas(size, size);
};

export const createAnimationCanvas = (settings) => {
  const size = settings.canvasSize || 128;
  return createCanvas(size, size);
};