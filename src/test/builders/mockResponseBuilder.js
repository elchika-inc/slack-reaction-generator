/**
 * Mock Response Builder
 * API応答、File読み込み、ネットワークリクエストのモック構築
 * 
 * 特徴:
 * - リアルなAPI応答の模擬
 * - エラーシナリオの再現
 * - レスポンス遅延やタイムアウトの制御
 */

/**
 * HTTP Response Builder
 * HTTP応答をモックするためのBuilder
 */
export class HttpResponseBuilder {
  constructor() {
    this.reset();
  }

  reset() {
    this.response = {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Date': new Date().toUTCString()
      },
      body: null,
      delay: 0,
      shouldFail: false,
      networkError: null
    };
    return this;
  }

  // === Status & Headers ===
  
  withStatus(status, statusText = null) {
    this.response.status = status;
    if (statusText) {
      this.response.statusText = statusText;
    } else {
      // よくあるステータスコードのデフォルトテキスト
      const statusTexts = {
        200: 'OK',
        201: 'Created',
        400: 'Bad Request',
        401: 'Unauthorized',
        403: 'Forbidden',
        404: 'Not Found',
        500: 'Internal Server Error',
        502: 'Bad Gateway',
        503: 'Service Unavailable'
      };
      this.response.statusText = statusTexts[status] || 'Unknown';
    }
    return this;
  }

  withHeaders(headers) {
    this.response.headers = { ...this.response.headers, ...headers };
    return this;
  }

  withContentType(contentType) {
    this.response.headers['Content-Type'] = contentType;
    return this;
  }

  // === Body Content ===
  
  withJsonBody(data) {
    this.response.body = JSON.stringify(data);
    this.response.headers['Content-Type'] = 'application/json';
    return this;
  }

  withTextBody(text) {
    this.response.body = text;
    this.response.headers['Content-Type'] = 'text/plain';
    return this;
  }

  withHtmlBody(html) {
    this.response.body = html;
    this.response.headers['Content-Type'] = 'text/html';
    return this;
  }

  withBinaryBody(data) {
    this.response.body = data;
    this.response.headers['Content-Type'] = 'application/octet-stream';
    return this;
  }

  // === Network Behavior ===
  
  withDelay(milliseconds) {
    this.response.delay = milliseconds;
    return this;
  }

  withFailure(networkError = 'Network Error') {
    this.response.shouldFail = true;
    this.response.networkError = networkError;
    return this;
  }

  // === Preset Responses ===
  
  asSuccess(data = { success: true }) {
    return this
      .withStatus(200)
      .withJsonBody(data);
  }

  asCreated(data = { id: 'created-123', success: true }) {
    return this
      .withStatus(201)
      .withJsonBody(data);
  }

  asBadRequest(message = 'Invalid request') {
    return this
      .withStatus(400)
      .withJsonBody({ error: message, code: 'BAD_REQUEST' });
  }

  asUnauthorized(message = 'Authentication required') {
    return this
      .withStatus(401)
      .withJsonBody({ error: message, code: 'UNAUTHORIZED' });
  }

  asNotFound(message = 'Resource not found') {
    return this
      .withStatus(404)
      .withJsonBody({ error: message, code: 'NOT_FOUND' });
  }

  asServerError(message = 'Internal server error') {
    return this
      .withStatus(500)
      .withJsonBody({ error: message, code: 'INTERNAL_ERROR' });
  }

  asTimeout() {
    return this
      .withDelay(30000)
      .withFailure('Request timeout');
  }

  asNetworkError() {
    return this.withFailure('Network connection failed');
  }

  asSlowResponse(data = { success: true }) {
    return this
      .asSuccess(data)
      .withDelay(3000);
  }

  // === ビルドメソッド ===
  
  build() {
    return { ...this.response };
  }
}

/**
 * File Response Builder
 * ファイル読み込み・アップロードのモック応答
 */
export class FileResponseBuilder {
  constructor() {
    this.reset();
  }

  reset() {
    this.fileResponse = {
      // ファイル情報
      file: {
        name: 'test.png',
        size: 1024,
        type: 'image/png',
        lastModified: Date.now()
      },
      
      // ファイル内容
      content: null,
      arrayBuffer: null,
      dataUrl: null,
      
      // 読み込み状態
      loading: {
        progress: 100,
        loaded: 1024,
        total: 1024,
        isComplete: true
      },
      
      // エラー情報
      error: null,
      shouldFail: false,
      
      // レスポンス制御
      delay: 0
    };
    return this;
  }

  // === ファイル情報 ===
  
