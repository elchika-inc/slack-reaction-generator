/**
 * Test Scenario Builder
 * 複雑なユーザーシナリオの構築とテストフローの管理
 * 
 * 特徴:
 * - ユーザージャーニー全体をテストデータとして構築
 * - 段階的なユーザー操作の模擬
 * - 異なるユーザータイプに応じたシナリオ生成
 */

import { createSettingsBuilder } from '../builders';
import { createCanvasStateBuilder } from './canvasStateBuilder';
import { createAnimationStateBuilder } from './animationStateBuilder';

/**
 * User Action Step
 * ユーザーのアクション1つを表現
 */
class UserActionStep {
  constructor(type, data = {}) {
    this.type = type;
    this.data = data;
    this.timestamp = Date.now();
    this.duration = 0;
    this.success = true;
    this.error = null;
  }

  withDuration(duration) {
    this.duration = duration;
    return this;
  }

  withError(error) {
    this.success = false;
    this.error = error;
    return this;
  }

  withTimestamp(timestamp) {
    this.timestamp = timestamp;
    return this;
  }
}

/**
 * Test Scenario Builder
 * ユーザーシナリオとテストフローを構築
 */
export class ScenarioBuilder {
  constructor() {
    this.reset();
  }

  reset() {
    this.scenario = {
      // シナリオ基本情報
      name: 'Default Scenario',
      description: '',
      userType: 'regular',
      device: 'desktop',
      browser: 'chrome',
      
      // ユーザープロファイル
      user: {
        experience: 'intermediate', // beginner, intermediate, advanced
        preferences: {
          theme: 'light',
          language: 'ja',
          accessibility: false
        },
        context: {
          hasInternet: true,
          devicePerformance: 'high', // low, medium, high
          screenSize: 'desktop' // mobile, tablet, desktop
        }
      },
      
      // アクションシーケンス
      steps: [],
      currentStep: 0,
      
      // 期待結果
      expectedOutcome: {
        success: true,
        finalSettings: null,
        finalCanvasState: null,
        performanceMetrics: {
          totalTime: 0,
          actionCount: 0,
          errorCount: 0
        }
      },
      
      // テスト環境
      environment: {
        mockData: {},
        networkConditions: 'good', // offline, poor, good, excellent
        featureFlags: {},
        apiResponses: {}
      }
    };
    return this;
  }

  // === 基本情報 ===
  
  withName(name) {
    this.scenario.name = name;
    return this;
  }

  withDescription(description) {
    this.scenario.description = description;
    return this;
  }

  withUserType(userType) {
    this.scenario.userType = userType;
    return this;
  }

  withDevice(device) {
    this.scenario.device = device;
    return this;
  }

  withBrowser(browser) {
    this.scenario.browser = browser;
    return this;
  }

  // === ユーザープロファイル ===
  
  withExperience(experience) {
    this.scenario.user.experience = experience;
    return this;
  }

  withPreferences(preferences) {
    this.scenario.user.preferences = { ...this.scenario.user.preferences, ...preferences };
    return this;
  }

  withContext(context) {
    this.scenario.user.context = { ...this.scenario.user.context, ...context };
    return this;
  }

  asBeginnerUser() {
    return this
      .withExperience('beginner')
      .withPreferences({ theme: 'light' })
      .withContext({ devicePerformance: 'medium' });
  }

  asAdvancedUser() {
    return this
      .withExperience('advanced')
      .withPreferences({ theme: 'dark', accessibility: true })
      .withContext({ devicePerformance: 'high' });
  }

  asMobileUser() {
    return this
      .withDevice('mobile')
      .withContext({ screenSize: 'mobile', devicePerformance: 'medium' });
  }

  asSlowNetworkUser() {
    return this.withEnvironment({ networkConditions: 'poor' });
  }

  // === アクション構築 ===
  
  addStep(actionType, actionData = {}) {
    const step = new UserActionStep(actionType, actionData);
    this.scenario.steps.push(step);
    return this;
  }

  // テキスト入力アクション
  typeText(text, delay = 0) {
    return this.addStep('type_text', { text, delay });
  }

  // 設定変更アクション
  changeSetting(settingPath, value, delay = 0) {
    return this.addStep('change_setting', { settingPath, value, delay });
  }

