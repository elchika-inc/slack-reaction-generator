// テストヘルパー関数とモック

import { render } from '@testing-library/react';
import { vi } from 'vitest';

// カスタムレンダー（将来的にContext Provider等が追加された場合に使用）
export const renderWithProviders = (ui, options = {}) => {
  const { renderOptions } = options;
  
  // Wrapper component（将来的にTheme Provider等を追加）
  const Wrapper = ({ children }) => {
    return children; // 現在は何もラップしない
  };

  return render(ui, {
    wrapper: Wrapper,
    ...renderOptions,
  });
};

// モックSettingsの生成
export const createMockSettings = (overrides = {}) => ({
  text: 'テスト',
  fontSize: 60,
  fontFamily: '"Noto Sans JP", sans-serif',
  fontColor: '#FF6B6B',
  secondaryColor: '#FFD700',
  backgroundType: 'transparent',
  backgroundColor: '#FFFFFF',
  animation: 'none',
  animationSpeed: 20,
  animationAmplitude: 50,
  textColorType: 'solid',
  gradientColor1: '#FF6B6B',
  gradientColor2: '#4ECDC4',
  gradientDirection: 'vertical',
  imageData: null,
  imageX: 50,
  imageY: 50,
  imageSize: 50,
  imageOpacity: 100,
  imagePosition: 'back',
  imageAnimation: 'none',
  imageAnimationAmplitude: 50,
  canvasSize: 128,
  pngQuality: 85,
  gifQuality: 20,
  gifFrames: 30,
  ...overrides,
});

// モックCanvas Context
export const createMockCanvasContext = () => ({
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  scale: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  font: '',
  textAlign: 'start',
  globalAlpha: 1,
  shadowColor: '',
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  measureText: vi.fn(() => ({ width: 100 })),
});

// アニメーション関連のテストヘルパー
export const waitForAnimation = (ms = 100) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// ファイル生成のモック
export const mockFileGeneration = () => {
  return {
    generateIconData: vi.fn(() => Promise.resolve('data:image/png;base64,test')),
    loadFileSaver: vi.fn(() => Promise.resolve({ saveAs: vi.fn() })),
  };
};

// カスタムフックのテスト用ラッパー
export const createHookWrapper = () => {
  return function Wrapper({ children }) {
    return children;
  };
};

// イベントモック
export const createMockEvent = (type, data = {}) => {
  return {
    type,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    target: { value: '', ...data },
    ...data,
  };
};