/**
 * Test Data Builder Pattern 強化実装
 * 4つのテスト手法（AAA、Test Double、Test Builder、SOLID）を統合した設計
 * 
 * 特徴:
 * - Fluent Interface による直感的なAPI
 * - Chain of Responsibility による柔軟な構築プロセス
 * - Factory Method による適切なBuilderの選択
 * - Template Method による共通処理の抽象化
 */

import { createDefaultSettings, flattenSettings } from '../../types/settings';
import { vi } from 'vitest';

/**
 * Settings Builder - アイコン設定の複雑なバリエーション生成
 * SOLID原則: SRP（単一責任の原則）- 設定データの構築のみを担当
 */
export class SettingsBuilder {
  constructor() {
    this.reset();
  }

  reset() {
    this.settings = createDefaultSettings();
    return this;
  }

  // Basic Settings
  withText(text) {
    this.settings.basic.text = text;
    return this;
  }

  withFontSize(fontSize) {
    this.settings.basic.fontSize = fontSize;
    return this;
  }

  withFontColor(color) {
    this.settings.basic.fontColor = color;
    return this;
  }

  withFontFamily(fontFamily) {
    this.settings.basic.fontFamily = fontFamily;
    return this;
  }

  withBackground(type, color1, color2) {
    this.settings.basic.backgroundType = type;
    if (color1) this.settings.basic.backgroundColor = color1;
    if (color2) {
      this.settings.basic.gradientColor1 = color1;
      this.settings.basic.gradientColor2 = color2;
    }
    return this;
  }

  withBackgroundColor(color) {
    this.settings.basic.backgroundColor = color;
    return this;
  }

  withShadow(enabled = true, color = '#000000', blur = 4, offsetX = 2, offsetY = 2) {
    this.settings.basic.shadowEnabled = enabled;
    this.settings.basic.shadowColor = color;
    this.settings.basic.shadowBlur = blur;
    this.settings.basic.shadowOffsetX = offsetX;
    this.settings.basic.shadowOffsetY = offsetY;
    return this;
  }

  // Animation Settings
  withAnimation(type, speed = 20, amplitude = 50) {
    this.settings.animation.animation = type;
    this.settings.animation.animationSpeed = speed;
    this.settings.animation.animationAmplitude = amplitude;
    return this;
  }

  withAnimationSpeed(speed) {
    this.settings.animation.animationSpeed = speed;
    return this;
  }

  withAnimationAmplitude(amplitude) {
    this.settings.animation.animationAmplitude = amplitude;
    return this;
  }

  withoutAnimation() {
    this.settings.animation.animation = 'none';
    return this;
  }

  // Image Settings
  withImage(imageData, opacity = 100, size = 100, positionX = 50, positionY = 50) {
    this.settings.image.imageData = imageData;
    this.settings.image.imageOpacity = opacity;
    this.settings.image.imageSize = size;
    this.settings.image.imagePositionX = positionX;
    this.settings.image.imagePositionY = positionY;
    return this;
  }

  withImageData(imageData) {
    this.settings.image.imageData = imageData;
    return this;
  }

  withImageAnimation(animation) {
    this.settings.image.imageAnimation = animation;
    return this;
  }

  withImageBlendMode(mode) {
    this.settings.image.imageBlendMode = mode;
    return this;
  }

  // Optimization Settings
  withCanvasSize(size) {
    this.settings.optimization.canvasSize = size;
    return this;
  }

  withGifSettings(frames = 30, delay = 100, quality = 10) {
    this.settings.optimization.gifFrames = frames;
    this.settings.optimization.gifDelay = delay;
    this.settings.optimization.gifQuality = quality;
    return this;
  }

  // 便利なプリセットメソッド
  withSimpleText(text = 'テスト') {
    return this.withText(text).withoutAnimation();
  }

  withAnimatedText(text = 'アニメ', animation = 'bounce') {
    return this.withText(text).withAnimation(animation);
  }

  withComplexSettings() {
    return this
      .withText('複雑')
      .withFontSize(48)
      .withFontColor('#FF0000')
      .withBackground('gradient', '#FF0000', '#0000FF')
      .withShadow(true)
      .withAnimation('pulse', 30, 75)
      .withCanvasSize(128);
  }

  // バリデーションエラーを意図的に発生させる設定
  withInvalidSettings() {
    return this
      .withText('') // 空テキスト
      .withFontSize(5) // 範囲外
      .withCanvasSize(256); // 無効なサイズ
  }