  // クリックアクション
  click(element, delay = 0) {
    return this.addStep('click', { element, delay });
  }

  // ファイルアップロード
  uploadFile(fileData, delay = 0) {
    return this.addStep('upload_file', { fileData, delay });
  }

  // ダウンロード
  downloadFile(format, delay = 0) {
    return this.addStep('download_file', { format, delay });
  }

  // 待機
  wait(duration) {
    return this.addStep('wait', { duration });
  }

  // プレビュー確認
  checkPreview(expectedContent = null, delay = 0) {
    return this.addStep('check_preview', { expectedContent, delay });
  }

  // エラー発生
  triggerError(errorType, errorMessage) {
    return this.addStep('trigger_error', { errorType, errorMessage });
  }

  // === 期待結果 ===
  
  expectSuccess() {
    this.scenario.expectedOutcome.success = true;
    return this;
  }

  expectFailure() {
    this.scenario.expectedOutcome.success = false;
    return this;
  }

  expectFinalSettings(settings) {
    this.scenario.expectedOutcome.finalSettings = settings;
    return this;
  }

  expectFinalCanvasState(canvasState) {
    this.scenario.expectedOutcome.finalCanvasState = canvasState;
    return this;
  }

  expectPerformance(maxTime, maxErrors = 0) {
    this.scenario.expectedOutcome.performanceMetrics.totalTime = maxTime;
    this.scenario.expectedOutcome.performanceMetrics.errorCount = maxErrors;
    return this;
  }

  // === 環境設定 ===
  
  withEnvironment(envSettings) {
    this.scenario.environment = { ...this.scenario.environment, ...envSettings };
    return this;
  }

  withMockData(mockData) {
    this.scenario.environment.mockData = { ...this.scenario.environment.mockData, ...mockData };
    return this;
  }

  withFeatureFlags(flags) {
    this.scenario.environment.featureFlags = { ...this.scenario.environment.featureFlags, ...flags };
    return this;
  }

  withApiResponses(responses) {
    this.scenario.environment.apiResponses = { ...this.scenario.environment.apiResponses, ...responses };
    return this;
  }

  // === プリセットシナリオ ===
  
  asSimpleTextCreation() {
    return this
      .withName('Simple Text Icon Creation')
      .withDescription('ユーザーが簡単なテキストアイコンを作成')
      .asBeginnerUser()
      .typeText('OK')
      .wait(500)
      .checkPreview()
      .downloadFile('png')
      .expectSuccess()
      .expectFinalSettings(createSettingsBuilder().withSimpleText('OK').build());
  }

  asAnimatedIconCreation() {
    return this
      .withName('Animated Icon Creation')
      .withDescription('アニメーション付きアイコンの作成')
      .asAdvancedUser()
      .typeText('バウンス')
      .changeSetting('animation.animation', 'bounce')
      .changeSetting('animation.animationSpeed', 25)
      .wait(1000)
      .checkPreview()
      .downloadFile('gif')
      .expectSuccess();
  }

  asImageUploadScenario() {
    return this
      .withName('Image Upload Scenario')
      .withDescription('画像をアップロードしてアイコンを作成')
      .asAdvancedUser()
      .uploadFile({ type: 'image/png', size: 2048, name: 'icon.png' })
      .wait(1000)
      .changeSetting('image.imageOpacity', 80)
      .changeSetting('image.imageSize', 60)
      .typeText('IMAGE')
      .checkPreview()
      .downloadFile('png')
      .expectSuccess();
  }

  asErrorRecoveryScenario() {
    return this
      .withName('Error Recovery Scenario')
      .withDescription('エラー発生からの回復')
      .asBeginnerUser()
      .typeText('')  // 空テキストでエラー発生
      .triggerError('validation_error', 'テキストは必須です')
      .wait(2000)
      .typeText('回復')  // エラー回復
      .checkPreview()
      .expectSuccess();
  }

