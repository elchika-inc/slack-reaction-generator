import { createContext } from 'preact';
import { useContext, useState, useEffect } from 'preact/hooks';
import { ComponentChildren } from 'preact';
import { Locale, defaultLocale, supportedLocales, locales, getNestedValue } from '../i18n';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, any>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ComponentChildren;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    // ローカルストレージから言語設定を読み込み
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && supportedLocales.includes(savedLocale)) {
      return savedLocale;
    }
    
    // ブラウザの言語設定を確認
    const browserLang = navigator.language.slice(0, 2) as Locale;
    if (supportedLocales.includes(browserLang)) {
      return browserLang;
    }
    
    return defaultLocale;
  });

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  const t = (key: string, params?: Record<string, any>): string => {
    const translations = locales[locale] || locales[defaultLocale];
    let result = getNestedValue(translations, key);
    
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        result = result.replace(new RegExp(`{${paramKey}}`, 'g'), String(value));
      });
    }
    
    return result;
  };

  useEffect(() => {
    // HTMLのlang属性を更新
    document.documentElement.lang = locale;
  }, [locale]);

  const value: LanguageContextType = {
    locale,
    setLocale,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}