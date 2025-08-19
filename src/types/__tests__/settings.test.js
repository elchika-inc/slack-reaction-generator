// settings のテスト

import { describe, it, expect } from 'vitest';
import { 
  createDefaultSettings,
  structureSettings,
  flattenSettings,
  validateSettings 
} from '../settings';

describe('settings', () => {
  describe('createDefaultSettings', () => {
    it('正しいデフォルト設定構造を作成する', () => {
      const settings = createDefaultSettings();
      
      // 基本構造の確認
      expect(settings).toHaveProperty('basic');
      expect(settings).toHaveProperty('animation');
      expect(settings).toHaveProperty('image');
      expect(settings).toHaveProperty('optimization');
      
      // 基本設定の確認
      expect(settings.basic.text).toBe('いいかも');
      expect(settings.basic.fontSize).toBe(60);
      expect(settings.basic.backgroundType).toBe('transparent');
      
      // アニメーション設定の確認
      expect(settings.animation.animation).toBe('none');
      expect(settings.animation.animationSpeed).toBe(20);
      
      // 最適化設定の確認
      expect(settings.optimization.canvasSize).toBe(128);
      expect(settings.optimization.gifFrames).toBe(30);
    });

    it('ランダム色が設定されている', () => {
      const settings = createDefaultSettings();
      
      // 色の形式をチェック（#で始まる7文字）
      expect(settings.basic.fontColor).toMatch(/^#[0-9A-F]{6}$/i);
      expect(settings.basic.gradientColor1).toMatch(/^#[0-9A-F]{6}$/i);
      expect(settings.basic.gradientColor2).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });

  describe('structureSettings', () => {
    it('フラット設定を構造化設定に変換する', () => {
      const flatSettings = {
        text: 'テスト',
        fontSize: 48,
        animation: 'bounce',
        animationSpeed: 50,
        imageData: 'data:image/png;base64,test',
        canvasSize: 64
      };

      const result = structureSettings(flatSettings);
      
      expect(result.basic.text).toBe('テスト');
      expect(result.basic.fontSize).toBe(48);
      expect(result.animation.animation).toBe('bounce');
      expect(result.animation.animationSpeed).toBe(50);
      expect(result.image.imageData).toBe('data:image/png;base64,test');
      expect(result.optimization.canvasSize).toBe(64);
    });

    it('未定義プロパティでデフォルト値を使用する', () => {
      const flatSettings = { text: 'テスト' };
      const result = structureSettings(flatSettings);
      
      expect(result.basic.text).toBe('テスト');
      expect(result.basic.fontSize).toBe(60); // デフォルト値
      expect(result.animation.animation).toBe('none'); // デフォルト値
    });
  });

  describe('flattenSettings', () => {
    it('構造化設定をフラット設定に変換する', () => {
      const structuredSettings = createDefaultSettings();
      structuredSettings.basic.text = 'テスト';
      structuredSettings.animation.animation = 'pulse';
      
      const result = flattenSettings(structuredSettings);
      
      expect(result.text).toBe('テスト');
      expect(result.animation).toBe('pulse');
      expect(result.fontSize).toBe(60); // デフォルト値
    });
  });

  describe('validateSettings', () => {
    it('有効な設定でエラーなしを返す', () => {
      const validSettings = createDefaultSettings();
      const errors = validateSettings(validSettings);
      
      expect(errors).toEqual([]);
    });

    it('空のテキストでエラーを返す', () => {
      const invalidSettings = createDefaultSettings();
      invalidSettings.basic.text = '';
      
      const errors = validateSettings(invalidSettings);
      
      expect(errors).toContain('テキストは必須です');
    });

    it('無効なフォントサイズでエラーを返す', () => {
      const invalidSettings = createDefaultSettings();
      invalidSettings.basic.fontSize = 5; // 10未満
      
      const errors = validateSettings(invalidSettings);
      
      expect(errors).toContain('フォントサイズは10-200の範囲で指定してください');
    });

    it('無効なキャンバスサイズでエラーを返す', () => {
      const invalidSettings = createDefaultSettings();
      invalidSettings.optimization.canvasSize = 256; // 64, 128以外
      
      const errors = validateSettings(invalidSettings);
      
      expect(errors).toContain('キャンバスサイズは64または128を指定してください');
    });

    it('複数のエラーを正しく検出する', () => {
      const invalidSettings = createDefaultSettings();
      invalidSettings.basic.text = '';
      invalidSettings.basic.fontSize = 300; // 200超過
      invalidSettings.optimization.canvasSize = 96;
      
      const errors = validateSettings(invalidSettings);
      
      expect(errors).toHaveLength(3);
      expect(errors).toContain('テキストは必須です');
      expect(errors).toContain('フォントサイズは10-200の範囲で指定してください');
      expect(errors).toContain('キャンバスサイズは64または128を指定してください');
    });
  });
});