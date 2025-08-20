/**
 * Canvas API Test Double Implementation
 * 
 * Canvas 2D Context の完全なモック実装
 * Test Double パターンに基づいた設計：
 * - Mock: 期待される呼び出しの検証
 * - Stub: 決まった値を返すオブジェクト
 * - Fake: 軽量な実装を持つオブジェクト
 * - Spy: 呼び出し情報の記録
 */

import { vi } from 'vitest';

// 描画コマンドの記録用データ構造
class DrawingCommandRecorder {
  constructor() {
    this.commands = [];
    this.stateStack = [];
    this.sequenceCounter = 0;
  }

  record(command, args = []) {
    this.commands.push({
      command,
      args: [...args],
      timestamp: Date.now(),
      sequence: this.sequenceCounter++,
      stackDepth: this.stateStack.length
    });
  }

  clear() {
    this.commands = [];
    this.sequenceCounter = 0;
  }

  getCommands() {
    return [...this.commands];
  }

  getCommandsByType(commandType) {
    return this.commands.filter(cmd => cmd.command === commandType);
  }

  getLastCommand() {
    return this.commands[this.commands.length - 1];
  }

  getCommandCount(commandType = null) {
    if (commandType) {
      return this.getCommandsByType(commandType).length;
    }
    return this.commands.length;
  }
}

// Canvas State Management (Fake Implementation)
class CanvasStateManager {
  constructor() {
    this.resetState();
    this.stateStack = [];
  }

  resetState() {
    this.state = {
      fillStyle: '#000000',
      strokeStyle: '#000000',
      lineWidth: 1,
      font: '10px sans-serif',
      textAlign: 'start',
      textBaseline: 'alphabetic',
      globalAlpha: 1.0,
      globalCompositeOperation: 'source-over',
      shadowColor: 'rgba(0, 0, 0, 0)',
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      lineCap: 'butt',
      lineJoin: 'miter',
      miterLimit: 10,
      transform: [1, 0, 0, 1, 0, 0] // [a, b, c, d, e, f]
    };
  }

  save() {
    this.stateStack.push({ ...this.state });
  }

  restore() {
    if (this.stateStack.length > 0) {
      this.state = this.stateStack.pop();
    }
  }

  getState() {
    return { ...this.state };
  }

  setState(key, value) {
    this.state[key] = value;
  }
}

// Image Data Mock Implementation
class MockImageData {
  constructor(width, height, data = null) {
    this.width = width;
    this.height = height;
    this.data = data || new Uint8ClampedArray(width * height * 4);
  }
}

// 描画操作の検証用ヘルパー
export class CanvasDrawingVerifier {
  constructor(recorder) {
    this.recorder = recorder;
  }

  // テキスト描画の検証
  expectTextDrawn(text, x, y) {
    const fillTextCommands = this.recorder.getCommandsByType('fillText');
    const strokeTextCommands = this.recorder.getCommandsByType('strokeText');
    const textCommands = [...fillTextCommands, ...strokeTextCommands];
    
    const matchingCommand = textCommands.find(cmd => 
      cmd.args[0] === text && 
      (x === undefined || cmd.args[1] === x) &&
      (y === undefined || cmd.args[2] === y)
    );
    
    return {
      found: !!matchingCommand,
      command: matchingCommand,
      message: matchingCommand 
        ? `Text "${text}" was drawn at (${matchingCommand.args[1]}, ${matchingCommand.args[2]})`
        : `Text "${text}" was not drawn${x !== undefined ? ` at (${x}, ${y})` : ''}`
    };
  }

