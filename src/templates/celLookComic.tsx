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

interface CelLookComicProps {
  data: GeneratedContent;
  scale: number;
}

const THEME_COLORS = [
  { bg: '#ffe4e1', text: '#1a1a1a', accent: '#e63946', shadow: '#ffb3ba' },
  { bg: '#e3f2fd', text: '#1a1a1a', accent: '#2196f3', shadow: '#b3d9ff' },
  { bg: '#e8f5e9', text: '#1a1a1a', accent: '#4caf50', shadow: '#b9f6ca' },
  { bg: '#fff3e0', text: '#1a1a1a', accent: '#ff9800', shadow: '#ffe0b2' },
  { bg: '#f3e5f5', text: '#1a1a1a', accent: '#9c27b0', shadow: '#e1bee7' },
  { bg: '#e0f7fa', text: '#1a1a1a', accent: '#00bcd4', shadow: '#b2ebf2' },
];

const CelLookComic: React.FC<CelLookComicProps> = ({ data, scale }) => {
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
      <link href="https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .cellook-container {
          font-family: 'Comic Neue', 'CustomPreviewFont', cursive;
          background: linear-gradient(180deg, #ffe4e1 0%, #f3e5f5 50%, #e3f2fd 100%);
          color: #1a1a1a;
          position: relative;
          overflow: hidden;
        }
        .cellook-title {
          font-weight: 700;
          color: #1a1a1a;
          letter-spacing: 0.02em;
          line-height: 1.3;
          position: relative;
          z-index: 10;
          white-space: nowrap;
        }
        .card-item {
          transition: all 0.3s ease;
          position: relative;
          z-index: 5;
          box-shadow: 0 6px 20px rgba(0,0,0,0.1);
        }
        .card-item::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, transparent, rgba(0,0,0,0.15), transparent);
          border-radius: 0 0 8px 8px;
        }
        .card-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.15);
        }
        .highlight-spot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 20px;
          height: 20px;
          background: radial-gradient(ellipse, rgba(255,255,255,0.8) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }
        .anime-shadow {
          position: absolute;
          bottom: 12px;
          right: -4px;
          width: calc(100% - 24px);
          height: 8px;
          background: rgba(0,0,0,0.1);
          filter: blur(4px);
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

      <div className="cellook-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
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
            <div style={{
              width: '150px',
              height: '8px',
              backgroundColor: '#e63946',
              borderRadius: '4px',
              marginBottom: '24px',
              boxShadow: '4px 4px 0 rgba(0,0,0,0.1)'
            }}></div>
            <h1 
              ref={titleRef} 
              className={`text-center cellook-title ${layout.titleSizeClass}`}
              style={{ fontSize: titleConfig.initialFontSize + 'px' }}
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
                const color = getCardThemeColor(THEME_COLORS, idx) as any;
                return (
                  <div 
                    key={idx} 
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: color.bg,
                      borderRadius: '8px',
                      padding: layout.cardPadding
                    }}
                  >
                    <div className="highlight-spot"></div>
                    <div className="anime-shadow"></div>
                    <div className="card-header flex items-center gap-3 mb-4">
                      <span 
                        className="js-icon material-symbols-rounded"
                        style={{ color: color.accent, fontSize: layout.iconSize }}
                      >
                        {card.icon}
                      </span>
                      <h3 
                        className={`js-title font-bold leading-tight ${layout.titleSizeClass}`}
                        style={{ color: color.text, fontFamily: "'Anime Ace', 'Comic Neue', sans-serif" }}
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

export const celLookComicTemplate: TemplateConfig = {
  id: 'celLookComic',
  name: '赛璐璐风格',
  description: '线稿清晰平涂分区阴影的赛璐璐风格，硬边阴影设计成形',
  icon: 'animation',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <CelLookComic data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'celLookComic'),
};

export { CelLookComic };
