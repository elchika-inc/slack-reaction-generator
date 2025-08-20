import { describe, it, expect, beforeEach, vi } from 'vitest';

// React hooksのモック
vi.mock('react', () => ({
  useState: vi.fn(),
  useCallback: vi.fn()
}));

// createDefaultSettings のモック用データ
const mockDefaultSettings = {
  basic: {
    text: 'いいかも',
    fontSize: 60,
    fontFamily: '"Noto Sans JP", sans-serif',
    fontColor: '#FF6B6B',
    textColorType: 'solid',
    gradientColor1: '#4ECDC4',
    gradientColor2: '#45B7D1',
    gradientDirection: 'vertical',
    backgroundType: 'transparent',
    backgroundColor: '#FFFFFF'
  },
  animation: {
    animation: 'none',
    animationSpeed: 20,
    animationAmplitude: 50,
    secondaryColor: '#FFD700'
  },
  image: {
    imageData: null,
    imageX: 50,
    imageY: 50,
    imageSize: 50,
    imageOpacity: 100,
    imagePosition: 'back',
    imageAnimation: 'none',
    imageAnimationAmplitude: 50
  },
  optimization: {
    canvasSize: 128,
    pngQuality: 85,
    gifQuality: 20,
    gifFrames: 30
  }
};

// settings モジュールのモック
vi.mock('../../types/settings', () => ({
  createDefaultSettings: () => mockDefaultSettings,
  structureSettings: vi.fn((flatSettings) => mockDefaultSettings),
  flattenSettings: vi.fn((structuredSettings) => ({
    ...structuredSettings.basic,
    ...structuredSettings.animation,
    ...structuredSettings.image,
    ...structuredSettings.optimization
  })),
  validateSettings: vi.fn(() => []),
  SettingCategories: {
    BASIC: 'basic',
    ANIMATION: 'animation',
    IMAGE: 'image',
    OPTIMIZATION: 'optimization'
  }
}));

import { useIconSettings } from '../../hooks/useIconSettings';
import { createDefaultSettings, structureSettings, flattenSettings, validateSettings, SettingCategories } from '../../types/settings';
import { useState, useCallback } from 'react';

