import { useState, useRef, useEffect } from 'react'
import { OptimizationSettingsProps } from '../../types/settings'
import { useSliderDebounce, useDebounce } from '../../hooks/useDebounce'
import { useLanguage } from '../../contexts/LanguageContext'

function OptimizationSettings({ settings, onChange }: OptimizationSettingsProps) {
  const { t } = useLanguage();
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
          {t('editor.optimization.outputSize')}
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
              {t('editor.optimization.smallSize')}
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
              {t('editor.optimization.standardSize')}
            </span>
          </button>
        </div>
      </div>

      {/* PNG圧縮設定 */}
      {settings.animation === 'none' && (
        <div>
          <label htmlFor="pngQuality-slider" className="block text-xs font-medium text-gray-600 mb-2">
            {t('editor.optimization.pngCompression')}
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
              <span>{t('editor.optimization.highCompression')}</span>
              <span className="text-purple-600 font-medium">{settings.pngQuality || 85}%</span>
              <span>{t('editor.optimization.highQuality')}</span>
            </div>
          </div>
        </div>
      )}

      {/* GIF最適化設定 */}
      {settings.animation !== 'none' && (
        <>
          <div>
            <label htmlFor="gifQuality-slider" className="block text-xs font-medium text-gray-600 mb-2">
              {t('editor.optimization.gifQuality')}
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
                <span>{t('editor.optimization.lowQuality')}</span>
                <span className="text-purple-600 font-medium">
                  {localGifQuality <= 10 ? t('editor.optimization.high') : localGifQuality <= 20 ? t('editor.optimization.medium') : t('editor.optimization.low')}
                </span>
                <span>{t('editor.optimization.highQuality')}</span>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="gifFrames-slider" className="block text-xs font-medium text-gray-600 mb-2">
              {t('editor.optimization.gifFrames')}
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
                <span>{t('editor.optimization.fewFrames')}</span>
                <span className="text-purple-600 font-medium">{localGifFrames || 30} {t('editor.optimization.frames')}</span>
                <span>{t('editor.optimization.manyFrames')}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* サイズ最適化のヒント */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          <strong>{t('editor.optimization.hint')}:</strong> {t('editor.optimization.slackSizeLimit')}
          {settings.canvasSize === 128 ? (
            <span className="block mt-1">• {t('editor.optimization.changeToSmallSize')}</span>
          ) : (
            <span className="block mt-1">• {t('editor.optimization.currentSmallSize')}</span>
          )}
          {settings.animation !== 'none' && (
            <>
              <span className="block">• {t('editor.optimization.lowerGifQuality')}</span>
              <span className="block">• {t('editor.optimization.reduceFrames')}</span>
            </>
          )}
        </p>
      </div>
    </div>
  )
}

export default OptimizationSettings