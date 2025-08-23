// 共通エイリアス定義 - DRY原則に従い一箇所で管理
import { resolve } from 'path';

const rootPath = process.cwd();

export const aliases = {
  'react': 'preact/compat',
  'react-dom': 'preact/compat',
  'react/jsx-runtime': 'preact/jsx-runtime',
  '@': resolve(rootPath, './src'),
  '@/components': resolve(rootPath, './src/components'),
  '@/hooks': resolve(rootPath, './src/hooks'),
  '@/utils': resolve(rootPath, './src/utils'),
  '@/types': resolve(rootPath, './src/types'),
  '@/constants': resolve(rootPath, './src/constants'),
  '@/contexts': resolve(rootPath, './src/contexts'),
  '@/i18n': resolve(rootPath, './src/i18n')
};

// テスト用の追加エイリアス
export const testAliases = {
  ...aliases,
  'react-dom/test-utils': 'preact/test-utils',
  'react-dom/client': 'preact/compat/client',
  '@testing-library/react': '@testing-library/preact'
};