import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function convertImages() {
  const publicDir = path.join(__dirname, '../public');
  
  // OGP画像をAVIF形式に変換
  const images = [
    { input: 'og-image.webp', output: 'og-image.avif', width: 1200 },
    { input: 'twitter-card.webp', output: 'twitter-card.avif', width: 800 }
  ];
  
  for (const img of images) {
    try {
      const inputPath = path.join(publicDir, img.input);
      const outputPath = path.join(publicDir, img.output);
      
      await sharp(inputPath)
        .resize(img.width)
        .avif({ quality: 50, effort: 9 })
        .toFile(outputPath);
      
      const stats = await fs.stat(outputPath);
      console.log(`✅ ${img.output}: ${(stats.size / 1024).toFixed(1)}KB`);
    } catch (error) {
      console.error(`❌ Failed to convert ${img.input}:`, error.message);
    }
  }
}

convertImages().catch(console.error);