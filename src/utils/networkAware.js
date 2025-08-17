// ネットワーク速度に基づいたアダプティブローディング
export function getConnectionType() {
  const connection = navigator.connection || 
                     navigator.mozConnection || 
                     navigator.webkitConnection;
  
  if (!connection) return 'unknown';
  
  return {
    effectiveType: connection.effectiveType, // '4g', '3g', '2g', 'slow-2g'
    downlink: connection.downlink, // Mbps
    rtt: connection.rtt, // Round Trip Time (ms)
    saveData: connection.saveData || false
  };
}

// 画像の品質を調整
export function getOptimalImageQuality() {
  const conn = getConnectionType();
  
  if (conn === 'unknown') return 'high';
  if (conn.saveData) return 'low';
  
  switch (conn.effectiveType) {
    case '4g': return 'high';
    case '3g': return 'medium';
    case '2g': 
    case 'slow-2g': return 'low';
    default: return 'medium';
  }
}

// 機能の有効/無効を判定
export function shouldEnableFeature(feature) {
  const conn = getConnectionType();
  
  if (conn === 'unknown') return true;
  if (conn.saveData) return false;
  
  const features = {
    animations: ['4g', '3g'],
    heavyImages: ['4g'],
    autoDownload: ['4g']
  };
  
  return features[feature]?.includes(conn.effectiveType) ?? false;
}

// メモリ使用量の確認
export function getMemoryStatus() {
  if ('memory' in performance) {
    const memory = performance.memory;
    const usedPercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    
    return {
      used: memory.usedJSHeapSize,
      total: memory.jsHeapSizeLimit,
      percent: usedPercent,
      isLow: usedPercent > 90
    };
  }
  
  return null;
}