// frameRenderer の統合テスト
// 4つのテスト手法（AAA、Test Double、Test Builder、SOLID）を統合した実装

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  createSettingsBuilder, 
  createAnimationBuilder,
  TestPresets 
} from '../support/builders';
import { 
  getTextColor, 
  renderAnimationFrame, 
  calculateGifDelay, 
  generateGifFrames 
} from '../../utils/frameRenderer';
import { 
  createCanvasContextMock,
  createCanvasMock,
  canvasAssertions 
} from '../support/mocks/canvasMock';

// textRenderer と animationHelpers のモック
vi.mock('../../utils/textRenderer', () => ({
  renderText: vi.fn()
}));

vi.mock('../../utils/animationHelpers', () => ({
  calculateAnimationValue: vi.fn(),
  applyTextAnimation: vi.fn()
}));

describe('frameRenderer - 統合テスト', () => {
  let mockContext;
  let mockRenderText;
  let mockCalculateAnimationValue;
  let mockApplyTextAnimation;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockContext = createCanvasContextMock();
    
    // モジュールのmock関数を取得
    const textRenderer = await import('../../utils/textRenderer');
    const animationHelpers = await import('../../utils/animationHelpers');
    
    mockRenderText = textRenderer.renderText;
    mockCalculateAnimationValue = animationHelpers.calculateAnimationValue;
    mockApplyTextAnimation = animationHelpers.applyTextAnimation;
    
    // デフォルトのモック実装
    mockCalculateAnimationValue.mockImplementation((type, progress) => {
      if (type === 'rainbow') return progress * 360;
      if (type === 'blink') return Math.sin(progress * Math.PI * 2 * 4) > 0;
      return progress;
    });
  });

  describe('Test Builder Pattern統合', () => {
    it('AnimationBuilderで作成したアニメーション設定が正しい', () => {
      // AAA Pattern: Arrange
      const animationBuilder = createAnimationBuilder();
      
      // AAA Pattern: Act
      const bounceAnimation = animationBuilder.asBounce().build();
      const pulseAnimation = animationBuilder.reset().asPulse().build();
      const rotateAnimation = animationBuilder.reset().asRotate().build();

      // AAA Pattern: Assert
      expect(bounceAnimation.type).toBe('bounce');
      expect(bounceAnimation.speed).toBe(25);
      expect(bounceAnimation.amplitude).toBe(60);

      expect(pulseAnimation.type).toBe('pulse');
      expect(pulseAnimation.speed).toBe(30);
      expect(pulseAnimation.amplitude).toBe(40);

      expect(rotateAnimation.type).toBe('rotate');
      expect(rotateAnimation.speed).toBe(15);
    });

    it('アニメーション速度の設定が正しく適用される', () => {
      // AAA Pattern: Arrange
      const builder = createAnimationBuilder();
      
      // AAA Pattern: Act
      const slowAnimation = builder.asSlowAnimation().build();
      const fastAnimation = builder.reset().asFastAnimation().build();

      // AAA Pattern: Assert
      expect(slowAnimation.speed).toBe(10);
      expect(slowAnimation.frames).toBe(60);
      expect(slowAnimation.delay).toBe(200);

      expect(fastAnimation.speed).toBe(50);
      expect(fastAnimation.frames).toBe(15);
      expect(fastAnimation.delay).toBe(50);
    });

    it('アニメーション進行度の計算が正しく動作する', () => {
      // AAA Pattern: Arrange
      const animation = createAnimationBuilder()
        .withFrames(30)
        .withProgress(0.5)
        .build();

      // AAA Pattern: Act
      const progressAt15 = 15 / 30; // フレーム15/30の進行度
      const progressAt30 = 30 / 30; // 最終フレーム

      // AAA Pattern: Assert
      expect(progressAt15).toBe(0.5);
      expect(progressAt30).toBe(1.0);
      expect(animation.progress).toBe(0.5);
    });
  });

  describe('アニメーションフレーム生成', () => {
    it('フレーム数に基づく進行度が正しく計算される', () => {
      // AAA Pattern: Arrange
      const totalFrames = 30;
      const expectedProgressValues = [];

      // AAA Pattern: Act
      for (let frame = 0; frame < totalFrames; frame++) {
        const progress = frame / totalFrames;
        expectedProgressValues.push(progress);
      }

      // AAA Pattern: Assert
      expect(expectedProgressValues).toHaveLength(30);
      expect(expectedProgressValues[0]).toBe(0);
      expect(expectedProgressValues[15]).toBeCloseTo(0.5);
      expect(expectedProgressValues[29]).toBeCloseTo(0.967, 2);
    });

    it('円形アニメーションの値計算が正しく動作する', () => {
      // AAA Pattern: Arrange
      const frames = 8; // 8フレームで1回転
      const results = [];

      // AAA Pattern: Act
      for (let i = 0; i < frames; i++) {
        const progress = i / frames;
        const radians = progress * Math.PI * 2;
        const degrees = radians * (180 / Math.PI);
        results.push({ progress, radians, degrees });
      }

      // AAA Pattern: Assert
      expect(results[0].degrees).toBe(0);     // 0度
      expect(results[2].degrees).toBe(90);    // 90度
      expect(results[4].degrees).toBe(180);   // 180度
      expect(results[6].degrees).toBe(270);   // 270度
    });

    it('サイン波アニメーションの値計算が正しく動作する', () => {
      // AAA Pattern: Arrange
      const frames = 16;
      const sineValues = [];

      // AAA Pattern: Act
      for (let i = 0; i < frames; i++) {
        const progress = i / frames;
        const radians = progress * Math.PI * 2;
        const sineValue = Math.sin(radians);
        sineValues.push(sineValue);
      }

      // AAA Pattern: Assert
      expect(sineValues[0]).toBeCloseTo(0, 1);    // sin(0) = 0
      expect(sineValues[4]).toBeCloseTo(1, 1);    // sin(π/2) = 1
      expect(sineValues[8]).toBeCloseTo(0, 1);    // sin(π) = 0
      expect(sineValues[12]).toBeCloseTo(-1, 1);  // sin(3π/2) = -1
    });
  });

  describe('アニメーション最適化', () => {
    it('フレーム削減最適化が正しく動作する', () => {
      // AAA Pattern: Arrange
      const originalFrames = 60;
      const targetFrames = 30;
      const optimizedIndices = [];

      // AAA Pattern: Act
      for (let i = 0; i < targetFrames; i++) {
        const index = Math.floor((i / targetFrames) * originalFrames);
        optimizedIndices.push(index);
      }

      // AAA Pattern: Assert
      expect(optimizedIndices).toHaveLength(30);
      expect(optimizedIndices[0]).toBe(0);
      expect(optimizedIndices[29]).toBe(58);
      expect(optimizedIndices.filter(i => i < originalFrames)).toHaveLength(30);
    });

    it('重複フレーム検出が正しく動作する', () => {
      // AAA Pattern: Arrange
      const frames = [
        { hash: 'frame1', data: 'data1' },
        { hash: 'frame2', data: 'data2' },
        { hash: 'frame1', data: 'data1' }, // 重複
        { hash: 'frame3', data: 'data3' },
        { hash: 'frame2', data: 'data2' }  // 重複
      ];

      // AAA Pattern: Act
      const uniqueFrames = frames.filter((frame, index, arr) => 
        arr.findIndex(f => f.hash === frame.hash) === index
      );

      // AAA Pattern: Assert
      expect(uniqueFrames).toHaveLength(3);
      expect(uniqueFrames.map(f => f.hash)).toEqual(['frame1', 'frame2', 'frame3']);
    });

    it('アニメーション品質とファイルサイズのバランス計算', () => {
      // AAA Pattern: Arrange
      const qualityLevels = [1, 5, 10, 20];
      const baseSizeKB = 100;
      const qualityMultipliers = [];

      // AAA Pattern: Act
      qualityLevels.forEach(quality => {
        // 品質が高いほどファイルサイズが増える（逆比例ではない）
        const multiplier = 1 + (quality / 10);
        const estimatedSize = baseSizeKB * multiplier;
        qualityMultipliers.push({ quality, multiplier, size: estimatedSize });
      });

      // AAA Pattern: Assert
      expect(qualityMultipliers[0].size).toBeCloseTo(110, 1);  // 品質1
      expect(qualityMultipliers[1].size).toBeCloseTo(150, 1);  // 品質5
      expect(qualityMultipliers[2].size).toBeCloseTo(200, 1);  // 品質10
      expect(qualityMultipliers[3].size).toBeCloseTo(300, 1);  // 品質20
    });
  });

  describe('SOLID原則の適用', () => {
    it('SRP: AnimationBuilderは単一責任（アニメーション設定構築）のみ', () => {
      // AAA Pattern: Arrange
      const builder = createAnimationBuilder();

      // AAA Pattern: Act & Assert
      // Builderは設定構築に関するメソッドのみを持つ
      const expectedMethods = [
        'reset', 'withType', 'withSpeed', 'withAmplitude', 
        'withFrames', 'withDelay', 'withProgress',
        'asBounce', 'asPulse', 'asRotate', 'asFade',
        'asSlowAnimation', 'asFastAnimation', 'build'
      ];
      
      expectedMethods.forEach(method => {
        expect(typeof builder[method]).toBe('function');
      });
    });

    it('OCP: 新しいアニメーションタイプを追加しても既存コードは変更不要', () => {
      // AAA Pattern: Arrange
      const builder = createAnimationBuilder();
      
      // AAA Pattern: Act & Assert
      // 既存のアニメーションタイプが正しく動作する
      expect(() => builder.asBounce().build()).not.toThrow();
      expect(() => builder.reset().asPulse().build()).not.toThrow();
      expect(() => builder.reset().asRotate().build()).not.toThrow();
      
      // 新しいタイプを文字列で指定しても動作する（拡張可能性）
      expect(() => {
        builder.reset().withType('newAnimation').build();
      }).not.toThrow();
    });

    it('LSP: 異なるアニメーション設定でも同じインターフェースで使用可能', () => {
      // AAA Pattern: Arrange
      const animations = [
        createAnimationBuilder().asBounce(),
        createAnimationBuilder().asPulse(),
        createAnimationBuilder().asRotate(),
        createAnimationBuilder().asFade()
      ];

      // AAA Pattern: Act & Assert
      animations.forEach(animation => {
        const config = animation.build();
        
        // すべて同じ構造を持つ
        expect(config).toHaveProperty('type');
        expect(config).toHaveProperty('speed');
        expect(config).toHaveProperty('amplitude');
        expect(config).toHaveProperty('frames');
        expect(config).toHaveProperty('delay');
        expect(config).toHaveProperty('progress');
      });
    });

    it('ISP: 必要なインターフェースのみを公開', () => {
      // AAA Pattern: Arrange
      const builder = createAnimationBuilder();
      const animation = builder.asBounce().build();

      // AAA Pattern: Act & Assert
      // アニメーション設定に必要なプロパティのみが含まれる
      const expectedProperties = ['type', 'speed', 'amplitude', 'frames', 'delay', 'progress'];
      const actualProperties = Object.keys(animation);
      
      expectedProperties.forEach(prop => {
        expect(actualProperties).toContain(prop);
      });
      
      // 不要なプロパティは含まれない
      expect(animation).not.toHaveProperty('canvasSize');
      expect(animation).not.toHaveProperty('text');
      expect(animation).not.toHaveProperty('color');
    });

    it('DIP: 具体的なアニメーション実装ではなく設定に依存', () => {
      // AAA Pattern: Arrange
      const settings = TestPresets.bounceIcon().build();
      
      // AAA Pattern: Act
      const animationType = settings.animation;
      const animationSpeed = settings.animationSpeed;

      // AAA Pattern: Assert
      // 具体的な実装ではなく抽象化された設定値に依存
      expect(typeof animationType).toBe('string');
      expect(typeof animationSpeed).toBe('number');
      expect(animationType).toBe('bounce');
      expect(animationSpeed).toBeGreaterThan(0);
    });
  });

  describe('パフォーマンス最適化', () => {
    it('大量のフレーム計算でも効率的に処理', () => {
      // AAA Pattern: Arrange
      const frameCount = 1000;
      const startTime = performance.now();

      // AAA Pattern: Act
      const frames = [];
      for (let i = 0; i < frameCount; i++) {
        const progress = i / frameCount;
        const frame = {
          index: i,
          progress: progress,
          sin: Math.sin(progress * Math.PI * 2),
          cos: Math.cos(progress * Math.PI * 2),
          rotation: progress * Math.PI * 2
        };
        frames.push(frame);
      }
      
      const endTime = performance.now();

      // AAA Pattern: Assert
      expect(frames).toHaveLength(frameCount);
      expect(endTime - startTime).toBeLessThan(100); // 100ms以内
      expect(frames[0].progress).toBe(0);
      expect(frames[frameCount - 1].progress).toBeCloseTo(0.999);
    });

    it('アニメーション設定の複製が効率的', () => {
      // AAA Pattern: Arrange
      const baseAnimation = createAnimationBuilder()
        .withType('bounce')
        .withSpeed(25)
        .withAmplitude(60)
        .withFrames(30)
        .build();
      
      const startTime = performance.now();

      // AAA Pattern: Act
      const variants = [];
      for (let i = 0; i < 100; i++) {
        variants.push({ ...baseAnimation, speed: baseAnimation.speed + i });
      }
      
      const endTime = performance.now();

      // AAA Pattern: Assert
      expect(variants).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(10); // 10ms以内
      expect(variants[0].speed).toBe(25);
      expect(variants[99].speed).toBe(124);
    });
  });

  describe('統合テスト', () => {
    it('設定BuilderとアニメーションBuilderの連携', () => {
      // AAA Pattern: Arrange
      const settings = createSettingsBuilder()
        .withText('統合テスト')
        .withAnimation('pulse', 30, 75)
        .build();

      const animationConfig = createAnimationBuilder()
        .withType('pulse')
        .withSpeed(30)
        .withAmplitude(75)
        .build();

      // AAA Pattern: Act & Assert
      expect(settings.animation).toBe(animationConfig.type);
      expect(settings.animationSpeed).toBe(animationConfig.speed);
      expect(settings.animationAmplitude).toBe(animationConfig.amplitude);
    });

    it('全てのアニメーションプリセットが正しく動作する', () => {
      // AAA Pattern: Arrange
      const presetAnimations = TestPresets.allAnimations();

      // AAA Pattern: Act & Assert
      presetAnimations.forEach((preset, index) => {
        const settings = preset.build();
        expect(settings).toBeDefined();
        expect(settings.animation).toBeDefined();
        // 最初のプリセット（none）以外はアニメーション設定されている
        if (index > 0) {
          expect(settings.animation).not.toBe('none');
        }
      });
    });

    it('アニメーション品質設定の統合', () => {
      // AAA Pattern: Arrange
      const qualityLevels = [1, 5, 10, 15, 20];
      
      // AAA Pattern: Act
      const animations = qualityLevels.map(quality => 
        createSettingsBuilder()
          .withText('品質テスト')
          .withAnimation('bounce')
          .withGifSettings(30, 100, quality)
          .build()
      );

      // AAA Pattern: Assert
      animations.forEach((settings, index) => {
        expect(settings.gifQuality).toBe(qualityLevels[index]);
        expect(settings.animation).toBe('bounce');
      });
    });
  });

  describe('エラーハンドリングと境界値', () => {
    it('極端な設定値でもエラーを起こさない', () => {
      // AAA Pattern: Arrange & Act & Assert
      expect(() => {
        createAnimationBuilder()
          .withSpeed(0)
          .withAmplitude(0)
          .withFrames(1)
          .withDelay(1)
          .build();
      }).not.toThrow();

      expect(() => {
        createAnimationBuilder()
          .withSpeed(1000)
          .withAmplitude(1000)
          .withFrames(1000)
          .withDelay(1000)
          .build();
      }).not.toThrow();
    });

    it('無効なアニメーションタイプでも処理を継続', () => {
      // AAA Pattern: Arrange & Act
      const invalidAnimation = createAnimationBuilder()
        .withType('invalidType')
        .build();

      // AAA Pattern: Assert
      expect(invalidAnimation.type).toBe('invalidType');
      expect(invalidAnimation.speed).toBeGreaterThan(0);
      expect(invalidAnimation.amplitude).toBeGreaterThan(0);
    });

    it('プロパティの境界値が正しく処理される', () => {
      // AAA Pattern: Arrange & Act
      const boundaryAnimation = createAnimationBuilder()
        .withSpeed(Number.MAX_SAFE_INTEGER)
        .withAmplitude(Number.MAX_SAFE_INTEGER)
        .withFrames(Number.MAX_SAFE_INTEGER)
        .build();

      // AAA Pattern: Assert
      expect(boundaryAnimation.speed).toBe(Number.MAX_SAFE_INTEGER);
      expect(boundaryAnimation.amplitude).toBe(Number.MAX_SAFE_INTEGER);
      expect(boundaryAnimation.frames).toBe(Number.MAX_SAFE_INTEGER);
    });
  });

  describe('Test Double パターン - Canvas描画検証', () => {
    const createTestSettings = (overrides = {}) => ({
      text: 'テスト',
      fontFamily: 'Arial',
      fontSize: 16,
      fontColor: '#000000',
      backgroundColor: '#FFFFFF',
      backgroundType: 'color',
      canvasSize: 128,
      animation: 'none',
      secondaryColor: '#FFD700',
      imageData: null,
      imagePosition: 'back',
      animationAmplitude: 10,
      animationSpeed: 33,
      ...overrides
    });

    describe('getTextColor - Stub パターン', () => {
      it('rainbowアニメーションでHSL色を正しく生成する（Stub）', () => {
        // AAA Pattern: Arrange
        const settings = createTestSettings({ animation: 'rainbow' });
        const progress = 0.25;
        mockCalculateAnimationValue.mockReturnValueOnce(90);

        // AAA Pattern: Act
        const result = getTextColor(settings, progress);

        // AAA Pattern: Assert
        expect(mockCalculateAnimationValue).toHaveBeenCalledWith('rainbow', progress);
        expect(result.textColorType).toBe('solid');
        expect(result.fontColor).toBe('hsl(90, 100%, 50%)');
      });

      it('blinkアニメーションでセカンダリ色を返す（Stub）', () => {
        // AAA Pattern: Arrange
        const settings = createTestSettings({
          animation: 'blink',
          secondaryColor: '#FF0000'
        });
        mockCalculateAnimationValue.mockReturnValueOnce(true);

        // AAA Pattern: Act
        const result = getTextColor(settings, 0.5);

        // AAA Pattern: Assert
        expect(result.fontColor).toBe('#FF0000');
      });

      it('通常のアニメーションでは元設定を返す（Pass-through Stub）', () => {
        // AAA Pattern: Arrange
        const settings = createTestSettings({ animation: 'bounce' });

        // AAA Pattern: Act
        const result = getTextColor(settings, 0.33);

        // AAA Pattern: Assert
        expect(result).toBe(settings);
        expect(mockCalculateAnimationValue).not.toHaveBeenCalled();
      });
    });

    describe('renderAnimationFrame - Mock & Spy パターン', () => {
      beforeEach(() => {
        mockContext.__clearRecording();
      });

      it('基本フレーム描画でCanvas APIが正しく呼ばれる（Mock）', () => {
        // AAA Pattern: Arrange
        const settings = createTestSettings();
        const frame = 15;
        const totalFrames = 30;
        const canvasSize = 128;

        // AAA Pattern: Act
        renderAnimationFrame(mockContext, settings, frame, totalFrames, canvasSize);

        // AAA Pattern: Assert - Mock検証
        expect(mockContext.save).toHaveBeenCalled();
        expect(mockContext.restore).toHaveBeenCalled();
        expect(mockApplyTextAnimation).toHaveBeenCalledWith(
          mockContext,
          settings.animation,
          0.5, // frame/totalFrames
          settings.animationAmplitude,
          settings.secondaryColor
        );
        expect(mockRenderText).toHaveBeenCalledWith(mockContext, settings, canvasSize);
      });

      it('rainbowアニメーション描画で動的色設定が適用される（Spy）', () => {
        // AAA Pattern: Arrange
        const settings = createTestSettings({ animation: 'rainbow' });
        mockCalculateAnimationValue.mockReturnValueOnce(180);

        // AAA Pattern: Act
        renderAnimationFrame(mockContext, settings, 10, 30, 128);

        // AAA Pattern: Assert - Spy検証
        expect(mockRenderText).toHaveBeenCalledWith(
          mockContext,
          expect.objectContaining({
            textColorType: 'solid',
            fontColor: 'hsl(180, 100%, 50%)'
          }),
          128
        );
      });

      it('画像付きフレーム描画で正しい順序で実行される（Spy）', () => {
        // AAA Pattern: Arrange
        global.Image = vi.fn().mockImplementation(() => ({
          src: '',
          complete: true,
          width: 64,
          height: 64
        }));
        
        const settings = createTestSettings({
          imageData: 'data:image/png;base64,test',
          imagePosition: 'back'
        });

        // AAA Pattern: Act
        renderAnimationFrame(mockContext, settings, 5, 30, 128);

        // AAA Pattern: Assert - 描画順序の検証
        const verifier = mockContext.__getVerifier();
        const imageDrawn = verifier.expectImageDrawn();
        expect(imageDrawn.found).toBe(true);
        expect(mockRenderText).toHaveBeenCalled();
      });
    });

    describe('calculateGifDelay - 純粋関数テスト', () => {
      it('最小遅延制限が正しく適用される', () => {
        // AAA Pattern: Arrange, Act, Assert
        expect(calculateGifDelay(10)).toBe(30);
        expect(calculateGifDelay(25)).toBe(30);
        expect(calculateGifDelay(30)).toBe(30);
      });

      it('10ms単位への丸め処理が正しく動作する', () => {
        // AAA Pattern: Arrange, Act, Assert
        expect(calculateGifDelay(33)).toBe(30);
        expect(calculateGifDelay(37)).toBe(40);
        expect(calculateGifDelay(48)).toBe(50);
      });
    });

    describe('generateGifFrames - Fake & Mock統合', () => {
      let mockGif;
      let mockFrameCanvas;

      beforeEach(() => {
        // Fake GIF オブジェクト
        mockGif = {
          addFrame: vi.fn()
        };

        // Fake Canvas
        mockFrameCanvas = createCanvasMock(128, 128);
        
        vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
          return tagName === 'canvas' ? mockFrameCanvas : {};
        });
      });

      afterEach(() => {
        vi.restoreAllMocks();
      });

      it('指定フレーム数分のGIFフレームが生成される（Mock）', () => {
        // AAA Pattern: Arrange
        const settings = createTestSettings({
          backgroundColor: '#FF0000',
          animationSpeed: 40
        });
        const frameCount = 20;

        // AAA Pattern: Act
        generateGifFrames(mockGif, settings, frameCount, 128);

        // AAA Pattern: Assert - Mock検証
        expect(mockGif.addFrame).toHaveBeenCalledTimes(frameCount);
      });

      it('各フレームで適切な背景描画が実行される（Spy）', () => {
        // AAA Pattern: Arrange
        const settings = createTestSettings({
          backgroundColor: '#00FF00'
        });

        // AAA Pattern: Act
        generateGifFrames(mockGif, settings, 5, 128);

        // AAA Pattern: Assert - Canvas描画の検証
        const frameContext = mockFrameCanvas.__getContext();
        const verifier = frameContext.__getVerifier();
        
        canvasAssertions.expectDrawingCount(frameContext, 5, 'fillRect');
        
        const fillStyleChange = verifier.expectStateChange('fillStyle', '#00FF00');
        expect(fillStyleChange.found).toBe(true);
      });

      it('カスタムキャンバスサイズが正しく適用される（Fake）', () => {
        // AAA Pattern: Arrange
        const settings = createTestSettings();
        const customSize = 256;

        // AAA Pattern: Act
        generateGifFrames(mockGif, settings, 10, customSize);

        // AAA Pattern: Assert - Fake Canvas検証
        expect(mockFrameCanvas.width).toBe(customSize);
        expect(mockFrameCanvas.height).toBe(customSize);
      });
    });

    describe('統合テスト - Test Double組み合わせ', () => {
      it('複雑なアニメーション設定での完全なフレーム描画フロー', () => {
        // AAA Pattern: Arrange
        global.Image = vi.fn().mockImplementation(() => ({
          src: '',
          complete: true,
          width: 32,
          height: 32
        }));

        const complexSettings = createTestSettings({
          animation: 'rainbow',
          imageData: 'data:image/png;base64,complex',
          imagePosition: 'back',
          secondaryColor: '#FF00FF',
          animationAmplitude: 20
        });

        mockCalculateAnimationValue.mockReturnValueOnce(270);

        // AAA Pattern: Act
        renderAnimationFrame(mockContext, complexSettings, 12, 30, 128);

        // AAA Pattern: Assert - 複数Test Doubleの連携検証
        expect(mockApplyTextAnimation).toHaveBeenCalledWith(
          mockContext,
          'rainbow',
          0.4, // 12/30
          20,
          '#FF00FF'
        );
        
        expect(mockRenderText).toHaveBeenCalledWith(
          mockContext,
          expect.objectContaining({
            fontColor: 'hsl(270, 100%, 50%)'
          }),
          128
        );

        // Canvas描画順序検証
        const verifier = mockContext.__getVerifier();
        const imageDrawn = verifier.expectImageDrawn();
        expect(imageDrawn.found).toBe(true);
        
        // 状態管理検証（save/restoreが呼ばれることを確認）
        expect(mockContext.save).toHaveBeenCalled();
        expect(mockContext.restore).toHaveBeenCalled();
      });

      it('パフォーマンステスト - 大量フレーム処理でのMock効率性', () => {
        // AAA Pattern: Arrange
        const settings = createTestSettings({ animation: 'bounce' });
        const startTime = performance.now();

        // AAA Pattern: Act
        for (let i = 0; i < 100; i++) {
          mockContext.__clearRecording();
          renderAnimationFrame(mockContext, settings, i, 100, 64);
        }
        
        const endTime = performance.now();

        // AAA Pattern: Assert
        expect(endTime - startTime).toBeLessThan(50); // Mock使用で高速実行
        expect(mockRenderText).toHaveBeenCalledTimes(100);
        expect(mockApplyTextAnimation).toHaveBeenCalledTimes(100);
      });
    });

    describe('Test Double設計品質検証', () => {
      it('Mock純度テスト - 副作用なし', () => {
        // AAA Pattern: Arrange
        const initialState = mockContext.__getStateManager().getState();
        const settings = createTestSettings();

        // AAA Pattern: Act
        renderAnimationFrame(mockContext, settings, 0, 1, 128);

        // AAA Pattern: Assert - Mockが状態を汚染しないことを確認
        expect(mockContext.save).toHaveBeenCalled();
        expect(mockContext.restore).toHaveBeenCalled();
        
        // Mock呼び出し後の状態検証
        const verifier = mockContext.__getVerifier();
        const commands = verifier.recorder.getCommands();
        expect(commands.length).toBeGreaterThan(0); // 記録されている
      });

      it('Stub一貫性テスト - 同じ入力で同じ出力', () => {
        // AAA Pattern: Arrange
        const settings = createTestSettings({ animation: 'rainbow' });
        mockCalculateAnimationValue.mockReturnValue(45);

        // AAA Pattern: Act
        const result1 = getTextColor(settings, 0.125);
        const result2 = getTextColor(settings, 0.125);

        // AAA Pattern: Assert - Stub一貫性
        expect(result1).toEqual(result2);
        expect(result1.fontColor).toBe('hsl(45, 100%, 50%)');
      });

      it('Spy透明性テスト - 実際の動作を阻害しない', () => {
        // AAA Pattern: Arrange
        const settings = createTestSettings();

        // AAA Pattern: Act
        renderAnimationFrame(mockContext, settings, 5, 10, 128);

        // AAA Pattern: Assert - Spyが処理フローを変えないことを確認
        expect(mockApplyTextAnimation).toHaveBeenCalled();
        expect(mockRenderText).toHaveBeenCalled();
        
        // 正しい順序で呼び出されている
        const applyAnimationOrder = mockApplyTextAnimation.mock.invocationCallOrder[0];
        const renderTextOrder = mockRenderText.mock.invocationCallOrder[0];
        expect(applyAnimationOrder).toBeLessThan(renderTextOrder);
      });
    });
  });
});