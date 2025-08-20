import React, { createContext, useContext } from 'react';
import { FunctionalComponent, ComponentChildren } from 'preact';
import { useIconSettings } from '../hooks/useIconSettings';

interface IconSettingsContextType {
  iconSettings: any;
  structuredSettings: any;
  handleSettingsChange: (settings: any) => void;
  updateSettingsByCategory: (category: string, settings: any) => void;
  updateBasicSettings: (settings: any) => void;
  updateAnimationSettings: (settings: any) => void;
  updateImageSettings: (settings: any) => void;
  updateOptimizationSettings: (settings: any) => void;
  validationErrors: string[];
  isValid: boolean;
}

const IconSettingsContext = createContext<IconSettingsContextType | undefined>(undefined);

interface IconSettingsProviderProps {
  children: ComponentChildren;
}

export const IconSettingsProvider: FunctionalComponent<IconSettingsProviderProps> = ({ children }) => {
  const iconSettingsHook = useIconSettings();

  return (
    <IconSettingsContext.Provider value={iconSettingsHook}>
      {children}
    </IconSettingsContext.Provider>
  );
};

export const useIconSettingsContext = (): IconSettingsContextType => {
  const context = useContext(IconSettingsContext);
  if (!context) {
    throw new Error('useIconSettingsContext must be used within an IconSettingsProvider');
  }
  return context;
};