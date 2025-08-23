import { useCallback } from 'react';
import { generateIconData } from '../utils/canvasUtils';
import { FlatSettings } from '../types/settings';

// file-saverを遅延読み込み
let saveAs: ((blob: Blob, filename: string) => void) | null = null;
const loadFileSaver = async () => {
  if (!saveAs) {
    const module = await import('file-saver');
    saveAs = module.saveAs;
  }
  return saveAs;
};

export function useDownload() {
  const downloadIcon = useCallback(async (iconSettings: FlatSettings, onError?: (error: Error) => void) => {
    const fileName = `slack-reaction-${Date.now()}.${
      iconSettings.animation !== "none" ? "gif" : "png"
    }`;

    try {
      // 新しいキャンバスで生成
      const tempCanvas = document.createElement("canvas");
      const canvasSize = iconSettings.canvasSize || 128;
      tempCanvas.width = canvasSize;
      tempCanvas.height = canvasSize;

      const url = await generateIconData(iconSettings, tempCanvas);
      
      if (!url) {
        throw new Error('File generation failed - no URL returned');
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Fetch failed with status: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      const fileSaver = await loadFileSaver();
      if (!fileSaver) {
        throw new Error('FileSaver not available');
      }
      
      fileSaver(blob, fileName);
    } catch (error) {
      console.error('Download error:', error);
      if (onError) {
        onError(error instanceof Error ? error : new Error('Unknown download error'));
      }
    }
  }, []);

  return { downloadIcon };
}