  build() {
    // フラット化された設定を返す（下位互換性のため）
    return flattenSettings(this.settings);
  }
}

/**
 * Canvas Builder - Canvas関連のテストデータ構築
 * SOLID原則: SRP - Canvas関連データの構築のみ
 */
export class CanvasBuilder {
  constructor() {
    this.reset();
  }

  reset() {
    this.canvasData = {
      width: 128,
      height: 128,
      context: null,
      imageData: null
    };
    return this;
  }

  withSize(width, height = width) {
    this.canvasData.width = width;
    this.canvasData.height = height;
    return this;
  }

  withMockContext() {
    this.canvasData.context = {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      measureText: vi.fn(() => ({ width: 100 })),
      fillStyle: '#000000',
      strokeStyle: '#000000',
      font: '16px Arial',
      textAlign: 'center',
      globalAlpha: 1
    };
    return this;
  }

  withImageData() {
    this.canvasData.imageData = new Uint8ClampedArray(
      this.canvasData.width * this.canvasData.height * 4
    );
    return this;
  }

  build() {
    return { ...this.canvasData };
  }
}

/**
 * File Builder - 画像ファイル、GIFファイルのテストデータ
 * SOLID原則: SRP - ファイル関連データの構築のみ
 */
export class FileBuilder {
  constructor() {
    this.reset();
  }

  reset() {
    this.fileData = {
      type: 'image/png',
      size: 1024,
      name: 'test.png',
      data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
    };
    return this;
  }

  withType(type) {
    this.fileData.type = type;
    return this;
  }

  withSize(size) {
    this.fileData.size = size;
    return this;
  }

  withName(name) {
    this.fileData.name = name;
    return this;
  }

  withBase64Data(data) {
    this.fileData.data = data;
    return this;
  }

  asPNG() {
    return this.withType('image/png').withName('test.png');
  }

  asGIF() {
    return this.withType('image/gif').withName('test.gif');
  }

  asJPEG() {
    return this.withType('image/jpeg').withName('test.jpg');
  }

  asLargeFile() {
    return this.withSize(1024 * 1024 * 5); // 5MB
  }

  build() {
    return { ...this.fileData };
  }
}

/**
 * Animation Builder - アニメーション設定の組み合わせパターン
 * SOLID原則: SRP - アニメーション設定の構築のみ
 */
export class AnimationBuilder {
  constructor() {
    this.reset();
  }

  reset() {
    this.animationData = {
      type: 'none',
      speed: 20,
      amplitude: 50,
      frames: 30,
      delay: 100,
      progress: 0
    };
    return this;
  }

  withType(type) {
    this.animationData.type = type;
    return this;
  }

  withSpeed(speed) {
    this.animationData.speed = speed;
    return this;
  }

  withAmplitude(amplitude) {
    this.animationData.amplitude = amplitude;
    return this;
  }

  withFrames(frames) {
    this.animationData.frames = frames;
    return this;
  }

  withDelay(delay) {
    this.animationData.delay = delay;
    return this;
  }

  withProgress(progress) {
    this.animationData.progress = progress;
    return this;
  }

  // プリセットアニメーション
  asBounce() {
    return this.withType('bounce').withSpeed(25).withAmplitude(60);
  }

  asPulse() {
    return this.withType('pulse').withSpeed(30).withAmplitude(40);
  }

  asRotate() {
    return this.withType('rotate').withSpeed(15);
  }

  asFade() {
    return this.withType('fade').withSpeed(20);
  }

  asSlowAnimation() {
    return this.withSpeed(10).withFrames(60).withDelay(200);
  }

  asFastAnimation() {
    return this.withSpeed(50).withFrames(15).withDelay(50);
  }

  build() {
    return { ...this.animationData };
  }
}

/**
 * Event Builder - イベントデータの構築
 * SOLID原則: SRP - イベント関連データの構築のみ
 */
export class EventBuilder {
  constructor() {
    this.reset();
  }

  reset() {
    this.eventData = {
      type: 'click',
      target: null,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn()
    };
    return this;
  }

  withType(type) {
    this.eventData.type = type;
    return this;
  }

  withTarget(target) {
    this.eventData.target = target;
    return this;
  }

  withValue(value) {
    this.eventData.target = { value };
    return this;
  }

  withFiles(files) {
    this.eventData.target = { files };
    return this;
  }