  withName(name) {
    this.fileResponse.file.name = name;
    // 拡張子からMIMEタイプを推測
    const ext = name.split('.').pop().toLowerCase();
    const mimeTypes = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'webp': 'image/webp',
      'txt': 'text/plain',
      'json': 'application/json'
    };
    if (mimeTypes[ext]) {
      this.fileResponse.file.type = mimeTypes[ext];
    }
    return this;
  }

  withSize(size) {
    this.fileResponse.file.size = size;
    this.fileResponse.loading.loaded = size;
    this.fileResponse.loading.total = size;
    return this;
  }

  withType(type) {
    this.fileResponse.file.type = type;
    return this;
  }

  withLastModified(timestamp) {
    this.fileResponse.file.lastModified = timestamp;
    return this;
  }

  // === ファイル内容 ===
  
  withContent(content) {
    this.fileResponse.content = content;
    return this;
  }

  withArrayBuffer(buffer) {
    this.fileResponse.arrayBuffer = buffer;
    return this;
  }

  withDataUrl(dataUrl) {
    this.fileResponse.dataUrl = dataUrl;
    return this;
  }

  withBase64Content(base64Data) {
    const mimeType = this.fileResponse.file.type;
    this.fileResponse.dataUrl = `data:${mimeType};base64,${base64Data}`;
    return this;
  }

  // === 読み込み状態 ===
  
  withProgress(progress, loaded = null, total = null) {
    this.fileResponse.loading.progress = progress;
    if (loaded !== null) this.fileResponse.loading.loaded = loaded;
    if (total !== null) this.fileResponse.loading.total = total;
    this.fileResponse.loading.isComplete = progress >= 100;
    return this;
  }

  asLoading(progress = 50) {
    return this.withProgress(progress).withDelay(1000);
  }

  asComplete() {
    return this.withProgress(100);
  }

  // === エラー制御 ===
  
  withError(error) {
    this.fileResponse.shouldFail = true;
    this.fileResponse.error = error;
    return this;
  }

  withDelay(milliseconds) {
    this.fileResponse.delay = milliseconds;
    return this;
  }

  // === プリセットファイル ===
  
  asImageFile(name = 'test.png') {
    const imageData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    return this
      .withName(name)
      .withType('image/png')
      .withSize(69)
      .withBase64Content(imageData)
      .asComplete();
  }

  asLargeImageFile(name = 'large.png') {
    return this
      .asImageFile(name)
      .withSize(5 * 1024 * 1024); // 5MB
  }

  asGifFile(name = 'animated.gif') {
    return this
      .withName(name)
      .withType('image/gif')
      .withSize(2048)
      .withBase64Content('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7')
      .asComplete();
  }

  asInvalidFile(name = 'invalid.txt') {
    return this
      .withName(name)
      .withType('text/plain')
      .withSize(10)
      .withError(new Error('Unsupported file type'));
  }

  asCorruptedFile(name = 'corrupted.png') {
    return this
      .withName(name)
      .withType('image/png')
      .withSize(1024)
      .withBase64Content('invalid-base64-data')
      .withError(new Error('File is corrupted'));
  }

  asSlowLoadingFile(name = 'slow.png') {
    return this
      .asImageFile(name)
      .withDelay(5000)
      .asLoading(25);
  }

  // === ビルドメソッド ===
  
  build() {
    return { ...this.fileResponse };
  }
}

/**
 * API Response Builder
 * 特定のAPI エンドポイントに対する応答
 */
export class ApiResponseBuilder {
  constructor() {
    this.reset();
  }

  reset() {
    this.apiResponse = {
      endpoint: '',
      method: 'GET',
      requestData: null,
      response: null,
      timing: {
        requestTime: Date.now(),
        responseTime: Date.now() + 100,
        duration: 100
      },
      metadata: {
        requestId: 'req-' + Math.random().toString(36).substr(2, 9),
        version: 'v1',
        rateLimit: {
          remaining: 100,
          reset: Date.now() + 3600000
        }
      }
    };
    return this;
  }

  // === エンドポイント設定 ===
  
  forEndpoint(endpoint, method = 'GET') {
    this.apiResponse.endpoint = endpoint;
    this.apiResponse.method = method;
    return this;
  }

  withRequestData(data) {
    this.apiResponse.requestData = data;
    return this;
  }

  // === 応答設定 ===
  
  withResponse(httpResponse) {
    this.apiResponse.response = httpResponse;
    return this;
  }

  withSuccessResponse(data) {
    this.apiResponse.response = new HttpResponseBuilder()
      .asSuccess(data)
      .build();
    return this;
  }

  withErrorResponse(status, message) {
    const builder = new HttpResponseBuilder();
    switch (status) {
      case 400: builder.asBadRequest(message); break;
      case 401: builder.asUnauthorized(message); break;
      case 404: builder.asNotFound(message); break;
      case 500: builder.asServerError(message); break;
      default: builder.withStatus(status).withJsonBody({ error: message });
    }
    this.apiResponse.response = builder.build();
    return this;
  }