describe('useIconSettings - AAA Pattern Tests', () => {
  let mockSetState;
  let mockState;

  beforeEach(() => {
    // Arrange: テスト前の共通セットアップ
    mockSetState = vi.fn();
    mockState = mockDefaultSettings;
    
    vi.mocked(useState).mockReturnValue([mockState, mockSetState]);
    vi.mocked(useCallback).mockImplementation((fn, deps) => fn);
    
    vi.clearAllMocks();
  });

  describe('基本設定更新のテスト', () => {
    describe('テキスト更新機能', () => {
      it('新しいテキストが正しく設定される', () => {
        // Arrange: テスト用データの準備
        const newText = 'テスト文字列';
        const expectedUpdate = {
          ...mockDefaultSettings,
          basic: { ...mockDefaultSettings.basic, text: newText }
        };
        
        // Act: useIconSettings フックを実行して updateBasicSettings を呼び出し
        const hook = useIconSettings();
        const updateFunction = hook.updateBasicSettings;
        updateFunction({ text: newText });
        
        // Assert: setState が期待される値で呼び出されたことを検証
        expect(mockSetState).toHaveBeenCalledWith(expect.any(Function));
        
        // 更新関数が正しい構造で呼び出されるかテスト
        const updateFunc = mockSetState.mock.calls[0][0];
        const result = updateFunc(mockDefaultSettings);
        expect(result.basic.text).toBe(newText);
        expect(result.basic.fontSize).toBe(mockDefaultSettings.basic.fontSize); // 他の値は保持
      });

      it('空文字のテキストも正しく設定される', () => {
        // Arrange: 空文字テストケースの準備
        const emptyText = '';
        
        // Act: 空文字でのテキスト更新
        const hook = useIconSettings();
        hook.updateBasicSettings({ text: emptyText });
        
        // Assert: 空文字が正しく設定されることを検証
        const updateFunc = mockSetState.mock.calls[0][0];
        const result = updateFunc(mockDefaultSettings);
        expect(result.basic.text).toBe(emptyText);
      });

      it('非常に長いテキストも正しく処理される', () => {
        // Arrange: 長いテキストの準備
        const longText = 'あ'.repeat(1000);
        
        // Act: 長いテキストでの更新
        const hook = useIconSettings();
        hook.updateBasicSettings({ text: longText });
        
        // Assert: 長いテキストが正しく設定されることを検証
        const updateFunc = mockSetState.mock.calls[0][0];
        const result = updateFunc(mockDefaultSettings);
        expect(result.basic.text).toBe(longText);
      });
    });

    describe('フォントサイズ更新機能', () => {
      it('新しいフォントサイズが正しく設定される', () => {
        // Arrange: テスト用フォントサイズの準備
        const newFontSize = 80;
        
        // Act: フォントサイズの更新
        const hook = useIconSettings();
        hook.updateBasicSettings({ fontSize: newFontSize });
        
        // Assert: フォントサイズが正しく設定されることを検証
        const updateFunc = mockSetState.mock.calls[0][0];
        const result = updateFunc(mockDefaultSettings);
        expect(result.basic.fontSize).toBe(newFontSize);
      });

      it('境界値のフォントサイズが正しく処理される', () => {
        // Arrange: 境界値テストケース
        const minFontSize = 10;
        const maxFontSize = 200;
        
        // Act & Assert: 最小値のテスト
        const hook1 = useIconSettings();
        hook1.updateBasicSettings({ fontSize: minFontSize });
        let updateFunc = mockSetState.mock.calls[0][0];
        let result = updateFunc(mockDefaultSettings);
        expect(result.basic.fontSize).toBe(minFontSize);
        
        // リセット
        vi.clearAllMocks();
        
        // Act & Assert: 最大値のテスト
        const hook2 = useIconSettings();
        hook2.updateBasicSettings({ fontSize: maxFontSize });
        updateFunc = mockSetState.mock.calls[0][0];
        result = updateFunc(mockDefaultSettings);
        expect(result.basic.fontSize).toBe(maxFontSize);
      });
    });

    describe('色設定更新機能', () => {
      it('フォント色が正しく設定される', () => {
        // Arrange: テスト用色の準備
        const newColor = '#FF0000';
        
        // Act: 色の更新
        const hook = useIconSettings();
        hook.updateBasicSettings({ fontColor: newColor });
        
        // Assert: 色が正しく設定されることを検証
        const updateFunc = mockSetState.mock.calls[0][0];
        const result = updateFunc(mockDefaultSettings);
        expect(result.basic.fontColor).toBe(newColor);
      });

      it('グラデーション色が正しく設定される', () => {
        // Arrange: グラデーション色の準備
        const gradientColor1 = '#FF0000';
        const gradientColor2 = '#00FF00';
        
        // Act: グラデーション色の更新
        const hook = useIconSettings();
        hook.updateBasicSettings({ 
          gradientColor1,
          gradientColor2 
        });
        
        // Assert: グラデーション色が正しく設定されることを検証
        const updateFunc = mockSetState.mock.calls[0][0];
        const result = updateFunc(mockDefaultSettings);
        expect(result.basic.gradientColor1).toBe(gradientColor1);
        expect(result.basic.gradientColor2).toBe(gradientColor2);
      });
    });

    describe('複数設定同時更新機能', () => {
      it('複数の基本設定を同時に更新できる', () => {
        // Arrange: 複数設定更新のテストデータ準備
        const multipleUpdates = {
          text: '複数更新テスト',
          fontSize: 90,
          fontColor: '#00FF00',
          backgroundType: 'solid'
        };
        
        // Act: 複数設定の同時更新
        const hook = useIconSettings();
        hook.updateBasicSettings(multipleUpdates);
        
        // Assert: 全ての設定が正しく更新されることを検証
        const updateFunc = mockSetState.mock.calls[0][0];
        const result = updateFunc(mockDefaultSettings);
        
        expect(result.basic.text).toBe(multipleUpdates.text);
        expect(result.basic.fontSize).toBe(multipleUpdates.fontSize);
        expect(result.basic.fontColor).toBe(multipleUpdates.fontColor);
        expect(result.basic.backgroundType).toBe(multipleUpdates.backgroundType);
        
        // 更新されていない設定は保持されることを検証
        expect(result.basic.fontFamily).toBe(mockDefaultSettings.basic.fontFamily);
      });
    });
  });

  describe('アニメーション設定更新のテスト', () => {
    describe('アニメーション種類更新機能', () => {
      it('アニメーション種類が正しく設定される', () => {
        // Arrange: アニメーション種類の準備
        const newAnimation = 'bounce';
        
        // Act: アニメーション種類の更新
        const hook = useIconSettings();
        hook.updateAnimationSettings({ animation: newAnimation });
        
        // Assert: アニメーション種類が正しく設定されることを検証
        const updateFunc = mockSetState.mock.calls[0][0];
        const result = updateFunc(mockDefaultSettings);
        expect(result.animation.animation).toBe(newAnimation);
        
        // 他の設定が変更されていないことを確認
        expect(result.basic).toEqual(mockDefaultSettings.basic);
      });
    });

    describe('アニメーション速度更新機能', () => {
      it('アニメーション速度が正しく設定される', () => {
        // Arrange: アニメーション速度の準備
        const newSpeed = 40;
        
        // Act: アニメーション速度の更新
        const hook = useIconSettings();
        hook.updateAnimationSettings({ animationSpeed: newSpeed });
        
        // Assert: アニメーション速度が正しく設定されることを検証
        const updateFunc = mockSetState.mock.calls[0][0];
        const result = updateFunc(mockDefaultSettings);
        expect(result.animation.animationSpeed).toBe(newSpeed);
      });
    });

    describe('複数アニメーション設定更新機能', () => {
      it('複数のアニメーション設定を同時に更新できる', () => {
        // Arrange: 複数アニメーション設定の準備
        const updates = {
          animation: 'pulse',
          animationSpeed: 30,
          animationAmplitude: 75,
          secondaryColor: '#FFFF00'
        };
        
        // Act: 複数アニメーション設定の更新
        const hook = useIconSettings();
        hook.updateAnimationSettings(updates);
        
        // Assert: 全てのアニメーション設定が正しく更新されることを検証
        const updateFunc = mockSetState.mock.calls[0][0];
        const result = updateFunc(mockDefaultSettings);
        
        expect(result.animation.animation).toBe(updates.animation);
        expect(result.animation.animationSpeed).toBe(updates.animationSpeed);
        expect(result.animation.animationAmplitude).toBe(updates.animationAmplitude);
        expect(result.animation.secondaryColor).toBe(updates.secondaryColor);
      });
    });
  });

  describe('画像設定更新のテスト', () => {
    describe('画像データ更新機能', () => {
      it('画像データが正しく設定される', () => {
        // Arrange: 画像データの準備
        const newImageData = 'data:image/png;base64,testdata';
        
        // Act: 画像データの更新
        const hook = useIconSettings();
        hook.updateImageSettings({ imageData: newImageData });
        
        // Assert: 画像データが正しく設定されることを検証
        const updateFunc = mockSetState.mock.calls[0][0];
        const result = updateFunc(mockDefaultSettings);
        expect(result.image.imageData).toBe(newImageData);
      });
    });

    describe('画像位置・サイズ更新機能', () => {
      it('画像位置とサイズが正しく設定される', () => {
        // Arrange: 画像位置・サイズの準備
        const imageUpdates = {
          imageX: 25,
          imageY: 75,
          imageSize: 80,
          imageOpacity: 50,
          imagePosition: 'front'
        };
        
        // Act: 画像設定の更新
        const hook = useIconSettings();
        hook.updateImageSettings(imageUpdates);
        
        // Assert: 画像設定が正しく更新されることを検証
        const updateFunc = mockSetState.mock.calls[0][0];
        const result = updateFunc(mockDefaultSettings);
        
        expect(result.image.imageX).toBe(imageUpdates.imageX);
        expect(result.image.imageY).toBe(imageUpdates.imageY);
        expect(result.image.imageSize).toBe(imageUpdates.imageSize);
        expect(result.image.imageOpacity).toBe(imageUpdates.imageOpacity);
        expect(result.image.imagePosition).toBe(imageUpdates.imagePosition);
      });
    });
  });

  describe('最適化設定更新のテスト', () => {
    describe('キャンバスサイズ更新機能', () => {
      it('キャンバスサイズが正しく設定される', () => {
        // Arrange: キャンバスサイズの準備
        const newSize = 64;
        
        // Act: キャンバスサイズの更新
        const hook = useIconSettings();
        hook.updateOptimizationSettings({ canvasSize: newSize });
        
        // Assert: キャンバスサイズが正しく設定されることを検証
        const updateFunc = mockSetState.mock.calls[0][0];
        const result = updateFunc(mockDefaultSettings);
        expect(result.optimization.canvasSize).toBe(newSize);
      });
    });

    describe('品質設定更新機能', () => {
      it('PNG・GIF品質が正しく設定される', () => {
        // Arrange: 品質設定の準備
        const qualityUpdates = {
          pngQuality: 95,
          gifQuality: 30,
          gifFrames: 60
        };
        
        // Act: 品質設定の更新
        const hook = useIconSettings();
        hook.updateOptimizationSettings(qualityUpdates);
        
        // Assert: 品質設定が正しく更新されることを検証
        const updateFunc = mockSetState.mock.calls[0][0];
        const result = updateFunc(mockDefaultSettings);
        
        expect(result.optimization.pngQuality).toBe(qualityUpdates.pngQuality);
        expect(result.optimization.gifQuality).toBe(qualityUpdates.gifQuality);
        expect(result.optimization.gifFrames).toBe(qualityUpdates.gifFrames);
      });
    });
  });

  describe('カテゴリ別設定更新のテスト', () => {
    let consoleWarnSpy;
    
    beforeEach(() => {
      // Arrange: コンソール警告のスパイ設定
      consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      // Cleanup: スパイのクリーンアップ
      consoleWarnSpy.mockRestore();
    });

    it('BASIC カテゴリの設定が正しく更新される', () => {
      // Arrange: BASICカテゴリの更新データ準備
      const updates = { text: 'カテゴリテスト' };
      
      // Act: カテゴリ別更新の実行
      const hook = useIconSettings();
      hook.updateSettingsByCategory(SettingCategories.BASIC, updates);
      
      // Assert: BASIC設定が更新されたことを検証
      const updateFunc = mockSetState.mock.calls[0][0];
      const result = updateFunc(mockDefaultSettings);
      expect(result.basic.text).toBe(updates.text);
    });

    it('ANIMATION カテゴリの設定が正しく更新される', () => {
      // Arrange: ANIMATIONカテゴリの更新データ準備
      const updates = { animation: 'shake' };
      
      // Act: カテゴリ別更新の実行
      const hook = useIconSettings();
      hook.updateSettingsByCategory(SettingCategories.ANIMATION, updates);
      
      // Assert: ANIMATION設定が更新されたことを検証
      const updateFunc = mockSetState.mock.calls[0][0];
      const result = updateFunc(mockDefaultSettings);
      expect(result.animation.animation).toBe(updates.animation);
    });

    it('不明なカテゴリで警告が出力される', () => {
      // Arrange: 不明なカテゴリの準備
      const unknownCategory = 'unknown';
      const updates = { test: 'value' };
      
      // Act: 不明なカテゴリでの更新実行
      const hook = useIconSettings();
      hook.updateSettingsByCategory(unknownCategory, updates);
      
      // Assert: 警告が出力され、状態は変更されないことを検証
      expect(consoleWarnSpy).toHaveBeenCalledWith(`Unknown category: ${unknownCategory}`);
      expect(mockSetState).not.toHaveBeenCalled();
    });
  });

  describe('エッジケースのテスト', () => {
    describe('null・undefined値の処理', () => {
      it('null値での更新でも例外が発生しない', () => {
        // Arrange: null値のテストケース準備
        const nullUpdate = { text: null };
        
        // Act & Assert: null値の更新で例外が発生しないことを検証
        expect(() => {
          const hook = useIconSettings();
          hook.updateBasicSettings(nullUpdate);
        }).not.toThrow();
        
        // 更新が実行されることを確認
        expect(mockSetState).toHaveBeenCalled();
      });

      it('undefined値での更新でも例外が発生しない', () => {
        // Arrange: undefined値のテストケース準備
        const undefinedUpdate = { fontSize: undefined };
        
        // Act & Assert: undefined値の更新で例外が発生しないことを検証
        expect(() => {
          const hook = useIconSettings();
          hook.updateBasicSettings(undefinedUpdate);
        }).not.toThrow();
      });
    });

    describe('空オブジェクトの処理', () => {
      it('空のオブジェクトでの更新が正常に動作する', () => {
        // Arrange: 空オブジェクトの準備
        const emptyUpdate = {};
        
        // Act: 空オブジェクトでの更新
        const hook = useIconSettings();
        hook.updateBasicSettings(emptyUpdate);
        
        // Assert: 更新が実行され、元の状態が保持されることを検証
        const updateFunc = mockSetState.mock.calls[0][0];
        const result = updateFunc(mockDefaultSettings);
        expect(result.basic).toEqual({ ...mockDefaultSettings.basic, ...emptyUpdate });
      });
    });

    describe('特殊文字の処理', () => {
      it('特殊文字を含むテキストが正しく処理される', () => {
        // Arrange: 特殊文字テキストの準備
        const specialText = '🎉✨Hello World!@#$%^&*()😊';
        
        // Act: 特殊文字テキストでの更新
        const hook = useIconSettings();
        hook.updateBasicSettings({ text: specialText });
        
        // Assert: 特殊文字が正しく設定されることを検証
        const updateFunc = mockSetState.mock.calls[0][0];
        const result = updateFunc(mockDefaultSettings);
        expect(result.basic.text).toBe(specialText);
      });
    });
  });

  describe('状態独立性のテスト', () => {
    describe('カテゴリ間の独立性', () => {
      it('異なるカテゴリの設定更新が互いに影響しない', () => {
        // Arrange: 初期状態の記録とアニメーション更新の準備
        const initialBasicSettings = { ...mockDefaultSettings.basic };
        
        // Act: アニメーション設定の更新
        const hook = useIconSettings();
        hook.updateAnimationSettings({ animation: 'bounce' });
        
        // Assert: 基本設定が変更されていないことを検証
        const updateFunc = mockSetState.mock.calls[0][0];
        const result = updateFunc(mockDefaultSettings);
        
        expect(result.basic).toEqual(initialBasicSettings);
        expect(result.animation.animation).toBe('bounce');
      });
    });

    describe('部分更新の独立性', () => {
      it('同じカテゴリ内での部分更新が他のプロパティに影響しない', () => {
        // Arrange: 部分更新のテストケース準備
        const originalFontFamily = mockDefaultSettings.basic.fontFamily;
        const originalFontColor = mockDefaultSettings.basic.fontColor;
        
        // Act: フォントサイズのみの更新
        const hook = useIconSettings();
        hook.updateBasicSettings({ fontSize: 80 });
        
        // Assert: 他のプロパティが保持されることを検証
        const updateFunc = mockSetState.mock.calls[0][0];
        const result = updateFunc(mockDefaultSettings);
        
        expect(result.basic.fontSize).toBe(80);
        expect(result.basic.fontFamily).toBe(originalFontFamily);
        expect(result.basic.fontColor).toBe(originalFontColor);
      });
    });
  });

  describe('検証機能のテスト', () => {
    describe('設定検証の実行', () => {
      it('validateSettings が正しく呼び出される', () => {
        // Arrange: 検証テストの準備
        const mockErrors = ['テストエラー'];
        validateSettings.mockReturnValue(mockErrors);
        
        // Act: useIconSettings の実行
        const hook = useIconSettings();
        
        // Assert: 検証関数が呼び出され、結果が正しく返されることを検証
        expect(validateSettings).toHaveBeenCalledWith(mockDefaultSettings);
        expect(hook.validationErrors).toEqual(mockErrors);
        expect(hook.isValid).toBe(false);
      });

      it('エラーがない場合は有効と判定される', () => {
        // Arrange: エラーなしのテストケース準備
        validateSettings.mockReturnValue([]);
        
        // Act: useIconSettings の実行
        const hook = useIconSettings();
        
        // Assert: 有効性の確認
        expect(hook.validationErrors).toEqual([]);
        expect(hook.isValid).toBe(true);
      });
    });
  });

  describe('下位互換性のテスト', () => {
    describe('フラット設定の提供', () => {
      it('flattenSettings が正しく呼び出される', () => {
        // Arrange: フラット設定のテスト準備
        const mockFlatSettings = { text: 'test', fontSize: 60 };
        flattenSettings.mockReturnValue(mockFlatSettings);
        
        // Act: useIconSettings の実行
        const hook = useIconSettings();
        
        // Assert: フラット設定が正しく提供されることを検証
        expect(flattenSettings).toHaveBeenCalledWith(mockDefaultSettings);
        expect(hook.iconSettings).toEqual(mockFlatSettings);
      });
    });

    describe('汎用設定更新機能', () => {
      it('handleSettingsChange でフラット設定を更新できる', () => {
        // Arrange: フラット設定更新のテスト準備
        const flatUpdates = { text: '下位互換テスト', fontSize: 70 };
        const mockStructured = { ...mockDefaultSettings, basic: { ...mockDefaultSettings.basic, ...flatUpdates } };
        structureSettings.mockReturnValue(mockStructured);
        
        // Act: フラット設定の更新
        const hook = useIconSettings();
        hook.handleSettingsChange(flatUpdates);
        
        // Assert: structureSettings が正しく呼び出され、状態が更新されることを検証
        expect(structureSettings).toHaveBeenCalled();
        expect(mockSetState).toHaveBeenCalledWith(mockStructured);
      });
    });
  });

  describe('useCallback 動作確認のテスト', () => {
    describe('コールバック関数の生成', () => {
      it('全ての更新関数が useCallback でラップされる', () => {
        // Arrange & Act: useIconSettings の実行
        const hook = useIconSettings();
        
        // Assert: useCallback が適切に呼び出されることを検証
        expect(vi.mocked(useCallback)).toHaveBeenCalledTimes(6); // 6つの主要なコールバック関数
        
        // 関数が返されることを確認
        expect(typeof hook.updateBasicSettings).toBe('function');
        expect(typeof hook.updateAnimationSettings).toBe('function');
        expect(typeof hook.updateImageSettings).toBe('function');
        expect(typeof hook.updateOptimizationSettings).toBe('function');
        expect(typeof hook.updateSettingsByCategory).toBe('function');
        expect(typeof hook.handleSettingsChange).toBe('function');
      });
    });
  });
});