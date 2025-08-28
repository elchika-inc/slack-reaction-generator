import { useLanguage } from '../../contexts/LanguageContext';
import { useShareHandlers } from '../../hooks/useShareHandlers';
import { PlatformKey, SHARE_PLATFORMS } from '../../constants/socialPlatforms';
import { SOCIAL_ICONS } from '../icons/SocialIcons';

export interface SocialShareButtonsProps {
  url?: string;
  title?: string;
  hashtags?: string[];
}

export function SocialShareButtons({ 
  url = window.location.href,
  title = 'Slack Reaction Generator',
  hashtags = ['SlackEmoji', 'ReactionGenerator']
}: SocialShareButtonsProps) {
  const { t } = useLanguage();
  const { handleShare } = useShareHandlers({ url, title, hashtags });

  return (
    <div className="mt-3 space-y-2">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {t('preview.shareOn')}
      </p>
      
      <div className="grid grid-cols-2 gap-2">
        {(Object.entries(SHARE_PLATFORMS) as [PlatformKey, typeof SHARE_PLATFORMS[PlatformKey]][]).map(([key, platform]) => {
          const IconComponent = SOCIAL_ICONS[key];
          
          return (
            <button
              key={key}
              onClick={() => handleShare(key)}
              className={`w-full btn-secondary flex items-center justify-center space-x-2 py-2.5 px-3 
                ${platform.backgroundColor} ${platform.hoverColor} text-white transition-colors 
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2`}
              aria-label={t(`preview.shareOn${platform.name.replace(' ', '')}`)}
              title={`Share on ${platform.name}`}
            >
              <IconComponent />
              <span className="text-sm font-medium">{platform.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}