  // === タイミング設定 ===
  
  withTiming(duration) {
    const now = Date.now();
    this.apiResponse.timing = {
      requestTime: now,
      responseTime: now + duration,
      duration
    };
    return this;
  }

  // === メタデータ ===
  
  withMetadata(metadata) {
    this.apiResponse.metadata = { ...this.apiResponse.metadata, ...metadata };
    return this;
  }

  withRateLimit(remaining, reset = Date.now() + 3600000) {
    this.apiResponse.metadata.rateLimit = { remaining, reset };
    return this;
  }

  // === 特定APIのプリセット ===
  
  asAuthApiSuccess(token = 'mock-token-123') {
    return this
      .forEndpoint('/api/auth', 'POST')
      .withSuccessResponse({
        token,
        user: { id: 'user-123', name: 'Test User' },
        expiresIn: 3600
      })
      .withTiming(200);
  }

  asImageUploadApiSuccess(imageId = 'img-123') {
    return this
      .forEndpoint('/api/upload', 'POST')
      .withSuccessResponse({
        id: imageId,
        url: `https://example.com/images/${imageId}`,
        size: 1024,
        type: 'image/png'
      })
      .withTiming(1500);
  }

  asImageProcessingApiSuccess(processedImageUrl = 'https://example.com/processed/img-123') {
    return this
      .forEndpoint('/api/process', 'POST')
      .withSuccessResponse({
        status: 'completed',
        result: {
          url: processedImageUrl,
          format: 'png',
          size: { width: 128, height: 128 }
        }
      })
      .withTiming(3000);
  }

  asConfigApiSuccess(config = { theme: 'light', version: '1.0.0' }) {
    return this
      .forEndpoint('/api/config', 'GET')
      .withSuccessResponse(config)
      .withTiming(100);
  }

  asRateLimitedApi() {
    return this
      .forEndpoint('/api/limited', 'POST')
      .withErrorResponse(429, 'Rate limit exceeded')
      .withRateLimit(0, Date.now() + 3600000)
      .withTiming(50);
  }

  asMaintenanceApi() {
    return this
      .forEndpoint('/api/service', 'GET')
      .withErrorResponse(503, 'Service temporarily unavailable')
      .withTiming(100);
  }

  // === ビルドメソッド ===
  
  build() {
    return { ...this.apiResponse };
  }
}

/**
 * Mock Environment Builder
 * テスト環境全体のモック設定
 */
export class MockEnvironmentBuilder {
  constructor() {
    this.reset();
  }

  reset() {
    this.environment = {
      // ネットワーク設定
      network: {
        online: true,
        speed: 'fast', // slow, medium, fast
        reliability: 'high' // low, medium, high
      },
      
      // API応答設定
      apis: new Map(),
      
      // ファイルシステム設定
      fileSystem: {
        available: true,
        quota: 1024 * 1024 * 100, // 100MB
        used: 0
      },
      
      // ブラウザ機能
      browser: {
        canvas: true,
        webgl: true,
        localStorage: true,
        fileApi: true,
        downloadApi: true
      },
      
      // パフォーマンス設定
      performance: {
        cpu: 'high', // low, medium, high
        memory: 'high', // low, medium, high
        renderingDelay: 0
      },
      
      // タイムゾーン・言語設定
      locale: {
        timezone: 'Asia/Tokyo',
        language: 'ja',
        dateFormat: 'YYYY-MM-DD'
      }
    };
    return this;
  }

  // === ネットワーク設定 ===
  
  withNetwork(online, speed = 'fast', reliability = 'high') {
    this.environment.network = { online, speed, reliability };
    return this;
  }

  asOffline() {
    return this.withNetwork(false, 'fast', 'high');
  }

  asSlowNetwork() {
    return this.withNetwork(true, 'slow', 'medium');
  }

  asUnreliableNetwork() {
    return this.withNetwork(true, 'medium', 'low');
  }

  // === API設定 ===
  
  withApi(pattern, response) {
    this.environment.apis.set(pattern, response);
    return this;
  }

  withSuccessfulApis() {
    return this
      .withApi('/api/auth', new ApiResponseBuilder().asAuthApiSuccess().build())
      .withApi('/api/upload', new ApiResponseBuilder().asImageUploadApiSuccess().build())
      .withApi('/api/config', new ApiResponseBuilder().asConfigApiSuccess().build());
  }

  withFailingApis() {
    return this
      .withApi('/api/auth', new ApiResponseBuilder().asAuthApiSuccess().withErrorResponse(500, 'Auth service down').build())
      .withApi('/api/upload', new ApiResponseBuilder().asImageUploadApiSuccess().withErrorResponse(503, 'Upload service unavailable').build());
  }

