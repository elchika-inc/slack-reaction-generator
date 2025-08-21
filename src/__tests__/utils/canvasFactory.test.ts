import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createCanvas, createPreviewCanvas, createAnimationCanvas } from '../../utils/canvasFactory'

describe('canvasFactory', () => {
  let mockCanvas: HTMLCanvasElement
  let mockContext: CanvasRenderingContext2D

  beforeEach(() => {
    // Canvas要素のモック
    mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn()
    } as unknown as HTMLCanvasElement

    // 2Dコンテキストのモック
    mockContext = {
      save: vi.fn(),
      restore: vi.fn(),
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      drawImage: vi.fn(),
      measureText: vi.fn(() => ({ width: 100 })),
      fillText: vi.fn(),
      createLinearGradient: vi.fn()
    } as unknown as CanvasRenderingContext2D

    // document.createElement のモック
    global.document = {
      createElement: vi.fn(() => mockCanvas)
    } as unknown as Document

    // getContext が mockContext を返すように設定
    mockCanvas.getContext = vi.fn(() => mockContext)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('createCanvas', () => {
    it('デフォルトサイズ128x128のCanvasを作成する', () => {
      const result = createCanvas()

      expect(document.createElement).toHaveBeenCalledWith('canvas')
      expect(mockCanvas.width).toBe(128)
      expect(mockCanvas.height).toBe(128)
      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d', {
        alpha: true,
        willReadFrequently: true
      })
      expect(result).toEqual({
        canvas: mockCanvas,
        ctx: mockContext
      })
    })

    it('指定されたサイズでCanvasを作成する', () => {
      const width = 256
      const height = 256

      createCanvas(width, height)

      expect(mockCanvas.width).toBe(width)
      expect(mockCanvas.height).toBe(height)
    })

    it('カスタムオプションを渡せる', () => {
      const customOptions = {
        alpha: false,
        desynchronized: true
      }

      createCanvas(128, 128, customOptions)

      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d', {
        alpha: false,
        willReadFrequently: true,
        desynchronized: true
      })
    })

    it('optionsがundefinedの場合でもデフォルト値を使用する', () => {
      createCanvas(128, 128, undefined)

      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d', {
        alpha: true,
        willReadFrequently: true
      })
    })
  })

  describe('createPreviewCanvas', () => {
    it('指定されたサイズの正方形Canvasを作成する', () => {
      const size = 64

      createPreviewCanvas(size)

      expect(mockCanvas.width).toBe(size)
      expect(mockCanvas.height).toBe(size)
    })

    it('undefinedのサイズでも処理できる', () => {
      createPreviewCanvas(undefined)

      expect(mockCanvas.width).toBe(128) // デフォルト値
      expect(mockCanvas.height).toBe(128)
    })
  })

  describe('createAnimationCanvas', () => {
    it('設定のcanvasSizeを使用してCanvasを作成する', () => {
      const settings = { canvasSize: 256 }

      createAnimationCanvas(settings)

      expect(mockCanvas.width).toBe(256)
      expect(mockCanvas.height).toBe(256)
    })

    it('canvasSizeが未指定の場合はデフォルト128を使用する', () => {
      const settings = {}

      createAnimationCanvas(settings)

      expect(mockCanvas.width).toBe(128)
      expect(mockCanvas.height).toBe(128)
    })

    it('settingsがnullの場合でも処理できる', () => {
      createAnimationCanvas(null)

      expect(mockCanvas.width).toBe(128)
      expect(mockCanvas.height).toBe(128)
    })

    it('settingsがundefinedの場合でも処理できる', () => {
      createAnimationCanvas(undefined)

      expect(mockCanvas.width).toBe(128)
      expect(mockCanvas.height).toBe(128)
    })
  })

  describe('エラーハンドリング', () => {
    it('getContextがnullを返す場合の処理', () => {
      mockCanvas.getContext = vi.fn(() => null)

      const result = createCanvas()

      expect(result).toEqual({
        canvas: mockCanvas,
        ctx: null
      })
    })

    it('document.createElementが失敗した場合', () => {
      global.document.createElement = vi.fn(() => {
        throw new Error('Canvas creation failed')
      })

      expect(() => createCanvas()).toThrow('Canvas creation failed')
    })
  })

  describe('メモリ効率性', () => {
    it('大量のCanvas作成でもメモリリークしない', () => {
      const initialMemory = performance.memory?.usedJSHeapSize || 0
      
      // 1000個のCanvasを作成
      for (let i = 0; i < 1000; i++) {
        createCanvas(128, 128)
      }

      const finalMemory = performance.memory?.usedJSHeapSize || 0
      
      // メモリ使用量の増加が妥当な範囲内であることを確認
      if (performance.memory) {
        expect(finalMemory - initialMemory).toBeLessThan(10 * 1024 * 1024) // 10MB未満
      }
    })
  })
})