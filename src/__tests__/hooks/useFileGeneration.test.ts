import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/preact';
import { useFileGeneration } from '../../hooks/useFileGeneration';
import { generateIconData } from '../../utils/canvasUtils';
import { createSettingsBuilder } from '../support/builders';

// モック設定
vi.mock('../../utils/canvasUtils', () => ({
  generateIconData: vi.fn()
}));

// file-saver のモック - 動的インポートをモック
const mockSaveAs = vi.fn();
vi.mock('file-saver', () => ({
  saveAs: mockSaveAs
}));

// fetch のモック
global.fetch = vi.fn();

describe('useFileGeneration', () => {
  let mockBlob;
  let mockResponse;

  beforeEach(() => {
    // Blob モック
    mockBlob = new Blob(['test'], { type: 'image/png' });
    
    // Response モック
    mockResponse = {
      blob: vi.fn().mockResolvedValue(mockBlob)
    };
    
    // fetch モックの設定
    global.fetch.mockResolvedValue(mockResponse);
    
    // generateIconData のモック設定 - デフォルト値を設定
    generateIconData.mockResolvedValue('data:image/png;base64,test');
    
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('初期状態', () => {
    it('初期状態でpreviewDataがnull', () => {
      // Arrange & Act
      const { result } = renderHook(() => useFileGeneration());

      // Assert
      expect(result.current.previewData).toBeNull();
      expect(result.current.handleGeneratePreview).toBeInstanceOf(Function);
    });
  });

  describe('プレビュー生成', () => {
    it('デスクトップでプレビューデータを生成', async () => {
      // Arrange
      const settings = createSettingsBuilder()
        .withText('テスト')
        .withFontSize(60)
        .build();
      const isMobile = false;
      const expectedData = 'data:image/png;base64,test';
      
      // generateIconDataのモック設定
      generateIconData.mockResolvedValue(expectedData);
      
      const { result } = renderHook(() => useFileGeneration());

      // Act
      await act(async () => {
        await result.current.handleGeneratePreview(settings, isMobile);
      });

      // Assert
      expect(generateIconData).toHaveBeenCalledWith(settings);
      expect(result.current.previewData).toBe(expectedData);
      expect(global.fetch).not.toHaveBeenCalled(); // デスクトップではダウンロードしない
    });

    it('モバイルでプレビューデータを生成してダウンロード（PNG）', async () => {
      // Arrange
      const settings = createSettingsBuilder()
        .withText('テスト')
        .withAnimation('none')  // animationがnoneの場合はPNG
        .build();
      const isMobile = true;
      const expectedData = 'data:image/png;base64,test';
      
      // PNG用のモック設定
      generateIconData.mockResolvedValueOnce(expectedData);
      mockSaveAs.mockClear();
      
      const { result } = renderHook(() => useFileGeneration());

      // Act
      await act(async () => {
        await result.current.handleGeneratePreview(settings, isMobile);
      });

      // Assert
      expect(generateIconData).toHaveBeenCalledWith(settings);
      expect(result.current.previewData).toBe(expectedData);
      expect(global.fetch).toHaveBeenCalledWith(expectedData);
      expect(mockResponse.blob).toHaveBeenCalled();
      
      // ファイル名の検証（PNG拡張子）
      expect(mockSaveAs).toHaveBeenCalledWith(
        mockBlob,
        expect.stringMatching(/^slack-reaction-\d+\.png$/)
      );
    });

    it('モバイルでプレビューデータを生成してダウンロード（GIF）', async () => {
      // Arrange
      const settings = createSettingsBuilder()
        .withText('テスト')
        .withAnimation('bounce')
        .build();
      const isMobile = true;
      const expectedData = 'data:image/gif;base64,test';
      
      // GIF用のモック設定
      generateIconData.mockResolvedValueOnce(expectedData);
      mockSaveAs.mockClear();
      
      const { result } = renderHook(() => useFileGeneration());

      // Act
      await act(async () => {
        await result.current.handleGeneratePreview(settings, isMobile);
      });

      // Assert
      expect(generateIconData).toHaveBeenCalledWith(settings);
      expect(result.current.previewData).toBe(expectedData);
      expect(global.fetch).toHaveBeenCalledWith(expectedData);
      
      // ファイル名の検証（GIF拡張子）
      expect(mockSaveAs).toHaveBeenCalledWith(
        mockBlob,
        expect.stringMatching(/^slack-reaction-\d+\.gif$/)
      );
    });

    it('複数設定でプレビューデータを生成', async () => {
      // Arrange
      const settings = createSettingsBuilder()
        .withText('複雑')
        .withFontSize(80)
        .withFontColor('#FF0000')
        .withBackgroundColor('#0000FF')
        .withAnimation('slide')
        .withImageData('data:image/png;base64,image')
        .build();
      const isMobile = false;
      const expectedData = 'data:image/png;base64,complex';
      generateIconData.mockResolvedValue(expectedData);
      
      const { result } = renderHook(() => useFileGeneration());

      // Act
      await act(async () => {
        await result.current.handleGeneratePreview(settings, isMobile);
      });

      // Assert
      expect(generateIconData).toHaveBeenCalledWith(settings);
      expect(result.current.previewData).toBe(expectedData);
    });

    it('プレビューデータ生成時のエラーハンドリング', async () => {
      // Arrange
      const settings = createSettingsBuilder().build();
      const isMobile = false;
      const error = new Error('Generation failed');
      generateIconData.mockRejectedValue(error);
      
      // コンソール出力を一時的に抑制
      const consoleTracespy = vi.spyOn(console, 'trace').mockImplementation(() => {});
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const { result } = renderHook(() => useFileGeneration());

      // Act & Assert - エラーをキャッチする
      await act(async () => {
        try {
          await result.current.handleGeneratePreview(settings, isMobile);
        } catch (e) {
          expect(e).toBe(error);
        }
      });

      expect(generateIconData).toHaveBeenCalledWith(settings);
      consoleTracespy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('ダウンロード時のfetchエラーをハンドリング', async () => {
      // Arrange
      const settings = createSettingsBuilder()
        .withAnimation('none')
        .build();
      const isMobile = true;
      const expectedData = 'data:image/png;base64,test';
      const fetchError = new Error('Fetch failed');
      generateIconData.mockResolvedValue(expectedData);
      global.fetch.mockRejectedValue(fetchError);
      
      // コンソール出力を一時的に抑制
      const consoleTracespy = vi.spyOn(console, 'trace').mockImplementation(() => {});
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const { result } = renderHook(() => useFileGeneration());

      // Act - エラーが発生してもクラッシュしない
      await act(async () => {
        await result.current.handleGeneratePreview(settings, isMobile);
      });

      // Assert
      expect(generateIconData).toHaveBeenCalledWith(settings);
      expect(result.current.previewData).toBe(expectedData);
      expect(global.fetch).toHaveBeenCalledWith(expectedData);
      expect(mockSaveAs).not.toHaveBeenCalled(); // エラー時はsaveAsが呼ばれない
      consoleTracespy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('ダウンロード時のblobエラーをハンドリング', async () => {
      // Arrange
      const settings = createSettingsBuilder()
        .withAnimation('none')
        .build();
      const isMobile = true;
      const expectedData = 'data:image/png;base64,test';
      const blobError = new Error('Blob failed');
      generateIconData.mockResolvedValue(expectedData);
      mockResponse.blob.mockRejectedValue(blobError);
      
      // コンソール出力を一時的に抑制
      const consoleTracespy = vi.spyOn(console, 'trace').mockImplementation(() => {});
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const { result } = renderHook(() => useFileGeneration());

      // Act - エラーが発生してもクラッシュしない
      await act(async () => {
        await result.current.handleGeneratePreview(settings, isMobile);
      });

      // Assert
      expect(generateIconData).toHaveBeenCalledWith(settings);
      expect(result.current.previewData).toBe(expectedData);
      expect(global.fetch).toHaveBeenCalledWith(expectedData);
      expect(mockResponse.blob).toHaveBeenCalled();
      expect(mockSaveAs).not.toHaveBeenCalled(); // エラー時はsaveAsが呼ばれない
      consoleTracespy.mockRestore();
      consoleLogSpy.mockRestore();
    });
  });

  describe('状態更新', () => {
    it('複数回の生成で最新のデータを保持', async () => {
      // Arrange
      const settings1 = createSettingsBuilder()
        .withText('最初')
        .build();
      const settings2 = createSettingsBuilder()
        .withText('二番目')
        .build();
      const isMobile = false;
      
      const { result } = renderHook(() => useFileGeneration());
      
      // Act - 最初の生成
      generateIconData.mockResolvedValue('data:image/png;base64,first');
      await act(async () => {
        await result.current.handleGeneratePreview(settings1, isMobile);
      });
      
      const firstData = result.current.previewData;
      
      // Act - 二番目の生成
      generateIconData.mockResolvedValue('data:image/png;base64,second');
      await act(async () => {
        await result.current.handleGeneratePreview(settings2, isMobile);
      });
      
      // Assert
      expect(firstData).toBe('data:image/png;base64,first');
      expect(result.current.previewData).toBe('data:image/png;base64,second');
      expect(generateIconData).toHaveBeenCalledTimes(2);
    });

    it('異なるモードでの生成切り替え', async () => {
      // Arrange
      const settings = createSettingsBuilder()
        .withText('テスト')
        .withAnimation('none')
        .build();
      const expectedData = 'data:image/png;base64,test';
      generateIconData.mockResolvedValue(expectedData);
      
      const { result } = renderHook(() => useFileGeneration());
      
      // Act - デスクトップモード
      await act(async () => {
        await result.current.handleGeneratePreview(settings, false);
      });
      
      expect(global.fetch).not.toHaveBeenCalled();
      
      // Act - モバイルモード
      await act(async () => {
        await result.current.handleGeneratePreview(settings, true);
      });
      
      // Assert
      expect(global.fetch).toHaveBeenCalledWith(expectedData);
      expect(mockSaveAs).toHaveBeenCalled();
    });
  });

  describe('ファイル名生成', () => {
    it('タイムスタンプ付きのファイル名を生成', async () => {
      // Arrange
      const settings = createSettingsBuilder()
        .withAnimation('none')  // animationがnoneの場合はPNG
        .build();
      const isMobile = true;
      const timestamp = 1755650259369;
      vi.spyOn(Date, 'now').mockReturnValue(timestamp);
      generateIconData.mockResolvedValue('data:image/png;base64,test');
      
      const { result } = renderHook(() => useFileGeneration());

      // Act
      await act(async () => {
        await result.current.handleGeneratePreview(settings, isMobile);
      });

      // Assert
      expect(mockSaveAs).toHaveBeenCalledWith(
        mockBlob,
        `slack-reaction-${timestamp}.png`
      );
    });

    it('アニメーション設定に応じた拡張子選択', async () => {
      // Arrange
      const settings = createSettingsBuilder()
        .withAnimation('none')  // animationがnoneの場合はPNG
        .build();
      const isMobile = true;
      generateIconData.mockResolvedValue('data:image/png;base64,test');
      
      const { result } = renderHook(() => useFileGeneration());

      // Act
      await act(async () => {
        await result.current.handleGeneratePreview(settings, isMobile);
      });

      // Assert - PNG拡張子
      expect(mockSaveAs).toHaveBeenCalledWith(
        mockBlob,
        expect.stringMatching(/\.png$/)
      );
    });
  });

  describe('file-saver の遅延読み込み', () => {
    it('初回のみfile-saverを読み込む', async () => {
      // Arrange
      const settings = createSettingsBuilder()
        .withAnimation('none')
        .build();
      const isMobile = true;
      generateIconData.mockResolvedValue('data:image/png;base64,test');
      
      const { result } = renderHook(() => useFileGeneration());

      // Act - 初回
      await act(async () => {
        await result.current.handleGeneratePreview(settings, isMobile);
      });

      // Act - 二回目
      await act(async () => {
        await result.current.handleGeneratePreview(settings, isMobile);
      });

      // Assert
      expect(mockSaveAs).toHaveBeenCalledTimes(2);
    });
  });
});