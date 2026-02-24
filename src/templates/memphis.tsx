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

const MEMPHIS_COLORS = [
  { bg: '#ff6b9d', border: '#c4456d' },
  { bg: '#c44dff', border: '#8a2be2' },
  { bg: '#4dffff', border: '#2dbdbd' },
  { bg: '#ffff4d', border: '#b8b832' },
  { bg: '#ff9f4d', border: '#c46d1f' },
  { bg: '#4dff9f', border: '#2dbe6a' },
];

const Memphis: React.FC<{ data: GeneratedContent; scale: number }> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const cardCount = data.cards.length;
  const layout = calculateStandardLayout(cardCount);
  const titleConfig = getStandardTitleConfig(cardCount, {
    titleConfigs: {
      '1-3': { initialFontSize: 72, minFontSize: 36 },
      '4': { initialFontSize: 72, minFontSize: 36 },
      '5-6': { initialFontSize: 72, minFontSize: 36 },
      '7-8': { initialFontSize: 72, minFontSize: 36 },
      '9+': { initialFontSize: 72, minFontSize: 36 },
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
      <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;700;800&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'Nunito', sans-serif;
          background-color: #fff9f0;
          color: #000000;
        }
        .memphis-title {
          font-family: 'Fredoka One', cursive;
          color: #000000;
          letter-spacing: 0.02em;
          line-height: 1.1;
        }
        .card-item {
          border-radius: 20px;
          transition: transform 0.2s, rotate 0.2s;
        }
        .card-item:hover {
          transform: scale(1.02) rotate(-1deg);
        }
                .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
                .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
                .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .js-desc strong { font-weight: 800; }
        .js-desc code {
          background: rgba(0,0,0,0.15);
          padding: 0.1em 0.3em; border-radius: 8px;
          font-family: 'Comic Neue', cursive;
          font-size: 0.9em;
        }
        .content-scale { transform-origin: center center; }
        .material-symbols-rounded { font-family: 'Material Symbols Rounded' !important; font-weight: normal; font-style: normal; display: inline-block; }

        .memphis-dot {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }
      `}</style>

      <div className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
        <div className="memphis-dot w-24 h-24 bg-[#ff6b9d]" style={{ top: '5%', left: '10%' }}></div>
        <div className="memphis-dot w-16 h-16 bg-[#ffff4d]" style={{ top: '15%', right: '15%' }}></div>
        <div className="memphis-dot w-20 h-20 bg-[#4dffff]" style={{ bottom: '10%', left: '20%' }}></div>
        <div className="memphis-dot w-12 h-12 bg-[#c44dff]" style={{ bottom: '20%', right: '10%' }}></div>

        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-24 box-border content-scale relative z-10"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-[#ff6b9d]"></div>
              <div className="w-6 h-6 bg-[#ffff4d]" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
              <div className="w-6 h-6 bg-[#4dffff]" style={{ clipPath: 'polygon(50% 0%, 0% 50%, 50% 100%, 100% 50%)' }}></div>
            </div>
            <h1 
              ref={titleRef} 
              className="text-center memphis-title js-title-text"
              style={{ fontSize: titleConfig.initialFontSize }}
            >
              {data.mainTitle}
            </h1>
            <div className="flex gap-2">
              <span className="text-3xl">★</span>
              <span className="text-3xl">●</span>
              <span className="text-3xl">▲</span>
              <span className="text-3xl">■</span>
            </div>
          </div>

          <div className="card-zone flex-none w-full">
            <div
              className="w-full flex flex-wrap justify-center content-center"
              style={{ gap: layout.containerGap, '--container-gap': layout.containerGap } as React.CSSProperties}
            >
              {data.cards.map((card, idx) => {
                const color = MEMPHIS_COLORS[idx % MEMPHIS_COLORS.length];
                return (
                  <div 
                    key={idx} 
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: color.bg,
                      border: `4px dashed ${color.border}`,
                      padding: layout.cardPadding
                    }}
                  >
                    <div className="card-header flex items-center gap-4 mb-6">
                      <span 
                        className="js-icon material-symbols-rounded"
                        style={{ fontSize: layout.iconSize, color: '#000000' }}
                      >
                        {card.icon}
                      </span>
                      <h3 
                        className={`js-title font-black ${layout.titleSizeClass}`}
                        style={{ color: '#000000' }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p 
                      className={`js-desc font-semibold ${layout.descSizeClass}`} 
                      style={{ color: '#333333' }}
                      dangerouslySetInnerHTML={{ __html: card.desc }} 
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* SSR Scripts */}
      <script dangerouslySetInnerHTML={{ __html: generateTitleFitScript(titleConfig) }} />
      <script dangerouslySetInnerHTML={{ __html: generateViewportFitScript() }} />
    </div>
  );
};

export const memphisTemplate: TemplateConfig = {
  id: 'memphis',
  name: '孟菲斯',
  description: '跳跃配色几何图案孟菲斯风格',
  icon: 'stars',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <Memphis data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'memphis'),
};

export { Memphis };
