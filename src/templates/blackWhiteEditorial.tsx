import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import { generateDownloadableHtml } from '../utils/template';
import {
    generateTitleFitScript,
    generateViewportFitScript,
    calculateStandardLayout,
    getStandardTitleConfig,
} from '../utils/layout-calculator';

/**
 * BlackWhiteEditorial 渲染组件
 * 黑白社论风格 - 强对比黑白摄影 + 大字号排版
 */
interface BlackWhiteEditorialProps {
  data: GeneratedContent;
  scale: number;
}

const BlackWhiteEditorial: React.FC<BlackWhiteEditorialProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if (!wrapperRef.current || !titleRef.current) return;

    const wrapper = wrapperRef.current;
    const title = titleRef.current;

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

    const fitViewport = () => {
        const maxH = 1040;
        const contentH = wrapper.scrollHeight;
        if (contentH > maxH) {
            const nextScale = Math.max(0.6, maxH / contentH);
            wrapper.style.transform = `scale(${nextScale})`;
            return;
        }
        wrapper.style.transform = '';
    };

    const timer = window.setTimeout(fitViewport, 50);
    return () => window.clearTimeout(timer);
  }, [data, titleConfig]);


  return (
    <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', overflow: 'hidden' }}>
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'Inter', 'CustomPreviewFont', system-ui, sans-serif;
          background: #f5f5f5;
          color: #0a0a0a;
        }
        .editorial-title {
          font-family: 'Playfair Display', 'CustomPreviewFont', serif;
          font-weight: 700;
          color: #0a0a0a;
          letter-spacing: -0.03em;
          line-height: 0.95;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .card-item {
          border-radius: 0;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }
        /* 黑白分割线 */
        .card-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: #0a0a0a;
        }
        .card-item.is-light::before {
          background: #fafafa;
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 0.5px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 0.5px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 0.5px); }

        .desc-text strong { font-weight: 700; }
        .desc-text code {
          background: rgba(0,0,0,0.1); padding: 0.1em 0.4em; border-radius: 2px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
        }
        .card-item.is-light .desc-text code {
          background: rgba(255,255,255,0.15);
        }
        
        .text-5-5xl { font-size: 3.375rem; line-height: 1.1; }
        .text-4-5xl { font-size: 2.625rem; line-height: 1.2; }
        .text-3-5xl { font-size: 2.0625rem; line-height: 1.3; }
        .text-2-5xl { font-size: 1.8125rem; line-height: 1.4; }
        
        .text-6xl { font-size: 3.75rem; line-height: 1; }
        .text-5xl { font-size: 3rem; line-height: 1; }
        .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
        .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
        .text-2xl { font-size: 1.5rem; line-height: 2rem; }
        .text-xl  { font-size: 1.25rem; line-height: 1.75rem; }
        .text-lg  { font-size: 1.125rem; line-height: 1.75rem; }
        .text-base { font-size: 1rem; line-height: 1.5rem; }
        .text-sm { font-size: 0.875rem; line-height: 1.25rem; }

        .content-scale { transform-origin: center center; }

        /* 装饰性网格线 */
        .grid-lines {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px);
          background-size: 100px 100px;
          pointer-events: none;
          z-index: 1;
        }

        /* 视觉焦点装饰 */
        .corner-accent {
          position: absolute;
          width: 20px;
          height: 20px;
          border-color: #0a0a0a;
          border-style: solid;
          pointer-events: none;
        }
        .corner-tl { top: 12px; left: 12px; border-width: 2px 0 0 2px; }
        .corner-br { bottom: 12px; right: 12px; border-width: 0 2px 2px 0; }
        .card-item.is-light .corner-accent { border-color: #fafafa; }
      `}</style>

      <div
        className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        {/* 装饰性网格 */}
        <div className="grid-lines"></div>

        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-24 box-border content-scale relative z-10"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX,
            paddingRight: layout.wrapperPaddingX
          }}
        >
          {/* 标题区域 */}
          <div className="title-zone flex-none flex items-center justify-center w-full">
            <h1
              ref={titleRef}
              className="text-center editorial-title"
              style={{ fontSize: titleConfig.initialFontSize }}
            >
              {data.mainTitle}
            </h1>
          </div>

          {/* 卡片区域 */}
          <div className="card-zone flex-none w-full">
            <div
              className="w-full flex flex-wrap justify-center content-center"
              style={{
                gap: layout.containerGap,
                '--container-gap': layout.containerGap
              } as React.CSSProperties}
            >
              {data.cards.map((card, idx) => {
                const isDark = idx % 2 === 0;
                return (
                  <div 
                    key={idx} 
                    className={`card-item ${layout.cardWidthClass} ${!isDark ? 'is-light' : ''}`}
                    style={{
                        backgroundColor: isDark ? '#0a0a0a' : '#fafafa',
                        color: isDark ? '#fafafa' : '#0a0a0a',
                        padding: layout.cardPadding
                    }}
                  >
                    {/* 角落装饰 */}
                    <div className="corner-accent corner-tl"></div>
                    <div className="corner-accent corner-br"></div>

                    <div className="flex items-start gap-4 mb-5">
                      <span 
                        className="material-symbols-rounded"
                        style={{
                            color: isDark ? '#fafafa' : '#0a0a0a',
                            fontSize: layout.iconSize
                        }}
                      >
                        {card.icon}
                      </span>
                      <h3 
                        className={`font-bold tracking-tight ${layout.titleSizeClass}`}
                        style={{ color: isDark ? '#fafafa' : '#0a0a0a' }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`desc-text font-normal leading-relaxed ${layout.descSizeClass}`}
                      style={{ color: isDark ? '#e0e0e0' : '#1a1a1a' }}
                      dangerouslySetInnerHTML={{ __html: card.desc }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{
        __html: `
          ${generateTitleFitScript(titleConfig)}
          ${generateViewportFitScript()}
        `
      }} />
    </div>
  );
};

export const blackWhiteEditorialTemplate: TemplateConfig = {
  id: 'blackWhiteEditorial',
  name: '黑白社论',
  description: '强对比黑白摄影 + 大字号排版；适合时尚、艺术、建筑类品牌',
  icon: 'filter_b_and_w',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <BlackWhiteEditorial data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'blackWhiteEditorial'),
};

export { BlackWhiteEditorial };
