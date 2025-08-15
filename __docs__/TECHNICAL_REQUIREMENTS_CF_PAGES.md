# Cloudflare Pages デプロイ技術要件書

## 1. 概要
Slack Reaction GeneratorをCloudflare Pagesにデプロイするための技術要件と実装方針をまとめた資料です。

## 2. アーキテクチャ概要

### 2.1 基本構成
- **フロントエンド**: 静的サイト（SPA）として実装
- **バックエンド**: Cloudflare Pages Functions（必要な場合）
- **ストレージ**: Cloudflare KV/R2（一時保存用）
- **CDN**: Cloudflare CDN（自動）

### 2.2 技術スタック
```
Frontend:
  - フレームワーク: React/Vue.js/Next.js (静的生成モード)
  - ビルドツール: Vite/Webpack
  - スタイリング: Tailwind CSS/CSS Modules
  - 画像処理: Canvas API/WebGL

Backend (オプション):
  - Cloudflare Pages Functions
  - Wrangler CLI
```

## 3. フロントエンド要件

### 3.1 画像処理ライブラリ
```javascript
// 必要なライブラリ
- fabric.js または konva.js (Canvas操作)
- gif.js (GIFアニメーション生成)
- html2canvas (DOM→画像変換)
- file-saver (ファイルダウンロード)
```

### 3.2 フォント対応
```javascript
// Web Fonts実装
- Google Fonts API
- フォントの動的ロード
- 日本語フォントの最適化（サブセット化）
```

### 3.3 カラーピッカー実装
```javascript
// カラー管理
- react-color または vanilla-picker
- カラーフォーマット変換（HEX/RGB/HSL）
```

## 4. プロジェクト構成

### 4.1 ディレクトリ構造
```
slack-reaction-generator/
├── src/
│   ├── components/     # UIコンポーネント
│   ├── utils/         # ユーティリティ関数
│   ├── hooks/         # カスタムフック
│   ├── styles/        # スタイルシート
│   └── App.jsx        # メインアプリケーション
├── public/            # 静的ファイル
├── dist/             # ビルド出力
├── __docs__/         # ドキュメント
├── package.json
├── vite.config.js
├── _headers          # Cloudflareヘッダー設定
├── _redirects        # Cloudflareリダイレクト設定
└── wrangler.toml     # Cloudflare CLI設定
```

### 4.2 主要な設定ファイル
- **設定ガイド**: `CLOUDFLARE_PAGES_CONFIG.md` 参照
- **デプロイ手順**: `CLOUDFLARE_PAGES_DEPLOY.md` 参照

## 6. 機能実装の技術詳細

### 6.1 テキストベースリアクション生成
```javascript
// Canvas APIを使用した実装例
class TextReactionGenerator {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }
  
  generate(text, options) {
    // 128x128pxのキャンバス設定
    this.canvas.width = 128;
    this.canvas.height = 128;
    
    // 背景描画
    this.drawBackground(options.bgColor, options.bgShape);
    
    // テキスト描画
    this.drawText(text, options.font, options.color);
    
    // エクスポート
    return this.canvas.toDataURL('image/png');
  }
}
```

### 6.2 アニメーション実装
```javascript
// GIFアニメーション生成
import GIF from 'gif.js';

class AnimationGenerator {
  generateRainbow(canvas, options) {
    const gif = new GIF({
      workers: 2,
      quality: 10,
      width: 128,
      height: 128
    });
    
    // フレーム生成
    for (let i = 0; i < 30; i++) {
      const hue = (i * 12) % 360;
      // HSLカラーで描画
      this.drawFrame(canvas, `hsl(${hue}, 100%, 50%)`);
      gif.addFrame(canvas, {delay: 100});
    }
    
    return new Promise((resolve) => {
      gif.on('finished', blob => resolve(blob));
      gif.render();
    });
  }
}
```

