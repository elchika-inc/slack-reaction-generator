import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FlatSettings, createDefaultSettings, flattenSettings } from '../types/settings';
import { Locale, defaultLocale, t as translate } from '../i18n';

// アプリケーション全体の状態を管理する統合Context
interface AppContextValue {
  // 設定関連
  iconSettings: FlatSettings;
  updateIconSetting: <K extends keyof FlatSettings>(key: K, value: FlatSettings[K]) => void;
  resetSettings: () => void;
  
  // 言語関連
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  
  // UIステート関連
  isMobile: boolean;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  
  // Canvas関連
  canvasRef: React.RefObject<HTMLCanvasElement> | null;
  setCanvasRef: (ref: React.RefObject<HTMLCanvasElement>) => void;
  isCanvasReady: boolean;
  setIsCanvasReady: (ready: boolean) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  // 設定状態
  const [iconSettings, setIconSettings] = useState<FlatSettings>(() => {
    const savedLocale = localStorage.getItem('preferred-locale') as Locale || defaultLocale;
    return flattenSettings(createDefaultSettings(savedLocale));
  });
  
  // 言語状態
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem('preferred-locale');
    return (saved as Locale) || defaultLocale;
  });
  
  // UIステート
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('preferred-theme');
    return (saved as 'light' | 'dark') || 'light';
  });
  
  // Canvas状態
  const [canvasRef, setCanvasRef] = useState<React.RefObject<HTMLCanvasElement> | null>(null);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  
  // レスポンシブ対応
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // 言語変更時の処理
  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('preferred-locale', newLocale);
    
    // デフォルトテキストを新しい言語に更新
    const defaultSettings = flattenSettings(createDefaultSettings(newLocale));
    setIconSettings(prev => ({
      ...prev,
      text: defaultSettings.text
    }));
  };
  
  // テーマ変更時の処理
  const handleSetTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('preferred-theme', newTheme);
  };
  
  // 設定更新関数
  const updateIconSetting = <K extends keyof FlatSettings>(key: K, value: FlatSettings[K]) => {
    setIconSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // 設定リセット関数
  const resetSettings = () => {
    setIconSettings(flattenSettings(createDefaultSettings(locale)));
  };
  
  // 翻訳関数
  const t = (key: string, params?: Record<string, string | number>) => {
    return translate(key, locale, params);
  };
  
  const value: AppContextValue = {
    // 設定
    iconSettings,
    updateIconSetting,
    resetSettings,
    
    // 言語
    locale,
    setLocale,
    t,
    
    // UIステート
    isMobile,
    isLoading,
    setIsLoading,
    theme,
    setTheme: handleSetTheme,
    
    // Canvas
    canvasRef,
    setCanvasRef,
    isCanvasReady,
    setIsCanvasReady
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}

// 個別のフック（移行期間の下位互換性のため）
export function useIconSettings() {
  const { iconSettings, updateIconSetting, resetSettings } = useAppContext();
  return { iconSettings, updateIconSetting, resetSettings };
}

export function useLanguage() {
  const { locale, setLocale, t } = useAppContext();
  return { locale, setLocale, t };
}

export function useUIState() {
  const { isMobile, isLoading, setIsLoading, theme, setTheme } = useAppContext();
  return { isMobile, isLoading, setIsLoading, theme, setTheme };
}

export function useCanvas() {
  const { canvasRef, setCanvasRef, isCanvasReady, setIsCanvasReady } = useAppContext();
  return { canvasRef, setCanvasRef, isCanvasReady, setIsCanvasReady };
}