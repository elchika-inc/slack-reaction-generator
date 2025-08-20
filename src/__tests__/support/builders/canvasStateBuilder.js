/**
 * Canvas State Builder
 * キャンバス状態の複雑な組み合わせを構築するTest Builder Pattern実装
 * 
 * 特徴:
 * - デフォルト値戦略による簡潔な記述
 * - メソッドチェーンによる流暢なインターフェース
 * - テストケース固有の調整が容易
 */

/**
 * Canvas State Builder
 * キャンバスの状態（描画状態、変換状態、スタイル状態）を構築
 */
export class CanvasStateBuilder {
  constructor() {
    this.reset();
  }

  reset() {
    this.canvasState = {
      // 基本設定
      width: 128,
      height: 128,
      devicePixelRatio: 1,
      
      // 描画状態
      context: null,
      imageData: null,
      isCleared: true,
      lastDrawnFrame: null,
      
      // 変換マトリクス状態
      transformations: {
        translateX: 0,
        translateY: 0,
        rotation: 0,
        scaleX: 1,
        scaleY: 1
      },
      
      // スタイル状態
      styles: {
        fillStyle: '#000000',
        strokeStyle: '#000000',
        globalAlpha: 1,
        lineWidth: 1,
        font: '16px Arial',
        textAlign: 'center',
        textBaseline: 'middle',
        shadowColor: 'transparent',
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        globalCompositeOperation: 'source-over'
      },
      
      // レンダリング状態
      rendering: {
        isRendering: false,
        lastRenderTime: null,
        frameCount: 0,
        averageFPS: 0,
        renderingQueue: []
      },
      
      // エラー状態
      errors: {
        hasErrors: false,
        lastError: null,
        errorCount: 0,
        errorHistory: []
      }
    };
    return this;
  }

  // === 基本設定 ===
  
  withSize(width, height = width) {
    this.canvasState.width = width;
    this.canvasState.height = height;
    return this;
  }

  withDevicePixelRatio(ratio) {
    this.canvasState.devicePixelRatio = ratio;
    return this;
  }

  // === 描画状態 ===
  
