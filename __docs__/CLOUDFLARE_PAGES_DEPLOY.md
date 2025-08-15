# Cloudflare Pages デプロイ手順書

## 1. 前提条件

### 1.1 必要なアカウント
- [ ] Cloudflareアカウント（無料プランでOK）
- [ ] GitHubアカウント
- [ ] Google Cloud Console アカウント（Google Fonts API用）

### 1.2 必要なツール
```bash
# Node.js（v20以上）
node --version

# npm（v10以上）
npm --version

# Git
git --version

# Wrangler CLI（Cloudflare CLI）
npm install -g wrangler
wrangler --version
```

## 2. 初期セットアップ

### 2.1 プロジェクトの準備

#### Step 1: プロジェクトをクローン
```bash
git clone https://github.com/your-username/slack-reaction-generator.git
cd slack-reaction-generator
```

#### Step 2: 依存関係のインストール
```bash
npm install
```

#### Step 3: ローカル環境での動作確認
```bash
# 開発サーバー起動
npm run dev

# ブラウザで http://localhost:5173 を開いて確認
```

### 2.2 Google Fonts API キーの取得

#### Step 1: Google Cloud Console にアクセス
1. https://console.cloud.google.com/ にアクセス
2. 新しいプロジェクトを作成または既存のプロジェクトを選択

#### Step 2: Google Fonts API を有効化
1. 「APIとサービス」→「ライブラリ」
2. 「Google Fonts Developer API」を検索
3. 「有効にする」をクリック

#### Step 3: APIキーの作成
1. 「APIとサービス」→「認証情報」
2. 「認証情報を作成」→「APIキー」
3. 作成されたAPIキーをコピー
4. APIキーの制限を設定（推奨）：
   - アプリケーションの制限：HTTPリファラー
   - ウェブサイトの制限：`https://your-domain.pages.dev/*`

## 3. Cloudflare Pages へのデプロイ（GUI経由）

### 3.1 Cloudflare ダッシュボードでの設定

#### Step 1: Cloudflare にログイン
1. https://dash.cloudflare.com/ にアクセス
2. アカウントにログイン

#### Step 2: Pages プロジェクトの作成
1. 左メニューから「Pages」を選択
2. 「プロジェクトを作成」ボタンをクリック
3. 「Git に接続」を選択

#### Step 3: GitHub リポジトリの接続
1. 「GitHub アカウントを接続」をクリック
2. GitHub の認証画面で権限を許可
3. リポジトリ一覧から対象リポジトリを選択
4. 「セットアップの開始」をクリック

#### Step 4: ビルド設定
```
プロジェクト名: slack-reaction-generator
本番ブランチ: main
ビルドコマンド: npm run build
ビルド出力ディレクトリ: dist
ルートディレクトリ: /（変更なし）
```

#### Step 5: 環境変数の設定
1. 「環境変数」セクションを展開
2. 以下の変数を追加：
```
GOOGLE_FONTS_API_KEY = your-api-key-here
NODE_VERSION = 20
```

#### Step 6: デプロイ開始
1. 「保存してデプロイ」をクリック
2. 初回ビルドが開始される
3. ビルド完了後、URLが発行される

### 3.2 デプロイの確認
```bash
# 発行されたURL例
https://slack-reaction-generator.pages.dev
https://[プロジェクト名].[アカウント名].pages.dev
```

## 4. CLI経由でのデプロイ（Wrangler使用）

### 4.1 Wrangler の初期設定

#### Step 1: Cloudflare アカウントにログイン
```bash
wrangler login
# ブラウザが開き、認証を求められる
```

#### Step 2: プロジェクトの初期化
```bash
wrangler pages project create slack-reaction-generator
```

### 4.2 手動デプロイ

#### Step 1: ビルド実行
```bash
npm run build
```

#### Step 2: デプロイ実行
```bash
wrangler pages deploy dist --project-name=slack-reaction-generator
```

#### Step 3: 環境変数の設定（CLI経由）
```bash
# 本番環境の環境変数設定
wrangler pages secret put GOOGLE_FONTS_API_KEY --project-name=slack-reaction-generator
# プロンプトでAPIキーを入力
```

### 4.3 プレビューデプロイ
```bash
# 開発ブランチからプレビューデプロイ
git checkout develop
npm run build
wrangler pages deploy dist --project-name=slack-reaction-generator --branch=preview
```

## 5. GitHub Actions による自動デプロイ

### 5.1 GitHub Secrets の設定

#### Step 1: Cloudflare API トークンの作成
1. Cloudflare ダッシュボード → My Profile → API Tokens
2. 「Create Token」をクリック
3. 「Custom token」を選択
4. 以下の権限を設定：
   - Account: Cloudflare Pages:Edit
   - Zone: Page Rules:Edit（カスタムドメイン使用時）
