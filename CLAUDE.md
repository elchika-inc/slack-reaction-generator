# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Slack用のカスタムリアクション絵文字（128x128px）を作成するReactアプリケーション。テキストベースのアイコン生成、アニメーション効果、リアルタイムプレビュー機能を提供。

## 開発コマンド

```bash
# 開発サーバー起動（ポート5173）
npm run dev

# ビルド（Cloudflare Pages用）
npm run build

# ビルド後プレビュー
npm run preview

# ESLintチェック
npm run lint
```

## アーキテクチャ

### 技術スタック
- **フレームワーク**: React 18 + Vite
- **スタイリング**: Tailwind CSS
- **画像処理**: Canvas API
- **GIF生成**: gif.js / gifenc（透明背景対応）

### ディレクトリ構造
- `src/App.jsx` - メインアプリケーション、状態管理
- `src/components/` - UIコンポーネント
  - `IconEditor.jsx` - アイコン設定フォーム
  - `PreviewPanel.jsx` - デスクトップ用プレビュー
  - `Header.jsx` - ヘッダー
- `src/utils/` - ユーティリティ
  - `canvasUtils.js` - gif.js使用のCanvas描画・GIF生成
  - `canvasUtilsGifenc.js` - gifenc使用の透明背景対応版

### 主要機能実装

#### アイコン生成フロー
1. `IconEditor` でユーザー設定を収集
2. `canvasUtils.js` の `drawTextIcon()` でCanvas描画
3. アニメーション時は `drawAnimationFrame()` でフレーム生成
4. `generateIconData()` でPNG/GIF形式にエクスポート

#### アニメーション種類
- `rainbow` - 虹色グラデーション
- `flash` - 点滅効果
- `rotate` - 回転
- `bounce` - バウンス
- `pulse` - 拡大縮小
- `glow` - グロー効果

#### レスポンシブ対応
- デスクトップ: 3カラムレイアウト（エディタ + プレビュー）
- モバイル: 固定フッターにプレビュー表示、ダウンロードボタン配置

## デプロイ設定

### Cloudflare Pages
- ビルドコマンド: `npm run build`
- 出力ディレクトリ: `dist`
- `_headers`, `_redirects` ファイルをdistにコピー

## 注意事項

- GIF生成は2つの実装あり（gif.js/gifenc）、透明背景の扱いが異なる
- モバイルでは自動ダウンロードを実行
- アニメーション速度の最小値は20ms（ブラウザ制限）
- Slack推奨: 128x128px、128KB以下