  withMockContext() {
    this.canvasState.context = {
      // 描画メソッド
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      fillText: vi.fn(),
      strokeText: vi.fn(),
      drawImage: vi.fn(),
      
      // パス描画
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      arcTo: vi.fn(),
      bezierCurveTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      clip: vi.fn(),
      
      // 変換
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn(),
      transform: vi.fn(),
      setTransform: vi.fn(),
      resetTransform: vi.fn(),
      
      // 測定
      measureText: vi.fn(() => ({ width: 100, actualBoundingBoxLeft: 0, actualBoundingBoxRight: 100 })),
      isPointInPath: vi.fn(() => false),
      isPointInStroke: vi.fn(() => false),
      
      // イメージデータ
      createImageData: vi.fn(() => ({ data: new Uint8ClampedArray(128 * 128 * 4), width: 128, height: 128 })),
      getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(128 * 128 * 4), width: 128, height: 128 })),
      putImageData: vi.fn(),
      
      // プロパティ
      canvas: {
        width: this.canvasState.width,
        height: this.canvasState.height,
        toDataURL: vi.fn(() => 'data:image/png;base64,test'),
        toBlob: vi.fn((callback) => callback(new Blob(['test'], { type: 'image/png' })))
      },
      
      // スタイルプロパティ
      fillStyle: this.canvasState.styles.fillStyle,
      strokeStyle: this.canvasState.styles.strokeStyle,
      globalAlpha: this.canvasState.styles.globalAlpha,
      lineWidth: this.canvasState.styles.lineWidth,
      font: this.canvasState.styles.font,
      textAlign: this.canvasState.styles.textAlign,
      textBaseline: this.canvasState.styles.textBaseline,
      shadowColor: this.canvasState.styles.shadowColor,
      shadowBlur: this.canvasState.styles.shadowBlur,
      shadowOffsetX: this.canvasState.styles.shadowOffsetX,
      shadowOffsetY: this.canvasState.styles.shadowOffsetY,
      globalCompositeOperation: this.canvasState.styles.globalCompositeOperation
    };
    return this;
  }

  withImageData(data = null) {
    if (!data) {
      data = new Uint8ClampedArray(this.canvasState.width * this.canvasState.height * 4);
      // デフォルトで白背景を設定
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255;     // Red
        data[i + 1] = 255; // Green
        data[i + 2] = 255; // Blue
        data[i + 3] = 255; // Alpha
      }
    }
    this.canvasState.imageData = {
      data,
      width: this.canvasState.width,
      height: this.canvasState.height
    };
    return this;
  }

  asCleared() {
    this.canvasState.isCleared = true;
    this.canvasState.lastDrawnFrame = null;
    return this;
  }

  asDirty() {
    this.canvasState.isCleared = false;
    this.canvasState.lastDrawnFrame = Date.now();
    return this;
  }

  // === 変換状態 ===
  
  withTranslation(x, y) {
    this.canvasState.transformations.translateX = x;
    this.canvasState.transformations.translateY = y;
    return this;
  }

  withRotation(angle) {
    this.canvasState.transformations.rotation = angle;
    return this;
  }

  withScale(scaleX, scaleY = scaleX) {
    this.canvasState.transformations.scaleX = scaleX;
    this.canvasState.transformations.scaleY = scaleY;
    return this;
  }

  // === スタイル状態 ===
  
  withFillStyle(style) {
    this.canvasState.styles.fillStyle = style;
    if (this.canvasState.context) {
      this.canvasState.context.fillStyle = style;
    }
    return this;
  }

  withStrokeStyle(style) {
    this.canvasState.styles.strokeStyle = style;
    if (this.canvasState.context) {
      this.canvasState.context.strokeStyle = style;
    }
    return this;
  }

  withGlobalAlpha(alpha) {
    this.canvasState.styles.globalAlpha = alpha;
    if (this.canvasState.context) {
      this.canvasState.context.globalAlpha = alpha;
    }
    return this;
  }

  withFont(font) {
    this.canvasState.styles.font = font;
    if (this.canvasState.context) {
      this.canvasState.context.font = font;
    }
    return this;
  }

  withTextAlign(align) {
    this.canvasState.styles.textAlign = align;
    if (this.canvasState.context) {
      this.canvasState.context.textAlign = align;
    }
    return this;
  }

  withShadow(color, blur = 0, offsetX = 0, offsetY = 0) {
    this.canvasState.styles.shadowColor = color;
    this.canvasState.styles.shadowBlur = blur;
    this.canvasState.styles.shadowOffsetX = offsetX;
    this.canvasState.styles.shadowOffsetY = offsetY;
    
    if (this.canvasState.context) {
      this.canvasState.context.shadowColor = color;
      this.canvasState.context.shadowBlur = blur;
      this.canvasState.context.shadowOffsetX = offsetX;
      this.canvasState.context.shadowOffsetY = offsetY;
    }
    return this;
  }

  withCompositeOperation(operation) {
    this.canvasState.styles.globalCompositeOperation = operation;
    if (this.canvasState.context) {
      this.canvasState.context.globalCompositeOperation = operation;
    }
    return this;
  }

  // === レンダリング状態 ===
  
  asRendering() {
    this.canvasState.rendering.isRendering = true;
    this.canvasState.rendering.lastRenderTime = Date.now();
    return this;
  }

  asIdle() {
    this.canvasState.rendering.isRendering = false;
    return this;
  }

  withFrameCount(count) {
    this.canvasState.rendering.frameCount = count;
    return this;
  }

  withFPS(fps) {
    this.canvasState.rendering.averageFPS = fps;
    return this;
  }

  withRenderingQueue(queue = []) {
    this.canvasState.rendering.renderingQueue = [...queue];
    return this;
  }

  // === エラー状態 ===
  
  withError(error) {
    this.canvasState.errors.hasErrors = true;
    this.canvasState.errors.lastError = error;
    this.canvasState.errors.errorCount += 1;
    this.canvasState.errors.errorHistory.push({
      error,
      timestamp: Date.now()
    });
    return this;
  }

  withoutErrors() {
    this.canvasState.errors.hasErrors = false;
    this.canvasState.errors.lastError = null;
    this.canvasState.errors.errorCount = 0;
    this.canvasState.errors.errorHistory = [];
    return this;
  }

  // === プリセットメソッド ===
  
  asStandardCanvas() {
    return this
      .withSize(128, 128)
      .withMockContext()
      .withImageData()
      .asCleared()
      .withoutErrors();
  }

  asHighDPICanvas() {
    return this
      .withSize(256, 256)
      .withDevicePixelRatio(2)
      .withMockContext()
      .withImageData()
      .asCleared();
  }

  asAnimationCanvas() {
    return this
      .asStandardCanvas()
      .asRendering()
      .withFrameCount(10)
      .withFPS(30);
  }

  asErrorCanvas() {
    return this
      .asStandardCanvas()
      .withError(new Error('Canvas rendering failed'));
  }

  asStyledCanvas() {
    return this
      .asStandardCanvas()
      .withFillStyle('#FF0000')
      .withStrokeStyle('#000000')
      .withFont('24px Arial')
      .withShadow('#00000080', 4, 2, 2);
  }

  asTransformedCanvas() {
    return this
      .asStandardCanvas()
      .withTranslation(64, 64)
      .withRotation(Math.PI / 4)
      .withScale(1.5, 1.5);
  }

  asSmallCanvas() {
    return this
      .withSize(64, 64)
      .withMockContext()
      .withImageData()
      .asCleared();
  }

  asLargeCanvas() {
    return this
      .withSize(512, 512)
      .withMockContext()
      .withImageData()
      .asCleared();
  }

  // === ビルドメソッド ===
  
  build() {
    // モックContextがある場合、最新のスタイル状態を同期
    if (this.canvasState.context) {
      Object.assign(this.canvasState.context, this.canvasState.styles);
      this.canvasState.context.canvas.width = this.canvasState.width;
      this.canvasState.context.canvas.height = this.canvasState.height;
    }
    
    return { ...this.canvasState };
  }
}

