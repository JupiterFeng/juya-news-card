import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import mockData from './mock-data.json';
import { generateDownloadableHtml } from '../src/utils/template';
import { DEFAULT_TEMPLATE as catalogDefault, THEME_CATEGORIES } from '../src/templates/catalog';
import { DEFAULT_TEMPLATE as indexDefault } from '../src/templates/index';
import { ensureTemplateResolverRegistered } from '../src/templates/runtime-resolver';
import { generateTemplateHtml } from '../src/templates/ssr-runtime';

test('generateDownloadableHtml requires explicit resolver initialization', () => {
  const sample = mockData[0];
  assert.ok(sample);

  assert.throws(
    () => generateDownloadableHtml(sample),
    /Template resolver not initialized or template missing/
  );
});

test('generateDownloadableHtml works after explicit resolver initialization', () => {
  const sample = mockData[0];
  assert.ok(sample);

  ensureTemplateResolverRegistered();
  const html = generateDownloadableHtml(sample);
  assert.equal(typeof html, 'string');
  assert.ok(html.startsWith('<!DOCTYPE html>'));
  assert.ok(html.includes('<html lang="zh-CN">'));
});

test('generateTemplateHtml auto-initializes resolver', () => {
  const sample = mockData[0];
  assert.ok(sample);

  const html = generateTemplateHtml(sample);
  assert.equal(typeof html, 'string');
  assert.ok(html.startsWith('<!DOCTYPE html>'));
});

test('generateDownloadableHtml throws for unknown template id', () => {
  const sample = mockData[0];
  assert.ok(sample);

  ensureTemplateResolverRegistered();
  assert.throws(
    () => generateDownloadableHtml(sample, '__missing_template__'),
    /Unknown templateId: "__missing_template__"/
  );
});

test('DEFAULT_TEMPLATE stays a single source of truth', () => {
  assert.equal(indexDefault, catalogDefault);
  const clientRegistrySource = fs.readFileSync(
    new URL('../src/templates/client-registry.ts', import.meta.url),
    'utf8'
  );
  assert.match(clientRegistrySource, /export\s+\{\s*DEFAULT_TEMPLATE\s*\}\s+from\s+'\.\/catalog';/);
  assert.doesNotMatch(clientRegistrySource, /DEFAULT_TEMPLATE\s*=\s*['"][^'"]+['"]/);
});

test('shared theme categories are available to scripts and UI', () => {
  assert.ok(THEME_CATEGORIES.length > 0);
  for (const category of THEME_CATEGORIES) {
    assert.ok(Array.isArray(category.themeIds));
  }
});
