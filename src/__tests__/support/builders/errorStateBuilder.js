/**
 * Error State Builder
 * エラー状態とエラーシナリオの構築
 * 
 * 特徴:
 * - 多様なエラータイプの網羅的な構築
 * - エラーの連鎖やリカバリ状態の表現
 * - デバッグ情報付きエラー状態の生成
 */

/**
 * Application Error Builder
 * アプリケーションレベルのエラー状態構築
 */
export class ApplicationErrorBuilder {
  constructor() {
    this.reset();
  }

  reset() {
    this.errorState = {
      // エラーの基本情報
      hasError: false,
      errorType: null,
      errorCode: null,
      errorMessage: null,
      originalError: null,
      
      // エラー詳細
      details: {
        timestamp: Date.now(),
        userAgent: 'Test User Agent',
        url: 'http://localhost:5173',
        userId: null,
        sessionId: 'test-session-123',
        buildVersion: '1.0.0-test'
      },
      
      // スタックトレース
      stack: {
        error: null,
        componentStack: null,
        errorBoundary: null
      },
      
      // エラーの影響範囲
      scope: {
        component: null,
        feature: null,
        severity: 'medium', // low, medium, high, critical
        recoverable: true,
        userFacing: true
      },
      
      // 回復状態
      recovery: {
        attempted: false,
        successful: false,
        retryCount: 0,
        maxRetries: 3,
        retryDelay: 1000,
        fallbackUsed: false
      },
      
      // ログ情報
      logging: {
        logged: false,
        logLevel: 'error',
        reportId: null,
        analytics: {
          tracked: false,
          eventName: null,
          properties: {}
        }
      }
    };
    return this;
  }

  // === 基本エラー情報 ===
  
  withError(errorType, errorCode, errorMessage) {
    this.errorState.hasError = true;
    this.errorState.errorType = errorType;
    this.errorState.errorCode = errorCode;
    this.errorState.errorMessage = errorMessage;
    return this;
  }

  withOriginalError(originalError) {
    this.errorState.originalError = originalError;
    if (originalError instanceof Error) {
      this.errorState.stack.error = originalError.stack;
    }
    return this;
  }

  withTimestamp(timestamp = Date.now()) {
    this.errorState.details.timestamp = timestamp;
    return this;
  }

  // === エラー詳細 ===
  
  withUserContext(userId, sessionId) {
    this.errorState.details.userId = userId;
    this.errorState.details.sessionId = sessionId;
    return this;
  }

  withEnvironmentDetails(userAgent, url, buildVersion) {
    this.errorState.details.userAgent = userAgent;
    this.errorState.details.url = url;
    this.errorState.details.buildVersion = buildVersion;
    return this;
  }

  // === スタックトレース ===
  
  withStack(errorStack, componentStack = null) {
    this.errorState.stack.error = errorStack;
    this.errorState.stack.componentStack = componentStack;
    return this;
  }

  withComponentStack(componentStack) {
    this.errorState.stack.componentStack = componentStack;
    return this;
  }

  withErrorBoundary(boundaryName) {
    this.errorState.stack.errorBoundary = boundaryName;
    return this;
  }

  // === エラー影響範囲 ===
  
  withScope(component, feature, severity = 'medium') {
    this.errorState.scope.component = component;
    this.errorState.scope.feature = feature;
    this.errorState.scope.severity = severity;
    return this;
  }

  asCriticalError() {
    this.errorState.scope.severity = 'critical';
    this.errorState.scope.recoverable = false;
    return this;
  }

  asRecoverableError() {
    this.errorState.scope.recoverable = true;
    this.errorState.scope.severity = 'medium';
    return this;
  }

  asUserFacingError() {
    this.errorState.scope.userFacing = true;
    return this;
  }

  asInternalError() {
    this.errorState.scope.userFacing = false;
    return this;
  }

  // === 回復状態 ===
  
  withRecoveryAttempt(successful = false, retryCount = 1) {
    this.errorState.recovery.attempted = true;
    this.errorState.recovery.successful = successful;
    this.errorState.recovery.retryCount = retryCount;
    return this;
  }

  withRetryConfig(maxRetries, retryDelay) {
    this.errorState.recovery.maxRetries = maxRetries;
    this.errorState.recovery.retryDelay = retryDelay;
    return this;
  }

