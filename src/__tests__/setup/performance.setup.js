/**
 * パフォーマンステスト用のセットアップ
 * Node.js環境でのWebAPI模擬
 */

import { vi } from 'vitest';

// Web Worker モック
global.Worker = vi.fn().mockImplementation((_scriptURL) => {
  const worker = {
    postMessage: vi.fn(),
    terminate: vi.fn(),
    onmessage: null,
    onerror: null
  };
  
  // 模擬的にメッセージを処理
  setTimeout(() => {
    if (worker.onmessage) {
      worker.onmessage({
        data: {
          type: 'complete',
          data: { gif: new ArrayBuffer(1024), mimeType: 'image/gif' }
        }
      });
    }
  }, 100);
  
  return worker;
});

// OffscreenCanvas モック
global.OffscreenCanvas = vi.fn().mockImplementation((width, height) => {
  const canvas = {
    width,
    height,
    getContext: vi.fn().mockReturnValue({
      fillStyle: '',
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      putImageData: vi.fn(),
      getImageData: vi.fn().mockReturnValue({
        data: new Uint8ClampedArray(width * height * 4),
        width,
        height
      }),
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high'
    }),
    convertToBlob: vi.fn().mockResolvedValue(new Blob([], { type: 'image/png' }))
  };
  return canvas;
});

// ImageBitmap モック
global.ImageBitmap = vi.fn().mockImplementation((width = 100, height = 100) => ({
  width,
  height,
  close: vi.fn()
}));

global.createImageBitmap = vi.fn().mockImplementation((source) => {
  if (source instanceof Blob) {
    return Promise.resolve(new global.ImageBitmap(100, 100));
  }
  if (source instanceof HTMLCanvasElement || source instanceof HTMLImageElement) {
    return Promise.resolve(new global.ImageBitmap(source.width || 100, source.height || 100));
  }
  return Promise.resolve(new global.ImageBitmap());
});

// Performance memory API モック
if (!global.performance.memory) {
  global.performance.memory = {
    usedJSHeapSize: 50 * 1024 * 1024,  // 50MB
    totalJSHeapSize: 100 * 1024 * 1024, // 100MB  
    jsHeapSizeLimit: 2 * 1024 * 1024 * 1024 // 2GB
  };
}

// FileReader の拡張
global.FileReader = vi.fn().mockImplementation(() => {
  const reader = {
    result: null,
    readAsDataURL: vi.fn().mockImplementation(function(blob) {
      // 模擬的なData URLを生成
      setTimeout(() => {
        this.result = `data:${blob.type};base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`;
        if (this.onloadend) this.onloadend();
      }, 10);
    }),
    readAsArrayBuffer: vi.fn().mockImplementation(function(blob) {
      setTimeout(() => {
        this.result = new ArrayBuffer(blob.size || 1024);
        if (this.onloadend) this.onloadend();
      }, 10);
    }),
    onloadend: null,
    onerror: null
  };
  return reader;
});

// Blob 拡張
const originalBlob = global.Blob;
global.Blob = vi.fn().mockImplementation((parts = [], options = {}) => {
  const blob = new originalBlob(parts, options);
  
  // arrayBuffer メソッドを確実に追加
  if (!blob.arrayBuffer) {
    blob.arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(blob.size || 1024));
  }
  
  return blob;
});

// URL.createObjectURL / revokeObjectURL モック
global.URL = global.URL || {};
global.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// fetch モック (Workerスクリプト用)
global.fetch = vi.fn().mockImplementation((url) => {
  if (url.includes('gifWorker.js')) {
    return Promise.resolve({
      ok: true,
      text: () => Promise.resolve('// Mock worker script')
    });
  }
  return Promise.reject(new Error(`Unexpected fetch: ${url}`));
});

// console.log('Performance test setup completed');