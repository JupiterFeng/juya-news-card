import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import { chromium } from 'playwright';
import dotenv from 'dotenv';
import { generateDownloadableHtml } from '../src/utils/template.js';
import { sanitizeDescHtml } from '../src/utils/desc-format.js';
import type { GeneratedContent } from '../src/types';

// Load environment variables
dotenv.config();
dotenv.config({ path: '.env.local', override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.LLM_API_KEY || process.env.VITE_API_KEY;
const BASE_URL = process.env.LLM_API_BASE_URL || process.env.VITE_API_BASE_URL;
const MODEL = process.env.LLM_MODEL || process.env.VITE_API_MODEL || 'gpt-4o-mini';

if (!API_KEY) {
  console.error('Error: LLM_API_KEY is not set (check .env or .env.local).');
  process.exit(1);
}

const client = new OpenAI({
  apiKey: API_KEY,
  baseURL: BASE_URL,
});

async function main() {
  const inputText = process.argv[2];
  if (!inputText) {
    console.error('Usage: npm run generate "your news text here"');
    process.exit(1);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputDir = path.join(process.cwd(), `output/news-${timestamp}`);
  fs.mkdirSync(outputDir, { recursive: true });

  console.log('--- 1. Calling LLM to extract content ---');
  
  const systemPrompt = `You are an expert news editor. Your task is to extract key points from the provided news text and return a JSON object.

RULES:
1. mainTitle: Extract a concise title, adding spaces between Chinese and English characters.
2. cards: Extract 2-8 key points.
3. Each card has:
   - title: 2-8 characters.
   - desc: 20-40 words, concise. Use **bold** for data/prices and \`code\` for model names/English terms.
   - icon: A valid Material Icons name related to the content.

OUTPUT FORMAT:
{
  "mainTitle": "string",
  "cards": [
    { "title": "string", "desc": "string", "icon": "string" }
  ]
}

Return ONLY raw JSON, no other text.`;

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: inputText }
      ],
      temperature: 0.7,
    });

    const rawContent = response.choices[0].message.content || '';
    
    // Save raw LLM output
    fs.writeFileSync(path.join(outputDir, 'raw-content.txt'), rawContent);
    console.log(`Saved raw content to ${path.join(outputDir, 'raw-content.txt')}`);

    // Try to parse JSON
    let content;
    try {
      // Handle cases where LLM might wrap JSON in code blocks
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        content = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (e) {
      console.error('Failed to parse LLM response as JSON. Raw response saved.');
      console.error('Raw content:', rawContent);
      process.exit(1);
    }

    const normalizedContent: GeneratedContent = {
      mainTitle: typeof content?.mainTitle === 'string' ? content.mainTitle : '',
      cards: Array.isArray(content?.cards)
        ? content.cards.map((card: unknown) => {
          const obj = (card ?? {}) as Record<string, unknown>;
          return {
            title: typeof obj.title === 'string' ? obj.title : '',
            desc: sanitizeDescHtml(obj.desc),
            icon: typeof obj.icon === 'string' ? obj.icon : 'article',
          };
        })
        : [],
    };

    console.log('--- 2. Generating HTML ---');
    const html = generateDownloadableHtml(normalizedContent);
    const htmlPath = path.join(outputDir, 'news-card.html');
    fs.writeFileSync(htmlPath, html);
    console.log(`Saved HTML to ${htmlPath}`);

    console.log('--- 3. Taking 1080p Screenshot ---');
    const browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    // Inject local font for screenshot if available
    const fontPath = path.join(process.cwd(), 'assets/htmlFont.ttf');
    let finalHtml = html;
    if (fs.existsSync(fontPath)) {
      const fontBase64 = fs.readFileSync(fontPath).toString('base64');
      const fontFace = `
        <style>
          @font-face {
            font-family: 'CustomPreviewFont';
            src: url(data:font/ttf;base64,${fontBase64}) format('truetype');
          }
          .main-container {
            font-family: 'CustomPreviewFont', system-ui, -apple-system, sans-serif !important;
          }
        </style>
      `;
      finalHtml = html.replace('</head>', `${fontFace}</head>`);
    }

    // Load the HTML
    await page.setContent(finalHtml, { waitUntil: 'networkidle' });

    // Wait for fonts and effects to render
    await page.waitForTimeout(2000);

    const screenshotPath = path.join(outputDir, 'screenshot.png');
    await page.screenshot({
      path: screenshotPath,
      animations: 'disabled',
    });

    await browser.close();
    console.log(`Saved screenshot to ${screenshotPath}`);

    console.log('\n--- Done! ---');
    console.log(`Output folder: ${outputDir}`);

  } catch (error) {
    console.error('Error during execution:', error);
    process.exit(1);
  }
}

main();
