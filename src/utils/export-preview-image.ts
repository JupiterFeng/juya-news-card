import { createRoot } from 'react-dom/client';
import type { TemplateConfig } from '../templates/types';
import type { GeneratedContent } from '../types';
import { BOTTOM_RESERVED_PX } from './layout-calculator';
import type { ExportFormat } from './global-settings';

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;
const DEFAULT_WAIT_FOR_LAYOUT_MS = 320;
const DEFAULT_PIXEL_RATIO = 2;
type SnapdomFn = typeof import('@zumer/snapdom')['snapdom'];
type Html2CanvasFn = typeof import('html2canvas').default;

let snapdomLoader: Promise<SnapdomFn> | null = null;
let html2canvasLoader: Promise<Html2CanvasFn> | null = null;

interface GeneratePreviewImageOptions {
  template: TemplateConfig;
  data: GeneratedContent;
  /**
   * Export format: 'png' (default) or 'svg'
   */
  format?: ExportFormat;
  /**
   * Render scale used for export. Should normally stay at 1.
   */
  scale?: number;
  /**
   * Extra wait time to let template layout effects settle.
   */
  waitForLayoutMs?: number;
  /**
   * PNG output pixel ratio. 2 means 3840x2160 output from a 1920x1080 scene.
   */
  pixelRatio?: number;
  /**
   * Bottom reserve (px) injected into preview/export layout scripts.
   */
  bottomReservedPx?: number;
  /**
   * Optional canvas background fill, null keeps transparency.
   */
  backgroundColor?: string | null;
  /**
   * If provided, capture this element directly to keep output identical to preview.
   */
  sourceElement?: HTMLElement | null;
}

async function getSnapdom(): Promise<SnapdomFn> {
  if (!snapdomLoader) {
    snapdomLoader = import('@zumer/snapdom').then(mod => mod.snapdom);
  }
  return snapdomLoader;
}

async function getHtml2Canvas(): Promise<Html2CanvasFn> {
  if (!html2canvasLoader) {
    html2canvasLoader = import('html2canvas').then(mod => mod.default);
  }
  return html2canvasLoader;
}

export interface ExportResult {
  blob: Blob;
  format: ExportFormat;
  filename: string;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function nextFrame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()));
}

function clampNumber(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

async function ensureIconFontsReady(): Promise<void> {
  if (!document.fonts?.load) return;
  await Promise.allSettled([
    document.fonts.load('24px "Material Icons"'),
    document.fonts.load('24px "Material Symbols Rounded"'),
  ]);
  await delay(40);
}

async function waitForFinalLayoutSettle(waitForLayoutMs: number): Promise<void> {
  // Some templates run a second pass after fonts resolve (requestAnimationFrame + timeout).
  const settleMs = Math.min(700, Math.max(180, waitForLayoutMs));
  await nextFrame();
  await delay(settleMs);
  await nextFrame();
}

async function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  const pngBlob = await new Promise<Blob | null>(resolve => {
    canvas.toBlob(resolve, 'image/png');
  });
  if (!pngBlob) {
    throw new Error('Failed to encode PNG blob.');
  }
  return pngBlob;
}

/**
 * 使用 snapdom 渲染元素为 SVG 字符串
 * snapdom 专门支持图标字体（Material Symbols、Font Awesome 等）
 */
async function snapdomToSvg(options: {
  element: HTMLElement;
  scale: number;
  backgroundColor: string | null;
}): Promise<string> {
  const snapdom = await getSnapdom();
  const result = await snapdom(options.element, {
    scale: options.scale,
    backgroundColor: options.backgroundColor ?? '#ffffff',
    embedFonts: true,
    // fast: true, // Disable fast mode to ensure fonts and resources are fully embedded
  });
  const blob = await result.toBlob({ type: 'svg' });
  return await blob.text();
}

/**
 * SVG 字符串转 PNG Blob
 * 使用 Canvas API 进行转换
 */
