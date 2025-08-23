import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StaticIconGenerator } from '../../../utils/canvas/StaticIconGenerator';
import { createDefaultSettings, flattenSettings } from '../../../types/settings';

// Canvas APIのモック
const mockCanvas = {
  width: 128,
  height: 128,
  getContext: vi.fn(),
  toDataURL: vi.fn()
};

const mockContext = {
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  globalAlpha: 1
};

// グローバルオブジェクトのモック
Object.defineProperty(global, 'document', {
  value: {
    createElement: vi.fn(() => mockCanvas)
  }
});

vi.mock('../../../utils/textRenderer', () => ({
  renderText: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('../../../utils/imageCache', () => ({
  getOrLoadImage: vi.fn().mockResolvedValue(null)
}));

describe('StaticIconGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCanvas.getContext.mockReturnValue(mockContext);
    mockCanvas.toDataURL.mockReturnValue('data:image/png;base64,mock-data');
  });

  describe('generatePNG', () => {
    it('should generate PNG with default settings', async () => {
      const settings = flattenSettings(createDefaultSettings());
      
      const result = await StaticIconGenerator.generatePNG(settings);
      
      expect(result).toBe('data:image/png;base64,mock-data');
      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 128, 128);
    });

    it('should use provided canvas when given', async () => {
      const settings = flattenSettings(createDefaultSettings());
      const providedCanvas = mockCanvas as any;
      
      await StaticIconGenerator.generatePNG(settings, providedCanvas);
      
      expect(document.createElement).not.toHaveBeenCalled();
      expect(providedCanvas.width).toBe(128);
      expect(providedCanvas.height).toBe(128);
    });

    it('should draw background when backgroundType is solid', async () => {
      const settings = flattenSettings(createDefaultSettings());
      settings.backgroundType = 'solid';
      settings.backgroundColor = '#FF0000';
      
      await StaticIconGenerator.generatePNG(settings);
      
      expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 128, 128);
    });

    it('should handle canvas context creation failure', async () => {
      mockCanvas.getContext.mockReturnValue(null);
      const settings = flattenSettings(createDefaultSettings());
      
      await expect(StaticIconGenerator.generatePNG(settings)).rejects.toThrow(
        'Canvas context could not be obtained'
      );
    });

    it('should use correct canvas size from settings', async () => {
      const settings = flattenSettings(createDefaultSettings());
      settings.canvasSize = 64;
      
      await StaticIconGenerator.generatePNG(settings);
      
      expect(mockCanvas.width).toBe(64);
      expect(mockCanvas.height).toBe(64);
      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 64, 64);
    });
  });
});