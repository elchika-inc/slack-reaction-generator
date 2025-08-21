import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/preact';
import { useCanvasPreview } from '../../hooks/useCanvasPreview';
import { handleError } from '../../utils/errorHandler';
import * as canvasUtils from '../../utils/canvasUtils';
import { createSettingsBuilder } from '../support/builders';

// canvasUtilsのモック
vi.mock('../../utils/canvasUtils', () => ({
  drawAnimationFrame: vi.fn(),
  drawTextIcon: vi.fn()
}));

vi.mock('../../utils/errorHandler', () => ({
  handleError: vi.fn(),
  ErrorTypes: {
    CANVAS_RENDER: 'CANVAS_RENDER',
    FONT_LOADING: 'FONT_LOADING'
  }
}));

describe('useCanvasPreview', () => {
  let mockCanvasContext;
  let mockSmallCanvasContext;
  let mockCanvas;
  let mockSmallCanvas;
  let rafCallbacks: Function[] = [];
  let rafId = 0;

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
      width: 128,
      height: 128,
      getContext: vi.fn(() => mockCanvasContext)
    };

    mockSmallCanvas = {
      width: 32,
      height: 32,
      getContext: vi.fn(() => mockSmallCanvasContext)
    };

    // requestAnimationFrameのモック
    rafCallbacks = [];
    rafId = 0;
    vi.stubGlobal('requestAnimationFrame', vi.fn((callback) => {
      const id = ++rafId;
      rafCallbacks.push(callback);
      return id;
    }));

    vi.stubGlobal('cancelAnimationFrame', vi.fn((id) => {
      // 実際のキャンセル処理をシミュレート
      rafCallbacks = rafCallbacks.filter((_, index) => index + 1 !== id);
    }));

    // モックをリセット
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  describe('初期化', () => {
    it('モバイルでない場合はrefを返す', () => {
      const settings = createSettingsBuilder().build();
      const isMobile = false;
      
      const { result } = renderHook(() => useCanvasPreview(settings, isMobile));
      
      expect(result.current.canvasRef).toBeDefined();
      expect(result.current.smallCanvasRef).toBeDefined();
      expect(result.current.canvasRef.current).toBeNull();
      expect(result.current.smallCanvasRef.current).toBeNull();
    });

    it('モバイルの場合もrefを返す', () => {
      const settings = createSettingsBuilder().build();
      const isMobile = true;
      
      const { result } = renderHook(() => useCanvasPreview(settings, isMobile));
      
      expect(result.current.canvasRef).toBeDefined();
      expect(result.current.smallCanvasRef).toBeDefined();
    });
  });

  describe('Canvas 初期化', () => {
    it('メインCanvasを正しいサイズで初期化', () => {
      const initialSettings = createSettingsBuilder()
        .withCanvasSize(128)
        .build();
      const isMobile = true;
      
      const { result, rerender } = renderHook(
        ({ settings }) => useCanvasPreview(settings, isMobile),
        { initialProps: { settings: initialSettings } }
      );
      
      // キャンバスを設定
      act(() => {
        result.current.canvasRef.current = mockCanvas;
        result.current.smallCanvasRef.current = mockSmallCanvas;
      });
      
      // 設定を変更してキャンバスサイズを更新
      const newSettings = createSettingsBuilder()
        .withCanvasSize(256)
        .build();
      
      act(() => {
        rerender({ settings: newSettings });
      });
      
      expect(mockCanvas.width).toBe(256);
    });

    it('小Canvasを32x32で初期化', () => {
      const initialSettings = createSettingsBuilder().build();
      const isMobile = true;
      
      const { result, rerender } = renderHook(
        ({ settings }) => useCanvasPreview(settings, isMobile),
        { initialProps: { settings: initialSettings } }
      );
      
      act(() => {
        result.current.canvasRef.current = mockCanvas;
        result.current.smallCanvasRef.current = mockSmallCanvas;
      });
      
      // 設定を更新してトリガー
      const newSettings = createSettingsBuilder()
        .withText('Test')
        .build();
      
      act(() => {
        rerender({ settings: newSettings });
      });
      
      expect(mockSmallCanvas.width).toBe(32);
      expect(mockSmallCanvas.height).toBe(32);
    });
  });

  describe('アニメーション制御', () => {
    it('アニメーション付きの場合はrequestAnimationFrameが呼ばれる', async () => {
      const initialSettings = createSettingsBuilder()
        .withoutAnimation()
        .build();
      const isMobile = true;
      
      const { result, rerender } = renderHook(
        ({ settings }) => useCanvasPreview(settings, isMobile),
        { initialProps: { settings: initialSettings } }
      );
      
      act(() => {
        result.current.canvasRef.current = mockCanvas;
        result.current.smallCanvasRef.current = mockSmallCanvas;
      });
      
      // アニメーション付きの設定に変更
      const newSettings = createSettingsBuilder()
        .withAnimation('bounce')
        .withAnimationSpeed(20)
        .build();
      
      act(() => {
        rerender({ settings: newSettings });
      });
      
      // requestAnimationFrameが呼ばれたことを確認
      expect(requestAnimationFrame).toHaveBeenCalled();
      expect(rafCallbacks.length).toBeGreaterThan(0);
    });

    it('アニメーションがない場合は静的描画', () => {
      const initialSettings = createSettingsBuilder()
        .withoutAnimation()
        .build();
      const isMobile = true;
      
      const { result, rerender } = renderHook(
        ({ settings }) => useCanvasPreview(settings, isMobile),
        { initialProps: { settings: initialSettings } }
      );
      
      act(() => {
        result.current.canvasRef.current = mockCanvas;
        result.current.smallCanvasRef.current = mockSmallCanvas;
      });
      
      // まずアニメーション付きの設定に変更
      const animationSettings = createSettingsBuilder()
        .withAnimation('bounce')
        .build();
      
      act(() => {
        rerender({ settings: animationSettings });
      });
      
      // アニメーションが開始されたことを確認
      expect(requestAnimationFrame).toHaveBeenCalled();
      
      // モックをクリア
      vi.clearAllMocks();
      
      // アニメーションなしの設定に変更
      const newSettings = createSettingsBuilder()
        .withoutAnimation()
        .build();
      
      act(() => {
        rerender({ settings: newSettings });
      });
      
      // 静的描画の場合はdrawTextIconが呼ばれる
      expect(canvasUtils.drawTextIcon).toHaveBeenCalled();
      // 前のアニメーションはキャンセルされる
      expect(cancelAnimationFrame).toHaveBeenCalled();
      // 新しいアニメーションは開始されない
      expect(requestAnimationFrame).not.toHaveBeenCalled();
    });
  });

  describe('クリーンアップ', () => {
    it('アンマウント時にアニメーションを停止', () => {
      const initialSettings = createSettingsBuilder()
        .withoutAnimation()
        .build();
      const isMobile = true;
      
      const { result, rerender, unmount } = renderHook(
        ({ settings }) => useCanvasPreview(settings, isMobile),
        { initialProps: { settings: initialSettings } }
      );
      
      act(() => {
        result.current.canvasRef.current = mockCanvas;
        result.current.smallCanvasRef.current = mockSmallCanvas;
      });
      
      // アニメーション付きの設定に変更
      const newSettings = createSettingsBuilder()
        .withAnimation('bounce')
        .build();
      
      act(() => {
        rerender({ settings: newSettings });
      });
      
      // アニメーションが開始されたことを確認
      expect(requestAnimationFrame).toHaveBeenCalled();
      
      // アンマウント
      unmount();
      
      // cancelAnimationFrameが呼ばれたことを確認
      expect(cancelAnimationFrame).toHaveBeenCalled();
    });
  });

  describe('モバイル制御', () => {
    it('デスクトップの場合は初期化処理をスキップ', () => {
      const settings = createSettingsBuilder()
        .withAnimation('bounce')
        .build();
      const isMobile = false;
      
      const { result } = renderHook(() => useCanvasPreview(settings, isMobile));
      
      act(() => {
        result.current.canvasRef.current = mockCanvas;
        result.current.smallCanvasRef.current = mockSmallCanvas;
      });
      
      const { rerender } = renderHook(() => useCanvasPreview(settings, isMobile));
      
      act(() => {
        rerender();
      });
      
      // デスクトップの場合はcanvasの初期化が行われない
      expect(mockCanvas.getContext).not.toHaveBeenCalled();
      expect(requestAnimationFrame).not.toHaveBeenCalled();
    });
  });
});