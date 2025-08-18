// 画像キャッシュ
const imageCache = new Map()

export const getOrLoadImage = (src) => {
  if (!src) return null
  
  // キャッシュチェック
  if (imageCache.has(src)) {
    return imageCache.get(src)
  }
  
  // 新しい画像を作成してキャッシュ
  const img = new Image()
  img.src = src
  imageCache.set(src, img)
  
  return img
}

export const preloadImage = async (src) => {
  if (!src) return null
  
  const img = getOrLoadImage(src)
  
  // 画像の読み込みを待つ
  if (!img.complete) {
    return new Promise((resolve, reject) => {
      img.onload = () => resolve(img)
      img.onerror = reject
    })
  }
  
  return img
}

export const clearImageCache = () => {
  imageCache.clear()
}