import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderText } from '../../utils/textRenderer'

// canvasConstants のモック
vi.mock('../../constants/canvasConstants', () => ({
  CANVAS_CONFIG: {
    SIZE: 128,
    DEFAULT_SECONDARY_COLOR: '#666666'
  },
  isDecorativeFont: vi.fn((fontFamily) => 
    fontFamily.includes('Pacifico') || 
    fontFamily.includes('Dancing') ||
    fontFamily.includes('Kaushan')
  ),
  calculatePadding: vi.fn((canvasSize, isDecorative) => 
    isDecorative ? canvasSize * 0.1 : canvasSize * 0.05
  ),
  calculateFontSize: vi.fn((canvasSize, isDecorative) =>
    isDecorative ? canvasSize * 0.3 : canvasSize * 0.4
  )
}))

describe('textRenderer', () => {
  let mockContext: CanvasRenderingContext2D
  let mockGradient: CanvasGradient

  beforeEach(() => {
    mockGradient = {
      addColorStop: vi.fn()
    } as unknown as CanvasGradient

    mockContext = {
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      measureText: vi.fn(() => ({ width: 80 })),
      fillText: vi.fn(),
      createLinearGradient: vi.fn(() => mockGradient),
      font: '',
      fillStyle: '',
      textAlign: '',
      textBaseline: ''
    } as unknown as CanvasRenderingContext2D

    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('基本的なテキスト描画', () => {
    it('単一行テキストを正しく描画する', () => {
      const settings = {
        text: 'Hello',
        fontFamily: 'Arial',
        fontColor: '#000000'
      }

      renderText(mockContext, settings)

      expect(mockContext.save).toHaveBeenCalled()
      expect(mockContext.translate).toHaveBeenCalledWith(64, 64) // 中心に移動
      expect(mockContext.fillText).toHaveBeenCalledWith('Hello', 0, expect.any(Number))
      expect(mockContext.restore).toHaveBeenCalled()
    })

    it('複数行テキストを正しく描画する', () => {
      const settings = {
        text: 'Hello\nWorld',
        fontFamily: 'Arial',
        fontColor: '#000000'
      }

      renderText(mockContext, settings)

      expect(mockContext.fillText).toHaveBeenCalledTimes(2)
      expect(mockContext.fillText).toHaveBeenCalledWith('Hello', 0, expect.any(Number))
      expect(mockContext.fillText).toHaveBeenCalledWith('World', 0, expect.any(Number))
    })

    it('空行を含むテキストは空行をスキップする', () => {
      const settings = {
        text: 'Hello\n\nWorld\n   \nTest',
        fontFamily: 'Arial',
        fontColor: '#000000'
      }

      renderText(mockContext, settings)

      expect(mockContext.fillText).toHaveBeenCalledTimes(3)
      expect(mockContext.fillText).toHaveBeenCalledWith('Hello', 0, expect.any(Number))
      expect(mockContext.fillText).toHaveBeenCalledWith('World', 0, expect.any(Number))
      expect(mockContext.fillText).toHaveBeenCalledWith('Test', 0, expect.any(Number))
    })

    it('空のテキストの場合は何もしない', () => {
      const settings = {
        text: '',
        fontFamily: 'Arial',
        fontColor: '#000000'
      }

      renderText(mockContext, settings)

      expect(mockContext.save).not.toHaveBeenCalled()
      expect(mockContext.fillText).not.toHaveBeenCalled()
    })

    it('空白のみのテキストの場合は何もしない', () => {
      const settings = {
        text: '   \n  \n   ',
        fontFamily: 'Arial',
        fontColor: '#000000'
      }

      renderText(mockContext, settings)

      expect(mockContext.save).not.toHaveBeenCalled()
      expect(mockContext.fillText).not.toHaveBeenCalled()
    })
  })

  describe('フォント設定', () => {
    it('通常フォントはboldフォントウェイトを使用', () => {
      const settings = {
        text: 'Test',
        fontFamily: 'Arial',
        fontColor: '#000000'
      }

      renderText(mockContext, settings)

      expect(mockContext.font).toContain('bold')
      expect(mockContext.font).toContain('Arial')
    })

    it('M PLUSフォントはフォントウェイト900を使用', () => {
      const settings = {
        text: 'Test',
        fontFamily: 'M PLUS 1p',
        fontColor: '#000000'
      }

      renderText(mockContext, settings)

      expect(mockContext.font).toContain('900')
      expect(mockContext.font).toContain('M PLUS 1p')
    })

    it('M+フォントもフォントウェイト900を使用', () => {
      const settings = {
        text: 'Test',
        fontFamily: 'M+ 1p',
        fontColor: '#000000'
      }

      renderText(mockContext, settings)

      expect(mockContext.font).toContain('900')
    })

    it('装飾フォントはnormalフォントウェイトを使用', async () => {
      const { isDecorativeFont } = await import('../../constants/canvasConstants')
      
      const settings = {
        text: 'Test',
        fontFamily: 'Pacifico',
        fontColor: '#000000'
      }

      renderText(mockContext, settings)

      expect(isDecorativeFont).toHaveBeenCalledWith('Pacifico')
      expect(mockContext.font).toContain('normal')
      expect(mockContext.font).toContain('Pacifico')
    })
  })

  describe('グラデーション', () => {
    it('水平グラデーションを適用', () => {
      const settings = {
        text: 'Test',
        fontFamily: 'Arial',
        fontColor: '#000000',
        textColorType: 'gradient',
        gradientDirection: 'horizontal',
        gradientColor1: '#FF0000',
        gradientColor2: '#0000FF'
      }

      renderText(mockContext, settings)

      expect(mockContext.createLinearGradient).toHaveBeenCalledWith(-40, 0, 40, 0) // テキスト幅の半分
      expect(mockGradient.addColorStop).toHaveBeenCalledWith(0, '#FF0000')
      expect(mockGradient.addColorStop).toHaveBeenCalledWith(1, '#0000FF')
      expect(mockContext.fillStyle).toBe(mockGradient)
    })

    it('垂直グラデーションを適用', () => {
      const settings = {
        text: 'Test\nLine',
        fontFamily: 'Arial',
        fontColor: '#000000',
        textColorType: 'gradient',
        gradientDirection: 'vertical',
        gradientColor1: '#FF0000',
        gradientColor2: '#0000FF'
      }

      renderText(mockContext, settings)

      expect(mockContext.createLinearGradient).toHaveBeenCalledWith(0, expect.any(Number), 0, expect.any(Number))
      expect(mockGradient.addColorStop).toHaveBeenCalledWith(0, '#FF0000')
      expect(mockGradient.addColorStop).toHaveBeenCalledWith(1, '#0000FF')
    })

    it('グラデーション色2が未指定の場合はsecondaryColorを使用', () => {
      const settings = {
        text: 'Test',
        fontFamily: 'Arial',
        fontColor: '#000000',
        textColorType: 'gradient',
        gradientDirection: 'horizontal',
        gradientColor1: '#FF0000',
        secondaryColor: '#00FF00'
      }

      renderText(mockContext, settings)

      expect(mockGradient.addColorStop).toHaveBeenCalledWith(0, '#FF0000')
      expect(mockGradient.addColorStop).toHaveBeenCalledWith(1, '#00FF00')
    })

    it('グラデーション色とsecondaryColorが未指定の場合はデフォルト色を使用', () => {
      const settings = {
        text: 'Test',
        fontFamily: 'Arial',
        fontColor: '#000000',
        textColorType: 'gradient',
        gradientDirection: 'horizontal',
        gradientColor1: '#FF0000'
      }

      renderText(mockContext, settings)

      expect(mockGradient.addColorStop).toHaveBeenCalledWith(1, '#666666')
    })

    it('単色の場合はfillStyleにfontColorを設定', () => {
      const settings = {
        text: 'Test',
        fontFamily: 'Arial',
        fontColor: '#FF0000',
        textColorType: 'solid'
      }

      renderText(mockContext, settings)

      expect(mockContext.fillStyle).toBe('#FF0000')
    })
  })

  describe('スケーリング', () => {
    it('装飾フォントは最大90%にスケール制限', async () => {
      const { isDecorativeFont, calculatePadding, calculateFontSize } = await import('../../constants/canvasConstants')
      
      mockContext.measureText = vi.fn(() => ({ width: 200 })) // 大きなテキスト幅
      
      const settings = {
        text: 'Very Long Decorative Text',
        fontFamily: 'Pacifico',
        fontColor: '#000000'
      }

      renderText(mockContext, settings)

      expect(isDecorativeFont).toHaveBeenCalledWith('Pacifico')
      
      // scale呼び出しの引数を確認
      const scaleCall = (mockContext.scale as any).mock.calls[0]
      expect(scaleCall[0]).toBeLessThanOrEqual(0.9) // X軸スケール <= 0.9
      expect(scaleCall[1]).toBeLessThanOrEqual(0.9) // Y軸スケール <= 0.9
    })

    it('通常フォントはスケール制限なし', () => {
      mockContext.measureText = vi.fn(() => ({ width: 50 }))
      
      const settings = {
        text: 'Short',
        fontFamily: 'Arial',
        fontColor: '#000000'
      }

      renderText(mockContext, settings)

      expect(mockContext.scale).toHaveBeenCalled()
    })
  })

  describe('カスタムキャンバスサイズ', () => {
    it('指定されたcanvasSizeを使用', async () => {
      const { calculatePadding, calculateFontSize } = await import('../../constants/canvasConstants')
      
      const settings = {
        text: 'Test',
        fontFamily: 'Arial',
        fontColor: '#000000'
      }

      renderText(mockContext, settings, 256)

      expect(calculatePadding).toHaveBeenCalledWith(256, false)
      expect(calculateFontSize).toHaveBeenCalledWith(256, false)
      expect(mockContext.translate).toHaveBeenCalledWith(128, 128) // 256 / 2
    })

    it('canvasSizeが未指定の場合はデフォルト値を使用', async () => {
      const { calculatePadding, calculateFontSize } = await import('../../constants/canvasConstants')
      
      const settings = {
        text: 'Test',
        fontFamily: 'Arial',
        fontColor: '#000000'
      }

      renderText(mockContext, settings)

      expect(calculatePadding).toHaveBeenCalledWith(128, false) // デフォルト128
      expect(calculateFontSize).toHaveBeenCalledWith(128, false)
    })
  })

  describe('テキスト配置', () => {
    it('テキストは中央揃えで配置される', () => {
      const settings = {
        text: 'Center',
        fontFamily: 'Arial',
        fontColor: '#000000'
      }

      renderText(mockContext, settings)

      expect(mockContext.textAlign).toBe('center')
      expect(mockContext.textBaseline).toBe('middle')
    })

    it('複数行テキストの各行は正しい位置に配置', () => {
      const settings = {
        text: 'Line1\nLine2\nLine3',
        fontFamily: 'Arial',
        fontColor: '#000000'
      }

      renderText(mockContext, settings)

      expect(mockContext.fillText).toHaveBeenCalledTimes(3)
      
      // 各行のY座標が異なることを確認
      const calls = (mockContext.fillText as any).mock.calls
      expect(calls[0][2]).not.toBe(calls[1][2]) // Line1 と Line2 のY座標が異なる
      expect(calls[1][2]).not.toBe(calls[2][2]) // Line2 と Line3 のY座標が異なる
    })
  })

  describe('エラーハンドリング', () => {
    it('measureTextが失敗した場合のテスト', () => {
      mockContext.measureText = vi.fn(() => {
        throw new Error('measureText failed')
      })

      const settings = {
        text: 'Test',
        fontFamily: 'Arial',
        fontColor: '#000000'
      }

      // エラーが発生することを確認（現在の実装ではエラーハンドリングされていない）
      expect(() => renderText(mockContext, settings)).toThrow('measureText failed')
    })

    it('createLinearGradientが失敗した場合のテスト', () => {
      mockContext.createLinearGradient = vi.fn(() => {
        throw new Error('gradient failed')
      })

      const settings = {
        text: 'Test',
        fontFamily: 'Arial',
        fontColor: '#000000',
        textColorType: 'gradient',
        gradientDirection: 'horizontal',
        gradientColor1: '#FF0000',
        gradientColor2: '#0000FF'
      }

      // エラーが発生することを確認（現在の実装ではエラーハンドリングされていない）
      expect(() => renderText(mockContext, settings)).toThrow('gradient failed')
    })

    it('fontFamilyがnullの場合のテスト', () => {
      const settings = {
        text: 'Test',
        fontFamily: null,
        fontColor: '#000000'
      }

      // TypeErrorが発生することを確認（現在の実装ではnullチェックされていない）
      expect(() => renderText(mockContext, settings)).toThrow()
    })
  })
})