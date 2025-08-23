import { useState } from "react";
import { useIconSettingsContext } from '../contexts/IconSettingsContext';
import { useAppStateContext } from '../contexts/AppStateContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useDownload } from '../hooks/useDownload';
import { PreviewCanvas } from './preview/PreviewCanvas';
import { PreviewInfo } from './preview/PreviewInfo';
import { ThemeSelector } from './preview/ThemeSelector';
import { ActionButtons } from './preview/ActionButtons';
import { SlackInstructions } from './preview/SlackInstructions';

interface PreviewPanelProps {
  previewData?: string | null;
  onRegenerate?: () => void;
}

function PreviewPanel({ previewData, onRegenerate }: PreviewPanelProps) {
  const { iconSettings } = useIconSettingsContext();
  const { isMobile } = useAppStateContext();
  const { t } = useLanguage();
  const { downloadIcon } = useDownload();
  const [theme, setTheme] = useState<'light' | 'dark'>("light");

  const handleDownload = () => {
    downloadIcon(iconSettings, (error) => {
      alert(`${t('preview.downloadError')}: ${error.message}`);
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: t('preview.shareTitle'),
        text: t('preview.shareText'),
        url: window.location.href,
      });
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-lg p-6 preview-container ${
        isMobile ? "" : "sticky top-8"
      }`}
    >
      {/* テーマ切り替え */}
      <ThemeSelector theme={theme} onThemeChange={setTheme} />

      {/* プレビューエリア */}
      <div
        className={`
          rounded-lg ${isMobile ? "p-4" : "p-8"} mb-6 transition-colors preview-area
          ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}
        `}
      >
        <div
          className={`flex justify-center ${
            isMobile ? "space-x-4" : "space-x-8"
          }`}
        >
          {/* メインプレビュー */}
          <div className="text-center">
            <p
              className={`text-xs mb-2 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
              id="main-preview-label"
            >
              {t('preview.actualSize')} ({iconSettings.canvasSize || 128}×{iconSettings.canvasSize || 128})
            </p>
            <PreviewCanvas
              iconSettings={iconSettings}
              size={iconSettings.canvasSize || 128}
              className="icon-canvas mx-auto"
              aria-labelledby="main-preview-label"
              aria-description={t('preview.mainPreviewDescription')}
            />
          </div>

          {/* Slack表示サイズ */}
          <div className="text-center">
            <p
              className={`text-xs mb-2 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
              id="slack-preview-label"
            >
              {t('preview.slackSize')} (32×32)
            </p>
            <div className="flex items-center justify-center h-32">
              <PreviewCanvas
                iconSettings={iconSettings}
                size={32}
                className="icon-canvas-small"
                style={{ imageRendering: "pixelated" }}
                aria-labelledby="slack-preview-label"
                aria-description={t('preview.slackPreviewDescription')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ファイル情報 */}
      <PreviewInfo iconSettings={iconSettings} />

      {/* アクションボタン - モバイルでは非表示 */}
      {!isMobile && (
        <ActionButtons
          onDownload={handleDownload}
          onShare={handleShare}
          showShare={!!navigator.share}
        />
      )}

      {/* Slackへの追加方法 - デスクトップのみ表示 */}
      {!isMobile && <SlackInstructions />}
    </div>
  );
}

export default PreviewPanel;