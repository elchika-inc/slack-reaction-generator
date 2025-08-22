import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { viteSingleFile } from 'vite-plugin-singlefile'
import purgecss from 'vite-plugin-purgecss'

export default defineConfig({
  resolve: {
    alias: {
      'react': 'preact/compat',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime',
      '@': '/src',
      '@/components': '/src/components',
      '@/hooks': '/src/hooks',
      '@/utils': '/src/utils',
      '@/types': '/src/types'
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png'],
      manifest: false, // manifest.jsonは既存のものを使用
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,avif,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1年
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1年
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ],
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024 // 3MB
      },
      devOptions: {
        enabled: false // 開発時はPWAを無効化（パフォーマンス優先）
      }
    }),
    purgecss({
      content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
      safelist: [
        // アニメーション関連のクラスを保護
        /^animate-/,
        /^transition/,
        'transition-gpu',
        'transition-scale',
        'transition-opacity',
        // 動的に生成されるクラスを保護
        /^bg-/, /^text-/, /^border-/, /^hover:/, /^focus:/, /^active:/,
        // レスポンシブクラスを保護
        /^lg:/, /^md:/, /^sm:/, /^xl:/,
        // Flexboxとグリッド
        /^flex/, /^grid/, /^gap-/, /^space-/,
        // z-indexクラスを保護
        /^z-/, 'z-[1000]', 'z-[1001]', 'fixed', 'absolute', 'relative',
        // Tailwindの重要なユーティリティ
        'sr-only', 'container', 'mx-auto', 'hidden', 'block', 'inline-block',
        'will-change-transform', 'transform', 'scale-95'
      ]
    })
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    target: 'es2015',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
        passes: 2
      },
      format: {
        comments: false
      }
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|avif|webp/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`
          }
          if (/woff2?|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`
          }
          return `assets/[name]-[hash][extname]`
        }
      }
    },
    reportCompressedSize: true,
    chunkSizeWarningLimit: 200,
    cssCodeSplit: true,
    assetsInlineLimit: 4096 // 4KBまでインライン化
  },
  server: {
    port: 5173,
    strictPort: false,
    open: false
  },
  preview: {
    port: 4173
  }
})