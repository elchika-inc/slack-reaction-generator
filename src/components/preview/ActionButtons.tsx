import { useLanguage } from '../../contexts/LanguageContext';
import { SocialShareButtons } from './SocialShareButtons';

export interface ActionButtonsProps {
  onDownload: () => void;
}

export function ActionButtons({ onDownload }: ActionButtonsProps) {
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

      <SocialShareButtons />
    </div>
  );
}