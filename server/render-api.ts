import fs from 'fs';
import http from 'http';
import path from 'path';
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { TEMPLATES } from '../src/templates/index.js';
import type { GeneratedContent } from '../src/types';
import { generateHtmlFromReactComponent } from './ssr-helper.js';
import { sanitizeDescHtml } from '../src/utils/desc-format.js';
import { parseJsonToContent, parseMarkdownToContent } from '../src/utils/markdown-content.js';
import { DEFAULT_SYSTEM_PROMPT } from '../src/services/llm-prompt.js';

type Json = Record<string, unknown>;

type RenderCard = { title: string; desc: string; icon: string };

type RenderRequestBody = {
  templateId: string;
  mainTitle: string;
  cards: RenderCard[];
  dpr?: 1 | 2;
};

type LlmResolvedOptions = {
  model: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  timeoutMs: number;
  maxRetries: number;
  systemPrompt: string;
};

type PublicLlmRuntimeConfig = {
  allowClientLlmSettings: boolean;
  model: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  timeoutMs: number;
  maxRetries: number;
  baseURL: string;
  allowedModels: string[];
};

type CorsPolicy = {
  allowAny: boolean;
  allowList: Set<string>;
};

type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
};

dotenv.config();
dotenv.config({ path: '.env.local', override: true });

function nowIso(): string {
  return new Date().toISOString();
}

function readEnv(name: string): string {
  return String(process.env[name] || '').trim();
}

function parseIntEnv(name: string, fallback: number, min: number, max: number): number {
  const raw = readEnv(name);
  if (!raw) return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < min || n > max) {
    throw new Error(`Invalid ${name}: "${raw}" (expected integer in ${min}..${max})`);
  }
  return n;
}

function parseNumberEnv(name: string, fallback: number, min: number, max: number): number {
  const raw = readEnv(name);
  if (!raw) return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < min || n > max) {
    throw new Error(`Invalid ${name}: "${raw}" (expected number in ${min}..${max})`);
  }
  return n;
}

function parseBoolEnv(name: string, fallback: boolean): boolean {
  const raw = readEnv(name).toLowerCase();
  if (!raw) return fallback;
  if (['1', 'true', 'yes', 'on'].includes(raw)) return true;
  if (['0', 'false', 'no', 'off'].includes(raw)) return false;
  throw new Error(`Invalid ${name}: "${raw}" (expected true/false)`);
}

