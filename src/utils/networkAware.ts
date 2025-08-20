// 機能の有効/無効を判定（使用中の関数のみ保持）
export function shouldEnableFeature(feature) {
  const connection = navigator.connection || 
                     navigator.mozConnection || 
                     navigator.webkitConnection;
  
  if (!connection) return true;
  
  const conn = {
    effectiveType: connection.effectiveType,
    saveData: connection.saveData || false
  };
  
  if (conn.saveData) return false;
  
  const features = {
    animations: ['4g', '3g'],
    heavyImages: ['4g'],
    autoDownload: ['4g']
  };
  
  return features[feature]?.includes(conn.effectiveType) ?? false;
}