  // 画像描画の検証
  expectImageDrawn(imageSource = null, dx = null, dy = null, dw = null, dh = null) {
    const commands = this.recorder.getCommandsByType('drawImage');
    
    if (commands.length === 0) {
      return {
        found: false,
        message: 'No images were drawn'
      };
    }

    // 引数による絞り込み
    const matchingCommand = commands.find(cmd => {
      if (imageSource && cmd.args[0] !== imageSource) return false;
      if (dx !== null && cmd.args[1] !== dx) return false;
      if (dy !== null && cmd.args[2] !== dy) return false;
      if (dw !== null && cmd.args[3] !== dw) return false;
      if (dh !== null && cmd.args[4] !== dh) return false;
      return true;
    });

    return {
      found: !!matchingCommand,
      command: matchingCommand,
      count: commands.length,
      message: matchingCommand 
        ? `Image was drawn with specified parameters`
        : `No image matching the specified parameters was found`
    };
  }

  // 矩形描画の検証
  expectRectangleDrawn(x, y, width, height, type = 'fill') {
    const commandType = type === 'fill' ? 'fillRect' : 'strokeRect';
    const commands = this.recorder.getCommandsByType(commandType);
    
    const matchingCommand = commands.find(cmd => 
      cmd.args[0] === x && 
      cmd.args[1] === y && 
      cmd.args[2] === width && 
      cmd.args[3] === height
    );

    return {
      found: !!matchingCommand,
      command: matchingCommand,
      message: matchingCommand 
        ? `${type === 'fill' ? 'Filled' : 'Stroked'} rectangle drawn at (${x}, ${y}) with size ${width}x${height}`
        : `No ${type === 'fill' ? 'filled' : 'stroked'} rectangle found at (${x}, ${y}) with size ${width}x${height}`
    };
  }

  // 状態変更の検証
  expectStateChange(property, value) {
    const commands = this.recorder.getCommands();
    const stateChanges = commands.filter(cmd => cmd.command === 'setState' && cmd.args[0] === property);
    
    if (value !== undefined) {
      const matchingChange = stateChanges.find(cmd => cmd.args[1] === value);
      return {
        found: !!matchingChange,
        command: matchingChange,
        message: matchingChange 
          ? `State ${property} was set to ${value}`
          : `State ${property} was not set to ${value}`
      };
    }

    return {
      found: stateChanges.length > 0,
      changes: stateChanges,
      count: stateChanges.length,
      message: stateChanges.length > 0 
        ? `State ${property} was changed ${stateChanges.length} times`
        : `State ${property} was never changed`
    };
  }

  // クリア操作の検証
  expectCanvasCleared(x = 0, y = 0, width = null, height = null) {
    const commands = this.recorder.getCommandsByType('clearRect');
    
    const matchingCommand = commands.find(cmd => {
      if (cmd.args[0] !== x || cmd.args[1] !== y) return false;
      if (width !== null && cmd.args[2] !== width) return false;
      if (height !== null && cmd.args[3] !== height) return false;
      return true;
    });

    return {
      found: !!matchingCommand,
      command: matchingCommand,
      count: commands.length,
      message: matchingCommand 
        ? `Canvas was cleared at (${x}, ${y})${width !== null ? ` with size ${width}x${height}` : ''}`
        : `Canvas was not cleared with specified parameters`
    };
  }

  // アニメーション関連の検証
  expectTransformations() {
    const transforms = ['translate', 'rotate', 'scale', 'transform', 'setTransform'];
    const transformCommands = transforms.flatMap(cmd => this.recorder.getCommandsByType(cmd));
    
    return {
      found: transformCommands.length > 0,
      commands: transformCommands,
      count: transformCommands.length,
      types: [...new Set(transformCommands.map(cmd => cmd.command))],
      message: transformCommands.length > 0 
        ? `Found ${transformCommands.length} transformation operations`
        : 'No transformations were applied'
    };
  }

  // 描画回数の検証
  expectDrawingCount(expectedCount, commandType = null) {
    const actualCount = this.recorder.getCommandCount(commandType);
    
    return {
      passed: actualCount === expectedCount,
      actual: actualCount,
      expected: expectedCount,
      message: actualCount === expectedCount 
        ? `Drawing count matches expected: ${expectedCount}`
        : `Drawing count mismatch. Expected: ${expectedCount}, Actual: ${actualCount}`
    };
  }
}