function parseCsvEnv(name: string): string[] {
  const raw = readEnv(name);
  if (!raw) return [];
  return raw
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

function clampNumber(value: unknown, fallback: number, min: number, max: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function toStringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function normalizeIcon(value: string, fallback = 'article'): string {
  const token = String(value || '').trim().toLowerCase().replaceAll('-', '_');
  return /^[a-z0-9_,\s]{2,150}$/i.test(token) ? token : fallback;
}

function parseCorsPolicy(raw: string): CorsPolicy {
  const value = raw.trim();
  if (!value) return { allowAny: false, allowList: new Set<string>() };
  if (value === '*') return { allowAny: true, allowList: new Set<string>() };
  const list = value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
  return { allowAny: false, allowList: new Set(list) };
}

const HOST = readEnv('RENDER_API_HOST') || readEnv('HOST') || '127.0.0.1';
const PORT = parseIntEnv('RENDER_API_PORT', parseIntEnv('PORT', 8080, 1, 65535), 1, 65535);

const MAX_CONCURRENT_1X = parseIntEnv('MAX_CONCURRENT_1X', 4, 1, 64);
const MAX_CONCURRENT_2X = parseIntEnv('MAX_CONCURRENT_2X', 2, 1, 64);
const QUEUE_LIMIT = parseIntEnv('QUEUE_LIMIT', 200, 1, 10000);

const WAIT_MS = parseIntEnv('WAIT_MS', 1500, 0, 30000);
const POST_FONT_WAIT_MS = parseIntEnv('POST_FONT_WAIT_MS', 80, 0, 30000);
const RENDER_TIMEOUT_MS = parseIntEnv('RENDER_TIMEOUT_MS', 15000, 1000, 120000);
const SET_CONTENT_TIMEOUT_MS = parseIntEnv('SET_CONTENT_TIMEOUT_MS', 12000, 1000, 120000);
const FONT_WAIT_TIMEOUT_MS = parseIntEnv('FONT_WAIT_TIMEOUT_MS', 1500, 200, 30000);
const WORKER_RECYCLE_COUNT = parseIntEnv('WORKER_RECYCLE_COUNT', 200, 1, 100000);

const MAX_REQUEST_BODY_BYTES = parseIntEnv('MAX_REQUEST_BODY_BYTES', 2_000_000, 10_000, 10_000_000);
const MAX_INPUT_TEXT_CHARS = parseIntEnv('MAX_INPUT_TEXT_CHARS', 12000, 100, 100000);

const RATE_LIMIT_WINDOW_MS = parseIntEnv('RATE_LIMIT_WINDOW_MS', 60_000, 1000, 3_600_000);
const RATE_LIMIT_MAX_RENDER = parseIntEnv('RATE_LIMIT_MAX_RENDER', 60, 1, 10000);
const RATE_LIMIT_MAX_GENERATE = parseIntEnv('RATE_LIMIT_MAX_GENERATE', 30, 1, 10000);
const TRUST_X_FORWARDED_FOR = parseBoolEnv('TRUST_X_FORWARDED_FOR', false);

const CORS_ALLOW_ORIGIN = readEnv('CORS_ALLOW_ORIGIN');
const CORS_POLICY = parseCorsPolicy(CORS_ALLOW_ORIGIN);

const NODE_ENV = readEnv('NODE_ENV').toLowerCase();
const IS_PRODUCTION = NODE_ENV === 'production';
const API_BEARER_TOKEN = readEnv('API_BEARER_TOKEN');
const ALLOW_UNAUTHENTICATED_WRITE = parseBoolEnv('ALLOW_UNAUTHENTICATED_WRITE', !IS_PRODUCTION);

// Keep server-side LLM upstream config isolated from browser-facing `VITE_*` vars.
const LLM_API_KEY = readEnv('LLM_API_KEY');
const LLM_API_BASE_URL = readEnv('LLM_API_BASE_URL');
const LLM_MODEL_DEFAULT = readEnv('LLM_MODEL') || 'gpt-4o-mini';
const LLM_TIMEOUT_MS_DEFAULT = parseIntEnv('LLM_TIMEOUT_MS', 60_000, 1000, 300_000);
const LLM_MAX_RETRIES_DEFAULT = parseIntEnv('LLM_MAX_RETRIES', 0, 0, 10);
const LLM_TEMPERATURE_DEFAULT = parseNumberEnv('LLM_TEMPERATURE', 0.7, 0, 2);
const LLM_TOP_P_DEFAULT = parseNumberEnv('LLM_TOP_P', 1, 0, 1);
const ALLOW_CLIENT_LLM_SETTINGS = parseBoolEnv('ALLOW_CLIENT_LLM_SETTINGS', false);
const LLM_MAX_TOKENS_CAP = parseIntEnv('LLM_MAX_TOKENS_CAP', 4096, 0, 200000);
const LLM_MAX_TOKENS_DEFAULT = parseIntEnv('LLM_MAX_TOKENS_DEFAULT', 0, 0, LLM_MAX_TOKENS_CAP);
const LLM_ALLOWED_MODELS = (() => {
  const values = parseCsvEnv('LLM_ALLOWED_MODELS');
  if (!values.includes(LLM_MODEL_DEFAULT)) {
    values.unshift(LLM_MODEL_DEFAULT);
  }
  return values;
})();

const VIEWPORT = { width: 1920, height: 1080 } as const;

function resolveChromiumExecutablePath(): string | undefined {
  const raw = readEnv('PLAYWRIGHT_CHROME_PATH');
  if (!raw) return undefined;

  if (!fs.existsSync(raw)) {
    console.warn(`[${nowIso()}] WARN: PLAYWRIGHT_CHROME_PATH not found: ${raw} (ignoring)`);
    return undefined;
  }

  try {
    fs.accessSync(raw, fs.constants.X_OK);
  } catch {
    console.warn(`[${nowIso()}] WARN: PLAYWRIGHT_CHROME_PATH not executable: ${raw} (ignoring)`);
    return undefined;
  }

  return raw;
}

function buildChromiumArgs(): string[] {
  const args: string[] = [];
  if (parseBoolEnv('CHROMIUM_NO_SANDBOX', false)) {
    args.push('--no-sandbox', '--disable-setuid-sandbox');
  }
  if (parseBoolEnv('CHROMIUM_DISABLE_DEV_SHM', true)) {
    args.push('--disable-dev-shm-usage');
  }
  if (parseBoolEnv('CHROMIUM_DISABLE_GPU', true)) {
    args.push('--disable-gpu');
  }
  return args;
}

function ensureOriginAllowed(req: http.IncomingMessage): boolean {
  const origin = typeof req.headers.origin === 'string' ? req.headers.origin : '';
  if (!origin) return true;
  if (CORS_POLICY.allowAny) return true;
  if (CORS_POLICY.allowList.size === 0) return false;
  return CORS_POLICY.allowList.has(origin);
}

function applyCors(req: http.IncomingMessage, res: http.ServerResponse): void {
  const origin = typeof req.headers.origin === 'string' ? req.headers.origin : '';

  if (CORS_POLICY.allowAny) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (origin && CORS_POLICY.allowList.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Request-Id');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
}

function sendJson(req: http.IncomingMessage, res: http.ServerResponse, status: number, body: Json): void {
  const data = Buffer.from(JSON.stringify(body));
  res.statusCode = status;
  applyCors(req, res);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Length', String(data.length));
  res.end(data);
}

function sendText(req: http.IncomingMessage, res: http.ServerResponse, status: number, body: string): void {
  const data = Buffer.from(body);
  res.statusCode = status;
  applyCors(req, res);
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Length', String(data.length));
  res.end(data);
}

async function readJsonBody(req: http.IncomingMessage, maxBytes: number): Promise<Json> {
  const chunks: Buffer[] = [];
  let size = 0;

  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buf.length;
    if (size > maxBytes) {
      throw new Error(`Request body too large (>${maxBytes} bytes)`);
    }
    chunks.push(buf);
  }

  const raw = Buffer.concat(chunks).toString('utf-8').trim();
  if (!raw) return {};
  return JSON.parse(raw) as Json;
}

function parseFrontMatterMarkdown(raw: string): { front: Record<string, string>; body: string } {
  const text = String(raw || '').trim();
  if (!text.startsWith('---')) return { front: {}, body: text };
  const lines = text.split(/\r?\n/);
  if (lines.length < 3 || lines[0].trim() !== '---') return { front: {}, body: text };

  let end = -1;
  for (let i = 1; i < lines.length; i += 1) {
    if (lines[i].trim() === '---') {
      end = i;
      break;
    }
  }
  if (end <= 0) return { front: {}, body: text };

  const front: Record<string, string> = {};
  for (const line of lines.slice(1, end)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const m = trimmed.match(/^([A-Za-z_][A-Za-z0-9_-]*)\s*:\s*(.+)$/);
    if (!m) continue;
    const key = (m[1] || '').trim();
    const val = (m[2] || '').trim().replace(/^['"]|['"]$/g, '');
    if (key) front[key] = val;
  }

  const body = lines.slice(end + 1).join('\n').trim();
  return { front, body };
}

function parseMarkdownRenderRequest(markdown: string): Partial<RenderRequestBody> | null {
  const raw = String(markdown || '').trim();
  if (!raw) return null;

  const { front, body } = parseFrontMatterMarkdown(raw);
  const lines = String(body || '').split(/\r?\n/);
  if (lines.length === 0) return null;

  const h1Re = /^\s*#\s+(.+?)\s*$/;
  const h2Re = /^\s*##\s+(.+?)\s*$/;
  const iconRe = /^\s*(?:[-*]\s*)?(?:icon|图标)\s*[:：]\s*([a-zA-Z0-9_,\-\s]{2,150})\s*$/i;
  const descRe = /^\s*(?:desc|description|摘要|说明)\s*[:：]\s*(.+?)\s*$/i;

  let mainTitle = '';
  const cards: RenderCard[] = [];
  let currentTitle = '';
  let currentIcon = '';
  let currentDesc: string[] = [];
  let sawCard = false;

  const parseTrailingIconToken = (value: string): string => {
    const token = String(value || '').replace(/^\s*[-*]\s*/, '').trim().replace(/^`|`$/g, '');
    return normalizeIcon(token, '');
  };

  const flushCard = () => {
    let resolvedIcon = normalizeIcon(currentIcon, '');
    let descLines = currentDesc.map(x => String(x || '').trim()).filter(Boolean);

    if (!resolvedIcon && descLines.length > 0) {
      const tail = parseTrailingIconToken(descLines[descLines.length - 1]);
      if (tail) {
        resolvedIcon = tail;
        descLines = descLines.slice(0, -1);
      }
    }

    const title = String(currentTitle || '').trim();
    const descText = String(descLines.join('<br/>') || '').trim();
    if (!title && !descText) {
      currentTitle = '';
      currentIcon = '';
      currentDesc = [];
      return;
    }

    const normalizedTitle = title || descText.slice(0, 18) || '要点';
    const normalizedDesc = descText || normalizedTitle;
    cards.push({
      title: normalizedTitle,
      desc: normalizedDesc,
      icon: normalizeIcon(resolvedIcon, 'article'),
    });

    currentTitle = '';
    currentIcon = '';
    currentDesc = [];
  };

  for (const rawLine of lines) {
    const line = String(rawLine || '').trim();
    if (!line) continue;

    const m1 = line.match(h1Re);
    if (m1 && !line.startsWith('##')) {
      if (!mainTitle) mainTitle = String(m1[1] || '').trim();
      continue;
    }

    const m2 = line.match(h2Re);
    if (m2) {
      if (sawCard) flushCard();
      sawCard = true;
      currentTitle = String(m2[1] || '').trim();
      continue;
    }

    if (!sawCard) continue;

    const iconMatch = line.match(iconRe);
    if (iconMatch) {
      currentIcon = String(iconMatch[1] || '').trim();
      continue;
    }

    const descMatch = line.match(descRe);
    if (descMatch) {
      currentDesc.push(String(descMatch[1] || '').trim());
      continue;
    }

    currentDesc.push(line);
  }

  if (sawCard) flushCard();
  if (cards.length === 0) return null;

  const templateId = String(front.templateId || front.template_id || '').trim();
  const dprRaw = String(front.dpr || '').trim();
  let dpr: 1 | 2 | undefined;
  if (dprRaw) dpr = Number(dprRaw) === 2 ? 2 : 1;

  return {
    templateId,
    mainTitle,
    cards,
    dpr,
  };
}

function parseRenderRequest(body: Json): RenderRequestBody {
  const markdown = toStringValue(body.image_text) || toStringValue(body.markdown) || toStringValue(body.md);
  const parsedMarkdown = markdown ? parseMarkdownRenderRequest(markdown) : null;

  const templateIdFromBody = toStringValue(body.templateId);
  const mainTitleFromBody = toStringValue(body.mainTitle);
  const cardsRaw = Array.isArray(body.cards) ? body.cards : [];
  const dprFromBody = body.dpr === 2 ? 2 : 1;

  const templateId = String(parsedMarkdown?.templateId || templateIdFromBody || '').trim();
  const mainTitle = String(parsedMarkdown?.mainTitle || mainTitleFromBody || '').trim();
  const dpr = parsedMarkdown?.dpr ?? dprFromBody;

  const cardsFromMarkdown = Array.isArray(parsedMarkdown?.cards) ? parsedMarkdown.cards : [];
  const cards: RenderCard[] = cardsFromMarkdown.length > 0
    ? cardsFromMarkdown.map(card => ({
      title: toStringValue(card.title),
      desc: sanitizeDescHtml(card.desc),
      icon: normalizeIcon(card.icon, ''),
    }))
    : cardsRaw.map(card => {
      const obj = (card ?? {}) as Record<string, unknown>;
      return {
        title: toStringValue(obj.title),
        desc: sanitizeDescHtml(obj.desc),
        icon: normalizeIcon(toStringValue(obj.icon), ''),
      };
    });

  return { templateId, mainTitle, cards, dpr };
}

function validateRenderRequest(reqBody: RenderRequestBody): string | null {
  if (!reqBody.templateId) return 'Missing `templateId`';
  if (!TEMPLATES[reqBody.templateId]) return `Unknown templateId: ${reqBody.templateId}`;
  if (!TEMPLATES[reqBody.templateId]?.ssrReady) return `Template not SSR-ready: ${reqBody.templateId}`;
  if (!reqBody.mainTitle) return 'Missing `mainTitle`';
  if (!Array.isArray(reqBody.cards) || reqBody.cards.length < 1 || reqBody.cards.length > 8) {
    return '`cards` must be an array with length 1..8';
  }
  for (const [idx, c] of reqBody.cards.entries()) {
    if (!c.title) return `cards[${idx}].title is required`;
    if (!c.desc) return `cards[${idx}].desc is required`;
    if (!c.icon) return `cards[${idx}].icon is required`;
  }
  if (reqBody.dpr !== 1 && reqBody.dpr !== 2) return '`dpr` must be 1 or 2';
  return null;
}

function toGeneratedContent(reqBody: RenderRequestBody): GeneratedContent {
  return {
    mainTitle: reqBody.mainTitle,
    cards: reqBody.cards.map(card => ({ ...card })),
  };
}

function resolveLlmOptions(body: Json): { inputText: string; options: LlmResolvedOptions } {
  const inputText = String(
    toStringValue(body.inputText) ||
    toStringValue(body.input) ||
    toStringValue(body.text)
  ).trim();

  const llmRaw = (body.llm && typeof body.llm === 'object') ? (body.llm as Json) : {};

  const requestedModel = String(toStringValue(llmRaw.model)).trim();
  const model = ALLOW_CLIENT_LLM_SETTINGS && requestedModel && LLM_ALLOWED_MODELS.includes(requestedModel)
    ? requestedModel
    : LLM_MODEL_DEFAULT;
  const temperature = ALLOW_CLIENT_LLM_SETTINGS
    ? clampNumber(llmRaw.temperature, LLM_TEMPERATURE_DEFAULT, 0, 2)
    : LLM_TEMPERATURE_DEFAULT;
  const topP = ALLOW_CLIENT_LLM_SETTINGS
    ? clampNumber(llmRaw.topP, LLM_TOP_P_DEFAULT, 0, 1)
    : LLM_TOP_P_DEFAULT;
  const maxTokens = ALLOW_CLIENT_LLM_SETTINGS
    ? Math.round(clampNumber(llmRaw.maxTokens, LLM_MAX_TOKENS_DEFAULT, 0, LLM_MAX_TOKENS_CAP))
    : LLM_MAX_TOKENS_DEFAULT;
  const timeoutMs = LLM_TIMEOUT_MS_DEFAULT;
  const maxRetries = LLM_MAX_RETRIES_DEFAULT;
  const systemPrompt = ALLOW_CLIENT_LLM_SETTINGS
    ? String(toStringValue(llmRaw.systemPrompt) || DEFAULT_SYSTEM_PROMPT).trim() || DEFAULT_SYSTEM_PROMPT
    : DEFAULT_SYSTEM_PROMPT;

  return {
    inputText,
    options: {
      model,
      temperature,
      topP,
      maxTokens,
      timeoutMs,
      maxRetries,
      systemPrompt,
    },
  };
}

function buildPublicLlmRuntimeConfig(): PublicLlmRuntimeConfig {
  return {
    allowClientLlmSettings: ALLOW_CLIENT_LLM_SETTINGS,
    model: LLM_MODEL_DEFAULT,
    temperature: LLM_TEMPERATURE_DEFAULT,
    topP: LLM_TOP_P_DEFAULT,
    maxTokens: LLM_MAX_TOKENS_DEFAULT,
    timeoutMs: LLM_TIMEOUT_MS_DEFAULT,
    maxRetries: LLM_MAX_RETRIES_DEFAULT,
    baseURL: LLM_API_BASE_URL,
    allowedModels: [...LLM_ALLOWED_MODELS],
  };
}

function pushUniqueNonEmptyText(target: string[], value: unknown): void {
  const text = String(value ?? '').trim();
  if (!text) return;
  if (!target.includes(text)) {
    target.push(text);
  }
}

function collectKnownTextFields(value: unknown, target: string[], depth = 0): void {
  if (depth > 5 || value === null || value === undefined) return;

  if (typeof value === 'string') {
    pushUniqueNonEmptyText(target, value);
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectKnownTextFields(item, target, depth + 1);
    }
    return;
  }

  if (typeof value !== 'object') return;
  const obj = value as Json;

  // Compatible providers may use different key names for final/reasoning text.
  for (const key of ['text', 'content', 'output_text', 'reasoning_content']) {
    if (key in obj) {
      collectKnownTextFields(obj[key], target, depth + 1);
    }
  }
}

function extractChatMessageContent(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (!Array.isArray(value)) return '';

  const parts: string[] = [];
  for (const item of value) {
    if (typeof item === 'string') {
      pushUniqueNonEmptyText(parts, item);
      continue;
    }
    if (!item || typeof item !== 'object') continue;
    const obj = item as Json;
    pushUniqueNonEmptyText(parts, obj.text);
    pushUniqueNonEmptyText(parts, obj.content);
  }
  return parts.join('\n').trim();
}

function extractLlmTextCandidates(response: unknown): string[] {
  if (!response || typeof response !== 'object') return [];
  const data = response as Json;
  const choices = Array.isArray(data.choices) ? data.choices : [];
  const firstChoice = choices[0];
  const candidates: string[] = [];

  if (firstChoice && typeof firstChoice === 'object') {
    const choiceObj = firstChoice as Json;
    const message = choiceObj.message;

    if (message && typeof message === 'object') {
      const messageObj = message as Json;

      // 1) Standard assistant content (preferred final answer)
      pushUniqueNonEmptyText(candidates, extractChatMessageContent(messageObj.content));

      // 2) Compatibility fallback for providers exposing reasoning content separately.
      collectKnownTextFields(messageObj.reasoning_content, candidates);
      collectKnownTextFields(messageObj.reasoning, candidates);
    }

    // 3) Legacy-compatible fallback.
    pushUniqueNonEmptyText(candidates, choiceObj.text);
  }

  // 4) Extra compatibility for responses-like payloads.
  collectKnownTextFields(data.output_text, candidates);
  return candidates;
}

async function generateContentViaLlm(inputText: string, options: LlmResolvedOptions): Promise<GeneratedContent> {
  if (!LLM_API_KEY) {
    throw new Error('LLM_API_KEY is not configured on the server');
  }

  const client = new OpenAI({
    apiKey: LLM_API_KEY,
    baseURL: LLM_API_BASE_URL || undefined,
    timeout: options.timeoutMs,
    maxRetries: options.maxRetries,
  });

  const response = await client.chat.completions.create({
    model: options.model,
    messages: [
      { role: 'system', content: options.systemPrompt },
      { role: 'user', content: inputText },
    ],
    temperature: options.temperature,
    top_p: options.topP,
    ...(options.maxTokens > 0 ? { max_tokens: options.maxTokens } : {}),
  });

  const candidates = extractLlmTextCandidates(response);
  if (candidates.length === 0) {
    throw new Error('LLM returned empty response');
  }

  for (const candidate of candidates) {
    const parsed = parseMarkdownToContent(candidate) ?? parseJsonToContent(candidate);
    if (parsed) return parsed;
  }

  throw new Error('Failed to parse LLM response into GeneratedContent');
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) return promise;
  let timeoutHandle: NodeJS.Timeout | undefined;

  const timeoutPromise = new Promise<T>((_resolve, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeoutHandle) clearTimeout(timeoutHandle);
  }) as Promise<T>;
}

async function safeClose(target: { close: () => Promise<void> | void } | null | undefined): Promise<void> {
  if (!target) return;
  try {
    await target.close();
  } catch {
    // ignore
  }
}

function randomId(prefix: string): string {
  const rand = Math.random().toString(16).slice(2);
  return `${prefix}_${Date.now().toString(16)}_${rand}`;
}

class FixedWindowRateLimiter {
  private readonly storage = new Map<string, { windowStart: number; count: number }>();
  private checks = 0;

  constructor(
    private readonly windowMs: number,
    private readonly maxRequests: number,
  ) { }

  check(key: string): RateLimitResult {
    const now = Date.now();
    let entry = this.storage.get(key);

    if (!entry || now - entry.windowStart >= this.windowMs) {
      entry = { windowStart: now, count: 0 };
    }

    entry.count += 1;
    this.storage.set(key, entry);

    this.checks += 1;
    if (this.checks % 1024 === 0) {
      this.sweep(now);
    }

    return {
      ok: entry.count <= this.maxRequests,
      remaining: Math.max(0, this.maxRequests - entry.count),
      resetAt: entry.windowStart + this.windowMs,
    };
  }

  private sweep(now: number): void {
    const ttl = this.windowMs * 2;
    for (const [key, value] of this.storage.entries()) {
      if (now - value.windowStart >= ttl) {
        this.storage.delete(key);
      }
    }
  }
}

function getClientIp(req: http.IncomingMessage): string {
  if (TRUST_X_FORWARDED_FOR) {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.trim()) {
      return forwarded.split(',')[0].trim();
    }
  }
  return req.socket.remoteAddress || 'unknown';
}

