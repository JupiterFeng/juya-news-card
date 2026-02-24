import assert from 'node:assert/strict';
import test from 'node:test';
import { contentToMarkdown, parseMarkdownToContent } from '../src/utils/markdown-content';

test('parseMarkdownToContent parses title/cards/icon from markdown', () => {
  const markdown = `# 主标题

## 要点一
第一段描述
article`;

  const parsed = parseMarkdownToContent(markdown);
  assert.ok(parsed);
  assert.equal(parsed.mainTitle, '主标题');
  assert.equal(parsed.cards.length, 1);
  assert.equal(parsed.cards[0].title, '要点一');
  assert.equal(parsed.cards[0].icon, 'article');
  assert.match(parsed.cards[0].desc, /第一段描述/);
});

test('contentToMarkdown keeps icon token at section tail', () => {
  const markdown = contentToMarkdown({
    mainTitle: '测试标题',
    cards: [
      {
        title: '卡片标题',
        desc: '这里有<strong>重点</strong>',
        icon: 'check_circle',
      },
    ],
  });

  assert.match(markdown, /^# 测试标题/m);
  assert.match(markdown, /^## 卡片标题/m);
  assert.match(markdown, /^check_circle$/m);
});
