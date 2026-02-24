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

const CUBISM_COLORS = [
  { bg: '#d4c8b8', text: '#2a2820', accent: '#8a7060', shade1: '#c4b8a8', shade2: '#e8dcc8' },
  { bg: '#c8d4d0', text: '#202a28', accent: '#608a7a', shade1: '#b8c4c0', shade2: '#dce8e4' },
  { bg: '#d0c8d8', text: '#28202a', accent: '#70608a', shade1: '#c0b8c8', shade2: '#e4dcec' },
  { bg: '#e8dcc8', text: '#2a2820', accent: '#9a8a60', shade1: '#d8ccb4', shade2: '#f0e8dc' },
];

interface CubismProps {
  data: GeneratedContent;
  scale: number;
}

const Cubism: React.FC<CubismProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const cardCount = data?.cards?.length || 0;
  const layout = calculateStandardLayout(cardCount);
  const titleConfig = getStandardTitleConfig(cardCount);

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
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@500;700;900&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .cubism-container {
          font-family: 'Roboto', 'CustomPreviewFont', sans-serif;
          background-color: #e8e0d4;
          color: #2a2820;
          position: relative;
          overflow: hidden;
        }
        .cubism-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0 L30 0 L30 30 L0 30 Z' fill='%23d4c8b8' fill-opacity='0.3'/%3E%3Cpath d='M30 30 L60 30 L60 60 L30 60 Z' fill='%23c8d4d0' fill-opacity='0.3'/%3E%3Cpath d='M20 20 L50 20 L50 50 L20 50 Z' fill='none' stroke='%238a7060' stroke-opacity='0.1'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .cubism-title {
          font-weight: 900;
          color: #2a2820;
          letter-spacing: 0.1em;
          line-height: 1.2;
          position: relative;
          z-index: 10;
          text-transform: uppercase;
        }
        .card-item {
          transition: all 0.3s ease;
          position: relative;
          z-index: 5;
          display: flex;
          flex-direction: column;
          box-shadow: 6px 6px 0 rgba(0,0,0,0.15);
          clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
        }
        .card-item::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%);
          pointer-events: none;
        }
        .card-item:hover {
          transform: translate(-2px, -2px);
          box-shadow: 10px 10px 0 rgba(0,0,0,0.2);
        }
        .geometric-accent {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 24px;
          height: 24px;
          background: rgba(0,0,0,0.15);
          clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
          pointer-events: none;
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

        .content-scale {
          transform-origin: center center;
        }
        .material-symbols-rounded { font-family: 'Material Symbols Rounded' !important; font-weight: normal; font-style: normal; display: inline-block; }
      `}</style>

      <div
        className="cubism-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-20 box-border content-scale z-10"
          style={{ 
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined
          }}
        >
          <div className="flex flex-col items-center">
            <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
              <div style={{ width: '30px', height: '30px', background: '#d4c8b8', transform: 'skew(-10deg)' }}></div>
              <div style={{ width: '30px', height: '30px', background: '#c8d4d0', transform: 'skew(10deg)' }}></div>
              <div style={{ width: '30px', height: '30px', background: '#d0c8d8', transform: 'skew(-5deg)' }}></div>
            </div>
            <h1 
              ref={titleRef} 
              className={`text-center cubism-title ${layout.titleSizeClass}`}
              style={{ fontSize: titleConfig.initialFontSize + 'px' }}
            >
              {data.mainTitle}
            </h1>
            <div style={{ display: 'flex', gap: '4px', marginTop: '16px' }}>
              <div style={{ width: '30px', height: '30px', background: '#c8d4d0', transform: 'skew(10deg)' }}></div>
              <div style={{ width: '30px', height: '30px', background: '#d4c8b8', transform: 'skew(-10deg)' }}></div>
              <div style={{ width: '30px', height: '30px', background: '#e8dcc8', transform: 'skew(5deg)' }}></div>
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
                const color = CUBISM_COLORS[idx % CUBISM_COLORS.length];
                return (
                  <div 
                    key={idx} 
                    className={`card-item ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: color.bg,
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="geometric-accent"></div>
                    <div className="card-header flex items-center gap-3 mb-4">
                      <span 
                        className="js-icon material-symbols-rounded"
                        style={{ color: color.accent, fontSize: layout.iconSize }}
                      >
                        {card.icon}
                      </span>
                      <h3 
                        className={`js-title font-bold leading-tight ${layout.titleSizeClass}`}
                        style={{ color: color.text, fontFamily: "'Arial', 'Helvetica Neue', sans-serif" }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-medium leading-relaxed ${layout.descSizeClass}`}
                      style={{ color: color.text, opacity: 0.9 }}
                      dangerouslySetInnerHTML={{ __html: card.desc }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: generateTitleFitScript(titleConfig) }} />
      <script dangerouslySetInnerHTML={{ __html: generateViewportFitScript() }} />
    </div>
  );
};

export const cubismTemplate: TemplateConfig = {
  id: 'cubism',
  name: '立体主义',
  description: '多视角分解重组的立体主义风格，几何面拼装、结构化空间',
  icon: 'category',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <Cubism data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'cubism'),
};

export { Cubism };