// Canvas 2D Context Mock Implementation
export function createCanvasContextMock() {
  const recorder = new DrawingCommandRecorder();
  const stateManager = new CanvasStateManager();
  const verifier = new CanvasDrawingVerifier(recorder);

  // 基本的な描画メソッド（Mock & Spy）
  const fillRect = vi.fn((x, y, width, height) => {
    recorder.record('fillRect', [x, y, width, height]);
  });

  const strokeRect = vi.fn((x, y, width, height) => {
    recorder.record('strokeRect', [x, y, width, height]);
  });

  const clearRect = vi.fn((x, y, width, height) => {
    recorder.record('clearRect', [x, y, width, height]);
  });

  const fillText = vi.fn((text, x, y, maxWidth) => {
    recorder.record('fillText', [text, x, y, maxWidth]);
  });

  const strokeText = vi.fn((text, x, y, maxWidth) => {
    recorder.record('strokeText', [text, x, y, maxWidth]);
  });

  const drawImage = vi.fn((...args) => {
    recorder.record('drawImage', args);
  });

  // 状態管理メソッド（Fake Implementation）
  const save = vi.fn(() => {
    stateManager.save();
    recorder.record('save');
  });

  const restore = vi.fn(() => {
    stateManager.restore();
    recorder.record('restore');
  });

  // 変形メソッド（Spy）
  const translate = vi.fn((x, y) => {
    recorder.record('translate', [x, y]);
  });

  const rotate = vi.fn((angle) => {
    recorder.record('rotate', [angle]);
  });

  const scale = vi.fn((x, y) => {
    recorder.record('scale', [x, y]);
  });

  const transform = vi.fn((a, b, c, d, e, f) => {
    recorder.record('transform', [a, b, c, d, e, f]);
  });

  const setTransform = vi.fn((a, b, c, d, e, f) => {
    recorder.record('setTransform', [a, b, c, d, e, f]);
  });

  // パス描画メソッド（Mock）
  const beginPath = vi.fn(() => {
    recorder.record('beginPath');
  });

  const closePath = vi.fn(() => {
    recorder.record('closePath');
  });

  const moveTo = vi.fn((x, y) => {
    recorder.record('moveTo', [x, y]);
  });

  const lineTo = vi.fn((x, y) => {
    recorder.record('lineTo', [x, y]);
  });

  const arc = vi.fn((x, y, radius, startAngle, endAngle, counterclockwise) => {
    recorder.record('arc', [x, y, radius, startAngle, endAngle, counterclockwise]);
  });

  const fill = vi.fn(() => {
    recorder.record('fill');
  });

  const stroke = vi.fn(() => {
    recorder.record('stroke');
  });

  // 画像データメソッド（Stub）
  const getImageData = vi.fn((sx, sy, sw, sh) => {
    recorder.record('getImageData', [sx, sy, sw, sh]);
    return new MockImageData(sw, sh);
  });

  const putImageData = vi.fn((imageData, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight) => {
    recorder.record('putImageData', [imageData, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight]);
  });

  const createImageData = vi.fn((width, height) => {
    recorder.record('createImageData', [width, height]);
    return new MockImageData(width, height);
  });

  // テキスト測定メソッド（Stub）
  const measureText = vi.fn((text) => {
    recorder.record('measureText', [text]);
    return {
      width: text.length * 8, // 文字数 × 8px の簡易計算
      actualBoundingBoxLeft: 0,
      actualBoundingBoxRight: text.length * 8,
      actualBoundingBoxAscent: 12,
      actualBoundingBoxDescent: 3,
      fontBoundingBoxAscent: 14,
      fontBoundingBoxDescent: 4,
      alphabeticBaseline: 0,
      emHeightAscent: 12,
      emHeightDescent: 3,
      hangingBaseline: 10,
      ideographicBaseline: -3
    };
  });

  // プロパティの定義（State Management）
  const contextMock = {
    // 描画メソッド
    fillRect,
    strokeRect,
    clearRect,
    fillText,
    strokeText,
    drawImage,
    
    // 状態管理
    save,
    restore,
    
    // 変形
    translate,
    rotate,
    scale,
    transform,
    setTransform,
    
    // パス
    beginPath,
    closePath,
    moveTo,
    lineTo,
    arc,
    fill,
    stroke,
    
    // 画像データ
    getImageData,
    putImageData,
    createImageData,
    
    // テキスト
    measureText,
    
    // テスト専用メソッド
    __getRecorder: () => recorder,
    __getVerifier: () => verifier,
    __getStateManager: () => stateManager,
    __clearRecording: () => recorder.clear(),
    __resetState: () => stateManager.resetState()
  };

  // プロパティのゲッター・セッターを定義
  const properties = [
    'fillStyle', 'strokeStyle', 'lineWidth', 'font', 'textAlign', 'textBaseline',
    'globalAlpha', 'globalCompositeOperation', 'shadowColor', 'shadowBlur',
    'shadowOffsetX', 'shadowOffsetY', 'lineCap', 'lineJoin', 'miterLimit'
  ];

  properties.forEach(prop => {
    Object.defineProperty(contextMock, prop, {
      get() {
        return stateManager.getState()[prop];
      },
      set(value) {
        stateManager.setState(prop, value);
        recorder.record('setState', [prop, value]);
      },
      enumerable: true,
      configurable: true
    });
  });

  return contextMock;
}