  // === ファイルシステム設定 ===
  
  withFileSystem(available, quota = 1024 * 1024 * 100, used = 0) {
    this.environment.fileSystem = { available, quota, used };
    return this;
  }

  asLowStorage() {
    return this.withFileSystem(true, 1024 * 1024 * 10, 1024 * 1024 * 9); // 90% used
  }

  asFullStorage() {
    return this.withFileSystem(true, 1024 * 1024 * 10, 1024 * 1024 * 10); // 100% used
  }

  // === ブラウザ機能設定 ===
  
  withBrowser(features) {
    this.environment.browser = { ...this.environment.browser, ...features };
    return this;
  }

  asLegacyBrowser() {
    return this.withBrowser({
      canvas: true,
      webgl: false,
      localStorage: true,
      fileApi: false,
      downloadApi: false
    });
  }

  asModernBrowser() {
    return this.withBrowser({
      canvas: true,
      webgl: true,
      localStorage: true,
      fileApi: true,
      downloadApi: true
    });
  }

  // === パフォーマンス設定 ===
  
  withPerformance(cpu, memory, renderingDelay = 0) {
    this.environment.performance = { cpu, memory, renderingDelay };
    return this;
  }

  asLowEndDevice() {
    return this.withPerformance('low', 'low', 100);
  }

  asHighEndDevice() {
    return this.withPerformance('high', 'high', 0);
  }

  // === ロケール設定 ===
  
  withLocale(timezone, language, dateFormat) {
    this.environment.locale = { timezone, language, dateFormat };
    return this;
  }

  asEnglishLocale() {
    return this.withLocale('America/New_York', 'en', 'MM/DD/YYYY');
  }

  // === プリセット環境 ===
  
  asDevelopmentEnvironment() {
    return this
      .withNetwork(true, 'fast', 'high')
      .withSuccessfulApis()
      .asHighEndDevice()
      .asModernBrowser();
  }

  asProductionEnvironment() {
    return this
      .withNetwork(true, 'medium', 'high')
      .withSuccessfulApis()
      .withPerformance('medium', 'medium', 10)
      .asModernBrowser();
  }

  asTestingEnvironment() {
    return this
      .asSlowNetwork()
      .withFailingApis()
      .asLowEndDevice()
      .asLegacyBrowser();
  }

  // === ビルドメソッド ===
  
  build() {
    return {
      ...this.environment,
      apis: Object.fromEntries(this.environment.apis)
    };
  }
}

/**
 * Factory関数
 */
export const createHttpResponseBuilder = () => new HttpResponseBuilder();
export const createFileResponseBuilder = () => new FileResponseBuilder();
export const createApiResponseBuilder = () => new ApiResponseBuilder();
export const createMockEnvironmentBuilder = () => new MockEnvironmentBuilder();

/**
 * Mock Response用のプリセット集
 */
export const MockResponsePresets = {
  // HTTP応答
  http: {
    success: () => createHttpResponseBuilder().asSuccess(),
    error: () => createHttpResponseBuilder().asServerError(),
    timeout: () => createHttpResponseBuilder().asTimeout(),
    slow: () => createHttpResponseBuilder().asSlowResponse()
  },
  
  // ファイル応答
  file: {
    image: () => createFileResponseBuilder().asImageFile(),
    largeImage: () => createFileResponseBuilder().asLargeImageFile(),
    gif: () => createFileResponseBuilder().asGifFile(),
    invalid: () => createFileResponseBuilder().asInvalidFile(),
    corrupted: () => createFileResponseBuilder().asCorruptedFile(),
    slow: () => createFileResponseBuilder().asSlowLoadingFile()
  },
  
  // API応答
  api: {
    auth: () => createApiResponseBuilder().asAuthApiSuccess(),
    upload: () => createApiResponseBuilder().asImageUploadApiSuccess(),
    processing: () => createApiResponseBuilder().asImageProcessingApiSuccess(),
    config: () => createApiResponseBuilder().asConfigApiSuccess(),
    rateLimited: () => createApiResponseBuilder().asRateLimitedApi(),
    maintenance: () => createApiResponseBuilder().asMaintenanceApi()
  },
  
  // 環境設定
  environment: {
    development: () => createMockEnvironmentBuilder().asDevelopmentEnvironment(),
    production: () => createMockEnvironmentBuilder().asProductionEnvironment(),
    testing: () => createMockEnvironmentBuilder().asTestingEnvironment(),
    offline: () => createMockEnvironmentBuilder().asOffline(),
    lowEnd: () => createMockEnvironmentBuilder().asLowEndDevice(),
    legacy: () => createMockEnvironmentBuilder().asLegacyBrowser()
  }
};