/**
 * Test Builder Pattern - 統合インデックス
 * 拡張されたTest Builder Patternの全てのBuilderをエクスポート
 * 
 * 利用方法:
 * import { 
 *   createCanvasStateBuilder, 
 *   createScenarioBuilder,
 *   MockResponsePresets 
 * } from './test/builders';
 */

// Canvas State Builder
import {
  CanvasStateBuilder,
  createCanvasStateBuilder,
  CanvasStatePresets
} from './canvasStateBuilder.js';

export {
  CanvasStateBuilder,
  createCanvasStateBuilder,
  CanvasStatePresets
};

// Animation State Builder
import {
  AnimationStateBuilder,
  createAnimationStateBuilder,
  AnimationStatePresets
} from './animationStateBuilder.js';

export {
  AnimationStateBuilder,
  createAnimationStateBuilder,
  AnimationStatePresets
};

// Test Scenario Builder
import {
  ScenarioBuilder,
  ScenarioExecutor,
  createScenarioBuilder,
  createScenarioExecutor,
  ScenarioPresets
} from './scenarioBuilder.js';

export {
  ScenarioBuilder,
  ScenarioExecutor,
  createScenarioBuilder,
  createScenarioExecutor,
  ScenarioPresets
};

// Mock Response Builder
import {
  HttpResponseBuilder,
  FileResponseBuilder as FileResponseBuilderImport,
  ApiResponseBuilder,
  MockEnvironmentBuilder,
  createHttpResponseBuilder,
  createFileResponseBuilder,
  createApiResponseBuilder,
  createMockEnvironmentBuilder,
  MockResponsePresets
} from './mockResponseBuilder.js';

export {
  HttpResponseBuilder,
  FileResponseBuilderImport as FileResponseBuilder,
  ApiResponseBuilder,
  MockEnvironmentBuilder,
  createHttpResponseBuilder,
  createFileResponseBuilder,
  createApiResponseBuilder,
  createMockEnvironmentBuilder,
  MockResponsePresets
};

// Error State Builder
import {
  ApplicationErrorBuilder,
  ErrorCollectionBuilder,
  createApplicationErrorBuilder,
  createErrorCollectionBuilder,
  ErrorStatePresets
} from './errorStateBuilder.js';

export {
  ApplicationErrorBuilder,
  ErrorCollectionBuilder,
  createApplicationErrorBuilder,
  createErrorCollectionBuilder,
  ErrorStatePresets
};

// 既存のBuilders（後方互換性のため）
import {
  SettingsBuilder,
  CanvasBuilder,
  FileBuilder,
  AnimationBuilder,
  EventBuilder,
  createSettingsBuilder,
  createCanvasBuilder,
  createFileBuilder,
  createAnimationBuilder,
  createEventBuilder,
  TestPresets
} from '../builders.js';

export {
  SettingsBuilder,
  CanvasBuilder,
  FileBuilder,
  AnimationBuilder,
  EventBuilder,
  createSettingsBuilder,
  createCanvasBuilder,
  createFileBuilder,
  createAnimationBuilder,
  createEventBuilder,
  TestPresets
};

/**
 * 統合されたBuilder Factory
 * 全てのBuilderを一箇所から作成可能
 */
export const BuilderFactory = {
  // Settings関連
  settings: () => createSettingsBuilder(),
  
  // Canvas関連
  canvas: () => createCanvasBuilder(),
  canvasState: () => createCanvasStateBuilder(),
  
  // Animation関連
  animation: () => createAnimationBuilder(),
  animationState: () => createAnimationStateBuilder(),
  
  // File関連
  file: () => createFileBuilder(),
  fileResponse: () => createFileResponseBuilder(),
  
  // Event関連
  event: () => createEventBuilder(),
  
  // Scenario関連
  scenario: () => createScenarioBuilder(),
  scenarioExecutor: (scenario) => createScenarioExecutor(scenario),
  
  // Mock関連
  httpResponse: () => createHttpResponseBuilder(),
  apiResponse: () => createApiResponseBuilder(),
  mockEnvironment: () => createMockEnvironmentBuilder(),
  
  // Error関連
  error: () => createApplicationErrorBuilder(),
  errorCollection: () => createErrorCollectionBuilder()
};

