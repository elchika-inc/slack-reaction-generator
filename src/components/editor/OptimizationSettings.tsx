import { useState, useRef, useEffect } from 'react'
import { OptimizationSettingsProps } from '../../types/settings'
import { useSliderDebounce, useDebounce } from '../../hooks/useDebounce'

function OptimizationSettings({ settings, onChange }: OptimizationSettingsProps) {
  const debouncedOnChange = useSliderDebounce(onChange);
  
  // GIF品質のローカル状態
  const [localGifQuality, setLocalGifQuality] = useState(settings.gifQuality || 20)

  // GIFフレーム数のローカル状態
  const [localGifFrames, setLocalGifFrames] = useState(settings.gifFrames || 30)

  // settingsのgifQualityが外部から変更された場合の同期
  useEffect(() => {
    setLocalGifQuality(settings.gifQuality || 20)
  }, [settings.gifQuality])

  // settingsのgifFramesが外部から変更された場合の同期
  useEffect(() => {
    setLocalGifFrames(settings.gifFrames || 30)
  }, [settings.gifFrames])

  const debouncedGifQualityChange = useDebounce((value) => {
    onChange({ gifQuality: value })
  }, 300)
  
  const handleGifQualityChange = (value) => {
    setLocalGifQuality(value)
    debouncedGifQualityChange(value)
  }

  const debouncedGifFramesChange = useDebounce((value) => {
    onChange({ gifFrames: value })
  }, 300)
  
  const handleGifFramesChange = (value) => {
    setLocalGifFrames(value)
    debouncedGifFramesChange(value)
  }


  return (
    <div className="space-y-4">
      {/* 出力サイズ選択 */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">
          出力サイズ
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => onChange({ canvasSize: 64 })}
            className={`
              flex-1 px-3 py-2 rounded-lg border transition-colors text-sm
              ${settings.canvasSize === 64
                ? 'border-purple-500 bg-purple-50 text-purple-700 ring-2 ring-purple-200'
                : 'border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            64×64px
            <span className="block text-xs mt-1 opacity-75">
              小サイズ（〜50KB）
            </span>
          </button>
          <button
            onClick={() => onChange({ canvasSize: 128 })}
            className={`
              flex-1 px-3 py-2 rounded-lg border transition-colors text-sm
              ${settings.canvasSize === 128
                ? 'border-purple-500 bg-purple-50 text-purple-700 ring-2 ring-purple-200'
                : 'border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            128×128px
            <span className="block text-xs mt-1 opacity-75">
              標準サイズ
            </span>
          </button>
        </div>
      </div>

      {/* PNG圧縮設定 */}
      {settings.animation === 'none' && (
        <div>
          <label htmlFor="pngQuality-slider" className="block text-xs font-medium text-gray-600 mb-2">
            PNG圧縮率
          </label>
          <div className="space-y-2">
            <input
              id="pngQuality-slider"
              type="range"
              aria-label="PNG圧縮率調整"
              min="0"
              max="100"
              step="5"
              value={settings.pngQuality || 85}
              onChange={(e) => debouncedOnChange({ pngQuality: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #9333ea 0%, #9333ea ${settings.pngQuality || 85}%, #e5e7eb ${settings.pngQuality || 85}%, #e5e7eb 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>高圧縮</span>
              <span className="text-purple-600 font-medium">{settings.pngQuality || 85}%</span>
              <span>高品質</span>
            </div>
          </div>
        </div>
      )}

      {/* GIF最適化設定 */}
      {settings.animation !== 'none' && (
        <>
          <div>
            <label htmlFor="gifQuality-slider" className="block text-xs font-medium text-gray-600 mb-2">
              GIF品質
            </label>
            <div className="space-y-2">
              <input
                id="gifQuality-slider"
                type="range"
                aria-label="GIF品質調整"
                min="1"
                max="30"
                step="1"
                value={31 - (localGifQuality || 20)}
                onChange={(e) => handleGifQualityChange(31 - parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #9333ea 0%, #9333ea ${((31 - (localGifQuality || 20)) - 1) / 29 * 100}%, #e5e7eb ${((31 - (localGifQuality || 20)) - 1) / 29 * 100}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>低品質</span>
                <span className="text-purple-600 font-medium">
                  {localGifQuality <= 10 ? '高' : localGifQuality <= 20 ? '中' : '低'}
                </span>
                <span>高品質</span>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="gifFrames-slider" className="block text-xs font-medium text-gray-600 mb-2">
              GIFフレーム数
            </label>
            <div className="space-y-2">
              <input
                id="gifFrames-slider"
                type="range"
                aria-label="GIFフレーム数調整"
                min="5"
                max="30"
                step="5"
                value={localGifFrames || 30}
                onChange={(e) => handleGifFramesChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #9333ea 0%, #9333ea ${((localGifFrames || 30) - 5) / 25 * 100}%, #e5e7eb ${((localGifFrames || 30) - 5) / 25 * 100}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>少ない</span>
                <span className="text-purple-600 font-medium">{localGifFrames || 30}フレーム</span>
                <span>多い</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* サイズ最適化のヒント */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          <strong>ヒント:</strong> Slackの128KB制限に収めるには：
          {settings.canvasSize === 128 ? (
            <span className="block mt-1">• 64×64pxに変更すると約75%サイズ削減</span>
          ) : (
            <span className="block mt-1">• 現在の64×64px設定で大幅にサイズ削減中</span>
          )}
          {settings.animation !== 'none' && (
            <>
              <span className="block">• GIF品質を「低」にすると約50%削減</span>
              <span className="block">• フレーム数を減らすとさらに削減</span>
            </>
          )}
        </p>
      </div>
    </div>
  )
}

export default OptimizationSettings