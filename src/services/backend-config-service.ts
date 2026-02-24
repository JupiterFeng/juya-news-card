import {
  isCrossOriginApiAllowed,
  resolveBearerToken,
  resolveEndpoint,
} from '../utils/request-security';

export interface BackendLlmRuntimeConfig {
  allowClientLlmSettings: boolean;
  model: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  timeoutMs: number;
  maxRetries: number;
  baseURL: string;
  allowedModels: string[];
}

function toFiniteNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return parsed;
}

function toBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') return value;
  return fallback;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(item => String(item || '').trim()).filter(Boolean);
}

function toStringValue(value: unknown, fallback = ''): string {
  if (typeof value !== 'string') return fallback;
  return value.trim();
}

function getApiBearerToken(): string {
  return import.meta.env.VITE_API_BEARER_TOKEN?.trim() || '';
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

export async function fetchBackendLlmRuntimeConfig(configuredBaseUrl?: string): Promise<BackendLlmRuntimeConfig> {
  const { endpoint, sameOrigin } = resolveEndpoint({
    configuredBaseUrl: configuredBaseUrl?.trim(),
    fallbackBaseUrl: '/api',
    actionPath: '/config',
    allowCrossOriginApi: isCrossOriginApiAllowed(),
  });

  const headers: Record<string, string> = {};
  const token = resolveBearerToken(getApiBearerToken(), sameOrigin);
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    throw new Error(`Backend config request failed (${response.status}): ${message}`);
  }

  const payload = await response.json() as { llm?: Record<string, unknown> };
  const llm = payload?.llm ?? {};

  return {
    allowClientLlmSettings: toBoolean(llm.allowClientLlmSettings, false),
    model: toStringValue(llm.model, ''),
    temperature: toFiniteNumber(llm.temperature, 0.7),
    topP: toFiniteNumber(llm.topP, 1),
    maxTokens: Math.max(0, Math.round(toFiniteNumber(llm.maxTokens, 0))),
    timeoutMs: Math.max(1000, Math.round(toFiniteNumber(llm.timeoutMs, 60000))),
    maxRetries: Math.max(0, Math.round(toFiniteNumber(llm.maxRetries, 0))),
    baseURL: toStringValue(llm.baseURL, ''),
    allowedModels: toStringArray(llm.allowedModels),
  };
}
