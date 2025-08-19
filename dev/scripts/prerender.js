// プリレンダリングスクリプト
// 静的HTMLに初期状態を埋め込む

import fs from 'fs';
import path from 'path';

const prerender = () => {
  const distPath = path.join(process.cwd(), 'dist');
  const indexPath = path.join(distPath, 'index.html');
  
  // index.htmlを読み込み
  let html = fs.readFileSync(indexPath, 'utf-8');
  
  // ローディングプレースホルダーを最適化
  const optimizedLoader = `
    <div id="root">
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%)">
        <div style="text-align:center;color:white">
          <h1 style="font-size:2rem;margin-bottom:1rem;font-weight:bold">Slack Reaction Generator</h1>
          <p style="opacity:0.9">カスタム絵文字を生成中...</p>
          <div style="width:50px;height:50px;border:5px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:spin 1s linear infinite;margin:20px auto 0"></div>
        </div>
      </div>
    </div>
  `;
  
  // rootの内容を置き換え
  html = html.replace(/<div id="root">.*?<\/div>/s, optimizedLoader);
  
  // 保存
  fs.writeFileSync(indexPath, html);
  console.log('✅ Prerendering completed');
};

prerender();