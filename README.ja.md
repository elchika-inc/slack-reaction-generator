# Slack リアクションジェネレーター

Slack のカスタム絵文字・リアクションを簡単に作成できる Web アプリケーションです。テキストや画像からアニメーション付き GIF や静止画 PNG アイコンをリアルタイムプレビューで生成できます。

[![Cloudflare Pagesへデプロイ](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-orange)](https://slack-emoji-generator.elchika.app/)
[![ライセンス](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🎨 機能

- **テキストから絵文字生成**: 様々なフォントとスタイルで任意のテキストからカスタム絵文字を作成
- **画像アップロード対応**: 画像を Slack 対応の絵文字に変換
- **アニメーション効果**: バウンス、シェイク、回転、パルス、スライドなどのアニメーションを追加
- **リアルタイムプレビュー**: カスタマイズ中の変更を即座に確認
- **複数の出力形式**: PNG（静止画）または GIF（アニメーション）でダウンロード
- **モバイル対応**: デスクトップとモバイルデバイスでシームレスに動作
- **日本語フォント対応**: Noto Sans JP による日本語文字の完全サポート
- **サーバー不要**: プライバシーと高速性のため、すべてブラウザ内で処理

## 🚀 クイックスタート

### ユーザー向け

1. [https://slack-emoji-generator.elchika.app/](https://slack-emoji-generator.elchika.app/) にアクセス
2. テキストを入力するか画像をアップロード
3. 色、フォント、アニメーションをカスタマイズ
4. リアルタイムで絵文字をプレビュー
5. PNG または GIF でダウンロード
6. Slack ワークスペースにアップロード

### Slack 絵文字の要件

- **サイズ**: 最大 128x128 ピクセル
- **ファイルサイズ**:
  - GIF: 最大 128KB
  - その他の形式: 最大 64KB
- **形式**: PNG、GIF、または JPEG

## 💻 開発者向け

### 必要条件

- Node.js 18 以上
- npm または yarn

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/slack-emoji-generator.git
cd slack-emoji-generator

# 依存関係をインストール
npm install
```

### 開発

```bash
# 開発サーバーを起動
npm run dev

# リンターを実行
npm run lint

# テストを実行
npm test
```

### ビルド

```bash
# プロダクションビルド
npm run build

# プロダクションビルドをプレビュー
npm run preview

# ビルド成果物をクリーン
npm run clean
```

### デプロイ

アプリケーションは Cloudflare Pages へのデプロイ用に設定されています：

```bash
# Cloudflare Pagesへデプロイ
npm run deploy
```

### プロジェクト構造

```
├── src/
│   ├── components/       # Reactコンポーネント
│   │   ├── Header.jsx
│   │   ├── IconEditor.jsx
│   │   └── PreviewPanel.jsx
│   ├── hooks/            # カスタムReactフック
│   │   ├── useIconSettings.js
│   │   ├── useFileGeneration.js
│   │   └── useCanvasPreview.js
│   ├── utils/            # ユーティリティ関数
│   │   ├── canvasUtils.js     # Canvas操作
│   │   ├── fontLoader.js      # フォント読み込みロジック
│   │   └── animationUtils.js  # アニメーションユーティリティ
│   └── main.jsx          # アプリケーションエントリーポイント
├── public/               # 静的アセット
├── dist/                 # ビルド出力
└── package.json
```

### 技術スタック

- **フロントエンドフレームワーク**: Preact（React 互換、バンドルサイズ削減）
- **ビルドツール**: Vite
- **スタイリング**: Tailwind CSS
- **Canvas API**: 画像生成用 HTML5 Canvas
- **GIF 生成**: gif.js ライブラリ
- **デプロイ**: Cloudflare Pages
- **PWA**: Progressive Web App 機能

### 主要機能の実装

#### Canvas ベースのアイコン生成

- 静的アイコンは直接 Canvas にレンダリングし、PNG としてエクスポート
- アニメーションアイコンは gif.js を使用してフレームごとに生成
- パフォーマンス向上のためのフォントプリロードとキャッシング

#### パフォーマンス最適化

- 重いライブラリ（gif.js、file-saver、react-color）の遅延読み込み
- 最適なバンドルサイズのためのコード分割
- 初期描画高速化のためのクリティカル CSS インライン化
- バンドルサイズ削減のため React の代わりに Preact を使用

#### レスポンシブデザイン

- 1024px ブレークポイントのモバイルファーストアプローチ
- デスクトップ: エディタとプレビューを並べて表示
- モバイル: スクロール可能なエディタと固定された下部プレビュー

### 設定

#### 環境変数

基本的な動作に環境変数は不要です。

#### Vite 設定

ビルド最適化設定は `vite.config.js` を参照：

- 小さいバンドルのため React を Preact にエイリアス
- Terser による積極的な圧縮
- 4KB インラインしきい値でのアセット最適化

#### Cloudflare Pages

`wrangler.toml` での設定：

- `_headers` でのカスタムヘッダー
- `_redirects` でのリダイレクト

### テスト

```bash
# テストを実行
npm test

# ウォッチモード
npm run test:watch

# カバレッジレポート
npm run test:coverage

# UIテストランナー
npm run test:ui
```

### コントリビューション

1. リポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを開く

### ブラウザサポート

- Chrome/Edge 90 以上
- Firefox 88 以上
- Safari 14 以上
- モバイルブラウザ（iOS Safari、Chrome Mobile）

### パフォーマンスメトリクス

- Lighthouse スコア: 95 以上（パフォーマンス）
- First Contentful Paint: 1.5 秒未満
- Time to Interactive: 3.5 秒未満
- バンドルサイズ: 200KB 未満（gzip 圧縮）

## 📝 ライセンス

このプロジェクトは MIT ライセンスの下でライセンスされています - 詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 🙏 謝辞

- [gif.js](https://github.com/jnordberg/gif.js) - JavaScript での GIF エンコーディング
- [Preact](https://preactjs.com/) - React の高速 3kB 代替
- [Tailwind CSS](https://tailwindcss.com/) - ユーティリティファースト CSS フレームワーク
- [Vite](https://vitejs.dev/) - 次世代フロントエンドツール

## 📧 お問い合わせ

質問やサポートについては、GitHub で issue を開いてください。

## 🔗 リンク

- [ライブデモ](https://slack-emoji-generator.elchika.app/)
- [ドキュメント](https://github.com/yourusername/slack-emoji-generator/wiki)
- [バグレポート](https://github.com/yourusername/slack-emoji-generator/issues)
