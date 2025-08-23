import { useLanguage } from '../../../contexts/LanguageContext';

interface Font {
  value: string;
  label: string;
  hasJapanese: boolean;
  hasEnglish: boolean;
}

interface FontSelectorProps {
  fontFamily: string;
  onChange: (fontFamily: string) => void;
  isMobile: boolean;
}

const AVAILABLE_FONTS: Font[] = [
  // 日本語フォント
  { value: '"Noto Sans JP", sans-serif', label: 'Noto Sans', hasJapanese: true, hasEnglish: true },
  { value: '"Noto Serif JP", serif', label: 'Noto Serif', hasJapanese: true, hasEnglish: true },
  { value: '"Kosugi Maru", sans-serif', label: '小杉丸', hasJapanese: true, hasEnglish: false },
  
  // 装飾的フォント
  { value: '"Pacifico", cursive', label: 'Pacifico', hasJapanese: false, hasEnglish: true },
  { value: '"Caveat", cursive', label: 'Caveat', hasJapanese: false, hasEnglish: true },
];

export function FontSelector({ fontFamily, onChange, isMobile }: FontSelectorProps) {
  const { t, locale } = useLanguage();

  const visibleFonts = AVAILABLE_FONTS.filter(font => locale === 'ja' || font.hasEnglish);

  return (
    <fieldset>
      <legend className="block text-sm font-medium text-gray-700 mb-3">
        {t('editor.basic.fontFamily')}
      </legend>
      <div className={`grid ${isMobile ? 'grid-cols-3 gap-1.5' : 'grid-cols-5 gap-2'}`} role="radiogroup" aria-label="フォントファミリー選択">
        {visibleFonts.map((font) => (
          <button
            key={font.value}
            onClick={() => onChange(font.value)}
            className={`
              ${isMobile ? 'p-2' : 'p-3'} rounded-lg border text-center transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1
              ${
                fontFamily === font.value
                  ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                  : 'border-gray-300 hover:bg-gray-50 focus:bg-gray-50 active:bg-gray-100'
              }
            `}
            role="radio"
            aria-checked={fontFamily === font.value}
            aria-label={`${font.label}${font.hasJapanese ? ` ${t('editor.basic.fontSupportsJapanese')}` : ''}${font.hasEnglish ? ` ${t('editor.basic.fontSupportsEnglish')}` : ''}`}
          >
            <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-600 mb-1`}>{font.label}</div>
            <div 
              className={`${isMobile ? 'text-sm' : 'text-base'} font-bold`}
              style={{ fontFamily: font.value, lineHeight: '1.2' }}
            >
              {locale === 'en' ? (
                font.hasEnglish && <div>Sample</div>
              ) : (
                <>
                  {font.hasJapanese && <div>あア</div>}
                  {font.hasEnglish && <div>Aa</div>}
                </>
              )}
            </div>
          </button>
        ))}
      </div>
    </fieldset>
  );
}