import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import {
  calculateStandardLayout,
  getStandardTitleConfig,
  generateTitleFitScript,
  generateViewportFitScript,
} from '../utils/layout-calculator';

interface CollageStyleProps {
  data: GeneratedContent;
  scale: number;
}

const THEME_COLORS = [
  { bg: '#fffaf0', text: '#1a1a1a', accent: '#e06040', rotate: '-1deg', texture: 'paper' },
  { bg: '#f0f8ff', text: '#1a1a1a', accent: '#4080e0', rotate: '1.5deg', texture: 'grid' },
  { bg: '#faf5f0', text: '#1a1a1a', accent: '#80b040', rotate: '-0.5deg', texture: 'dots' },
  { bg: '#f8f0f5', text: '#1a1a1a', accent: '#b060a0', rotate: '1deg', texture: 'lines' },
];

const CollageStyle: React.FC<CollageStyleProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const cardCount = data.cards.length;
  const layout = calculateStandardLayout(cardCount);
  const titleConfig = getStandardTitleConfig(cardCount);

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
      <link href="https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .collage-container {
          font-family: 'Courier Prime', 'CustomPreviewFont', monospace;
          background: #f5f0e8;
          color: #1a1a1a;
          position: relative;
          overflow: hidden;
        }
        .collage-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='10' y='10' width='30' height='30' fill='none' stroke='%23000000' stroke-opacity='0.05'/%3E%3Ccircle cx='70' cy='70' r='15' fill='none' stroke='%23000000' stroke-opacity='0.05'/%3E%3Cline x1='50' y1='10' x2='50' y2='40' stroke='%23000000' stroke-opacity='0.05'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .collage-title {
          font-weight: 700;
          color: #1a1a1a;
          letter-spacing: '0.05em';
          line-height: 1.3;
          position: relative;
          z-index: 10;
          text-transform: uppercase;
        }
        .card-item {
          transition: all 0.3s ease;
          position: relative;
          z-index: 5;
        }
        .card-item::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23000000' fill-opacity='0.03'/%3E%3Ccircle cx='12' cy='12' r='1' fill='%23000000' fill-opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .card-item:hover {
          transform: translateY(-4px) scale(1.02) !important;
          box-shadow: 8px 8px 20px rgba(0,0,0,0.2) !important;
        }
        .tape-corner {
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 16px;
          background: rgba(255,255,200,0.7);
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          pointer-events: none;
        }
        .paper-edge {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.1) 50%);
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
        className="collage-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
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
            <div style={{
              width: '200px',
              height: '3px',
              background: 'repeating-linear-gradient(90deg, #1a1a1a 0px, #1a1a1a 5px, transparent 5px, transparent 10px)',
              marginBottom: '20px'
            }}></div>
            <h1 
              ref={titleRef} 
              className={`text-center collage-title ${layout.titleSizeClass}`}
              style={{ fontSize: titleConfig.initialFontSize + 'px' }}
            >
              {data.mainTitle}
            </h1>
            <div style={{
              width: '200px',
              height: '3px',
              background: 'repeating-linear-gradient(90deg, #1a1a1a 0px, #1a1a1a 5px, transparent 5px, transparent 10px)',
              marginTop: '20px'
            }}></div>
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
                const color = THEME_COLORS[idx % THEME_COLORS.length];
                return (
                  <div
                    key={idx}
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      padding: layout.cardPadding,
                      backgroundColor: color.bg,
                      transform: `rotate(${color.rotate})`,
                      boxShadow: '4px 4px 12px rgba(0,0,0,0.15)',
                      border: '1px solid rgba(0,0,0,0.1)',
                    }}
                  >
                    <div className="tape-corner"></div>
                    <div className="paper-edge"></div>
                    <div className="card-header flex items-center gap-3 mb-4">
                      <span
                        className="js-icon material-symbols-rounded"
                        style={{
                          fontSize: layout.iconSize,
                          color: color.accent,
                          transform: `rotate(${-color.rotate})`,
                          display: 'inline-block',
                        }}
                      >
                        {card.icon}
                      </span>
                      <h3
                        className={`js-title font-medium leading-tight ${layout.titleSizeClass}`}
                        style={{
                          color: color.text,
                          fontFamily: "'Courier New', monospace",
                          transform: `rotate(${-color.rotate})`,
                          display: 'inline-block',
                        }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
                      style={{
                        color: color.text,
                        opacity: '0.9',
                        transform: `rotate(${-color.rotate})`,
                        display: 'inline-block',
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

export const collageStyleTemplate: TemplateConfig = {
  id: 'collageStyle',
  name: '拼贴艺术',
  description: '材质混合剪裁边缘的拼贴风格，适合艺术与传播',
  icon: 'content_cut',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <CollageStyle data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'collageStyle'),
};

export { CollageStyle };
