// Test Data Builder Pattern 実装
// 4つのテスト手法（AAA、Test Double、Test Builder、SOLID）を統合した設計

import { createDefaultSettings, flattenSettings } from '../../types/settings';

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
 * Factory関数 - Builder使用を簡素化
 * SOLID原則: DIP（依存性逆転の原則）- 具象ではなく抽象に依存
 */
export const createSettingsBuilder = () => new SettingsBuilder();
export const createCanvasBuilder = () => new CanvasBuilder();
export const createFileBuilder = () => new FileBuilder();
export const createAnimationBuilder = () => new AnimationBuilder();
export const createEventBuilder = () => new EventBuilder();

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