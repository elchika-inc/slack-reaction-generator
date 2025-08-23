import { useLanguage } from '../../contexts/LanguageContext';

export interface ActionButtonsProps {
  onDownload: () => void;
  onShare?: () => void;
  showShare?: boolean;
}

export function ActionButtons({ onDownload, onShare, showShare = false }: ActionButtonsProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-3">
      <button
        onClick={onDownload}
        className="w-full btn-primary flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        aria-label={t('preview.downloadButtonLabel')}
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        {t('preview.download')}
      </button>

      {showShare && onShare && (
        <button
          onClick={onShare}
          className="w-full btn-secondary flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          aria-label={t('preview.shareButtonLabel')}
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326"
            />
          </svg>
          {t('preview.share')}
        </button>
      )}
    </div>
  );
}