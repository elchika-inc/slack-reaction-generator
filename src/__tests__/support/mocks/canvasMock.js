/**
 * Canvas API Test Double
 * Canvas API関連の包括的なモック実装
 */

import { vi } from 'vitest';

/**
 * CanvasRenderingContext2Dのモック作成
 * SOLID Principles適用: Single Responsibility - Canvas Context担当
 */
export const createCanvasContextMock = (overrides = {}) => {
  return {
    // Drawing methods
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    strokeRect: vi.fn(),
    
    // Text methods
    fillText: vi.fn(),
    strokeText: vi.fn(),
    measureText: vi.fn(() => ({ width: 100, actualBoundingBoxLeft: 0, actualBoundingBoxRight: 100 })),
    
    // Path methods
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    
    // Transform methods
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    translate: vi.fn(),
    transform: vi.fn(),
    setTransform: vi.fn(),
    
    // Style properties
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 1,
    font: '10px sans-serif',
    textAlign: 'start',
    textBaseline: 'alphabetic',
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    
    // Image methods
    drawImage: vi.fn(),
    getImageData: vi.fn(() => ({
      data: new Uint8ClampedArray(4),
      width: 1,
      height: 1
    })),
    putImageData: vi.fn(),
    createImageData: vi.fn(() => ({
      data: new Uint8ClampedArray(4),
      width: 1,
      height: 1
    })),
    
    // Gradient methods
    createLinearGradient: vi.fn(() => ({
      addColorStop: vi.fn()
    })),
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn()
    })),
    
    // Pattern methods
    createPattern: vi.fn(),
    
    // Clipping methods
    clip: vi.fn(),
    
    // Shadow properties
    shadowBlur: 0,
    shadowColor: 'transparent',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    
    // Override with custom properties
    ...overrides
  };
};

/**
 * HTMLCanvasElementのモック作成
 * SOLID Principles適用: Single Responsibility - Canvas Element担当
 */
export const createCanvasMock = (width = 256, height = 256, contextOverrides = {}) => {
  const context = createCanvasContextMock(contextOverrides);
  
  return {
    width,
    height,
    getContext: vi.fn(() => context),
    toDataURL: vi.fn(() => 'data:image/png;base64,mock-data'),
    toBlob: vi.fn((callback) => {
      const blob = new Blob(['mock-blob'], { type: 'image/png' });
      if (callback) callback(blob);
    }),
    
    // Canvas specific properties
    style: {
      width: `${width}px`,
      height: `${height}px`
    },
    
    // DOM element properties
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    
    // Context reference for assertions
    __mockContext: context
  };
};

/**
 * Canvas Test Assertions
 * AAA Pattern適用: Assert部分の再利用可能なヘルパー
 */
export const canvasAssertions = {
  /**
   * テキストが正しく描画されたかアサート
   */
  expectTextDrawn: (context, text, x, y) => {
    expect(context.fillText).toHaveBeenCalledWith(text, x, y);
  },
  
  /**
   * Canvasがクリアされたかアサート
   */
  expectCanvasCleared: (context, width, height) => {
    expect(context.clearRect).toHaveBeenCalledWith(0, 0, width, height);
  },
  
  /**
   * 背景色が設定されたかアサート
   */
  expectBackgroundFilled: (context, color, width, height) => {
    expect(context.fillStyle).toBe(color);
    expect(context.fillRect).toHaveBeenCalledWith(0, 0, width, height);
  },
  
  /**
   * フォントが設定されたかアサート
   */
  expectFontSet: (context, font) => {
    expect(context.font).toBe(font);
  },
  
  /**
   * 変換が適用されたかアサート
   */
  expectTransformApplied: (context) => {
    expect(context.save).toHaveBeenCalled();
    expect(context.restore).toHaveBeenCalled();
  }
};

/**
 * Canvas Builder Pattern
 * Test Builder Pattern適用: 複雑なCanvasセットアップの構築
 */
export class CanvasTestBuilder {
  constructor() {
    this.width = 256;
    this.height = 256;
    this.contextOverrides = {};
  }
  
  withSize(width, height) {
    this.width = width;
    this.height = height;
    return this;
  }
  
  withContextOverride(key, value) {
    this.contextOverrides[key] = value;
    return this;
  }
  
  withMeasureTextResponse(response) {
    this.contextOverrides.measureText = vi.fn(() => response);
    return this;
  }
  
  build() {
    return createCanvasMock(this.width, this.height, this.contextOverrides);
  }
}

/**
 * Canvas Test Spy Factory
 * Test Double Pattern: Spy実装
 */
export const createCanvasSpy = () => {
  const originalCreateElement = document.createElement;
  const canvasSpy = vi.fn();
  
  document.createElement = vi.fn((tagName) => {
    if (tagName === 'canvas') {
      const canvas = createCanvasMock();
      canvasSpy(canvas);
      return canvas;
    }
    return originalCreateElement.call(document, tagName);
  });
  
  return {
    spy: canvasSpy,
    restore: () => {
      document.createElement = originalCreateElement;
    }
  };
};

// 便利なファクトリー関数
export const createTextRenderingCanvas = () => {
  return new CanvasTestBuilder()
    .withMeasureTextResponse({ width: 100 })
    .build();
};

export const createAnimationCanvas = () => {
  return new CanvasTestBuilder()
    .withSize(128, 128)
    .withContextOverride('globalAlpha', 1)
    .build();
};