  asChangeEvent(value) {
    return this.withType('change').withValue(value);
  }

  asFileUploadEvent(files = []) {
    return this.withType('change').withFiles(files);
  }

  asClickEvent() {
    return this.withType('click');
  }

  build() {
    return { ...this.eventData };
  }
}

/**
 * Abstract Base Builder
 * SOLID Principles: Template Method Pattern適用
 */
class BaseBuilder {
  constructor() {
    this.validators = [];
    this.transformers = [];
    this.hooks = {
      beforeBuild: [],
      afterBuild: []
    };
  }

  // Template Method: 共通の構築プロセス
  build() {
    this.runHooks('beforeBuild');
    this.validate();
    const result = this.transform(this.doBuild());
    this.runHooks('afterBuild', result);
    return result;
  }

  // 抽象メソッド: サブクラスで実装
  doBuild() {
    throw new Error('doBuild() must be implemented by subclass');
  }

  // Chain of Responsibility: バリデーションチェーン
  addValidator(validator) {
    this.validators.push(validator);
    return this;
  }

  validate() {
    this.validators.forEach(validator => {
      if (!validator(this)) {
        throw new Error(`Validation failed: ${validator.name}`);
      }
    });
  }

  // Decorator Pattern: データ変換チェーン
  addTransformer(transformer) {
    this.transformers.push(transformer);
    return this;
  }

  transform(data) {
    return this.transformers.reduce((result, transformer) => {
      return transformer(result);
    }, data);
  }

  // Observer Pattern: フック機能
  addHook(phase, callback) {
    if (this.hooks[phase]) {
      this.hooks[phase].push(callback);
    }
    return this;
  }

  runHooks(phase, data = null) {
    if (this.hooks[phase]) {
      this.hooks[phase].forEach(callback => callback(this, data));
    }
  }

  // Fluent Interface: メソッドチェーン用
  clone() {
    const cloned = new this.constructor();
    cloned.validators = [...this.validators];
    cloned.transformers = [...this.transformers];
    cloned.hooks = {
      beforeBuild: [...this.hooks.beforeBuild],
      afterBuild: [...this.hooks.afterBuild]
    };
    return cloned;
  }
}

/**
 * Enhanced Settings Builder
 * BaseBuilderを継承した高度なSettings構築
 */
class EnhancedSettingsBuilder extends BaseBuilder {
  constructor() {
    super();
    this.reset();
    this.setupDefaultValidators();
  }

  reset() {
    this.settings = createDefaultSettings();
    return this;
  }

  doBuild() {
    return flattenSettings(this.settings);
  }

  setupDefaultValidators() {
    // 基本的なバリデーションルール
    this.addValidator(function validateText(builder) {
      return builder.settings.basic.text && builder.settings.basic.text.length > 0;
    });

    this.addValidator(function validateFontSize(builder) {
      const size = builder.settings.basic.fontSize;
      return size >= 8 && size <= 200;
    });

    this.addValidator(function validateCanvasSize(builder) {
      const size = builder.settings.optimization.canvasSize;
      return [64, 128, 256].includes(size);
    });
  }

  // Fluent Interface継続
  withText(text) {
    this.settings.basic.text = text;
    return this;
  }

  withFontSize(fontSize) {
    this.settings.basic.fontSize = fontSize;
    return this;
  }

  withFontColor(color) {
    this.settings.basic.fontColor = color;
    return this;
  }

  withFontFamily(fontFamily) {
    this.settings.basic.fontFamily = fontFamily;
    return this;
  }

  withBackground(type, color1, color2) {
    this.settings.basic.backgroundType = type;
    if (color1) this.settings.basic.backgroundColor = color1;
    if (color2) {
      this.settings.basic.gradientColor1 = color1;
      this.settings.basic.gradientColor2 = color2;
    }
    return this;
  }

  withBackgroundColor(color) {
    this.settings.basic.backgroundColor = color;
    return this;
  }

  withShadow(enabled = true, color = '#000000', blur = 4, offsetX = 2, offsetY = 2) {
    this.settings.basic.shadowEnabled = enabled;
    this.settings.basic.shadowColor = color;
    this.settings.basic.shadowBlur = blur;
    this.settings.basic.shadowOffsetX = offsetX;
    this.settings.basic.shadowOffsetY = offsetY;
    return this;
  }