function isAuthorized(req: http.IncomingMessage): boolean {
  if (!API_BEARER_TOKEN) return ALLOW_UNAUTHENTICATED_WRITE;
  const authHeader = typeof req.headers.authorization === 'string' ? req.headers.authorization : '';
  return authHeader === `Bearer ${API_BEARER_TOKEN}`;
}

function setRateLimitHeaders(res: http.ServerResponse, result: RateLimitResult): void {
  res.setHeader('X-RateLimit-Remaining', String(result.remaining));
  res.setHeader('X-RateLimit-Reset', String(result.resetAt));
}

type RenderJob = {
  id: string;
  html: string;
  resolve: (png: Buffer) => void;
  reject: (err: Error) => void;
  enqueuedAt: number;
};

type RenderWorker = {
  id: string;
  dpr: 1 | 2;
  busy: boolean;
  processed: number;
  context: BrowserContext;
  page: Page;
};

class RenderPool {
  private readonly browser: Browser;
  private readonly dpr: 1 | 2;
  private readonly maxWorkers: number;
  private readonly queueLimit: number;
  private readonly localFontUrl: string | null;
  private readonly waitMs: number;
  private readonly postFontWaitMs: number;
  private readonly renderTimeoutMs: number;
  private readonly setContentTimeoutMs: number;
  private readonly fontWaitTimeoutMs: number;
  private readonly workerRecycleCount: number;

