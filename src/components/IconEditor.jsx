import { useState, useRef, useEffect, lazy, Suspense } from 'react'
import { CANVAS_CONFIG, getSpeedLabel, calculateFPS } from '../constants/canvasConstants'
import { preloadImage } from '../utils/imageCache'

// ColorPickerを動的インポート
const ColorPicker = lazy(() => import('./ColorPicker'))

function IconEditor({ settings, onChange, isMobile }) {
  const [showFontColorPicker, setShowFontColorPicker] = useState(false)
  const [showBgColorPicker, setShowBgColorPicker] = useState(false)
  const [showSecondaryColorPicker, setShowSecondaryColorPicker] = useState(false)
  const [showGradient1Picker, setShowGradient1Picker] = useState(false)
  const [showGradient2Picker, setShowGradient2Picker] = useState(false)
  
  // アニメーション幅のローカル状態とデバウンス処理
  const [localAnimationAmplitude, setLocalAnimationAmplitude] = useState(settings.animationAmplitude || 50)
  const amplitudeTimeoutRef = useRef(null)

  // アニメーション速度のローカル状態とデバウンス処理
  const [localAnimationSpeed, setLocalAnimationSpeed] = useState(settings.animationSpeed || 33)
  const speedTimeoutRef = useRef(null)

  // settingsのanimationAmplitudeが外部から変更された場合の同期
  useEffect(() => {
    setLocalAnimationAmplitude(settings.animationAmplitude || 50)
  }, [settings.animationAmplitude])

  // settingsのanimationSpeedが外部から変更された場合の同期
  useEffect(() => {
    setLocalAnimationSpeed(settings.animationSpeed || 33)
  }, [settings.animationSpeed])

  const handleAmplitudeChange = (value) => {
    // ローカル状態は即座に更新（UIの応答性向上）
    setLocalAnimationAmplitude(value)
    
    // 既存のタイマーをクリア
    if (amplitudeTimeoutRef.current) {
      clearTimeout(amplitudeTimeoutRef.current)
    }
    
    // デバウンス処理（300ms後に実際の設定を更新）
    amplitudeTimeoutRef.current = setTimeout(() => {
      onChange({ animationAmplitude: value })
    }, 300)
  }

  const handleSpeedChange = (value) => {
    // ローカル状態は即座に更新（UIの応答性向上）
    setLocalAnimationSpeed(value)
    
    // 既存のタイマーをクリア
    if (speedTimeoutRef.current) {
      clearTimeout(speedTimeoutRef.current)
    }
    
    // デバウンス処理（300ms後に実際の設定を更新）
    speedTimeoutRef.current = setTimeout(() => {
      onChange({ animationSpeed: value })
    }, 300)
  }

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (amplitudeTimeoutRef.current) {
        clearTimeout(amplitudeTimeoutRef.current)
      }
      if (speedTimeoutRef.current) {
        clearTimeout(speedTimeoutRef.current)
      }
    }
  }, [])

  const fonts = [
    // 日本語フォント
    { value: '"Noto Sans JP", sans-serif', label: 'Noto Sans', hasJapanese: true, hasEnglish: true },
    { value: '"Noto Serif JP", serif', label: 'Noto Serif', hasJapanese: true, hasEnglish: true },
    { value: '"Kosugi Maru", sans-serif', label: '小杉丸', hasJapanese: true, hasEnglish: false },
    
    // 装飾的フォント
    { value: '"Pacifico", cursive', label: 'Pacifico', hasJapanese: false, hasEnglish: true },
    { value: '"Caveat", cursive', label: 'Caveat', hasJapanese: false, hasEnglish: true },
  ]

  const animations = [
    { value: 'none', label: 'なし', description: 'アニメーションなし' },
    { value: 'rainbow', label: 'レインボー', description: '色が虹色に変化' },
    { value: 'blink', label: '点滅', description: '明滅するエフェクト' },
    { value: 'rotate', label: '回転', description: '360度回転' },
    { value: 'bounce', label: 'バウンス', description: '上下に弾む' },
    { value: 'pulse', label: 'パルス', description: '拡大縮小を繰り返す' },
    { value: 'glow', label: 'グロー', description: '光るエフェクト' },
    { value: 'slide', label: 'スライド', description: '左右にスライド' },
    { value: 'fade', label: 'フェード', description: 'フェードイン/アウト' },
  ]


  return (
    <div className="space-y-6">
      {/* テキスト入力 */}
      <div>
        <label htmlFor="emoji-text-input" className="block text-sm font-medium text-gray-700 mb-2">
          テキスト
          <span className="text-xs text-gray-500 ml-1">(最大30文字)</span>
        </label>
        <textarea
          id="emoji-text-input"
          value={settings.text}
          onChange={(e) => onChange({ text: e.target.value })}
          maxLength={30}
          rows={3}
          className="w-full px-3 py-3 lg:py-2 text-base lg:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono"
          aria-describedby="text-help"
          placeholder="例: OK&#10;了解&#10;👍"
        />
        <div id="text-help" className="mt-1 flex justify-between text-xs text-gray-500" aria-live="polite">
          <span>Enterキーで改行 • 文字数に応じて自動調整</span>
          <span aria-label={`現在の文字数: ${settings.text.length}文字、最大30文字`}>
            {settings.text.length} / 30
          </span>
        </div>
      </div>

      {/* フォント選択 */}
      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 mb-3">
          フォント選択
        </legend>
        <div className={`grid ${isMobile ? 'grid-cols-3 gap-1.5' : 'grid-cols-5 gap-2'}`} role="radiogroup" aria-label="フォントファミリー選択">
          {fonts.map((font) => (
            <button
              key={font.value}
              onClick={() => onChange({ fontFamily: font.value })}
              className={`
                ${isMobile ? 'p-2' : 'p-3'} rounded-lg border text-center transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500
                ${
                  settings.fontFamily === font.value
                    ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                    : 'border-gray-300 hover:bg-gray-50 active:bg-gray-100'
                }
              `}
              role="radio"
              aria-checked={settings.fontFamily === font.value}
              aria-label={`${font.label}${font.hasJapanese ? ' 日本語対応' : ''}${font.hasEnglish ? ' 英語対応' : ''}`}
            >
              <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-600 mb-1`}>{font.label}</div>
              <div 
                className={`${isMobile ? 'text-sm' : 'text-base'} font-bold`}
                style={{ fontFamily: font.value, lineHeight: '1.2' }}
              >
                {font.hasJapanese && <div>あア</div>}
                {font.hasEnglish && <div>Aa</div>}
              </div>
            </button>
          ))}
        </div>
      </fieldset>

      {/* カラー設定 */}
      <div className="space-y-4 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              文字色
            </label>
            
            {/* 単色/グラデーション切り替え */}
            <div className={`flex ${isMobile ? 'gap-1' : 'gap-2'} mb-2`}>
              <button
                onClick={() => onChange({ textColorType: 'solid' })}
                className={`
                  flex-1 px-3 py-2 rounded-lg border transition-colors text-sm
                  ${settings.textColorType === 'solid'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                単色
              </button>
              <button
                onClick={() => onChange({ textColorType: 'gradient' })}
                className={`
                  flex-1 px-3 py-2 rounded-lg border transition-colors text-sm
                  ${settings.textColorType === 'gradient'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                グラデーション
              </button>
            </div>
            
            {/* 単色選択 */}
            {settings.textColorType === 'solid' && (
              <div className="relative">
                <button
                  onClick={() => setShowFontColorPicker(!showFontColorPicker)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg flex items-center justify-center active:bg-gray-50 text-sm"
                >
                  <span className="flex items-center">
                    <span
                      className="w-4 h-4 rounded mr-2 border border-gray-300"
                      style={{ backgroundColor: settings.fontColor }}
                    />
                    {settings.fontColor}
                  </span>
                </button>
                {showFontColorPicker && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowFontColorPicker(false)} />
                    <div className="absolute z-40 mt-2 right-0">
                      <Suspense fallback={<div className="p-3 bg-gray-100 rounded" />}>
                        <ColorPicker
                          color={settings.fontColor}
                          onChange={(color) => onChange({ fontColor: color })}
                          onClose={() => setShowFontColorPicker(false)}
                        />
                      </Suspense>
                    </div>
                  </>
                )}
              </div>
            )}
            
            {/* グラデーション設定 */}
            {settings.textColorType === 'gradient' && (
              <div className="space-y-2 mt-2">
                {/* グラデーション方向 */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onChange({ gradientDirection: 'vertical' })}
                    className={`
                      flex-1 px-3 py-2 rounded-lg border transition-colors text-xs
                      ${settings.gradientDirection === 'vertical'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    ↕ 上下
                  </button>
                  <button
                    onClick={() => onChange({ gradientDirection: 'horizontal' })}
                    className={`
                      flex-1 px-3 py-2 rounded-lg border transition-colors text-xs
                      ${settings.gradientDirection === 'horizontal'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    ↔ 左右
                  </button>
                </div>
                
                {/* グラデーション色1 */}
                <div className="relative">
                  <button
                    onClick={() => setShowGradient1Picker(!showGradient1Picker)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg flex items-center justify-center active:bg-gray-50 text-sm"
                  >
                    <span className="flex items-center">
                      <span
                        className="w-4 h-4 rounded mr-2 border border-gray-300"
                        style={{ backgroundColor: settings.gradientColor1 }}
                      />
                      {settings.gradientColor1}
                    </span>
                  </button>
                  {showGradient1Picker && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setShowGradient1Picker(false)} />
                      <div className="absolute z-40 mt-2 right-0">
                        <Suspense fallback={<div className="p-3 bg-gray-100 rounded" />}>
                          <ColorPicker
                            color={settings.gradientColor1}
                            onChange={(color) => onChange({ gradientColor1: color })}
                            onClose={() => setShowGradient1Picker(false)}
                          />
                        </Suspense>
                      </div>
                    </>
                  )}
                </div>
                
                {/* グラデーション色2 */}
                <div className="relative">
                  <button
                    onClick={() => setShowGradient2Picker(!showGradient2Picker)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg flex items-center justify-center active:bg-gray-50 text-sm"
                  >
                    <span className="flex items-center">
                      <span
                        className="w-4 h-4 rounded mr-2 border border-gray-300"
                        style={{ backgroundColor: settings.gradientColor2 }}
                      />
                      {settings.gradientColor2}
                    </span>
                  </button>
                  {showGradient2Picker && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setShowGradient2Picker(false)} />
                      <div className="absolute z-40 mt-2 right-0">
                        <Suspense fallback={<div className="p-3 bg-gray-100 rounded" />}>
                          <ColorPicker
                            color={settings.gradientColor2}
                            onChange={(color) => onChange({ gradientColor2: color })}
                            onClose={() => setShowGradient2Picker(false)}
                          />
                        </Suspense>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* 背景設定 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              背景
            </label>
            
            {/* アニメーションがない場合のみ透明/色選択を表示 */}
            {settings.animation === 'none' && (
              <div className={isMobile ? "flex gap-2" : "flex flex-col space-y-2"}>
                <button
                  onClick={() => onChange({ backgroundType: 'transparent' })}
                  className={`
                    ${isMobile ? 'flex-1' : ''} px-3 py-2 rounded-lg border transition-colors text-sm
                    ${
                      settings.backgroundType === 'transparent'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  透明
                </button>
                <div className={`relative ${isMobile ? 'flex-1' : ''}`}>
                  <button
                    onClick={() => {
                      onChange({ backgroundType: 'color' })
                      setShowBgColorPicker(true)
                    }}
                    className={`
                      w-full px-3 py-2 rounded-lg border transition-colors flex items-center justify-center text-sm
                      ${
                        settings.backgroundType === 'color'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <span
                      className="w-4 h-4 rounded mr-2 border border-gray-400"
                      style={{ backgroundColor: settings.backgroundColor || '#FFFFFF' }}
                    />
                    <span className={settings.backgroundType === 'color' ? 'text-purple-700' : ''}>
                      {settings.backgroundColor || '#FFFFFF'}
                    </span>
                  </button>
                  {showBgColorPicker && settings.backgroundType === 'color' && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setShowBgColorPicker(false)} />
                      <div className="absolute z-40 mt-2 right-0">
                        <Suspense fallback={<div className="p-3 bg-gray-100 rounded" />}>
                          <ColorPicker
                            color={settings.backgroundColor || '#FFFFFF'}
                            onChange={(color) => onChange({ backgroundColor: color })}
                            onClose={() => setShowBgColorPicker(false)}
                          />
                        </Suspense>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          
            {/* アニメーション時のみ背景色選択 */}
            {settings.animation !== 'none' && (
              <div>
                <div className="relative">
                  <button
                    onClick={() => setShowBgColorPicker(!showBgColorPicker)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg flex items-center justify-center active:bg-gray-50 text-sm"
                  >
                    <span className="flex items-center">
                      <span
                        className="w-4 h-4 rounded mr-2 border border-gray-300"
                        style={{ backgroundColor: settings.backgroundColor || '#FFFFFF' }}
                      />
                      {settings.backgroundColor || '#FFFFFF'}
                    </span>
                  </button>
                  {showBgColorPicker && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setShowBgColorPicker(false)} />
                      <div className="absolute z-40 mt-2 right-0">
                        <Suspense fallback={<div className="p-3 bg-gray-100 rounded" />}>
                          <ColorPicker
                            color={settings.backgroundColor || '#FFFFFF'}
                            onChange={(color) => onChange({ backgroundColor: color })}
                            onClose={() => setShowBgColorPicker(false)}
                          />
                        </Suspense>
                      </div>
                    </>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  GIF背景色
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* アニメーション */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          アニメーション効果
        </label>
        <div className={`grid ${isMobile ? 'grid-cols-3 gap-1.5' : 'grid-cols-1 lg:grid-cols-3 gap-3'}`}>
          {animations.map((anim) => (
            <button
              key={anim.value}
              onClick={() => onChange({ animation: anim.value })}
              className={`
                ${isMobile ? 'py-2 px-1' : 'p-3'} rounded-lg border ${isMobile ? 'text-center' : 'text-left'} transition-all active:scale-95
                ${
                  settings.animation === anim.value
                    ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                    : 'border-gray-300 hover:bg-gray-50 active:bg-gray-100'
                }
              `}
            >
              <div className={`font-medium ${isMobile ? 'text-[11px]' : 'text-sm'}`}>{anim.label}</div>
              {!isMobile && (
                <div className="text-xs text-gray-500 mt-1">{anim.description}</div>
              )}
            </button>
          ))}
        </div>
      </div>


      {/* アニメーション設定 */}
      {settings.animation !== 'none' && (
        <div className="space-y-4">
          {/* モバイル: 縦並び、デスクトップ: 条件に応じて横並び */}
          <div className={`${!isMobile && ((settings.animation === 'bounce' || settings.animation === 'pulse' || settings.animation === 'slide') || (settings.animation === 'glow' || settings.animation === 'blink')) ? 'grid grid-cols-2 gap-4' : ''}`}>
            {/* アニメーション速度 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                アニメーション速度
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="30"
                  max="100"
                  step="1"
                  value={CANVAS_CONFIG.ANIMATION_SPEED_INVERT_BASE - localAnimationSpeed}
                  onChange={(e) => {
                    const invertedValue = CANVAS_CONFIG.ANIMATION_SPEED_INVERT_BASE - parseInt(e.target.value)
                    handleSpeedChange(invertedValue)
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #9333ea 0%, #9333ea ${((CANVAS_CONFIG.ANIMATION_SPEED_INVERT_BASE - localAnimationSpeed) - CANVAS_CONFIG.MIN_ANIMATION_SPEED) / (CANVAS_CONFIG.MAX_ANIMATION_SPEED - CANVAS_CONFIG.MIN_ANIMATION_SPEED) * 100}%, #e5e7eb ${((CANVAS_CONFIG.ANIMATION_SPEED_INVERT_BASE - localAnimationSpeed) - CANVAS_CONFIG.MIN_ANIMATION_SPEED) / (CANVAS_CONFIG.MAX_ANIMATION_SPEED - CANVAS_CONFIG.MIN_ANIMATION_SPEED) * 100}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>遅い</span>
                  <span>速い</span>
                </div>
              </div>
            </div>

            {/* アニメーション幅制御（バウンス、パルス、スライドのみ） */}
            {(settings.animation === 'bounce' || settings.animation === 'pulse' || settings.animation === 'slide') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  アニメーション幅
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={localAnimationAmplitude}
                    onChange={(e) => {
                      handleAmplitudeChange(parseInt(e.target.value))
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #9333ea 0%, #9333ea ${(localAnimationAmplitude - 10) / 90 * 100}%, #e5e7eb ${(localAnimationAmplitude - 10) / 90 * 100}%, #e5e7eb 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>小さく</span>
                    <span className="text-purple-600 font-medium">{localAnimationAmplitude}%</span>
                    <span>大きく</span>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {settings.animation === 'bounce' && 'バウンスの高さを調整'}
                  {settings.animation === 'pulse' && '拡大縮小の変化量を調整'}
                  {settings.animation === 'slide' && 'スライドの距離を調整'}
                </p>
              </div>
            )}

            {/* セカンドカラー（グローと点滅のみ） */}
            {(settings.animation === 'glow' || settings.animation === 'blink') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  セカンドカラー
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowSecondaryColorPicker(!showSecondaryColorPicker)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg flex items-center justify-center active:bg-gray-50 text-sm"
                  >
                    <span className="flex items-center">
                      <span
                        className="w-4 h-4 rounded mr-2 border border-gray-300"
                        style={{ backgroundColor: settings.secondaryColor || '#FFD700' }}
                      />
                      {settings.secondaryColor || '#FFD700'}
                    </span>
                  </button>
                  {showSecondaryColorPicker && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setShowSecondaryColorPicker(false)} />
                      <div className="absolute z-40 mt-2 right-0">
                        <Suspense fallback={<div className="p-3 bg-gray-100 rounded" />}>
                          <ColorPicker
                            color={settings.secondaryColor || '#FFD700'}
                            onChange={(color) => onChange({ secondaryColor: color })}
                            onClose={() => setShowSecondaryColorPicker(false)}
                          />
                        </Suspense>
                      </div>
                    </>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {settings.animation === 'glow' 
                    ? 'グロー効果の光の色' 
                    : '点滅時の切り替え色'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 画像設定 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            画像を追加
          </label>
          <div className="space-y-3">
            {/* 画像アップロード */}
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = async (event) => {
                      const dataUrl = event.target.result
                      // 画像を事前読み込み
                      await preloadImage(dataUrl)
                      onChange({ imageData: dataUrl })
                    }
                    reader.readAsDataURL(file)
                  }
                }}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 cursor-pointer transition-colors flex items-center justify-center"
              >
                {settings.imageData ? (
                  <div className="flex items-center gap-2">
                    <img 
                      src={settings.imageData} 
                      alt="Uploaded" 
                      className="w-8 h-8 object-contain"
                    />
                    <span className="text-sm text-gray-600">画像を変更</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="text-sm text-gray-600">画像を選択</span>
                  </div>
                )}
              </label>
            </div>

            {/* 画像がアップロードされた場合のコントロール */}
            {settings.imageData && (
              <>
                {/* 前後位置切り替え */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">レイヤー順序</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onChange({ imagePosition: 'back' })}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-all active:scale-95 flex items-center justify-center gap-2 ${
                        settings.imagePosition === 'back'
                          ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200 text-purple-700'
                          : 'border-gray-300 hover:bg-gray-50 active:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      背景
                    </button>
                    <button
                      onClick={() => onChange({ imagePosition: 'front' })}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-all active:scale-95 flex items-center justify-center gap-2 ${
                        settings.imagePosition === 'front'
                          ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200 text-purple-700'
                          : 'border-gray-300 hover:bg-gray-50 active:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      前景
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {settings.imagePosition === 'back' ? '画像は文字の後ろに表示されます' : '画像は文字の前に表示されます'}
                  </p>
                </div>

                {/* 削除ボタン */}
                <button
                  onClick={() => onChange({ imageData: null })}
                  className="w-full px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
                >
                  画像を削除
                </button>

                {/* 位置調整 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      横位置
                    </label>
                    <div className="space-y-1">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={settings.imageX || 50}
                        onChange={(e) => onChange({ imageX: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #9333ea 0%, #9333ea ${settings.imageX || 50}%, #e5e7eb ${settings.imageX || 50}%, #e5e7eb 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>左</span>
                        <span className="text-purple-600 font-medium">{settings.imageX || 50}%</span>
                        <span>右</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      縦位置
                    </label>
                    <div className="space-y-1">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={settings.imageY || 50}
                        onChange={(e) => onChange({ imageY: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #9333ea 0%, #9333ea ${settings.imageY || 50}%, #e5e7eb ${settings.imageY || 50}%, #e5e7eb 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>上</span>
                        <span className="text-purple-600 font-medium">{settings.imageY || 50}%</span>
                        <span>下</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* サイズと透過度 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      サイズ
                    </label>
                    <div className="space-y-1">
                      <input
                        type="range"
                        min="10"
                        max="150"
                        step="5"
                        value={settings.imageSize || 50}
                        onChange={(e) => onChange({ imageSize: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #9333ea 0%, #9333ea ${((settings.imageSize || 50) - 10) / 140 * 100}%, #e5e7eb ${((settings.imageSize || 50) - 10) / 140 * 100}%, #e5e7eb 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>小</span>
                        <span className="text-purple-600 font-medium">{settings.imageSize || 50}%</span>
                        <span>大</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      透過度
                    </label>
                    <div className="space-y-1">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={settings.imageOpacity || 100}
                        onChange={(e) => onChange({ imageOpacity: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #9333ea 0%, #9333ea ${settings.imageOpacity || 100}%, #e5e7eb ${settings.imageOpacity || 100}%, #e5e7eb 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>透明</span>
                        <span className="text-purple-600 font-medium">{settings.imageOpacity || 100}%</span>
                        <span>不透明</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 画像アニメーション設定 */}
                <div className="space-y-3 mt-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">画像アニメーション</label>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { value: 'none', label: 'なし' },
                        { value: 'rotate', label: '回転' },
                        { value: 'bounce', label: 'バウンス' },
                        { value: 'pulse', label: 'パルス' },
                        { value: 'slide', label: 'スライド' },
                        { value: 'fade', label: 'フェード' },
                      ].map((anim) => (
                        <button
                          key={anim.value}
                          onClick={() => onChange({ imageAnimation: anim.value })}
                          className={`py-2 px-1 rounded-lg border text-xs transition-all active:scale-95 ${
                            settings.imageAnimation === anim.value
                              ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200 text-purple-700'
                              : 'border-gray-300 hover:bg-gray-50 active:bg-gray-100 text-gray-700'
                          }`}
                        >
                          {anim.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 画像アニメーション幅（バウンス、パルス、スライドのみ） */}
                  {settings.imageAnimation !== 'none' && (settings.imageAnimation === 'bounce' || settings.imageAnimation === 'pulse' || settings.imageAnimation === 'slide') && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        画像アニメーション幅
                      </label>
                      <div className="space-y-1">
                        <input
                          type="range"
                          min="10"
                          max="100"
                          step="5"
                          value={settings.imageAnimationAmplitude || 50}
                          onChange={(e) => onChange({ imageAnimationAmplitude: parseInt(e.target.value) })}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #9333ea 0%, #9333ea ${((settings.imageAnimationAmplitude || 50) - 10) / 90 * 100}%, #e5e7eb ${((settings.imageAnimationAmplitude || 50) - 10) / 90 * 100}%, #e5e7eb 100%)`
                          }}
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>小さく</span>
                          <span className="text-purple-600 font-medium">{settings.imageAnimationAmplitude || 50}%</span>
                          <span>大きく</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ノート */}
      {settings.animation !== 'none' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>注意:</strong> アニメーション付きアイコンはGIF形式でエクスポートされます。
            ファイルサイズが128KBを超える場合は自動的に最適化されます。
          </p>
        </div>
      )}
    </div>
  )
}

export default IconEditor