5. トークンを作成してコピー

#### Step 2: GitHub リポジトリ設定
1. GitHub リポジトリ → Settings → Secrets and variables → Actions
2. 以下のシークレットを追加：
```
CLOUDFLARE_API_TOKEN = your-api-token
CLOUDFLARE_ACCOUNT_ID = your-account-id
GOOGLE_FONTS_API_KEY = your-google-fonts-key
PUBLIC_URL = https://slack-reaction.pages.dev
```

### 5.2 ワークフローの有効化
```bash
# .github/workflows/deploy.yml を作成済みの場合
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Actions workflow for Cloudflare Pages"
git push origin main
```

### 5.3 デプロイの確認
1. GitHub リポジトリ → Actions タブ
2. ワークフローの実行状況を確認
3. 成功後、Cloudflare Pages URLでアプリケーションを確認

## 6. カスタムドメインの設定（オプション）

### 6.1 Cloudflare でドメイン管理している場合

#### Step 1: Pages プロジェクト設定
1. Cloudflare Pages → プロジェクト選択 → カスタムドメイン
2. 「カスタムドメインを設定」をクリック
3. ドメイン名を入力（例：`reaction.example.com`）

#### Step 2: DNS 設定（自動）
- Cloudflare が自動でCNAMEレコードを作成

### 6.2 外部DNSプロバイダーの場合

#### Step 1: CNAME レコードの追加
```
タイプ: CNAME
名前: reaction（サブドメインの場合）
値: slack-reaction-generator.pages.dev
TTL: 3600
```

#### Step 2: SSL証明書の確認
- Cloudflare が自動でSSL証明書を発行（最大24時間）

## 7. デプロイ後の確認事項

### 7.1 機能テスト
- [ ] テキスト入力機能
- [ ] フォント選択
- [ ] カラーピッカー
- [ ] アニメーション生成
- [ ] 画像ダウンロード
- [ ] レスポンシブデザイン

### 7.2 パフォーマンス確認
```bash
# Lighthouse でパフォーマンステスト
npm install -g lighthouse
lighthouse https://slack-reaction.pages.dev --view
```

### 7.3 セキュリティヘッダー確認
```bash
# セキュリティヘッダーの確認
curl -I https://slack-reaction.pages.dev
```

## 8. ロールバック手順

### 8.1 Cloudflare ダッシュボードから
1. Pages → プロジェクト → デプロイメント
2. 過去のデプロイメント一覧から選択
3. 「このバージョンにロールバック」をクリック

### 8.2 CLI経由
```bash
# 特定のコミットにロールバック
git checkout <commit-hash>
npm run build
wrangler pages deploy dist --project-name=slack-reaction-generator
```

## 9. トラブルシューティング

### 9.1 ビルドエラー

#### Node.js バージョンエラー
```bash
# エラー: Node.js version mismatch
# 解決: 環境変数でバージョン指定
NODE_VERSION=20
```

#### メモリ不足エラー
```bash
# package.json のビルドコマンドを修正
"build": "NODE_OPTIONS='--max-old-space-size=4096' vite build"
```

### 9.2 デプロイエラー

#### 認証エラー
```bash
# Wrangler の再ログイン
wrangler logout
wrangler login
```

#### ファイルサイズエラー
```bash
# 25MB制限を超えた場合
# vite.config.js で chunk 分割を調整
```

### 9.3 実行時エラー

#### CORS エラー
```javascript
// _headers ファイルに追加
/*
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, POST, OPTIONS
```

#### 404 エラー（SPA）
```plaintext
# _redirects ファイルを確認
/*    /index.html   200
```

## 10. メンテナンス作業

### 10.1 定期更新
```bash
# 依存関係の更新
npm update
npm audit fix

# ビルド&デプロイ
npm run build
wrangler pages deploy dist
```

### 10.2 モニタリング
1. Cloudflare Analytics でトラフィック確認
2. Web Analytics でユーザー行動分析
3. エラーログの確認

### 10.3 バックアップ
```bash
# ソースコードのバックアップ
git tag -a v1.0.0 -m "Production release"
git push origin v1.0.0
```

## 11. チェックリスト

### デプロイ前
- [ ] ローカルでビルド成功
- [ ] テストが全て通過
- [ ] 環境変数の設定確認
- [ ] package.json のバージョン更新

### デプロイ後
- [ ] 本番URLでアクセス確認
- [ ] 主要機能の動作確認
- [ ] エラーログの確認
- [ ] パフォーマンステスト実施

### 週次メンテナンス
- [ ] アクセス解析確認
- [ ] エラーレポート確認
- [ ] 依存関係の更新確認
- [ ] セキュリティアラート確認