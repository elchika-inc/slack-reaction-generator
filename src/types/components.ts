// コンポーネントプロップス型定義の統一
import { ComponentChildren } from 'preact';
import { AppError } from '@/utils/errorHandler';

// エラー関連コンポーネント
export interface ErrorBoundaryProps {
  children: ComponentChildren;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}

export interface ErrorFallbackProps {
  error: AppError | null;
  retry: () => void;
  report: () => void;
}

export interface ErrorNotificationProps {
  error?: AppError | null;
  onClose?: () => void;
}

// 汎用プロップス
export interface BaseComponentProps {
  className?: string;
  children?: ComponentChildren;
  'data-testid'?: string;
}

// レイアウトコンポーネント
export interface ContainerProps extends BaseComponentProps {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  padding?: boolean;
}

// フォームコンポーネント
export interface FormFieldProps extends BaseComponentProps {
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}