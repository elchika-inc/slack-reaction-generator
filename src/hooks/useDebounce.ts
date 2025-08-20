import { useCallback, useRef } from 'react';

/**
 * デバウンス用カスタムフック
 * @param callback - デバウンスする関数
 * @param delay - デバウンスの遅延時間（ミリ秒）
 * @returns デバウンスされた関数
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
};

/**
 * スライダー用デバウンスフック（300ms固定）
 * @param callback - デバウンスする関数
 * @returns デバウンスされた関数
 */
export const useSliderDebounce = <T extends (...args: any[]) => any>(
  callback: T
) => {
  return useDebounce(callback, 300);
};