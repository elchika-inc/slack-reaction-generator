import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { RenderingEngine, renderingEngine } from '../../utils/renderingEngine'

// drawAnimationFrameとdrawTextIconのモック
vi.mock('../../utils/canvasUtils', () => ({
  drawAnimationFrame: vi.fn(),
  drawTextIcon: vi.fn()
}))

describe('RenderingEngine', () => {
  let engine: RenderingEngine
  let mockCanvas: HTMLCanvasElement
  let mockContext: CanvasRenderingContext2D

  beforeEach(() => {
    engine = new RenderingEngine()

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
      scale: vi.fn(),
      fillStyle: ''
    } as unknown as CanvasRenderingContext2D

    // document.createElement のモック
    global.document = {
      createElement: vi.fn(() => mockCanvas)
    } as unknown as Document

    // getContext が mockContext を返すように設定
    mockCanvas.getContext = vi.fn(() => mockContext)

    // requestAnimationFrame と cancelAnimationFrame のモック（既存のものを上書き）
    if (!global.requestAnimationFrame) {
      global.requestAnimationFrame = vi.fn((callback) => {
        setTimeout(() => callback(performance.now()), 16)
        return 1
      })
    }
    if (!global.cancelAnimationFrame) {
      global.cancelAnimationFrame = vi.fn()
    }

    vi.clearAllMocks()
  })

  afterEach(() => {
    engine.clear()
    vi.clearAllMocks()
  })

  describe('Canvas管理', () => {
    it('新しいCanvasを作成・登録できる', () => {
      const canvasData = engine.createCanvas('test', 256, 256, { alpha: false })

      expect(document.createElement).toHaveBeenCalledWith('canvas')
      expect(mockCanvas.width).toBe(256)
      expect(mockCanvas.height).toBe(256)
      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d', {
        alpha: false,
        willReadFrequently: true
      })

      expect(canvasData).toEqual({
        canvas: mockCanvas,
        ctx: mockContext,
        width: 256,
        height: 256,
        animationId: null,
        lastTime: 0,
        frame: 0
      })

      expect(engine.getCanvas('test')).toBe(canvasData)
    })

    it('存在しないCanvasIDでnullを返す', () => {
      expect(engine.getCanvas('nonexistent')).toBeUndefined()
    })

    it('Canvasを削除できる', () => {
      engine.createCanvas('test', 128, 128)
      expect(engine.getCanvas('test')).toBeDefined()

      engine.removeCanvas('test')
      expect(engine.getCanvas('test')).toBeUndefined()
    })

    it('全Canvasをクリアできる', () => {
      engine.createCanvas('test1', 128, 128)
      engine.createCanvas('test2', 128, 128)

      engine.clear()

      expect(engine.getCanvas('test1')).toBeUndefined()
      expect(engine.getCanvas('test2')).toBeUndefined()
    })
  })

  describe('静的レンダリング', () => {
    it('静的描画を実行する', async () => {
      const { drawTextIcon } = await import('../../utils/canvasUtils')
      
      engine.createCanvas('test', 128, 128)
      const settings = { text: 'テスト', fontColor: '#000000' }

      engine.renderStatic('test', settings)

      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 128, 128)
      expect(drawTextIcon).toHaveBeenCalledWith(mockContext, settings)
    })

    it('存在しないCanvasIDでは何もしない', () => {
      const settings = { text: 'テスト' }
      
      // エラーが発生しないことを確認
      expect(() => engine.renderStatic('nonexistent', settings)).not.toThrow()
    })
  })

  describe('アニメーション制御', () => {
    it('アニメーションを開始できる', () => {
      engine.createCanvas('test', 128, 128)
      const settings = {
        text: 'テスト',
        animation: 'bounce',
        animationSpeed: 50
      }

      engine.startAnimation('test', settings)

      expect(requestAnimationFrame).toHaveBeenCalled()
    })

    it('アニメーション速度が30ms未満の場合は30msに制限される', () => {
      engine.createCanvas('test', 128, 128)
      const settings = {
        text: 'テスト',
        animation: 'bounce',
        animationSpeed: 10 // 30ms未満
      }

      // requestAnimationFrame の呼び出しをモック
      const mockAnimationFrame = vi.fn()
      global.requestAnimationFrame = mockAnimationFrame

      engine.startAnimation('test', settings)

      expect(mockAnimationFrame).toHaveBeenCalled()
    })

    it('アニメーションがない場合は静的描画を実行', async () => {
      const { drawTextIcon } = await import('../../utils/canvasUtils')
      
      engine.createCanvas('test', 128, 128)
      const settings = {
        text: 'テスト',
        animation: 'none'
      }

      engine.startAnimation('test', settings)

      expect(drawTextIcon).toHaveBeenCalledWith(mockContext, settings)
      expect(requestAnimationFrame).not.toHaveBeenCalled()
    })

    it('アニメーションを停止できる', () => {
      engine.createCanvas('test', 128, 128)
      const canvasData = engine.getCanvas('test')!
      
      // アニメーションIDを設定
      canvasData.animationId = 123

      engine.stopAnimation('test')

      expect(cancelAnimationFrame).toHaveBeenCalledWith(123)
      expect(canvasData.animationId).toBeNull()
      expect(canvasData.lastTime).toBe(0)
      expect(canvasData.frame).toBe(0)
    })

    it('全アニメーションを停止できる', () => {
      engine.createCanvas('test1', 128, 128)
      engine.createCanvas('test2', 128, 128)
      
      const canvas1 = engine.getCanvas('test1')!
      const canvas2 = engine.getCanvas('test2')!
      
      canvas1.animationId = 123
      canvas2.animationId = 456

      engine.stopAllAnimations()

      expect(cancelAnimationFrame).toHaveBeenCalledWith(123)
      expect(cancelAnimationFrame).toHaveBeenCalledWith(456)
    })
  })

  describe('フレーム描画', () => {
    it('フレームを正しく描画する', async () => {
      const { drawAnimationFrame } = await import('../../utils/canvasUtils')
      
      engine.createCanvas('test', 128, 128)
      const settings = { 
        text: 'テスト',
        backgroundColor: '#FF0000'
      }

      engine.renderFrame('test', settings, 5, 30)

      expect(mockContext.fillStyle).toBe('#FF0000')
      expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 128, 128)
      expect(drawAnimationFrame).toHaveBeenCalledWith(mockContext, settings, 5, 30)
    })

    it('背景色が未指定の場合はデフォルト色を使用', async () => {
      engine.createCanvas('test', 128, 128)
      const settings = { text: 'テスト' }

      engine.renderFrame('test', settings, 0, 30)

      expect(mockContext.fillStyle).toBe('#FFFFFF')
    })
  })

  describe('スケール描画', () => {
    it('ソースCanvasをスケールしてターゲットCanvasに描画', () => {
      engine.createCanvas('source', 128, 128)
      engine.createCanvas('target', 32, 32)

      const sourceCanvas = engine.getCanvas('source')!
      const targetCanvas = engine.getCanvas('target')!

      engine.renderScaled('source', 'target', 0.25)

      expect(targetCanvas.ctx.clearRect).toHaveBeenCalledWith(0, 0, 32, 32)
      expect(targetCanvas.ctx.save).toHaveBeenCalled()
      expect(targetCanvas.ctx.scale).toHaveBeenCalledWith(0.25, 0.25)
      expect(targetCanvas.ctx.drawImage).toHaveBeenCalledWith(sourceCanvas.canvas, 0, 0)
      expect(targetCanvas.ctx.restore).toHaveBeenCalled()
    })

    it('存在しないCanvasIDの場合は何もしない', () => {
      expect(() => engine.renderScaled('nonexistent1', 'nonexistent2', 1)).not.toThrow()
    })
  })

  describe('イメージアニメーション対応', () => {
    it('イメージアニメーションがある場合はアニメーションを開始', () => {
      engine.createCanvas('test', 128, 128)
      const settings = {
        text: 'テスト',
        imageData: 'data:image/png;base64,iVBOR...',
        imageAnimation: 'fade'
      }

      engine.startAnimation('test', settings)

      expect(requestAnimationFrame).toHaveBeenCalled()
    })

    it('テキストとイメージ両方のアニメーションがある場合', () => {
      engine.createCanvas('test', 128, 128)
      const settings = {
        text: 'テスト',
        animation: 'bounce',
        imageData: 'data:image/png;base64,iVBOR...',
        imageAnimation: 'slide'
      }

      engine.startAnimation('test', settings)

      expect(requestAnimationFrame).toHaveBeenCalled()
    })
  })

  describe('グローバルインスタンス', () => {
    it('renderingEngineはRenderingEngineのインスタンス', () => {
      expect(renderingEngine).toBeInstanceOf(RenderingEngine)
    })

    it('グローバルインスタンスは動作する', () => {
      const canvasData = renderingEngine.createCanvas('global-test', 64, 64)
      expect(canvasData).toBeDefined()
      expect(renderingEngine.getCanvas('global-test')).toBe(canvasData)
    })
  })

  describe('エラーハンドリング', () => {
    it('getContextが失敗してもエラーが発生しない', () => {
      mockCanvas.getContext = vi.fn(() => null)

      expect(() => engine.createCanvas('test', 128, 128)).not.toThrow()
    })

    it('requestAnimationFrameが利用できない場合', () => {
      // @ts-ignore
      global.requestAnimationFrame = undefined

      engine.createCanvas('test', 128, 128)
      
      // requestAnimationFrameがundefinedの場合はエラーが発生する
      expect(() => engine.startAnimation('test', { text: 'テスト', animation: 'bounce' })).toThrow()
    })
  })
})