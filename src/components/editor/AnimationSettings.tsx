import { useState, useRef, useEffect, Suspense, lazy } from 'react'
import { CANVAS_CONFIG } from '../../constants/canvasConstants'
import { AnimationSettingsProps } from '../../types/settings'
import { useDebounce } from '../../hooks/useDebounce'
import { useLanguage } from '../../contexts/LanguageContext'

const ColorPickerPortal = lazy(() => import('../ColorPickerPortal'))

// 色の明度を計算する関数
const getLuminance = (hex: string) => {
  const rgb = parseInt(hex.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  
  // 相対輝度の計算（WCAG準拠）
  const [rs, gs, bs] = [r, g, b].map(c => {
    const sRGB = c / 255;
    return sRGB <= 0.03928
      ? sRGB / 12.92
      : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

// コントラスト比を計算する関数
const getContrastRatio = (color1: string, color2: string) => {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
};

// 文字色に対して見やすい背景色を選択する関数
const getContrastingBackgroundColor = (fontColor: string) => {
  // 候補となる背景色（パステルカラーと濃い色の両方を用意）
  const backgroundCandidates = [
    // パステルカラー（明るい背景）
    '#FFF5F5', '#FFF0F6', '#FFFBEB', '#F0FDF4', '#F0F9FF', 
    '#EDE9FE', '#FEF3C7', '#E0E7FF', '#DBEAFE', '#FEE2E2',
    // 中間色
    '#FFE4E6', '#FECACA', '#FED7AA', '#FDE68A', '#D9F99D',
    '#BBF7D0', '#A7F3D0', '#99F6E4', '#BFDBFE', '#DDD6FE',
    // 濃い色（暗い背景）
    '#1F2937', '#374151', '#4B5563', '#6B7280', '#111827',
    '#1E293B', '#334155', '#475569', '#64748B', '#0F172A'
  ];
  
  // 各候補色とのコントラスト比を計算し、最適な色を選択
  let bestColor = backgroundCandidates[0];
  let bestScore = 0;
  
  for (const bgColor of backgroundCandidates) {
    const contrastRatio = getContrastRatio(fontColor, bgColor);
    // コントラスト比が4.5以上7以下が最適（読みやすく、かつ柔らかい印象）
    // 4.5未満は読みづらく、7以上は強すぎる
    let score = 0;
    if (contrastRatio >= 4.5 && contrastRatio <= 7) {
      score = 10; // 最適範囲
    } else if (contrastRatio >= 3 && contrastRatio < 4.5) {
      score = 7; // 許容範囲
    } else if (contrastRatio > 7 && contrastRatio <= 10) {
      score = 8; // やや強いが許容
    } else if (contrastRatio > 10) {
      score = 5; // 強すぎる
    } else {
      score = 1; // 弱すぎる
    }
    
    // ランダム性を加味（同じスコアの場合に変化をつける）
    score += Math.random() * 0.5;
    
    if (score > bestScore) {
      bestScore = score;
      bestColor = bgColor;
    }
  }
  
  return bestColor;
};

function AnimationSettings({ settings, onChange, isMobile }: AnimationSettingsProps) {
  const { t } = useLanguage();
  const [showSecondaryColorPicker, setShowSecondaryColorPicker] = useState(false)
  const secondaryColorButtonRef = useRef(null)
  
  // アニメーション幅のローカル状態
  const [localAnimationAmplitude, setLocalAnimationAmplitude] = useState(settings.animationAmplitude || 50)

  // アニメーション速度のローカル状態
  const [localAnimationSpeed, setLocalAnimationSpeed] = useState(settings.animationSpeed || 33)

  // settingsのanimationAmplitudeが外部から変更された場合の同期
  useEffect(() => {
    setLocalAnimationAmplitude(settings.animationAmplitude || 50)
  }, [settings.animationAmplitude])

  // settingsのanimationSpeedが外部から変更された場合の同期
  useEffect(() => {
    setLocalAnimationSpeed(settings.animationSpeed || 33)
  }, [settings.animationSpeed])

  const debouncedAmplitudeChange = useDebounce((value) => {
    onChange({ animationAmplitude: value })
  }, 300)
  
  const handleAmplitudeChange = (value) => {
    setLocalAnimationAmplitude(value)
    debouncedAmplitudeChange(value)
  }

  const debouncedSpeedChange = useDebounce((value) => {
    onChange({ animationSpeed: value })
  }, 300)
  
  const handleSpeedChange = (value) => {
    setLocalAnimationSpeed(value)
    debouncedSpeedChange(value)
  }


  const animations = [
    { value: 'none', label: t('editor.animation.types.none'), description: t('editor.animation.descriptions.none') },
    { value: 'rainbow', label: t('editor.animation.types.rainbow'), description: t('editor.animation.descriptions.rainbow') },
    { value: 'blink', label: t('editor.animation.types.blink'), description: t('editor.animation.descriptions.blink') },
    { value: 'rotate', label: t('editor.animation.types.rotate'), description: t('editor.animation.descriptions.rotate') },
    { value: 'bounce', label: t('editor.animation.types.bounce'), description: t('editor.animation.descriptions.bounce') },
    { value: 'pulse', label: t('editor.animation.types.pulse'), description: t('editor.animation.descriptions.pulse') },
    { value: 'glow', label: t('editor.animation.types.glow'), description: t('editor.animation.descriptions.glow') },
    { value: 'slide', label: t('editor.animation.types.slide'), description: t('editor.animation.descriptions.slide') },
    { value: 'fade', label: t('editor.animation.types.fade'), description: t('editor.animation.descriptions.fade') },
    { value: 'confetti', label: t('editor.animation.types.confetti'), description: t('editor.animation.descriptions.confetti') },
    { value: 'confetti-cannon', label: t('editor.animation.types.confettiCannon'), description: t('editor.animation.descriptions.confettiCannon') },
    { value: 'stars', label: t('editor.animation.types.stars'), description: t('editor.animation.descriptions.stars') },
    { value: 'snow', label: t('editor.animation.types.snow'), description: t('editor.animation.descriptions.snow') },
  ]

  return (
    <div className="space-y-6">
      {/* アニメーション選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {t('editor.animation.effect')}
        </label>
        <div className={`grid ${isMobile ? 'grid-cols-3 gap-1.5' : 'grid-cols-1 lg:grid-cols-3 gap-3'}`}>
          {animations.map((anim) => (
            <button
              key={anim.value}
              onClick={() => {
                // アニメーションが「なし」以外を選択し、背景色が透明の場合のみ、文字色に対して見やすい背景色を設定
                const needsBackgroundColor = anim.value !== 'none' && settings.backgroundType === 'transparent';
                const backgroundUpdates = needsBackgroundColor ? {
                  backgroundType: 'solid' as const,
                  backgroundColor: getContrastingBackgroundColor(settings.fontColor)
                } : {};
                
                // 紙吹雪系アニメーションの場合、適切な速度も一緒に設定
                if (anim.value === 'confetti') {
                  onChange({ 
                    animation: anim.value,
                    animationSpeed: 70, // ゆっくり落ちる（値が大きいほど遅い）
                    ...backgroundUpdates
                  });
                } else if (anim.value === 'confetti-cannon') {
                  onChange({ 
                    animation: anim.value,
                    animationSpeed: 60, // 発射サイクルが適切に見える速度（値が大きいほど遅い）
                    ...backgroundUpdates
                  });
                } else if (anim.value === 'stars') {
                  onChange({ 
                    animation: anim.value,
                    animationSpeed: 65, // 星がゆっくりキラキラ舞う速度
                    ...backgroundUpdates
                  });
                } else if (anim.value === 'snow') {
                  onChange({ 
                    animation: anim.value,
                    animationSpeed: 75, // 雪がゆっくり舞い散る速度
                    ...backgroundUpdates
                  });
                } else {
                  onChange({ 
                    animation: anim.value,
                    ...backgroundUpdates
                  });
                }
              }}
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
                {t('editor.animation.speed')}
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
                  <span>{t('editor.animation.slow')}</span>
                  <span>{t('editor.animation.fast')}</span>
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
                  {t('editor.animation.secondaryColor')}
                </label>
                <div className="relative">
                  <button
                    ref={secondaryColorButtonRef}
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
                    <Suspense fallback={<div className="p-3 bg-gray-100 rounded" />}>
                      <ColorPickerPortal
                        color={settings.secondaryColor || '#FFD700'}
                        onChange={(color) => onChange({ secondaryColor: color })}
                        onClose={() => setShowSecondaryColorPicker(false)}
                        anchorEl={secondaryColorButtonRef.current}
                      />
                    </Suspense>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {settings.animation === 'glow' 
                    ? t('editor.animation.glowColorDescription')
                    : t('editor.animation.blinkColorDescription')}
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
            <strong>{t('editor.animation.note')}:</strong> {t('editor.animation.gifExportNote')}
            {t('editor.animation.autoOptimizeNote')}
          </p>
        </div>
      )}
    </div>
  )
}

export default AnimationSettings