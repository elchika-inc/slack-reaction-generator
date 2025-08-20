// errorHandler の統合テスト
// 4つのテスト手法（AAA、Test Double、Test Builder、SOLID）を統合した実装

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  ErrorTypes,
  handleError,
  safeAsync,
  safeSync 
} from '../../utils/errorHandler';
import { 
  createFileBuilder,
  createEventBuilder 
} from '../../test/builders';

// Test Doubles: グローバルオブジェクトのモック
const mockConsole = {
  warn: vi.fn(),
  error: vi.fn(),
  log: vi.fn()
};

const mockWindow = {
  location: {
    hostname: 'localhost'
  }
};

const mockPerformance = {
  now: vi.fn(() => Date.now())
};

describe('errorHandler - 統合テスト', () => {
  // Test Setup: モックの設定とリセット
  beforeEach(() => {
    vi.clearAllMocks();
    
    // グローバルオブジェクトのモック設定
    global.console = mockConsole;
    global.window = mockWindow;
    global.performance = mockPerformance;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('ErrorTypes定数', () => {
    it('全てのエラータイプが定義されている', () => {
      // AAA Pattern: Arrange & Act & Assert
      expect(ErrorTypes.FONT_LOADING).toBe('FONT_LOADING');
      expect(ErrorTypes.FILE_DOWNLOAD).toBe('FILE_DOWNLOAD');
      expect(ErrorTypes.IMAGE_LOAD).toBe('IMAGE_LOAD');
      expect(ErrorTypes.SHARE_API).toBe('SHARE_API');
      expect(ErrorTypes.CANVAS_RENDER).toBe('CANVAS_RENDER');
      expect(ErrorTypes.NETWORK).toBe('NETWORK');
    });

    it('エラータイプが重複していない', () => {
      // AAA Pattern: Arrange
      const errorTypes = Object.values(ErrorTypes);
      
      // AAA Pattern: Act
      const uniqueTypes = new Set(errorTypes);
      
      // AAA Pattern: Assert
      expect(uniqueTypes.size).toBe(errorTypes.length);
    });
  });

  describe('handleError関数', () => {
    it('AppErrorクラスのインスタンスを正しく生成する', () => {
      // AAA Pattern: Arrange
      const originalError = new Error('Original error message');
      
      // AAA Pattern: Act
      const result = handleError(ErrorTypes.CANVAS_RENDER, originalError);
      
      // AAA Pattern: Assert
      expect(result).toBeInstanceOf(Error);
      expect(result.name).toBe('AppError');
      expect(result.type).toBe(ErrorTypes.CANVAS_RENDER);
      expect(result.message).toBe('Canvas描画でエラーが発生しました');
      expect(result.originalError).toBe(originalError);
      expect(result.timestamp).toBeDefined();
    });

    it('カスタムメッセージが正しく設定される', () => {
      // AAA Pattern: Arrange
      const customMessage = 'カスタムエラーメッセージ';
      const originalError = new Error('Test error');
      
      // AAA Pattern: Act
      const result = handleError(ErrorTypes.FILE_DOWNLOAD, originalError, customMessage);
      
      // AAA Pattern: Assert
      expect(result.message).toBe(customMessage);
    });

    it('不明なエラータイプでデフォルトメッセージを使用する', () => {
      // AAA Pattern: Arrange
      const unknownType = 'UNKNOWN_ERROR_TYPE';
      const originalError = new Error('Test error');
      
      // AAA Pattern: Act
      const result = handleError(unknownType, originalError);
      
      // AAA Pattern: Assert
      expect(result.message).toBe('予期しないエラーが発生しました');
    });

    it('localhost環境でコンソールログが出力される', () => {
      // AAA Pattern: Arrange
      mockWindow.location.hostname = 'localhost';
      const originalError = new Error('Test error');
      
      // AAA Pattern: Act
      handleError(ErrorTypes.FONT_LOADING, originalError);
      
      // AAA Pattern: Assert
      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringMatching(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] FONT_LOADING: フォント読み込みに失敗しました$/),
        originalError
      );
    });

    it('production環境でコンソールログが出力されない', () => {
      // AAA Pattern: Arrange
      mockWindow.location.hostname = 'example.com';
      const originalError = new Error('Test error');
      
      // AAA Pattern: Act
      handleError(ErrorTypes.NETWORK, originalError);
      
      // AAA Pattern: Assert
      expect(mockConsole.warn).not.toHaveBeenCalled();
    });

    it('windowオブジェクトが存在しない環境で動作する', () => {
      // AAA Pattern: Arrange
      global.window = undefined;
      const originalError = new Error('Server side error');
      
      // AAA Pattern: Act & Assert
      expect(() => {
        handleError(ErrorTypes.NETWORK, originalError);
      }).not.toThrow();
      
      expect(mockConsole.warn).not.toHaveBeenCalled();
    });
  });

  describe('safeAsync関数', () => {
    it('成功時に結果を正しく返す', async () => {
      // AAA Pattern: Arrange
      const successResult = 'Success result';
      const asyncFn = vi.fn().mockResolvedValue(successResult);
      
      // AAA Pattern: Act
      const result = await safeAsync(asyncFn, ErrorTypes.NETWORK);
      
      // AAA Pattern: Assert
      expect(result).toBe(successResult);
      expect(asyncFn).toHaveBeenCalledOnce();
    });

    it('エラー時にAppErrorを返す', async () => {
      // AAA Pattern: Arrange
      const originalError = new Error('Async error');
      const asyncFn = vi.fn().mockRejectedValue(originalError);
      
      // AAA Pattern: Act
      const result = await safeAsync(asyncFn, ErrorTypes.FILE_DOWNLOAD);
      
      // AAA Pattern: Assert
      expect(result).toBeInstanceOf(Error);
      expect(result.name).toBe('AppError');
      expect(result.type).toBe(ErrorTypes.FILE_DOWNLOAD);
      expect(result.originalError).toBe(originalError);
    });

    it('カスタムメッセージ付きエラー処理', async () => {
      // AAA Pattern: Arrange
      const customMessage = 'ファイル読み込み処理でエラー';
      const asyncFn = vi.fn().mockRejectedValue(new Error('File not found'));
      
      // AAA Pattern: Act
      const result = await safeAsync(asyncFn, ErrorTypes.IMAGE_LOAD, customMessage);
      
      // AAA Pattern: Assert
      expect(result.message).toBe(customMessage);
    });

    it('Promise rejection以外のエラーも正しく処理する', async () => {
      // AAA Pattern: Arrange
      const asyncFn = vi.fn().mockImplementation(() => {
        throw new Error('Synchronous error in async function');
      });
      
      // AAA Pattern: Act
      const result = await safeAsync(asyncFn, ErrorTypes.CANVAS_RENDER);
      
      // AAA Pattern: Assert
      expect(result).toBeInstanceOf(Error);
      expect(result.name).toBe('AppError');
    });
  });

  describe('safeSync関数', () => {
    it('成功時に結果を正しく返す', () => {
      // AAA Pattern: Arrange
      const successResult = { data: 'test data' };
      const syncFn = vi.fn().mockReturnValue(successResult);
      
      // AAA Pattern: Act
      const result = safeSync(syncFn, ErrorTypes.CANVAS_RENDER);
      
      // AAA Pattern: Assert
      expect(result).toBe(successResult);
      expect(syncFn).toHaveBeenCalledOnce();
    });

    it('エラー時にAppErrorを返す', () => {
      // AAA Pattern: Arrange
      const originalError = new Error('Sync error');
      const syncFn = vi.fn().mockImplementation(() => {
        throw originalError;
      });
      
      // AAA Pattern: Act
      const result = safeSync(syncFn, ErrorTypes.SHARE_API);
      
      // AAA Pattern: Assert
      expect(result).toBeInstanceOf(Error);
      expect(result.name).toBe('AppError');
      expect(result.type).toBe(ErrorTypes.SHARE_API);
      expect(result.originalError).toBe(originalError);
    });

    it('例外が発生しない場合は正常な値を返す', () => {
      // AAA Pattern: Arrange
      const syncFn = vi.fn().mockReturnValue(42);
      
      // AAA Pattern: Act
      const result = safeSync(syncFn, ErrorTypes.NETWORK);
      
      // AAA Pattern: Assert
      expect(result).toBe(42);
      expect(syncFn).toHaveBeenCalledOnce();
    });
  });

  describe('Test Builder Pattern統合', () => {
    it('FileBuilderでファイル関連エラーをシミュレート', async () => {
      // AAA Pattern: Arrange
      const corruptedFile = createFileBuilder()
        .withName('corrupted.png')
        .withType('image/png')
        .withBase64Data('invalid_base64_data')
        .build();

      const fileProcessFn = vi.fn().mockRejectedValue(
        new Error('Invalid file format')
      );

      // AAA Pattern: Act
      const result = await safeAsync(
        () => fileProcessFn(corruptedFile), 
        ErrorTypes.FILE_DOWNLOAD,
        'ファイル処理エラー'
      );

      // AAA Pattern: Assert
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('ファイル処理エラー');
      expect(fileProcessFn).toHaveBeenCalledWith(corruptedFile);
    });

    it('EventBuilderでイベント処理エラーをシミュレート', () => {
      // AAA Pattern: Arrange
      const invalidEvent = createEventBuilder()
        .withType('file_upload')
        .withFiles([])
        .build();

      const eventHandler = vi.fn().mockImplementation(() => {
        if (!invalidEvent.target.files.length) {
          throw new Error('No files selected');
        }
      });

      // AAA Pattern: Act
      const result = safeSync(
        () => eventHandler(invalidEvent),
        ErrorTypes.FILE_DOWNLOAD,
        'ファイル選択エラー'
      );

      // AAA Pattern: Assert
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('ファイル選択エラー');
    });
  });

  describe('実際のファイル操作エラーシミュレーション', () => {
    it('画像読み込み失敗のシミュレーション', async () => {
      // AAA Pattern: Arrange
      const imageUrl = 'https://example.com/nonexistent.png';
      const mockLoadImage = vi.fn().mockRejectedValue(
        new Error('Failed to load image')
      );

      // AAA Pattern: Act
      const result = await safeAsync(
        () => mockLoadImage(imageUrl),
        ErrorTypes.IMAGE_LOAD
      );

      // AAA Pattern: Assert
      expect(result).toBeInstanceOf(Error);
      expect(result.type).toBe(ErrorTypes.IMAGE_LOAD);
      expect(result.message).toBe('画像の読み込みに失敗しました');
    });

    it('フォント読み込み失敗のシミュレーション', async () => {
      // AAA Pattern: Arrange
      const mockFontFace = {
        load: vi.fn().mockRejectedValue(new Error('Font not found'))
      };

      // AAA Pattern: Act
      const result = await safeAsync(
        () => mockFontFace.load(),
        ErrorTypes.FONT_LOADING,
        'カスタムフォントの読み込みに失敗'
      );

      // AAA Pattern: Assert
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('カスタムフォントの読み込みに失敗');
    });

    it('Canvas描画エラーのシミュレーション', () => {
      // AAA Pattern: Arrange
      const mockCanvas = {
        getContext: vi.fn().mockReturnValue(null)
      };

      const drawFunction = vi.fn().mockImplementation(() => {
        if (!mockCanvas.getContext('2d')) {
          throw new Error('Canvas context not available');
        }
      });

      // AAA Pattern: Act
      const result = safeSync(
        () => drawFunction(),
        ErrorTypes.CANVAS_RENDER
      );

      // AAA Pattern: Assert
      expect(result).toBeInstanceOf(Error);
      expect(result.type).toBe(ErrorTypes.CANVAS_RENDER);
    });

    it('ファイルダウンロード失敗のシミュレーション', async () => {
      // AAA Pattern: Arrange
      const mockBlob = new Blob(['test'], { type: 'text/plain' });
      const mockFileSaver = vi.fn().mockImplementation(() => {
        throw new Error('Save operation cancelled');
      });

      // AAA Pattern: Act
      const result = await safeAsync(
        () => mockFileSaver(mockBlob, 'test.txt'),
        ErrorTypes.FILE_DOWNLOAD
      );

      // AAA Pattern: Assert
      expect(result).toBeInstanceOf(Error);
      expect(result.type).toBe(ErrorTypes.FILE_DOWNLOAD);
      expect(result.message).toBe('ファイルのダウンロードに失敗しました');
    });
  });

  describe('SOLID原則の適用', () => {
    it('SRP: エラーハンドラーは単一責任（エラー処理）のみを持つ', () => {
      // AAA Pattern: Arrange
      const error = new Error('Test');

      // AAA Pattern: Act
      const result = handleError(ErrorTypes.NETWORK, error);

      // AAA Pattern: Assert
      // エラー処理以外の機能（ログ、UI更新等）は含まれていない
      expect(result).toBeInstanceOf(Error);
      expect(typeof result.type).toBe('string');
      expect(typeof result.timestamp).toBe('string');
      expect(result.originalError).toBe(error);

      // ファイル操作、ネットワーク処理等の責任は持たない
      expect(result).not.toHaveProperty('saveToFile');
      expect(result).not.toHaveProperty('sendToServer');
    });

    it('OCP: 新しいエラータイプの追加に対して開いている', () => {
      // AAA Pattern: Arrange
      const newErrorType = 'NEW_ERROR_TYPE';
      const error = new Error('New error');

      // AAA Pattern: Act & Assert
      // 新しいエラータイプでも動作する
      expect(() => {
        handleError(newErrorType, error);
      }).not.toThrow();

      const result = handleError(newErrorType, error, 'New error message');
      expect(result.type).toBe(newErrorType);
      expect(result.message).toBe('New error message');
    });

    it('LSP: safeAsyncとsafeSyncが同じインターフェースで使用可能', async () => {
      // AAA Pattern: Arrange
      const successValue = 'success';
      const syncFn = () => successValue;
      const asyncFn = () => Promise.resolve(successValue);

      // AAA Pattern: Act
      const syncResult = safeSync(syncFn, ErrorTypes.NETWORK);
      const asyncResult = await safeAsync(asyncFn, ErrorTypes.NETWORK);

      // AAA Pattern: Assert
      expect(syncResult).toBe(successValue);
      expect(asyncResult).toBe(successValue);
    });

    it('ISP: 必要なエラー情報のみを公開', () => {
      // AAA Pattern: Arrange
      const error = new Error('Test');

      // AAA Pattern: Act
      const result = handleError(ErrorTypes.IMAGE_LOAD, error);

      // AAA Pattern: Assert
      // 必要なプロパティのみが含まれる
      const expectedProperties = ['name', 'message', 'type', 'originalError', 'timestamp', 'stack'];
      const actualProperties = Object.getOwnPropertyNames(result);

      expectedProperties.forEach(prop => {
        expect(actualProperties).toContain(prop);
      });

      // 不要なプロパティは含まれない
      expect(result).not.toHaveProperty('userId');
      expect(result).not.toHaveProperty('sessionId');
      expect(result).not.toHaveProperty('browserInfo');
    });

    it('DIP: 具体的なログ実装ではなく抽象化に依存', () => {
      // AAA Pattern: Arrange
      const error = new Error('Test');

      // AAA Pattern: Act
      const result = handleError(ErrorTypes.NETWORK, error);

      // AAA Pattern: Assert
      // エラーハンドラーは具体的なログ実装に依存せず、
      // 抽象化されたエラーオブジェクトを生成する
      expect(result).toBeInstanceOf(Error);
      expect(result.type).toBe(ErrorTypes.NETWORK);
      expect(result.originalError).toBe(error);
      
      // ログ出力は副作用であり、メインの機能ではない
      expect(result.message).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('パフォーマンスとメモリ効率', () => {
    it('大量のエラー処理でもメモリリークが発生しない', () => {
      // AAA Pattern: Arrange
      const initialMemory = process.memoryUsage().heapUsed;
      const errorCount = 1000;

      // AAA Pattern: Act
      for (let i = 0; i < errorCount; i++) {
        const error = new Error(`Error ${i}`);
        handleError(ErrorTypes.NETWORK, error);
      }

      // AAA Pattern: Assert
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // 1000エラーで2MB以内の増加であれば許容範囲
      expect(memoryIncrease).toBeLessThan(2 * 1024 * 1024);
    });

    it('エラーハンドリングが高速に実行される', () => {
      // AAA Pattern: Arrange
      const startTime = performance.now();
      const iterationCount = 10000;

      // AAA Pattern: Act
      for (let i = 0; i < iterationCount; i++) {
        const error = new Error(`Performance test ${i}`);
        handleError(ErrorTypes.CANVAS_RENDER, error);
      }

      const endTime = performance.now();

      // AAA Pattern: Assert
      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(1000); // 1秒以内
    });
  });

  describe('統合シナリオテスト', () => {
    it('複数のエラー処理を連続して実行', async () => {
      // AAA Pattern: Arrange
      const scenarios = [
        { type: ErrorTypes.FONT_LOADING, fn: () => Promise.reject(new Error('Font error')) },
        { type: ErrorTypes.IMAGE_LOAD, fn: () => { throw new Error('Image error'); } },
        { type: ErrorTypes.FILE_DOWNLOAD, fn: () => Promise.reject(new Error('Download error')) },
        { type: ErrorTypes.CANVAS_RENDER, fn: () => { throw new Error('Render error'); } }
      ];

      // AAA Pattern: Act
      const results = await Promise.all([
        safeAsync(scenarios[0].fn, scenarios[0].type),
        safeSync(scenarios[1].fn, scenarios[1].type),
        safeAsync(scenarios[2].fn, scenarios[2].type),
        safeSync(scenarios[3].fn, scenarios[3].type)
      ]);

      // AAA Pattern: Assert
      results.forEach((result, index) => {
        expect(result).toBeInstanceOf(Error);
        expect(result.name).toBe('AppError');
        expect(result.type).toBe(scenarios[index].type);
      });
    });

    it('ネストしたエラー処理の統合', async () => {
      // AAA Pattern: Arrange
      const nestedAsyncFn = async () => {
        const step1 = await safeAsync(
          () => Promise.reject(new Error('Step 1 failed')),
          ErrorTypes.NETWORK
        );
        
        if (step1 instanceof Error) {
          throw new Error('Step 1 error cascaded');
        }
      };

      // AAA Pattern: Act
      const result = await safeAsync(nestedAsyncFn, ErrorTypes.FILE_DOWNLOAD);

      // AAA Pattern: Assert
      expect(result).toBeInstanceOf(Error);
      expect(result.type).toBe(ErrorTypes.FILE_DOWNLOAD);
      expect(result.originalError.message).toBe('Step 1 error cascaded');
    });
  });
});