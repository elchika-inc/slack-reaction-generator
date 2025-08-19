// animationHelpers のテスト

import { describe, it, expect } from 'vitest';
import { 
  getAmplitudeFactor, 
  calculateAnimationValue,
  ANIMATION_CONSTANTS 
} from '../animationHelpers';

describe('animationHelpers', () => {
  describe('getAmplitudeFactor', () => {
    it('デフォルト振幅を正しく計算する', () => {
      const result = getAmplitudeFactor();
      expect(result).toBe(0.5); // DEFAULT_AMPLITUDE(50) / OPACITY_MAX(100)
    });

    it('カスタム振幅を正しく計算する', () => {
      const result = getAmplitudeFactor(75);
      expect(result).toBe(0.75);
    });

    it('0振幅を正しく処理する', () => {
      const result = getAmplitudeFactor(0);
      expect(result).toBe(0);
    });
  });

  describe('calculateAnimationValue', () => {
    it('bounceアニメーションの値を正しく計算する', () => {
      const progress = 0.25; // sin(π/2) = 1の位置
      const result = calculateAnimationValue('bounce', progress, 50);
      
      // Math.abs(Math.sin(0.25 * 2π)) * 19.2 * 0.5
      const expected = Math.abs(Math.sin(progress * Math.PI * 2)) * 
                      ANIMATION_CONSTANTS.BOUNCE_HEIGHT_FACTOR * 0.5;
      expect(result).toBeCloseTo(expected, 2);
    });

    it('pulseアニメーションの値を正しく計算する', () => {
      const progress = 0.25;
      const result = calculateAnimationValue('pulse', progress, 50);
      
      // 1 + Math.sin(0.25 * 2π) * 0.2 * 0.5
      const expected = 1 + Math.sin(progress * Math.PI * 2) * 
                      ANIMATION_CONSTANTS.PULSE_SCALE_RANGE * 0.5;
      expect(result).toBeCloseTo(expected, 2);
    });

    it('slideアニメーションの値を正しく計算する', () => {
      const progress = 0.5; // sin(π) = 0の位置
      const result = calculateAnimationValue('slide', progress, 50);
      
      expect(result).toBeCloseTo(0, 2);
    });

    it('fadeアニメーションの値を正しく計算する', () => {
      const progress = 0.25;
      const result = calculateAnimationValue('fade', progress);
      
      // (Math.sin(0.25 * 2π) + 1) / 2
      const expected = (Math.sin(progress * Math.PI * 2) + 1) / 2;
      expect(result).toBeCloseTo(expected, 2);
    });

    it('rotateアニメーションの値を正しく計算する', () => {
      const progress = 0.5;
      const result = calculateAnimationValue('rotate', progress);
      
      // 0.5 * 2π = π
      expect(result).toBeCloseTo(Math.PI, 2);
    });

    it('rainbowアニメーションの値を正しく計算する', () => {
      const progress = 0.5;
      const result = calculateAnimationValue('rainbow', progress);
      
      // 0.5 * 360 = 180
      expect(result).toBe(180);
    });

    it('blinkアニメーションのboolean値を正しく返す', () => {
      const progress1 = 0; // sin(0) > 0 is false
      const progress2 = 0.125; // sin(π) > 0 should be true
      
      const result1 = calculateAnimationValue('blink', progress1);
      const result2 = calculateAnimationValue('blink', progress2);
      
      expect(typeof result1).toBe('boolean');
      expect(typeof result2).toBe('boolean');
    });

    it('不明なアニメーションタイプで0を返す', () => {
      const result = calculateAnimationValue('unknown', 0.5);
      expect(result).toBe(0);
    });
  });
});