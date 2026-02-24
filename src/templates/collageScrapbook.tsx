import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import {
  calculateStandardLayout,
  getStandardTitleConfig,
  generateTitleFitScript,
  generateViewportFitScript,
  getCardThemeColor,
} from '../utils/layout-calculator';
import { autoAddSpaceToHtml } from '../utils/text-spacing';
import { generateDownloadableHtml } from '../utils/template';

/**
 * CollageScrapbook 渲染组件
 * 拼贴UI/手账风格：胶带效果、手写标注、纸张纹理、拼贴布局
 *
 * 特色主题样板：
 * - 保留统一布局骨架（标准引擎）
 * - 视觉层自由发挥（纸张、胶带、贴纸）
 * - 视觉随机必须可复现（seed）
 */
interface CollageScrapbookProps {
  data: GeneratedContent;
  scale: number;
}

// 纸张颜色 - 各种纸张质感（自定义视觉风格）
const PAPER_COLORS = [
  { bg: '#FFF9E6', tape: '#E8D4A8', border: '#D4C4A8' },  // 米黄纸
  { bg: '#E8F4F8', tape: '#B8D4DC', border: '#A8C8D4' },  // 蓝白纸
  { bg: '#FDF2E8', tape: '#E8C8A8', border: '#D8B898' },  // 奶白纸
  { bg: '#F0F8E8', tape: '#C8DCA8', border: '#B8D098' },  // 淡绿纸
  { bg: '#F8E8F0', tape: '#DCA8C0', border: '#C898B8' },  // 粉红纸
  { bg: '#FFE8E8', tape: '#DCA8A8', border: '#C89898' },  // 浅红纸
  { bg: '#F0E8F8', tape: '#C8A8DC', border: '#B898C8' },  // 淡紫纸
  { bg: '#FFF8E8', tape: '#E8DCA8', border: '#D8CC98' },  // 淡黄纸
];

const STICKERS = ['📌', '✨', '📝', '🎨', '🧷', '📎', '⭐', '💡'];

interface CardDecoration {
  cardRotateDeg: number;
  cardOffsetY: number;
  tapeTopRotateDeg: number;
  tapeBottomRotateDeg: number;
  tapeTopWidthPx: number;
  tapeBottomWidthPx: number;
}

interface CornerSticker {
  emoji: string;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  rotateDeg: number;
  opacity: number;
}

function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getCardDecoration(seed: number, cardIndex: number): CardDecoration {
  const rng = createRng(seed + (cardIndex + 1) * 7919);
  return {
    cardRotateDeg: Number((rng() * 10 - 5).toFixed(1)),
    cardOffsetY: Math.round(rng() * 8 - 4),
    tapeTopRotateDeg: Math.round(rng() * 24 - 12),
    tapeBottomRotateDeg: Math.round(rng() * 18 - 9),
    tapeTopWidthPx: 84 + Math.round(rng() * 26),
    tapeBottomWidthPx: 54 + Math.round(rng() * 24),
  };
}

function getCornerStickers(seed: number): CornerSticker[] {
  const anchors: Omit<CornerSticker, 'emoji' | 'rotateDeg' | 'opacity'>[] = [
    { top: '8%', left: '8%' },
    { top: '12%', right: '10%' },
    { bottom: '10%', left: '12%' },
    { bottom: '8%', right: '8%' },
  ];

  return anchors.map((anchor, index) => {
    const rng = createRng(seed + 100003 + index * 97);
    return {
      ...anchor,
      emoji: STICKERS[Math.floor(rng() * STICKERS.length)],
      rotateDeg: Math.round(rng() * 30 - 15),
      opacity: Number((0.7 + rng() * 0.2).toFixed(2)),
    };
  });
}

