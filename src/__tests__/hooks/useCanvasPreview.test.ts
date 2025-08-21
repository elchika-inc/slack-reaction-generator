import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/preact';
import { useCanvasPreview } from '../../hooks/useCanvasPreview';
import { canvasManager } from '../../utils/CanvasManager';
import { renderingEngine } from '../../utils/renderingEngine';
import { handleError } from '../../utils/errorHandler';
import { createSettingsBuilder } from '../support/builders';

// Test Double Pattern: CanvasManagerモック
// CanvasManagerはシングルトンパターンで実装されているためインスタンスとメソッドの両方をモック化
vi.mock('../../utils/CanvasManager', () => {
  const mockCanvasManagerInstance = {
    createCanvas: vi.fn(),
    getCanvas: vi.fn(),
    renderStatic: vi.fn(),
    startAnimation: vi.fn(),
    stopAnimation: vi.fn(),
    stopAllAnimations: vi.fn(),
    renderScaled: vi.fn(),
    initialized: false
  };

  return {
    canvasManager: mockCanvasManagerInstance,
    CanvasManager: {
      getInstance: vi.fn(() => mockCanvasManagerInstance)
    }
  };
});

// Test Double Pattern: レンダリングパイプラインモック
vi.mock('../../utils/RenderingPipelines', () => ({
  registerDefaultPipelines: vi.fn(),
  selectOptimalPipeline: vi.fn(() => 'default')
}));

vi.mock('../../utils/errorHandler', () => ({
  handleError: vi.fn(),
  ErrorTypes: {
    CANVAS_OPERATION: 'CANVAS_OPERATION',
    FONT_LOADING: 'FONT_LOADING'
  }
}));

// renderingEngineのモック
vi.mock('../../utils/renderingEngine', () => ({
  renderingEngine: {
    canvases: new Map(),
    startAnimation: vi.fn(),
    stopAnimation: vi.fn(),
    stopAllAnimations: vi.fn(),
    renderStatic: vi.fn(),
    renderScaled: vi.fn(),
    createCanvas: vi.fn(),
    getCanvas: vi.fn(),
    removeCanvas: vi.fn(),
    clear: vi.fn()
  },
  RenderingEngine: vi.fn()
}));

