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

// Canvas API のモック - 包括的なTest Double実装を使用
import { setupCanvasEnvironment } from './mocks/canvasMock.js';

// Canvas環境のセットアップ
const canvasEnvironment = setupCanvasEnvironment();

// 既存のコードとの互換性を保つため、基本的なモックも残す
global.HTMLCanvasElement.prototype.getContext = canvasEnvironment.canvas.getContext;
global.HTMLCanvasElement.prototype.toDataURL = canvasEnvironment.canvas.toDataURL;

// IntersectionObserver のモック
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}));

// requestAnimationFrame のモック - canvasMockのものを使用
global.requestAnimationFrame = canvasEnvironment.animation.requestAnimationFrame;
global.cancelAnimationFrame = canvasEnvironment.animation.cancelAnimationFrame;

// Font loading API のモック
Object.defineProperty(document, 'fonts', {
  value: {
    load: vi.fn(() => Promise.resolve()),
    ready: Promise.resolve()
  }
});

// ファイル関連API のモック - canvasMockのものを使用
global.FileReader = canvasEnvironment.fileBlob.FileReader;
global.Blob = canvasEnvironment.fileBlob.Blob;
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
      console.log(`Saving file: ${filename}`);
    })
  },
  saveAs: vi.fn((blob, filename) => {
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