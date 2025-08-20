import { useState, useRef, useEffect, Suspense, lazy } from 'react'
import { CANVAS_CONFIG } from '../../constants/canvasConstants'

const ColorPicker = lazy(() => import('../ColorPicker'))

function AnimationSettings({ settings, onChange, isMobile }) {
  const [showSecondaryColorPicker, setShowSecondaryColorPicker] = useState(false)
  
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
    setLocalAnimationAmplitude(value)
    
    if (amplitudeTimeoutRef.current) {
      clearTimeout(amplitudeTimeoutRef.current)
    }
    
    amplitudeTimeoutRef.current = setTimeout(() => {
      onChange({ animationAmplitude: value })
    }, 300)
  }

  const handleSpeedChange = (value) => {
    setLocalAnimationSpeed(value)
    
    if (speedTimeoutRef.current) {
      clearTimeout(speedTimeoutRef.current)
    }
    
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
      {/* アニメーション選択 */}
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
                ${isMobile ? 'py-2 px-1' : 'p-3'} rounded-lg border ${isMobile ? 'text-center' : 'text-left'} transition-scale transition-gpu active:scale-95
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
          <div className={`${!isMobile && ((settings.animation === 'bounce' || settings.animation === 'pulse' || settings.animation === 'slide') || (settings.animation === 'glow' || settings.animation === 'blink')) ? 'grid grid-cols-2 gap-4' : ''}`}>
            {/* アニメーション速度 */}
            <div>
              <label htmlFor="animationSpeed-slider" className="block text-sm font-medium text-gray-700 mb-3">
                アニメーション速度
              </label>
              <div className="space-y-2">
                <input
                  id="animationSpeed-slider"
                  type="range"
                  aria-label="アニメーション速度調整"
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

            {/* アニメーション幅制御 */}
            {(settings.animation === 'bounce' || settings.animation === 'pulse' || settings.animation === 'slide') && (
              <div>
                <label htmlFor="animationAmplitude-slider" className="block text-sm font-medium text-gray-700 mb-3">
                  アニメーション幅
                </label>
                <div className="space-y-2">
                  <input
                    id="animationAmplitude-slider"
                    type="range"
                    aria-label="アニメーション幅調整"
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

            {/* セカンドカラー */}
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
                      <div className="fixed inset-0 z-40" onClick={() => setShowSecondaryColorPicker(false)} />
                      <div className="absolute z-50 mt-2 left-0">
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

export default AnimationSettings