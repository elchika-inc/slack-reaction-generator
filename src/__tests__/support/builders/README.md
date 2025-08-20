# Test Builder Pattern 拡張実装

このディレクトリには、Slack Reaction Generatorプロジェクト用の拡張されたTest Builder Patternの実装が含まれています。

## 概要

Test Builder Patternは、複雑なテストデータを読みやすく、保守しやすい形で構築するためのデザインパターンです。この実装では、基本的なBuilder Patternを拡張し、以下の特徴を持つ包括的なテスト支援システムを提供します。

### 主要特徴

1. **デフォルト値戦略**: 有効なデフォルト値により簡潔な記述を実現
2. **流暢なインターフェース**: メソッドチェーンによる直感的なAPI
3. **テストケース固有の調整**: 特定のシナリオに対応したカスタマイズ
4. **段階的構築**: 複雑な状態を段階的に構築
5. **プリセット機能**: よく使うパターンの事前定義

## アーキテクチャ

```
src/test/builders/
├── index.js                    # 統合エクスポート
├── canvasStateBuilder.js       # キャンバス状態Builder
├── animationStateBuilder.js    # アニメーション状態Builder
├── scenarioBuilder.js          # テストシナリオBuilder
├── mockResponseBuilder.js      # モックレスポンスBuilder
├── errorStateBuilder.js        # エラー状態Builder
├── examples/
│   └── testBuilderExamples.js  # 使用例集
└── README.md                   # このファイル
```

## 各Builderの説明

### 1. Canvas State Builder (`canvasStateBuilder.js`)

キャンバスの複雑な状態（描画状態、変換状態、スタイル状態）を構築します。

```javascript
const canvasState = createCanvasStateBuilder()
  .asStandardCanvas()
  .withFillStyle('#FF0000')
  .withFont('24px Arial')
  .withShadow('#00000080', 4, 2, 2)
  .build();
```

**主要機能:**
- 基本設定（サイズ、DPI）
- モックContext生成
- 描画状態管理
- 変換マトリクス状態
- スタイル設定
- エラー状態
- パフォーマンス情報

### 2. Animation State Builder (`animationStateBuilder.js`)

アニメーションの進行状況、フレーム状態、タイミング制御を構築します。

```javascript
const animationState = createAnimationStateBuilder()
  .asBounceAnimation()
  .asRunning()
  .atProgress(0.3)
  .withActualFrameRate(29)
  .build();
```

**主要機能:**
- アニメーションタイプ設定
- 進行状態管理
- タイミング制御
- キーフレーム定義
- パフォーマンス監視
- 状態遷移管理

### 3. Test Scenario Builder (`scenarioBuilder.js`)

複雑なユーザージャーニーとテストフローを構築します。

```javascript
const scenario = createScenarioBuilder()
  .withName('初心者ユーザーのアイコン作成')
  .asBeginnerUser()
  .typeText('OK')
  .wait(500)
  .checkPreview()
  .downloadFile('png')
  .expectSuccess()
  .build();
```

**主要機能:**
- ユーザープロファイル設定
- アクションシーケンス定義
- 期待結果設定
- 環境条件設定
- シナリオ実行機能

### 4. Mock Response Builder (`mockResponseBuilder.js`)

API応答、ファイル操作、ネットワーク状況のモックを構築します。

```javascript
const apiResponse = createApiResponseBuilder()
  .asImageUploadApiSuccess()
  .withTiming(1500)
  .build();
```

**主要機能:**
- HTTP応答モック
- ファイル応答モック
- API応答モック
- 環境全体モック
- ネットワーク状況シミュレーション

### 5. Error State Builder (`errorStateBuilder.js`)

多様なエラー状態とエラーシナリオを構築します。

```javascript
const errorState = createApplicationErrorBuilder()
  .asValidationError('text', 'テキストは必須です')
  .withUserContext('user-123', 'session-456')
  .withRecoveryAttempt(true, 2)
  .build();
```

**主要機能:**
- エラータイプ分類
- エラー詳細情報
- 回復状態管理
- エラーコレクション
- デバッグ情報付与

## 使用方法

### 基本的な使用法

```javascript
import { BuilderFactory, AllPresets } from './test/builders';

// 基本的なBuilder作成
const settings = BuilderFactory.settings()
  .withText('テスト')
  .withFontSize(48)
  .build();

// プリセット使用
const bounceAnimation = AllPresets.animationState.bounce().build();

// 複数Builder組み合わせ
const testData = AllPresets.common.basicTest();
```

### 高度な使用法

```javascript
import { TestBuilderUtils, createScenarioBuilder } from './test/builders';

// Builderの連鎖実行
const result = TestBuilderUtils.chain(
  () => BuilderFactory.settings().withText('チェーン'),
  () => BuilderFactory.canvas().asStandardCanvas(),
  () => BuilderFactory.animation().asBounceAnimation()
);

// 条件付きBuilder適用
const builderFunc = TestBuilderUtils.conditional(
  isMobile,
  () => BuilderFactory.settings().withCanvasSize(64),
  () => BuilderFactory.settings().withCanvasSize(128)
);

// デバッグ出力
const debugResult = TestBuilderUtils.debug(result, 'Test Data');
```

