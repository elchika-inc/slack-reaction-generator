import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getTextColor,
  renderAnimationFrame,
  calculateGifDelay,
  generateGifFrames
} from '../../utils/frameRenderer'
import * as textRenderer from '../../utils/textRenderer'
import * as animationHelpers from '../../utils/animationHelpers'

// モックの設定
vi.mock('../../utils/textRenderer')
vi.mock('../../utils/animationHelpers')

describe('frameRenderer', () => {
  let mockCanvas: HTMLCanvasElement
  let mockContext: CanvasRenderingContext2D
  let mockGif: any
  
  beforeEach(() => {
    // Canvas要素のモック
    mockContext = {
      fillRect: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      fillStyle: '',
      getImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(4 * 128 * 128),
        width: 128,
        height: 128
      }))
    } as any
    
    mockCanvas = {
      width: 128,
      height: 128,
      getContext: vi.fn(() => mockContext)
    } as any
    
    // GIFモック
    mockGif = {
      addFrame: vi.fn()
    }
    
    // document.createElementのモック
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'canvas') {
        return mockCanvas
      }
      return document.createElement(tagName)
    })
    
    // Imageのモック
    global.Image = vi.fn().mockImplementation(() => ({
      src: '',
      complete: false,
      width: 100,
      height: 100
    })) as any
    
    // モック関数の実装
    vi.mocked(textRenderer.renderText).mockImplementation(() => {})
    vi.mocked(animationHelpers.calculateAnimationValue).mockImplementation((type, progress) => {
      if (type === 'rainbow') {
        return progress * 360
      }
      if (type === 'blink') {
        return Math.sin(progress * Math.PI * 2 * 4) > 0
      }
      return 0
    })
    vi.mocked(animationHelpers.applyTextAnimation).mockImplementation(() => {})
  })
  
  afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })
  
  describe('getTextColor', () => {
    it('通常のテキスト設定をそのまま返す', () => {
      // Arrange
      const settings = {
        text: 'Test',
        fontColor: '#000000',
        textColorType: 'solid'
      }
      
      // Act
      const result = getTextColor(settings, 0.5)
      
      // Assert
      expect(result).toBe(settings)
    })
    
    it('虹色アニメーションで色相を計算する', () => {
      // Arrange
      const settings = {
        text: 'Test',
        animation: 'rainbow'
      }
      
      // Act
      const result = getTextColor(settings, 0.5)
      
      // Assert
      expect(result.textColorType).toBe('solid')
      expect(result.fontColor).toMatch(/^hsl\(180, 100%, 50%\)$/)
    })
    
    it('点滅アニメーションでセカンダリカラーを使用する', () => {
      // Arrange
      const settings = {
        text: 'Test',
        animation: 'blink',
        secondaryColor: '#FFD700'
      }
      
      vi.mocked(animationHelpers.calculateAnimationValue).mockReturnValue(true)
      
      // Act
      const result = getTextColor(settings, 0.5)
      
      // Assert
      expect(result.textColorType).toBe('solid')
      expect(result.fontColor).toBe('#FFD700')
    })
    
    it('点滅アニメーションで元の色を保持する', () => {
      // Arrange
      const settings = {
        text: 'Test',
        animation: 'blink',
        fontColor: '#FF0000',
        secondaryColor: '#FFD700'
      }
      
      vi.mocked(animationHelpers.calculateAnimationValue).mockReturnValue(false)
      
      // Act
      const result = getTextColor(settings, 0.5)
      
      // Assert
      expect(result).toBe(settings)
    })
  })
  
  describe('renderAnimationFrame', () => {
    it('アニメーションフレームを描画する', () => {
      // Arrange
      const settings = {
        text: 'Test',
        animation: 'spin',
        animationAmplitude: 50,
        secondaryColor: '#FFD700'
      }
      const frame = 15
      const totalFrames = 30
      const canvasSize = 128
      
      // Act
      renderAnimationFrame(mockContext, settings, frame, totalFrames, canvasSize)
      
      // Assert
      expect(mockContext.save).toHaveBeenCalled()
      expect(mockContext.restore).toHaveBeenCalled()
      expect(animationHelpers.applyTextAnimation).toHaveBeenCalledWith(
        mockContext,
        'spin',
        0.5,
        50,
        '#FFD700',
        128
      )
      expect(textRenderer.renderText).toHaveBeenCalled()
    })
    
    it('背景画像がある場合に描画する', () => {
      // Arrange
      const mockImage = {
        src: '',
        complete: true,
        width: 100,
        height: 100
      }
      
      global.Image = vi.fn().mockImplementation(() => mockImage) as any
      
      const settings = {
        text: 'Test',
        imageData: 'data:image/png;base64,test',
        imagePosition: 'back',
        imageSize: 50,
        imageX: 50,
        imageY: 50
      }
      
      // Act
      renderAnimationFrame(mockContext, settings, 0, 30, 128)
      
      // Assert
      expect(mockContext.drawImage).toHaveBeenCalledWith(
        mockImage,
        expect.any(Number),
        expect.any(Number),
        expect.any(Number),
        expect.any(Number)
      )
    })
    
    it('前景画像がある場合に描画する', () => {
      // Arrange
      const mockImage = {
        src: '',
        complete: true,
        width: 100,
        height: 100
      }
      
      global.Image = vi.fn().mockImplementation(() => mockImage) as any
      
      const settings = {
        text: 'Test',
        imageData: 'data:image/png;base64,test',
        imagePosition: 'front',
        imageSize: 50,
        imageX: 50,
        imageY: 50
      }
      
      // Act
      renderAnimationFrame(mockContext, settings, 0, 30, 128)
      
      // Assert
      expect(mockContext.drawImage).toHaveBeenCalledWith(
        mockImage,
        expect.any(Number),
        expect.any(Number),
        expect.any(Number),
        expect.any(Number)
      )
    })
  })
  
  describe('calculateGifDelay', () => {
    it('通常の遅延値を10ms単位に丸める', () => {
      // Act & Assert
      expect(calculateGifDelay(33)).toBe(30)
      expect(calculateGifDelay(45)).toBe(50)
      expect(calculateGifDelay(50)).toBe(50)
    })
    
    it('最小値（30ms）未満の場合は30msにする', () => {
      // Act & Assert
      expect(calculateGifDelay(10)).toBe(30)
      expect(calculateGifDelay(20)).toBe(30)
      expect(calculateGifDelay(29)).toBe(30)
    })
    
    it('大きな値も正しく丸める', () => {
      // Act & Assert
      expect(calculateGifDelay(100)).toBe(100)
      expect(calculateGifDelay(123)).toBe(120)
      expect(calculateGifDelay(999)).toBe(1000)
    })
  })
  
  describe('generateGifFrames', () => {
    it('指定されたフレーム数でGIFフレームを生成する', () => {
      // Arrange
      const settings = {
        text: 'Test',
        backgroundColor: '#FF0000',
        animationSpeed: 33
      }
      const frameCount = 10
      const canvasSize = 128
      
      // Act
      generateGifFrames(mockGif, settings, frameCount, canvasSize)
      
      // Assert
      expect(mockGif.addFrame).toHaveBeenCalledTimes(10)
      expect(mockContext.fillStyle).toBe('#FF0000')
      expect(mockContext.fillRect).toHaveBeenCalledTimes(10)
    })
    
    it('デフォルトの背景色を使用する', () => {
      // Arrange
      const settings = {
        text: 'Test',
        animationSpeed: 50
      }
      const frameCount = 5
      const canvasSize = 128
      
      // Act
      generateGifFrames(mockGif, settings, frameCount, canvasSize)
      
      // Assert
      expect(mockContext.fillStyle).toBe('#FFFFFF')
      expect(mockGif.addFrame).toHaveBeenCalledTimes(5)
    })
    
    it('各フレームで正しい遅延値を設定する', () => {
      // Arrange
      const settings = {
        text: 'Test',
        backgroundColor: '#FF0000',
        animationSpeed: 45
      }
      const frameCount = 3
      const canvasSize = 128
      
      // Act
      generateGifFrames(mockGif, settings, frameCount, canvasSize)
      
      // Assert
      const addFrameCalls = mockGif.addFrame.mock.calls
      expect(addFrameCalls.length).toBe(3)
      
      // 各フレームで同じ遅延値が使用される
      addFrameCalls.forEach(call => {
        expect(call[1]).toEqual({
          copy: true,
          delay: 50 // 45ms -> 50ms に丸められる
        })
      })
    })
    
    it('フレーム毎にrenderAnimationFrameを呼び出す', () => {
      // Arrange
      const settings = {
        text: 'Test',
        animation: 'spin'
      }
      const frameCount = 5
      const canvasSize = 128
      
      // renderAnimationFrameのスパイを作成
      const renderSpy = vi.spyOn(animationHelpers, 'applyTextAnimation')
      
      // Act
      generateGifFrames(mockGif, settings, frameCount, canvasSize)
      
      // Assert
      expect(renderSpy).toHaveBeenCalledTimes(5)
      expect(textRenderer.renderText).toHaveBeenCalledTimes(5)
    })
  })
})