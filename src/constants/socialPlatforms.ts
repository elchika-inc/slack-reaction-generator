// ソーシャルメディア共有プラットフォームの設定

export type PlatformKey = 'twitter' | 'facebook' | 'linkedin' | 'slack';

export interface SharePlatform {
  name: string;
  urlTemplate: string;
  windowOptions?: {
    width: number;
    height: number;
  };
  backgroundColor: string;
  hoverColor: string;
  openInNewTab?: boolean;
}

export const SHARE_PLATFORMS: Record<PlatformKey, SharePlatform> = {
  twitter: {
    name: 'X',
    urlTemplate: 'https://twitter.com/intent/tweet?url={url}&text={title}&hashtags={hashtags}',
    windowOptions: {
      width: 600,
      height: 400,
    },
    backgroundColor: 'bg-black',
    hoverColor: 'hover:bg-gray-800',
  },
  facebook: {
    name: 'Facebook',
    urlTemplate: 'https://www.facebook.com/sharer/sharer.php?u={url}',
    windowOptions: {
      width: 600,
      height: 400,
    },
    backgroundColor: 'bg-blue-600',
    hoverColor: 'hover:bg-blue-700',
  },
  linkedin: {
    name: 'LinkedIn',
    urlTemplate: 'https://www.linkedin.com/sharing/share-offsite/?url={url}',
    windowOptions: {
      width: 600,
      height: 400,
    },
    backgroundColor: 'bg-blue-700',
    hoverColor: 'hover:bg-blue-800',
  },
  slack: {
    name: 'Slack',
    urlTemplate: 'slack://channel?team=&id=&message={message}',
    backgroundColor: 'bg-purple-600',
    hoverColor: 'hover:bg-purple-700',
    openInNewTab: true,
  },
} as const;

// ウィンドウオプションのデフォルト設定
export const DEFAULT_WINDOW_FEATURES = [
  'toolbar=no',
  'menubar=no',
  'scrollbars=no',
  'resizable=yes',
] as const;

// URL生成ヘルパー関数
export function generateShareUrl(
  platform: SharePlatform,
  params: {
    url: string;
    title: string;
    hashtags?: string[];
  }
): string {
  let shareUrl = platform.urlTemplate;
  
  shareUrl = shareUrl.replace('{url}', encodeURIComponent(params.url));
  shareUrl = shareUrl.replace('{title}', encodeURIComponent(params.title));
  
  if (params.hashtags) {
    const hashtagString = params.hashtags.map(tag => tag.replace('#', '')).join(',');
    shareUrl = shareUrl.replace('{hashtags}', hashtagString);
  }
  
  if (platform.name === 'Slack') {
    const message = `${params.title}: ${params.url}`;
    shareUrl = shareUrl.replace('{message}', encodeURIComponent(message));
  }
  
  return shareUrl;
}

// ウィンドウポジション計算ヘルパー
export function calculateWindowPosition(width: number, height: number): { left: number; top: number } {
  return {
    left: Math.max(0, (window.screen.width - width) / 2),
    top: Math.max(0, (window.screen.height - height) / 2),
  };
}