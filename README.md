# Slack Reaction Generator

Slack用のカスタムリアクション絵文字を簡単に作成できるWebアプリケーション

## 機能

- **テキストベース生成**: テキストからアイコンを作成
- **画像アップロード**: 画像をアップロードしてアイコン化
- **アニメーション**: レインボー、点滅、回転などのエフェクト
- **カスタマイズ**: フォント、色、背景形状の設定
- **プレビュー機能**: リアルタイムでプレビュー
- **ダウンロード**: PNG/GIF形式でダウンロード

## ローカル開発

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview
```

## Cloudflare Pagesへのデプロイ

### 手動デプロイ

1. Cloudflareダッシュボードにログイン
2. Pagesを選択
3. 「プロジェクトを作成」をクリック
4. Gitリポジトリを接続
5. ビルド設定:
   - ビルドコマンド: `npm run build`
   - ビルド出力ディレクトリ: `dist`

### GitHub Actionsを使用した自動デプロイ

リポジトリのSecretsに以下を設定:
- `CLOUDFLARE_API_TOKEN`: Cloudflare APIトークン
- `CLOUDFLARE_ACCOUNT_ID`: アカウントID

## 技術スタック

- **フレームワーク**: React 18
- **ビルドツール**: Vite
- **スタイリング**: Tailwind CSS
- **画像処理**: Canvas API
- **GIF生成**: gif.js
- **カラーピッカー**: react-color
- **ホスティング**: Cloudflare Pages

## ライセンス

MIT