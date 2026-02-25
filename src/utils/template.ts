/**
 * HTML 下载生成模块
 * 为所有主题提供统一的下载功能
 */

import { renderToStaticMarkup } from 'react-dom/server';
import { GeneratedContent } from '../types';
import type { TemplateConfig } from '../templates/types';
import { DEFAULT_TEMPLATE } from '../templates/catalog';
import {
  BOTTOM_RESERVED_PX,
  calculateStandardLayout,
  generateBottomReserveScript,
  generateTitleFitScript,
  generateViewportFitScript,
  getStandardTitleConfig,
} from './layout-calculator';

const DEFAULT_TAILWIND_SCRIPT_URL = 'https://cdn.tailwindcss.com';
const DEFAULT_MATERIAL_ICONS_URL = 'https://fonts.googleapis.com/icon?family=Material+Icons';
const DEFAULT_MATERIAL_SYMBOLS_URL = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap';
const DEFAULT_COMMON_GOOGLE_FONTS_URL = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=Poppins:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&family=Exo+2:wght@400;600;700&family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@500;700;900&family=Press+Start+2P&family=VT323&family=Fira+Code:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&family=Bebas+Neue&family=Space+Grotesk:wght@400;500;700&family=Fredoka+One&family=Nunito:wght@400;600;700;800&family=Quicksand:wght@500;600;700&family=Playfair+Display:wght@400;500;600;700;900&family=Lora:wght@400;500;600&family=Righteous&family=Noto+Sans+SC:wght@400;500;700&family=Google+Sans:wght@400;500;700&display=swap';

let templateResolver: ((id: string) => TemplateConfig | undefined) | null = null;
let defaultTemplateId = DEFAULT_TEMPLATE;

export function registerTemplateResolver(options: {
  defaultTemplateId: string;
  resolveTemplateById: (id: string) => TemplateConfig | undefined;
}): void {
  defaultTemplateId = options.defaultTemplateId;
  templateResolver = options.resolveTemplateById;
}

function readRuntimeEnvValue(viteKey: string, serverKey: string): string {
  const metaEnv = ((import.meta as unknown as { env?: Record<string, string | undefined> }).env || {});
  const fromVite = String(metaEnv[viteKey] || '').trim();
  if (fromVite) return fromVite;

  if (typeof process !== 'undefined' && process.env) {
    const fromServer = String(process.env[serverKey] || '').trim();
    if (fromServer) return fromServer;
  }

  return '';
}

function resolveTailwindScriptUrl(): string {
  return readRuntimeEnvValue('VITE_TAILWIND_SCRIPT_URL', 'TAILWIND_SCRIPT_URL') || DEFAULT_TAILWIND_SCRIPT_URL;
}

function resolveMaterialIconsUrl(): string {
  return readRuntimeEnvValue('VITE_MATERIAL_ICONS_URL', 'MATERIAL_ICONS_URL') || DEFAULT_MATERIAL_ICONS_URL;
}

function resolveMaterialSymbolsUrl(): string {
  return readRuntimeEnvValue('VITE_MATERIAL_SYMBOLS_URL', 'MATERIAL_SYMBOLS_URL') || DEFAULT_MATERIAL_SYMBOLS_URL;
}