## プリセットパターン

### よく使うプリセット

```javascript
// 基本的なテストセットアップ
const basicTest = AllPresets.common.basicTest();

// エラーテストセットアップ
const errorTest = AllPresets.common.errorTest();

// パフォーマンステストセットアップ
const performanceTest = AllPresets.common.performanceTest();

// モバイルテストセットアップ
const mobileTest = AllPresets.common.mobileTest();
```

### カスタムプリセットの作成

```javascript
export const CustomPresets = {
  mySpecialTest: () => createScenarioBuilder()
    .withName('特別なテスト')
    .asAdvancedUser()
    .typeText('カスタム')
    .expectSuccess(),
    
  errorProneScenario: () => createScenarioBuilder()
    .withName('エラー多発シナリオ')
    .withEnvironment({ networkConditions: 'poor' })
    .asBeginnerUser()
    .typeText('エラーテスト')
};
```

## テスト例

### 単体テスト

```javascript
import { describe, it, expect } from 'vitest';
import { createCanvasStateBuilder } from './test/builders';

describe('Canvas Rendering', () => {
  it('標準キャンバスで正常にレンダリングできる', () => {
    const canvas = createCanvasStateBuilder()
      .asStandardCanvas()
      .build();
    
    expect(canvas.width).toBe(128);
    expect(canvas.context).toBeDefined();
  });
});
```

### 統合テスト

```javascript
describe('完全なワークフロー', () => {
  it('画像アップロードから書き出しまで', async () => {
    const scenario = createScenarioBuilder()
      .asAdvancedUser()
      .uploadFile(AllPresets.mockResponse.file.image().build())
      .typeText('統合テスト')
      .downloadFile('png')
      .expectSuccess()
      .build();
    
    const executor = createScenarioExecutor(scenario);
    const result = await executor.executeAll();
    
    expect(result.success).toBe(true);
  });
});
```

## ベストプラクティス

### 1. 明確な命名

```javascript
// Good: 意図が明確
const userRegistrationScenario = createScenarioBuilder()
  .asBeginnerUser()
  .typeText('新規ユーザー');

// Bad: 意図が不明確
const scenario1 = createScenarioBuilder()
  .typeText('テスト');
```

### 2. プリセットの活用

```javascript
// Good: プリセット使用
const errorState = AllPresets.errorState.validation().build();

// Acceptable: カスタム構築（特別な要件がある場合）
const customError = createApplicationErrorBuilder()
  .asValidationError('custom_field', 'カスタムエラー')
  .build();
```

### 3. テストの意図を表現

```javascript
// Good: テストの意図が明確
const slowNetworkUser = createScenarioBuilder()
  .asSlowNetworkUser()
  .expectPerformance(5000); // 5秒以内

// Bad: 実装詳細に依存
const scenario = createScenarioBuilder()
  .withEnvironment({ networkSpeed: 'slow' });
```

### 4. エラー状態の適切な構築

```javascript
// Good: 回復可能な状態も含む
const networkError = createApplicationErrorBuilder()
  .asNetworkError()
  .withRecoveryAttempt(true, 2)
  .withFallback()
  .build();

// Bad: エラー情報だけ
const error = new Error('Network failed');
```

## 拡張性

### 新しいBuilderの追加

```javascript
export class CustomStateBuilder {
  constructor() {
    this.reset();
  }
  
  reset() {
    this.customState = {
      // カスタム状態の定義
    };
    return this;
  }
  
  withCustomProperty(value) {
    this.customState.customProperty = value;
    return this;
  }
  
  build() {
    return { ...this.customState };
  }
}
```

### プリセットの追加

```javascript
export const CustomPresets = {
  myPattern: () => createCustomStateBuilder()
    .withCustomProperty('value')
    .build()
};
```

## パフォーマンス考慮事項

1. **メモリ効率**: 大量のオブジェクト作成を避けるため、必要な時のみ`build()`を実行
2. **再利用性**: Builderインスタンスは`reset()`で再利用可能
3. **遅延評価**: プリセットは関数として定義し、必要時に実行

## トラブルシューティング

### よくある問題

1. **ビルド忘れ**: `build()`メソッドの呼び忘れ
2. **状態の混在**: 複数のBuilderで同じインスタンスを使用
3. **プリセット適用順序**: プリセット適用後の上書き

### デバッグ方法

```javascript
// Builder状態の確認
const result = TestBuilderUtils.debug(builder.build(), 'Debug Info');

// バリデーション
const validation = TestBuilderUtils.validate(result, schema);
console.log('Validation:', validation);
```

## 今後の拡張予定

1. **TypeScript対応**: 型安全性の向上
2. **スキーマ検証**: より厳密なバリデーション
3. **テンプレート機能**: 設定テンプレートの保存・読み込み
4. **パフォーマンス分析**: Builder使用状況の分析機能
5. **自動生成**: コンポーネントからのBuilder自動生成

## 関連資料

- [Test Builder Pattern の理論](https://martinfowler.com/bliki/ObjectMother.html)
- [Fluent Interface デザイン](https://en.wikipedia.org/wiki/Fluent_interface)
- [テストデータ管理ベストプラクティス](https://testingjavascript.com/courses/testing-fundamentals)