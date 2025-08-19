import { useState } from 'react';
import { generateIconData } from '../utils/canvasUtils';

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
    const data = await generateIconData(iconSettings);
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
      }
    }
  };

  return {
    previewData,
    handleGeneratePreview
  };
};