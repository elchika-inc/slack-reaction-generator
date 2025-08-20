import { useState } from 'react';
import { canvasManager } from '../utils/CanvasManager';
import { selectOptimalPipeline } from '../utils/RenderingPipelines';

let saveAs = null;
const loadFileSaver = async () => {
  if (!saveAs) {
    const module = await import('file-saver');
    saveAs = module.saveAs;
  }
  return saveAs;
};

export const useFileGeneration = () => {
  const [previewData, setPreviewData] = useState(null);

  const handleGeneratePreview = async (iconSettings, isMobile) => {
    try {
      // CanvasManagerを使用してファイル生成
      const data = await canvasManager.generateFile(iconSettings);
      setPreviewData(data);

      if (isMobile) {
        const fileName = `slack-reaction-${Date.now()}.${
          iconSettings.animation !== 'none' ? 'gif' : 'png'
        }`;
        try {
          const response = await fetch(data);
          const blob = await response.blob();
          const fileSaver = await loadFileSaver();
          fileSaver(blob, fileName);
        } catch (error) {
          // Download error
          console.error('Download failed:', error);
        }
      }
    } catch (error) {
      console.error('File generation failed:', error);
    }
  };

  return {
    previewData,
    handleGeneratePreview
  };
};