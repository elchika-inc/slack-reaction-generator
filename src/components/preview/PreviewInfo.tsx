import { useLanguage } from '../../contexts/LanguageContext';
import { FlatSettings } from '../../types/settings';

export interface PreviewInfoProps {
  iconSettings: FlatSettings;
}

export function PreviewInfo({ iconSettings }: PreviewInfoProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-gray-50 rounded-lg p-3 mb-6">
      <div className="text-xs space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-600">{t('preview.fileInfo.format')}:</span>
          <span className="font-medium">
            {iconSettings.animation !== "none" ? "GIF" : "PNG"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">{t('preview.fileInfo.size')}:</span>
          <span className="font-medium">{iconSettings.canvasSize || 128} × {iconSettings.canvasSize || 128}px</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">{t('preview.fileInfo.estimatedFileSize')}:</span>
          <span className="font-medium">&lt; 128KB</span>
        </div>
      </div>
    </div>
  );
}