// TypeScript型定義ファイル - 段階的移行用

// 基本設定の型
export interface BasicSettings {
  text: string;
  fontSize: number;
  fontFamily: string;
  fontColor: string;
  textColorType: 'solid' | 'gradient';
  gradientColor1: string;
  gradientColor2: string;
  gradientDirection: 'vertical' | 'horizontal';
  backgroundType: 'transparent' | 'color';
  backgroundColor: string;
}

// アニメーション設定の型
export interface AnimationSettings {
  animation: 'none' | 'rainbow' | 'blink' | 'rotate' | 'bounce' | 'pulse' | 'glow' | 'slide' | 'fade';
  animationSpeed: number;
  animationAmplitude: number;
  secondaryColor: string;
}

// 画像設定の型
export interface ImageSettings {
  imageData: string | null;
  imageX: number;
  imageY: number;
  imageSize: number;
  imageOpacity: number;
  imagePosition: 'front' | 'back';
  imageAnimation: 'none' | 'rotate' | 'bounce' | 'pulse' | 'slide' | 'fade';
  imageAnimationAmplitude: number;
}

// 最適化設定の型
export interface OptimizationSettings {
  canvasSize: 64 | 128;
  pngQuality: number;
  gifQuality: number;
  gifFrames: number;
}

// 構造化設定の型
export interface StructuredSettings {
  basic: BasicSettings;
  animation: AnimationSettings;
  image: ImageSettings;
  optimization: OptimizationSettings;
}

// フラット設定の型（下位互換性）
export interface FlatSettings extends BasicSettings, AnimationSettings, ImageSettings, OptimizationSettings {}

// Canvas レンダリング関連
export interface CanvasData {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  animationId: number | null;
  lastTime: number;
  frame: number;
}

// アニメーション定数
export interface AnimationConstants {
  FULL_ROTATION: number;
  BOUNCE_HEIGHT_FACTOR: number;
  PULSE_SCALE_RANGE: number;
  SLIDE_DISTANCE_FACTOR: number;
  GLOW_BLUR_MAX: number;
  GLOW_BLUR_MIN: number;
  FADE_AMPLITUDE: number;
  RAINBOW_HUE_FULL: number;
  BLINK_FREQUENCY: number;
  HSL_SATURATION: number;
  HSL_LIGHTNESS: number;
  MINIMUM_GIF_DELAY: number;
  GIF_DELAY_PRECISION: number;
  DEFAULT_AMPLITUDE: number;
  OPACITY_MAX: number;
  SIZE_MAX: number;
  POSITION_MAX: number;
  CENTER_POSITION: number;
}

// エラーハンドリング
export type ErrorType = 
  | 'FONT_LOADING'
  | 'FILE_DOWNLOAD' 
  | 'IMAGE_LOAD'
  | 'SHARE_API'
  | 'CANVAS_RENDER'
  | 'NETWORK';

export interface AppError extends Error {
  type: ErrorType;
  originalError: Error | null;
  timestamp: string;
}

// フック戻り値の型
export interface UseIconSettingsReturn {
  iconSettings: FlatSettings;
  handleSettingsChange: (newSettings: Partial<FlatSettings>) => void;
  structuredSettings: StructuredSettings;
  updateSettingsByCategory: (category: string, newSettings: any) => void;
  updateBasicSettings: (newBasic: Partial<BasicSettings>) => void;
  updateAnimationSettings: (newAnimation: Partial<AnimationSettings>) => void;
  updateImageSettings: (newImage: Partial<ImageSettings>) => void;
  updateOptimizationSettings: (newOptimization: Partial<OptimizationSettings>) => void;
  validationErrors: string[];
  isValid: boolean;
}

export interface UseFileGenerationReturn {
  previewData: string | null;
  handleGeneratePreview: (settings: FlatSettings, isMobile: boolean) => void;
}

export interface UseCanvasPreviewReturn {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  smallCanvasRef: React.RefObject<HTMLCanvasElement>;
}

export interface UseAppStateReturn {
  isMobile: boolean;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  configureNetworkFeatures: (handleSettingsChange: (settings: Partial<FlatSettings>) => void) => void;
}