import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import {
  calculateStandardLayout,
  getStandardTitleConfig,
  generateTitleFitScript,
  generateViewportFitScript,
} from '../utils/layout-calculator';

interface DisneyClassicProps {
  data: GeneratedContent;
  scale: number;
}

const DISNEY_COLORS = [
  { bg: '#1e3a5f', text: '#ffffff', accent: '#ffd700', highlight: '#4a90d9' },
  { bg: '#5f3a1e', text: '#ffffff', accent: '#ffb347', highlight: '#d97757' },
  { bg: '#1e5f4a', text: '#ffffff', accent: '#7fff7f', highlight: '#4aa88a' },
  { bg: '#4a1e5f', text: '#ffffff', accent: '#dd77ff', highlight: '#8a4aaa' },
];

const DisneyClassic: React.FC<DisneyClassicProps> = ({ data, scale }) => {
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
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .disney-container {
          font-family: 'Cinzel', 'CustomPreviewFont', serif;
          background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%);
          color: #ffffff;
          position: relative;
          overflow: hidden;
        }
        .disney-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 20% 20%, rgba(74,144,217,0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(255,215,0,0.1) 0%, transparent 50%);
          pointer-events: none;
        }
        .disney-title {
          font-weight: 600;
          color: #ffffff;
          letter-spacing: 0.1em;
          line-height: 1.3;
          position: relative;
          z-index: 10;
          text-shadow: 0 4px 12px rgba(0,0,0,0.5);
          white-space: nowrap;
        }
        .card-item {
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          position: relative;
          z-index: 5;
        }
        .card-item::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,215,0,0.1) 0%, transparent 50%);
          border-radius: 12px;
          pointer-events: none;
        }
        .card-item:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 16px 40px rgba(0,0,0,0.4);
        }
        .sparkle {
          position: absolute;
          top: 10px;
          left: 10px;
          width: 16px;
          height: 16px;
          clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
          background: linear-gradient(135deg, #ffd700 0%, #ffeb3b 100%);
          pointer-events: none;
          animation: sparkle 2s ease-in-out infinite;
        }
        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
          50% { opacity: 0.6; transform: scale(1.3) rotate(180deg); }
        }
        .crown-accent {
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 16px;
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
        className="disney-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
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
          <div className="flex flex-col items-center mb-6">
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>✨</div>
            <h1 
              ref={titleRef} 
              className={`text-center disney-title ${layout.titleSizeClass}`}
              style={{ fontSize: titleConfig.initialFontSize + 'px' }}
            >
              {data.mainTitle}
            </h1>
            <div style={{ fontSize: '32px', marginTop: '8px' }}>✨</div>
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
                const color = DISNEY_COLORS[idx % DISNEY_COLORS.length];
                return (
                  <div 
                    key={idx} 
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: color.bg,
                      borderRadius: '12px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="sparkle"></div>
                    <div className="card-header flex items-center gap-3 mb-4">
                      <span 
                        className="js-icon material-symbols-rounded"
                        style={{ color: color.accent, fontSize: layout.iconSize }}
                      >
                        {card.icon}
                      </span>
                      <h3 
                        className={`js-title font-bold leading-tight ${layout.titleSizeClass}`}
                        style={{ color: color.text, fontFamily: "'Cinzel', 'Georgia', serif" }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-medium leading-relaxed ${layout.descSizeClass}`}
                      style={{ color: color.text, opacity: 0.95 }}
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

import { generateDownloadableHtml } from '../utils/template';

export const disneyClassicTemplate: TemplateConfig = {
  id: 'disneyClassic',
  name: '经典全动画',
  description: '动作连贯、形变夸张且结构严谨的经典全动画风格',
  icon: 'auto_awesome',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <DisneyClassic data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'disneyClassic'),
};

export { DisneyClassic };
