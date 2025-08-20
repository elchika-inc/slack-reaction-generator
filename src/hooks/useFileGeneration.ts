import { useState } from 'react';
import { canvasManager } from '../utils/CanvasManager';
import { selectOptimalPipeline } from '../utils/RenderingPipelines';
import { ErrorTypes, ErrorSeverity, handleError, safeAsync } from '../utils/errorHandler';

let saveAs = null;
const loadFileSaver = async () => {
  return safeAsync(
    async () => {
      if (!saveAs) {
        const module = await import('file-saver');
        saveAs = module.saveAs;
      }
      return saveAs;
    },
    ErrorTypes.INITIALIZATION,
    'FileSaverライブラリの読み込みに失敗しました',
    ErrorSeverity.HIGH
  );
};

export const useFileGeneration = () => {
  const [previewData, setPreviewData] = useState(null);
  const [generationError, setGenerationError] = useState(null);

  const handleGeneratePreview = async (iconSettings, isMobile) => {
    setGenerationError(null);
    
    const result = await safeAsync(
      async () => {
        // CanvasManagerを使用してファイル生成
        const data = await canvasManager.generateFile(iconSettings);
        setPreviewData(data);

        if (isMobile) {
          const fileName = `slack-reaction-${Date.now()}.${
            iconSettings.animation !== 'none' ? 'gif' : 'png'
          }`;
          
          const downloadResult = await safeAsync(
            async () => {
              const response = await fetch(data);
              const blob = await response.blob();
              const fileSaver = await loadFileSaver();
              
              if (fileSaver instanceof Error) {
                throw fileSaver;
              }
              
              fileSaver(blob, fileName);
              return true;
            },
            ErrorTypes.FILE_DOWNLOAD,
            'ファイルのダウンロードに失敗しました',
            ErrorSeverity.MEDIUM
          );
          
          if (downloadResult instanceof Error) {
            setGenerationError(downloadResult);
            return downloadResult;
          }
        }
        
        return data;
      },
      iconSettings.animation !== 'none' ? ErrorTypes.GIF_GENERATION : ErrorTypes.CANVAS_RENDER,
      iconSettings.animation !== 'none' ? 'GIF生成に失敗しました' : '画像生成に失敗しました',
      ErrorSeverity.HIGH
    );
    
    if (result instanceof Error) {
      setGenerationError(result);
      return null;
    }
    
    return result;
  };

  return {
    previewData,
    generationError,
    handleGeneratePreview
  };
};