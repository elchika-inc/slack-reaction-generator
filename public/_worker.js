// Cloudflare Workers用のSPA対応スクリプト
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // 静的アセットのパスを定義
    const assetPaths = [
      '/assets/',
      '/gif.worker.js',
      '.js',
      '.css',
      '.png',
      '.jpg',
      '.gif',
      '.svg',
      '.ico',
      '.woff',
      '.woff2',
      '.ttf',
      '.eot'
    ];
    
    // 静的アセットかどうかチェック
    const isAsset = assetPaths.some(path => 
      url.pathname.includes(path) || url.pathname.endsWith(path)
    );
    
    // セキュリティヘッダーを設定
    const securityHeaders = {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self';"
    };
    
    // アセットファイルの場合はそのまま返す
    if (isAsset) {
      const response = await env.ASSETS.fetch(request);
      if (response.status === 200) {
        const newResponse = new Response(response.body, response);
        
        // キャッシュヘッダーを設定
        if (url.pathname.includes('/assets/')) {
          newResponse.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
        } else if (url.pathname.endsWith('.gif') || url.pathname.endsWith('.png') || url.pathname.endsWith('.jpg')) {
          newResponse.headers.set('Cache-Control', 'public, max-age=86400');
        }
        
        // セキュリティヘッダーを追加
        Object.entries(securityHeaders).forEach(([key, value]) => {
          newResponse.headers.set(key, value);
        });
        
        return newResponse;
      }
    }
    
    // SPAのため、すべてのルートでindex.htmlを返す
    const indexRequest = new Request(new URL('/index.html', request.url), request);
    const response = await env.ASSETS.fetch(indexRequest);
    
    // レスポンスを複製してヘッダーを追加
    const newResponse = new Response(response.body, response);
    
    // セキュリティヘッダーを追加
    Object.entries(securityHeaders).forEach(([key, value]) => {
      newResponse.headers.set(key, value);
    });
    
    return newResponse;
  }
}