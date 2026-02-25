import { GeneratedContent } from '../types';
import { parseJsonToContent } from '../utils/markdown-content';
import type { LlmGlobalSettings } from '../utils/global-settings';
import {
  isCrossOriginApiAllowed,
  resolveBearerToken,
  resolveEndpoint,
} from '../utils/request-security';
import { readPublicEnv } from '../utils/runtime-env';

const DEFAULT_TIMEOUT_MS = 120000;

function getApiBearerToken(): string {
  return readPublicEnv('VITE_API_BEARER_TOKEN');
}

function normalizeTimeoutMs(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_TIMEOUT_MS;
  return Math.min(300000, Math.max(1000, Math.round(parsed)));
}

function toContentOrThrow(payload: unknown): GeneratedContent {
  const serialized = JSON.stringify(payload);
  const parsed = parseJsonToContent(serialized);
  if (!parsed) {
    throw new Error('Invalid response payload format');
  }
  return parsed;
}

async function parseErrorMessage(response: Response): Promise<string> {
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

export const generateCardContent = async (
  inputText: string,
  llmSettings?: Partial<LlmGlobalSettings>
): Promise<GeneratedContent> => {
  const text = String(inputText || '').trim();
  if (!text) {
    throw new Error('Input text is empty');
  }

  const timeoutMs = normalizeTimeoutMs(DEFAULT_TIMEOUT_MS);

  const configuredBaseUrl = llmSettings?.baseURL?.trim() || readPublicEnv('VITE_API_BASE_URL');
  const primary = resolveEndpoint({
    configuredBaseUrl,
    fallbackBaseUrl: '/api',
    actionPath: '/generate',
    allowCrossOriginApi: isCrossOriginApiAllowed(),
  });
  const fallback = resolveEndpoint({
    configuredBaseUrl: '/api',
    fallbackBaseUrl: '/api',
    actionPath: '/generate',
    allowCrossOriginApi: true,
  });
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const doRequest = async (target: { endpoint: string; sameOrigin: boolean }) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = resolveBearerToken(getApiBearerToken(), target.sameOrigin);
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return fetch(target.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        inputText: text,
      }),
      signal: controller.signal,
    });
  };

  try {
    let response: Response;
    try {
      response = await doRequest(primary);
    } catch (error) {
      const canFallback = Boolean(configuredBaseUrl) && primary.endpoint !== fallback.endpoint;
      const isNetworkError = error instanceof TypeError;
      if (!canFallback || !isNetworkError) {
        throw error;
      }
      response = await doRequest(fallback);
    }

    if (!response.ok) {
      const message = await parseErrorMessage(response);
      throw new Error(`Generation request failed (${response.status}): ${message}`);
    }

    const payload = await response.json() as { data?: unknown };
    const content = toContentOrThrow(payload?.data ?? payload);
    return content;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(`Generation request timed out after ${timeoutMs}ms`);
    }
    console.error('Failed to generate content:', error);
    if (error instanceof TypeError) {
      throw new Error(
        `Failed to reach generation API. Tried: ${primary.endpoint}. ` +
        'Please check "App Backend API Base URL" in settings or use /api.'
      );
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to generate content. Please check backend API settings.');
  } finally {
    clearTimeout(timeoutId);
  }
};