describe('useCanvasPreview', () => {
  let mockCanvasContext;
  let mockSmallCanvasContext;
  let mockCanvas;
  let mockSmallCanvas;
  let mockDocumentFonts;
  let rafCallback = null;

  beforeEach(() => {
    // Canvas モックの設定
    mockCanvasContext = {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      scale: vi.fn(),
      fillStyle: ''
    };

    mockSmallCanvasContext = {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      scale: vi.fn(),
      fillStyle: ''
    };

    mockCanvas = {
      width: 256,
      height: 256,
      getContext: vi.fn(() => mockCanvasContext)
    };

    mockSmallCanvas = {
      width: 32,
      height: 32,
      getContext: vi.fn(() => mockSmallCanvasContext)
    };

    // document.fonts のモック
    mockDocumentFonts = {
      load: vi.fn().mockResolvedValue()
    };
    
    // document.fonts のグローバルモック設定
    if (!document.fonts) {
      Object.defineProperty(document, 'fonts', {
        value: mockDocumentFonts,
        writable: true,
        configurable: true
      });
    } else {
      // 既存のfontsプロパティをスパイ
      vi.spyOn(document.fonts, 'load').mockImplementation(mockDocumentFonts.load);
    }

    // requestAnimationFrame のモック
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      rafCallback = callback;
      return 1;
    });

    // CanvasManagerのモックをリセット
    vi.mocked(canvasManager.createCanvas).mockReturnValue(mockCanvas);
    vi.mocked(canvasManager.getCanvas).mockReturnValue(null);
    vi.mocked(canvasManager.renderStatic).mockResolvedValue(undefined);
    vi.mocked(canvasManager.startAnimation).mockResolvedValue(undefined);
    vi.mocked(canvasManager.stopAnimation).mockImplementation(() => {});
    vi.mocked(canvasManager.stopAllAnimations).mockImplementation(() => {});
    vi.mocked(canvasManager.renderScaled).mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    rafCallback = null;
  });

  describe('初期化', () => {
    it('モバイルでない場合はrefを返す', () => {
      // Arrange - AAA Pattern
      const settings = createSettingsBuilder().build();
      const isMobile = false;
      
      // Act
      const { result } = renderHook(() => useCanvasPreview(settings, isMobile));
      
      // Assert
      expect(result.current.canvasRef).toBeDefined();
      expect(result.current.canvasRef.current).toBeNull();
      expect(result.current.smallCanvasRef).toBeDefined();
      expect(result.current.smallCanvasRef.current).toBeNull();
    });

    it('モバイルの場合もrefを返す', () => {
      // Arrange - AAA Pattern
      const settings = createSettingsBuilder().build();
      const isMobile = true;
      
      // Act
      const { result } = renderHook(() => useCanvasPreview(settings, isMobile));
      
      // Assert
      expect(result.current.canvasRef).toBeDefined();
      expect(result.current.canvasRef.current).toBeNull();
      expect(result.current.smallCanvasRef).toBeDefined();
      expect(result.current.smallCanvasRef.current).toBeNull();
    });
  });

  describe('Canvas 初期化', () => {
    it('メインCanvasを正しいサイズで初期化', () => {
      // Arrange
      const canvasSize = 256;
      const settings = createSettingsBuilder()
        .withCanvasSize(canvasSize)
        .build();
      const isMobile = true;

      // Act
      const { result } = renderHook(() => useCanvasPreview(settings, isMobile));
      
      act(() => {
        result.current.canvasRef.current = mockCanvas;
        result.current.smallCanvasRef.current = mockSmallCanvas;
      });

      // Assert
      expect(mockCanvas.width).toBe(256);
      expect(mockCanvas.height).toBe(256);
    });

    it('小Canvasを32x32で初期化', () => {
      // Arrange
      const settings = createSettingsBuilder().build();
      const isMobile = true;

      // Act
      const { result } = renderHook(() => useCanvasPreview(settings, isMobile));
      
      act(() => {
        result.current.canvasRef.current = mockCanvas;
        result.current.smallCanvasRef.current = mockSmallCanvas;
      });

      // Assert
      expect(mockSmallCanvas.width).toBe(32);
      expect(mockSmallCanvas.height).toBe(32);
    });
  });

  describe('アニメーション制御', () => {
    it('アニメーション速度が30ms未満の場合は30msに制限', async () => {
      // Arrange - AAA Pattern
      const initialSettings = createSettingsBuilder()
        .withAnimation('bounce')
        .withAnimationSpeed(10) // 30ms未満
        .build();
      const isMobile = true;
      
      // Test Double: CanvasManagerのモックを設定
      vi.mocked(canvasManager.getCanvas).mockReturnValue(null);
      vi.mocked(canvasManager.startAnimation).mockResolvedValue(undefined);

      // Act
      const { result, rerender } = renderHook(
        ({ settings, mobile }) => useCanvasPreview(settings, mobile),
        { initialProps: { settings: initialSettings, mobile: isMobile } }
      );
      
      const canvasElement = document.createElement('canvas');
      const smallCanvasElement = document.createElement('canvas');
      canvasElement.getContext = vi.fn(() => mockCanvasContext);
      smallCanvasElement.getContext = vi.fn(() => mockSmallCanvasContext);
      
      act(() => {
        result.current.canvasRef.current = canvasElement;
        result.current.smallCanvasRef.current = smallCanvasElement;
      });
      
      const newSettings = createSettingsBuilder()
        .withAnimation('bounce')
        .withAnimationSpeed(10)
        .withText('Test')
        .build();
      
      await act(async () => {
        rerender({ settings: newSettings, mobile: isMobile });
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Assert - アニメーションが30msで開始されたことを確認
      expect(canvasManager.startAnimation).toHaveBeenCalledWith(
        'main',
        newSettings,
        30, // 最小限制値
        'default'
      );
    });

    it('アニメーションがない場合は静的レンダリング', async () => {
      // Arrange - AAA Pattern
      const initialSettings = createSettingsBuilder()
        .withoutAnimation()
        .build();
      const isMobile = true;
      
      // Test Double: CanvasManagerのモックを設定
      vi.mocked(canvasManager.getCanvas).mockReturnValue(null);
      vi.mocked(canvasManager.renderStatic).mockResolvedValue(undefined);

      // Act
      const { result, rerender } = renderHook(
        ({ settings, mobile }) => useCanvasPreview(settings, mobile),
        { initialProps: { settings: initialSettings, mobile: isMobile } }
      );
      
      const canvasElement = document.createElement('canvas');
      const smallCanvasElement = document.createElement('canvas');
      canvasElement.getContext = vi.fn(() => mockCanvasContext);
      smallCanvasElement.getContext = vi.fn(() => mockSmallCanvasContext);
      
      act(() => {
        result.current.canvasRef.current = canvasElement;
        result.current.smallCanvasRef.current = smallCanvasElement;
      });
      
      const newSettings = createSettingsBuilder()
        .withoutAnimation()
        .withText('Test')
        .build();
      
      await act(async () => {
        rerender({ settings: newSettings, mobile: isMobile });
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Assert
      expect(canvasManager.renderStatic).toHaveBeenCalledWith(
        'main',
        newSettings,
        'default'
      );
    });
  });

  describe('クリーンアップ', () => {
    it('アンマウント時にアニメーションを停止', () => {
      // Arrange - AAA Pattern
      const settings = createSettingsBuilder()
        .withAnimation('bounce')
        .build();
      const isMobile = true;
      
      // Test Double: CanvasManagerのモックを設定
      vi.mocked(canvasManager.stopAnimation).mockImplementation(() => {});
      vi.mocked(canvasManager.stopAllAnimations).mockImplementation(() => {});

      // Act
      const { result, unmount } = renderHook(() => useCanvasPreview(settings, isMobile));
      
      act(() => {
        result.current.canvasRef.current = mockCanvas;
        result.current.smallCanvasRef.current = mockSmallCanvas;
      });

      // アンマウントしてクリーンアップをトリガー
      unmount();

      // Assert - CanvasManagerのクリーンアップが呼ばれることを確認
      expect(canvasManager.stopAllAnimations).toHaveBeenCalled();
    });
  });
});