import { SketchPicker } from 'react-color'
import { useState, useRef, useEffect } from 'react'

function IconEditor({ settings, onChange, isMobile }) {
  const [showFontColorPicker, setShowFontColorPicker] = useState(false)
  const [showBgColorPicker, setShowBgColorPicker] = useState(false)
  const [showSecondaryColorPicker, setShowSecondaryColorPicker] = useState(false)
  const [showGradient1Picker, setShowGradient1Picker] = useState(false)
  const [showGradient2Picker, setShowGradient2Picker] = useState(false)
  
  // アニメーション用のstate
  const [showAnimationSpeed, setShowAnimationSpeed] = useState(settings.animation !== 'none')
  const [showSecondaryColor, setShowSecondaryColor] = useState(
    settings.animation === 'glow' || settings.animation === 'blink'
  )
  
  // グラデーション設定表示用のstate
  const [showGradientSettings, setShowGradientSettings] = useState(settings.textColorType === 'gradient')
  
  // アニメーション設定が変更されたときに更新
  useEffect(() => {
    setShowAnimationSpeed(settings.animation !== 'none')
    setShowSecondaryColor(settings.animation === 'glow' || settings.animation === 'blink')
  }, [settings.animation])
  
  // 文字色タイプが変更されたときに更新
  useEffect(() => {
    setShowGradientSettings(settings.textColorType === 'gradient')
  }, [settings.textColorType])

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

  // 速度ラベルを生成
  const getSpeedLabel = (ms) => {
    const fps = Math.round(1000 / ms)
    if (ms <= 20) return '超高速'
    if (ms <= 30) return '高速'
    if (ms <= 40) return '標準'
    if (ms <= 60) return '低速'
    return '超低速'
  }
  
  // FPS計算
  const calculateFPS = (ms) => {
    return (1000 / ms).toFixed(1)
  }

  return (
    <div className="space-y-6">
      {/* テキスト入力 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          テキスト
        </label>
        <textarea
          value={settings.text}
          onChange={(e) => onChange({ text: e.target.value })}
          maxLength={30}
          rows={3}
          className="w-full px-3 py-3 md:py-2 text-base md:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono"
          placeholder="例: OK\n了解\n👍"
        />
        <div className="mt-1 flex justify-between text-xs text-gray-500">
          <span>Enterキーで改行 • 文字数に応じて自動調整</span>
          <span>{settings.text.length} / 30</span>
        </div>
      </div>

      {/* フォント選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          フォント
        </label>
        <div className={`grid ${isMobile ? 'grid-cols-3 gap-1.5' : 'grid-cols-5 gap-2'}`}>
          {fonts.map((font) => (
            <button
              key={font.value}
              onClick={() => onChange({ fontFamily: font.value })}
              className={`
                ${isMobile ? 'p-2' : 'p-3'} rounded-lg border text-center transition-all active:scale-95
                ${
                  settings.fontFamily === font.value
                    ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                    : 'border-gray-300 hover:bg-gray-50 active:bg-gray-100'
                }
              `}
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
      </div>

      {/* カラー設定 */}
      <div className="space-y-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="absolute z-10 mt-2">
                    <div
                      className="fixed inset-0"
                      onClick={() => setShowFontColorPicker(false)}
                    />
                    <SketchPicker
                      color={settings.fontColor}
                      onChange={(color) => onChange({ fontColor: color.hex })}
                    />
                  </div>
                )}
              </div>
            )}
            
            {/* グラデーション設定（アコーディオン） */}
            <div 
              className={`overflow-hidden transition-all duration-300 ease-out ${
                showGradientSettings ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
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
                      開始色: {settings.gradientColor1}
                    </span>
                  </button>
                  {showGradient1Picker && (
                    <div className="absolute z-10 mt-2">
                      <div
                        className="fixed inset-0"
                        onClick={() => setShowGradient1Picker(false)}
                      />
                      <SketchPicker
                        color={settings.gradientColor1}
                        onChange={(color) => onChange({ gradientColor1: color.hex })}
                      />
                    </div>
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
                      終了色: {settings.gradientColor2}
                    </span>
                  </button>
                  {showGradient2Picker && (
                    <div className="absolute z-10 mt-2">
                      <div
                        className="fixed inset-0"
                        onClick={() => setShowGradient2Picker(false)}
                      />
                      <SketchPicker
                        color={settings.gradientColor2}
                        onChange={(color) => onChange({ gradientColor2: color.hex })}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
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
                    <div className="absolute z-10 mt-2 right-0">
                      <div
                        className="fixed inset-0"
                        onClick={() => setShowBgColorPicker(false)}
                      />
                      <SketchPicker
                        color={settings.backgroundColor || '#FFFFFF'}
                        onChange={(color) => onChange({ backgroundColor: color.hex })}
                      />
                    </div>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg flex items-center justify-between active:bg-gray-50 text-sm"
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
                    <div className="absolute z-10 mt-2 right-0">
                      <div
                        className="fixed inset-0"
                        onClick={() => setShowBgColorPicker(false)}
                      />
                      <SketchPicker
                        color={settings.backgroundColor || '#FFFFFF'}
                        onChange={(color) => onChange({ backgroundColor: color.hex })}
                      />
                    </div>
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
        <div className={`grid ${isMobile ? 'grid-cols-3 gap-1.5' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'}`}>
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

      {/* セカンドカラー（グローと点滅のみ） */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-out ${
          showSecondaryColor ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            セカンドカラー（{settings.animation === 'glow' ? 'グロー' : '点滅'}効果用）
          </label>
          <div className="relative">
            <button
              onClick={() => setShowSecondaryColorPicker(!showSecondaryColorPicker)}
              className="w-full px-3 py-3 md:py-2 border border-gray-300 rounded-lg flex items-center justify-between active:bg-gray-50"
            >
              <span className="flex items-center">
                <span
                  className="w-6 h-6 rounded mr-2 border border-gray-300"
                  style={{ backgroundColor: settings.secondaryColor || '#FFD700' }}
                />
                {settings.secondaryColor || '#FFD700'}
              </span>
            </button>
            {showSecondaryColorPicker && (
              <div className="absolute z-10 mt-2">
                <div
                  className="fixed inset-0"
                  onClick={() => setShowSecondaryColorPicker(false)}
                />
                <SketchPicker
                  color={settings.secondaryColor || '#FFD700'}
                  onChange={(color) => onChange({ secondaryColor: color.hex })}
                />
              </div>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {settings.animation === 'glow' 
              ? 'グロー効果の光の色を設定します' 
              : '点滅時に切り替わる色を設定します'}
          </p>
        </div>
      </div>

      {/* アニメーション速度 */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-out ${
          showAnimationSpeed ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            アニメーション速度
          </label>
          {isMobile ? (
            // モバイル用シンプル版
            <div className="space-y-2">
              <input
                type="range"
                min="20"
                max="100"
                step="1"
                value={120 - settings.animationSpeed}
                onChange={(e) => {
                  const invertedValue = 120 - parseInt(e.target.value)
                  onChange({ animationSpeed: invertedValue })
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #9333ea 0%, #9333ea ${((120 - settings.animationSpeed) - 20) / 80 * 100}%, #e5e7eb ${((120 - settings.animationSpeed) - 20) / 80 * 100}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>遅い</span>
                <span>速い</span>
              </div>
            </div>
          ) : (
            // デスクトップ用詳細版
            <div className="space-y-2">
              <input
                type="range"
                min="20"
                max="100"
                step="1"
                value={120 - settings.animationSpeed}
                onChange={(e) => {
                  const invertedValue = 120 - parseInt(e.target.value)
                  onChange({ animationSpeed: invertedValue })
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #9333ea 0%, #9333ea ${((120 - settings.animationSpeed) - 20) / 80 * 100}%, #e5e7eb ${((120 - settings.animationSpeed) - 20) / 80 * 100}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>遅い</span>
                <span>速い</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ノート */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-out ${
          showAnimationSpeed ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>注意:</strong> アニメーション付きアイコンはGIF形式でエクスポートされます。
            ファイルサイズが128KBを超える場合は自動的に最適化されます。
          </p>
        </div>
      </div>
    </div>
  )
}

export default IconEditor