  asPerformanceTestScenario() {
    return this
      .withName('Performance Test Scenario')
      .withDescription('大きなアニメーションのパフォーマンステスト')
      .asAdvancedUser()
      .withContext({ devicePerformance: 'low' })
      .typeText('パフォーマンス')
      .changeSetting('basic.fontSize', 100)
      .changeSetting('animation.animation', 'rainbow')
      .changeSetting('optimization.canvasSize', 128)
      .changeSetting('optimization.gifFrames', 60)
      .wait(3000)
      .downloadFile('gif')
      .expectPerformance(5000, 0);
  }

  asMobileWorkflowScenario() {
    return this
      .withName('Mobile Workflow Scenario')
      .withDescription('モバイルデバイスでの操作フロー')
      .asMobileUser()
      .typeText('モバイル')
      .changeSetting('basic.fontSize', 48)  // モバイル用サイズ
      .changeSetting('optimization.canvasSize', 64)  // 軽量化
      .wait(500)
      .checkPreview()
      .downloadFile('png')
      .expectSuccess();
  }

  asOfflineScenario() {
    return this
      .withName('Offline Usage Scenario')
      .withDescription('オフライン状態での使用')
      .withContext({ hasInternet: false })
      .withEnvironment({ networkConditions: 'offline' })
      .typeText('オフライン')
      .changeSetting('basic.fontColor', '#FF0000')
      .wait(1000)
      .checkPreview()
      .downloadFile('png')  // オンライン機能は使えない
      .expectSuccess();
  }

  asAccessibilityScenario() {
    return this
      .withName('Accessibility Scenario')
      .withDescription('アクセシビリティ機能を使用した操作')
      .withPreferences({ accessibility: true, theme: 'dark' })
      .typeText('アクセシブル')
      .changeSetting('basic.fontColor', '#FFFF00')  // 高コントラスト色
      .changeSetting('basic.backgroundColor', '#000000')
      .wait(1000)
      .checkPreview()
      .downloadFile('png')
      .expectSuccess();
  }

  asComplexWorkflowScenario() {
    return this
      .withName('Complex Workflow Scenario')
      .withDescription('複雑な設定を組み合わせたワークフロー')
      .asAdvancedUser()
      .typeText('複雑')
      .changeSetting('basic.fontSize', 72)
      .changeSetting('basic.fontColor', '#FF0000')
      .changeSetting('basic.textColorType', 'gradient')
      .changeSetting('basic.gradientColor1', '#FF0000')
      .changeSetting('basic.gradientColor2', '#0000FF')
      .changeSetting('basic.backgroundType', 'solid')
      .changeSetting('basic.backgroundColor', '#FFFFFF')
      .changeSetting('animation.animation', 'pulse')
      .changeSetting('animation.animationSpeed', 30)
      .uploadFile({ type: 'image/png', size: 1024, name: 'bg.png' })
      .changeSetting('image.imagePosition', 'back')
      .changeSetting('image.imageOpacity', 50)
      .wait(2000)
      .checkPreview()
      .downloadFile('gif')
      .expectSuccess();
  }

  // === ステップ実行制御 ===
  
  withStepError(stepIndex, error) {
    if (this.scenario.steps[stepIndex]) {
      this.scenario.steps[stepIndex].withError(error);
    }
    return this;
  }

  withStepDuration(stepIndex, duration) {
    if (this.scenario.steps[stepIndex]) {
      this.scenario.steps[stepIndex].withDuration(duration);
    }
    return this;
  }

  // === ビルドメソッド ===
  
  build() {
    // パフォーマンス指標の計算
    this.scenario.expectedOutcome.performanceMetrics.actionCount = this.scenario.steps.length;
    this.scenario.expectedOutcome.performanceMetrics.totalTime = this.scenario.steps
      .reduce((total, step) => total + (step.duration || 100), 0);
    
    // ステップにインデックスを追加
    this.scenario.steps.forEach((step, index) => {
      step.index = index;
    });
    
    return { ...this.scenario };
  }
}

/**
 * Scenario Execution Helper
 * シナリオ実行をサポートするヘルパークラス
 */
export class ScenarioExecutor {
  constructor(scenario) {
    this.scenario = scenario;
    this.currentStepIndex = 0;
    this.executionLog = [];
    this.startTime = Date.now();
  }

