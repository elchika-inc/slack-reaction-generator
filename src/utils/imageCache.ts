import { imageOptimizer, ImageOptimizationOptions, OptimizedImageResult } from './ImageOptimizer';

// 画像キャッシュの拡張版
interface CachedImage {
  original: HTMLImageElement;
  optimized?: OptimizedImageResult;
  timestamp: number;
  accessCount: number;
}

class ImageCacheManager {
  private imageCache = new Map<string, CachedImage>();
  private maxCacheSize = 50; // 最大キャッシュ数
  private maxAge = 5 * 60 * 1000; // 5分

  /**
   * 画像の取得または読み込み
   */
  getOrLoadImage = (src: string): HTMLImageElement | null => {
    if (!src) return null;
    
    // キャッシュチェック
    const cached = this.imageCache.get(src);
    if (cached) {
      // アクセス回数を更新
      cached.accessCount++;
      cached.timestamp = Date.now();
      return cached.original;
    }
    
    // 新しい画像を作成してキャッシュ
    const img = new Image();
    img.crossOrigin = 'anonymous'; // CORS対応
    img.src = src;
    
    const cacheItem: CachedImage = {
      original: img,
      timestamp: Date.now(),
      accessCount: 1
    };
    
    this.imageCache.set(src, cacheItem);
    
    // キャッシュサイズ管理
    this.manageCache();
    
    return img;
  }

  /**
   * 画像の事前読み込み
   */
  preloadImage = async (src: string): Promise<HTMLImageElement | null> => {
    if (!src) return null;
    
    const img = this.getOrLoadImage(src);
    if (!img) return null;
    
    // 画像の読み込みを待つ
    if (!img.complete) {
      return new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Image load failed: ${src}`));
        
        // タイムアウト設定
        setTimeout(() => {
          reject(new Error(`Image load timeout: ${src}`));
        }, 10000);
      });
    }
    
    return img;
  }

  /**
   * 最適化された画像の取得
   */
  async getOptimizedImage(
    src: string, 
    options: ImageOptimizationOptions = {}
  ): Promise<OptimizedImageResult | null> {
    if (!src) return null;
    
    let cached = this.imageCache.get(src);
    
    // キャッシュに最適化版が存在する場合
    if (cached?.optimized) {
      cached.accessCount++;
      cached.timestamp = Date.now();
      return cached.optimized;
    }
    
    try {
      // オリジナル画像を読み込み
      const originalImg = await this.preloadImage(src);
      if (!originalImg) return null;
      
      // 最適化実行
      const optimizedResult = await imageOptimizer.optimizeImage(originalImg, options);
      
      // キャッシュ更新
      if (!cached) {
        cached = {
          original: originalImg,
          timestamp: Date.now(),
          accessCount: 1
        };
        this.imageCache.set(src, cached);
      }
      
      cached.optimized = optimizedResult;
      cached.timestamp = Date.now();
      cached.accessCount++;
      
      return optimizedResult;
      
    } catch (error) {
      console.error(`Image optimization failed for ${src}:`, error);
      return null;
    }
  }

  /**
   * 複数画像の一括事前読み込み
   */
  async preloadImages(srcList: string[]): Promise<(HTMLImageElement | null)[]> {
    const loadPromises = srcList.map(src => 
      this.preloadImage(src).catch(error => {
        console.warn(`Failed to preload image: ${src}`, error);
        return null;
      })
    );
    
    return Promise.all(loadPromises);
  }

  /**
   * キャッシュ管理
   */
  private manageCache(): void {
    const now = Date.now();
    
    // 期限切れアイテムの削除
    for (const [src, cached] of this.imageCache.entries()) {
      if (now - cached.timestamp > this.maxAge) {
        this.imageCache.delete(src);
      }
    }
    
    // サイズ超過時の最古アイテム削除
    if (this.imageCache.size > this.maxCacheSize) {
      const sortedEntries = Array.from(this.imageCache.entries())
        .sort((a, b) => {
          // アクセス頻度と最終アクセス時間を考慮
          const scoreA = a[1].accessCount / Math.max(1, (now - a[1].timestamp) / 1000);
          const scoreB = b[1].accessCount / Math.max(1, (now - b[1].timestamp) / 1000);
          return scoreA - scoreB;
        });
      
      // 最も使用頻度の低いアイテムを削除
      const itemsToRemove = sortedEntries.slice(0, this.imageCache.size - this.maxCacheSize);
      itemsToRemove.forEach(([src]) => {
        this.imageCache.delete(src);
      });
    }
  }

  /**
   * キャッシュ統計情報
   */
  getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    memoryUsage: number;
  } {
    const totalAccess = Array.from(this.imageCache.values())
      .reduce((sum, item) => sum + item.accessCount, 0);
    
    const cacheHits = Array.from(this.imageCache.values())
      .filter(item => item.accessCount > 1).length;
    
    // メモリ使用量の概算（画像サイズは正確に測定困難）
    const estimatedMemory = this.imageCache.size * 100 * 1024; // 100KB per image average
    
    return {
      size: this.imageCache.size,
      maxSize: this.maxCacheSize,
      hitRate: totalAccess > 0 ? cacheHits / totalAccess : 0,
      memoryUsage: estimatedMemory
    };
  }

  /**
   * キャッシュクリア
   */
  clearImageCache = (): void => {
    this.imageCache.clear();
  }

  /**
   * 特定の画像をキャッシュから削除
   */
  removeFromCache(src: string): boolean {
    return this.imageCache.delete(src);
  }

  /**
   * キャッシュ設定の更新
   */
  updateCacheSettings(maxSize: number, maxAgeMs: number): void {
    this.maxCacheSize = maxSize;
    this.maxAge = maxAgeMs;
    this.manageCache();
  }
}

// シングルトンインスタンス
const imageCacheManager = new ImageCacheManager();

// 元の関数のエクスポート（後方互換性）
export const getOrLoadImage = imageCacheManager.getOrLoadImage;
export const preloadImage = imageCacheManager.preloadImage;
export const clearImageCache = imageCacheManager.clearImageCache;

// 新しい機能のエクスポート
export const getOptimizedImage = imageCacheManager.getOptimizedImage.bind(imageCacheManager);
export const preloadImages = imageCacheManager.preloadImages.bind(imageCacheManager);
export const getCacheStats = imageCacheManager.getCacheStats.bind(imageCacheManager);
export const removeFromCache = imageCacheManager.removeFromCache.bind(imageCacheManager);
export const updateCacheSettings = imageCacheManager.updateCacheSettings.bind(imageCacheManager);