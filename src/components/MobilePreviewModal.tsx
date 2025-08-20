import { useState, useEffect, useRef } from 'react'
import { saveAs } from 'file-saver'
// gifencライブラリを使用（透明背景サポート向上）
import { generateIconData, drawAnimationFrame } from '../utils/canvasUtils'
// 従来のgif.jsを使いたい場合は以下をコメントアウト解除

function MobilePreviewModal({ isOpen, onClose, settings }) {
  const [dataUrl, setDataUrl] = useState(null)
  const canvasRef = useRef(null)
  const [theme, setTheme] = useState('light')

  const animationRef = useRef(null)
  const frameRef = useRef(0)

  useEffect(() => {
    // アニメーション停止
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current
      canvas.width = 128
      canvas.height = 128
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      
      // アニメーションがある場合はリアルタイムで描画
      if (settings.animation !== 'none') {
        frameRef.current = 0
        const animate = () => {
          frameRef.current = (frameRef.current + 1) % 60
          drawAnimationFrame(ctx, settings, frameRef.current, 60)
          animationRef.current = requestAnimationFrame(animate)
        }
        animate()
        
        // ダウンロード用のデータURLも生成しておく
        generateIconData(settings, null).then((url) => {
          setDataUrl(url)
        })
      } else {
        // アニメーションなしの場合は静止画を生成
        generateIconData(settings, canvas).then((url) => {
          setDataUrl(url)
        })
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    }
  }, [settings, isOpen])

  const handleDownload = async () => {
    const fileName = `slack-reaction-${Date.now()}.${settings.animation !== 'none' ? 'gif' : 'png'}`
    
    try {
      // アニメーションの場合はGIFを生成
      if (settings.animation !== 'none') {
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = 128
        tempCanvas.height = 128
        
        // GIF生成処理（新しいキャンバスで）
        const url = await generateIconData(settings, tempCanvas)
        
        const response = await fetch(url)
        const blob = await response.blob()
        saveAs(blob, fileName)
      } else if (dataUrl) {
        // 静止画の場合
        const response = await fetch(dataUrl)
        const blob = await response.blob()
        saveAs(blob, fileName)
      }
    } catch (error) {
      // Download error
    }
  }

  const handleShare = async () => {
    if (navigator.share && dataUrl) {
      try {
        const response = await fetch(dataUrl)
        const blob = await response.blob()
        const file = new File([blob], `slack-icon.${settings.animation !== 'none' ? 'gif' : 'png'}`, { 
          type: settings.animation !== 'none' ? 'image/gif' : 'image/png' 
        })
        
        await navigator.share({
          files: [file],
          title: 'Slackアイコン',
          text: 'カスタムSlackアイコンを作成しました！',
        })
      } catch (err) {
        // Share error
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* オーバーレイ */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* モーダルコンテンツ */}
      <div className="relative bg-white rounded-t-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* ハンドルバー */}
        <div className="sticky top-0 bg-white pt-4 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between px-4">
            <h3 className="text-lg font-semibold">プレビュー</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* テーマ切り替え */}
          <div className="flex justify-center">
            <div className="inline-flex rounded-lg border border-gray-200 p-1">
              <button
                onClick={() => setTheme('light')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  theme === 'light' 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-600'
                }`}
              >
                ライト
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  theme === 'dark' 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-600'
                }`}
              >
                ダーク
              </button>
            </div>
          </div>

          {/* プレビューエリア */}
          <div
            className={`
              rounded-2xl p-8 transition-colors
              ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}
            `}
          >
            <div className="flex flex-col items-center space-y-6">
              {/* 実サイズ */}
              <div className="text-center">
                <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  実サイズ (128x128px)
                </p>
                <canvas
                  ref={canvasRef}
                  width={128}
                  height={128}
                  className="border-2 border-gray-300 rounded-lg bg-white shadow-lg"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
              
              {/* Slack表示サイズ */}
              <div className="text-center">
                <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Slack表示 (32x32px)
                </p>
                <div className="w-8 h-8 mx-auto">
                  {dataUrl && (
                    <img
                      src={dataUrl}
                      alt="プレビュー"
                      className="w-full h-full"
                      style={{ imageRendering: 'pixelated' }}
                      loading="lazy"
                      width="32"
                      height="32"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ファイル情報 */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">フォーマット:</span>
                <span className="font-medium">{settings.animation !== 'none' ? 'GIF' : 'PNG'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">サイズ:</span>
                <span className="font-medium">128 × 128px</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">推定サイズ:</span>
                <span className="font-medium">&lt; 128KB</span>
              </div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center space-x-2 bg-purple-600 text-white py-4 rounded-xl font-medium active:scale-95 transition-transform"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>ダウンロード</span>
            </button>
            
            {navigator.share && (
              <button
                onClick={handleShare}
                className="flex items-center justify-center space-x-2 bg-gray-200 text-gray-700 py-4 rounded-xl font-medium active:scale-95 transition-transform"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326" />
                </svg>
                <span>シェア</span>
              </button>
            )}
          </div>

          {/* Slackへの追加方法 */}
          <div className="bg-blue-50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">💡 Slackへの追加方法</h3>
            <ol className="text-xs text-blue-800 space-y-2">
              <li className="flex">
                <span className="font-semibold mr-2">1.</span>
                <span>Slackアプリを開き、ワークスペース名をタップ</span>
              </li>
              <li className="flex">
                <span className="font-semibold mr-2">2.</span>
                <span>「ワークスペースをカスタマイズ」を選択</span>
              </li>
              <li className="flex">
                <span className="font-semibold mr-2">3.</span>
                <span>「カスタム絵文字を追加する」をタップ</span>
              </li>
              <li className="flex">
                <span className="font-semibold mr-2">4.</span>
                <span>ダウンロードしたファイルをアップロード</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobilePreviewModal