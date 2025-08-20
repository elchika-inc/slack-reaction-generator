import React, { createContext, useContext } from 'react';
import { FunctionalComponent, ComponentChildren } from 'preact';
import { useAppState } from '../hooks/useAppState';

interface AppStateContextType {
  isMobile: boolean;
  theme: string;
  setTheme: (theme: string) => void;
  toggleTheme: () => void;
  configureNetworkFeatures: (handleSettingsChange: (settings: any) => void) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

interface AppStateProviderProps {
  children: ComponentChildren;
}

export const AppStateProvider: FunctionalComponent<AppStateProviderProps> = ({ children }) => {
  const appStateHook = useAppState();

  return (
    <AppStateContext.Provider value={appStateHook}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppStateContext = (): AppStateContextType => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppStateContext must be used within an AppStateProvider');
  }
  return context;
};