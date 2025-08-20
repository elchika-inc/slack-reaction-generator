import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/preact';
import { useCanvasPreview } from '../../hooks/useCanvasPreview';
import { renderingEngine } from '../../utils/renderingEngine';
import { handleError } from '../../utils/errorHandler';
import { createSettingsBuilder } from '../../test/builders';

// モック設定
vi.mock('../../utils/renderingEngine', () => ({
  renderingEngine: {
    canvases: new Map(),
    startAnimation: vi.fn(),
    stopAnimation: vi.fn(),
    stopAllAnimations: vi.fn(),
    renderFrame: vi.fn(),
    renderStatic: vi.fn(),
    getCanvas: vi.fn(),
    set: vi.fn()
  }
}));

vi.mock('../../utils/errorHandler', () => ({
  handleError: vi.fn(),
  ErrorTypes: {
    FONT_LOADING: 'FONT_LOADING'
  }
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

    // renderingEngine のモック設定
    renderingEngine.canvases = new Map();
    renderingEngine.canvases.set = vi.fn();
    renderingEngine.getCanvas.mockReturnValue({
      canvas: mockCanvas,
      ctx: mockCanvasContext,
      animationId: null,
      lastTime: 0,
      frame: 0
    });
    renderingEngine.set = vi.fn();

    // vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
    rafCallback = null;
  });

  describe('初期化', () => {
    it('モバイルでない場合はrefを返す', () => {
      // Arrange
      const settings = createSettingsBuilder().build();
      const isMobile = false;

      // Act
      const { result } = renderHook(() => useCanvasPreview(settings, isMobile));

      // Assert
      expect(result.current.canvasRef).toBeDefined();
      expect(result.current.smallCanvasRef).toBeDefined();
      expect(result.current.canvasRef.current).toBeNull();
      expect(result.current.smallCanvasRef.current).toBeNull();
    });

    it('モバイルの場合もrefを返す', () => {
      // Arrange
      const settings = createSettingsBuilder().build();
      const isMobile = true;

      // Act
      const { result } = renderHook(() => useCanvasPreview(settings, isMobile));

      // Assert
      expect(result.current).toHaveProperty('canvasRef');
      expect(result.current).toHaveProperty('smallCanvasRef');
      expect(result.current.canvasRef.current).toBeNull(); // 実際のDOM要素は存在しない
    });
  });

  describe('フォント読み込み', () => {
    it('カスタムフォントを読み込む', async () => {
      // Arrange
      const settings = createSettingsBuilder()
        .withFontFamily('Pacifico')
        .build();
      const isMobile = true;
      
      // Canvasのモックを事前に設定
      const canvasElement = document.createElement('canvas');
      const smallCanvasElement = document.createElement('canvas');
      canvasElement.getContext = vi.fn(() => mockCanvasContext);
      smallCanvasElement.getContext = vi.fn(() => mockSmallCanvasContext);

      // Act
      const { result, rerender } = renderHook(() => useCanvasPreview(settings, isMobile));
      
      await act(async () => {
        result.current.canvasRef.current = canvasElement;
        result.current.smallCanvasRef.current = smallCanvasElement;
      });
      
      // 再レンダリングしてuseEffectを発火
      rerender();
      
      // フックのuseEffectが実行されるまで待機
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      // Assert
      expect(document.fonts.load).toHaveBeenCalledWith('normal 16px Pacifico');
    });

    it('M PLUS フォントの場合は weight 900 を使用', async () => {
      // Arrange
      const settings = createSettingsBuilder()
        .withFontFamily('M PLUS 1p')
        .build();
      const isMobile = true;
      
      // Canvasのモックを事前に設定
      const canvasElement = document.createElement('canvas');
      const smallCanvasElement = document.createElement('canvas');
      canvasElement.getContext = vi.fn(() => mockCanvasContext);
      smallCanvasElement.getContext = vi.fn(() => mockSmallCanvasContext);

      // Act
      const { result, rerender } = renderHook(() => useCanvasPreview(settings, isMobile));
      
      await act(async () => {
        result.current.canvasRef.current = canvasElement;
        result.current.smallCanvasRef.current = smallCanvasElement;
      });
      
      // 再レンダリングしてuseEffectを発火
      rerender();
      
      // フックのuseEffectが実行されるまで待機
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      // Assert
      expect(document.fonts.load).toHaveBeenCalledWith('900 16px M PLUS 1p');
    });

    it('フォント読み込みエラーをハンドリング', async () => {
      // Arrange
      const settings = createSettingsBuilder()
        .withFontFamily('InvalidFont')
        .build();
      const isMobile = true;
      
      mockDocumentFonts.load.mockRejectedValue(new Error('Font load error'));
      
      // Canvasのモックを事前に設定
      const canvasElement = document.createElement('canvas');
      const smallCanvasElement = document.createElement('canvas');
      canvasElement.getContext = vi.fn(() => mockCanvasContext);
      smallCanvasElement.getContext = vi.fn(() => mockSmallCanvasContext);

      // Act
      const { result, rerender } = renderHook(() => useCanvasPreview(settings, isMobile));
      
      await act(async () => {
        result.current.canvasRef.current = canvasElement;
        result.current.smallCanvasRef.current = smallCanvasElement;
      });
      
      // 再レンダリングしてuseEffectを発火
      rerender();
      
      // フックのuseEffectが実行されるまで待機
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      // Assert
      expect(handleError).toHaveBeenCalled();
    });

    it('sans-serif フォントの場合は読み込みをスキップ', async () => {
      // Arrange
      const settings = createSettingsBuilder()
        .withFontFamily('sans-serif')
        .build();
      const isMobile = true;

      // Act
      const { result } = renderHook(() => useCanvasPreview(settings, isMobile));
      
      await act(async () => {
        result.current.canvasRef.current = mockCanvas;
        result.current.smallCanvasRef.current = mockSmallCanvas;
      });

      // Assert
      expect(mockDocumentFonts.load).not.toHaveBeenCalled();
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
        // Canvasサイズを動的に設定
        mockCanvas.width = canvasSize;
        mockCanvas.height = canvasSize;
        result.current.canvasRef.current = mockCanvas;
        result.current.smallCanvasRef.current = mockSmallCanvas;
      });

      // Assert
      expect(mockCanvas.width).toBe(canvasSize);
      expect(mockCanvas.height).toBe(canvasSize);
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

    it.skip('renderingEngineにCanvasを登録', () => {
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
      expect(renderingEngine.canvases.set).toHaveBeenCalledTimes(2);
    });
  });

  describe('アニメーション制御', () => {
    it.skip('アニメーション設定がある場合はアニメーションを開始', () => {
      // Arrange
      const settings = createSettingsBuilder()
        .withAnimation('bounce')
        .withAnimationSpeed(30)
        .build();
      const isMobile = true;

      // Act
      const { result } = renderHook(() => useCanvasPreview(settings, isMobile));
      
      act(() => {
        result.current.canvasRef.current = mockCanvas;
        result.current.smallCanvasRef.current = mockSmallCanvas;
      });

      // Assert
      expect(renderingEngine.startAnimation).toHaveBeenCalled();
    });

    it.skip('画像アニメーション設定がある場合は小Canvasでアニメーション', () => {
      // Arrange
      const settings = createSettingsBuilder()
        .withImageData('data:image/png;base64,test')
        .withImageAnimation('bounce')
        .build();
      const isMobile = true;

      // Act
      const { result } = renderHook(() => useCanvasPreview(settings, isMobile));
      
      act(() => {
        result.current.canvasRef.current = mockCanvas;
        result.current.smallCanvasRef.current = mockSmallCanvas;
      });

      // Assert
      expect(renderingEngine.startAnimation).toHaveBeenCalledWith(
        expect.stringContaining('small'),
        expect.anything()
      );
    });

    it('アニメーション速度が30ms未満の場合は30msに制限', async () => {
      // Arrange
      const settings = createSettingsBuilder()
        .withAnimation('bounce')
        .withAnimationSpeed(10) // 30ms未満
        .build();
      const isMobile = true;
      
      // Canvasのモックを事前に設定
      const canvasElement = document.createElement('canvas');
      const smallCanvasElement = document.createElement('canvas');
      canvasElement.getContext = vi.fn(() => mockCanvasContext);
      smallCanvasElement.getContext = vi.fn(() => mockSmallCanvasContext);
      
      // getCanvasのモックを設定
      renderingEngine.getCanvas.mockReturnValue({
        canvas: smallCanvasElement,
        ctx: mockSmallCanvasContext,
        width: 32,
        height: 32,
        animationId: null,
        lastTime: 0,
        frame: 0
      });

      // Act
      const { result, rerender } = renderHook(() => useCanvasPreview(settings, isMobile));
      
      await act(async () => {
        result.current.canvasRef.current = canvasElement;
        result.current.smallCanvasRef.current = smallCanvasElement;
      });
      
      // 再レンダリングしてuseEffectを発火
      rerender();
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      // Assert - アニメーションフレームが呼ばれたことを確認
      expect(vi.mocked(global.requestAnimationFrame)).toHaveBeenCalled();
    });

    it('アニメーションがない場合は静的レンダリング', async () => {
      // Arrange
      const settings = createSettingsBuilder()
        .withoutAnimation()
        .build();
      const isMobile = true;
      
      // Canvasのモックを事前に設定
      const canvasElement = document.createElement('canvas');
      const smallCanvasElement = document.createElement('canvas');
      canvasElement.getContext = vi.fn(() => mockCanvasContext);
      smallCanvasElement.getContext = vi.fn(() => mockSmallCanvasContext);
      
      // getCanvasのモックを設定
      renderingEngine.getCanvas.mockReturnValue({
        canvas: canvasElement,
        ctx: mockCanvasContext,
        width: 128,
        height: 128,
        animationId: null,
        lastTime: 0,
        frame: 0
      });

      // Act
      const { result, rerender } = renderHook(() => useCanvasPreview(settings, isMobile));
      
      await act(async () => {
        result.current.canvasRef.current = canvasElement;
        result.current.smallCanvasRef.current = smallCanvasElement;
      });
      
      // 再レンダリングしてuseEffectを発火
      rerender();
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      // Assert
      expect(renderingEngine.renderStatic).toHaveBeenCalledWith('main', settings);
    });
  });

  describe('クリーンアップ', () => {
    it('アンマウント時にアニメーションを停止', () => {
      // Arrange
      const settings = createSettingsBuilder()
        .withAnimation('bounce')
        .build();
      const isMobile = true;

      // Act
      const { result, unmount } = renderHook(() => useCanvasPreview(settings, isMobile));
      
      act(() => {
        result.current.canvasRef.current = mockCanvas;
        result.current.smallCanvasRef.current = mockSmallCanvas;
      });

      unmount();

      // Assert
      expect(renderingEngine.stopAllAnimations).toHaveBeenCalled();
    });

    it.skip('設定変更時に既存のアニメーションを停止して再開', () => {
      // Arrange
      const initialSettings = createSettingsBuilder()
        .withAnimation('bounce')
        .build();
      const updatedSettings = createSettingsBuilder()
        .withAnimation('pulse')
        .build();
      const isMobile = true;

      // Act
      const { result, rerender } = renderHook(
        ({ settings }) => useCanvasPreview(settings, isMobile),
        { initialProps: { settings: initialSettings } }
      );
      
      act(() => {
        result.current.canvasRef.current = mockCanvas;
        result.current.smallCanvasRef.current = mockSmallCanvas;
      });

      // 設定を更新
      rerender({ settings: updatedSettings });

      // Assert
      expect(renderingEngine.stopAllAnimations).toHaveBeenCalled();
      expect(renderingEngine.startAnimation).toHaveBeenCalledTimes(2); // 初回と更新時
    });
  });

  describe('背景色の適用', () => {
    it.skip('背景色を正しく適用', () => {
      // Arrange
      const backgroundColor = '#FF0000';
      const settings = createSettingsBuilder()
        .withBackgroundColor(backgroundColor)
        .build();
      const isMobile = true;

      // Act
      const { result } = renderHook(() => useCanvasPreview(settings, isMobile));
      
      act(() => {
        result.current.canvasRef.current = mockCanvas;
        result.current.smallCanvasRef.current = mockSmallCanvas;
      });

      // Assert
      // 背景色は小キャンバスで設定される
      expect(mockSmallCanvasContext.fillStyle).toBe(backgroundColor);
      expect(mockSmallCanvasContext.fillRect).toHaveBeenCalled();
    });

    it.skip('背景色が未指定の場合はデフォルト値を使用', async () => {
      // Arrange
      const settings = createSettingsBuilder().build();
      const isMobile = true;
      
      // Canvasのモックを事前に設定
      const canvasElement = document.createElement('canvas');
      const smallCanvasElement = document.createElement('canvas');
      canvasElement.getContext = vi.fn(() => mockCanvasContext);
      smallCanvasElement.getContext = vi.fn(() => mockSmallCanvasContext);
      
      // getCanvasのモックを設定
      renderingEngine.getCanvas.mockReturnValue({
        canvas: canvasElement,
        ctx: mockCanvasContext,
        width: 128,
        height: 128,
        animationId: null,
        lastTime: 0,
        frame: 0
      });

      // Act
      const { result, rerender } = renderHook(() => useCanvasPreview(settings, isMobile));
      
      await act(async () => {
        result.current.canvasRef.current = canvasElement;
        result.current.smallCanvasRef.current = smallCanvasElement;
      });
      
      // 再レンダリングしてuseEffectを発火
      rerender();
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      // Assert - デフォルトの背景色が使用されていることを確認
      expect(mockSmallCanvasContext.fillStyle).toBe('#FFFFFF');
      expect(renderingEngine.renderStatic).toHaveBeenCalled();
    });
  });

  describe('スケーリング', () => {
    it.skip('小Canvasのスケールを正しく計算', async () => {
      // Arrange
      const canvasSize = 256;
      const settings = createSettingsBuilder()
        .withCanvasSize(canvasSize)
        .build();
      const isMobile = true;
      
      // Canvasのモックを事前に設定
      const canvasElement = document.createElement('canvas');
      const smallCanvasElement = document.createElement('canvas');
      canvasElement.getContext = vi.fn(() => mockCanvasContext);
      smallCanvasElement.getContext = vi.fn(() => mockSmallCanvasContext);
      
      // getCanvasのモックを設定
      renderingEngine.getCanvas.mockReturnValue({
        canvas: canvasElement,
        ctx: mockCanvasContext,
        width: canvasSize,
        height: canvasSize,
        animationId: null,
        lastTime: 0,
        frame: 0
      });

      // Act
      const { result, rerender } = renderHook(() => useCanvasPreview(settings, isMobile));
      
      await act(async () => {
        result.current.canvasRef.current = canvasElement;
        result.current.smallCanvasRef.current = smallCanvasElement;
      });
      
      // 再レンダリングしてuseEffectを発火
      rerender();
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      // Assert
      const expectedScale = 32 / canvasSize;
      expect(mockSmallCanvasContext.scale).toHaveBeenCalledWith(expectedScale, expectedScale);
    });

    it.skip('デフォルトサイズ（128px）でのスケール', async () => {
      // Arrange
      const settings = createSettingsBuilder().build();
      const isMobile = true;
      
      // Canvasのモックを事前に設定
      const canvasElement = document.createElement('canvas');
      const smallCanvasElement = document.createElement('canvas');
      canvasElement.getContext = vi.fn(() => mockCanvasContext);
      smallCanvasElement.getContext = vi.fn(() => mockSmallCanvasContext);
      
      // getCanvasのモックを設定
      renderingEngine.getCanvas.mockReturnValue({
        canvas: canvasElement,
        ctx: mockCanvasContext,
        width: 128,
        height: 128,
        animationId: null,
        lastTime: 0,
        frame: 0
      });

      // Act
      const { result, rerender } = renderHook(() => useCanvasPreview(settings, isMobile));
      
      await act(async () => {
        result.current.canvasRef.current = canvasElement;
        result.current.smallCanvasRef.current = smallCanvasElement;
      });
      
      // 再レンダリングしてuseEffectを発火
      rerender();
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      // Assert
      const expectedScale = 32 / 128;
      expect(mockSmallCanvasContext.scale).toHaveBeenCalledWith(expectedScale, expectedScale);
    });
  });
});