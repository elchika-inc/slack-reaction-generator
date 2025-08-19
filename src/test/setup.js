// テスト環境のセットアップ

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Canvas API のモック
global.HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
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
  measureText: vi.fn(() => ({ width: 100 }))
}));

global.HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,test');

// IntersectionObserver のモック
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}));

// requestAnimationFrame のモック
global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = vi.fn();

// Font loading API のモック
Object.defineProperty(document, 'fonts', {
  value: {
    load: vi.fn(() => Promise.resolve()),
    ready: Promise.resolve()
  }
});

// ファイル関連API のモック
global.FileReader = vi.fn(() => ({
  readAsDataURL: vi.fn(),
  result: 'data:image/png;base64,test',
  onload: null,
  onerror: null
}));

global.Blob = vi.fn();
global.URL.createObjectURL = vi.fn(() => 'blob:test');

// Window関連のモック
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// ネットワーク関連のモック
global.navigator = {
  ...global.navigator,
  connection: {
    effectiveType: '4g',
    downlink: 10
  },
  share: vi.fn(() => Promise.resolve()),
  clipboard: {
    writeText: vi.fn(() => Promise.resolve())
  }
};

// LocalStorage のモック
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;