async function svgToPngBlob(svgString: string, options: {
  width: number;
  height: number;
  scale: number;
  backgroundColor: string | null;
}): Promise<Blob> {
  const { width, height, scale, backgroundColor } = options;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas 2d context');
  }

  // 填充背景色（在绘制SVG之前）
  const bgColor = backgroundColor || '#ffffff';
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 创建 SVG Blob URL
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to PNG blob'));
          }
        }, 'image/png');
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(e);
      }
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load SVG image: ${e}`));
    };
    img.src = url;
  });
}

/**
 * 使用 snapdom 渲染元素为 PNG Blob（通过 SVG 转换）
 */
async function snapdomToPngBlob(options: {
  element: HTMLElement;
  width: number;
  height: number;
  scale: number;
  backgroundColor: string | null;
}): Promise<Blob> {
  const svgString = await snapdomToSvg({
    element: options.element,
    scale: 1, // SVG 本身不缩放，在转 PNG 时缩放
    backgroundColor: options.backgroundColor,
  });

  return await svgToPngBlob(svgString, {
    width: options.width,
    height: options.height,
    scale: options.scale,
    backgroundColor: options.backgroundColor,
  });
}

async function renderElementToCanvas(options: {
  element: HTMLElement;
  width: number;
  height: number;
  scale: number;
  backgroundColor: string | null;
}): Promise<HTMLCanvasElement> {
  const html2canvas = await getHtml2Canvas();
  return html2canvas(options.element, {
    width: options.width,
    height: options.height,
    scale: options.scale,
    backgroundColor: options.backgroundColor,
    useCORS: true,
    allowTaint: true,
    logging: false,
    imageTimeout: 0,
    removeContainer: true,
    windowWidth: options.width,
    windowHeight: options.height,
    scrollX: 0,
    scrollY: 0,
    foreignObjectRendering: false,
  });
}

/**
 * 使用 snapdom 生成 SVG Blob
 */
async function generateSvgBlob(options: {
  element: HTMLElement;
  scale: number;
  backgroundColor: string | null;
}): Promise<Blob> {
  const svgString = await snapdomToSvg({
    element: options.element,
    scale: options.scale,
    backgroundColor: options.backgroundColor,
  });
  return new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
}

/**
 * 带 fallback 的图片生成
 * - SVG: 直接使用 snapdom 生成
 * - PNG: 优先使用 snapdom SVG 转 PNG，失败时回退到 html2canvas
 */
async function generateImageBlob(options: {
  element: HTMLElement;
  width: number;
  height: number;
  scale: number;
  backgroundColor: string | null;
  format: ExportFormat;
}): Promise<Blob> {
  const { format } = options;

  // SVG 格式：直接生成
  if (format === 'svg') {
    return await generateSvgBlob({
      element: options.element,
      scale: options.scale,
      backgroundColor: options.backgroundColor,
    });
  }

  // PNG 格式：优先使用 snapdom SVG 转 PNG
  try {
    const blob = await snapdomToPngBlob({
      element: options.element,
      width: options.width,
      height: options.height,
      scale: options.scale,
      backgroundColor: options.backgroundColor,
    });
    // 基本有效性检查
    if (blob.size > 1000) {
      return blob;
    }
    console.warn('[export] snapdom PNG output suspiciously small, trying fallback');
  } catch (e) {
    console.warn('[export] snapdom PNG failed, falling back to html2canvas:', e);
  }

  // 回退路径：使用 html2canvas
  console.info('[export] Using html2canvas fallback');
  const canvas = await renderElementToCanvas({
    element: options.element,
    width: options.width,
    height: options.height,
    scale: options.scale,
    backgroundColor: options.backgroundColor,
  });
  return await canvasToPngBlob(canvas);
}

/**
 * Export image from the same React template tree used by the live preview.
 * Supports both PNG (default) and SVG formats.
 */
export async function generateImageFromPreview(
  options: GeneratePreviewImageOptions
): Promise<ExportResult> {
  const {
    template,
    data,
    format = 'png',
    scale = 1,
    waitForLayoutMs = DEFAULT_WAIT_FOR_LAYOUT_MS,
    backgroundColor = null,
    sourceElement,
  } = options;

  const pixelRatio = clampNumber(options.pixelRatio, DEFAULT_PIXEL_RATIO, 1, 4);
  const bottomReservedPx = Math.round(
    clampNumber(options.bottomReservedPx, BOTTOM_RESERVED_PX, 0, 1000)
  );

  document.documentElement.dataset.p2vBottomReserved = String(bottomReservedPx);

  let element: HTMLElement;
  let width: number;
  let height: number;
  let renderScale: number;
  let cleanup: (() => void) | null = null;

  if (sourceElement) {
    if (document.fonts?.ready) {
      await Promise.race([document.fonts.ready, delay(1500)]);
      await delay(60);
    }
    await ensureIconFontsReady();
    await waitForFinalLayoutSettle(waitForLayoutMs);

    const rect = sourceElement.getBoundingClientRect();
    const measuredWidth = Math.max(1, rect.width);
    const measuredHeight = Math.max(1, rect.height);
    const measuredScaleX = measuredWidth / CANVAS_WIDTH;
    const measuredScaleY = measuredHeight / CANVAS_HEIGHT;

    // Prefer width-driven scale because preview containers may clip overflow vertically.
    const sceneScale = clampNumber(
      measuredScaleX > 0 ? measuredScaleX : measuredScaleY,
      1,
      0.1,
      4
    );
    width = Math.max(1, Math.round(CANVAS_WIDTH * sceneScale));
    height = Math.max(1, Math.round(CANVAS_HEIGHT * sceneScale));
    renderScale = clampNumber(pixelRatio / sceneScale, pixelRatio, 1, 8);
    const measuredWidthRounded = Math.round(measuredWidth);
    const measuredHeightRounded = Math.round(measuredHeight);
    if (Math.abs(height - measuredHeightRounded) > 2) {
      console.info(
        `[export] Normalized source element bounds from ${measuredWidthRounded}x${measuredHeightRounded} to ${width}x${height}`
      );
    }
    element = sourceElement;
  } else {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-10000px';
    container.style.top = '0';
    container.style.width = `${CANVAS_WIDTH}px`;
    container.style.height = `${CANVAS_HEIGHT}px`;
    container.style.overflow = 'hidden';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '-1';
    container.setAttribute('data-export-preview-image', 'true');
    document.body.appendChild(container);

    const root = createRoot(container);
    root.render(template.render(data, scale));

    cleanup = () => {
      root.unmount();
      container.remove();
    };

    await nextFrame();
    await delay(waitForLayoutMs);

    if (document.fonts?.ready) {
      await Promise.race([document.fonts.ready, delay(1500)]);
      await delay(60);
    }
    await ensureIconFontsReady();
    await waitForFinalLayoutSettle(waitForLayoutMs);

    element = container;
    width = CANVAS_WIDTH;
    height = CANVAS_HEIGHT;
    renderScale = pixelRatio;
  }

  try {
    const blob = await generateImageBlob({
      element,
      width,
      height,
      scale: renderScale,
      backgroundColor,
      format,
    });

    const timestamp = Date.now();
    const templateId = template.id || 'card';
    const filename = `${templateId}-${timestamp}.${format}`;

    return { blob, format, filename };
  } finally {
    cleanup?.();
  }
}

/**
 * Export PNG from preview (backward compatible wrapper)
 * @deprecated Use generateImageFromPreview instead
 */
export async function generatePngBlobFromPreview(
  options: Omit<GeneratePreviewImageOptions, 'format'>
): Promise<Blob> {
  const result = await generateImageFromPreview({ ...options, format: 'png' });
  return result.blob;
}
