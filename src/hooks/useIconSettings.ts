import { useState, useCallback, useEffect } from 'react';
import { createDefaultSettings, structureSettings, flattenSettings, validateSettings, SettingCategories } from '../types/settings';
import { useLanguage } from '../contexts/LanguageContext';

export const useIconSettings = () => {
  const { locale } = useLanguage();
  
  // 構造化された設定で内部管理
  const [structuredSettings, setStructuredSettings] = useState(() => createDefaultSettings(locale));
  
  // 言語が変更されたときにテキストのみ更新
  useEffect(() => {
    setStructuredSettings(prev => {
      // テキストが初期値の場合のみ更新
      if (prev.basic.text === 'いいかも' || prev.basic.text === 'いい\nかも' || prev.basic.text === 'Good') {
        return {
          ...prev,
          basic: {
            ...prev.basic,
            text: locale === 'en' ? 'Good' : 'いい\nかも'
          }
        };
      }
      return prev;
    });
  }, [locale]);
  
  // 下位互換性のためフラット形式も提供
  const iconSettings = flattenSettings(structuredSettings);

  // カテゴリ別設定更新
  const updateBasicSettings = useCallback((newBasic) => {
    setStructuredSettings(prev => ({
      ...prev,
      basic: { ...prev.basic, ...newBasic }
    }));
  }, []);

  const updateAnimationSettings = useCallback((newAnimation) => {
    setStructuredSettings(prev => ({
      ...prev,
      animation: { ...prev.animation, ...newAnimation }
    }));
  }, []);

  const updateImageSettings = useCallback((newImage) => {
    setStructuredSettings(prev => ({
      ...prev,
      image: { ...prev.image, ...newImage }
    }));
  }, []);

  const updateOptimizationSettings = useCallback((newOptimization) => {
    setStructuredSettings(prev => ({
      ...prev,
      optimization: { ...prev.optimization, ...newOptimization }
    }));
  }, []);

  // 汎用設定更新（下位互換性）
  const handleSettingsChange = useCallback((newSettings) => {
    const structured = structureSettings({ ...iconSettings, ...newSettings });
    setStructuredSettings(structured);
  }, [iconSettings]);

  // カテゴリ別設定更新の統一インターface
  const updateSettingsByCategory = useCallback((category, newSettings) => {
    switch (category) {
      case SettingCategories.BASIC:
        updateBasicSettings(newSettings);
        break;
      case SettingCategories.ANIMATION:
        updateAnimationSettings(newSettings);
        break;
      case SettingCategories.IMAGE:
        updateImageSettings(newSettings);
        break;
      case SettingCategories.OPTIMIZATION:
        updateOptimizationSettings(newSettings);
        break;
      default:
        // eslint-disable-next-line no-console
        console.warn(`Unknown category: ${category}`);
    }
  }, [updateBasicSettings, updateAnimationSettings, updateImageSettings, updateOptimizationSettings]);

  // 設定の検証
  const validationErrors = validateSettings(structuredSettings);

  return {
    // 下位互換性
    iconSettings,
    handleSettingsChange,
    
    // 新しい構造化API
    structuredSettings,
    updateSettingsByCategory,
    updateBasicSettings,
    updateAnimationSettings, 
    updateImageSettings,
    updateOptimizationSettings,
    
    // 検証
    validationErrors,
    isValid: validationErrors.length === 0
  };
};