function resolveCommonGoogleFontsUrl(): string {
  return readRuntimeEnvValue('VITE_COMMON_GOOGLE_FONTS_URL', 'COMMON_GOOGLE_FONTS_URL') || DEFAULT_COMMON_GOOGLE_FONTS_URL;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * 生成 SSR 布局调整脚本
 *
 * 注意：此函数用于纯 SSR 字符串输出，需要包含特殊布局修正逻辑
 * (hyperMinimal、onePageHero、scrollStory、bentoGrid 等模板的特殊处理)。
 *
 * 与 export-preview-html.ts 中的同名函数不同，后者是在真实 DOM 运行模板后
 * 序列化，布局样式已被 React useLayoutEffect 写入，因此只需基础脚本。
 */
function generateLayoutAdjustmentScript(
  cardCount: number,
  templateId: string,
  bottomReservedPx: number,
): string {
  const titleConfig = getStandardTitleConfig(cardCount);
  const layout = calculateStandardLayout(cardCount);

  return `<script>(function() {
  function toArray(nodeList) {
    return Array.prototype.slice.call(nodeList || []);
  }

  function hasPaddingUtilityClass(el) {
    var cls = typeof el.className === 'string' ? el.className : '';
    return /(^|\\s)p(?:x|y|t|r|b|l)?-[^\\s]+/.test(cls);
  }

  function shouldPreserveCardPadding(card) {
    if (!card) return false;
    if (card.dataset && card.dataset.p2vForceStandardPadding === 'true') return false;
    if (card.dataset && card.dataset.p2vPreservePadding === 'true') return true;

    // Explicit inline padding should always win.
    if (card.style && card.style.padding) return true;

    // Tailwind (or similar) utility classes like p-8 / px-5 should be respected.
    if (hasPaddingUtilityClass(card)) return true;

    // If computed padding already exists (from template CSS), keep it.
    try {
      var cs = getComputedStyle(card);
      var pt = parseFloat(cs.paddingTop || '0') || 0;
      var pr = parseFloat(cs.paddingRight || '0') || 0;
      var pb = parseFloat(cs.paddingBottom || '0') || 0;
      var pl = parseFloat(cs.paddingLeft || '0') || 0;
      if (pt + pr + pb + pl > 0.5) return true;
    } catch (e) {}

    return false;
  }

  function findCardContainer(cards, fallbackZone) {
    if (fallbackZone) return fallbackZone;
    if (!cards || cards.length === 0) return null;
    var first = cards[0];
    var p = first ? first.parentElement : null;
    while (p && p !== document.body) {
      var hits = toArray(p.querySelectorAll('.card-item, .card, [data-card-item="true"]'));
      if (hits.length >= cards.length) return p;
      p = p.parentElement;
    }
    return first ? first.parentElement : null;
  }

  var templateId = ${JSON.stringify(templateId)};
  var cards = toArray(document.querySelectorAll('.card-item, .card, [data-card-item="true"]'));
  var zone = findCardContainer(cards, document.querySelector('.card-zone, [data-card-zone="true"]'));
  if (!cards || cards.length === 0) return;

  function applySpecialLayout() {
    if (!zone) return false;

    if (templateId === 'hyperMinimal') {
      zone.style.display = 'flex';
      zone.style.flexDirection = 'column';
      zone.style.flexWrap = 'nowrap';
      zone.style.alignItems = 'center';
      zone.style.alignContent = 'stretch';
      zone.style.gap = '0px';
      zone.style.maxWidth = '1400px';
      cards.forEach(function(card) {
        card.classList.remove('card-width-2col', 'card-width-3col', 'card-width-4col');
        card.style.width = '100%';
        card.style.padding = '40px 0px';
      });
      return true;
    }

    if (templateId === 'onePageHero') {
      zone.style.display = 'flex';
      zone.style.flexDirection = 'column';
      zone.style.flexWrap = 'nowrap';
      zone.style.alignItems = 'center';
      zone.style.alignContent = 'stretch';
      zone.style.gap = '24px';
      cards.forEach(function(card) {
        card.classList.remove('card-width-2col', 'card-width-3col', 'card-width-4col');
        card.style.width = '100%';
        card.style.maxWidth = '1200px';
      });
      return true;
    }

    if (templateId === 'scrollStory') {
      var width = cards.length <= 3 ? '75%' : (cards.length <= 6 ? '66.666%' : '50%');
      zone.style.display = 'flex';
      zone.style.flexDirection = 'column';
      zone.style.flexWrap = 'nowrap';
      zone.style.alignItems = 'center';
      zone.style.alignContent = 'stretch';
      zone.style.gap = '32px';
      zone.style.maxWidth = '900px';
      cards.forEach(function(card) {
        card.classList.remove('card-width-2col', 'card-width-3col', 'card-width-4col');
        card.style.width = width;
        card.style.padding = '32px';
      });
      return true;
    }

    if (templateId === 'bentoGrid') {
      zone.style.alignItems = 'stretch';
      zone.style.alignContent = 'stretch';
      zone.style.maxWidth = '1400px';

      if (cards.length === 1) {
        zone.style.display = 'flex';
        zone.style.flexDirection = 'row';
        zone.style.flexWrap = 'nowrap';
        zone.style.justifyContent = 'center';
        zone.style.gap = '20px';
      } else if (cards.length <= 4) {
        zone.style.display = 'grid';
        zone.style.gridTemplateColumns = 'repeat(2, 1fr)';
        zone.style.gridAutoRows = 'minmax(200px, auto)';
        zone.style.gap = '18px';
      } else {
        zone.style.display = 'grid';
        zone.style.gridTemplateColumns = 'repeat(4, 1fr)';
        zone.style.gridAutoRows = 'minmax(180px, auto)';
        zone.style.gap = cards.length <= 6 ? '16px' : '12px';
      }

      cards.forEach(function(card, idx) {
        card.classList.remove('card-width-2col', 'card-width-3col', 'card-width-4col');
        card.style.width = '';
        card.style.maxWidth = '';
        card.style.gridColumn = '';
        card.style.gridRow = '';
        if (cards.length === 1) {
          card.style.width = '66.666%';
        }
        if (idx === 0 && cards.length === 4) {
          card.style.gridColumn = 'span 2';
          card.style.gridRow = 'span 2';
        }
        if (idx === 0 && cards.length > 6) {
          card.style.gridColumn = 'span 2';
          card.style.gridRow = 'span 2';
        }
      });

      return true;
    }

    return false;
  }

  if (!applySpecialLayout()) {
    var widthClass = ${JSON.stringify(layout.cardWidthClass)};
    cards.forEach(function(card) {
      var i = card.querySelector('.js-icon, .material-symbols-rounded, .material-icons');

      card.classList.remove('card-width-2col', 'card-width-3col', 'card-width-4col');
      card.style.width = '';
      if (widthClass === 'w-2/3') {
        card.style.width = '66.666%';
      } else if (widthClass.indexOf('card-width-') === 0) {
        card.classList.add(widthClass);
      }

      var preserveCardPadding = templateId === 'claudeStyle' || templateId === 'springFestivalStyle' || shouldPreserveCardPadding(card);
      if (!preserveCardPadding) {
        card.style.padding = ${JSON.stringify(layout.cardPadding)};
      }
      if (i) i.style.fontSize = ${JSON.stringify(layout.iconSize)};
    });

    if (zone) {
      zone.style.gap = ${JSON.stringify(layout.containerGap)};
      try { zone.style.setProperty('--container-gap', ${JSON.stringify(layout.containerGap)}); } catch (e) {}
    }

    var wrapper = document.querySelector('.content-wrapper');
    if (wrapper) {
      wrapper.style.gap = ${JSON.stringify(layout.wrapperGap)};
      ${layout.wrapperPaddingX ? `wrapper.style.paddingLeft = ${JSON.stringify(layout.wrapperPaddingX)}; wrapper.style.paddingRight = ${JSON.stringify(layout.wrapperPaddingX)};` : ''}
    }
  }
})();${generateBottomReserveScript(bottomReservedPx)}${generateTitleFitScript(titleConfig)}${generateViewportFitScript()}</script>`;
}

/**
 * 生成可下载的 HTML (Unified React SSR)
 */
export function generateDownloadableHtml(
  data: GeneratedContent,
  templateId: string = defaultTemplateId,
  options?: {
    bottomReservedPx?: number;
  },
): string {
  const template = templateResolver?.(templateId);
  if (!template) {
    throw new Error(
      `Unknown templateId: "${templateId}". ` +
      'Template resolver not initialized or template missing. ' +
      'Call ensureTemplateResolverRegistered() before rendering.'
    );
  }

  if (!template.render) {
    throw new Error(`Template render function missing: ${templateId}`);
  }

  let componentHtml: string;
  try {
    componentHtml = renderToStaticMarkup(template.render(data, 1));
  } catch (error) {
    console.error(`[SSR Error] Template ${templateId} render failed:`, error);
    throw new Error(`Template render failed: ${templateId}`, {
      cause: error instanceof Error ? error : undefined,
    });
  }
  const parsedBottomReservedPx = Number(options?.bottomReservedPx);
  const bottomReservedPx = Number.isFinite(parsedBottomReservedPx)
    ? Math.max(0, Math.round(parsedBottomReservedPx))
    : BOTTOM_RESERVED_PX;
  const layoutScript = generateLayoutAdjustmentScript(data.cards.length, templateId, bottomReservedPx);
  const needsTailwind = !template.selfContainedCss;
  const tailwindScriptUrl = escapeHtml(resolveTailwindScriptUrl());
  const materialIconsUrl = escapeHtml(resolveMaterialIconsUrl());
  const materialSymbolsUrl = escapeHtml(resolveMaterialSymbolsUrl());
  const commonGoogleFontsUrl = escapeHtml(resolveCommonGoogleFontsUrl());

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(data.mainTitle)}</title>
  ${needsTailwind ? `<script src="${tailwindScriptUrl}"></script>` : ''}
  <link href="${materialIconsUrl}" rel="stylesheet">
  <link href="${materialSymbolsUrl}" rel="stylesheet">
  <link href="${commonGoogleFontsUrl}" rel="stylesheet">
  <style>
    /* 基础重置 */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 1920px; height: 1080px; overflow: hidden; }
    body { background: transparent; }
    .material-symbols-rounded { font-family: 'Material Symbols Rounded' !important; font-weight: normal; font-style: normal; font-size: 24px; line-height: 1; letter-spacing: normal; text-transform: none; display: inline-block; white-space: nowrap; word-wrap: normal; direction: ltr; }
    /* 全局兜底：老主题缺失局部定义时，保证网格宽度与字号梯度可用 */
    .card-width-2col { width: calc((100% - var(--container-gap, 24px)) / 2 - 1px); }
    .card-width-3col { width: calc((100% - var(--container-gap, 24px) * 2) / 3 - 1px); }
    .card-width-4col { width: calc((100% - var(--container-gap, 24px) * 3) / 4 - 1px); }
    .text-5-5xl { font-size: 3.375rem; line-height: 1.1; }
    .text-4-5xl { font-size: 2.625rem; line-height: 1.2; }
    .text-3-5xl { font-size: 2.0625rem; line-height: 1.3; }
    .text-2-5xl { font-size: 1.8125rem; line-height: 1.4; }
  </style>
</head>
<body>
  ${componentHtml}
  ${layoutScript}
</body>
</html>`;
}
