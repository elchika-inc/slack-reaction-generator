/**
 * Animation State Builder
 * アニメーション状態の複雑な組み合わせを構築するTest Builder Pattern実装
 * 
 * 特徴:
 * - アニメーション進行状態の段階的構築
 * - フレーム間の状態遷移のテスト対応
 * - パフォーマンス測定用の状態構築
 */

/**
 * Animation State Builder
 * アニメーションの状態（進行状況、フレーム状態、タイミング状態）を構築
 */
export class AnimationStateBuilder {
  constructor() {
    this.reset();
  }

  reset() {
    this.animationState = {
      // 基本アニメーション設定
      type: 'none',
      duration: 1000,
      easing: 'linear',
      loop: false,
      direction: 'normal', // normal, reverse, alternate, alternate-reverse
      
      // 進行状態
      progress: {
        current: 0,        // 0-1の間の進行率
        frame: 0,          // 現在のフレーム番号
        totalFrames: 30,   // 総フレーム数
        elapsedTime: 0,    // 経過時間（ミリ秒）
        remainingTime: 1000 // 残り時間（ミリ秒）
      },
      
      // タイミング制御
      timing: {
        startTime: null,
        lastFrameTime: null,
        frameRate: 30,         // 目標フレームレート
        actualFrameRate: 0,    // 実際のフレームレート
        frameDuration: 33.33,  // フレーム間隔（ミリ秒）
        deltaTime: 0           // 前フレームからの経過時間
      },
      
      // アニメーション値
      values: {
        // 位置
        x: 0,
        y: 0,
        
        // 回転・スケール
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        
        // 色・透明度
        opacity: 1,
        hue: 0,
        saturation: 1,
        lightness: 0.5,
        
        // カスタム値
        amplitude: 50,
        frequency: 1,
        offset: 0
      },
      
      // フレームデータ
      frames: [],
      keyframes: {},
      
      // 状態管理
      state: {
        isPlaying: false,
        isPaused: false,
        isComplete: false,
        isReversed: false,
        loopCount: 0,
        hasError: false,
        errorMessage: null
      },
      
      // パフォーマンス情報
      performance: {
        averageFrameTime: 0,
        maxFrameTime: 0,
        minFrameTime: Infinity,
        droppedFrames: 0,
        totalFrames: 0,
        memoryUsage: 0
      }
    };
    return this;
  }

  // === 基本アニメーション設定 ===
  
  withType(type) {
    this.animationState.type = type;
    return this;
  }

  withDuration(duration) {
    this.animationState.duration = duration;
    this.animationState.progress.remainingTime = duration;
    return this;
  }

  withEasing(easing) {
    this.animationState.easing = easing;
    return this;
  }

  withLoop(loop = true) {
    this.animationState.loop = loop;
    return this;
  }

  withDirection(direction) {
    this.animationState.direction = direction;
    return this;
  }

  withFrameRate(frameRate) {
    this.animationState.timing.frameRate = frameRate;
    this.animationState.timing.frameDuration = 1000 / frameRate;
    this.animationState.progress.totalFrames = Math.ceil(this.animationState.duration / this.animationState.timing.frameDuration);
    return this;
  }

  // === 進行状態 ===
  
  atProgress(progress) {
    this.animationState.progress.current = Math.max(0, Math.min(1, progress));
    this.animationState.progress.frame = Math.floor(this.animationState.progress.current * this.animationState.progress.totalFrames);
    this.animationState.progress.elapsedTime = this.animationState.progress.current * this.animationState.duration;
    this.animationState.progress.remainingTime = this.animationState.duration - this.animationState.progress.elapsedTime;
    return this;
  }

  atFrame(frame) {
    this.animationState.progress.frame = frame;
    this.animationState.progress.current = frame / this.animationState.progress.totalFrames;
    this.animationState.progress.elapsedTime = this.animationState.progress.current * this.animationState.duration;
    this.animationState.progress.remainingTime = this.animationState.duration - this.animationState.progress.elapsedTime;
    return this;
  }

  atStart() {
    return this.atProgress(0);
  }

  atMiddle() {
    return this.atProgress(0.5);
  }

  atEnd() {
    return this.atProgress(1);
  }

  // === タイミング制御 ===
  
  withStartTime(startTime = Date.now()) {
    this.animationState.timing.startTime = startTime;
    this.animationState.timing.lastFrameTime = startTime;
    return this;
  }

  withDeltaTime(deltaTime) {
    this.animationState.timing.deltaTime = deltaTime;
    this.animationState.timing.lastFrameTime = Date.now() - deltaTime;
    return this;
  }

  withActualFrameRate(frameRate) {
    this.animationState.timing.actualFrameRate = frameRate;
    return this;
  }

  // === アニメーション値 ===
  
  withPosition(x, y) {
    this.animationState.values.x = x;
    this.animationState.values.y = y;
    return this;
  }

  withRotation(rotation) {
    this.animationState.values.rotation = rotation;
    return this;
  }

