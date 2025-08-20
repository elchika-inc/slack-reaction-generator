// テスト環境のセットアップ

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Preact のテスト用グローバルコンテキスト設定
// Preact hooks が正しく動作するよう、適切なグローバルコンテキストを設定
global.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
  renderers: new Map(),
  supportsFiber: true,
  inject: () => {},
  onCommitFiberRoot: () => {},
  onCommitFiberUnmount: () => {},
};

// Preact/React DOM関連のモック
Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'test'
  }
});

// Node environment用のDOMセットアップ
if (typeof window !== 'undefined') {
  window.location = window.location || {};
}

// Canvas API の基本的なモック
const mockCanvas = document.createElement('canvas');
const mockContext = {
  fillRect: vi.fn(),
  clearRect: vi.fn(),
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
  drawImage: vi.fn(),
  fillText: vi.fn(),
  strokeText: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  scale: vi.fn(),
  createLinearGradient: vi.fn(() => ({
    addColorStop: vi.fn()
  })),
  createRadialGradient: vi.fn(() => ({
    addColorStop: vi.fn()
  }))
};

global.HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext);
global.HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,test');

// IntersectionObserver のモック
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}));

// requestAnimationFrame のモック
let animationId = 0;
global.requestAnimationFrame = vi.fn((callback) => {
  return setTimeout(() => callback(Date.now()), 16);
});
global.cancelAnimationFrame = vi.fn((id) => {
  clearTimeout(id);
});

// Font loading API のモック
Object.defineProperty(document, 'fonts', {
  value: {
    load: vi.fn(() => Promise.resolve()),
    ready: Promise.resolve()
  }
});

// ファイル関連API のモック
const FileReaderMock = vi.fn().mockImplementation(() => ({
  readAsDataURL: vi.fn(function(_blob) {
    this.result = 'data:image/png;base64,mockImageData';
    if (this.onload) this.onload();
  }),
  readAsText: vi.fn(function(_blob) {
    this.result = 'mock text content';
    if (this.onload) this.onload();
  }),
  result: null,
  onload: null,
  onerror: null
}));

global.FileReader = FileReaderMock;
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
Object.defineProperty(global, 'navigator', {
  value: {
    ...global.navigator,
    connection: {
      effectiveType: '4g',
      downlink: 10
    },
    share: vi.fn(() => Promise.resolve()),
    clipboard: {
      writeText: vi.fn(() => Promise.resolve())
    }
  },
  writable: true
});

// LocalStorage のモック
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Dynamic Import のモック設定
vi.mock('file-saver', () => ({
  default: {
    saveAs: vi.fn((blob, filename) => {
      // eslint-disable-next-line no-console
      console.log(`Saving file: ${filename}`);
    })
  },
  saveAs: vi.fn((blob, filename) => {
    // eslint-disable-next-line no-console
    console.log(`Saving file: ${filename}`);
  })
}));

// gif.js のモック
vi.mock('gif.js', () => ({
  default: vi.fn().mockImplementation(() => ({
    addFrame: vi.fn(),
    on: vi.fn(),
    render: vi.fn()
  }))
}));

// react-color のモック
vi.mock('react-color', () => ({
  SketchPicker: vi.fn(() => null)
}));