  withAnimation(type, speed = 20, amplitude = 50) {
    this.settings.animation.animation = type;
    this.settings.animation.animationSpeed = speed;
    this.settings.animation.animationAmplitude = amplitude;
    return this;
  }

  withAnimationSpeed(speed) {
    this.settings.animation.animationSpeed = speed;
    return this;
  }

  withAnimationAmplitude(amplitude) {
    this.settings.animation.animationAmplitude = amplitude;
    return this;
  }

  withoutAnimation() {
    this.settings.animation.animation = 'none';
    return this;
  }

  withImage(imageData, opacity = 100, size = 100, positionX = 50, positionY = 50) {
    this.settings.image.imageData = imageData;
    this.settings.image.imageOpacity = opacity;
    this.settings.image.imageSize = size;
    this.settings.image.imagePositionX = positionX;
    this.settings.image.imagePositionY = positionY;
    return this;
  }

  withImageData(imageData) {
    this.settings.image.imageData = imageData;
    return this;
  }

  withImageAnimation(animation) {
    this.settings.image.imageAnimation = animation;
    return this;
  }

  withImageBlendMode(mode) {
    this.settings.image.imageBlendMode = mode;
    return this;
  }

  withCanvasSize(size) {
    this.settings.optimization.canvasSize = size;
    return this;
  }

  withGifSettings(frames = 30, delay = 100, quality = 10) {
    this.settings.optimization.gifFrames = frames;
    this.settings.optimization.gifDelay = delay;
    this.settings.optimization.gifQuality = quality;
    return this;
  }

  // プリセットメソッド（既存）
  withSimpleText(text = 'テスト') {
    return this.withText(text).withoutAnimation();
  }

  withAnimatedText(text = 'アニメ', animation = 'bounce') {
    return this.withText(text).withAnimation(animation);
  }

  withComplexSettings() {
    return this
      .withText('複雑')
      .withFontSize(48)
      .withFontColor('#FF0000')
      .withBackground('gradient', '#FF0000', '#0000FF')
      .withShadow(true)
      .withAnimation('pulse', 30, 75)
      .withCanvasSize(128);
  }

  withInvalidSettings() {
    // バリデーションを一時的に無効化
    const originalValidators = this.validators;
    this.validators = [];
    
    const result = this
      .withText('')
      .withFontSize(5)
      .withCanvasSize(512);
    
    this.validators = originalValidators;
    return result;
  }

  // 新しい高度なプリセット
  withAccessibilityOptimized() {
    return this
      .withFontSize(24) // 読みやすいサイズ
      .withFontColor('#000000')
      .withBackgroundColor('#FFFFFF') // 高コントラスト
      .withShadow(false); // シンプルな表示
  }

  withPerformanceOptimized() {
    return this
      .withCanvasSize(64) // 小さなサイズ
      .withGifSettings(15, 200, 5) // 低品質・低フレーム数
      .withoutAnimation(); // アニメーション無し
  }

  withMobileOptimized() {
    return this
      .withCanvasSize(64)
      .withFontSize(20)
      .withGifSettings(20, 150, 8);
  }

  withHighQuality() {
    return this
      .withCanvasSize(256)
      .withGifSettings(60, 50, 20) // 高品質・高フレーム数
      .withFontSize(64);
  }
}

/**
 * Test Scenario Builder
 * 複数のBuilderを組み合わせた複雑なテストシナリオの構築
 */
export class TestScenarioBuilder {
  constructor() {
    this.scenarios = [];
    this.commonSetup = null;
    this.commonTeardown = null;
  }

  withCommonSetup(setup) {
    this.commonSetup = setup;
    return this;
  }

  withCommonTeardown(teardown) {
    this.commonTeardown = teardown;
    return this;
  }

  addScenario(name, builderFunction) {
    this.scenarios.push({ name, builderFunction });
    return this;
  }

  // よく使われるシナリオパターン
  addBasicScenarios() {
    return this
      .addScenario('基本テキスト', () => createSettingsBuilder().withSimpleText('基本'))
      .addScenario('アニメーション', () => createSettingsBuilder().withAnimatedText('動く', 'bounce'))
      .addScenario('複雑設定', () => createSettingsBuilder().withComplexSettings());
  }

  addAccessibilityScenarios() {
    return this
      .addScenario('高コントラスト', () => 
        createSettingsBuilder().withAccessibilityOptimized().withText('見やすい'))
      .addScenario('大きなフォント', () => 
        createSettingsBuilder().withText('大').withFontSize(72));
  }

