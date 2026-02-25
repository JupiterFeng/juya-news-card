import { registerTemplateResolver } from '../utils/template';
import { DEFAULT_TEMPLATE } from './catalog';
import { TEMPLATES } from './index';

let initialized = false;

export function ensureTemplateResolverRegistered(): void {
  if (initialized) return;

  registerTemplateResolver({
    defaultTemplateId: DEFAULT_TEMPLATE,
    resolveTemplateById: (id) => TEMPLATES[id],
  });

  initialized = true;
}
