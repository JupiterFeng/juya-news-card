import { GeneratedContent } from '../types';
import { sanitizeDescHtml } from './desc-format';

const ICON_PATTERN = /^[a-z0-9][a-z0-9_,\-\s]{1,150}$/i;

function stripMarkdownCodeFence(input: string): string {
  const trimmed = input.trim();
  if (!trimmed.startsWith('```')) return trimmed;

  const lines = trimmed.split('\n');
  if (lines.length < 3) return trimmed;
  if (lines.at(-1)?.trim() !== '```') return trimmed;

  return lines.slice(1, -1).join('\n').trim();
}

function decodeHtmlEntities(input: string): string {
  return input
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'");
}

function descHtmlToMarkdown(descHtml: string): string {
  const markdownLike = descHtml
    .replaceAll(/<\s*code\s*>/gi, '`')
    .replaceAll(/<\s*\/\s*code\s*>/gi, '`')
    .replaceAll(/<\s*strong\s*>/gi, '**')
    .replaceAll(/<\s*\/\s*strong\s*>/gi, '**')
    .replaceAll(/<\s*br\s*\/?\s*>/gi, '\n')
    .replaceAll(/<[^>]*>/g, '');

  return decodeHtmlEntities(markdownLike).trim();
}

export function contentToMarkdown(content: GeneratedContent): string {
  const mainTitle = content.mainTitle.trim();
  const sections = content.cards
    .map((card) => {
      const title = card.title.trim();
      const desc = descHtmlToMarkdown(card.desc);
      if (!title || !desc) return null;
      const icon = ICON_PATTERN.test(card.icon) ? card.icon : 'article';
      return `## ${title}\n${desc}\n${icon}`;
    })
    .filter((section): section is string => section !== null);

  if (!mainTitle || sections.length === 0) return '';
  return `# ${mainTitle}\n\n${sections.join('\n\n')}`;
}

export function parseMarkdownToContent(markdown: string): GeneratedContent | null {
  const cleaned = stripMarkdownCodeFence(markdown).replaceAll(/\r\n?/g, '\n').trim();
  if (!cleaned) return null;

  const lines = cleaned.split('\n');
  let mainTitle = '';
  const cards: GeneratedContent['cards'] = [];
  let currentTitle = '';
  let currentBodyLines: string[] = [];

  const pushCard = () => {
    const title = currentTitle.trim();
    if (!title) return;

    const bodyLines = currentBodyLines.map((line) => line.trim()).filter(Boolean);
    let icon = 'article';
    let descLines = bodyLines;

    if (bodyLines.length >= 2) {
      const iconCandidate = bodyLines[bodyLines.length - 1];
      if (iconCandidate && ICON_PATTERN.test(iconCandidate)) {
        icon = iconCandidate;
        descLines = bodyLines.slice(0, -1);
      }
    }

    const descRaw = descLines.join(' ').trim();
    if (!descRaw) return;

    cards.push({
      title,
      desc: sanitizeDescHtml(descRaw),
      icon,
    });
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.startsWith('# ') && !line.startsWith('## ')) {
      if (!mainTitle) {
        mainTitle = line.slice(2).trim();
      }
      continue;
    }

    if (line.startsWith('## ')) {
      if (currentTitle) {
        pushCard();
      }
      currentTitle = line.slice(3).trim();
      currentBodyLines = [];
      continue;
    }

    if (currentTitle && line) {
      currentBodyLines.push(line);
    }
  }

  if (currentTitle) {
    pushCard();
  }

  if (!mainTitle || cards.length === 0) return null;
  return { mainTitle, cards: cards.slice(0, 8) };
}

export function parseJsonToContent(raw: string): GeneratedContent | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== 'object') return null;
  const obj = parsed as { mainTitle?: unknown; cards?: unknown };
  const mainTitle = typeof obj.mainTitle === 'string' ? obj.mainTitle.trim() : '';
  if (!mainTitle || !Array.isArray(obj.cards)) return null;

  const cards: GeneratedContent['cards'] = obj.cards
    .map((card) => {
      if (!card || typeof card !== 'object') return null;
      const entry = card as Record<string, unknown>;
      const title = typeof entry.title === 'string' ? entry.title.trim() : '';
      const desc = typeof entry.desc === 'string' ? entry.desc.trim() : '';
      const iconValue = typeof entry.icon === 'string' ? entry.icon.trim() : '';
      if (!title || !desc) return null;

      return {
        title,
        desc: sanitizeDescHtml(desc),
        icon: ICON_PATTERN.test(iconValue) ? iconValue : 'article',
      };
    })
    .filter((card): card is GeneratedContent['cards'][number] => card !== null);

  if (cards.length === 0) return null;
  return { mainTitle, cards: cards.slice(0, 8) };
}
