import { useCallback } from 'react';
import { 
  PlatformKey, 
  SHARE_PLATFORMS, 
  generateShareUrl, 
  calculateWindowPosition, 
  DEFAULT_WINDOW_FEATURES 
} from '../constants/socialPlatforms';

export interface UseShareHandlersOptions {
  url?: string;
  title?: string;
  hashtags?: string[];
}

export interface UseShareHandlersReturn {
  handleShare: (platformKey: PlatformKey) => void;
  canShare: (platformKey: PlatformKey) => boolean;
}

/**
 * ソーシャルメディア共有処理を管理するカスタムフック
 * 各プラットフォーム毎の共有ロジックを抽象化し、統一的なインターフェースを提供
 */
export const useShareHandlers = ({
  url = window.location.href,
  title = 'Slack Reaction Generator',
  hashtags = ['SlackEmoji', 'ReactionGenerator'],
}: UseShareHandlersOptions = {}): UseShareHandlersReturn => {
  
  const handleShare = useCallback((platformKey: PlatformKey) => {
    const platform = SHARE_PLATFORMS[platformKey];
    if (!platform) {
      console.warn(`Unknown platform: ${platformKey}`);
      return;
    }

    try {
      const shareUrl = generateShareUrl(platform, { url, title, hashtags });

      if (platform.openInNewTab) {
        // Slackなど、新しいタブで開く必要があるプラットフォーム
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
      } else if (platform.windowOptions) {
        // ポップアップウィンドウで開くプラットフォーム
        const { width, height } = platform.windowOptions;
        const { left, top } = calculateWindowPosition(width, height);
        
        const features = [
          ...DEFAULT_WINDOW_FEATURES,
          `width=${width}`,
          `height=${height}`,
          `left=${left}`,
          `top=${top}`,
        ].join(',');
        
        window.open(shareUrl, `${platformKey}-share`, features);
      } else {
        // デフォルトは新しいタブで開く
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error(`Failed to share on ${platform.name}:`, error);
      // エラー時のフォールバック処理
      // 必要に応じてトースト通知などを表示
    }
  }, [url, title, hashtags]);

  const canShare = useCallback((platformKey: PlatformKey) => {
    // Slack共有は特別な条件をチェック
    if (platformKey === 'slack') {
      // Slackプロトコルハンドラーは全環境で試行可能
      return true;
    }
    
    // その他のプラットフォームは常に利用可能
    return true;
  }, []);

  return {
    handleShare,
    canShare,
  };
};