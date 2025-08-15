# Cloudflare Pages 設定ガイド

## 1. プロジェクト設定ファイル

### 1.1 package.json
```json
{
  "name": "slack-reaction-generator",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint src --ext js,jsx",
    "format": "prettier --write 'src/**/*.{js,jsx,css}'"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "fabric": "^5.3.0",
    "gif.js": "^0.2.0",
    "file-saver": "^2.0.5",
    "react-color": "^2.19.3"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "eslint": "^8.54.0",
    "prettier": "^3.1.0",
    "vitest": "^1.0.0",
    "wrangler": "^3.0.0"
  }
}
```

### 1.2 vite.config.js
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'image-processing': ['fabric', 'gif.js'],
          'ui-components': ['react-color', 'file-saver']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: ['fabric', 'gif.js', 'file-saver', 'react-color']
  }
});
```

### 1.3 wrangler.toml
```toml
name = "slack-reaction-generator"
compatibility_date = "2024-01-01"

[site]
bucket = "./dist"

[env.production]
vars = { ENVIRONMENT = "production" }

[env.preview]
vars = { ENVIRONMENT = "preview" }
```

## 2. Cloudflare Pages固有設定

### 2.1 _headers
```plaintext
# セキュリティヘッダー
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

# 静的アセットのキャッシュ設定
/assets/*
  Cache-Control: public, max-age=31536000, immutable

# 画像ファイルのキャッシュ
/images/*
  Cache-Control: public, max-age=604800

# JavaScriptファイル
/*.js
  Content-Type: application/javascript; charset=utf-8
  Cache-Control: public, max-age=31536000, immutable

# CSSファイル
/*.css
  Content-Type: text/css; charset=utf-8
  Cache-Control: public, max-age=31536000, immutable

# HTMLファイル（SPAのため基本的にindex.htmlのみ）
/*.html
  Cache-Control: no-cache, no-store, must-revalidate
```

### 2.2 _redirects
```plaintext
# SPAのためのフォールバック
/*    /index.html   200

# 旧URLからのリダイレクト（必要に応じて）
/old-path    /new-path    301
```

### 2.3 .cloudflare/config.yml
```yaml
# Cloudflare Pages設定
version: 1
build:
  command: npm run build
  directory: dist
  environment:
    NODE_VERSION: "20"
    NPM_VERSION: "10"

# 環境変数の定義
env:
  production:
    GOOGLE_FONTS_API_KEY: "@env.GOOGLE_FONTS_API_KEY"
    PUBLIC_URL: "https://slack-reaction.pages.dev"
  preview:
    GOOGLE_FONTS_API_KEY: "@env.GOOGLE_FONTS_API_KEY"
    PUBLIC_URL: "@env.CF_PAGES_URL"
```

## 3. 環境変数設定

### 3.1 必須環境変数
```bash
# Google Fonts API（フォント読み込み用）
GOOGLE_FONTS_API_KEY=your-api-key-here

# アプリケーションURL
PUBLIC_URL=https://your-domain.pages.dev

# ビルド環境
NODE_ENV=production
```

### 3.2 オプション環境変数
```bash
# アナリティクス（必要に応じて）
ANALYTICS_ID=your-analytics-id

# エラートラッキング（必要に応じて）
SENTRY_DSN=your-sentry-dsn

# Feature Flags
ENABLE_ANIMATION=true
ENABLE_SHARE_FEATURE=true
```

## 4. GitHub Actions設定

### 4.1 .github/workflows/deploy.yml
```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches:
      - main
      - develop
  pull_request:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
        env:
          PUBLIC_URL: ${{ secrets.PUBLIC_URL }}
          GOOGLE_FONTS_API_KEY: ${{ secrets.GOOGLE_FONTS_API_KEY }}
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: slack-reaction-generator
          directory: dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
          deploymentName: ${{ github.event_name == 'push' && 'Production' || 'Preview' }}
```

### 4.2 .github/workflows/preview.yml
```yaml
name: Deploy Preview

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  deploy-preview:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - run: npm ci
      
      - run: npm run build
      
      - name: Deploy Preview
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: slack-reaction-generator
          directory: dist
          deploymentName: Preview-PR-${{ github.event.number }}
```

## 5. セキュリティ設定

### 5.1 Content Security Policy (CSP)
```javascript
// public/index.html に追加
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com data:;
  img-src 'self' data: blob: https:;
  connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com;
  worker-src 'self' blob:;
">
```

### 5.2 環境変数の保護
```javascript
// src/config/index.js
const config = {
  // 公開可能な設定
  publicUrl: import.meta.env.VITE_PUBLIC_URL || '',
  enableAnimations: import.meta.env.VITE_ENABLE_ANIMATIONS === 'true',
  
  // APIキーは環境変数から取得
  googleFontsApiKey: import.meta.env.VITE_GOOGLE_FONTS_API_KEY,
  
  // 開発環境の判定
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

// APIキーの検証
if (config.isProduction && !config.googleFontsApiKey) {
  console.warn('Google Fonts API key is not configured');
}

export default config;
```

## 6. パフォーマンス最適化設定

### 6.1 画像最適化
```javascript
// vite.config.js に追加
import imagemin from 'vite-plugin-imagemin';

export default {
  plugins: [
    imagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      svgo: {
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'removeEmptyAttrs', active: false }
        ]
      }
    })
  ]
};
```

### 6.2 Service Worker設定（オプション）
```javascript
// public/sw.js
const CACHE_NAME = 'slack-reaction-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/app.js',
  '/assets/style.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

## 7. モニタリング設定

### 7.1 Cloudflare Web Analytics
```html
<!-- public/index.html に追加 -->
<script defer src='https://static.cloudflareinsights.com/beacon.min.js' 
        data-cf-beacon='{"token": "YOUR_ANALYTICS_TOKEN"}'></script>
```

### 7.2 エラートラッキング（Sentry）
```javascript
// src/index.js
import * as Sentry from "@sentry/react";

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      new Sentry.BrowserTracing(),
    ],
    tracesSampleRate: 0.1,
  });
}
```

## 8. ローカル開発設定

### 8.1 .env.development
```bash
# 開発環境設定
VITE_PUBLIC_URL=http://localhost:5173
VITE_GOOGLE_FONTS_API_KEY=development-key
VITE_ENABLE_ANIMATIONS=true
VITE_ENABLE_DEBUG=true
```

### 8.2 .env.production
```bash
# 本番環境設定
VITE_PUBLIC_URL=https://slack-reaction.pages.dev
VITE_GOOGLE_FONTS_API_KEY=${GOOGLE_FONTS_API_KEY}
VITE_ENABLE_ANIMATIONS=true
VITE_ENABLE_DEBUG=false
```

## 9. トラブルシューティング設定

### 9.1 デバッグモード
```javascript
// src/utils/debug.js
const DEBUG = import.meta.env.VITE_ENABLE_DEBUG === 'true';

export const log = (...args) => {
  if (DEBUG) {
    console.log('[DEBUG]', ...args);
  }
};

export const logError = (...args) => {
  if (DEBUG) {
    console.error('[ERROR]', ...args);
  }
};
```

### 9.2 エラーバウンダリー
```javascript
// src/components/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Sentryなどへの送信
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
```