  async executeStep(step) {
    const startTime = Date.now();
    let result = { success: true, error: null, data: null };
    
    try {
      switch (step.type) {
        case 'type_text':
          result.data = step.data.text;
          break;
        case 'change_setting':
          result.data = { [step.data.settingPath]: step.data.value };
          break;
        case 'click':
          result.data = step.data.element;
          break;
        case 'upload_file':
          result.data = step.data.fileData;
          break;
        case 'download_file':
          result.data = step.data.format;
          break;
        case 'wait':
          await new Promise(resolve => setTimeout(resolve, step.data.duration));
          break;
        case 'check_preview':
          result.data = step.data.expectedContent;
          break;
        case 'trigger_error':
          throw new Error(step.data.errorMessage);
        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }
      
      if (step.data.delay) {
        await new Promise(resolve => setTimeout(resolve, step.data.delay));
      }
      
    } catch (error) {
      result.success = false;
      result.error = error;
    }
    
    const endTime = Date.now();
    const executionData = {
      stepIndex: this.currentStepIndex,
      step,
      result,
      duration: endTime - startTime,
      timestamp: startTime
    };
    
    this.executionLog.push(executionData);
    this.currentStepIndex++;
    
    return executionData;
  }

  async executeAll() {
    for (const step of this.scenario.steps) {
      await this.executeStep(step);
    }
    
    return {
      success: this.executionLog.every(log => log.result.success),
      totalDuration: Date.now() - this.startTime,
      stepResults: this.executionLog,
      scenario: this.scenario
    };
  }

  getExecutionSummary() {
    return {
      totalSteps: this.scenario.steps.length,
      completedSteps: this.executionLog.length,
      successfulSteps: this.executionLog.filter(log => log.result.success).length,
      failedSteps: this.executionLog.filter(log => !log.result.success).length,
      totalDuration: Date.now() - this.startTime,
      averageStepDuration: this.executionLog.length > 0 
        ? this.executionLog.reduce((sum, log) => sum + log.duration, 0) / this.executionLog.length 
        : 0
    };
  }
}

/**
 * Factory関数
 */
export const createScenarioBuilder = () => new ScenarioBuilder();
export const createScenarioExecutor = (scenario) => new ScenarioExecutor(scenario);

/**
 * Test Scenario用のプリセット集
 */
export const ScenarioPresets = {
  // 基本的なユーザージャーニー
  simpleCreation: () => createScenarioBuilder().asSimpleTextCreation(),
  animatedCreation: () => createScenarioBuilder().asAnimatedIconCreation(),
  imageUpload: () => createScenarioBuilder().asImageUploadScenario(),
  
  // エラーハンドリング
  errorRecovery: () => createScenarioBuilder().asErrorRecoveryScenario(),
  
  // パフォーマンス
  performance: () => createScenarioBuilder().asPerformanceTestScenario(),
  
  // デバイス・環境別
  mobile: () => createScenarioBuilder().asMobileWorkflowScenario(),
  offline: () => createScenarioBuilder().asOfflineScenario(),
  accessibility: () => createScenarioBuilder().asAccessibilityScenario(),
  
  // 複雑なワークフロー
  complex: () => createScenarioBuilder().asComplexWorkflowScenario(),
  
  // 特定のテストケース用
  allUserTypes: () => [
    createScenarioBuilder().asBeginnerUser().asSimpleTextCreation(),
    createScenarioBuilder().asAdvancedUser().asComplexWorkflowScenario(),
    createScenarioBuilder().asMobileUser().asMobileWorkflowScenario()
  ],
  
  regressionTest: () => [
    createScenarioBuilder().asSimpleTextCreation(),
    createScenarioBuilder().asAnimatedIconCreation(),
    createScenarioBuilder().asImageUploadScenario(),
    createScenarioBuilder().asErrorRecoveryScenario()
  ],
  
  stressTest: () => createScenarioBuilder()
    .withName('Stress Test Scenario')
    .withDescription('大量のアクションとデータでのストレステスト')
    .typeText('ストレステスト')
    .changeSetting('basic.fontSize', 120)
    .changeSetting('animation.animation', 'rainbow')
    .uploadFile({ type: 'image/png', size: 10 * 1024 * 1024, name: 'large.png' }) // 10MB
    .changeSetting('optimization.gifFrames', 120)
    .wait(5000)
    .downloadFile('gif')
    .expectPerformance(10000, 2)
};