  private readonly queue: RenderJob[] = [];
  private readonly workers: RenderWorker[] = [];

  constructor(opts: {
    browser: Browser;
    dpr: 1 | 2;
    maxWorkers: number;
    queueLimit: number;
    localFontUrl: string | null;
    waitMs: number;
    postFontWaitMs: number;
    renderTimeoutMs: number;
    setContentTimeoutMs: number;
    fontWaitTimeoutMs: number;
    workerRecycleCount: number;
  }) {
    this.browser = opts.browser;
    this.dpr = opts.dpr;
    this.maxWorkers = opts.maxWorkers;
    this.queueLimit = opts.queueLimit;
    this.localFontUrl = opts.localFontUrl;
    this.waitMs = opts.waitMs;
    this.postFontWaitMs = opts.postFontWaitMs;
    this.renderTimeoutMs = opts.renderTimeoutMs;
    this.setContentTimeoutMs = opts.setContentTimeoutMs;
    this.fontWaitTimeoutMs = opts.fontWaitTimeoutMs;
    this.workerRecycleCount = opts.workerRecycleCount;
  }

  get pending(): number {
    const busy = this.workers.filter(worker => worker.busy).length;
    return this.queue.length + busy;
  }

  get queued(): number {
    return this.queue.length;
  }

  async init(): Promise<void> {
    for (let i = 0; i < this.maxWorkers; i += 1) {
      const worker = await this.createWorker(i);
      this.workers.push(worker);
    }
  }

