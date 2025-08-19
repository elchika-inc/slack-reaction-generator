# テスト戦略

## テスト基盤概要

Slack Reaction GeneratorのテストはVitestを使用したモダンなテスト環境で構築されています。

## テスト種類

### 1. ユニットテスト
個別のユーティリティ関数、フック、コンポーネントをテストします。

**対象範囲:**
- `src/utils/` - アニメーション計算、Canvas操作、エラーハンドリング
- `src/types/` - 設定管理、バリデーション
- `src/hooks/` - カスタムフック（設定管理、ファイル生成等）

**カバレッジ目標:** 70%以上

### 2. 統合テスト
複数のコンポーネントが連携した機能をテストします。

**対象範囲:**
- Canvas描画とアニメーション
- 設定変更からプレビュー生成までの流れ
- ファイル生成とダウンロード機能

### 3. E2Eテスト（将来実装）
実際のユーザーワークフローをテストします。

## テスト環境設定

### 設定ファイル
- `vitest.config.js` - Vitestの設定
- `src/test/setup.js` - テスト環境のセットアップ
- `src/test/helpers.js` - テストヘルパー関数

### モック対象
- Canvas API
- File API (FileReader, Blob, etc.)
- Font loading API
- Animation APIs (requestAnimationFrame)
- Network APIs

## テストコマンド

```bash
# 通常のテスト実行
npm test

# ワンショットテスト実行
npm run test:run

# カバレッジレポート付きテスト
npm run test:coverage

# 監視モードでテスト実行
npm run test:watch

# UIモードでテスト実行
npm run test:ui
```

## テストファイル構成

```
src/
├── utils/
│   ├── animationHelpers.js
│   └── __tests__/
│       └── animationHelpers.test.js
├── types/
│   ├── settings.js
│   └── __tests__/
│       └── settings.test.js
├── hooks/
│   ├── useIconSettings.js
│   └── __tests__/
│       └── useIconSettings.test.js
└── test/
    ├── setup.js       # テストセットアップ
    └── helpers.js     # テストヘルパー
```

## カバレッジ目標

### 全体目標: 70%
- **Branches:** 70%
- **Functions:** 70%
- **Lines:** 70%
- **Statements:** 70%

### 優先度別目標

#### High Priority (80%+)
- 設定管理 (`src/types/settings.js`)
- アニメーション計算 (`src/utils/animationHelpers.js`)
- エラーハンドリング (`src/utils/errorHandler.js`)

#### Medium Priority (70%+)
- Canvas操作 (`src/utils/canvasUtils.js`)
- ファイル生成 (`src/hooks/useFileGeneration.js`)
- 状態管理 (`src/hooks/useIconSettings.js`)

#### Low Priority (50%+)
- UI コンポーネント
- 統合機能

## テスト実装ガイドライン

### 1. テストの命名
- ファイル名: `*.test.js`
- テスト名: 日本語で機能を明確に記述

### 2. テスト構造
```javascript
describe('機能名', () => {
  describe('メソッド名', () => {
    it('期待される動作を日本語で記述', () => {
      // Arrange, Act, Assert パターン
    });
  });
});
```

### 3. モック戦略
- 外部依存は積極的にモック
- Canvas API等の重い処理はモック
- 実際の描画結果より計算ロジックを重視

### 4. アサーション
- 数値計算: `toBeCloseTo()` を使用
- オブジェクト比較: `toEqual()` を使用
- 型チェック: `typeof`, `instanceof` を活用

## CI/CD 統合

### GitHub Actions (将来実装)
```yaml
# テストの自動実行
- run: npm test
- run: npm run test:coverage

# カバレッジレポートの生成・アップロード
```

### プルリクエスト要件
- すべてのテストが通過
- カバレッジが70%を下回らない
- 新機能には対応するテストが含まれる

## 継続的改善

### メトリクス監視
- カバレッジの推移
- テスト実行時間
- 失敗率の推移

### 定期的レビュー
- 月1回のテスト戦略見直し
- 四半期ごとの目標設定更新
- 年1回のツールチェーン見直し