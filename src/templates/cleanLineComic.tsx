import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import {
  calculateStandardLayout,
  getStandardTitleConfig,
  generateTitleFitScript,
  generateViewportFitScript,
} from '../utils/layout-calculator';

interface CleanLineComicProps {
  data: GeneratedContent;
  scale: number;
}

const THEME_COLORS = [
  { bg: '#ffffff', text: '#1a1a1a', accent: '#4a4a4a', border: '#e0e0e0' },
  { bg: '#fafafa', text: '#1a1a1a', accent: '#3a3a3a', border: '#e8e8e8' },
  { bg: '#f5f5f5', text: '#1a1a1a', accent: '#5a5a5a', border: '#e0e0e0' },
  { bg: '#ffffff', text: '#1a1a1a', accent: '#2a2a2a', border: '#e5e5e5' },
];

const CleanLineComic: React.FC<CleanLineComicProps> = ({ data, scale }) => {
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
      <link href="https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;500;700&family=Nunito:wght@400;600;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .cleanline-container {
          font-family: 'Comic Neue', 'CustomPreviewFont', sans-serif;
          background: #fafafa;
          color: #1a1a1a;
          position: relative;
          overflow: hidden;
        }
        .cleanline-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='15' stroke='%23e0e0e0' fill='none' stroke-width='2'/%3E%3Ccircle cx='0' cy='0' r='8' stroke='%23e5e5e5' fill='none' stroke-width='1.5'/%3E%3Ccircle cx='60' cy='60' r='10' stroke='%23e0e0e0' fill='none' stroke-width='1.5'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .cleanline-title {
          font-weight: 500;
          color: #1a1a1a;
          letter-spacing: '0.02em';
          line-height: 1.3;
          position: relative;
          z-index: 10;
        }
        .card-item {
          transition: all 0.3s ease;
          position: relative;
          z-index: 5;
        }
        .card-item:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
          border-color: #4a4a4a !important;
        }
        .speech-bubble {
          position: absolute;
          top: -10px;
          right: -10px;
          width: 20px;
          height: 20px;
          background: #fff;
          border: 2px solid #e0e0e0;
          border-radius: 50%;
          pointer-events: none;
        }
        .speech-bubble::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-top: 6px solid #e0e0e0;
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
        className="cleanline-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
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
            <div style={{ width: '100px', height: '3px', background: '#1a1a1a', marginBottom: '16px' }}></div>
            <h1 
              ref={titleRef} 
              className={`text-center cleanline-title ${layout.titleSizeClass}`}
              style={{ fontSize: titleConfig.initialFontSize + 'px' }}
            >
              {data.mainTitle}
            </h1>
            <div style={{ width: '100px', height: '3px', background: '#1a1a1a', marginTop: '16px' }}></div>
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
                      borderRadius: '2px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      border: `2px solid ${color.border}`,
                    }}
                  >
                    <div className="speech-bubble"></div>
                    <div className="card-header flex items-center gap-3 mb-4">
                      <span
                        className="js-icon material-symbols-rounded"
                        style={{
                          fontSize: layout.iconSize,
                          color: color.accent,
                        }}
                      >
                        {card.icon}
                      </span>
                      <h3
                        className={`js-title font-medium leading-tight ${layout.titleSizeClass}`}
                        style={{
                          color: color.text,
                          fontFamily: "'Comic Neue', 'Nunito', sans-serif",
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

export const cleanLineComicTemplate: TemplateConfig = {
  id: 'cleanLineComic',
  name: '清线漫画',
  description: '线条均匀干净的清线风格，阴影少、色块清爽、信息极清晰',
  icon: 'gesture',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <CleanLineComic data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'cleanLineComic'),
};

export { CleanLineComic };
