import OpenAI from 'openai';
import { chromium } from 'playwright';
import { TEMPLATES } from '../src/templates';
import type { GeneratedContent } from '../src/types';
import { parseJsonToContent, parseMarkdownToContent } from '../src/utils/markdown-content';
import { sanitizeDescHtml } from '../src/utils/desc-format';
import { DEFAULT_SYSTEM_PROMPT } from '../src/services/llm-prompt';
import { generateHtmlFromReactComponent } from './ssr-helper';

type Json = Record<string, unknown>;

type RenderCard = { title: string; desc: string; icon: string };

export type RenderRequestBody = {
  templateId: string;
  mainTitle: string;
  cards: RenderCard[];
  dpr?: 1 | 2;
};

function readEnv(name: string): string {
  return String(process.env[name] || '').trim();
}

function parseIntEnv(name: string, fallback: number, min: number, max: number): number {
  const raw = readEnv(name);
  if (!raw) return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < min || n > max) return fallback;
  return n;
}

function parseNumberEnv(name: string, fallback: number, min: number, max: number): number {
  const raw = readEnv(name);
  if (!raw) return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < min || n > max) return fallback;
  return n;
}

function parseBoolEnv(name: string, fallback: boolean): boolean {
  const raw = readEnv(name).toLowerCase();
  if (!raw) return fallback;
  if (['1', 'true', 'yes', 'on'].includes(raw)) return true;
  if (['0', 'false', 'no', 'off'].includes(raw)) return false;
  return fallback;
}

function parseCsvEnv(name: string): string[] {
  const raw = readEnv(name);
  if (!raw) return [];
  return raw.split(',').map(x => x.trim()).filter(Boolean);
}

const LLM_API_KEY = readEnv('LLM_API_KEY');
const LLM_API_BASE_URL = readEnv('LLM_API_BASE_URL');
const LLM_MODEL_DEFAULT = readEnv('LLM_MODEL') || 'gpt-4o-mini';
const LLM_TIMEOUT_MS_DEFAULT = parseIntEnv('LLM_TIMEOUT_MS', 120_000, 1000, 300_000);
const LLM_MAX_RETRIES_DEFAULT = parseIntEnv('LLM_MAX_RETRIES', 0, 0, 10);
const LLM_TEMPERATURE_DEFAULT = parseNumberEnv('LLM_TEMPERATURE', 0.7, 0, 2);
const LLM_TOP_P_DEFAULT = parseNumberEnv('LLM_TOP_P', 1, 0, 1);
const ALLOW_CLIENT_LLM_SETTINGS = parseBoolEnv('ALLOW_CLIENT_LLM_SETTINGS', false);
const LLM_MAX_TOKENS_CAP = parseIntEnv('LLM_MAX_TOKENS_CAP', 4096, 0, 200000);
const LLM_MAX_TOKENS_DEFAULT = parseIntEnv('LLM_MAX_TOKENS_DEFAULT', 0, 0, LLM_MAX_TOKENS_CAP);
const LLM_ALLOWED_MODELS = (() => {
  const values = parseCsvEnv('LLM_ALLOWED_MODELS');
  if (!values.includes(LLM_MODEL_DEFAULT)) values.unshift(LLM_MODEL_DEFAULT);
  return values;
})();
const ALLOW_UNAUTHENTICATED_WRITE = parseBoolEnv('ALLOW_UNAUTHENTICATED_WRITE', process.env.NODE_ENV !== 'production');
const API_BEARER_TOKEN = readEnv('API_BEARER_TOKEN');
const MAX_INPUT_TEXT_CHARS = parseIntEnv('MAX_INPUT_TEXT_CHARS', 12000, 100, 100000);

function normalizeIcon(value: string, fallback = 'article'): string {
  const token = String(value || '').trim().toLowerCase().replaceAll('-', '_');
  return /^[a-z0-9_,\s]{2,150}$/i.test(token) ? token : fallback;
}

function extractLlmText(response: unknown): string {
  if (!response || typeof response !== 'object') return '';
  const data = response as Json;
  const choices = Array.isArray(data.choices) ? data.choices : [];
  const first = choices[0];
  if (!first || typeof first !== 'object') return '';

  const message = (first as Json).message;
  if (message && typeof message === 'object') {
    const content = (message as Json).content;
    if (typeof content === 'string') return content.trim();
    if (Array.isArray(content)) {
      const text = content
        .map(item => {
          if (typeof item === 'string') return item;
          if (!item || typeof item !== 'object') return '';
          return String((item as Json).text || '');
        })
        .join('\n')
        .trim();
      if (text) return text;
    }
  }

  const rawText = (first as Json).text;
  return typeof rawText === 'string' ? rawText.trim() : '';
}

function parseBearerToken(authHeader: string | null): string {
  const header = String(authHeader || '').trim();
  if (!header.toLowerCase().startsWith('bearer ')) return '';
  return header.slice(7).trim();
}

function isWriteAllowed(authHeader: string | null): boolean {
  if (ALLOW_UNAUTHENTICATED_WRITE) return true;
  if (!API_BEARER_TOKEN) return false;
  return parseBearerToken(authHeader) === API_BEARER_TOKEN;
}

export function buildPublicConfig(): Json {
  return {
    llm: {
      allowClientLlmSettings: ALLOW_CLIENT_LLM_SETTINGS,
      model: LLM_MODEL_DEFAULT,
      temperature: LLM_TEMPERATURE_DEFAULT,
      topP: LLM_TOP_P_DEFAULT,
      maxTokens: LLM_MAX_TOKENS_DEFAULT,
      timeoutMs: LLM_TIMEOUT_MS_DEFAULT,
      maxRetries: LLM_MAX_RETRIES_DEFAULT,
      baseURL: LLM_API_BASE_URL,
      allowedModels: [...LLM_ALLOWED_MODELS],
    },
  };
}

