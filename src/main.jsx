import { render } from 'preact'
import App from './App.jsx'
import './index.css'

// Google Fontsの最適化された読み込み
const loadGoogleFonts = () => {
  // HTMLで既にNoto Sans JPは読み込まれているのでチェック
  const hasNotoSans = document.querySelector('link[href*="Noto+Sans+JP"]')
  
  // その他のフォントは遅延読み込み（メインフォントが既に読まれていない場合のみ）
  if (!hasNotoSans) {
    const criticalFonts = document.createElement('link')
    criticalFonts.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&display=swap'
    criticalFonts.rel = 'stylesheet'
    document.head.appendChild(criticalFonts)
  }
  
  // その他の装飾フォントは遅延読み込み
  requestIdleCallback(() => {
    const additionalFonts = document.createElement('link')
    additionalFonts.href = 'https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700;900&family=Kosugi+Maru:wght@400&family=Pacifico:wght@400&family=Caveat:wght@400;700&family=Dela+Gothic+One:wght@400&family=Mochiy+Pop+One:wght@400&family=Yusei+Magic:wght@400&family=Kaisei+Opti:wght@400;700&family=Sawarabi+Mincho:wght@400&display=swap'
    additionalFonts.rel = 'stylesheet'
    document.head.appendChild(additionalFonts)
  }, { timeout: 2000 })
}

// フォントを非同期で読み込み
loadGoogleFonts()

render(<App />, document.getElementById('root'))