  withFallback() {
    this.errorState.recovery.fallbackUsed = true;
    return this;
  }

  // === ログ情報 ===
  
  withLogging(logLevel = 'error', reportId = null) {
    this.errorState.logging.logged = true;
    this.errorState.logging.logLevel = logLevel;
    this.errorState.logging.reportId = reportId || 'report-' + Math.random().toString(36).substr(2, 9);
    return this;
  }

  withAnalytics(eventName, properties = {}) {
    this.errorState.logging.analytics.tracked = true;
    this.errorState.logging.analytics.eventName = eventName;
    this.errorState.logging.analytics.properties = properties;
    return this;
  }

  // === プリセットエラータイプ ===
  
  asValidationError(field, message) {
    return this
      .withError('validation', 'VALIDATION_ERROR', message)
      .withScope('Form', 'validation', 'low')
      .asUserFacingError()
      .asRecoverableError();
  }

  asNetworkError(message = 'ネットワークエラーが発生しました') {
    return this
      .withError('network', 'NETWORK_ERROR', message)
      .withScope('API', 'network', 'medium')
      .asUserFacingError()
      .asRecoverableError()
      .withRetryConfig(3, 2000);
  }

  asRenderingError(message = 'レンダリングエラーが発生しました') {
    return this
      .withError('rendering', 'RENDERING_ERROR', message)
      .withScope('Canvas', 'rendering', 'high')
      .asUserFacingError()
      .asRecoverableError()
      .withFallback();
  }

  asFileError(message = 'ファイル処理エラーが発生しました') {
    return this
      .withError('file', 'FILE_ERROR', message)
      .withScope('FileUpload', 'file', 'medium')
      .asUserFacingError()
      .asRecoverableError();
  }

  asMemoryError(message = 'メモリ不足エラーが発生しました') {
    return this
      .withError('memory', 'MEMORY_ERROR', message)
      .withScope('Application', 'memory', 'critical')
      .asCriticalError()
      .asUserFacingError()
      .withFallback();
  }

  asSecurityError(message = 'セキュリティエラーが発生しました') {
    return this
      .withError('security', 'SECURITY_ERROR', message)
      .withScope('Security', 'authentication', 'critical')
      .asCriticalError()
      .asInternalError();
  }

  asConfigurationError(message = '設定エラーが発生しました') {
    return this
      .withError('configuration', 'CONFIG_ERROR', message)
      .withScope('Application', 'configuration', 'high')
      .asInternalError();
  }

  asBrowserCompatibilityError(feature, message = 'ブラウザがサポートしていません') {
    return this
      .withError('compatibility', 'BROWSER_COMPATIBILITY_ERROR', message)
      .withScope('Browser', feature, 'medium')
      .asUserFacingError()
      .withFallback();
  }

  // === 特定シナリオのエラー ===
  
  asJavaScriptError() {
    const jsError = new Error('Unexpected error in component');
    jsError.stack = `Error: Unexpected error in component
    at IconEditor (http://localhost:5173/src/components/IconEditor.jsx:45:12)
    at App (http://localhost:5173/src/App.jsx:23:8)
    at main (http://localhost:5173/src/main.jsx:10:5)`;
    
    return this
      .withError('javascript', 'JS_ERROR', 'Unexpected error in component')
      .withOriginalError(jsError)
      .withScope('IconEditor', 'rendering', 'high')
      .withComponentStack('IconEditor > App > main')
      .withErrorBoundary('ErrorBoundary')
      .asUserFacingError();
  }

  asAsyncOperationError() {
    const asyncError = new Error('Promise rejection');
    return this
      .withError('async', 'ASYNC_ERROR', 'Asynchronous operation failed')
      .withOriginalError(asyncError)
      .withScope('FileProcessor', 'async', 'medium')
      .asRecoverableError()
      .withRecoveryAttempt(false, 1);
  }

  asCanvasRenderingError() {
    return this
      .withError('canvas', 'CANVAS_ERROR', 'Canvas rendering failed')
      .withScope('CanvasRenderer', 'rendering', 'high')
      .withOriginalError(new Error('Unable to get canvas context'))
      .asUserFacingError()
      .withFallback();
  }

