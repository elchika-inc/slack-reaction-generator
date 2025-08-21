// 共通エラーハンドラー
import { useState, useEffect } from 'react';

export const ErrorTypes = {
  FONT_LOADING: 'FONT_LOADING',
  FILE_DOWNLOAD: 'FILE_DOWNLOAD',
  IMAGE_LOAD: 'IMAGE_LOAD',
  SHARE_API: 'SHARE_API',
  CANVAS_RENDER: 'CANVAS_RENDER',
  NETWORK: 'NETWORK',
  VALIDATION: 'VALIDATION',
  PERMISSION: 'PERMISSION',
  WORKER: 'WORKER',
  GIF_GENERATION: 'GIF_GENERATION',
  STATE_UPDATE: 'STATE_UPDATE',
  INITIALIZATION: 'INITIALIZATION'
};

export const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

class AppError extends Error {
  constructor(type, message, originalError = null, severity = ErrorSeverity.MEDIUM) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
    this.severity = severity;
    this.context = {};
  }

  withContext(context) {
    this.context = { ...this.context, ...context };
    return this;
  }
}

// エラーハンドラーコールバック型定義
type ErrorCallback = (error: AppError) => void;

// グローバルエラーハンドラー管理
class ErrorManager {
  private static instance: ErrorManager;
  private errorHandlers: Map<string, ErrorCallback[]> = new Map();
  private errorHistory: AppError[] = [];
  private maxHistorySize = 50;

  private constructor() {}

  static getInstance(): ErrorManager {
    if (!ErrorManager.instance) {
      ErrorManager.instance = new ErrorManager();
    }
    return ErrorManager.instance;
  }

  register(type: string, callback: ErrorCallback): () => void {
    const handlers = this.errorHandlers.get(type) || [];
    handlers.push(callback);
    this.errorHandlers.set(type, handlers);

    // 登録解除関数を返す
    return () => {
      const handlers = this.errorHandlers.get(type) || [];
      const index = handlers.indexOf(callback);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    };
  }

  notify(error: AppError): void {
    // エラー履歴に追加
    this.errorHistory.push(error);
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.shift();
    }

    // 該当タイプのハンドラーを実行
    const handlers = this.errorHandlers.get(error.type) || [];
    handlers.forEach(handler => {
      try {
        handler(error);
      } catch (e) {
        // 本番環境では何も出力しない
        if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
          console.error('Error in error handler:', e);
        }
      }
    });

    // グローバルハンドラーも実行
    const globalHandlers = this.errorHandlers.get('*') || [];
    globalHandlers.forEach(handler => {
      try {
        handler(error);
      } catch (e) {
        // 本番環境では何も出力しない
        if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
          console.error('Error in global error handler:', e);
        }
      }
    });
  }

  getHistory(): AppError[] {
    return [...this.errorHistory];
  }

  clearHistory(): void {
    this.errorHistory = [];
  }
}

export const errorManager = ErrorManager.getInstance();

// エラーログ用の統一フォーマット
const logError = (error: AppError) => {
  const isDev = typeof window !== 'undefined' && window.location?.hostname === 'localhost';
  const isProduction = typeof window !== 'undefined' && !isDev;
  
  // 本番環境では一切ログを出力しない
  if (isProduction) {
    // エラーマネージャーには通知するが、コンソールには出力しない
    errorManager.notify(error);
    return;
  }
  
  // 開発環境でのみコンソールに出力
  if (isDev) {
    const severityColors = {
      [ErrorSeverity.LOW]: 'color: #888',
      [ErrorSeverity.MEDIUM]: 'color: #FFA500',
      [ErrorSeverity.HIGH]: 'color: #FF6347',
      [ErrorSeverity.CRITICAL]: 'color: #FF0000; font-weight: bold'
    };

    console.group(
      `%c[${error.severity.toUpperCase()}] ${error.type}`,
      severityColors[error.severity] || 'color: #000'
    );
    console.log(`Time: ${error.timestamp}`);
    console.log(`Message: ${error.message}`);
    if (Object.keys(error.context).length > 0) {
      console.log('Context:', error.context);
    }
    if (error.originalError) {
      console.log('Original Error:', error.originalError);
    }
    console.trace('Stack Trace');
    console.groupEnd();
  }

  // エラーマネージャーに通知
  errorManager.notify(error);
};

