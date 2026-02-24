import { createRoot } from 'react-dom/client';
import type { TemplateConfig } from '../templates/types';
import type { GeneratedContent } from '../types';
import {
  BOTTOM_RESERVED_PX,
  generateBottomReserveScript,
  generateTitleFitScript,
  generateViewportFitScript,
  getStandardTitleConfig,
} from './layout-calculator';

interface GeneratePreviewHtmlOptions {
  template: TemplateConfig;
  data: GeneratedContent;
  /**
   * Render scale used for export. Preview exports should normally be 1.
   * Some templates rely on `scale` to set the outer wrapper transform.
   */
  scale?: number;
  /**
   * Extra wait time to let template `useLayoutEffect` + `setTimeout(...)` settle.
   */
  waitForLayoutMs?: number;
  /**
   * Bottom reserve (px) injected into preview/export layout scripts.
   */
  bottomReservedPx?: number;
}

const COMMON_GOOGLE_FONTS_LINK =
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=Poppins:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&family=Exo+2:wght@400;600;700&family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@500;700;900&family=Press+Start+2P&family=VT323&family=Fira+Code:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&family=Bebas+Neue&family=Space+Grotesk:wght@400;500;700&family=Fredoka+One&family=Nunito:wght@400;600;700;800&family=Quicksand:wght@500;600;700&family=Playfair+Display:wght@400;500;600;700;900&family=Lora:wght@400;500;600&family=Righteous&family=Noto+Sans+SC:wght@400;500;700&display=swap';

const DEFAULT_TAILWIND_SCRIPT_URL = 'https://cdn.tailwindcss.com';
const DEFAULT_MATERIAL_ICONS_URL = 'https://fonts.googleapis.com/icon?family=Material+Icons';
const DEFAULT_MATERIAL_SYMBOLS_URL = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap';

function readEnv(viteKey: keyof ImportMetaEnv): string {
  return String(import.meta.env[viteKey] || '').trim();
}

function resolveAssetUrl(viteKey: keyof ImportMetaEnv, fallback: string): string {
  const value = readEnv(viteKey);
  return value || fallback;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function nextFrame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()));
}

function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/**
 * 生成前端预览导出的布局脚本
 *
 * 注意：此函数用于前端 DOM 序列化场景。由于模板已在真实 DOM 运行，
 * React useLayoutEffect 已将最终布局样式写入元素，因此只需基础脚本
 * (底部预留、标题适配、视口适配)，无需特殊布局修正逻辑。
 *
 * 与 template.ts 中的同名函数不同，后者用于纯 SSR 输出，需要额外处理
 * hyperMinimal、onePageHero 等模板的特殊布局。
 */
function generateLayoutAdjustmentScript(cardCount: number, bottomReservedPx: number): string {
  const titleConfig = getStandardTitleConfig(cardCount);
  return `<script>${generateBottomReserveScript(bottomReservedPx)}${generateTitleFitScript(titleConfig)}${generateViewportFitScript()}</script>`;
}

function buildHtmlDocument(options: {
  title: string;
  bodyInnerHtml: string;
  needsTailwind: boolean;
  cardCount: number;
  bottomReservedPx: number;
}): string {
  const tailwindScriptUrl = resolveAssetUrl('VITE_TAILWIND_SCRIPT_URL', DEFAULT_TAILWIND_SCRIPT_URL);
  const materialIconsUrl = resolveAssetUrl('VITE_MATERIAL_ICONS_URL', DEFAULT_MATERIAL_ICONS_URL);
  const materialSymbolsUrl = resolveAssetUrl('VITE_MATERIAL_SYMBOLS_URL', DEFAULT_MATERIAL_SYMBOLS_URL);
  const commonFontsUrl = resolveAssetUrl('VITE_COMMON_GOOGLE_FONTS_URL', COMMON_GOOGLE_FONTS_LINK);

  return `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(options.title)}</title>
    ${options.needsTailwind ? `<script src="${tailwindScriptUrl}"></script>` : ''}
    <link href="${materialIconsUrl}" rel="stylesheet">
    <link href="${materialSymbolsUrl}" rel="stylesheet">
    <link href="${commonFontsUrl}" rel="stylesheet">
    <style>
      html, body { margin: 0; padding: 0; width: 1920px; height: 1080px; overflow: hidden; }
      body { background: transparent; }
      .material-symbols-rounded {
        font-family: 'Material Symbols Rounded' !important;
        font-weight: normal;
        font-style: normal;
        font-size: 24px;
        line-height: 1;
        letter-spacing: normal;
        text-transform: none;
        display: inline-block;
        white-space: nowrap;
        word-wrap: normal;
        direction: ltr;
        font-variation-settings: 'OPSZ 24, wght 400, GRAD 0, FILL 0' !important;
      }
      .material-icons {
        font-family: 'Material Icons' !important;
        font-weight: normal;
        font-style: normal;
        font-size: 24px;
        line-height: 1;
        letter-spacing: normal;
        text-transform: none;
        display: inline-block;
        white-space: nowrap;
        word-wrap: normal;
        direction: ltr;
      }
    </style>
  </head>
  <body>
    ${options.bodyInnerHtml}
    ${generateLayoutAdjustmentScript(options.cardCount, options.bottomReservedPx)}
  </body>
</html>
`;
}

/**
 * Export downloadable HTML by reusing the exact React template used in the preview.
 *
 * Why this works:
 * - We render the same `template.render(data, scale)` into an offscreen DOM node.
 * - Template `useLayoutEffect` runs and writes final inline styles/classes.
 * - We serialize the resulting DOM into a standalone HTML document.
 */
export async function generateDownloadableHtmlFromPreview(
  options: GeneratePreviewHtmlOptions
): Promise<string> {
  const { template, data, scale = 1, waitForLayoutMs = 220 } = options;
  const parsedBottomReservedPx = Number(options.bottomReservedPx);
  const bottomReservedPx = Number.isFinite(parsedBottomReservedPx)
    ? Math.max(0, Math.round(parsedBottomReservedPx))
    : BOTTOM_RESERVED_PX;

  document.documentElement.dataset.p2vBottomReserved = String(bottomReservedPx);

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-10000px';
  container.style.top = '0';
  container.style.width = '1920px';
  container.style.height = '1080px';
  container.style.overflow = 'hidden';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '-1';
  container.setAttribute('data-export-preview', 'true');
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(template.render(data, scale));

  // Ensure React commit + layout effects + any internal timeouts have settled.
  await nextFrame();
  await delay(waitForLayoutMs);

  if (document.fonts?.ready) {
    await Promise.race([document.fonts.ready, delay(1500)]);
    await delay(60);
  }

  const bodyInnerHtml = container.innerHTML;

  root.unmount();
  container.remove();

  return buildHtmlDocument({
    title: data.mainTitle,
    bodyInnerHtml,
    needsTailwind: !template.selfContainedCss,
    cardCount: data.cards.length,
    bottomReservedPx,
  });
}
