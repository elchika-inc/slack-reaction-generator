import { Result, Ok, Err, tryCatchAsync } from './Result';
import { FlatSettings } from '../types/settings';
import { StaticIconGenerator } from './canvas/StaticIconGenerator';
import { AnimatedIconGenerator } from './canvas/AnimatedIconGenerator';
import { ERROR_MESSAGES } from '../constants/appConstants';

/**
 * カスタムエラータイプ
 */
export enum IconGenerationErrorType {
  INVALID_SETTINGS = 'INVALID_SETTINGS',
  CANVAS_ERROR = 'CANVAS_ERROR',
  ANIMATION_ERROR = 'ANIMATION_ERROR',
  IMAGE_LOAD_ERROR = 'IMAGE_LOAD_ERROR',
  WORKER_ERROR = 'WORKER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class IconGenerationError extends Error {
  constructor(
    public readonly type: IconGenerationErrorType,
    message: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'IconGenerationError';
  }
}

/**
 * 型安全なアイコン生成
 */
export class SafeIconGenerator {
  /**
   * アイコンを生成（Result型を返す）
   */
  static async generate(
    settings: FlatSettings,
    canvas?: HTMLCanvasElement
  ): Promise<Result<string, IconGenerationError>> {
    // 設定の検証
    const validationResult = this.validateSettings(settings);
    if (!validationResult.success) {
      return validationResult;
    }

    // アニメーションの有無を判定
    const hasAnimation = this.hasAnimation(settings);

    if (hasAnimation) {
      return this.generateAnimated(settings);
    } else {
      return this.generateStatic(settings, canvas);
    }
  }

  /**
   * 静止画を生成
   */
  private static async generateStatic(
    settings: FlatSettings,
    canvas?: HTMLCanvasElement
  ): Promise<Result<string, IconGenerationError>> {
    const result = await tryCatchAsync(async () => {
      return StaticIconGenerator.generatePNG(settings, canvas);
    });

    if (!result.success) {
      return Err(
        new IconGenerationError(
          IconGenerationErrorType.CANVAS_ERROR,
          'Failed to generate static icon',
          result.error
        )
      );
    }

    return Ok(result.data);
  }

  /**
   * アニメーションGIFを生成
   */
  private static async generateAnimated(
    settings: FlatSettings
  ): Promise<Result<string, IconGenerationError>> {
    const result = await tryCatchAsync(async () => {
      return AnimatedIconGenerator.generateGIF(settings);
    });

    if (!result.success) {
      const errorType = result.error.message.includes('Worker')
        ? IconGenerationErrorType.WORKER_ERROR
        : IconGenerationErrorType.ANIMATION_ERROR;

      return Err(
        new IconGenerationError(
          errorType,
          'Failed to generate animated icon',
          result.error
        )
      );
    }

    return Ok(result.data);
  }

  /**
   * 設定を検証
   */
  private static validateSettings(
    settings: FlatSettings
  ): Result<true, IconGenerationError> {
    // テキストの検証
    if (!settings.text || settings.text.trim().length === 0) {
      return Err(
        new IconGenerationError(
          IconGenerationErrorType.INVALID_SETTINGS,
          'Text is required for icon generation'
        )
      );
    }

    // フォントサイズの検証
    if (settings.fontSize < 10 || settings.fontSize > 200) {
      return Err(
        new IconGenerationError(
          IconGenerationErrorType.INVALID_SETTINGS,
          'Font size must be between 10 and 200'
        )
      );
    }

    // キャンバスサイズの検証
    if (settings.canvasSize !== 64 && settings.canvasSize !== 128) {
      return Err(
        new IconGenerationError(
          IconGenerationErrorType.INVALID_SETTINGS,
          'Canvas size must be either 64 or 128'
        )
      );
    }

    return Ok(true);
  }

  /**
   * アニメーションの有無を判定
   */
  private static hasAnimation(settings: FlatSettings): boolean {
    const hasTextAnimation = settings.animation && settings.animation !== 'none';
    const hasImageAnimation = settings.imageData && 
                            settings.imageAnimation && 
                            settings.imageAnimation !== 'none';
    return !!(hasTextAnimation || hasImageAnimation);
  }

  /**
   * バッチ生成（複数の設定から一度に生成）
   */
  static async generateBatch(
    settingsList: FlatSettings[]
  ): Promise<Result<string[], IconGenerationError>> {
    const results: string[] = [];

    for (const settings of settingsList) {
      const result = await this.generate(settings);
      
      if (!result.success) {
        return Err(result.error);
      }
      
      results.push(result.data);
    }

    return Ok(results);
  }

  /**
   * リトライ付き生成
   */
  static async generateWithRetry(
    settings: FlatSettings,
    maxRetries = 3,
    canvas?: HTMLCanvasElement
  ): Promise<Result<string, IconGenerationError>> {
    let lastError: IconGenerationError | null = null;

    for (let i = 0; i < maxRetries; i++) {
      const result = await this.generate(settings, canvas);
      
      if (result.success) {
        return result;
      }

      lastError = result.error;
      
      // Worker エラーの場合は待機してリトライ
      if (result.error.type === IconGenerationErrorType.WORKER_ERROR) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }

    return Err(
      lastError || 
      new IconGenerationError(
        IconGenerationErrorType.UNKNOWN_ERROR,
        'Failed after maximum retries'
      )
    );
  }
}