  withScale(scaleX, scaleY = scaleX) {
    this.animationState.values.scaleX = scaleX;
    this.animationState.values.scaleY = scaleY;
    return this;
  }

  withOpacity(opacity) {
    this.animationState.values.opacity = opacity;
    return this;
  }

  withColor(hue, saturation = 1, lightness = 0.5) {
    this.animationState.values.hue = hue;
    this.animationState.values.saturation = saturation;
    this.animationState.values.lightness = lightness;
    return this;
  }

  withAmplitude(amplitude) {
    this.animationState.values.amplitude = amplitude;
    return this;
  }

  withFrequency(frequency) {
    this.animationState.values.frequency = frequency;
    return this;
  }

  withOffset(offset) {
    this.animationState.values.offset = offset;
    return this;
  }

  // === フレームデータ ===
  
  withFrames(frames) {
    this.animationState.frames = [...frames];
    return this;
  }

  withKeyframes(keyframes) {
    this.animationState.keyframes = { ...keyframes };
    return this;
  }

  addKeyframe(time, values) {
    this.animationState.keyframes[time] = values;
    return this;
  }

  // === 状態管理 ===
  
  asPlaying() {
    this.animationState.state.isPlaying = true;
    this.animationState.state.isPaused = false;
    this.animationState.state.isComplete = false;
    return this;
  }

  asPaused() {
    this.animationState.state.isPlaying = false;
    this.animationState.state.isPaused = true;
    return this;
  }

  asComplete() {
    this.animationState.state.isPlaying = false;
    this.animationState.state.isPaused = false;
    this.animationState.state.isComplete = true;
    return this.atEnd();
  }

  asReversed() {
    this.animationState.state.isReversed = true;
    return this;
  }

  withLoopCount(count) {
    this.animationState.state.loopCount = count;
    return this;
  }

  withError(errorMessage) {
    this.animationState.state.hasError = true;
    this.animationState.state.errorMessage = errorMessage;
    return this;
  }

  withoutError() {
    this.animationState.state.hasError = false;
    this.animationState.state.errorMessage = null;
    return this;
  }

  // === パフォーマンス情報 ===
  
  withFrameTime(average, max = average, min = average) {
    this.animationState.performance.averageFrameTime = average;
    this.animationState.performance.maxFrameTime = max;
    this.animationState.performance.minFrameTime = min;
    return this;
  }

  withDroppedFrames(count) {
    this.animationState.performance.droppedFrames = count;
    return this;
  }

  withMemoryUsage(usage) {
    this.animationState.performance.memoryUsage = usage;
    return this;
  }

  withTotalFrames(frames) {
    this.animationState.performance.totalFrames = frames;
    return this;
  }

  // === プリセットメソッド ===
  
  asBounceAnimation() {
    return this
      .withType('bounce')
      .withDuration(1000)
      .withEasing('ease-out')
      .withAmplitude(50)
      .withFrequency(2);
  }

  asPulseAnimation() {
    return this
      .withType('pulse')
      .withDuration(800)
      .withEasing('ease-in-out')
      .withLoop(true)
      .withScale(1.2, 1.2);
  }

  asRotateAnimation() {
    return this
      .withType('rotate')
      .withDuration(2000)
      .withEasing('linear')
      .withLoop(true)
      .withRotation(Math.PI * 2);
  }

  asFadeAnimation() {
    return this
      .withType('fade')
      .withDuration(500)
      .withEasing('ease-in')
      .withOpacity(0);
  }

  asSlideAnimation() {
    return this
      .withType('slide')
      .withDuration(600)
      .withEasing('ease-out')
      .withPosition(100, 0);
  }

  asGlowAnimation() {
    return this
      .withType('glow')
      .withDuration(1200)
      .withEasing('ease-in-out')
      .withLoop(true)
      .withColor(60, 1, 0.7); // 黄色のグロー
  }

  asRainbowAnimation() {
    return this
      .withType('rainbow')
      .withDuration(3000)
      .withEasing('linear')
      .withLoop(true)
      .withColor(360, 1, 0.5); // フル色相環
  }

  asBlinkAnimation() {
    return this
      .withType('blink')
      .withDuration(400)
      .withEasing('step-end')
      .withLoop(true)
      .withOpacity(0);
  }

  // === 特定状態のプリセット ===
  
  asStartingAnimation() {
    return this
      .asBounceAnimation()
      .asPlaying()
      .atStart()
      .withStartTime();
  }

  asRunningAnimation() {
    return this
      .asPulseAnimation()
      .asPlaying()
      .atMiddle()
      .withStartTime(Date.now() - 400)
      .withActualFrameRate(29);
  }

  asCompletedAnimation() {
    return this
      .asRotateAnimation()
      .asComplete()
      .withLoopCount(3);
  }

  asErrorAnimation() {
    return this
      .asBounceAnimation()
      .asPlaying()
      .atMiddle()
      .withError('Animation frame timeout');
  }

  asHighPerformanceAnimation() {
    return this
      .asRotateAnimation()
      .withFrameRate(60)
      .withFrameTime(16, 20, 12)
      .withTotalFrames(1000);
  }

