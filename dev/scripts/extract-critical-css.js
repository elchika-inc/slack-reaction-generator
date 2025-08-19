import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function extractCriticalCSS() {
  const distDir = path.join(__dirname, '../dist');
  const assetsDir = path.join(distDir, 'assets');
  const htmlPath = path.join(distDir, 'index.html');
  
  try {
    // assetsディレクトリが存在するかチェック
    try {
      await fs.access(assetsDir);
    } catch {
      console.log('✅ Critical CSS extraction skipped - CSS is already inlined');
      return;
    }
    
    // CSSファイルを動的に見つける
    const files = await fs.readdir(assetsDir);
    const cssFile = files.find(file => file.startsWith('index-') && file.endsWith('.css'));
    
    if (!cssFile) {
      throw new Error('CSS file not found in assets directory');
    }
    
    const cssPath = path.join(assetsDir, cssFile);
    
    // CSSファイルを読み込み
    const css = await fs.readFile(cssPath, 'utf8');
    
    // クリティカルなCSSクラスを抽出（初期表示に必要なもののみ）
    const criticalClasses = [
      'bg-gradient-to-br', 'from-purple-600', 'to-pink-600',
      'min-h-screen', 'flex', 'items-center', 'justify-center',
      'text-white', 'text-center', 'font-bold', 'text-2xl',
      'animate-pulse', 'rounded', 'p-4', 'bg-gray-100',
      'container', 'mx-auto', 'px-4', 'py-8',
      'grid', 'grid-cols-1', 'lg:grid-cols-2', 'gap-8',
      'bg-white', 'rounded-lg', 'shadow-lg', 'p-6'
    ];
    
    // クリティカルCSSを抽出
    let criticalCSS = '';
    const lines = css.split('\n');
    let inCriticalRule = false;
    let currentRule = '';
    
    for (const line of lines) {
      if (line.includes('{')) {
        // クリティカルクラスが含まれているかチェック
        const hasCriticalClass = criticalClasses.some(cls => 
          line.includes('.' + cls) || line.includes('\\.' + cls)
        );
        if (hasCriticalClass) {
          inCriticalRule = true;
          currentRule = line + '\n';
        }
      } else if (inCriticalRule) {
        currentRule += line + '\n';
        if (line.includes('}')) {
          criticalCSS += currentRule;
          inCriticalRule = false;
          currentRule = '';
        }
      }
    }
    
    // ベースのリセットCSSも追加
    const resetCSS = `*{margin:0;padding:0;box-sizing:border-box}html{font-family:system-ui,-apple-system,sans-serif;line-height:1.5}body{min-height:100vh}`;
    
    // 最小化
    criticalCSS = resetCSS + criticalCSS
      .replace(/\s+/g, ' ')
      .replace(/:\s+/g, ':')
      .replace(/;\s+/g, ';')
      .replace(/\{\s+/g, '{')
      .replace(/\}\s+/g, '}')
      .trim();
    
    // HTMLファイルを読み込み
    let html = await fs.readFile(htmlPath, 'utf8');
    
    // 既存のインラインスタイルを削除
    html = html.replace(/<style>.*?<\/style>/gs, '');
    
    // クリティカルCSSをheadに挿入
    const styleTag = `<style>${criticalCSS}</style>`;
    html = html.replace('</title>', `</title>\n    ${styleTag}`);
    
    // メインCSSをpreloadに変更
    html = html.replace(
      /<link rel="stylesheet" crossorigin href="(\/assets\/index-[^"]+\.css)">/,
      '<link rel="preload" as="style" href="$1" onload="this.onload=null;this.rel=\'stylesheet\'">\n    <noscript><link rel="stylesheet" href="$1"></noscript>'
    );
    
    // HTMLファイルを保存
    await fs.writeFile(htmlPath, html);
    
    console.log('✅ Critical CSS extracted and inlined');
    console.log(`   Critical CSS size: ${(criticalCSS.length / 1024).toFixed(2)}KB`);
    
  } catch (error) {
    console.error('❌ Failed to extract critical CSS:', error);
  }
}

extractCriticalCSS().catch(console.error);