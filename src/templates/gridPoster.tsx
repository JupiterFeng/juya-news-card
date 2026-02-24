import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import {
  calculateStandardLayout,
  getStandardTitleConfig,
  generateTitleFitScript,
  generateViewportFitScript,
} from '../utils/layout-calculator';
import { generateDownloadableHtml } from '../utils/template';
import { autoAddSpaceToHtml } from '../utils/text-spacing';

/**
 * GridPoster 渲染组件
 * 海报网格排版风格 - 强网格、强对齐、留白
 */
interface GridPosterProps {
  data: GeneratedContent;
  scale: number;
}

const GridPoster: React.FC<GridPosterProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const posterColors = [
    { bg: '#ffffff', text: '#000000', accent: '#e63946', border: '#000000' },
    { bg: '#000000', text: '#ffffff', accent: '#f1faee', border: '#ffffff' },
    { bg: '#f1faee', text: '#1d3557', accent: '#e63946', border: '#1d3557' },
    { bg: '#a8dadc', text: '#1d3557', accent: '#e63946', border: '#1d3557' },
    { bg: '#457b9d', text: '#f1faee', accent: '#e63946', border: '#f1faee' },
  ];

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if (!wrapperRef.current || !titleRef.current) return;
    const wrapper = wrapperRef.current;
    const title = titleRef.current;

    const fitTitle = () => {
      let size = titleConfig.initialFontSize;
      title.style.fontSize = size + 'px';
      let guard = 0;
      while (title.scrollWidth > 1600 && size > titleConfig.minFontSize && guard < 100) {
        size -= 1;
        title.style.fontSize = size + 'px';
        guard++;
      }
    };
    fitTitle();

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

  return (
    <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', overflow: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'Space Grotesk', 'CustomPreviewFont', system-ui, sans-serif;
          background: #f5f5f5;
          color: #000000;
        }
        .poster-title {
          font-weight: 700;
          color: #000000;
          letter-spacing: 0.05em;
          line-height: 0.95;
          text-transform: uppercase;
        }
        /* 标题装饰框 */
        .poster-title-wrapper {
          position: relative;
          display: inline-block;
        }
        .poster-title-wrapper::before,
        .poster-title-wrapper::after {
          content: '';
          position: absolute;
          width: 20px;
          height: 20px;
          border-color: #e63946;
          border-style: solid;
        }
        .poster-title-wrapper::before {
          top: -10px;
          left: -10px;
          border-width: 3px 0 0 3px;
        }
        .poster-title-wrapper::after {
          bottom: -10px;
          right: -10px;
          border-width: 0 3px 3px 0;
        }
        .card-item {
          border-radius: 0;
          position: relative;
          overflow: hidden;
        }
        /* 卡片编号 */
        .card-number {
          position: absolute;
          top: 16px;
          right: 16px;
          font-family: 'Space Mono', monospace;
          font-size: 14px;
          font-weight: 700;
          color: inherit;
          opacity: 0.6;
        }
                .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
                .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
                .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }

        .js-desc strong {
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .js-desc code {
          background: rgba(0,0,0,0.1);
          padding: 0.1em 0.4em;
          border-radius: 0;
          font-family: 'Space Mono', monospace;
          font-size: 0.9em;
          font-weight: 700;
          text-transform: uppercase;
        }
        .card-item:nth-child(even) .js-desc code {
          background: rgba(255,255,255,0.2);
        }
        .content-scale { transform-origin: center center; }

        /* 网格背景 */
        .poster-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }

        /* 装饰性分隔线 */
        .divider-line {
          width: 100%;
          height: 3px;
          background: #000;
          margin: 1rem 0;
        }

        /* 视觉锚点 */
        .anchor-point {
          position: absolute;
          width: 8px;
          height: 8px;
          background: #e63946;
          border-radius: 50%;
        }
        .anchor-tl { top: 20px; left: 20px; }
        .anchor-br { bottom: 20px; right: 20px; }
      `}</style>

      <div className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
        {/* 网格背景 */}
        <div className="poster-grid"></div>

        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-20 box-border content-scale relative z-10"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}
        >
          {/* 标题区域 */}
          <div className="title-zone flex-none flex items-center justify-center w-full">
            <div className="poster-title-wrapper">
              <h1
                ref={titleRef}
                className="text-center poster-title"
              >
                {data.mainTitle}
              </h1>
            </div>
          </div>

          {/* 卡片区域 */}
          <div className="card-zone flex-none w-full">
            <div
              data-card-zone="true"
              className="w-full flex flex-wrap justify-center content-center gap-6"
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
                const color = posterColors[idx % posterColors.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: color.bg,
                      color: color.text,
                      border: `3px solid ${color.border}`,
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="anchor-point anchor-tl"></div>
                    <div className="anchor-point anchor-br"></div>

                    <div className="card-number">{String(idx + 1).padStart(2, '0')}</div>

                    <div className="flex items-start gap-4 mb-4">
                      <span className="js-icon material-symbols-rounded" style={{ color: color.accent, fontSize: layout.iconSize }}>
                        {card.icon}
                      </span>
                      <h3
                        className={`js-title font-bold ${layout.titleSizeClass}`}
                        style={{ color: color.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <div className="divider-line"></div>
                    <p
                      className={`js-desc font-medium leading-relaxed ${layout.descSizeClass}`}
                      style={{ color: color.text }}
                      dangerouslySetInnerHTML={{ __html: autoAddSpaceToHtml(card.desc) }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            ${generateTitleFitScript(titleConfig)}
            ${generateViewportFitScript()}
          `,
        }}
      />
    </div>
  );
};


export const gridPosterTemplate: TemplateConfig = {
  id: 'gridPoster',
  name: '海报网格',
  description: '以海报逻辑组织页面：强网格、强对齐、留白；适合展览、文化项目',
  icon: 'grid_on',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <GridPoster data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'gridPoster'),
};

export { GridPoster };
