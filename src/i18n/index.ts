import ja from './locales/ja.json';
import en from './locales/en.json';

export type Locale = 'ja' | 'en';

export const locales = {
  ja,
  en,
} as const;

export const defaultLocale: Locale = 'ja';

export const supportedLocales: Locale[] = ['ja', 'en'];

export type TranslationKey = keyof typeof ja;

export function getNestedValue(obj: Record<string, unknown>, path: string): string {
  return path.split('.').reduce((current: unknown, key: string) => 
    (current && typeof current === 'object' && key in current) 
      ? (current as Record<string, unknown>)[key] 
      : undefined,
    obj
  ) as string || path;
}

export function t(key: string, locale: Locale = defaultLocale, params?: Record<string, string | number>): string {
  const translations = locales[locale] || locales[defaultLocale];
  let result = getNestedValue(translations, key);
  
  if (params) {
    Object.entries(params).forEach(([paramKey, value]) => {
      result = result.replace(new RegExp(`{${paramKey}}`, 'g'), String(value));
    });
  }
  
  return result;
}