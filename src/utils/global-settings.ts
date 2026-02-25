import { BOTTOM_RESERVED_PX } from './layout-calculator';
import { readPublicEnv } from './runtime-env';

const STORAGE_KEY = 'p2v-global-settings-v2';
const LEGACY_STORAGE_KEY = 'p2v-global-settings-v1';

export type ExportFormat = 'png' | 'svg';
export type PngRenderer = 'browser' | 'render-api';

export const EXPORT_FORMAT_OPTIONS: { value: ExportFormat; label: string; description: string }[] = [
  { value: 'png', label: 'PNG', description: '通过 SVG 转换，兼容性最佳' },
  { value: 'svg', label: 'SVG', description: '矢量格式，体积小、可缩放' },
];

export const PNG_RENDERER_OPTIONS: { value: PngRenderer; label: string; description: string }[] = [
  { value: 'browser', label: 'Browser', description: '前端渲染（snapdom/html2canvas），无需后端 render-api' },
  { value: 'render-api', label: 'Render API', description: '后端 Playwright 渲染，失败时自动回退前端' },
];

export interface LlmGlobalSettings {
  baseURL: string;
}

export interface IconMappingSettings {
  enabled: boolean;
  cdnUrl: string;
  fallbackIcon: string;
}

export interface AppGlobalSettings {
  bottomReservedPx: number;
  exportFormat: ExportFormat;
  pngRenderer: PngRenderer;
  llm: LlmGlobalSettings;
  iconMapping: IconMappingSettings;
}

function clampNumber(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
  integer = false,
): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const normalized = Math.min(max, Math.max(min, parsed));
  return integer ? Math.round(normalized) : normalized;
}

function stringOrFallback(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  return value;
}

function nonEmptyTrimmedString(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
}

function resolveDefaultBaseURL(): string {
  const envBaseUrl = readPublicEnv('VITE_API_BASE_URL');
  if (envBaseUrl) return envBaseUrl;
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api`;
  }
  return '/api';
}

function resolveDefaultPngRenderer(): PngRenderer {
  const raw = readPublicEnv('VITE_PNG_RENDERER_DEFAULT').toLowerCase();
  if (raw === 'render-api' || raw === 'backend') return 'render-api';
  return 'browser';
}

export function createDefaultGlobalSettings(): AppGlobalSettings {
  return {
    bottomReservedPx: BOTTOM_RESERVED_PX,
    exportFormat: 'png',
    pngRenderer: resolveDefaultPngRenderer(),
    llm: {
      baseURL: resolveDefaultBaseURL(),
    },
    iconMapping: {
      enabled: false,
      cdnUrl: '',
      fallbackIcon: 'article',
    },
  };
}

function sanitizeSettings(
  raw: Partial<AppGlobalSettings>,
  defaults: AppGlobalSettings = createDefaultGlobalSettings(),
): AppGlobalSettings {
  const llmRaw: Partial<LlmGlobalSettings> = raw.llm ?? {};

  const exportFormat = raw.exportFormat === 'png' || raw.exportFormat === 'svg'
    ? raw.exportFormat
    : defaults.exportFormat;
  const pngRenderer = raw.pngRenderer === 'browser' || raw.pngRenderer === 'render-api'
    ? raw.pngRenderer
    : defaults.pngRenderer;

  const iconMappingRaw: Partial<IconMappingSettings> = raw.iconMapping ?? {};

  return {
    bottomReservedPx: clampNumber(raw.bottomReservedPx, defaults.bottomReservedPx, 0, 600, true),
    exportFormat,
    pngRenderer,
    llm: {
      baseURL: nonEmptyTrimmedString(llmRaw.baseURL, defaults.llm.baseURL),
    },
    iconMapping: {
      enabled: typeof iconMappingRaw.enabled === 'boolean' ? iconMappingRaw.enabled : defaults.iconMapping.enabled,
      cdnUrl: stringOrFallback(iconMappingRaw.cdnUrl, defaults.iconMapping.cdnUrl).trim(),
      fallbackIcon: nonEmptyTrimmedString(iconMappingRaw.fallbackIcon, defaults.iconMapping.fallbackIcon),
    },
  };
}

function removeLegacySettings(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function loadGlobalSettings(): AppGlobalSettings {
  const defaults = createDefaultGlobalSettings();
  if (typeof window === 'undefined') return defaults;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      removeLegacySettings();
      return defaults;
    }

    const parsed = JSON.parse(raw) as Partial<AppGlobalSettings>;
    const normalized = sanitizeSettings(
      {
        ...defaults,
        ...parsed,
        llm: {
          ...defaults.llm,
          ...(parsed.llm || {}),
        },
      },
      defaults,
    );

    removeLegacySettings();
    return normalized;
  } catch (error) {
    console.warn('Failed to load global settings. Using defaults.', error);
    return defaults;
  }
}

export function saveGlobalSettings(settings: AppGlobalSettings): AppGlobalSettings {
  const defaults = createDefaultGlobalSettings();
  const normalized = sanitizeSettings(settings, defaults);

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      removeLegacySettings();
    } catch (error) {
      console.warn('Failed to persist global settings.', error);
    }
  }

  return normalized;
}
