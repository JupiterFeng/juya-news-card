import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';

import { calculateStandardLayout, getStandardTitleConfig, getCardThemeColor, generateTitleFitScript, generateViewportFitScript } from '../utils/layout-calculator';

const THEME_COLORS = [
  { bg: '#ff6b6b', text: '#000000', icon: '#000000' },
  { bg: '#4ecdc4', text: '#000000', icon: '#000000' },
  { bg: '#ffe66d', text: '#000000', icon: '#000000' },
  { bg: '#95e1d3', text: '#000000', icon: '#000000' },
  { bg: '#f38181', text: '#000000', icon: '#000000' },
  { bg: '#aa96da', text: '#000000', icon: '#000000' },
  { bg: '#fcbad3', text: '#000000', icon: '#000000' },
  { bg: '#a8e6cf', text: '#000000', icon: '#000000' },
  { bg: '#ffd93d', text: '#000000', icon: '#000000' },
];

const Brutalism: React.FC<{ data: GeneratedContent; scale: number }> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const N = data?.cards?.length || 0;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if (!wrapperRef.current || !titleRef.current) return;

    const wrapper = wrapperRef.current;
    const title = titleRef.current;

    const fitTitle = () => {
      let size = 72;
      title.style.fontSize = size + 'px';
      let guard = 0;
      while (title.scrollWidth > 1600 && size > 36 && guard < 100) {
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
      <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Space+Grotesk:wght@700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'Space Grotesk', monospace;
          background-color: #ffffff;
          color: #000000;
        }
        .brutal-title {
          font-weight: 700;
          color: #000000;
          letter-spacing: -0.02em;
          line-height: 0.95;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .card-item {
          border-radius: 0;
          box-shadow: 8px 8px 0 #000000;
          transition: transform 0.1s, box-shadow 0.1s;
        }
        .card-item:hover {
          transform: translate(-2px, -2px);
          box-shadow: 10px 10px 0 #000000;
        }
        
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }

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

        .js-desc strong { font-weight: 700; text-decoration: underline; }
        .js-desc code {
          background: #000000; color: #ffffff;
          padding: 0.1em 0.3em;
          font-family: 'Space Mono', monospace;
          font-size: 0.9em;
        }
        .content-scale { transform-origin: center center; }
        .material-symbols-rounded { font-family: 'Material Symbols Rounded' !important; font-weight: normal; font-style: normal; display: inline-block; }

        .brutal-border {
          border: 4px solid #000000;
        }
      `}</style>

      <div
        className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-24 box-border content-scale"
          style={{ 
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined
          }}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="brutal-border bg-[#ff6b6b] px-6 py-2">
              <span className="font-black text-sm">★ BRUTALISM ★</span>
            </div>
            <h1 ref={titleRef} className="text-center brutal-title">
              {data.mainTitle}
            </h1>
            <div className="flex gap-2">
              <div className="w-4 h-4 bg-[#ff6b6b]"></div>
              <div className="w-4 h-4 bg-[#4ecdc4]"></div>
              <div className="w-4 h-4 bg-[#ffe66d]"></div>
            </div>
          </div>

          <div className="card-zone flex-none w-full">
            <div
              className="w-full flex flex-wrap justify-center content-center"
              style={{ 
                gap: layout.containerGap,
                '--container-gap': layout.containerGap
              } as React.CSSProperties}
            >
              {data.cards.map((card, idx) => {
                const theme = getCardThemeColor(THEME_COLORS, idx);
                return (
                  <div 
                    key={idx} 
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: theme.bg,
                      border: '4px solid #000000',
                      padding: layout.cardPadding
                    }}
                  >
                    <div className="card-header flex items-center gap-4 mb-4" style={{ borderBottom: '3px solid #000000', paddingBottom: '12px' }}>
                      <span className="js-icon material-symbols-rounded" style={{ fontSize: layout.iconSize, color: theme.icon }}>{card.icon}</span>
                      <h3 className={`js-title font-black uppercase ${layout.titleSizeClass}`} style={{ color: theme.text }}>{card.title}</h3>
                    </div>
                    <p className={`js-desc font-medium ${layout.descSizeClass}`} style={{ color: theme.text }} dangerouslySetInnerHTML={{ __html: card.desc }} />
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

import { generateDownloadableHtml } from '../utils/template';

export const brutalismTemplate: TemplateConfig = {
  id: 'brutalism',
  name: '粗野主义',
  description: '强对比粗野主义设计风格',
  icon: 'square',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <Brutalism data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'brutalism'),
};

export { Brutalism };