/**
 * Factory関数
 */
export const createCanvasStateBuilder = () => new CanvasStateBuilder();

/**
 * Canvas State用のプリセット集
 */
export const CanvasStatePresets = {
  // 基本的なキャンバス
  standard: () => createCanvasStateBuilder().asStandardCanvas(),
  
  // 高解像度キャンバス
  highDPI: () => createCanvasStateBuilder().asHighDPICanvas(),
  
  // アニメーション中のキャンバス
  animating: () => createCanvasStateBuilder().asAnimationCanvas(),
  
  // エラー状態のキャンバス
  error: () => createCanvasStateBuilder().asErrorCanvas(),
  
  // スタイル設定済みキャンバス
  styled: () => createCanvasStateBuilder().asStyledCanvas(),
  
  // 変換済みキャンバス
  transformed: () => createCanvasStateBuilder().asTransformedCanvas(),
  
  // サイズ別キャンバス
  small: () => createCanvasStateBuilder().asSmallCanvas(),
  large: () => createCanvasStateBuilder().asLargeCanvas(),
  
  // 特定のテストシナリオ用
  performanceTest: () => createCanvasStateBuilder()
    .asLargeCanvas()
    .asRendering()
    .withFrameCount(100)
    .withFPS(60),
    
  memoryLeakTest: () => createCanvasStateBuilder()
    .asStandardCanvas()
    .withRenderingQueue(new Array(1000).fill('render-task')),
    
  browserCompatibilityTest: () => createCanvasStateBuilder()
    .asStandardCanvas()
    .withCompositeOperation('multiply')
    .withFont('16px "Custom Font", Arial')
};