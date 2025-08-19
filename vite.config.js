import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import { VitePWA } from 'vite-plugin-pwa'
import { viteSingleFile } from 'vite-plugin-singlefile'
import purgecss from 'vite-plugin-purgecss'

export default defineConfig({
  resolve: {
    alias: {
      'react': 'preact/compat',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime'
    }
  },
  plugins: [
    react(),
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
        drop_debugger: true
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