  asGifGenerationError() {
    return this
      .withError('gif', 'GIF_GENERATION_ERROR', 'GIF generation failed')
      .withScope('GifGenerator', 'export', 'medium')
      .asUserFacingError()
      .asRecoverableError()
      .withRetryConfig(2, 3000);
  }

  asQuotaExceededError() {
    return this
      .withError('quota', 'QUOTA_EXCEEDED', 'Storage quota exceeded')
      .withScope('Storage', 'persistence', 'medium')
      .asUserFacingError()
      .asRecoverableError();
  }

  // === エラー連鎖 ===
  
  asCascadingError(originalErrorState) {
    return this
      .withError('cascade', 'CASCADING_ERROR', 'Multiple errors occurred')
      .withOriginalError(originalErrorState)
      .withScope('Application', 'system', 'critical')
      .asCriticalError();
  }

  asRecoveredError() {
    return this
      .withRecoveryAttempt(true, 2)
      .withLogging('info', 'recovery-' + Math.random().toString(36).substr(2, 9))
      .withAnalytics('error_recovered', { 
        errorType: this.errorState.errorType,
        retryCount: 2
      });
  }

  asUnhandledError() {
    return this
      .withError('unhandled', 'UNHANDLED_ERROR', 'Unhandled error')
      .asCriticalError()
      .withLogging('fatal')
      .withAnalytics('unhandled_error', {
        url: window.location?.href || 'test-url',
        timestamp: Date.now()
      });
  }

  // === ビルドメソッド ===
  
  build() {
    // エラーが設定されていない場合のデフォルト処理
    if (!this.errorState.hasError && this.errorState.errorType) {
      this.errorState.hasError = true;
    }
    
    // ログ情報の自動設定
    if (this.errorState.hasError && !this.errorState.logging.logged && this.errorState.scope.userFacing) {
      this.withLogging();
    }
    
    return { ...this.errorState };
  }
}

/**
 * Error Collection Builder
 * 複数のエラー状態を管理
 */
export class ErrorCollectionBuilder {
  constructor() {
    this.reset();
  }

  reset() {
    this.collection = {
      errors: [],
      activeErrors: [],
      resolvedErrors: [],
      statistics: {
        totalErrors: 0,
        criticalErrors: 0,
        recoverableErrors: 0,
        recoveredErrors: 0
      },
      settings: {
        maxActiveErrors: 10,
        autoResolveAfter: 60000, // 1分
        retryEnabled: true
      }
    };
    return this;
  }

  // === エラー追加 ===
  
  addError(errorState) {
    this.collection.errors.push(errorState);
    if (errorState.hasError) {
      this.collection.activeErrors.push(errorState);
    }
    this.updateStatistics();
    return this;
  }

  addErrors(errorStates) {
    errorStates.forEach(error => this.addError(error));
    return this;
  }

  // === エラー解決 ===
  
  resolveError(errorIndex) {
    if (this.collection.activeErrors[errorIndex]) {
      const resolvedError = this.collection.activeErrors.splice(errorIndex, 1)[0];
      resolvedError.recovery.successful = true;
      resolvedError.recovery.attempted = true;
      this.collection.resolvedErrors.push(resolvedError);
      this.updateStatistics();
    }
    return this;
  }

  resolveAllErrors() {
    this.collection.resolvedErrors.push(...this.collection.activeErrors);
    this.collection.activeErrors.forEach(error => {
      error.recovery.successful = true;
      error.recovery.attempted = true;
    });
    this.collection.activeErrors = [];
    this.updateStatistics();
    return this;
  }

  // === 設定 ===
  
  withSettings(settings) {
    this.collection.settings = { ...this.collection.settings, ...settings };
    return this;
  }

  // === 統計情報更新 ===
  
  updateStatistics() {
    const allErrors = [...this.collection.activeErrors, ...this.collection.resolvedErrors];
    
    this.collection.statistics = {
      totalErrors: allErrors.length,
      criticalErrors: allErrors.filter(e => e.scope.severity === 'critical').length,
      recoverableErrors: allErrors.filter(e => e.scope.recoverable).length,
      recoveredErrors: allErrors.filter(e => e.recovery.successful).length
    };
    
    return this;
  }

  // === プリセットコレクション ===
  
