import { preloadImage } from '../../utils/imageCache'

function ImageSettings({ settings, onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          画像を追加
        </label>
        <div className="space-y-3">
          {/* 画像アップロード */}
          <div className="flex gap-2">
            <div className="relative flex-1">
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
            
            {/* 削除ボタン */}
            {settings.imageData && (
              <button
                onClick={() => onChange({ imageData: null })}
                className="px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium border border-red-200"
                title="画像を削除"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
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
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-scale transition-gpu active:scale-95 flex items-center justify-center gap-2 ${
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
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-scale transition-gpu active:scale-95 flex items-center justify-center gap-2 ${
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


              {/* 位置調整 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="imageX-slider" className="block text-xs font-medium text-gray-600 mb-1">
                    横位置
                  </label>
                  <div className="space-y-1">
                    <input
                      id="imageX-slider"
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={settings.imageX || 50}
                      onChange={(e) => onChange({ imageX: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      aria-label="画像の横位置調整"
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
                  <label htmlFor="imageY-slider" className="block text-xs font-medium text-gray-600 mb-1">
                    縦位置
                  </label>
                  <div className="space-y-1">
                    <input
                      id="imageY-slider"
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={settings.imageY || 50}
                      onChange={(e) => onChange({ imageY: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      aria-label="画像の縦位置調整"
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
                  <label htmlFor="imageSize-slider" className="block text-xs font-medium text-gray-600 mb-1">
                    サイズ
                  </label>
                  <div className="space-y-1">
                    <input
                      id="imageSize-slider"
                      type="range"
                      min="10"
                      max="150"
                      step="5"
                      value={settings.imageSize || 50}
                      onChange={(e) => onChange({ imageSize: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      aria-label="画像サイズ調整"
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
                  <label htmlFor="imageOpacity-slider" className="block text-xs font-medium text-gray-600 mb-1">
                    透過度
                  </label>
                  <div className="space-y-1">
                    <input
                      id="imageOpacity-slider"
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={settings.imageOpacity || 100}
                      onChange={(e) => onChange({ imageOpacity: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      aria-label="画像透過度調整"
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
                        className={`py-2 px-1 rounded-lg border text-xs transition-scale transition-gpu active:scale-95 ${
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

                {/* 画像アニメーション幅 */}
                {settings.imageAnimation !== 'none' && (settings.imageAnimation === 'bounce' || settings.imageAnimation === 'pulse' || settings.imageAnimation === 'slide') && (
                  <div>
                    <label htmlFor="imageAnimationAmplitude-slider" className="block text-xs font-medium text-gray-600 mb-1">
                      画像アニメーション幅
                    </label>
                    <div className="space-y-1">
                      <input
                        id="imageAnimationAmplitude-slider"
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={settings.imageAnimationAmplitude || 50}
                        onChange={(e) => onChange({ imageAnimationAmplitude: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        aria-label="画像アニメーション幅調整"
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
  )
}

export default ImageSettings