  asLowPerformanceAnimation() {
    return this
      .asPulseAnimation()
      .withFrameRate(15)
      .withFrameTime(66, 120, 45)
      .withDroppedFrames(50)
      .withTotalFrames(200);
  }

  asMemoryIntensiveAnimation() {
    return this
      .asRainbowAnimation()
      .withMemoryUsage(50 * 1024 * 1024) // 50MB
      .withFrames(new Array(100).fill().map((_, i) => ({ frame: i })));
  }

  // === 複雑なアニメーション状態 ===
  
  asSequentialAnimation() {
    return this
      .withKeyframes({
        0: { x: 0, y: 0, opacity: 1 },
        0.33: { x: 50, y: 0, opacity: 0.8 },
        0.66: { x: 50, y: 50, opacity: 0.6 },
        1: { x: 0, y: 50, opacity: 1 }
      })
      .withDuration(1500)
      .withEasing('cubic-bezier(0.4, 0, 0.2, 1)');
  }

  asParallelAnimation() {
    return this
      .withType('complex')
      .withPosition(25, 25)
      .withRotation(Math.PI / 4)
      .withScale(1.5, 1.5)
      .withOpacity(0.8)
      .withColor(180, 0.8, 0.6)
      .withDuration(2000);
  }

  asInterruptedAnimation() {
    return this
      .asRunningAnimation()
      .asPaused()
      .atProgress(0.7)
      .withLoopCount(1);
  }

  // === ビルドメソッド ===
  
  build() {
    // フレーム数の整合性チェック
    if (this.animationState.frames.length === 0 && this.animationState.progress.totalFrames > 0) {
      this.animationState.frames = new Array(this.animationState.progress.totalFrames)
        .fill()
        .map((_, index) => ({
          frame: index,
          time: (index / this.animationState.progress.totalFrames) * this.animationState.duration,
          progress: index / this.animationState.progress.totalFrames
        }));
    }
    
    // パフォーマンス計算の更新
    if (this.animationState.performance.totalFrames === 0) {
      this.animationState.performance.totalFrames = this.animationState.frames.length;
    }
    
    return { ...this.animationState };
  }
}

/**
 * Factory関数
 */
export const createAnimationStateBuilder = () => new AnimationStateBuilder();

/**
 * Animation State用のプリセット集
 */
export const AnimationStatePresets = {
  // 基本アニメーション
  bounce: () => createAnimationStateBuilder().asBounceAnimation(),
  pulse: () => createAnimationStateBuilder().asPulseAnimation(),
  rotate: () => createAnimationStateBuilder().asRotateAnimation(),
  fade: () => createAnimationStateBuilder().asFadeAnimation(),
  slide: () => createAnimationStateBuilder().asSlideAnimation(),
  glow: () => createAnimationStateBuilder().asGlowAnimation(),
  rainbow: () => createAnimationStateBuilder().asRainbowAnimation(),
  blink: () => createAnimationStateBuilder().asBlinkAnimation(),
  
  // 状態別
  starting: () => createAnimationStateBuilder().asStartingAnimation(),
  running: () => createAnimationStateBuilder().asRunningAnimation(),
  completed: () => createAnimationStateBuilder().asCompletedAnimation(),
  error: () => createAnimationStateBuilder().asErrorAnimation(),
  
  // パフォーマンス別
  highPerformance: () => createAnimationStateBuilder().asHighPerformanceAnimation(),
  lowPerformance: () => createAnimationStateBuilder().asLowPerformanceAnimation(),
  memoryIntensive: () => createAnimationStateBuilder().asMemoryIntensiveAnimation(),
  
  // 複雑なアニメーション
  sequential: () => createAnimationStateBuilder().asSequentialAnimation(),
  parallel: () => createAnimationStateBuilder().asParallelAnimation(),
  interrupted: () => createAnimationStateBuilder().asInterruptedAnimation(),
  
  // テストケース用
  allAnimationTypes: () => [
    'none', 'bounce', 'pulse', 'rotate', 'fade', 'slide', 'glow', 'rainbow', 'blink'
  ].map(type => 
    createAnimationStateBuilder()
      .withType(type)
      .asRunningAnimation()
      .atProgress(Math.random())
  ),
  
  stressTest: () => createAnimationStateBuilder()
    .asParallelAnimation()
    .withFrameRate(120)
    .withDuration(10000)
    .withMemoryUsage(100 * 1024 * 1024)
    .withFrames(new Array(1200).fill().map((_, i) => ({ frame: i }))),
    
  browserCompatibility: () => createAnimationStateBuilder()
    .withType('custom')
    .withEasing('cubic-bezier(0.68, -0.55, 0.265, 1.55)')
    .withDirection('alternate-reverse')
    .withKeyframes({
      0: { transform: 'translate3d(0,0,0) scale(1) rotate(0deg)' },
      1: { transform: 'translate3d(100px,100px,0) scale(2) rotate(360deg)' }
    })
};