// Canvas Element Mock
export function createCanvasMock(width = 300, height = 150) {
  const context = createCanvasContextMock();
  
  const canvasMock = {
    width,
    height,
    getContext: vi.fn(() => context),
    toDataURL: vi.fn(() => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='),
    toBlob: vi.fn((callback) => {
      const mockBlob = new Blob(['mock'], { type: 'image/png' });
      callback(mockBlob);
    }),
    
    // テスト専用メソッド
    __getContext: () => context,
    __getRecorder: () => context.__getRecorder(),
    __getVerifier: () => context.__getVerifier()
  };

  return canvasMock;
}

// File/Blob API Mock
export function createFileBlobMock() {
  const FileReaderMock = vi.fn().mockImplementation(() => ({
    readAsDataURL: vi.fn(function(blob) {
      this.result = 'data:image/png;base64,mockImageData';
      if (this.onload) this.onload();
    }),
    readAsText: vi.fn(function(blob) {
      this.result = 'mock text content';
      if (this.onload) this.onload();
    }),
    result: null,
    onload: null,
    onerror: null
  }));

  const BlobMock = vi.fn().mockImplementation((parts, options) => ({
    size: parts.reduce((acc, part) => acc + (part.length || 0), 0),
    type: options?.type || 'application/octet-stream',
    slice: vi.fn(),
    stream: vi.fn(),
    text: vi.fn(() => Promise.resolve('mock content')),
    arrayBuffer: vi.fn(() => Promise.resolve(new ArrayBuffer(8)))
  }));

  return {
    FileReader: FileReaderMock,
    Blob: BlobMock
  };
}

// requestAnimationFrame Mock (Fake Implementation)
export function createAnimationFrameMock() {
  let frameId = 0;
  const callbacks = new Map();
  
  const requestAnimationFrame = vi.fn((callback) => {
    frameId += 1;
    callbacks.set(frameId, callback);
    // 即座に実行するか、テスト制御下で実行するかを選択可能
    return frameId;
  });

  const cancelAnimationFrame = vi.fn((id) => {
    callbacks.delete(id);
  });

  // テスト制御用メソッド
  const tick = (timestamp = performance.now()) => {
    const callbacksToRun = Array.from(callbacks.values());
    callbacks.clear();
    callbacksToRun.forEach(callback => callback(timestamp));
  };

  const tickAll = (frameCount = 1, interval = 16) => {
    for (let i = 0; i < frameCount; i++) {
      tick(performance.now() + i * interval);
    }
  };

  return {
    requestAnimationFrame,
    cancelAnimationFrame,
    tick,
    tickAll,
    getPendingCallbacks: () => Array.from(callbacks.keys())
  };
}

// Image Mock
export function createImageMock(src = null, width = 100, height = 100) {
  const imageMock = {
    src: src || '',
    width,
    height,
    naturalWidth: width,
    naturalHeight: height,
    complete: true,
    onload: null,
    onerror: null,
    
    // テスト用メソッド
    __triggerLoad: function() {
      this.complete = true;
      if (this.onload) this.onload();
    },
    __triggerError: function() {
      if (this.onerror) this.onerror();
    }
  };

  // src設定時の自動ロード
  Object.defineProperty(imageMock, 'src', {
    get() {
      return imageMock._src || '';
    },
    set(value) {
      imageMock._src = value;
      setTimeout(() => imageMock.__triggerLoad(), 0);
    }
  });

  return imageMock;
}

// 全体的なCanvas環境のセットアップ
export function setupCanvasEnvironment() {
  const canvasMock = createCanvasMock();
  const animationMock = createAnimationFrameMock();
  const fileBlobMock = createFileBlobMock();
  
  // Global objects をモック
  global.HTMLCanvasElement = vi.fn().mockImplementation(() => canvasMock);
  global.HTMLCanvasElement.prototype = canvasMock;
  
  global.requestAnimationFrame = animationMock.requestAnimationFrame;
  global.cancelAnimationFrame = animationMock.cancelAnimationFrame;
  
  global.FileReader = fileBlobMock.FileReader;
  global.Blob = fileBlobMock.Blob;
  
  global.Image = vi.fn().mockImplementation(() => createImageMock());
  
  // document.createElement のモック
  const originalCreateElement = global.document?.createElement;
  if (global.document) {
    global.document.createElement = vi.fn((tagName) => {
      if (tagName.toLowerCase() === 'canvas') {
        return createCanvasMock();
      }
      if (tagName.toLowerCase() === 'img') {
        return createImageMock();
      }
      return originalCreateElement ? originalCreateElement.call(document, tagName) : {};
    });
  }

  return {
    canvas: canvasMock,
    animation: animationMock,
    fileBlob: fileBlobMock,
    cleanup: () => {
      // クリーンアップ処理
      if (global.document && originalCreateElement) {
        global.document.createElement = originalCreateElement;
      }
    }
  };
}

// テスト用アサーション関数
export const canvasAssertions = {
  expectTextDrawn: (context, text, x, y) => {
    const verifier = context.__getVerifier();
    const result = verifier.expectTextDrawn(text, x, y);
    if (!result.found) {
      throw new Error(result.message);
    }
    return result;
  },

  expectImageDrawn: (context, options = {}) => {
    const verifier = context.__getVerifier();
    const result = verifier.expectImageDrawn(
      options.imageSource,
      options.dx,
      options.dy,
      options.dw,
      options.dh
    );
    if (!result.found) {
      throw new Error(result.message);
    }
    return result;
  },

  expectCanvasCleared: (context, x, y, width, height) => {
    const verifier = context.__getVerifier();
    const result = verifier.expectCanvasCleared(x, y, width, height);
    if (!result.found) {
      throw new Error(result.message);
    }
    return result;
  },

  expectDrawingCount: (context, expectedCount, commandType = null) => {
    const verifier = context.__getVerifier();
    const result = verifier.expectDrawingCount(expectedCount, commandType);
    if (!result.passed) {
      throw new Error(result.message);
    }
    return result;
  }
};