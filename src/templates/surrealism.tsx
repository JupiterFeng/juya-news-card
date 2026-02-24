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

interface SurrealismProps {
  data: GeneratedContent;
  scale: number;
}

const SURREAL_COLORS = [
  { bg: 'linear-gradient(180deg, #1a2a4a 0%, #3a2850 100%)', text: '#e8e8f0', accent: '#a080c0' },
  { bg: 'linear-gradient(180deg, #2a4a3a 0%, #3a5048 100%)', text: '#e8f0ec', accent: '#80c0a0' },
  { bg: 'linear-gradient(180deg, #4a2a3a 0%, #503848 100%)', text: '#f0e8ec', accent: '#c080a0' },
  { bg: 'linear-gradient(180deg, #2a3a4a 0%, #384850 100%)', text: '#e8ecf0', accent: '#80a0c0' },
];

const Surrealism: React.FC<SurrealismProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const cardCount = data.cards.length;
  const layout = calculateStandardLayout(cardCount);
  const titleConfig = getStandardTitleConfig(cardCount, {
    titleConfigs: {
      '1-3': { initialFontSize: 80, minFontSize: 36 },
      '4': { initialFontSize: 72, minFontSize: 36 },
      '5-6': { initialFontSize: 64, minFontSize: 36 },
      '7-8': { initialFontSize: 56, minFontSize: 36 },
      '9+': { initialFontSize: 48, minFontSize: 36 },
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
      <link href="https://fonts.googleapis.com/css2?family=Georgia:wght@300;400;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .surrealism-container {
          font-family: 'Georgia', 'CustomPreviewFont', serif;
          background: linear-gradient(180deg, #1a1a2e 0%, #2a2a3e 50%, #1a2a3e 100%);
          color: #e8e8f0;
          position: relative;
          overflow: hidden;
        }
        .surrealism-container::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(ellipse at 30% 30%, rgba(160,128,192,0.15) 0%, transparent 40%),
                      radial-gradient(ellipse at 70% 70%, rgba(128,192,160,0.12) 0%, transparent 40%);
          animation: float 20s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(2%, 2%) rotate(5deg); }
        }
        .surrealism-title {
          font-weight: 300;
          color: #e8e8f0;
          letter-spacing: 0.2em;
          line-height: 1.4;
          position: relative;
          z-index: 10;
          font-style: italic;
        }
        .card-item {
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          position: relative;
          z-index: 5;
        }
        .card-item:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 16px 48px rgba(0,0,0,0.4);
        }
        .dream-element {
          position: absolute;
          top: 15px;
          right: 15px;
          width: 30px;
          height: 30px;
          opacity: 0.3;
          pointer-events: none;
        }
        .content-scale {
          transform-origin: center center;
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
      `}</style>

      <div className="surrealism-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
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
            <svg width="80" height="24" viewBox="0 0 80 24" style={{ marginBottom: '16px', opacity: 0.6 }}>
              <ellipse cx="40" cy="12" rx="35" ry="8" fill="none" stroke="#a080c0" strokeWidth="1"/>
              <circle cx="20" cy="12" r="3" fill="#a080c0" opacity="0.5"/>
              <circle cx="60" cy="12" r="2" fill="#80c0a0" opacity="0.5"/>
            </svg>
            <h1 
              ref={titleRef} 
              className="text-center surrealism-title js-title-text"
              style={{ fontSize: titleConfig.initialFontSize + 'px' }}
            >
              {data.mainTitle}
            </h1>
            <svg width="80" height="24" viewBox="0 0 80 24" style={{ marginTop: '16px', opacity: 0.6 }}>
              <path d="M10 12 Q40 4, 70 12" stroke="#a080c0" strokeWidth="1.5" fill="none"/>
              <circle cx="70" cy="12" r="2" fill="#a080c0" opacity="0.5"/>
            </svg>
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
                const color = SURREAL_COLORS[idx % SURREAL_COLORS.length];
                return (
                  <div 
                    key={idx} 
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      background: color.bg,
                      borderRadius: '8px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      padding: layout.cardPadding
                    }}
                  >
                    <svg className="dream-element" viewBox="0 0 30 30">
                      <circle cx="15" cy="15" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
                      <path d="M5 15 L25 15 M15 5 L15 25" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
                    </svg>
                    <div className="card-header flex items-center gap-3 mb-4">
                      <span 
                        className="js-icon material-symbols-rounded"
                        style={{ fontSize: layout.iconSize, color: color.accent }}
                      >
                        {card.icon}
                      </span>
                      <h3 
                        className={`js-title font-normal leading-tight ${layout.titleSizeClass}`}
                        style={{ 
                          color: color.text,
                          fontFamily: "'Georgia', 'Times New Roman', serif",
                          letterSpacing: '0.05em'
                        }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-light leading-relaxed ${layout.descSizeClass}`}
                      style={{ color: color.text, opacity: 0.85 }}
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

export const surrealismTemplate: TemplateConfig = {
  id: 'surrealism',
  name: '超现实主义',
  description: '梦逻辑与不可能组合的超现实风格，像真的一样不合理',
  icon: 'cloud',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <Surrealism data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'surrealism'),
};

export { Surrealism };
