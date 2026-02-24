/**
 * 按分类生成主题抽检包：
 * 1) 生成按分类抽样清单（Markdown）
 * 2) 可选渲染截图（2/3/5/8 卡）并输出一个 index.html 方便人工审阅
 *
 * 用法：
 *   npm run review-pack
 *   npm run review-pack -- --sample 2
 *   npm run review-pack -- --sample 2 --cards 2,3,5,8 --render
 */

import fs from 'fs';
import path from 'path';
import vm from 'vm';
import minimist from 'minimist';
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import mockData from '../tests/mock-data.json';
import { TEMPLATES } from '../src/templates/index.js';
import { generateHtmlFromReactComponent } from '../server/ssr-helper.js';

interface ThemeCategory {
  id: string;
  name: string;
  icon: string;
  themeIds: string[];
}

interface ShotItem {
  categoryId: string;
  categoryName: string;
  themeId: string;
  cardCount: number;
  imagePath: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = minimist(process.argv.slice(2), {
  boolean: ['render'],
  default: {
    sample: 2,
    cards: '2,3,5,8',
    render: false,
  },
});

function timestampForPath(): string {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function parseCardCounts(raw: string): number[] {
  const parsed = raw
    .split(',')
    .map((v) => Number(v.trim()))
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= mockData.length);
  const unique = [...new Set(parsed)];
  return unique.length > 0 ? unique : [2, 3, 5, 8];
}

function loadThemeCategories(): ThemeCategory[] {
  const selectorPath = path.join(process.cwd(), 'src', 'components', 'TemplateSelector.tsx');
  const source = fs.readFileSync(selectorPath, 'utf8');
  const match = source.match(/const THEME_CATEGORIES:[\s\S]*?=\s*(\[[\s\S]*?\n\]);/);

  if (!match) {
    throw new Error('无法在 TemplateSelector.tsx 中解析 THEME_CATEGORIES');
  }

  const arrayLiteral = match[1];
  const categories = vm.runInNewContext(`(${arrayLiteral})`) as ThemeCategory[];
  return categories.filter((c) => Array.isArray(c.themeIds) && c.themeIds.length > 0);
}

function pickSamples(themeIds: string[], sampleSize: number): string[] {
  const valid = themeIds.filter((id) => Boolean(TEMPLATES[id]));
  if (valid.length <= sampleSize) return valid;

  const pinned: string[] = [];
  if (valid.includes('claudeStyle')) pinned.push('claudeStyle');
  if (valid.includes('collageScrapbook')) pinned.push('collageScrapbook');

  const uniquePinned = [...new Set(pinned)].slice(0, sampleSize);
  const remaining = valid.filter((id) => !uniquePinned.includes(id));
  const slots = sampleSize - uniquePinned.length;

  if (slots <= 0) return uniquePinned;

  const picks: string[] = [];
  for (let i = 0; i < slots; i += 1) {
    const idx = Math.floor(((i + 0.5) * remaining.length) / slots);
    const clamped = Math.max(0, Math.min(remaining.length - 1, idx));
    picks.push(remaining[clamped]);
  }

  return [...uniquePinned, ...new Set(picks)].slice(0, sampleSize);
}

function buildChecklistMarkdown(
  categories: ThemeCategory[],
  sampledByCategory: Map<string, string[]>,
  cardCounts: number[],
  outputDir: string
): string {
  const lines: string[] = [];
  lines.push('# 主题分类抽检清单');
  lines.push('');
  lines.push(`- 生成时间: ${new Date().toISOString()}`);
  lines.push(`- 抽检目录: \`${outputDir}\``);
  lines.push(`- 每类抽样数: ${args.sample}`);
  lines.push(`- 卡片数场景: ${cardCounts.join(', ')}`);
  lines.push('');
  lines.push('## 审阅方法');
  lines.push('');
  lines.push('1. 每个主题只看 2/3/5/8 卡四张图。');
  lines.push('2. 重点看卡片区是否贴边、2/3 卡是否过宽、标题和正文比例是否协调。');
  lines.push('3. 任一场景异常，记录「主题ID + 卡片数 + 问题描述」。');
  lines.push('');

  for (const cat of categories) {
    const samples = sampledByCategory.get(cat.id) || [];
    if (samples.length === 0) continue;
    lines.push(`## ${cat.name} (\`${cat.id}\`)`);
    lines.push('');
    lines.push(`- 抽样主题: ${samples.map((id) => `\`${id}\``).join('、')}`);
    lines.push(`- 必看卡片数: ${cardCounts.join(', ')}`);
    lines.push('');
  }

  return lines.join('\n');
}

function injectFontFace(html: string): string {
  const fontPath = path.join(process.cwd(), 'assets/htmlFont.ttf');
  if (!fs.existsSync(fontPath)) return html;
  const fontBase64 = fs.readFileSync(fontPath).toString('base64');
  const fontFace = `
    <style>
      @font-face {
        font-family: 'CustomPreviewFont';
        src: url(data:font/ttf;base64,${fontBase64}) format('truetype');
      }
    </style>
  `;
  return html.replace('</head>', `${fontFace}</head>`);
}

async function renderShots(
  categories: ThemeCategory[],
  sampledByCategory: Map<string, string[]>,
  cardCounts: number[],
  outputDir: string
): Promise<ShotItem[]> {
  const shots: ShotItem[] = [];
  const browser = await chromium.launch();

  try {
    for (const cat of categories) {
      const sampled = sampledByCategory.get(cat.id) || [];
      for (const themeId of sampled) {
        const themeDir = path.join(outputDir, cat.id, themeId);
        fs.mkdirSync(themeDir, { recursive: true });

        for (const cardCount of cardCounts) {
          const data = mockData[cardCount - 1];
          if (!data) continue;
          const html = injectFontFace(generateHtmlFromReactComponent(data, themeId));

          const context = await browser.newContext({
            viewport: { width: 1920, height: 1080 },
            deviceScaleFactor: 1,
          });
          const page = await context.newPage();
          await page.setContent(html, { waitUntil: 'networkidle' });
          await page.waitForTimeout(900);

          const imagePath = path.join(themeDir, `cards-${cardCount}.png`);
          await page.screenshot({ path: imagePath });
          await context.close();

          shots.push({
            categoryId: cat.id,
            categoryName: cat.name,
            themeId,
            cardCount,
            imagePath: path.relative(outputDir, imagePath).replaceAll(path.sep, '/'),
          });
        }
      }
    }
  } finally {
    await browser.close();
  }

  return shots;
}

function writeHtmlIndex(outputDir: string, shots: ShotItem[]): void {
  const grouped = new Map<string, ShotItem[]>();
  for (const s of shots) {
    const key = `${s.categoryId}::${s.themeId}`;
    const list = grouped.get(key) || [];
    list.push(s);
    grouped.set(key, list);
  }

  const blocks: string[] = [];
  blocks.push('<!doctype html>');
  blocks.push('<html lang="zh-CN"><head><meta charset="UTF-8" />');
  blocks.push('<meta name="viewport" content="width=device-width, initial-scale=1.0" />');
  blocks.push('<title>Theme Review Pack</title>');
  blocks.push('<style>');
  blocks.push('body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#f5f7fb;color:#111;padding:24px;}');
  blocks.push('.row{background:#fff;border:1px solid #dde3ee;border-radius:12px;padding:16px;margin-bottom:16px;}');
  blocks.push('.meta{font-size:14px;color:#4b5563;margin-bottom:10px;}');
  blocks.push('.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;}');
  blocks.push('.item{border:1px solid #e5eaf3;border-radius:10px;overflow:hidden;background:#fff;}');
  blocks.push('.cap{font-size:13px;padding:6px 10px;background:#f8faff;border-bottom:1px solid #e5eaf3;}');
  blocks.push('img{width:100%;height:auto;display:block;}');
  blocks.push('</style></head><body>');
  blocks.push('<h1>Theme Review Pack</h1>');
  blocks.push(`<p>Generated at: ${new Date().toISOString()}</p>`);

  for (const [key, list] of grouped) {
    list.sort((a, b) => a.cardCount - b.cardCount);
    const first = list[0];
    blocks.push('<section class="row">');
    blocks.push(`<div class="meta"><strong>${first.categoryName}</strong> / <code>${first.themeId}</code></div>`);
    blocks.push('<div class="grid">');
    for (const item of list) {
      blocks.push('<article class="item">');
      blocks.push(`<div class="cap">${item.cardCount} cards</div>`);
      blocks.push(`<img src="${item.imagePath}" alt="${item.themeId} ${item.cardCount} cards" loading="lazy" />`);
      blocks.push('</article>');
    }
    blocks.push('</div></section>');
  }

  blocks.push('</body></html>');
  fs.writeFileSync(path.join(outputDir, 'index.html'), blocks.join('\n'), 'utf8');
}

async function main() {
  const sampleSize = Math.max(1, Number(args.sample) || 2);
  const cardCounts = parseCardCounts(String(args.cards));
  const categories = loadThemeCategories();

  const sampledByCategory = new Map<string, string[]>();
  for (const cat of categories) {
    sampledByCategory.set(cat.id, pickSamples(cat.themeIds, sampleSize));
  }

  const outputDir = path.join(process.cwd(), 'output', `review-pack-${timestampForPath()}`);
  fs.mkdirSync(outputDir, { recursive: true });

  const checklist = buildChecklistMarkdown(categories, sampledByCategory, cardCounts, outputDir);
  fs.writeFileSync(path.join(outputDir, 'CHECKLIST.md'), checklist, 'utf8');

  console.log(`Checklist generated: ${path.join(outputDir, 'CHECKLIST.md')}`);

  if (args.render) {
    console.log('Rendering screenshots...');
    const shots = await renderShots(categories, sampledByCategory, cardCounts, outputDir);
    writeHtmlIndex(outputDir, shots);
    console.log(`Review index generated: ${path.join(outputDir, 'index.html')}`);
  } else {
    console.log('Skip rendering screenshots (use --render to enable).');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
