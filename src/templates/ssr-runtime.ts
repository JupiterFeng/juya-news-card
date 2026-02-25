import type { GeneratedContent } from '../types';
import { ensureTemplateResolverRegistered } from './runtime-resolver';
import { generateDownloadableHtml } from '../utils/template';

type HtmlRenderOptions = {
  bottomReservedPx?: number;
};

export function generateTemplateHtml(
  data: GeneratedContent,
  templateId?: string,
  options?: HtmlRenderOptions,
): string {
  ensureTemplateResolverRegistered();
  return generateDownloadableHtml(data, templateId, options);
}
