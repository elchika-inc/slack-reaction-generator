// 共通エラーハンドラー

export const ErrorTypes = {
  FONT_LOADING: 'FONT_LOADING',
  FILE_DOWNLOAD: 'FILE_DOWNLOAD',
  IMAGE_LOAD: 'IMAGE_LOAD',
  SHARE_API: 'SHARE_API',
  CANVAS_RENDER: 'CANVAS_RENDER',
  NETWORK: 'NETWORK'
};

class AppError extends Error {
  constructor(type, message, originalError = null) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }
}

// エラーログ用の統一フォーマット
const logError = (error) => {
  if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
    // eslint-disable-next-line no-console
    console.warn(`[${error.timestamp}] ${error.type}: ${error.message}`, error.originalError);
  }
};

// 汎用的なエラーハンドラー関数
export const handleError = (type, originalError, customMessage = null) => {
  const defaultMessages = {
    [ErrorTypes.FONT_LOADING]: 'フォント読み込みに失敗しました',
    [ErrorTypes.FILE_DOWNLOAD]: 'ファイルのダウンロードに失敗しました', 
    [ErrorTypes.IMAGE_LOAD]: '画像の読み込みに失敗しました',
    [ErrorTypes.SHARE_API]: '共有機能が利用できません',
    [ErrorTypes.CANVAS_RENDER]: 'Canvas描画でエラーが発生しました',
    [ErrorTypes.NETWORK]: 'ネットワークエラーが発生しました'
  };

  const message = customMessage || defaultMessages[type] || '予期しないエラーが発生しました';
  const appError = new AppError(type, message, originalError);
  
  logError(appError);
  return appError;
};

// 安全な非同期実行ラッパー
export const safeAsync = async (asyncFn, errorType, customMessage = null) => {
  try {
    return await asyncFn();
  } catch (error) {
    return handleError(errorType, error, customMessage);
  }
};

// 安全な同期実行ラッパー  
export const safeSync = (syncFn, errorType, customMessage = null) => {
  try {
    return syncFn();
  } catch (error) {
    return handleError(errorType, error, customMessage);
  }
};