#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { generateHtmlFromReactComponent } from '../../../../server/ssr-helper.js';
import { TEMPLATES } from '../../../../src/templates/index.js';

function usage(): void {
  console.log(`Usage:
  node --import tsx .agents/skills/juya-news-card-operator/scripts/render_from_content_local.ts --content-file <path> --output <path> [options]

Required:
  --content-file <path>   JSON file:
                          {
                            "mainTitle": "string",
                            "cards": [
                              { "title": "string", "desc": "string", "icon": "string" }
                            ]
                          }
  --output <path>         Output PNG path

Options:
  --template <id>         Template ID (default: claudeStyle)
  --dpr <1|2>             DPR for rendering (default: 1)
  --list-themes           List SSR-ready themes and exit
  --wait-ms <number>      Extra wait before screenshot (default: 1200)
  --help                  Show this help
`);
}

function parseArgs(argv: string[]): Record<string, string | boolean> {
  const parsed: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;

    const body = token.slice(2);
    const eqIndex = body.indexOf('=');
    if (eqIndex >= 0) {
      parsed[body.slice(0, eqIndex)] = body.slice(eqIndex + 1);
      continue;
    }

    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      parsed[body] = next;
      i += 1;
    } else {
      parsed[body] = true;
    }
  }
  return parsed;
}

type RenderCard = { title: string; desc: string; icon: string };
type RenderContent = { mainTitle: string; cards: RenderCard[] };

function toStringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function toRenderContent(input: unknown): RenderContent {
  const data = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  const cardsRaw = Array.isArray(data.cards) ? data.cards : [];
  const cards: RenderCard[] = cardsRaw.map((item) => {
    const card = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
    return {
      title: toStringValue(card.title),
      desc: toStringValue(card.desc),
      icon: toStringValue(card.icon) || 'article',
    };
  });

  return {
    mainTitle: toStringValue(data.mainTitle),
    cards,
  };
}

function validateContent(content: RenderContent): void {
  if (!content.mainTitle) throw new Error('`mainTitle` is required');
  if (!Array.isArray(content.cards) || content.cards.length < 1 || content.cards.length > 8) {
    throw new Error('`cards` must be array with length 1..8');
  }

  for (let i = 0; i < content.cards.length; i += 1) {
    const card = content.cards[i];
    if (!card.title) throw new Error(`cards[${i}].title is required`);
    if (!card.desc) throw new Error(`cards[${i}].desc is required`);
    if (!card.icon) throw new Error(`cards[${i}].icon is required`);
  }
}

function listThemes(): void {
  const themes = Object.values(TEMPLATES)
    .filter((t) => t?.ssrReady)
    .sort((a, b) => a.id.localeCompare(b.id));
  console.log(`SSR-ready themes (${themes.length}):`);
  for (const t of themes) {
    console.log(`- ${t.id}${t.name ? ` (${t.name})` : ''}`);
  }
}

function injectOptionalFont(html: string): string {
  const fontPath = path.join(process.cwd(), 'assets/htmlFont.ttf');
  if (!fs.existsSync(fontPath)) return html;

  const fontBase64 = fs.readFileSync(fontPath).toString('base64');
  const style = `
<style>
  @font-face {
    font-family: 'CustomPreviewFont';
    src: url(data:font/ttf;base64,${fontBase64}) format('truetype');
  }
  .main-container {
    font-family: 'CustomPreviewFont', system-ui, -apple-system, sans-serif !important;
  }
</style>`;

  const marker = '</head>';
  const idx = html.indexOf(marker);
  if (idx < 0) return html;
  return html.slice(0, idx) + style + html.slice(idx);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || args.h) {
    usage();
    return;
  }

  if (args['list-themes']) {
    listThemes();
    return;
  }

  const contentFile = String(args['content-file'] || '');
  const outputPath = String(args.output || '');
  const templateId = String(args.template || 'claudeStyle').trim();
  const dpr = Number(args.dpr || 1) === 2 ? 2 : 1;
  const waitMsRaw = Number(args['wait-ms'] || 1200);
  const waitMs = Number.isFinite(waitMsRaw) ? Math.max(0, Math.min(15000, Math.round(waitMsRaw))) : 1200;

  if (!contentFile) throw new Error('Missing --content-file');
  if (!outputPath) throw new Error('Missing --output');
  if (!templateId) throw new Error('Missing --template');
  if (!fs.existsSync(contentFile)) throw new Error(`Content file not found: ${contentFile}`);

  const template = TEMPLATES[templateId];
  if (!template) throw new Error(`Unknown templateId: ${templateId}`);
  if (!template.ssrReady) throw new Error(`Template not SSR-ready: ${templateId}`);

  const raw = fs.readFileSync(contentFile, 'utf-8');
  const content = toRenderContent(JSON.parse(raw));
  validateContent(content);

  const html = injectOptionalFont(generateHtmlFromReactComponent(content, templateId));
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: dpr as 1 | 2,
    });
    try {
      const page = await context.newPage();
      await page.setContent(html, { waitUntil: 'networkidle' });
      if (waitMs > 0) await page.waitForTimeout(waitMs);

      const outputDir = path.dirname(outputPath);
      fs.mkdirSync(outputDir, { recursive: true });
      await page.screenshot({
        path: outputPath,
        type: 'png',
        animations: 'disabled',
      });
    } finally {
      await context.close();
    }
  } finally {
    await browser.close();
  }

  console.log(`Rendered: ${path.resolve(outputPath)}`);
  console.log(`Template: ${templateId}, dpr: ${dpr}, cards: ${content.cards.length}`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Error: ${message}`);
  process.exit(1);
});
