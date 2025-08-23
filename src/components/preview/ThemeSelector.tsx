import { useLanguage } from '../../contexts/LanguageContext';

export interface ThemeSelectorProps {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

export function ThemeSelector({ theme, onThemeChange }: ThemeSelectorProps) {
  const { t } = useLanguage();

  return (
    <div className="flex justify-center mb-4">
      <div 
        className="inline-flex rounded-lg border border-gray-200" 
        role="radiogroup" 
        aria-label={t('preview.themeSelect')}
      >
        <button
          onClick={() => onThemeChange("light")}
          className={`px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 ${
            theme === "light" ? "bg-gray-100" : ""
          }`}
          role="radio"
          aria-checked={theme === "light"}
          aria-label={t('preview.lightTheme')}
        >
          {t('common.light')}
        </button>
        <button
          onClick={() => onThemeChange("dark")}
          className={`px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 ${
            theme === "dark" ? "bg-gray-100" : ""
          }`}
          role="radio"
          aria-checked={theme === "dark"}
          aria-label={t('preview.darkTheme')}
        >
          {t('common.dark')}
        </button>
      </div>
    </div>
  );
}