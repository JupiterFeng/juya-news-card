import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { TEMPLATES } from '../src/templates/index';
import { DEFAULT_TEMPLATE, THEME_CATEGORIES } from '../src/templates/catalog';

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

function readTemplateMeta(): TemplateMetaJson {
  const content = fs.readFileSync(
    new URL('../src/templates/meta.json', import.meta.url),
    'utf8'
  );
  return JSON.parse(content) as TemplateMetaJson;
}

test('catalog/template/meta stay in sync', () => {
  const templateIds = Object.keys(TEMPLATES);
  const metaIds = Object.keys(readTemplateMeta().templates || {});
  const categoryIds = THEME_CATEGORIES.flatMap(category => category.themeIds);
  const uniqueCategoryIds = [...new Set(categoryIds)];

  const duplicates = categoryIds.filter((id, index) => categoryIds.indexOf(id) !== index);
  assert.deepEqual([...new Set(duplicates)], [], 'theme ids should not repeat across categories');

  const missingInTemplates = uniqueCategoryIds.filter(id => !templateIds.includes(id));
  const missingInMeta = uniqueCategoryIds.filter(id => !metaIds.includes(id));
  const uncategorizedTemplates = templateIds.filter(id => !uniqueCategoryIds.includes(id));
  const uncategorizedMeta = metaIds.filter(id => !uniqueCategoryIds.includes(id));

  assert.deepEqual(missingInTemplates, [], 'all catalog ids must exist in TEMPLATES');
  assert.deepEqual(missingInMeta, [], 'all catalog ids must exist in meta.json');
  assert.deepEqual(uncategorizedTemplates, [], 'all templates should be categorized');
  assert.deepEqual(uncategorizedMeta, [], 'all template meta entries should be categorized');

  assert.ok(templateIds.includes(DEFAULT_TEMPLATE), 'default template must exist in TEMPLATES');
  assert.ok(metaIds.includes(DEFAULT_TEMPLATE), 'default template must exist in meta.json');
});