### 6.3 画像最適化
```javascript
// ファイルサイズ最適化（128KB以下）
async function optimizeImage(blob) {
  const MAX_SIZE = 128 * 1024; // 128KB
  
  if (blob.size <= MAX_SIZE) {
    return blob;
  }
  
  // 品質を段階的に下げて再圧縮
  let quality = 0.9;
  while (blob.size > MAX_SIZE && quality > 0.1) {
    blob = await recompressImage(blob, quality);
    quality -= 0.1;
  }
  
  return blob;
}
```

## 7. パフォーマンス最適化

### 7.1 コード分割
```javascript
// 動的インポートによる遅延読み込み
const loadImageEditor = () => import('./components/ImageEditor');
const loadAnimationTools = () => import('./utils/animation');
```

### 7.2 画像処理のWeb Worker化
```javascript
// worker.js
self.addEventListener('message', (e) => {
  const { type, data } = e.data;
  
  switch(type) {
    case 'PROCESS_IMAGE':
      const result = processImage(data);
      self.postMessage({ type: 'IMAGE_PROCESSED', result });
      break;
  }
});
```

### 7.3 キャッシュ戦略
```javascript
// Service Worker実装（オプション）
const CACHE_NAME = 'slack-reaction-v1';
const urlsToCache = [
  '/',
  '/assets/styles.css',
  '/assets/app.js'
];
```

## 8. セキュリティ考慮事項

### 8.1 CSP設定
```http
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: blob:;
```

### 8.2 入力検証
```javascript
// XSS対策
function sanitizeInput(text) {
  return text.replace(/[<>]/g, '');
}

// ファイルアップロード検証
function validateImage(file) {
  const validTypes = ['image/png', 'image/jpeg', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  return validTypes.includes(file.type) && file.size <= maxSize;
}
```

## 9. 開発・デプロイ詳細

### 9.1 開発環境
詳細な開発環境のセットアップとローカル開発手順については、`CLOUDFLARE_PAGES_DEPLOY.md`の「2. 初期セットアップ」セクションを参照してください。

### 9.2 デプロイ方法
- **GUI経由のデプロイ**: `CLOUDFLARE_PAGES_DEPLOY.md`の「3. Cloudflare Pages へのデプロイ（GUI経由）」参照
- **CLI経由のデプロイ**: `CLOUDFLARE_PAGES_DEPLOY.md`の「4. CLI経由でのデプロイ」参照
- **自動デプロイ（GitHub Actions）**: `CLOUDFLARE_PAGES_DEPLOY.md`の「5. GitHub Actions による自動デプロイ」参照

### 9.3 設定ファイル
各種設定ファイルの詳細については、`CLOUDFLARE_PAGES_CONFIG.md`を参照してください：
- package.json設定
- vite.config.js設定
- wrangler.toml設定
- _headers/_redirects設定
- 環境変数設定
- GitHub Actions設定

## 10. モニタリング

### 10.1 Cloudflare Analytics
- ページビュー
- 帯域幅使用量
- キャッシュヒット率
- Web Vitals

### 10.2 エラートラッキング
エラートラッキングの実装詳細については、`CLOUDFLARE_PAGES_CONFIG.md`の「7. モニタリング設定」セクションを参照してください。

## 11. 推定コスト

### Cloudflare Pages (Free Plan)
- 月間500ビルド
- 無制限の帯域幅
- カスタムドメイン対応
- SSL証明書自動発行

### 追加コスト（必要な場合）
- Cloudflare Workers（$5/月〜）
- Cloudflare KV（$5/月〜）
- Cloudflare R2（使用量に応じて）

## 12. まとめ

### メリット
- ✅ 完全無料でスタート可能
- ✅ グローバルCDN自動適用
- ✅ 自動SSL証明書
- ✅ GitHub連携による自動デプロイ
- ✅ プレビュー環境の自動生成

### 注意点
- ⚠️ サーバーサイド処理は制限あり
- ⚠️ 大容量ファイルの処理はクライアント側で実装
- ⚠️ データ永続化にはKV/R2の利用が必要

### 推奨実装方針
1. まずは静的サイトとして実装
2. 必要に応じてPages Functionsを追加
3. パフォーマンス問題があればWeb Worker活用
4. ユーザー数増加時にKV/R2でキャッシュ実装