  async close(): Promise<void> {
    for (const worker of this.workers) {
      await safeClose(worker.context);
    }
    this.workers.length = 0;
  }

  enqueue(html: string): Promise<Buffer> {
    if (this.pending >= this.queueLimit) {
      return Promise.reject(new Error('QUEUE_FULL'));
    }

    const id = randomId(`job_${this.dpr}x`);
    return new Promise<Buffer>((resolve, reject) => {
      this.queue.push({
        id,
        html,
        resolve,
        reject,
        enqueuedAt: Date.now(),
      });
      this.dispatch();
    });
  }

  private dispatch(): void {
    for (const worker of this.workers) {
      if (worker.busy) continue;
      const job = this.queue.shift();
      if (!job) return;
      worker.busy = true;
      void this.runJob(worker, job);
    }
  }

  private async runJob(worker: RenderWorker, job: RenderJob): Promise<void> {
    const start = Date.now();
    try {
      const png = await withTimeout(this.renderToPng(worker.page, job.html), this.renderTimeoutMs, 'render');
      job.resolve(png);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      job.reject(err);
    } finally {
      worker.busy = false;
      worker.processed += 1;

      const elapsed = Date.now() - start;
      console.log(
        `[${nowIso()}] worker=${worker.id} dpr=${this.dpr} job=${job.id} ms=${elapsed} queuedForMs=${start - job.enqueuedAt}`,
      );

      if (this.workerRecycleCount > 0 && worker.processed >= this.workerRecycleCount) {
        await this.recycleWorker(worker);
      }

      this.dispatch();
    }
  }

