import { FunctionalComponent } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { useLanguage } from '../contexts/LanguageContext';
import { Locale, supportedLocales } from '../i18n';

const LanguageSwitcher: FunctionalComponent = () => {
  const { locale, setLocale, t } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLanguageChange = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    setLocale(target.value as Locale);
  };

  const getLanguageDisplayName = (lang: Locale): string => {
    if (isMobile) {
      return lang === 'ja' ? 'JP' : 'EN';
    }
    return t(`language.${lang === 'ja' ? 'japanese' : 'english'}`);
  };

  return (
    <div className="relative">
      <select
        value={locale}
        onChange={handleLanguageChange}
        className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 transition-colors cursor-pointer"
        aria-label={t('language.select')}
      >
        {supportedLocales.map((lang) => (
          <option key={lang} value={lang}>
            {getLanguageDisplayName(lang)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSwitcher;