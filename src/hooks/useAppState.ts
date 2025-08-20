// アプリケーション全体の状態管理

import { useState, useEffect, useCallback } from 'react';
import { shouldEnableFeature } from '../utils/networkAware';

export const useAppState = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [theme, setTheme] = useState('light');
  
  // モバイル判定
  const checkMobile = useCallback(() => {
    setIsMobile(window.innerWidth < 1024);
  }, []);

  // ネットワーク対応機能の制御
  const configureNetworkFeatures = useCallback((handleSettingsChange) => {
    if (!shouldEnableFeature('animations')) {
      handleSettingsChange({ animation: 'none' });
    }
  }, []);

  // レスポンシブ監視
  useEffect(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [checkMobile]);

  // テーマ切替
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  return {
    isMobile,
    theme,
    setTheme,
    toggleTheme,
    configureNetworkFeatures
  };
};