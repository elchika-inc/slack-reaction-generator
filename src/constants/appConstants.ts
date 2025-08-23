/**
 * アプリケーション全体で使用される定数
 */

// テキスト関連
export const TEXT_CONSTANTS = {
  MAX_LENGTH: 30,
  MIN_FONT_SIZE: 10,
  MAX_FONT_SIZE: 200,
  DEFAULT_FONT_SIZE: 60,
  FONT_WEIGHT_NORMAL: 400,
  FONT_WEIGHT_BOLD: 700,
  FONT_WEIGHT_BLACK: 900,
} as const;

// キャンバス関連
export const CANVAS_CONSTANTS = {
  DEFAULT_SIZE: 128,
  SMALL_SIZE: 64,
  PREVIEW_SIZE: 32,
  MAX_WIDTH: 256,
  MIN_WIDTH: 32,
  DEFAULT_QUALITY: 85,
  HIGH_QUALITY: 100,
  LOW_QUALITY: 20,
} as const;

// アニメーション関連
export const ANIMATION_CONSTANTS = {
  DEFAULT_FRAMES: 30,
  MIN_FRAMES: 10,
  MAX_FRAMES: 60,
  DEFAULT_SPEED: 33,
  MIN_SPEED: 20,
  MAX_SPEED: 1000,
  MIN_DELAY: 30, // GIF制限
  DEFAULT_AMPLITUDE: 50,
  MIN_AMPLITUDE: 0,
  MAX_AMPLITUDE: 100,
} as const;

// 画像関連
export const IMAGE_CONSTANTS = {
  DEFAULT_POSITION: 50,
  DEFAULT_SIZE: 50,
  DEFAULT_OPACITY: 100,
  MIN_SIZE: 10,
  MAX_SIZE: 200,
  MIN_OPACITY: 0,
  MAX_OPACITY: 100,
} as const;

// カラー関連
export const COLOR_CONSTANTS = {
  DEFAULT_COLORS: [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FD79A8', '#A29BFE',
    '#6C5CE7', '#00B894', '#FDCB6E', '#E17055', '#74B9FF',
    '#55A3FF', '#00CEC9'
  ],
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  TRANSPARENT: 'transparent',
  DEFAULT_GRADIENT_1: '#FF6B6B',
  DEFAULT_GRADIENT_2: '#4ECDC4',
  SECONDARY_COLOR: '#FFD700',
} as const;

// ファイル関連
export const FILE_CONSTANTS = {
  MAX_FILE_SIZE: 128 * 1024, // 128KB
  SUPPORTED_IMAGE_TYPES: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
  DEFAULT_PNG_QUALITY: 0.85,
  DEFAULT_GIF_QUALITY: 20,
} as const;

// UI関連
export const UI_CONSTANTS = {
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  DESKTOP_BREAKPOINT: 1280,
  COLOR_PICKER_HEIGHT: 300,
  COLOR_PICKER_WIDTH: 250,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
} as const;

// Worker関連
export const WORKER_CONSTANTS = {
  DEFAULT_WORKERS: 2,
  MAX_WORKERS: 4,
  WORKER_TIMEOUT: 30000, // 30秒
  MAX_RETRY_COUNT: 3,
} as const;

// ローカルストレージキー
export const STORAGE_KEYS = {
  LOCALE: 'preferred-locale',
  THEME: 'preferred-theme',
  SETTINGS: 'icon-settings',
  RECENT_COLORS: 'recent-colors',
} as const;

// エラーメッセージ
export const ERROR_MESSAGES = {
  CANVAS_CONTEXT_FAILED: 'Canvas context could not be obtained',
  FILE_GENERATION_FAILED: 'File generation failed',
  IMAGE_LOAD_FAILED: 'Failed to load image',
  WORKER_INIT_FAILED: 'Failed to initialize worker',
  SETTINGS_INVALID: 'Invalid settings provided',
} as const;