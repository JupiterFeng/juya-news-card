import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import { 
  calculateStandardLayout, 
  getStandardTitleConfig, 
  generateTitleFitScript, 
  generateViewportFitScript 
} from '../utils/layout-calculator';

interface FauvismProps {
  data: GeneratedContent;
  scale: number;
}

const FAUVE_COLORS = [
  { bg: '#ff6b4a', text: '#1a0a08', accent: '#fff8f0' },
  { bg: '#4ecdc4', text: '#0a1a18', accent: '#fff8f0' },
  { bg: '#ffe66d', text: '#1a1a0a', accent: '#2a2a18' },
  { bg: '#95e1d3', text: '#0a1a14', accent: '#fff8f0' },
  { bg: '#f38181', text: '#1a0a0a', accent: '#fff8f0' },
  { bg: '#aa96da', text: '#0a0a1a', accent: '#fff8f0' },
  { bg: '#fcbad3', text: '#1a0a12', accent: '#fff8f0' },
  { bg: '#a8e6cf', text: '#0a1a10', accent: '#2a2a18' },
];

const Fauvism: React.FC<FauvismProps> = ({ data, scale }) => {
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
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@500;700;900&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .fauvism-container {
          font-family: 'Roboto', 'CustomPreviewFont', sans-serif;
          background: #ffeaa7;
          color: #1a0a08;
          position: relative;
          overflow: hidden;
        }
        .fauvism-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='10' y='10' width='20' height='20' fill='%23ff6b4a' fill-opacity='0.2'/%3E%3Ccircle cx='60' cy='20' r='12' fill='%234ecdc4' fill-opacity='0.2'/%3E%3Crect x='50' y='50' width='18' height='18' fill='%23ffe66d' fill-opacity='0.3'/%3E%3Ccircle cx='20' cy='60' r='10' fill='%2395e1d3' fill-opacity='0.2'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .fauvism-title {
          font-weight: 900;
          color: #1a0a08;
          letter-spacing: 0.05em;
          line-height: 1.2;
          position: relative;
          z-index: 10;
          text-transform: uppercase;
        }
        .card-item {
          transition: all 0.2s ease;
          position: relative;
          z-index: 5;
        }
        .card-item:hover {
          transform: translate(-3px, -3px);
          box-shadow: 10px 10px 0 rgba(0,0,0,0.3);
        }
        .bold-stripe {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 6px;
          background: rgba(0,0,0,0.3);
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
        className="fauvism-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
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
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '8px', background: '#ff6b4a' }}></div>
              <div style={{ width: '40px', height: '8px', background: '#4ecdc4' }}></div>
              <div style={{ width: '40px', height: '8px', background: '#ffe66d' }}></div>
            </div>
            <h1 
              ref={titleRef} 
              className={`text-center fauvism-title ${layout.titleSizeClass}`}
              style={{ fontSize: titleConfig.initialFontSize + 'px' }}
            >
              {data.mainTitle}
            </h1>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <div style={{ width: '40px', height: '8px', background: '#95e1d3' }}></div>
              <div style={{ width: '40px', height: '8px', background: '#f38181' }}></div>
              <div style={{ width: '40px', height: '8px', background: '#aa96da' }}></div>
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
                const color = FAUVE_COLORS[idx % FAUVE_COLORS.length];
                return (
                  <div 
                    key={idx} 
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: color.bg,
                      borderRadius: '0',
                      boxShadow: '6px 6px 0 rgba(0,0,0,0.2)',
                      padding: layout.cardPadding
                    }}
                  >
                    <div className="bold-stripe"></div>
                    <div className="card-header flex items-center gap-3 mb-4">
                      <span 
                        className="js-icon material-symbols-rounded"
                        style={{
                          color: color.accent,
                          fontSize: layout.iconSize
                        }}
                      >{card.icon}</span>
                      <h3 
                        className={`js-title font-bold leading-tight ${layout.titleSizeClass}`}
                        style={{
                          color: color.text,
                          fontFamily: "'Arial Black', 'Helvetica Neue', sans-serif"
                        }}
                      >{card.title}</h3>
                    </div>
                    <p
                      className={`js-desc font-medium leading-relaxed ${layout.descSizeClass}`}
                      style={{ color: color.text }}
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

export const fauvismTemplate: TemplateConfig = {
  id: 'fauvism',
  name: '野兽派',
  description: '高饱和情绪色的野兽派风格，色彩主导、互补色冲击',
  icon: 'color_lens',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <Fauvism data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'fauvism'),
};

export { Fauvism };

