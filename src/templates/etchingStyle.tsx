import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import { 
  calculateStandardLayout, 
  getStandardTitleConfig, 
  generateTitleFitScript, 
  generateViewportFitScript 
} from '../utils/layout-calculator';

interface EtchingStyleProps {
  data: GeneratedContent;
  scale: number;
}

const ETCHING_COLORS = [
  { bg: '#faf8f5', text: '#2a2826', accent: '#4a4846', border: '#d8d4d0' },
  { bg: '#f8f6f3', text: '#2a2826', accent: '#3a3836', border: '#d0ccc4' },
  { bg: '#fcfaf7', text: '#2a2826', accent: '#5a5856', border: '#e0dcd4' },
  { bg: '#f5f3f0', text: '#2a2826', accent: '#4a4644', border: '#dcd8d0' },
];

const EtchingStyle: React.FC<EtchingStyleProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const cardCount = data.cards.length;
  const layout = calculateStandardLayout(cardCount);
  const titleConfig = getStandardTitleConfig(cardCount, {
    titleConfigs: {
      '1-3': { initialFontSize: 80, minFontSize: 36 },
      '4': { initialFontSize: 80, minFontSize: 36 },
      '5-6': { initialFontSize: 80, minFontSize: 36 },
      '7-8': { initialFontSize: 80, minFontSize: 36 },
      '9+': { initialFontSize: 80, minFontSize: 36 }
    }
  });

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
        const nextScale = Math.max(0.65, maxH / contentH);
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
      <link href="https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,300;0,400;1,400&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .etching-container {
          font-family: 'Crimson Text', 'CustomPreviewFont', serif;
          background: #f5f3f0;
          color: #2a2826;
          position: relative;
          overflow: hidden;
        }
        .etching-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 15 Q7.5 12, 15 15 T30 15' stroke='%23000000' stroke-opacity='0.04' fill='none'/%3E%3Cpath d='M0 20 Q7.5 17, 15 20 T30 20' stroke='%23000000' stroke-opacity='0.03' fill='none'/%3E%3Cpath d='M0 10 Q7.5 7, 15 10 T30 10' stroke='%23000000' stroke-opacity='0.03' fill='none'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .etching-title {
          font-weight: 300;
          color: #2a2826;
          letter-spacing: 0.15em;
          line-height: 1.4;
          position: relative;
          z-index: 10;
          font-style: italic;
        }
        .card-item {
          transition: all 0.3s ease;
          position: relative;
          z-index: 5;
        }
        .card-item::before {
          content: '';
          position: absolute;
          inset: 6px;
          border: 1px solid rgba(0,0,0,0.06);
          pointer-events: none;
        }
        .card-item:hover {
          box-shadow: 0 6px 20px rgba(0,0,0,0.12);
        }
        .crosshatch {
          position: absolute;
          bottom: 15px;
          right: 15px;
          width: 40px;
          height: 40px;
          opacity: 0.15;
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
        className="etching-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
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
            <svg width="100" height="30" viewBox="0 0 100 30" style={{ marginBottom: '16px', opacity: 0.4 }}>
              <line x1="0" y1="15" x2="100" y2="15" stroke="#2a2826" strokeWidth="0.5"/>
              <line x1="0" y1="10" x2="100" y2="10" stroke="#2a2826" strokeWidth="0.3"/>
              <line x1="0" y1="20" x2="100" y2="20" stroke="#2a2826" strokeWidth="0.3"/>
            </svg>
            <h1 
              ref={titleRef} 
              className={`text-center etching-title ${layout.titleSizeClass}`}
              style={{ fontSize: titleConfig.initialFontSize + 'px' }}
            >
              {data.mainTitle}
            </h1>
            <svg width="100" height="30" viewBox="0 0 100 30" style={{ marginTop: '16px', opacity: 0.4 }}>
              <line x1="0" y1="15" x2="100" y2="15" stroke="#2a2826" strokeWidth="0.5"/>
              <line x1="0" y1="10" x2="100" y2="10" stroke="#2a2826" strokeWidth="0.3"/>
              <line x1="0" y1="20" x2="100" y2="20" stroke="#2a2826" strokeWidth="0.3"/>
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
                const color = ETCHING_COLORS[idx % ETCHING_COLORS.length];
                return (
                  <div 
                    key={idx} 
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: color.bg,
                      borderRadius: '2px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      border: `1px solid ${color.border}`,
                      padding: layout.cardPadding
                    }}
                  >
                    <svg className="crosshatch" viewBox="0 0 40 40">
                      <line x1="0" y1="0" x2="40" y2="40" stroke="currentColor" strokeWidth="0.5"/>
                      <line x1="10" y1="0" x2="40" y2="30" stroke="currentColor" strokeWidth="0.5"/>
                      <line x1="0" y1="10" x2="30" y2="40" stroke="currentColor" strokeWidth="0.5"/>
                    </svg>
                    <div className="card-header flex items-center gap-3 mb-4">
                      <span 
                        className="js-icon material-symbols-rounded"
                        style={{
                          color: color.accent,
                          fontSize: layout.iconSize
                        }}
                      >{card.icon}</span>
                      <h3 
                        className={`js-title font-normal leading-tight ${layout.titleSizeClass}`}
                        style={{
                          color: color.text,
                          fontFamily: "'Crimson Text', 'Georgia', serif"
                        }}
                      >{card.title}</h3>
                    </div>
                    <p
                      className={`js-desc font-light leading-relaxed ${layout.descSizeClass}`}
                      style={{
                        color: color.text,
                        opacity: 0.85
                      }}
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

import { generateDownloadableHtml } from '../utils/template';

export const etchingStyleTemplate: TemplateConfig = {
  id: 'etchingStyle',
  name: '铜版蚀刻',
  description: '细密线条交叉排线的铜版风格，用线密度做灰阶',
  icon: 'edit',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <EtchingStyle data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'etchingStyle'),
};

export { EtchingStyle };