const CollageScrapbook: React.FC<CollageScrapbookProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const N = data.cards.length;

  // ✅ 使用通用布局引擎（与 googleMaterial、microsoftFluent 统一）
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';
  const seed = useMemo(() => {
    const key = `${data.mainTitle}::${data.cards.map((c) => `${c.title}|${c.icon}`).join('||')}`;
    return hashString(key);
  }, [data]);

  const cardDecorations = useMemo(
    () => data.cards.map((_card, idx) => getCardDecoration(seed, idx)),
    [data.cards, seed]
  );

  const cornerStickers = useMemo(() => getCornerStickers(seed), [seed]);

  const titleDecor = useMemo(() => {
    const rng = createRng(seed + 4049);
    return {
      tapeRotateDeg: Math.round(rng() * 8 - 4),
      paperRotateDeg: Number((rng() * 4 - 2).toFixed(1)),
    };
  }, [seed]);

  // 仅用于浏览器环境的动态调整
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if (!wrapperRef.current || !titleRef.current) return;

    const wrapper = wrapperRef.current;
    const title = titleRef.current;

    // 标题适配
    const fitTitle = () => {
      let size = titleConfig.initialFontSize;
      title.style.fontSize = size + 'px';
      let guard = 0;
      while (title.scrollWidth > 1700 && size > titleConfig.minFontSize && guard < 100) {
        size -= 1;
        title.style.fontSize = size + 'px';
        guard++;
      }
    };
    fitTitle();

    // 视口适配
    const fitViewport = () => {
      const maxH = 1040;
      const contentH = wrapper.scrollHeight;
      if (contentH > maxH) {
        const scaleVal = Math.max(0.6, maxH / contentH);
        wrapper.style.transform = `scale(${scaleVal})`;
        return;
      }
      wrapper.style.transform = '';
    };

    const timer = window.setTimeout(fitViewport, 50);
    return () => window.clearTimeout(timer);
  }, [data, titleConfig]);

  // SSR 脚本
  const ssrScript = `
    ${generateTitleFitScript(titleConfig)}
    ${generateViewportFitScript()}
  `;

  return (
    <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', overflow: 'hidden' }}>
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .scrapbook-container {
          font-family: 'CustomPreviewFont', 'Comic Sans MS', 'Chalkboard', cursive;
        }
        .scrapbook-title {
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #4A4A4A;
          font-family: 'Comic Sans MS', 'Chalkboard', cursive;
          text-shadow: 1px 1px 0 rgba(0,0,0,0.1);
          white-space: nowrap;
        }
        .scrapbook-card {
          display: flex;
          flex-direction: column;
          position: relative;
          box-shadow: 3px 3px 8px rgba(0,0,0,0.15);
          transition: transform 0.15s ease;
        }
        /* 胶带效果 */
        .tape {
          position: absolute;
          height: 30px;
          opacity: 0.7;
          pointer-events: none;
          filter: saturate(0.9);
        }
        .tape-top-left {
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
        }
        .tape-bottom-right {
          bottom: -12px;
          right: 20px;
        }
        /* 纸张纹理 */
        .paper-texture {
          background-image:
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 1px,
              rgba(0,0,0,0.015) 1px,
              rgba(0,0,0,0.015) 2px
            );
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
          position: relative;
          z-index: 1;
        }
        .js-title-scrapbook {
          font-weight: bold;
          color: #4A4A4A;
          font-family: 'Comic Sans MS', 'Chalkboard', cursive;
        }
        .js-icon-scrapbook {
          color: #666;
        }
        .js-desc-scrapbook {
          line-height: 1.6;
          font-weight: 500;
          position: relative;
          z-index: 1;
          color: #5A5A5A;
          font-family: 'Georgia', serif;
        }
        .js-desc-scrapbook code {
          background: rgba(0,0,0,0.08);
          color: #8B4513;
          padding: 0.2em 0.5em;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
          font-weight: 600;
          border: 1px dashed rgba(139, 69, 19, 0.3);
        }
        .js-desc-scrapbook strong {
          font-weight: 700;
          color: #8B4513;
        }
        /* 手账背景 */
        .scrapbook-bg {
          background: linear-gradient(135deg, #F5F0E6 0%, #E8E0D0 50%, #F0E8DC 100%);
          position: relative;
        }
        /* 网格线 */
        .scrapbook-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(100, 100, 100, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100, 100, 100, 0.05) 1px, transparent 1px);
          background-size: 20px 20px;
          pointer-events: none;
        }
        /* 装饰性贴纸 */
        .sticker {
          position: absolute;
          font-size: 24px;
          opacity: 0.8;
        }
        /* 卡片宽度类（与标准主题统一） */
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }

        .text-6xl { font-size: 3.75rem; line-height: 1; }
        .text-5xl { font-size: 3rem; line-height: 1; }
        .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
        .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
        .text-2xl { font-size: 1.5rem; line-height: 2rem; }
        .text-xl  { font-size: 1.25rem; line-height: 1.75rem; }

        /* 中间档位字体 */
        .text-5-5xl { font-size: 3.375rem; line-height: 1.1; }
        .text-4-5xl { font-size: 2.625rem; line-height: 1.2; }
        .text-3-5xl { font-size: 2.0625rem; line-height: 1.3; }
        .text-2-5xl { font-size: 1.8125rem; line-height: 1.4; }
        .content-scale { transform-origin: center center; }
      `}</style>

      <div
        className="scrapbook-container scrapbook-bg relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        {/* 装饰性贴纸 */}
        {cornerStickers.map((sticker, idx) => (
          <span
            key={`${sticker.emoji}-${idx}`}
            className="sticker"
            style={{
              top: sticker.top,
              right: sticker.right,
              bottom: sticker.bottom,
              left: sticker.left,
              transform: `rotate(${sticker.rotateDeg}deg)`,
              opacity: sticker.opacity,
            }}
          >
            {sticker.emoji}
          </span>
        ))}

        <div
          ref={wrapperRef}
          className="content-wrapper content-scale relative z-10 w-full flex flex-col items-center px-24 box-border"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}
        >
          {/* 标题区域 */}
          <div className="title-zone flex-none flex items-center justify-center">
            <div style={{ position: 'relative', transform: `rotate(${titleDecor.paperRotateDeg}deg)` }}>
              {/* 胶带效果 */}
              <div className="tape tape-top-left" style={{
                background: 'linear-gradient(90deg, #E8D4A8, #DCC090, #E8D4A8)',
                width: '112px',
                transform: `translateX(-50%) rotate(${titleDecor.tapeRotateDeg}deg)`
              }} />
              <div style={{ background: '#FFF', padding: '16px 40px', boxShadow: '2px 2px 10px rgba(0,0,0,0.15)', border: '1px solid #E0E0E0' }}>
                <h1
                  ref={titleRef}
                  className="scrapbook-title main-title text-center"
                  style={{ fontSize: `${titleConfig.initialFontSize}px` }}
                >
                  {data.mainTitle}
                </h1>
              </div>
            </div>
          </div>

          {/* 卡片区域 */}
          <div className="card-zone flex-none w-full">
            <div
              data-card-zone="true"
              className="w-full flex flex-wrap justify-center content-center"
              style={{
                gap: layout.containerGap,
                '--container-gap': layout.containerGap,
                paddingLeft: cardZoneInsetX,
                paddingRight: cardZoneInsetX,
                maxWidth: cardZoneMaxWidth,
                margin: '0 auto',
                boxSizing: 'border-box'
              } as React.CSSProperties}
            >
              {data.cards.map((card, idx) => {
                const paper = getCardThemeColor(PAPER_COLORS, idx);
                const decor = cardDecorations[idx];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    data-p2vPreservePadding="true"
                    className={`card-item scrapbook-card paper-texture ${N !== 1 ? layout.cardWidthClass : 'w-2/3'}`}
                    style={{
                      background: paper.bg,
                      padding: layout.cardPadding,
                      transform: `translateY(${decor.cardOffsetY}px) rotate(${decor.cardRotateDeg}deg)`,
                    }}
                  >
                    {/* 胶带 */}
                    <div className="tape tape-top-left" style={{
                      background: `linear-gradient(90deg, ${paper.tape}, ${paper.border}, ${paper.tape})`,
                      width: `${decor.tapeTopWidthPx}px`,
                      transform: `translateX(-50%) rotate(${decor.tapeTopRotateDeg}deg)`
                    }} />
                    <div className="tape tape-bottom-right" style={{
                      background: `linear-gradient(90deg, ${paper.tape}, ${paper.border}, ${paper.tape})`,
                      width: `${decor.tapeBottomWidthPx}px`,
                      transform: `rotate(${decor.tapeBottomRotateDeg}deg)`
                    }} />

                    <div className="card-header">
                      <h3
                        className={`js-title js-title-scrapbook ${layout.titleSizeClass}`}
                        style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                      >
                        {card.title}
                      </h3>
                      <span
                        className="js-icon js-icon-scrapbook material-symbols-rounded"
                        style={{ fontSize: layout.iconSize }}
                      >
                        {card.icon}
                      </span>
                    </div>
                    <p
                      className={`js-desc js-desc-scrapbook ${layout.descSizeClass}`}
                      dangerouslySetInnerHTML={{ __html: autoAddSpaceToHtml(card.desc) }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {/* SSR 适配脚本 */}
      <script dangerouslySetInnerHTML={{ __html: ssrScript }} />
    </div>
  );
};

/**
 * CollageScrapbook 模板配置
 */
export const collageScrapbookTemplate: TemplateConfig = {
  id: 'collageScrapbook',
  name: '拼贴手账风格',
  description: '胶带效果、手写标注、纸张纹理的拼贴设计',
  icon: 'style',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <CollageScrapbook data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'collageScrapbook'),
};

// 导出组件供下载模板使用
export { CollageScrapbook };
