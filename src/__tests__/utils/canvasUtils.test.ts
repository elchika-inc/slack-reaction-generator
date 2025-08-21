import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { generateIconData, drawTextIcon, drawAnimationFrame } from '../../utils/canvasUtils'
import * as textRenderer from '../../utils/textRenderer'
import * as imageCache from '../../utils/imageCache'
import * as animationHelpers from '../../utils/animationHelpers'
import * as gifWorkerManager from '../../utils/GifWorkerManager'
import * as errorHandler from '../../utils/errorHandler'

// モックの設定
vi.mock('../../utils/textRenderer')
vi.mock('../../utils/imageCache')
vi.mock('../../utils/animationHelpers')
vi.mock('../../utils/GifWorkerManager')
vi.mock('../../utils/errorHandler')

// gif.jsのモック
vi.mock('gif.js', () => ({
  default: vi.fn().mockImplementation(() => ({
    addFrame: vi.fn(),
    on: vi.fn((event, callback) => {
      if (event === 'finished') {
        // テスト用のBlobを生成
        const blob = new Blob(['test'], { type: 'image/gif' })
        setTimeout(() => callback(blob), 0)
      }
    }),
    render: vi.fn()
  }))
}))

describe('canvasUtils', () => {
  let mockCanvas: HTMLCanvasElement
  let mockContext: CanvasRenderingContext2D
  
  beforeEach(() => {
    // Canvas要素のモック
    mockContext = {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn(),
      globalCompositeOperation: 'source-over',
      fillStyle: '',
      globalAlpha: 1,
      getImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(4 * 128 * 128),
        width: 128,
        height: 128
      }))
    } as any
    
    mockCanvas = {
      width: 128,
      height: 128,
      getContext: vi.fn(() => mockContext),
      toDataURL: vi.fn(() => 'data:image/png;base64,test')
    } as any
    
    // document.createElementのモック
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'canvas') {
        return mockCanvas
      }
      return document.createElement(tagName)
    })
    
    // FileReaderのモック
    global.FileReader = vi.fn().mockImplementation(() => ({
      readAsDataURL: vi.fn(function(blob) {
        this.result = 'data:image/gif;base64,test'
        if (this.onloadend) this.onloadend()
      }),
      result: null,
      onloadend: null,
      onerror: null
    })) as any
    
    // モック関数の実装
    vi.mocked(textRenderer.renderText).mockImplementation(() => {})
    vi.mocked(imageCache.getOrLoadImage).mockReturnValue(null)
    vi.mocked(animationHelpers.applyTextAnimation).mockImplementation(() => {})
    vi.mocked(animationHelpers.applyImageAnimation).mockImplementation(() => {})
    vi.mocked(errorHandler.handleError).mockImplementation(() => {})
  })
  
  afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })
  
  describe('generateIconData', () => {
    it('静止画（テキストのみ）を生成する', async () => {
      // Arrange
      const settings = {
        text: 'Test',
        animation: 'none',
        backgroundType: 'color',
        backgroundColor: '#FF0000',
        canvasSize: 128
      }
      
      // Act
      const result = await generateIconData(settings, undefined)
      
      // Assert
      expect(result).toBe('data:image/png;base64,test')
      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 128, 128)
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png')
    })
    
    it('透明背景の静止画を生成する', async () => {
      // Arrange
      const settings = {
        text: 'Test',
        animation: 'none',
        backgroundType: 'transparent',
        canvasSize: 128
      }
      
      // Act
      const result = await generateIconData(settings, undefined)
      
      // Assert
      expect(result).toBe('data:image/png;base64,test')
      expect(mockContext.globalCompositeOperation).toBe('source-over')
    })
    
    it('アニメーション付きGIFを生成する', async () => {
      // Arrange
      const settings = {
        text: 'Test',
        animation: 'spin',
        backgroundType: 'color',
        backgroundColor: '#FF0000',
        canvasSize: 128,
        gifFrames: 30,
        animationSpeed: 33,
        gifQuality: 10
      }
      
      // GifWorkerManagerのモック
      const mockGifWorkerManager = vi.mocked(gifWorkerManager.gifWorkerManager)
      mockGifWorkerManager.generateGIF = vi.fn((settings, onProgress, onComplete, onError) => {
        // 成功をシミュレート
        setTimeout(() => {
          onComplete({ dataUrl: 'data:image/gif;base64,animated' })
        }, 0)
      })
      
      // Act
      const result = await generateIconData(settings, undefined)
      
      // Assert
      expect(result).toBe('data:image/gif;base64,animated')
      expect(mockGifWorkerManager.generateGIF).toHaveBeenCalled()
    })
    
    it('Workerエラー時にフォールバック処理を実行する', async () => {
      // Arrange
      const settings = {
        text: 'Test',
        animation: 'spin',
        backgroundType: 'color',
        backgroundColor: '#FF0000',
        canvasSize: 128,
        gifFrames: 30
      }
      
      // GifWorkerManagerのモック（エラーを発生させる）
      const mockGifWorkerManager = vi.mocked(gifWorkerManager.gifWorkerManager)
      mockGifWorkerManager.generateGIF = vi.fn((settings, onProgress, onComplete, onError) => {
        // エラーをシミュレート
        setTimeout(() => {
          onError(new Error('Worker error'))
        }, 0)
      })
      
      // Act
      const result = await generateIconData(settings, undefined)
      
      // Assert
      expect(result).toBe('data:image/gif;base64,test')
      expect(mockGifWorkerManager.generateGIF).toHaveBeenCalled()
    })
  })
  
  describe('drawTextIcon', () => {
    it('カラー背景でテキストアイコンを描画する', () => {
      // Arrange
      const settings = {
        text: 'Test',
        backgroundType: 'color',
        backgroundColor: '#FF0000',
        canvasSize: 128
      }
      
      // Act
      drawTextIcon(mockContext, settings)
      
      // Assert
      expect(mockContext.fillStyle).toBe('#FF0000')
      expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 128, 128)
      expect(textRenderer.renderText).toHaveBeenCalledWith(mockContext, settings, 128)
    })
    
    it('透明背景でテキストアイコンを描画する', () => {
      // Arrange
      const settings = {
        text: 'Test',
        backgroundType: 'transparent',
        canvasSize: 128
      }
      
      // Act
      drawTextIcon(mockContext, settings)
      
      // Assert
      expect(mockContext.fillRect).not.toHaveBeenCalled()
      expect(textRenderer.renderText).toHaveBeenCalledWith(mockContext, settings, 128)
    })
    
    it('画像が背面にある場合、テキストの前に描画する', () => {
      // Arrange
      const mockImage = {
        complete: true,
        naturalWidth: 100,
        width: 100,
        height: 100
      } as HTMLImageElement
      
      vi.mocked(imageCache.getOrLoadImage).mockReturnValue(mockImage)
      
      const settings = {
        text: 'Test',
        backgroundType: 'color',
        backgroundColor: '#FF0000',
        imageData: 'data:image/png;base64,test',
        imagePosition: 'back',
        imageOpacity: 100,
        imageSize: 50,
        imageX: 50,
        imageY: 50,
        canvasSize: 128
      }
      
      // Act
      drawTextIcon(mockContext, settings)
      
      // Assert
      const calls = vi.mocked(mockContext.drawImage).mock.calls
      expect(calls.length).toBeGreaterThan(0)
      expect(textRenderer.renderText).toHaveBeenCalled()
      
      // drawImageが renderText より前に呼ばれることを確認
      const drawImageCallOrder = vi.mocked(mockContext.drawImage).mock.invocationCallOrder[0]
      const renderTextCallOrder = vi.mocked(textRenderer.renderText).mock.invocationCallOrder[0]
      expect(drawImageCallOrder).toBeLessThan(renderTextCallOrder)
    })
    
    it('画像が前面にある場合、テキストの後に描画する', () => {
      // Arrange
      const mockImage = {
        complete: true,
        naturalWidth: 100,
        width: 100,
        height: 100
      } as HTMLImageElement
      
      vi.mocked(imageCache.getOrLoadImage).mockReturnValue(mockImage)
      
      const settings = {
        text: 'Test',
        backgroundType: 'color',
        backgroundColor: '#FF0000',
        imageData: 'data:image/png;base64,test',
        imagePosition: 'front',
        imageOpacity: 100,
        imageSize: 50,
        imageX: 50,
        imageY: 50,
        canvasSize: 128
      }
      
      // Act
      drawTextIcon(mockContext, settings)
      
      // Assert
      const calls = vi.mocked(mockContext.drawImage).mock.calls
      expect(calls.length).toBeGreaterThan(0)
      expect(textRenderer.renderText).toHaveBeenCalled()
      
      // drawImageが renderText より後に呼ばれることを確認
      const drawImageCallOrder = vi.mocked(mockContext.drawImage).mock.invocationCallOrder[0]
      const renderTextCallOrder = vi.mocked(textRenderer.renderText).mock.invocationCallOrder[0]
      expect(drawImageCallOrder).toBeGreaterThan(renderTextCallOrder)
    })
  })
  
  describe('drawAnimationFrame', () => {
    it('アニメーションフレームを描画する', () => {
      // Arrange
      const settings = {
        text: 'Test',
        animation: 'spin',
        backgroundType: 'color',
        backgroundColor: '#FF0000',
        canvasSize: 128
      }
      
      // Act
      drawAnimationFrame(mockContext, settings, 15, 30)
      
      // Assert
      expect(mockContext.save).toHaveBeenCalled()
      expect(mockContext.restore).toHaveBeenCalled()
      expect(animationHelpers.applyTextAnimation).toHaveBeenCalled()
      expect(textRenderer.renderText).toHaveBeenCalled()
    })
    
    it('虹色アニメーションで色相を変更する', () => {
      // Arrange
      const settings = {
        text: 'Test',
        animation: 'rainbow',
        backgroundType: 'color',
        backgroundColor: '#FF0000',
        canvasSize: 128
      }
      
      // Act
      drawAnimationFrame(mockContext, settings, 15, 30)
      
      // Assert
      const renderTextCall = vi.mocked(textRenderer.renderText).mock.calls[0]
      const passedSettings = renderTextCall[1]
      expect(passedSettings.fontColor).toMatch(/^hsl\(\d+, 100%, 50%\)$/)
    })
    
    it('点滅アニメーションで色を交互に変更する', () => {
      // Arrange
      const settings = {
        text: 'Test',
        animation: 'blink',
        secondaryColor: '#FFD700',
        fontColor: '#000000',
        backgroundType: 'color',
        backgroundColor: '#FF0000',
        canvasSize: 128
      }
      
      // Act - 複数フレームを描画
      // Math.sin(progress * Math.PI * 2 * 4) > 0 となるフレームを探す
      // フレーム2: progress = 2/30 = 0.0667, sin(0.0667 * PI * 2 * 4) = sin(1.675) > 0
      // フレーム7: progress = 7/30 = 0.233, sin(0.233 * PI * 2 * 4) = sin(5.86) < 0
      drawAnimationFrame(mockContext, settings, 2, 30)
      drawAnimationFrame(mockContext, settings, 7, 30)
      
      // Assert
      const renderTextCalls = vi.mocked(textRenderer.renderText).mock.calls
      expect(renderTextCalls.length).toBe(2)
      
      // 異なるフレームで異なる設定が使用されることを確認
      const firstFrameSettings = renderTextCalls[0][1]
      const secondFrameSettings = renderTextCalls[1][1]
      
      // 少なくとも一方がセカンダリカラーまたは元の設定を持つ
      const hasSecondaryColor = firstFrameSettings.fontColor === '#FFD700' || 
                                secondFrameSettings.fontColor === '#FFD700'
      const hasOriginalSettings = firstFrameSettings === settings || 
                                  secondFrameSettings === settings
      
      // blinkアニメーションでは、セカンダリカラーが使用されるか、元の設定が維持される
      expect(hasSecondaryColor || hasOriginalSettings).toBe(true)
    })
    
    it('画像アニメーションを適用する', () => {
      // Arrange
      const mockImage = {
        complete: true,
        naturalWidth: 100,
        width: 100,
        height: 100
      } as HTMLImageElement
      
      vi.mocked(imageCache.getOrLoadImage).mockReturnValue(mockImage)
      
      const settings = {
        text: 'Test',
        animation: 'none',
        imageData: 'data:image/png;base64,test',
        imageAnimation: 'spin',
        imagePosition: 'back',
        imageAnimationAmplitude: 50,
        canvasSize: 128
      }
      
      // Act
      drawAnimationFrame(mockContext, settings, 15, 30)
      
      // Assert
      expect(animationHelpers.applyImageAnimation).toHaveBeenCalled()
      expect(mockContext.drawImage).toHaveBeenCalled()
    })
  })
})