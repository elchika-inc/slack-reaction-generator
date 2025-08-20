import React, { createContext, useContext } from 'react';
import { FunctionalComponent, ComponentChildren } from 'preact';
import { useCanvasPreview } from '../hooks/useCanvasPreview';
import { useFileGeneration } from '../hooks/useFileGeneration';

interface CanvasContextType {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  smallCanvasRef: React.RefObject<HTMLCanvasElement>;
  previewData: string | null;
  handleGeneratePreview: (iconSettings: any, isMobile: boolean) => Promise<void>;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

interface CanvasProviderProps {
  children: ComponentChildren;
  iconSettings: any;
  isMobile: boolean;
}

export const CanvasProvider: FunctionalComponent<CanvasProviderProps> = ({ 
  children, 
  iconSettings, 
  isMobile 
}) => {
  const { canvasRef, smallCanvasRef } = useCanvasPreview(iconSettings, isMobile);
  const { previewData, handleGeneratePreview } = useFileGeneration();

  const contextValue: CanvasContextType = {
    canvasRef,
    smallCanvasRef,
    previewData,
    handleGeneratePreview,
  };

  return (
    <CanvasContext.Provider value={contextValue}>
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvasContext = (): CanvasContextType => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvasContext must be used within a CanvasProvider');
  }
  return context;
};