  private async createWorker(index: number): Promise<RenderWorker> {
    const id = `w_${this.dpr}x_${index}_${Math.random().toString(16).slice(2)}`;
    const context = await this.browser.newContext({
      viewport: { ...VIEWPORT },
      deviceScaleFactor: this.dpr,
    });
    const page = await context.newPage();
    return { id, dpr: this.dpr, busy: false, processed: 0, context, page };
  }

  private async recycleWorker(worker: RenderWorker): Promise<void> {
    const oldId = worker.id;
    await safeClose(worker.context);

    const next = await this.createWorker(Math.floor(Math.random() * 100000));
    worker.id = next.id;
    worker.context = next.context;
    worker.page = next.page;
    worker.processed = 0;
    worker.busy = false;

    console.log(`[${nowIso()}] recycled worker ${oldId} -> ${worker.id}`);
  }

  private injectFontCss(html: string): string {
    if (!this.localFontUrl) return html;
    const style = `
<style>
  @font-face {
    font-family: 'CustomPreviewFont';
    src: url('${this.localFontUrl}') format('truetype');
  }
  .main-container {
    font-family: 'CustomPreviewFont', system-ui, -apple-system, sans-serif !important;
  }
</style>
`;
    const marker = '</head>';
    const index = html.indexOf(marker);
    if (index === -1) return html;
    return html.slice(0, index) + style + html.slice(index);
  }

  private async waitForFonts(page: Page): Promise<void> {
    await page.evaluate(async (timeoutMs: number) => {
      const docWithFonts = document as Document & {
        fonts?: {
          ready?: Promise<unknown>;
        };
      };
      const fonts = docWithFonts.fonts;
      if (!fonts?.ready) return;
      await Promise.race([
        fonts.ready,
        new Promise<void>(resolve => setTimeout(resolve, timeoutMs)),
      ]);
    }, this.fontWaitTimeoutMs);
  }

  private async renderToPng(page: Page, html: string): Promise<Buffer> {
    const finalHtml = this.injectFontCss(html);

    await page.setContent(finalHtml, {
      waitUntil: 'networkidle',
      timeout: this.setContentTimeoutMs,
    });

    if (this.waitMs > 0) {
      await page.waitForTimeout(this.waitMs);
    }

    await this.waitForFonts(page);

    if (this.postFontWaitMs > 0) {
      await page.waitForTimeout(this.postFontWaitMs);
    }

    return await page.screenshot({
      type: 'png',
      animations: 'disabled',
    });
  }
}

