import { useState, useRef, Suspense, lazy } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { FlatSettings } from '../../../types/settings';

const ColorPickerPortal = lazy(() => import('../../ColorPickerPortal'));

interface ColorControlsProps {
  settings: FlatSettings;
  onChange: <K extends keyof FlatSettings>(key: K, value: FlatSettings[K]) => void;
  isMobile: boolean;
}

export function ColorControls({ settings, onChange, isMobile }: ColorControlsProps) {
  const { t } = useLanguage();
  const [showFontColorPicker, setShowFontColorPicker] = useState(false);
  const [showGradient1Picker, setShowGradient1Picker] = useState(false);
  const [showGradient2Picker, setShowGradient2Picker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });
  const fontColorButtonRef = useRef<HTMLButtonElement>(null);
  const gradient1ButtonRef = useRef<HTMLButtonElement>(null);
  const gradient2ButtonRef = useRef<HTMLButtonElement>(null);
  const bgColorButtonRef = useRef<HTMLButtonElement>(null);

  const handleColorPickerOpen = (buttonRef: React.RefObject<HTMLButtonElement>, setter: (show: boolean) => void) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const pickerHeight = 300;
      
      let top = rect.bottom + 8;
      if (top + pickerHeight > viewportHeight) {
        top = rect.top - pickerHeight - 8;
      }
      
      const left = Math.max(10, Math.min(rect.left, window.innerWidth - 250));
      
      setPickerPosition({ top, left });
      setter(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* テキストカラータイプ選択 */}
      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 mb-3">
          {t('editor.basic.textColorType')}
        </legend>
        <div className="flex space-x-3" role="radiogroup">
          <button
            onClick={() => onChange('textColorType', 'solid')}
            className={`
              flex-1 py-2.5 px-4 rounded-lg border font-medium transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1
              ${settings.textColorType === 'solid'
                ? 'border-purple-500 bg-purple-50 text-purple-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }
            `}
            role="radio"
            aria-checked={settings.textColorType === 'solid'}
          >
            {t('editor.basic.solidColor')}
          </button>
          <button
            onClick={() => onChange('textColorType', 'gradient')}
            className={`
              flex-1 py-2.5 px-4 rounded-lg border font-medium transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1
              ${settings.textColorType === 'gradient'
                ? 'border-purple-500 bg-purple-50 text-purple-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }
            `}
            role="radio"
            aria-checked={settings.textColorType === 'gradient'}
          >
            {t('editor.basic.gradient')}
          </button>
        </div>
      </fieldset>

      {/* 色選択コントロール */}
      {settings.textColorType === 'solid' ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('editor.basic.textColor')}
          </label>
          <button
            ref={fontColorButtonRef}
            onClick={() => handleColorPickerOpen(fontColorButtonRef, setShowFontColorPicker)}
            className="color-picker-button"
            aria-label={t('editor.basic.selectTextColor')}
            aria-expanded={showFontColorPicker}
          >
            <div
              className="w-full h-10 rounded-md border border-gray-300"
              style={{ backgroundColor: settings.fontColor }}
            />
            <span className="mt-1 text-xs text-gray-600">{settings.fontColor}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('editor.basic.gradientDirection')}
            </label>
            <select
              value={settings.gradientDirection}
              onChange={(e) => onChange('gradientDirection', e.target.value as 'horizontal' | 'vertical' | 'diagonal')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="horizontal">{t('editor.basic.horizontal')}</option>
              <option value="vertical">{t('editor.basic.vertical')}</option>
              <option value="diagonal">{t('editor.basic.diagonal')}</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('editor.basic.startColor')}
              </label>
              <button
                ref={gradient1ButtonRef}
                onClick={() => handleColorPickerOpen(gradient1ButtonRef, setShowGradient1Picker)}
                className="color-picker-button w-full"
                aria-label={t('editor.basic.selectStartColor')}
                aria-expanded={showGradient1Picker}
              >
                <div
                  className="w-full h-10 rounded-md border border-gray-300"
                  style={{ backgroundColor: settings.gradientColor1 }}
                />
                <span className="mt-1 text-xs text-gray-600">{settings.gradientColor1}</span>
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('editor.basic.endColor')}
              </label>
              <button
                ref={gradient2ButtonRef}
                onClick={() => handleColorPickerOpen(gradient2ButtonRef, setShowGradient2Picker)}
                className="color-picker-button w-full"
                aria-label={t('editor.basic.selectEndColor')}
                aria-expanded={showGradient2Picker}
              >
                <div
                  className="w-full h-10 rounded-md border border-gray-300"
                  style={{ backgroundColor: settings.gradientColor2 }}
                />
                <span className="mt-1 text-xs text-gray-600">{settings.gradientColor2}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 背景設定 */}
      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 mb-3">
          {t('editor.basic.backgroundType')}
        </legend>
        <div className="flex space-x-3" role="radiogroup">
          <button
            onClick={() => onChange('backgroundType', 'transparent')}
            className={`
              flex-1 py-2.5 px-4 rounded-lg border font-medium transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1
              ${settings.backgroundType === 'transparent'
                ? 'border-purple-500 bg-purple-50 text-purple-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }
            `}
            role="radio"
            aria-checked={settings.backgroundType === 'transparent'}
          >
            {t('editor.basic.transparent')}
          </button>
          <button
            onClick={() => onChange('backgroundType', 'solid')}
            className={`
              flex-1 py-2.5 px-4 rounded-lg border font-medium transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1
              ${settings.backgroundType === 'solid'
                ? 'border-purple-500 bg-purple-50 text-purple-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }
            `}
            role="radio"
            aria-checked={settings.backgroundType === 'solid'}
          >
            {t('editor.basic.solidColor')}
          </button>
        </div>
      </fieldset>

      {settings.backgroundType === 'solid' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('editor.basic.backgroundColor')}
          </label>
          <button
            ref={bgColorButtonRef}
            onClick={() => handleColorPickerOpen(bgColorButtonRef, setShowBgColorPicker)}
            className="color-picker-button"
            aria-label={t('editor.basic.selectBackgroundColor')}
            aria-expanded={showBgColorPicker}
          >
            <div
              className="w-full h-10 rounded-md border border-gray-300"
              style={{ backgroundColor: settings.backgroundColor }}
            />
            <span className="mt-1 text-xs text-gray-600">{settings.backgroundColor}</span>
          </button>
        </div>
      )}

      {/* カラーピッカーポータル */}
      <Suspense fallback={null}>
        {showFontColorPicker && (
          <ColorPickerPortal
            color={settings.fontColor}
            onChange={(color) => onChange('fontColor', color)}
            onClose={() => setShowFontColorPicker(false)}
            position={pickerPosition}
          />
        )}
        {showGradient1Picker && (
          <ColorPickerPortal
            color={settings.gradientColor1}
            onChange={(color) => onChange('gradientColor1', color)}
            onClose={() => setShowGradient1Picker(false)}
            position={pickerPosition}
          />
        )}
        {showGradient2Picker && (
          <ColorPickerPortal
            color={settings.gradientColor2}
            onChange={(color) => onChange('gradientColor2', color)}
            onClose={() => setShowGradient2Picker(false)}
            position={pickerPosition}
          />
        )}
        {showBgColorPicker && (
          <ColorPickerPortal
            color={settings.backgroundColor}
            onChange={(color) => onChange('backgroundColor', color)}
            onClose={() => setShowBgColorPicker(false)}
            position={pickerPosition}
          />
        )}
      </Suspense>
    </div>
  );
}