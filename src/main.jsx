import { render } from 'preact'
import App from './App.jsx'
import './index.css'

// Google Fontsの最適化された読み込み
const loadGoogleFonts = () => {
  // 初期表示に必要な最小限のフォントのみ
  const criticalFonts = document.createElement('link')
  criticalFonts.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&display=swap'
  criticalFonts.rel = 'stylesheet'
  criticalFonts.media = 'print'
  criticalFonts.onload = function() { this.media = 'all' }
  document.head.appendChild(criticalFonts)
  
  // その他のフォントは遅延読み込み
  requestIdleCallback(() => {
    const additionalFonts = document.createElement('link')
    additionalFonts.href = 'https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@700&family=Kosugi+Maru&family=Pacifico&family=Caveat:wght@700&family=Dela+Gothic+One&family=Mochiy+Pop+One&family=Yusei+Magic&family=Kaisei+Opti:wght@700&family=Sawarabi+Mincho&display=swap'
    additionalFonts.rel = 'stylesheet'
    document.head.appendChild(additionalFonts)
  }, { timeout: 2000 })
}

// フォントを非同期で読み込み
loadGoogleFonts()

render(<App />, document.getElementById('root'))