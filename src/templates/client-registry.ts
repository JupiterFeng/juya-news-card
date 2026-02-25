import metaJson from './meta.json';
import { DEFAULT_TEMPLATE, TEMPLATES } from './index';
import type { TemplateConfig } from './types';
export { DEFAULT_TEMPLATE } from './catalog';

type TemplateMetaEntry = {
  name?: string;
  description?: string;
  icon?: string;
  downloadable?: boolean;
  ssrReady?: boolean;
};

type TemplateMetaJson = {
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
  ]),
);

export { DEFAULT_TEMPLATE };

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
  const summary = TEMPLATE_SUMMARIES[templateId];
  const template = TEMPLATES[templateId];
  if (!summary || !template) {
    throw new Error(`Unknown templateId: ${templateId}`);
  }

  return {
    ...summary,
    ...template,
  };
}
