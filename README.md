# Slack絵文字ジェネレーター 🎨

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/naoto24kawa/slack-icon-generator)

Slackのカスタムリアクション絵文字を簡単に作成できるWebアプリケーションです。テキストや画像からアニメーション付きのGIF/PNG形式の絵文字を生成できます。

## ✨ 特徴

- 📝 **テキストから絵文字生成** - 日本語フォント対応、サイズ・色自由にカスタマイズ
- 🖼️ **画像アップロード対応** - JPG/PNG/GIF形式の画像から絵文字作成
- 🎬 **豊富なアニメーション** - 点滅、回転、バウンス、グロー効果など
- 🎨 **グラデーション対応** - テキストにグラデーション効果を適用可能
- 📱 **レスポンシブデザイン** - PC/スマホ両対応
- 🚀 **高速処理** - Canvas APIとWeb Workersによる高速なGIF生成
- 🌐 **完全無料** - サーバーレスで動作、登録不要

## 🛠️ 技術スタック

- **フロントエンド**
  - React 18
  - Vite
  - Tailwind CSS
  - Canvas API
  
- **画像処理**
  - gif.js - GIFアニメーション生成
  - gifenc - 透明背景サポート向上版（オプション）
  - file-saver - ファイルダウンロード
  
- **ホスティング**
  - Cloudflare Workers/Pages
  - GitHub Actions (自動デプロイ)

## 🚀 はじめ方

### 必要要件

- Node.js 18以上
- npm または yarn

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/naoto24kawa/slack-icon-generator.git
cd slack-icon-generator

# 依存関係をインストール
npm install
```

### 開発サーバー起動

```bash
# 開発サーバーを起動（localhost:5173）
npm run dev
```

### ビルド

```bash
# プロダクションビルド
npm run build

# ビルドプレビュー
npm run preview
```

### Cloudflare Workersへのデプロイ

```bash
# Wrangler CLIでデプロイ
npm run deploy

# Workers開発サーバー（localhost:8787）
npm run dev:worker
```

## 📋 使い方

1. **テキスト入力または画像アップロード**
   - テキストモード: 絵文字にしたいテキストを入力
   - 画像モード: 画像ファイルを選択またはドラッグ&ドロップ

2. **スタイルをカスタマイズ**
   - フォントサイズ、色、背景色を調整
   - アニメーション効果を選択
   - グラデーション設定（テキストモードのみ）

3. **プレビュー確認**
   - リアルタイムでプレビュー表示
   - 128×128px（実際のサイズ）と拡大版を同時確認

4. **ダウンロード**
   - PNG形式: 静止画として保存
   - GIF形式: アニメーション付きで保存

## 🎨 アニメーション効果

- **なし** - 静止画
- **点滅** - フェードイン/アウト
- **回転** - 360度回転
- **ズーム** - 拡大縮小
- **バウンス** - 上下に跳ねる
- **シェイク** - 左右に振動
- **パルス** - 脈動効果
- **レインボー** - 虹色変化（テキストのみ）
- **グロー** - 発光効果（テキストのみ）
- **ウェーブ** - 波打ち効果（テキストのみ）

## 📁 プロジェクト構造

```
slack-icon-generator/
├── src/
│   ├── App.jsx              # メインアプリケーション
│   ├── components/
│   │   ├── Header.jsx        # ヘッダーコンポーネント
│   │   ├── IconEditor.jsx    # アイコン設定UI
│   │   └── PreviewPanel.jsx  # プレビューパネル
│   ├── utils/
│   │   ├── canvasUtils.js    # Canvas処理（gif.js版）
│   │   └── canvasUtilsGifenc.js # Canvas処理（gifenc版）
│   └── main.jsx              # エントリーポイント
├── public/                   # 静的ファイル
├── dist/                     # ビルド出力
├── wrangler.toml             # Cloudflare Workers設定
├── vite.config.js            # Viteビルド設定
├── tailwind.config.js        # Tailwind CSS設定
└── package.json              # プロジェクト設定
```

## 🔧 設定

### 環境変数

Cloudflare Workersへの自動デプロイには以下のシークレットが必要:

- `CLOUDFLARE_API_TOKEN` - Cloudflare APIトークン
- `CLOUDFLARE_ACCOUNT_ID` - CloudflareアカウントID

### GitHub Actions

`.github/workflows/deploy.yml`でmainブランチへのpush時に自動デプロイが設定されています。

## 📝 開発ガイド

### 透明背景サポートの切り替え

`src/App.jsx`でGIFライブラリを切り替え可能:

```javascript
// gifenc版（透明背景サポート向上）
import { generateIconData } from './utils/canvasUtilsGifenc'

// gif.js版（デフォルト、高速）
import { generateIconData } from './utils/canvasUtils'
```

### カスタムフォントの追加

`index.html`のGoogle Fontsリンクにフォントを追加:

```html
<link href="https://fonts.googleapis.com/css2?family=YourFont:wght@400;700&display=swap" rel="stylesheet">
```

## 🤝 コントリビューション

プルリクエストは歓迎です！大きな変更の場合は、まずissueを開いて変更内容を議論してください。

1. Fork it
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 🙏 謝辞

- [gif.js](https://github.com/jnordberg/gif.js) - GIFエンコーディングライブラリ
- [gifenc](https://github.com/mattdesl/gifenc) - 透明背景対応GIFライブラリ
- [Cloudflare Workers](https://workers.cloudflare.com/) - エッジコンピューティングプラットフォーム

## 📞 サポート

問題が発生した場合は、[Issues](https://github.com/naoto24kawa/slack-icon-generator/issues)でお知らせください。

---

Built with ❤️ for Slack users everywhere