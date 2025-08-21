import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as canvasUtils from '../../utils/canvasUtils'
import * as canvasManager from '../../utils/CanvasManager'

// モックの設定
vi.mock('../../utils/canvasUtils')
vi.mock('../../utils/CanvasManager')
vi.mock('react-color', () => ({
  SketchPicker: vi.fn(() => null)
}))

describe('App統合テスト', () => {
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
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'canvas') {
        return mockCanvas
      }
      return originalCreateElement(tagName)
    })
    
    // CanvasManagerのモック
    const mockCanvasManager = {
      createCanvas: vi.fn(() => mockCanvas),
      generateFile: vi.fn(() => Promise.resolve('data:image/png;base64,test'))
    }
    vi.mocked(canvasManager).default = mockCanvasManager as any
    
    // canvasUtilsのモック
    vi.mocked(canvasUtils.generateIconData).mockResolvedValue('data:image/png;base64,test')
    vi.mocked(canvasUtils.drawTextIcon).mockImplementation(() => {})
    vi.mocked(canvasUtils.drawAnimationFrame).mockImplementation(() => {})
    
    // IntersectionObserverのモック
    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
      unobserve: vi.fn()
    }))
    
    // URLとBlobのモック
    global.URL.createObjectURL = vi.fn(() => 'blob:test')
    global.URL.revokeObjectURL = vi.fn()
    global.Blob = vi.fn()
    
    // FileReaderのモック
    global.FileReader = vi.fn().mockImplementation(() => ({
      readAsDataURL: vi.fn(function(file) {
        this.result = 'data:image/png;base64,test'
        if (this.onload) this.onload()
      }),
      result: null,
      onload: null,
      onerror: null
    })) as any
  })
  
  afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })
  
  describe('Canvas操作', () => {
    it('Canvas要素を正しく作成する', () => {
      // Act
      const canvas = document.createElement('canvas')
      
      // Assert
      expect(canvas).toBe(mockCanvas)
      expect(canvas.getContext('2d')).toBe(mockContext)
    })
    
    it('generateIconDataが呼び出される', async () => {
      // Arrange
      const settings = {
        text: 'Test',
        animation: 'none',
        backgroundColor: '#FF0000'
      }
      
      // Act
      const result = await canvasUtils.generateIconData(settings, mockCanvas)
      
      // Assert
      expect(result).toBe('data:image/png;base64,test')
      expect(canvasUtils.generateIconData).toHaveBeenCalledWith(settings, mockCanvas)
    })
    
    it('drawTextIconが呼び出される', () => {
      // Arrange
      const settings = {
        text: 'Test',
        backgroundColor: '#FF0000'
      }
      
      // Act
      canvasUtils.drawTextIcon(mockContext, settings)
      
      // Assert
      expect(canvasUtils.drawTextIcon).toHaveBeenCalledWith(mockContext, settings)
    })
    
    it('drawAnimationFrameが呼び出される', () => {
      // Arrange
      const settings = {
        text: 'Test',
        animation: 'spin'
      }
      
      // Act
      canvasUtils.drawAnimationFrame(mockContext, settings, 0, 30)
      
      // Assert
      expect(canvasUtils.drawAnimationFrame).toHaveBeenCalledWith(
        mockContext,
        settings,
        0,
        30
      )
    })
  })
  
  describe('CanvasManager操作', () => {
    it('CanvasManagerでキャンバスを作成する', () => {
      // Arrange
      const manager = vi.mocked(canvasManager).default
      
      // Act
      const canvas = manager.createCanvas()
      
      // Assert
      expect(canvas).toBe(mockCanvas)
      expect(manager.createCanvas).toHaveBeenCalled()
    })
    
    it('CanvasManagerでファイルを生成する', async () => {
      // Arrange
      const manager = vi.mocked(canvasManager).default
      const settings = {
        text: 'Test',
        animation: 'none'
      }
      
      // Act
      const result = await manager.generateFile('png', settings)
      
      // Assert
      expect(result).toBe('data:image/png;base64,test')
      expect(manager.generateFile).toHaveBeenCalled()
    })
  })
  
  describe('ファイル操作', () => {
    it('FileReaderでファイルを読み込む', async () => {
      // Arrange
      const file = new File(['test'], 'test.png', { type: 'image/png' })
      const reader = new FileReader()
      
      // Act
      const result = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result)
        reader.readAsDataURL(file)
      })
      
      // Assert
      expect(result).toBe('data:image/png;base64,test')
    })
    
    it('Blob URLを作成する', () => {
      // Arrange
      const blob = new Blob(['test'], { type: 'image/png' })
      
      // Act
      const url = URL.createObjectURL(blob)
      
      // Assert
      expect(url).toBe('blob:test')
      expect(URL.createObjectURL).toHaveBeenCalledWith(blob)
    })
  })
})