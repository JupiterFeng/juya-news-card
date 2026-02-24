import metaJson from './meta.json';
import type { TemplateConfig } from './types';

type TemplateMetaEntry = {
  filePath: string;
  name?: string;
  description?: string;
  icon?: string;
  downloadable?: boolean;
  ssrReady?: boolean;
};

type TemplateMetaJson = {
  version: string;
  generatedAt: number;
  templates: Record<string, TemplateMetaEntry>;
};

export type TemplateSummary = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  downloadable: boolean;
  ssrReady: boolean;
};

const TEMPLATE_META = metaJson as TemplateMetaJson;
const MODULE_LOADERS = import.meta.glob('./*.tsx');
const TEMPLATE_CACHE = new Map<string, Promise<TemplateConfig>>();

export const DEFAULT_TEMPLATE = 'claudeStyle';

const TEMPLATE_SUMMARIES: Record<string, TemplateSummary> = Object.fromEntries(
  Object.entries(TEMPLATE_META.templates).map(([id, entry]) => [
    id,
    {
      id,
      name: entry.name || id,
      ...(entry.description ? { description: entry.description } : {}),
      ...(entry.icon ? { icon: entry.icon } : {}),
      downloadable: entry.downloadable !== false,
      ssrReady: entry.ssrReady === true,
    },
  ])
);

function toModuleKey(filePath: string): string {
  const fileName = filePath.split('/').pop() || '';
  return `./${fileName}`;
}

function isTemplateConfigCandidate(value: unknown, templateId: string): value is TemplateConfig {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<TemplateConfig>;
  return candidate.id === templateId && typeof candidate.render === 'function';
}

export function getTemplateSummaries(): Record<string, TemplateSummary> {
  return TEMPLATE_SUMMARIES;
}

export function getTemplateSummary(templateId: string): TemplateSummary | undefined {
  return TEMPLATE_SUMMARIES[templateId];
}

export function getTemplateIds(): string[] {
  return Object.keys(TEMPLATE_SUMMARIES);
}

export async function loadTemplateConfig(templateId: string): Promise<TemplateConfig> {
  const cached = TEMPLATE_CACHE.get(templateId);
  if (cached) return cached;

  const summary = TEMPLATE_SUMMARIES[templateId];
  const metaEntry = TEMPLATE_META.templates[templateId];
  if (!summary || !metaEntry) {
    throw new Error(`Unknown templateId: ${templateId}`);
  }

  const moduleKey = toModuleKey(metaEntry.filePath);
  const loader = MODULE_LOADERS[moduleKey];
  if (!loader) {
    throw new Error(`Template module not found for ${templateId}: ${moduleKey}`);
  }

  const promise = loader().then((mod) => {
    const template = Object.values(mod as Record<string, unknown>).find(value =>
      isTemplateConfigCandidate(value, templateId)
    );
    if (!template) {
      throw new Error(`TemplateConfig export not found in module: ${moduleKey}`);
    }
    return {
      ...summary,
      ...template,
    } as TemplateConfig;
  });

  TEMPLATE_CACHE.set(templateId, promise);
  return promise;
}
