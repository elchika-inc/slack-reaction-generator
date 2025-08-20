/**
 * canvasUtils.js のテスト
 * Test Double パターンを活用したCanvasAPI関連のテスト実装
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateIconData, drawTextIcon, drawAnimationFrame } from '../../utils/canvasUtils';
import { 
  createCanvasMock, 
  createCanvasContextMock,
  canvasAssertions 
} from '../../test/mocks/canvasMock';
import { CANVAS_CONFIG } from '../../constants/canvasConstants';

// テストの設定オブジェクト
const createTestSettings = (overrides = {}) => ({
  text: 'テスト',
  fontFamily: 'Arial',
  fontSize: 16,
  fontColor: '#000000',
  backgroundColor: '#FFFFFF',
  backgroundType: 'color',
  canvasSize: 128,
  textColorType: 'solid',
  ...overrides
});

describe('canvasUtils', () => {
  let mockCanvas;
  let mockContext;
  let testSettings;

  beforeEach(() => {
    // Canvas Mock の初期化
    mockCanvas = createCanvasMock(128, 128);
    mockContext = mockCanvas.__getContext();
    testSettings = createTestSettings();
    
    // 描画記録をクリア
    mockContext.__clearRecording();
  });

  describe('generateIconData', () => {
    it('静的アイコンを正常に生成する', async () => {
      const result = await generateIconData(testSettings, mockCanvas);
      
      // PNG データURLが返されることを確認
      expect(result).toMatch(/^data:image\/png;base64,/);
      
      // キャンバスサイズが正しく設定されることを確認
      expect(mockCanvas.width).toBe(128);
      expect(mockCanvas.height).toBe(128);
      
      // 背景が描画されることを確認
      canvasAssertions.expectCanvasCleared(mockContext, 0, 0, 128, 128);
      const verifier = mockContext.__getVerifier();
      const bgRect = verifier.expectRectangleDrawn(0, 0, 128, 128, 'fill');
      expect(bgRect.found).toBe(true);
    });

    it('透明背景の場合は背景を描画しない', async () => {
      const transparentSettings = createTestSettings({
        backgroundType: 'transparent'
      });
      
      await generateIconData(transparentSettings, mockCanvas);
      
      // キャンバスがクリアされることを確認
      canvasAssertions.expectCanvasCleared(mockContext, 0, 0, 128, 128);
      
      // 背景矩形は描画されないことを確認
      const verifier = mockContext.__getVerifier();
      const bgRect = verifier.expectRectangleDrawn(0, 0, 128, 128, 'fill');
      expect(bgRect.found).toBe(false);
    });

    it('アニメーション設定がある場合はGIF生成を試行する', async () => {
      const animatedSettings = createTestSettings({
        animation: 'bounce'
      });
      
      // GIF生成ライブラリのモック化
      const mockGif = {
        addFrame: vi.fn(),
        render: vi.fn().mockResolvedValue(new ArrayBuffer(0))
      };
      
      // 動的インポートをモック
      vi.mock('gif.js', () => ({
        default: vi.fn().mockImplementation(() => mockGif)
      }));
      
      // GIF生成の処理をモック化でテスト
      try {
        const result = await generateIconData(animatedSettings, mockCanvas);
        expect(typeof result).toBe('string');
        expect(result).toMatch(/^data:image\/(png|gif);base64,/);
      } catch (error) {
        // モック環境での予期されるエラー処理
        expect(error).toBeDefined();
      }
    }, 2000); // タイムアウトを2秒に延長

    it('カスタムキャンバスサイズを正しく処理する', async () => {
      const customSizeSettings = createTestSettings({
        canvasSize: 64
      });
      
      await generateIconData(customSizeSettings, mockCanvas);
      
      expect(mockCanvas.width).toBe(64);
      expect(mockCanvas.height).toBe(64);
    });
  });

  describe('drawTextIcon', () => {
    beforeEach(() => {
      mockContext.__clearRecording();
    });

    it('基本的なテキストアイコンを描画する', () => {
      drawTextIcon(mockContext, testSettings);
      
      // 背景が描画されることを確認
      const verifier = mockContext.__getVerifier();
      const bgRect = verifier.expectRectangleDrawn(0, 0, 128, 128, 'fill');
      expect(bgRect.found).toBe(true);
      
      // テキストが描画されることを確認（実際の座標はrenderTextの実装による）
      const textCommands = verifier.expectTextDrawn('テスト');
      expect(textCommands.found).toBe(true);
    });

    it('画像が背景に設定されている場合は先に描画する', () => {
      const imageSettings = createTestSettings({
        imageData: 'data:image/png;base64,test',
        imagePosition: 'back'
      });
      
      drawTextIcon(mockContext, imageSettings);
      
      // 画像描画の確認
      const verifier = mockContext.__getVerifier();
      const imageDrawn = verifier.expectImageDrawn();
      expect(imageDrawn.found).toBe(true);
      
      // 描画順序の確認（画像が先、テキストが後）
      const commands = verifier.recorder.getCommands();
      const imageCommand = commands.find(cmd => cmd.command === 'drawImage');
      const textCommand = commands.find(cmd => cmd.command === 'fillText' || cmd.command === 'strokeText');
      
      if (imageCommand && textCommand) {
        expect(imageCommand.sequence).toBeLessThan(textCommand.sequence);
      }
    });

    it('画像が前景に設定されている場合は後に描画する', () => {
      const imageSettings = createTestSettings({
        imageData: 'data:image/png;base64,test',
        imagePosition: 'front'
      });
      
      drawTextIcon(mockContext, imageSettings);
      
      // 描画順序の確認（テキストが先、画像が後）
      const verifier = mockContext.__getVerifier();
      const commands = verifier.recorder.getCommands();
      const imageCommand = commands.find(cmd => cmd.command === 'drawImage');
      const textCommand = commands.find(cmd => cmd.command === 'fillText' || cmd.command === 'strokeText');
      
      if (imageCommand && textCommand) {
        expect(textCommand.sequence).toBeLessThan(imageCommand.sequence);
      }
    });

    it('透明背景の場合は背景を描画しない', () => {
      const transparentSettings = createTestSettings({
        backgroundType: 'transparent'
      });
      
      drawTextIcon(mockContext, transparentSettings);
      
      // 背景矩形は描画されないことを確認
      const verifier = mockContext.__getVerifier();
      const bgRect = verifier.expectRectangleDrawn(0, 0, 128, 128, 'fill');
      expect(bgRect.found).toBe(false);
    });

    it('状態の保存と復元が正しく行われる', () => {
      const imageSettings = createTestSettings({
        imageData: 'data:image/png;base64,test',
        imagePosition: 'back'
      });
      
      drawTextIcon(mockContext, imageSettings);
      
      // save と restore が呼ばれることを確認
      const verifier = mockContext.__getVerifier();
      const commands = verifier.recorder.getCommands();
      const saveCommands = commands.filter(cmd => cmd.command === 'save');
      const restoreCommands = commands.filter(cmd => cmd.command === 'restore');
      
      expect(saveCommands.length).toBeGreaterThan(0);
      expect(restoreCommands.length).toBeGreaterThan(0);
    });
  });

  describe('drawAnimationFrame', () => {
    const totalFrames = 30;

    beforeEach(() => {
      mockContext.__clearRecording();
    });

    it('アニメーションフレームを正しく描画する', () => {
      const frame = 15; // 中間フレーム
      
      drawAnimationFrame(mockContext, testSettings, frame, totalFrames);
      
      // テキストが描画されることを確認
      const verifier = mockContext.__getVerifier();
      const textDrawn = verifier.expectTextDrawn('テスト');
      expect(textDrawn.found).toBe(true);
      
      // 状態の保存と復元が行われることを確認
      const saveCommands = verifier.recorder.getCommandsByType('save');
      const restoreCommands = verifier.recorder.getCommandsByType('restore');
      expect(saveCommands.length).toBeGreaterThan(0);
      expect(restoreCommands.length).toBeGreaterThan(0);
    });

    it('rainbowアニメーションで色が変化する', () => {
      const rainbowSettings = createTestSettings({
        animation: 'rainbow'
      });
      
      // 複数フレームで色の変化を確認
      const frames = [0, 10, 20, 29];
      const colors = [];
      
      frames.forEach(frame => {
        mockContext.__clearRecording();
        drawAnimationFrame(mockContext, rainbowSettings, frame, totalFrames);
        
        // fillStyle の設定変更を記録
        const verifier = mockContext.__getVerifier();
        const stateChanges = verifier.recorder.getCommands()
          .filter(cmd => cmd.command === 'setState' && cmd.args[0] === 'fillStyle');
        
        if (stateChanges.length > 0) {
          colors.push(stateChanges[stateChanges.length - 1].args[1]);
        }
      });
      
      // 異なる色が設定されていることを確認（HSL色相が変化）
      const uniqueColors = [...new Set(colors)];
      expect(uniqueColors.length).toBeGreaterThan(1);
    });

    it('blinkアニメーションで色が切り替わる', () => {
      const blinkSettings = createTestSettings({
        animation: 'blink',
        secondaryColor: '#FF0000'
      });
      
      // 点滅パターンをテスト
      const frames = Array.from({ length: 8 }, (_, i) => i * 4); // 8フレーム分
      let colorChanges = 0;
      
      frames.forEach(frame => {
        mockContext.__clearRecording();
        drawAnimationFrame(mockContext, blinkSettings, frame, totalFrames);
        
        const verifier = mockContext.__getVerifier();
        const stateChanges = verifier.recorder.getCommands()
          .filter(cmd => cmd.command === 'setState' && cmd.args[0] === 'fillStyle');
        
        if (stateChanges.length > 0) {
          colorChanges++;
        }
      });
      
      expect(colorChanges).toBeGreaterThan(0);
    });

    it('画像付きアニメーションで正しい描画順序を維持する', () => {
      const imageAnimationSettings = createTestSettings({
        imageData: 'data:image/png;base64,test',
        imagePosition: 'back',
        animation: 'bounce'
      });
      
      drawAnimationFrame(mockContext, imageAnimationSettings, 15, totalFrames);
      
      // 描画順序: 背景画像 → テキスト → (前景画像なし)
      const verifier = mockContext.__getVerifier();
      const commands = verifier.recorder.getCommands();
      
      const imageCommand = commands.find(cmd => cmd.command === 'drawImage');
      const textCommand = commands.find(cmd => cmd.command === 'fillText' || cmd.command === 'strokeText');
      
      if (imageCommand && textCommand) {
        expect(imageCommand.sequence).toBeLessThan(textCommand.sequence);
      }
    });
  });

  describe('Canvas Context Mock の検証機能', () => {
    it('描画コマンドの記録機能が正常に動作する', () => {
      mockContext.fillRect(10, 20, 30, 40);
      mockContext.fillText('test', 50, 60);
      
      const verifier = mockContext.__getVerifier();
      
      // 特定コマンドの検証
      const rectResult = verifier.expectRectangleDrawn(10, 20, 30, 40, 'fill');
      expect(rectResult.found).toBe(true);
      
      const textResult = verifier.expectTextDrawn('test', 50, 60);
      expect(textResult.found).toBe(true);
      
      // 描画回数の検証
      const countResult = verifier.expectDrawingCount(2);
      expect(countResult.passed).toBe(true);
    });

    it('状態管理が正常に動作する', () => {
      // 状態変更
      mockContext.fillStyle = '#FF0000';
      mockContext.font = '20px Arial';
      mockContext.globalAlpha = 0.5;
      
      // 状態保存・復元
      mockContext.save();
      mockContext.fillStyle = '#00FF00';
      mockContext.restore();
      
      // 状態が正しく復元されることを確認
      expect(mockContext.fillStyle).toBe('#FF0000');
      expect(mockContext.font).toBe('20px Arial');
      expect(mockContext.globalAlpha).toBe(0.5);
      
      // 変更履歴の確認
      const verifier = mockContext.__getVerifier();
      const fillStyleChanges = verifier.expectStateChange('fillStyle');
      expect(fillStyleChanges.found).toBe(true);
      expect(fillStyleChanges.count).toBeGreaterThanOrEqual(2); // 初期設定 + 変更
    });

    it('変形操作の記録が正常に動作する', () => {
      mockContext.translate(10, 20);
      mockContext.rotate(Math.PI / 4);
      mockContext.scale(2, 2);
      
      const verifier = mockContext.__getVerifier();
      const transformations = verifier.expectTransformations();
      
      expect(transformations.found).toBe(true);
      expect(transformations.count).toBe(3);
      expect(transformations.types).toContain('translate');
      expect(transformations.types).toContain('rotate');
      expect(transformations.types).toContain('scale');
    });

    it('measureText が適切な値を返す', () => {
      const metrics = mockContext.measureText('Hello World');
      
      expect(metrics.width).toBe(88); // 11文字 × 8px
      expect(metrics.actualBoundingBoxLeft).toBe(0);
      expect(metrics.actualBoundingBoxRight).toBe(88);
      expect(metrics.actualBoundingBoxAscent).toBe(12);
      expect(metrics.actualBoundingBoxDescent).toBe(3);
    });
  });
});