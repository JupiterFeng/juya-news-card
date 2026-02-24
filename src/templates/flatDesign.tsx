import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import { 
  calculateStandardLayout, 
  getStandardTitleConfig, 
  generateTitleFitScript, 
  generateViewportFitScript 
} from '../utils/layout-calculator';
import { generateDownloadableHtml } from '../utils/template';

const FlatDesign: React.FC<{ data: GeneratedContent; scale: number }> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const cardCount = data.cards.length;
  const layout = calculateStandardLayout(cardCount);
  const titleConfig = getStandardTitleConfig(cardCount, {
    titleConfigs: {
      '1-3': { initialFontSize: 90, minFontSize: 40 },
      '4': { initialFontSize: 85, minFontSize: 40 },
      '5-6': { initialFontSize: 80, minFontSize: 40 },
      '7-8': { initialFontSize: 70, minFontSize: 40 },
      '9+': { initialFontSize: 60, minFontSize: 40 }
    }
  });

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    
    const timer = window.setTimeout(() => {
      if (typeof (window as any).fitTitle === 'function') (window as any).fitTitle();
      if (typeof (window as any).fitViewport === 'function') (window as any).fitViewport();
    }, 50);
    
    return () => window.clearTimeout(timer);
  }, [data]);

  return (
    <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', overflow: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'Poppins', sans-serif;
          background-color: #f8fafc;
          color: #1e293b;
        }
        .flat-title {
          font-weight: 700;
          color: #1e293b;
          letter-spacing: -0.03em;
          line-height: 1;
          text-transform: uppercase;
        }
        .card-item {
          border-radius: 0;
          transition: transform 0.15s;
          background-color: #ffffff;
        }
        .card-item:hover {
          transform: translatey(-4px);
        }
        .js-desc strong { font-weight: 700; }
        .js-desc code {
          background: #f1f5f9; padding: 0.1em 0.3em;
          font-family: monospace;
          font-size: 0.9em;
        }
        .content-scale { transform-origin: center center; }
        .material-symbols-rounded { font-family: 'Material Symbols Rounded' !important; font-weight: normal; font-style: normal; display: inline-block; }

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
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-4 h-4 bg-[#ef4444]"></div>
              <div className="w-4 h-4 bg-[#eab308]"></div>
              <div className="w-4 h-4 bg-[#22c55e]"></div>
              <div className="w-4 h-4 bg-[#3b82f6]"></div>
            </div>
            <h1 
              ref={titleRef} 
              className={`text-center flat-title js-title-text ${layout.titleSizeClass}`}
            >
              {data.mainTitle}
            </h1>
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
                const flatColors = [
                  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6',
                  '#8b5cf6', '#ec4899', '#f43f5e'
                ];
                const color = flatColors[idx % flatColors.length];
                return (
                  <div 
                    key={idx} 
                    className={`card-item flex flex-col p-8 ${layout.cardWidthClass}`}
                    style={{ border: `3px solid ${color}` }}
                  >
                    <div className="card-header flex items-center gap-4 mb-6">
                      <span 
                        className="js-icon material-symbols-rounded"
                        style={{ color: color, fontSize: layout.iconSize }}
                      >
                        {card.icon}
                      </span>
                      <h3 
                        className={`js-title font-bold ${layout.titleSizeClass}`}
                        style={{ color: color }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p 
                      className={`js-desc ${layout.descSizeClass}`} 
                      style={{ color: '#374151' }}
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

export const flatDesignTemplate: TemplateConfig = {
  id: 'flatDesign',
  name: '扁平设计',
  description: '纯色扁平化设计风格',
  icon: 'rectangle',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <FlatDesign data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'flatDesign'),
};

export { FlatDesign };
