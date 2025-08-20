import { useState, useRef, Suspense, lazy } from 'react'

const ColorPickerPortal = lazy(() => import('../ColorPickerPortal'))

function BasicSettings({ settings, onChange, isMobile }) {
  const [showFontColorPicker, setShowFontColorPicker] = useState(false)
  const [showGradient1Picker, setShowGradient1Picker] = useState(false)
  const [showGradient2Picker, setShowGradient2Picker] = useState(false)
  const [showBgColorPicker, setShowBgColorPicker] = useState(false)
  
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 })
  const fontColorButtonRef = useRef(null)
  const gradient1ButtonRef = useRef(null)
  const gradient2ButtonRef = useRef(null)
  const bgColorButtonRef = useRef(null)

  const fonts = [
    // 日本語フォント
    { value: '"Noto Sans JP", sans-serif', label: 'Noto Sans', hasJapanese: true, hasEnglish: true },
    { value: '"Noto Serif JP", serif', label: 'Noto Serif', hasJapanese: true, hasEnglish: true },
    { value: '"Kosugi Maru", sans-serif', label: '小杉丸', hasJapanese: true, hasEnglish: false },
    
    // 装飾的フォント
    { value: '"Pacifico", cursive', label: 'Pacifico', hasJapanese: false, hasEnglish: true },
    { value: '"Caveat", cursive', label: 'Caveat', hasJapanese: false, hasEnglish: true },
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
                ${isMobile ? 'p-2' : 'p-3'} rounded-lg border text-center transition-scale transition-gpu active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500
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
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 文字色設定 */}
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
                ref={fontColorButtonRef}
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
                <Suspense fallback={<div className="p-3 bg-gray-100 rounded" />}>
                  <ColorPickerPortal
                    color={settings.fontColor}
                    onChange={(color) => onChange({ fontColor: color })}
                    onClose={() => setShowFontColorPicker(false)}
                    anchorEl={fontColorButtonRef.current}
                  />
                </Suspense>
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
                  ref={gradient1ButtonRef}
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
                  <Suspense fallback={<div className="p-3 bg-gray-100 rounded" />}>
                    <ColorPickerPortal
                      color={settings.gradientColor1}
                      onChange={(color) => onChange({ gradientColor1: color })}
                      onClose={() => setShowGradient1Picker(false)}
                      anchorEl={gradient1ButtonRef.current}
                    />
                  </Suspense>
                )}
              </div>
              
              {/* グラデーション色2 */}
              <div className="relative">
                <button
                  ref={gradient2ButtonRef}
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
                  <Suspense fallback={<div className="p-3 bg-gray-100 rounded" />}>
                    <ColorPickerPortal
                      color={settings.gradientColor2}
                      onChange={(color) => onChange({ gradientColor2: color })}
                      onClose={() => setShowGradient2Picker(false)}
                      anchorEl={gradient2ButtonRef.current}
                    />
                  </Suspense>
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
                    ref={bgColorButtonRef}
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
                    <Suspense fallback={<div className="p-3 bg-gray-100 rounded" />}>
                      <ColorPickerPortal
                        color={settings.backgroundColor || '#FFFFFF'}
                        onChange={(color) => onChange({ backgroundColor: color })}
                        onClose={() => setShowBgColorPicker(false)}
                        anchorEl={bgColorButtonRef.current}
                      />
                    </Suspense>
                  )}
                </div>
              </div>
            )}
          
            {/* アニメーション時のみ背景色選択 */}
            {settings.animation !== 'none' && (
              <div>
                <div className="relative">
                  <button
                    ref={bgColorButtonRef}
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
                    <Suspense fallback={<div className="p-3 bg-gray-100 rounded" />}>
                      <ColorPickerPortal
                        color={settings.backgroundColor || '#FFFFFF'}
                        onChange={(color) => onChange({ backgroundColor: color })}
                        onClose={() => setShowBgColorPicker(false)}
                        anchorEl={bgColorButtonRef.current}
                      />
                    </Suspense>
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
    </div>
  )
}

export default BasicSettings