import assert from 'node:assert/strict';
import test from 'node:test';
import { sanitizeDescHtml } from '../src/utils/desc-format';

test('sanitizeDescHtml escapes html tags and keeps safe inline formatting', () => {
  const input = `<img src=x onerror=alert(1)> **重点** \`GPT-4o\``;
  const output = sanitizeDescHtml(input);

  assert.match(output, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(output, /<strong>重点<\/strong>/);
  assert.match(output, /<code>GPT-4o<\/code>/);
  assert.equal(output.includes('<img'), false);
});