export function buildThemesPayload(): Json {
  const themes = Object.values(TEMPLATES)
    .filter(t => t.ssrReady)
    .map(t => ({
      id: t.id,
      name: t.name,
      downloadable: t.downloadable !== false,
      ssrReady: t.ssrReady === true,
    }));
  return { themes };
}

export function healthPayload(): Json {
  return {
    status: 'ok',
    service: 'juya-news-card-next',
    now: new Date().toISOString(),
  };
}

export async function generateContent(inputTextRaw: unknown, authHeader: string | null): Promise<GeneratedContent> {
  if (!isWriteAllowed(authHeader)) {
    throw new Error('Unauthorized');
  }
  if (!LLM_API_KEY) {
    throw new Error('LLM_API_KEY is not configured on the server');
  }

  const inputText = String(inputTextRaw || '').trim();
  if (!inputText) throw new Error('Missing inputText');
  if (inputText.length > MAX_INPUT_TEXT_CHARS) {
    throw new Error(`inputText is too long (>${MAX_INPUT_TEXT_CHARS} chars)`);
  }

  const client = new OpenAI({
    apiKey: LLM_API_KEY,
    baseURL: LLM_API_BASE_URL || undefined,
    timeout: LLM_TIMEOUT_MS_DEFAULT,
    maxRetries: LLM_MAX_RETRIES_DEFAULT,
  });

  let response: unknown;
  try {
    response = await client.chat.completions.create({
      model: LLM_MODEL_DEFAULT,
      temperature: LLM_TEMPERATURE_DEFAULT,
      top_p: LLM_TOP_P_DEFAULT,
      ...(LLM_MAX_TOKENS_DEFAULT > 0 ? { max_tokens: LLM_MAX_TOKENS_DEFAULT } : {}),
      messages: [
        { role: 'system', content: DEFAULT_SYSTEM_PROMPT },
        { role: 'user', content: inputText },
      ],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `LLM upstream request failed: ${message}. ` +
      `baseURL=${LLM_API_BASE_URL || 'default'} model=${LLM_MODEL_DEFAULT}`,
    );
  }

  const rawText = extractLlmText(response);
  const content = parseMarkdownToContent(rawText) || parseJsonToContent(rawText);
  if (!content) {
    throw new Error('LLM returned an unsupported payload format');
  }
  return content;
}

function parseRenderRequest(body: Json): RenderRequestBody {
  const cardsRaw = Array.isArray(body.cards) ? body.cards : [];
  return {
    templateId: String(body.templateId || '').trim(),
    mainTitle: String(body.mainTitle || '').trim(),
    cards: cardsRaw.map(item => {
      const card = (item || {}) as Json;
      return {
        title: String(card.title || '').trim(),
        desc: sanitizeDescHtml(String(card.desc || '').trim()),
        icon: normalizeIcon(String(card.icon || '').trim()),
      };
    }),
    dpr: body.dpr === 2 ? 2 : 1,
  };
}

function validateRenderRequest(req: RenderRequestBody): string | null {
  if (!req.templateId) return 'Missing `templateId`';
  if (!TEMPLATES[req.templateId]) return `Unknown templateId: ${req.templateId}`;
  if (!TEMPLATES[req.templateId]?.ssrReady) return `Template not SSR-ready: ${req.templateId}`;
  if (!req.mainTitle) return 'Missing `mainTitle`';
  if (!Array.isArray(req.cards) || req.cards.length < 1 || req.cards.length > 8) {
    return '`cards` must be an array with length 1..8';
  }
  for (const [idx, c] of req.cards.entries()) {
    if (!c.title) return `cards[${idx}].title is required`;
    if (!c.desc) return `cards[${idx}].desc is required`;
    if (!c.icon) return `cards[${idx}].icon is required`;
  }
  return null;
}

export async function renderPng(body: Json, authHeader: string | null): Promise<Buffer> {
  if (!isWriteAllowed(authHeader)) {
    throw new Error('Unauthorized');
  }

  const req = parseRenderRequest(body);
  const validationError = validateRenderRequest(req);
  if (validationError) {
    throw new Error(validationError);
  }

  const html = generateHtmlFromReactComponent(
    {
      mainTitle: req.mainTitle,
      cards: req.cards.map(card => ({ ...card })),
    },
    req.templateId,
  );

  const browser = await chromium.launch({
    headless: true,
    args: [
      ...(parseBoolEnv('CHROMIUM_NO_SANDBOX', false) ? ['--no-sandbox', '--disable-setuid-sandbox'] : []),
      ...(parseBoolEnv('CHROMIUM_DISABLE_DEV_SHM', true) ? ['--disable-dev-shm-usage'] : []),
      ...(parseBoolEnv('CHROMIUM_DISABLE_GPU', true) ? ['--disable-gpu'] : []),
    ],
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: req.dpr === 2 ? 2 : 1,
    });
    const page = await context.newPage();
    await page.setContent(html, { waitUntil: 'load', timeout: 12_000 });
    await page.evaluate(async () => {
      const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
      if (fonts) {
        await fonts.ready;
      }
    });
    await page.waitForTimeout(180);
    const png = await page.screenshot({
      type: 'png',
      clip: { x: 0, y: 0, width: 1920, height: 1080 },
    });
    await context.close();
    return Buffer.from(png);
  } finally {
    await browser.close();
  }
}
