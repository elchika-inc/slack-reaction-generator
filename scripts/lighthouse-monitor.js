#!/usr/bin/env node

/**
 * Lighthouse継続的モニタリングスクリプト
 * SEOとパフォーマンスのスコアを定期的に計測
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const LIGHTHOUSE_CMD = 'lighthouse';
const TARGET_URL = process.env.MONITOR_URL || 'http://localhost:4173';
const OUTPUT_DIR = './lighthouse-reports';
const THRESHOLD_SCORES = {
  performance: 90,
  accessibility: 90,
  'best-practices': 95,
  seo: 100
};

async function runLighthouse() {
  try {
    // 出力ディレクトリを作成
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputPath = path.join(OUTPUT_DIR, `lighthouse-${timestamp}.json`);

    console.log(`🔍 Lighthouseスコア計測中... (${TARGET_URL})`);

    // Lighthouseを実行
    const cmd = `${LIGHTHOUSE_CMD} ${TARGET_URL} --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=${outputPath} --chrome-flags="--headless"`;
    execSync(cmd, { stdio: 'inherit' });

    // 結果を読み込み
    const report = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
    const scores = report.categories;

    console.log('\n📊 Lighthouseスコア結果:');
    console.log('='.repeat(40));

    let allPassed = true;
    for (const [category, data] of Object.entries(scores)) {
      const score = Math.round(data.score * 100);
      const threshold = THRESHOLD_SCORES[category];
      const status = score >= threshold ? '✅' : '❌';
      
      if (score < threshold) {
        allPassed = false;
      }

      console.log(`${status} ${data.title}: ${score}/100 (閾値: ${threshold})`);
    }

    console.log('='.repeat(40));

    if (allPassed) {
      console.log('🎉 全てのスコアが閾値を満たしています！');
    } else {
      console.log('⚠️  改善が必要なスコアがあります。');
      process.exit(1);
    }

    // 最新の結果をlatest.jsonとしても保存
    fs.copyFileSync(outputPath, path.join(OUTPUT_DIR, 'latest.json'));

  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    process.exit(1);
  }
}

// GitHub Actionsからの実行時は引数をチェック
if (process.argv.includes('--ci')) {
  console.log('🚀 CI環境でのLighthouse計測を開始...');
}

runLighthouse();