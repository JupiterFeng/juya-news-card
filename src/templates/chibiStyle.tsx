import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import {
  calculateStandardLayout,
  getStandardTitleConfig,
  getCardThemeColor,
  generateTitleFitScript,
  generateViewportFitScript,
} from '../utils/layout-calculator';
import { generateDownloadableHtml } from '../utils/template';

interface ChibiStyleProps {
  data: GeneratedContent;
  scale: number;
}

const THEME_COLORS = [
  { bg: '#ffb3ba', text: '#5a3a4a', accent: '#ff6b8a', blush: '#ff8fa3' },
  { bg: '#baffc9', text: '#3a5a4a', accent: '#6bff9a', blush: '#8fffb3' },
  { bg: '#bae1ff', text: '#3a4a5a', accent: '#6bb3ff', blush: '#8fcfff' },
  { bg: '#ffffba', text: '#5a5a3a', accent: '#ffff6b', blush: '#ffff8f' },
  { bg: '#e0bbff', text: '#4a3a5a', accent: '#c77fff', blush: '#dbb3ff' },
  { bg: '#ffdeb3', text: '#5a4a3a', accent: '#ff9f6b', blush: '#ffc69f' },
];

const ChibiStyle: React.FC<ChibiStyleProps> = ({ data, scale }) => {
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
      <link href="https://fonts.googleapis.com/css2?family=Varela+Round:wght@400;700&family=Nunito:wght@400;600;800&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .chibi-container {
          font-family: 'Varela Round', 'CustomPreviewFont', sans-serif;
          background: linear-gradient(180deg, #fff5f8 0%, #f0f8ff 50%, #fffaf0 100%);
          color: #5a3a4a;
          position: relative;
          overflow: hidden;
        }
        .chibi-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='15' cy='15' r='8' fill='%23ffb3ba' fill-opacity='0.3'/%3E%3Ccircle cx='45' cy='45' r='6' fill='%23bae1ff' fill-opacity='0.3'/%3E%3Ccircle cx='45' cy='15' r='5' fill='%23ffffba' fill-opacity='0.3'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .chibi-title {
          font-weight: 700;
          color: #5a3a4a;
          letter-spacing: 0.05em;
          line-height: 1.3;
          position: relative;
          z-index: 10;
          white-space: nowrap;
        }
        .card-item {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          z-index: 5;
          box-shadow: 0 6px 20px rgba(0,0,0,0.1);
        }
        .card-item::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 60%;
          height: 6px;
          background: rgba(0,0,0,0.1);
          border-radius: 3px;
          pointer-events: none;
        }
        .card-item:hover {
          transform: translateY(-8px) scale(1.03);
          box-shadow: 0 16px 40px rgba(0,0,0,0.15);
        }
        .kawaii-face {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 24px;
          height: 24px;
          background: rgba(255,255,255,0.8);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          pointer-events: none;
        }
        .sparkle {
          position: absolute;
          top: -5px;
          left: 15px;
          width: 12px;
          height: 12px;
          clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
          background: linear-gradient(135deg, #fff 0%, #ffd700 100%);
          pointer-events: none;
          animation: sparkle 1.5s ease-in-out infinite;
        }
        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
          50% { opacity: 0.7; transform: scale(1.2) rotate(180deg); }
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

        .content-scale { transform-origin: center center; }
        .material-symbols-rounded { font-family: 'Material Symbols Rounded' !important; font-weight: normal; font-style: normal; display: inline-block; }
      `}</style>

      <div className="chibi-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-16 box-border content-scale z-10"
          style={{ 
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined
          }}
        >
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span style={{ fontSize: '32px' }}>✨</span>
              <h1 
                ref={titleRef} 
                className={`text-center chibi-title ${layout.titleSizeClass}`}
                style={{ fontSize: titleConfig.initialFontSize + 'px' }}
              >
                {data.mainTitle}
              </h1>
              <span style={{ fontSize: '32px' }}>✨</span>
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
                const color = getCardThemeColor(THEME_COLORS, idx) as any;
                return (
                  <div 
                    key={idx} 
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: color.bg,
                      borderRadius: '16px',
                      padding: layout.cardPadding
                    }}
                  >
                    <div className="sparkle"></div>
                    <div className="kawaii-face">◕‿◕</div>
                    <div className="blush-mark"></div>
                    <div className="card-header flex items-center gap-3 mb-4">
                      <span 
                        className="js-icon material-symbols-rounded"
                        style={{ color: color.accent, fontSize: layout.iconSize }}
                      >
                        {card.icon}
                      </span>
                      <h3 
                        className={`js-title font-bold leading-tight ${layout.titleSizeClass}`}
                        style={{ color: color.text, fontFamily: "'Varela Round', 'Nunito', sans-serif" }}
                      >
                        {card.title}
                      </h3>
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

      <script dangerouslySetInnerHTML={{
        __html: `
          ${generateTitleFitScript(titleConfig)}
          ${generateViewportFitScript()}
        `
      }} />
    </div>
  );
};

export const chibiStyleTemplate: TemplateConfig = {
  id: 'chibiStyle',
  name: 'Q版萌系',
  description: '头大身小特征符号化的Q版风格，表情极夸张',
  icon: 'sentiment_very_satisfied',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <ChibiStyle data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'chibiStyle'),
};

export { ChibiStyle };