/**
 * 統合されたPresets
 * 全てのプリセットを一箇所から利用可能
 */
export const AllPresets = {
  // 基本Builders
  test: TestPresets,
  
  // 拡張Builders
  canvasState: CanvasStatePresets,
  animationState: AnimationStatePresets,
  scenario: ScenarioPresets,
  mockResponse: MockResponsePresets,
  errorState: ErrorStatePresets,
  
  // よく使う組み合わせ
  common: {
    // 基本的なテストセットアップ
    basicTest: () => ({
      settings: TestPresets.simpleTextIcon().build(),
      canvas: CanvasStatePresets.standard().build(),
      animation: AnimationStatePresets.bounce().build()
    }),
    
    // エラーテストセットアップ
    errorTest: () => ({
      settings: TestPresets.invalidIcon().build(),
      error: ErrorStatePresets.validation().build(),
      scenario: ScenarioPresets.errorRecovery().build()
    }),
    
    // パフォーマンステストセットアップ
    performanceTest: () => ({
      settings: TestPresets.largeIcon().build(),
      canvas: CanvasStatePresets.large().build(),
      animation: AnimationStatePresets.highPerformance().build(),
      scenario: ScenarioPresets.performance().build()
    }),
    
    // モバイルテストセットアップ
    mobileTest: () => ({
      settings: TestPresets.mobileIcon().build(),
      canvas: CanvasStatePresets.small().build(),
      scenario: ScenarioPresets.mobile().build(),
      environment: MockResponsePresets.environment.testing().build()
    }),
    
    // 統合テストセットアップ
    integrationTest: () => ({
      scenario: ScenarioPresets.complex().build(),
      environment: MockResponsePresets.environment.production().build(),
      mockApis: {
        upload: MockResponsePresets.api.upload().build(),
        processing: MockResponsePresets.api.processing().build()
      }
    })
  }
};

/**
 * Test Builder Pattern ユーティリティ
 */
export class TestBuilderUtils {
  /**
   * 複数のBuilderを連鎖的に実行
   */
  static chain(...builders) {
    return builders.reduce((result, builder) => {
      if (typeof builder === 'function') {
        const built = builder().build();
        return { ...result, ...built };
      }
      return { ...result, ...builder };
    }, {});
  }
  
  /**
   * Builderの結果をマージ
   */
  static merge(...buildResults) {
    return Object.assign({}, ...buildResults);
  }
  
  /**
   * 条件に基づいてBuilderを適用
   */
  static conditional(condition, trueBuilder, falseBuilder = null) {
    if (condition) {
      return trueBuilder;
    }
    return falseBuilder || (() => ({}));
  }
  
  /**
   * Builderのバリデーション
   */
  static validate(builderResult, schema) {
    // 簡単なバリデーション実装
    const requiredFields = schema.required || [];
    const errors = [];
    
    for (const field of requiredFields) {
      if (!(field in builderResult)) {
        errors.push(`Required field '${field}' is missing`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * デバッグ用のBuilder状態出力
   */
  static debug(builderResult, label = 'Builder Result') {
    /* eslint-disable no-console */
    console.group(`🔧 ${label}`);
    console.log('Builder Result:', builderResult);
    console.log('Keys:', Object.keys(builderResult));
    console.log('Size:', JSON.stringify(builderResult).length, 'bytes');
    console.groupEnd();
    /* eslint-enable no-console */
    return builderResult;
  }
}

/**
 * デフォルトエクスポート：よく使うBuilderのコレクション
 */
export default {
  Factory: BuilderFactory,
  Presets: AllPresets,
  Utils: TestBuilderUtils,
  
  // よく使うBuilderのショートカット
  settings: () => createSettingsBuilder(),
  canvas: () => createCanvasStateBuilder(),
  animation: () => createAnimationStateBuilder(),
  scenario: () => createScenarioBuilder(),
  error: () => createApplicationErrorBuilder()
};