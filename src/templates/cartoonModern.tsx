import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';

interface CartoonModernProps {
  data: GeneratedContent;
  scale: number;
}

import { calculateStandardLayout, getStandardTitleConfig, getCardThemeColor, generateTitleFitScript, generateViewportFitScript } from '../utils/layout-calculator';

const THEME_COLORS = [
  { bg: '#ff6b6b', text: '#ffffff', icon: '#ffe66d', shape: 'circle' },
  { bg: '#4ecdc4', text: '#1a3a3a', icon: '#ff6b6b', shape: 'rect' },
  { bg: '#ffe66d', text: '#1a1a1a', icon: '#4ecdc4', shape: 'triangle' },
  { bg: '#95e1d3', text: '#1a1a1a', icon: '#ff6b6b', shape: 'diamond' },
  { bg: '#dda0dd', text: '#ffffff', icon: '#4ecdc4', shape: 'circle' },
  { bg: '#6c5ce7', text: '#ffffff', icon: '#ffe66d', shape: 'rect' },
];

const CartoonModern: React.FC<CartoonModernProps> = ({ data, scale }) => {
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
      let size = 80;
      title.style.fontSize = size + 'px';
      let guard = 0;
      while(title.scrollWidth > 1700 && size > 36 && guard < 100) {
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
      <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Roboto:wght@400;700;900&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .cartoonmodern-container {
          font-family: 'Fredoka One', 'CustomPreviewFont', cursive;
          background-color: #fef9e7;
          color: #1a1a1a;
          position: relative;
          overflow: hidden;
        }
        .cartoonmodern-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='12' fill='%23ff6b6b' fill-opacity='0.15'/%3E%3Crect x='50' y='50' width='16' height='16' fill='%234ecdc4' fill-opacity='0.15'/%3E%3Crect x='10' y='50' width='20' height='20' fill='%23ffe66d' fill-opacity='0.15'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .cartoonmodern-title {
          font-weight: 400;
          color: #1a1a1a;
          letter-spacing: 0.05em;
          line-height: 1.2;
          position: relative;
          z-index: 10;
          white-space: nowrap;
        }
        .card-item {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          z-index: 5;
        }
        .card-item:hover {
          transform: translateY(-8px) rotate(2deg);
          box-shadow: 0 16px 32px rgba(0,0,0,0.2);
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

        .geometric-deco {
          position: absolute;
          top: -10px;
          left: -10px;
          width: 20px;
          height: 20px;
          background: rgba(0,0,0,0.1);
          border-radius: 50%;
          pointer-events: none;
        }
        .content-scale {
          transform-origin: center center;
        }
      `}</style>

      <div
        className="cartoonmodern-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
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
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '20px', height: '20px', background: '#ff6b6b', borderRadius: '50%' }}></div>
              <div style={{ width: '20px', height: '20px', background: '#4ecdc4' }}></div>
              <div style={{ width: '20px', height: '20px', background: '#ffe66d', borderRadius: '12px' }}></div>
            </div>
            <h1 ref={titleRef} className="text-center cartoonmodern-title">
              {data.mainTitle}
            </h1>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <div style={{ width: '20px', height: '20px', background: '#95e1d3', borderRadius: '12px' }}></div>
              <div style={{ width: '20px', height: '20px', background: '#dda0dd', borderRadius: '50%' }}></div>
              <div style={{ width: '20px', height: '20px', background: '#6c5ce7', borderRadius: '12px' }}></div>
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
                const borderRadius = theme.shape === 'circle' ? '24px' : (theme.shape === 'rect' ? '0' : '12px');
                
                return (
                  <div 
                    key={idx} 
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: theme.bg,
                      borderRadius: borderRadius,
                      padding: layout.cardPadding,
                      boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
                    }}
                  >
                    <div className="geometric-deco"></div>
                    <div className="card-header flex items-center gap-3 mb-4">
                      <span className="js-icon material-symbols-rounded" style={{ fontSize: layout.iconSize, color: theme.icon }}>{card.icon}</span>
                      <h3 className={`js-title font-black leading-tight ${layout.titleSizeClass}`} style={{ color: theme.text, fontFamily: "'Fredoka One', 'Arial Black', sans-serif" }}>{card.title}</h3>
                    </div>
                    <p
                      className={`js-desc font-bold leading-relaxed ${layout.descSizeClass}`}
                      style={{ color: theme.text }}
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

export const cartoonModernTemplate: TemplateConfig = {
  id: 'cartoonModern',
  name: '卡通现代主义',
  description: '平面化几何造型大色块的UPA风格，造型与构成是主角',
  icon: 'category',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <CartoonModern data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'cartoonModern'),
};

export { CartoonModern };
