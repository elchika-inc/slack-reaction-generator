# TypeScript化移行計画

## 移行戦略

段階的にJavaScriptファイルをTypeScriptに移行し、型安全性を向上させます。

## Phase 1: 基盤整備（完了済み）

- ✅ `tsconfig.json` 作成
- ✅ 型定義ファイル (`src/types/index.d.ts`) 作成
- ✅ 既存JSファイルとの共存設定

## Phase 2: ユーティリティ層の移行（推奨順序）

1. **`src/types/settings.js` → `settings.ts`**
   - 設定関連の型定義とロジック
   - 他のファイルへの影響が少ない

2. **`src/utils/errorHandler.js` → `errorHandler.ts`**
   - エラー処理の型安全化
   - アプリ全体で使用される基盤機能

3. **`src/utils/animationHelpers.js` → `animationHelpers.ts`**
   - アニメーション計算の型安全化

4. **`src/utils/renderingEngine.js` → `renderingEngine.ts`**
   - レンダリングエンジンの型安全化

## Phase 3: フック層の移行

1. **`src/hooks/useAppState.js` → `useAppState.ts`**
2. **`src/hooks/useIconSettings.js` → `useIconSettings.ts`**
3. **`src/hooks/useFileGeneration.js` → `useFileGeneration.ts`**
4. **`src/hooks/useCanvasPreview.js` → `useCanvasPreview.ts`**

## Phase 4: コンポーネント層の移行

1. **Header.jsx → Header.tsx**
2. **PreviewPanel.jsx → PreviewPanel.tsx**
3. **IconEditor.jsx → IconEditor.tsx**
4. **App.jsx → App.tsx**

## Phase 5: 最終調整

- 型エラーの解消
- 厳密な型チェックの有効化
- 未使用コードの削除

## 移行時の注意点

1. **既存機能の動作確認**: 各ファイル移行後に機能テスト実施
2. **段階的適用**: 一度に全て移行せず、1-2ファイルずつ実施
3. **型エラーの段階的解消**: `// @ts-ignore` は一時的にのみ使用
4. **ビルド確認**: 各フェーズ完了時にビルドが正常に通ることを確認

## 期待効果

- **開発時エラーの早期発見**: コンパイル時に型エラーを検出
- **IntelliSenseの向上**: より良いコード補完とドキュメント
- **リファクタリングの安全性**: 型情報による変更の影響範囲の把握
- **新規開発者のオンボーディング向上**: 型定義によるコードの理解促進

## 実行コマンド（移行時に使用）

```bash
# TypeScript型チェック
npx tsc --noEmit

# ESLintでTypeScriptファイルもチェック  
npm run lint

# 段階的ビルド確認
npm run build
```