  asValidationErrors() {
    return this
      .addError(new ApplicationErrorBuilder().asValidationError('text', 'テキストは必須です').build())
      .addError(new ApplicationErrorBuilder().asValidationError('fontSize', 'フォントサイズは10-200の範囲で指定してください').build())
      .addError(new ApplicationErrorBuilder().asValidationError('canvasSize', 'キャンバスサイズは64または128を指定してください').build());
  }

  asSystemErrors() {
    return this
      .addError(new ApplicationErrorBuilder().asNetworkError().build())
      .addError(new ApplicationErrorBuilder().asRenderingError().build())
      .addError(new ApplicationErrorBuilder().asMemoryError().build());
  }

  asMixedErrors() {
    return this
      .addError(new ApplicationErrorBuilder().asValidationError('text', 'テキストエラー').build())
      .addError(new ApplicationErrorBuilder().asNetworkError().build())
      .addError(new ApplicationErrorBuilder().asFileError().build())
      .addError(new ApplicationErrorBuilder().asCanvasRenderingError().build());
  }

  asRecoveryScenario() {
    const networkError = new ApplicationErrorBuilder().asNetworkError().build();
    const recoveredError = new ApplicationErrorBuilder()
      .asNetworkError()
      .asRecoveredError()
      .build();
    
    return this
      .addError(networkError)
      .addError(recoveredError)
      .resolveError(1);
  }

  // === ビルドメソッド ===
  
  build() {
    return { ...this.collection };
  }
}

/**
 * Factory関数
 */
export const createApplicationErrorBuilder = () => new ApplicationErrorBuilder();
export const createErrorCollectionBuilder = () => new ErrorCollectionBuilder();

/**
 * Error State用のプリセット集
 */
export const ErrorStatePresets = {
  // 単一エラー
  validation: () => createApplicationErrorBuilder().asValidationError('text', 'テキストは必須です'),
  network: () => createApplicationErrorBuilder().asNetworkError(),
  rendering: () => createApplicationErrorBuilder().asRenderingError(),
  file: () => createApplicationErrorBuilder().asFileError(),
  memory: () => createApplicationErrorBuilder().asMemoryError(),
  security: () => createApplicationErrorBuilder().asSecurityError(),
  configuration: () => createApplicationErrorBuilder().asConfigurationError(),
  compatibility: () => createApplicationErrorBuilder().asBrowserCompatibilityError('canvas'),
  
  // 複雑なエラー
  javascript: () => createApplicationErrorBuilder().asJavaScriptError(),
  async: () => createApplicationErrorBuilder().asAsyncOperationError(),
  canvas: () => createApplicationErrorBuilder().asCanvasRenderingError(),
  gif: () => createApplicationErrorBuilder().asGifGenerationError(),
  quota: () => createApplicationErrorBuilder().asQuotaExceededError(),
  cascading: () => createApplicationErrorBuilder().asCascadingError(new Error('Original error')),
  recovered: () => createApplicationErrorBuilder().asNetworkError().asRecoveredError(),
  unhandled: () => createApplicationErrorBuilder().asUnhandledError(),
  
  // エラーコレクション
  validationErrors: () => createErrorCollectionBuilder().asValidationErrors(),
  systemErrors: () => createErrorCollectionBuilder().asSystemErrors(),
  mixedErrors: () => createErrorCollectionBuilder().asMixedErrors(),
  recoveryScenario: () => createErrorCollectionBuilder().asRecoveryScenario(),
  
  // テスト用エラーシナリオ
  criticalFailure: () => createErrorCollectionBuilder()
    .addError(createApplicationErrorBuilder().asMemoryError().build())
    .addError(createApplicationErrorBuilder().asSecurityError().build())
    .addError(createApplicationErrorBuilder().asUnhandledError().build()),
    
  userExperienceErrors: () => createErrorCollectionBuilder()
    .addError(createApplicationErrorBuilder().asValidationError('text', 'テキストエラー').build())
    .addError(createApplicationErrorBuilder().asFileError().build())
    .addError(createApplicationErrorBuilder().asRenderingError().build()),
    
  performanceErrors: () => createErrorCollectionBuilder()
    .addError(createApplicationErrorBuilder().asMemoryError().build())
    .addError(createApplicationErrorBuilder().asCanvasRenderingError().build())
    .addError(createApplicationErrorBuilder().asGifGenerationError().build())
};