function getSsrThemes(): Array<{ id: string; name: string; description?: string }> {
  return Object.values(TEMPLATES)
    .filter(template => template?.ssrReady)
    .map(template => ({ id: template.id, name: template.name, description: template.description }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

async function ensurePlaywrightBrowserReady(opts: { args: string[]; executablePath?: string }): Promise<void> {
  try {
    const browser = await chromium.launch({ args: opts.args, executablePath: opts.executablePath });
    await browser.close();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Playwright browser launch failed: ${message}. ` +
      'Please run `npx playwright install chromium-headless-shell` during build/setup.',
    );
  }
}

async function main(): Promise<void> {
  if (!API_BEARER_TOKEN && !ALLOW_UNAUTHENTICATED_WRITE) {
    throw new Error(
      'API_BEARER_TOKEN is required when unauthenticated writes are disabled. ' +
      'Set API_BEARER_TOKEN or ALLOW_UNAUTHENTICATED_WRITE=true.'
    );
  }

  const chromiumArgs = buildChromiumArgs();
  const executablePath = resolveChromiumExecutablePath();
  await ensurePlaywrightBrowserReady({ args: chromiumArgs, executablePath });

  const fontPath = path.join(process.cwd(), 'assets/htmlFont.ttf');
  let fontBuffer: Buffer | null = null;
  if (fs.existsSync(fontPath)) {
    fontBuffer = fs.readFileSync(fontPath);
  } else {
    console.warn(`[${nowIso()}] WARN: font not found at ${fontPath} (will render without CustomPreviewFont)`);
  }

  const browser = await chromium.launch({
    args: chromiumArgs,
    executablePath,
  });

  const localFontUrl = fontBuffer ? `http://127.0.0.1:${PORT}/assets/htmlFont.ttf` : null;

  const pool1x = new RenderPool({
    browser,
    dpr: 1,
    maxWorkers: MAX_CONCURRENT_1X,
    queueLimit: QUEUE_LIMIT,
    localFontUrl,
    waitMs: WAIT_MS,
    postFontWaitMs: POST_FONT_WAIT_MS,
    renderTimeoutMs: RENDER_TIMEOUT_MS,
    setContentTimeoutMs: SET_CONTENT_TIMEOUT_MS,
    fontWaitTimeoutMs: FONT_WAIT_TIMEOUT_MS,
    workerRecycleCount: WORKER_RECYCLE_COUNT,
  });

  const pool2x = new RenderPool({
    browser,
    dpr: 2,
    maxWorkers: MAX_CONCURRENT_2X,
    queueLimit: QUEUE_LIMIT,
    localFontUrl,
    waitMs: WAIT_MS,
    postFontWaitMs: POST_FONT_WAIT_MS,
    renderTimeoutMs: RENDER_TIMEOUT_MS,
    setContentTimeoutMs: SET_CONTENT_TIMEOUT_MS,
    fontWaitTimeoutMs: FONT_WAIT_TIMEOUT_MS,
    workerRecycleCount: WORKER_RECYCLE_COUNT,
  });

  await pool1x.init();
  await pool2x.init();

  const renderLimiter = new FixedWindowRateLimiter(RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_RENDER);
  const generateLimiter = new FixedWindowRateLimiter(RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_GENERATE);

  const handleRender = async (
    req: http.IncomingMessage,
    res: http.ServerResponse,
    requestId: string,
  ): Promise<void> => {
    const clientIp = getClientIp(req);
    const rate = renderLimiter.check(clientIp);
    setRateLimitHeaders(res, rate);
    if (!rate.ok) {
      sendJson(req, res, 429, {
        ok: false,
        requestId,
        error: 'RATE_LIMITED',
        message: 'Too many render requests. Please retry later.',
      });
      return;
    }

    const bodyRaw = await readJsonBody(req, MAX_REQUEST_BODY_BYTES).catch(error => {
      sendJson(req, res, 400, {
        ok: false,
        requestId,
        error: 'INVALID_JSON',
        message: String(error),
      });
      return null;
    });
    if (!bodyRaw) return;

    const parsed = parseRenderRequest(bodyRaw);
    const validationError = validateRenderRequest(parsed);
    if (validationError) {
      sendJson(req, res, 400, {
        ok: false,
        requestId,
        error: 'INVALID_REQUEST',
        message: validationError,
      });
      return;
    }

    const pool = parsed.dpr === 2 ? pool2x : pool1x;
    if (pool.pending >= QUEUE_LIMIT) {
      sendJson(req, res, 429, {
        ok: false,
        requestId,
        error: 'QUEUE_FULL',
        message: 'Render queue is full',
      });
      return;
    }

    try {
      const data = toGeneratedContent(parsed);
      const html = generateHtmlFromReactComponent(data, parsed.templateId);
      const png = await pool.enqueue(html);
      res.statusCode = 200;
      applyCors(req, res);
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Length', String(png.length));
      res.setHeader('X-Request-Id', requestId);
      res.setHeader('X-Template-Id', parsed.templateId);
      res.setHeader('X-DPR', String(parsed.dpr));
      res.end(png);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      sendJson(req, res, err.message === 'QUEUE_FULL' ? 429 : 500, {
        ok: false,
        requestId,
        error: err.message === 'QUEUE_FULL' ? 'QUEUE_FULL' : 'RENDER_FAILED',
        message: err.message,
        templateId: parsed.templateId,
      });
    }
  };

  const handleGenerate = async (
    req: http.IncomingMessage,
    res: http.ServerResponse,
    requestId: string,
  ): Promise<void> => {
    if (!LLM_API_KEY) {
      sendJson(req, res, 503, {
        ok: false,
        requestId,
        error: 'LLM_NOT_CONFIGURED',
        message: 'LLM_API_KEY is missing on server',
      });
      return;
    }

    const clientIp = getClientIp(req);
    const rate = generateLimiter.check(clientIp);
    setRateLimitHeaders(res, rate);
    if (!rate.ok) {
      sendJson(req, res, 429, {
        ok: false,
        requestId,
        error: 'RATE_LIMITED',
        message: 'Too many generation requests. Please retry later.',
      });
      return;
    }

    const bodyRaw = await readJsonBody(req, MAX_REQUEST_BODY_BYTES).catch(error => {
      sendJson(req, res, 400, {
        ok: false,
        requestId,
        error: 'INVALID_JSON',
        message: String(error),
      });
      return null;
    });
    if (!bodyRaw) return;

    const { inputText, options } = resolveLlmOptions(bodyRaw);
    if (!inputText) {
      sendJson(req, res, 400, {
        ok: false,
        requestId,
        error: 'INVALID_REQUEST',
        message: 'Missing `inputText`',
      });
      return;
    }

    if (inputText.length > MAX_INPUT_TEXT_CHARS) {
      sendJson(req, res, 400, {
        ok: false,
        requestId,
        error: 'INPUT_TOO_LONG',
        message: `inputText too long (max ${MAX_INPUT_TEXT_CHARS} chars)`,
      });
      return;
    }

    try {
      const content = await generateContentViaLlm(inputText, options);
      sendJson(req, res, 200, {
        ok: true,
        requestId,
        data: content,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      sendJson(req, res, 502, {
        ok: false,
        requestId,
        error: 'LLM_REQUEST_FAILED',
        message: err.message,
      });
    }
  };

  const server = http.createServer((req, res) => {
    void (async () => {
      if (!req.url || !req.method) {
        sendText(req, res, 400, 'Bad Request');
        return;
      }

      if (!ensureOriginAllowed(req)) {
        sendJson(req, res, 403, {
          ok: false,
          error: 'CORS_FORBIDDEN',
          message: 'Origin is not allowed by CORS policy',
        });
        return;
      }

      applyCors(req, res);

      if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
      }

      const url = new URL(req.url, 'http://localhost');
      const pathname = url.pathname;
      const requestId = req.headers['x-request-id']?.toString() || randomId('req');

      if (req.method === 'GET' && (pathname === '/healthz' || pathname === '/api/healthz')) {
        sendJson(req, res, 200, {
          ok: true,
          now: nowIso(),
          queues: { '1x': pool1x.queued, '2x': pool2x.queued },
          pending: { '1x': pool1x.pending, '2x': pool2x.pending },
          llmConfigured: Boolean(LLM_API_KEY),
        });
        return;
      }

      if (req.method === 'GET' && (pathname === '/config' || pathname === '/api/config')) {
        sendJson(req, res, 200, {
          ok: true,
          now: nowIso(),
          llm: buildPublicLlmRuntimeConfig(),
          llmConfigured: Boolean(LLM_API_KEY),
        });
        return;
      }

      if (req.method === 'GET' && (pathname === '/themes' || pathname === '/api/themes')) {
        sendJson(req, res, 200, {
          ok: true,
          themes: getSsrThemes(),
        });
        return;
      }

      if (req.method === 'GET' && pathname === '/assets/htmlFont.ttf') {
        if (!fontBuffer) {
          sendText(req, res, 404, 'Font not found');
          return;
        }
        res.statusCode = 200;
        applyCors(req, res);
        res.setHeader('Content-Type', 'font/ttf');
        res.setHeader('Content-Length', String(fontBuffer.length));
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        res.end(fontBuffer);
        return;
      }

      if (req.method === 'POST' && (pathname === '/render' || pathname === '/api/render')) {
        if (!isAuthorized(req)) {
          sendJson(req, res, 401, {
            ok: false,
            requestId,
            error: 'UNAUTHORIZED',
            message: 'Missing or invalid API bearer token',
          });
          return;
        }
        await handleRender(req, res, requestId);
        return;
      }

      if (req.method === 'POST' && (pathname === '/api/generate' || pathname === '/generate')) {
        if (!isAuthorized(req)) {
          sendJson(req, res, 401, {
            ok: false,
            requestId,
            error: 'UNAUTHORIZED',
            message: 'Missing or invalid API bearer token',
          });
          return;
        }
        await handleGenerate(req, res, requestId);
        return;
      }

      sendText(req, res, 404, 'Not Found');
    })().catch(error => {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error(`[${nowIso()}] request error:`, err);
      if (!res.headersSent) {
        sendJson(req, res, 500, {
          ok: false,
          error: 'INTERNAL_ERROR',
          message: err.message,
        });
      } else {
        res.end();
      }
    });
  });

  server.on('error', error => {
    if ((error as NodeJS.ErrnoException).code === 'EADDRINUSE') {
      console.error(`[${nowIso()}] fatal: port ${PORT} is already in use. Set RENDER_API_PORT to a free port.`);
      process.exit(1);
    }
    console.error(`[${nowIso()}] fatal server error:`, error);
    process.exit(1);
  });

  server.listen(PORT, HOST, () => {
    console.log(`[${nowIso()}] render-api listening on http://${HOST}:${PORT}`);
    console.log(`[${nowIso()}] SSR themes: ${getSsrThemes().length}`);
    console.log(`[${nowIso()}] concurrency: 1x=${MAX_CONCURRENT_1X} 2x=${MAX_CONCURRENT_2X} queueLimit=${QUEUE_LIMIT}`);
    console.log(`[${nowIso()}] rate limit: window=${RATE_LIMIT_WINDOW_MS}ms render=${RATE_LIMIT_MAX_RENDER} generate=${RATE_LIMIT_MAX_GENERATE}`);
    if (!API_BEARER_TOKEN && ALLOW_UNAUTHENTICATED_WRITE) {
      const level = IS_PRODUCTION ? 'WARN' : 'INFO';
      const hint = IS_PRODUCTION
        ? 'Set API_BEARER_TOKEN to protect write endpoints in production.'
        : 'This is convenient for local development.';
      console.warn(
        `[${nowIso()}] ${level}: unauthenticated writes are enabled (ALLOW_UNAUTHENTICATED_WRITE=true). ${hint}`
      );
    }
    if (ALLOW_CLIENT_LLM_SETTINGS) {
      console.warn(`[${nowIso()}] WARN: client LLM overrides are enabled (ALLOW_CLIENT_LLM_SETTINGS=true).`);
    }
    if (!LLM_API_KEY) {
      console.warn(`[${nowIso()}] WARN: LLM_API_KEY is empty; /api/generate will return 503.`);
    }
    if (CORS_POLICY.allowAny) {
      console.warn(`[${nowIso()}] WARN: CORS_ALLOW_ORIGIN is '*' (permissive).`);
    } else if (CORS_POLICY.allowList.size === 0) {
      console.warn(`[${nowIso()}] WARN: CORS_ALLOW_ORIGIN is empty; browser cross-origin requests will be blocked.`);
    }
  });

  const shutdown = async (signal: string) => {
    console.log(`[${nowIso()}] ${signal} received, shutting down...`);
    await new Promise<void>(resolve => server.close(() => resolve()));
    await pool1x.close();
    await pool2x.close();
    await safeClose(browser);
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

main().catch(error => {
  console.error(`[${nowIso()}] fatal:`, error);
  process.exit(1);
});