// 汎用的なエラーハンドラー関数
export const handleError = (type, originalError = null, customMessage = null, severity = ErrorSeverity.MEDIUM) => {
  const defaultMessages = {
    [ErrorTypes.FONT_LOADING]: 'フォント読み込みに失敗しました',
    [ErrorTypes.FILE_DOWNLOAD]: 'ファイルのダウンロードに失敗しました', 
    [ErrorTypes.IMAGE_LOAD]: '画像の読み込みに失敗しました',
    [ErrorTypes.SHARE_API]: '共有機能が利用できません',
    [ErrorTypes.CANVAS_RENDER]: 'Canvas描画でエラーが発生しました',
    [ErrorTypes.NETWORK]: 'ネットワークエラーが発生しました',
    [ErrorTypes.VALIDATION]: '入力値が無効です',
    [ErrorTypes.PERMISSION]: 'アクセス権限がありません',
    [ErrorTypes.WORKER]: 'バックグラウンド処理でエラーが発生しました',
    [ErrorTypes.GIF_GENERATION]: 'GIF生成中にエラーが発生しました',
    [ErrorTypes.STATE_UPDATE]: '状態更新でエラーが発生しました',
    [ErrorTypes.INITIALIZATION]: '初期化に失敗しました'
  };

  const message = customMessage || defaultMessages[type] || '予期しないエラーが発生しました';
  const appError = new AppError(type, message, originalError, severity);
  
  logError(appError);
  return appError;
};

// 安全な非同期実行ラッパー
export const safeAsync = async (asyncFn, errorType, customMessage = null, severity = ErrorSeverity.MEDIUM) => {
  try {
    return await asyncFn();
  } catch (error) {
    return handleError(errorType, error, customMessage, severity);
  }
};

// 安全な同期実行ラッパー  
export const safeSync = (syncFn, errorType, customMessage = null, severity = ErrorSeverity.MEDIUM) => {
  try {
    return syncFn();
  } catch (error) {
    return handleError(errorType, error, customMessage, severity);
  }
};

// リトライ機能付き非同期実行ラッパー
export const retryAsync = async (
  asyncFn,
  errorType,
  options = {}
) => {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = 2,
    customMessage = null,
    severity = ErrorSeverity.MEDIUM
  } = options;

  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await asyncFn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries - 1) {
        // エクスポネンシャルバックオフ
        const waitTime = delay * Math.pow(backoff, attempt);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  return handleError(errorType, lastError, customMessage || `Failed after ${maxRetries} attempts`, severity);
};

// エラーバウンダリ用フック
export const useErrorHandler = (errorType = '*') => {
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const unregister = errorManager.register(errorType, (error) => {
      setError(error);
    });
    
    return unregister;
  }, [errorType]);
  
  const clearError = () => setError(null);
  
  return { error, clearError };
};

// グローバルエラーハンドラー設定
if (typeof window !== 'undefined') {
  const isDev = window.location?.hostname === 'localhost';
  
  window.addEventListener('unhandledrejection', (event) => {
    // 本番環境ではサイレントにエラーを処理
    if (isDev) {
      const error = new AppError(
        ErrorTypes.NETWORK,
        'Unhandled Promise Rejection',
        event.reason,
        ErrorSeverity.HIGH
      );
      logError(error);
    }
    event.preventDefault();
  });

  window.addEventListener('error', (event) => {
    // 本番環境ではサイレントにエラーを処理
    if (isDev) {
      const error = new AppError(
        ErrorTypes.INITIALIZATION,
        event.message || 'Uncaught Error',
        event.error,
        ErrorSeverity.CRITICAL
      );
      logError(error);
    }
    // 本番環境でもエラーのデフォルト動作は防ぐ
    if (!isDev) {
      event.preventDefault();
    }
  });
}