  addPerformanceScenarios() {
    return this
      .addScenario('軽量設定', () => 
        createSettingsBuilder().withPerformanceOptimized().withText('軽い'))
      .addScenario('重い処理', () => 
        createSettingsBuilder().withHighQuality().withText('重い'));
  }

  addErrorScenarios() {
    return this
      .addScenario('無効設定', () => createSettingsBuilder().withInvalidSettings())
      .addScenario('空テキスト', () => 
        createSettingsBuilder().withText('').addValidator(() => false));
  }

  build() {
    return this.scenarios.map(scenario => ({
      name: scenario.name,
      setup: this.commonSetup,
      teardown: this.commonTeardown,
      builder: scenario.builderFunction,
      execute: () => scenario.builderFunction().build()
    }));
  }
}

/**
 * Builder Factory with Strategy Pattern
 * 目的に応じた最適なBuilderの選択
 */
export class BuilderFactory {
  static strategies = new Map([
    ['settings', () => new EnhancedSettingsBuilder()],
    ['canvas', () => new CanvasBuilder()],
    ['file', () => new FileBuilder()],
    ['animation', () => new AnimationBuilder()],
    ['event', () => new EventBuilder()],
    ['scenario', () => new TestScenarioBuilder()]
  ]);

  static create(type, options = {}) {
    const strategy = this.strategies.get(type);
    if (!strategy) {
      throw new Error(`Unknown builder type: ${type}`);
    }
    
    const builder = strategy();
    
    // 共通オプションの適用
    if (options.validators) {
      options.validators.forEach(validator => builder.addValidator(validator));
    }
    
    if (options.transformers) {
      options.transformers.forEach(transformer => builder.addTransformer(transformer));
    }
    
    if (options.hooks) {
      Object.entries(options.hooks).forEach(([phase, callbacks]) => {
        callbacks.forEach(callback => builder.addHook(phase, callback));
      });
    }
    
    return builder;
  }

  static registerStrategy(type, strategy) {
    this.strategies.set(type, strategy);
  }
}

/**
 * Factory関数 - Builder使用を簡素化
 * SOLID原則: DIP（依存性逆転の原則）- 具象ではなく抽象に依存
 */
export const createSettingsBuilder = (options) => 
  options ? BuilderFactory.create('settings', options) : new EnhancedSettingsBuilder();
export const createCanvasBuilder = () => new CanvasBuilder();
export const createFileBuilder = () => new FileBuilder();
export const createAnimationBuilder = () => new AnimationBuilder();
export const createEventBuilder = () => new EventBuilder();
export const createScenarioBuilder = () => new TestScenarioBuilder();

// 後方互換性のため、元のSettingsBuilderも残す
// export { EnhancedSettingsBuilder as SettingsBuilder }; // 重複エクスポートを削除

/**
 * 組み合わせプリセット関数
 * 複雑なテストシナリオ用の事前定義設定
 */
export const TestPresets = {
  // 基本的なテキストアイコン
  simpleTextIcon: () => createSettingsBuilder().withSimpleText('OK'),
  
  // アニメーションアイコン
  bounceIcon: () => createSettingsBuilder().withAnimatedText('UP', 'bounce'),
  
  // 複雑な設定のアイコン
  complexIcon: () => createSettingsBuilder().withComplexSettings(),
  
  // バリデーションエラーアイコン
  invalidIcon: () => createSettingsBuilder().withInvalidSettings(),
  
  // 画像付きアイコン
  imageIcon: () => createSettingsBuilder()
    .withSimpleText('IMG')
    .withImage('data:image/png;base64,test', 80, 50, 25, 25),
  
  // パフォーマンステスト用大きなアイコン
  largeIcon: () => createSettingsBuilder()
    .withText('BIG')
    .withFontSize(100)
    .withCanvasSize(128)
    .withAnimation('pulse', 50, 100),
    
  // モバイル用小さなアイコン
  mobileIcon: () => createSettingsBuilder()
    .withText('M')
    .withFontSize(40)
    .withCanvasSize(64),

  // 各種アニメーションテスト用
  allAnimations: () => [
    'none', 'bounce', 'pulse', 'rotate', 'fade', 'slide', 'glow', 'rainbow', 'blink'
  ].map(animation => 
    createSettingsBuilder().withText('TEST').withAnimation(animation)
  )
};