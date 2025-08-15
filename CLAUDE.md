# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Slack用のカスタムリアクション絵文字を生成するReactベースのWebアプリケーション。テキストや画像からアニメーション付きのアイコンを作成し、PNG/GIF形式でダウンロード可能。

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド（_headers, _redirects を dist/ にコピーを含む）
npm run build

# Lint実行
npm run lint

# Cloudflare Workers開発サーバー
npm run dev:worker  # または npx wrangler dev --port 8787 --local

# Cloudflare Workersへデプロイ
npm run deploy

# ビルド済みアセットでPages開発サーバー
npm run preview:worker
```

## アーキテクチャ

### コンポーネント構造
- `src/App.jsx` - メインアプリケーション、状態管理、モバイル/デスクトップ切り替え
- `src/components/IconEditor.jsx` - アイコン設定UI（テキスト、色、アニメーション等）
- `src/components/PreviewPanel.jsx` - デスクトップ用プレビューパネル
- `src/utils/canvasUtils.js` - Canvas API使用、gif.jsでGIF生成（デフォルト）
- `src/utils/canvasUtilsGifenc.js` - gifencライブラリ使用版（透明背景サポート向上）

### 主要技術
- **React 18** - UIフレームワーク
- **Vite** - ビルドツール
- **Tailwind CSS** - スタイリング
- **gif.js / gifenc** - GIFアニメーション生成
- **Canvas API** - 画像処理
- **Cloudflare Workers/Pages** - ホスティング

### デプロイ
- **Cloudflare Workers**: `npm run deploy` または GitHub Actionsで自動デプロイ
- GitHub Actions (`.github/workflows/deploy.yml`) で main ブランチへのpush時に自動デプロイ
- 必要なシークレット: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`

### Workers設定
- `wrangler.toml` - Cloudflare Workers専用設定（Pages機能は削除済み）
- 静的アセット専用モード: `assets = { directory = "./dist" }`
- SPAは自動的に処理される（カスタム_worker.js不要）
- セキュリティとキャッシュはCloudflareのデフォルト設定を使用

### 設定ファイル
- `wrangler.toml` - Cloudflare Workers設定（Pages関連削除）
- `vite.config.js` - Viteビルド設定（コード分割含む）
- `tailwind.config.js` - Tailwindカスタマイズ
- `postcss.config.js` - PostCSS設定