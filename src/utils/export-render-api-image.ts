import type { GeneratedContent } from '../types';
import {
  isCrossOriginApiAllowed,
  resolveBearerToken,
  resolveEndpoint,
} from './request-security';
import { readPublicEnv } from './runtime-env';

const DEFAULT_RENDER_API_PORT = 8080;
const DEFAULT_RENDER_API_TIMEOUT_MS = 12000;

type RenderDpr = 1 | 2;

export interface RenderApiPngOptions {
  templateId: string;
  data: GeneratedContent;
  dpr?: RenderDpr;
  baseUrl?: string;
  timeoutMs?: number;
}

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

function parsePort(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function resolveRenderApiPort(): number {
  return parsePort(readPublicEnv('VITE_RENDER_API_PORT'), DEFAULT_RENDER_API_PORT);
}

function resolveRenderApiBaseUrl(explicitBaseUrl?: string): string {
  const explicit = explicitBaseUrl?.trim();
  if (explicit) return normalizeBaseUrl(explicit);

  const envBaseUrl = readPublicEnv('VITE_RENDER_API_BASE_URL');
  if (envBaseUrl) return normalizeBaseUrl(envBaseUrl);

  return '/api';
}

function resolveRenderApiBearerToken(): string {
  return (
    readPublicEnv('VITE_RENDER_API_BEARER_TOKEN') ||
    readPublicEnv('VITE_API_BEARER_TOKEN') ||
    ''
  );
}

function normalizeTimeoutMs(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_RENDER_API_TIMEOUT_MS;
  return Math.min(60000, Math.max(1000, Math.round(parsed)));
}

async function parseRenderApiErrorMessage(response: Response): Promise<string> {
  const contentType = (response.headers.get('content-type') || '').toLowerCase();
  if (contentType.includes('application/json')) {
    try {
      const body = await response.json() as { message?: string; error?: string };
      if (body?.message) return body.message;
      if (body?.error) return body.error;
    } catch {
      return `HTTP ${response.status}`;
    }
  }

  try {
    const text = (await response.text()).trim();
    return text || `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status}`;
  }
}

export async function generatePngBlobFromRenderApi(options: RenderApiPngOptions): Promise<Blob> {
  const { endpoint, sameOrigin } = resolveEndpoint({
    configuredBaseUrl: resolveRenderApiBaseUrl(options.baseUrl),
    fallbackBaseUrl: `http://127.0.0.1:${resolveRenderApiPort()}`,
    actionPath: '/render',
    allowCrossOriginApi: isCrossOriginApiAllowed(),
  });
  const dpr: RenderDpr = options.dpr === 2 ? 2 : 1;
  const timeoutMs = normalizeTimeoutMs(options.timeoutMs);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = resolveBearerToken(resolveRenderApiBearerToken(), sameOrigin);
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        templateId: options.templateId,
        mainTitle: options.data.mainTitle,
        cards: options.data.cards.map(card => ({
          title: typeof card.title === 'string' ? card.title : '',
          desc: typeof card.desc === 'string' ? card.desc : '',
          icon: typeof card.icon === 'string' ? card.icon : 'article',
        })),
        dpr,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const message = await parseRenderApiErrorMessage(response);
      throw new Error(`render-api request failed (${response.status}): ${message}`);
    }

    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    if (!contentType.includes('image/png')) {
      const message = await parseRenderApiErrorMessage(response);
      throw new Error(`render-api returned non-PNG response (${contentType || 'unknown'}): ${message}`);
    }

    return await response.blob();
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(`render-api request timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
