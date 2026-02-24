import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import {
    generateTitleFitScript,
    generateViewportFitScript,
    calculateStandardLayout,
    getStandardTitleConfig,
} from '../utils/layout-calculator';
import { generateDownloadableHtml } from '../utils/template';

/**
 * BlueGreenLandscape 渲染组件
 * 青绿山水风格 - 石青石绿富丽设色的青绿山水风格，装饰性强、贵而不艳
 */
interface BlueGreenLandscapeProps {
  data: GeneratedContent;
  scale: number;
}

const BlueGreenLandscape: React.FC<BlueGreenLandscapeProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const N = data.cards.length;
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

  const mineralColors = [
    { bg: '#f8f6f0', border: '#4a7c6e', text: '#1a2a28', accent: '#2d5a4a' },
    { bg: '#f2ede4', border: '#5a8a7a', text: '#1a2a28', accent: '#3d6a5a' },
    { bg: '#faf6ee', border: '#4a6c5e', text: '#1a2a28', accent: '#2d5a4e' },
    { bg: '#f5f0e6', border: '#6a9a8a', text: '#1a2a28', accent: '#4d7a6a' },
  ];

  return (
    <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', overflow: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .bluegreen-container {
          font-family: 'Noto Serif SC', 'CustomPreviewFont', serif;
          background: linear-gradient(180deg, #f0ebe3 0%, #e8e1d5 50%, #f2ede4 100%);
          color: #1a2a28;
          position: relative;
          overflow: hidden;
        }
        .bluegreen-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background:
            radial-gradient(ellipse at 15% 20%, rgba(74, 124, 110, 0.15) 0%, transparent 35%),
            radial-gradient(ellipse at 85% 80%, rgba(90, 138, 122, 0.12) 0%, transparent 40%);
          pointer-events: none;
        }
        .bluegreen-title {
          font-weight: 500;
          color: #1a2a28;
          letter-spacing: 0.2em;
          line-height: 1.4;
          position: relative;
          z-index: 10;
          white-space: nowrap;
        }
        .card-item {
          transition: all 0.3s ease;
          position: relative;
          z-index: 5;
          display: flex;
          flex-direction: column;
        }
        .card-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(74, 124, 110, 0.3);
        }
        .gold-accent {
          position: absolute;
          bottom: 12px;
          right: 12px;
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #d4a84b 0%, #b8942a 100%);
          border-radius: 2px;
          opacity: 0.8;
          pointer-events: none;
        }
        .pattern-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20 L25 15 L30 20 L25 25 Z' fill='%234a7c6e' fill-opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .content-scale {
          transform-origin: center center;
        }

        /* 卡片宽度类 */
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 0.5px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 0.5px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 0.5px); }

        /* 中间档位字体 */
        .text-5-5xl { font-size: 3.375rem; line-height: 1.1; }
        .text-4-5xl { font-size: 2.625rem; line-height: 1.2; }
        .text-3-5xl { font-size: 2.0625rem; line-height: 1.3; }
        .text-2-5xl { font-size: 1.8125rem; line-height: 1.4; }
      `}</style>

      <div
        className="bluegreen-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        <div className="pattern-overlay"></div>

        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-20 box-border content-scale z-10"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}
        >
          <div className="flex flex-col items-center">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '2px', background: '#4a7c6e' }}></div>
              <div style={{ width: '8px', height: '8px', background: '#d4a84b', transform: 'rotate(45deg)' }}></div>
              <div style={{ width: '40px', height: '2px', background: '#4a7c6e' }}></div>
            </div>
            <h1 ref={titleRef} className="text-center bluegreen-title" style={{ fontSize: titleConfig.initialFontSize }}>
              {data.mainTitle}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
              <div style={{ width: '40px', height: '2px', background: '#4a7c6e' }}></div>
              <div style={{ width: '8px', height: '8px', background: '#d4a84b', transform: 'rotate(45deg)' }}></div>
              <div style={{ width: '40px', height: '2px', background: '#4a7c6e' }}></div>
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
                const color = mineralColors[idx % mineralColors.length];
                return (
                  <div 
                    key={idx} 
                    className={`card-item ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: color.bg,
                      border: `3px double ${color.border}`,
                      borderRadius: '2px',
                      boxShadow: '0 4px 12px rgba(74, 124, 110, 0.2)',
                      padding: layout.cardPadding
                    }}
                  >
                    <div className="gold-accent"></div>
                    <div className="card-header flex items-center gap-3 mb-4">
                      <span 
                        className="material-symbols-rounded"
                        style={{ color: color.accent, fontSize: layout.iconSize }}
                      >
                        {card.icon}
                      </span>
                      <h3 
                        className={`font-medium leading-tight ${layout.titleSizeClass}`}
                        style={{ color: color.text, fontFamily: "'Noto Serif SC', serif" }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`font-normal leading-relaxed ${layout.descSizeClass}`}
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

      <script dangerouslySetInnerHTML={{
        __html: `
          ${generateTitleFitScript(titleConfig)}
          ${generateViewportFitScript()}
        `
      }} />
    </div>
  );
};

export const blueGreenLandscapeTemplate: TemplateConfig = {
  id: 'blueGreenLandscape',
  name: '青绿山水',
  description: '石青石绿富丽设色的青绿山水风格，装饰性强、贵而不艳',
  icon: 'filter_hdr',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <BlueGreenLandscape data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'blueGreenLandscape'),
};

export { BlueGreenLandscape };
