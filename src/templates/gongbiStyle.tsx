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

interface GongbiStyleProps {
  data: GeneratedContent;
  scale: number;
}

const GONGBI_COLORS = [
  { bg: '#faf8f5', border: '#c9a96e', text: '#2c2416', accent: '#b84a3a' },
  { bg: '#f8f5f0', border: '#d4b896', text: '#2a2419', accent: '#8b4513' },
  { bg: '#faf5ef', border: '#c9a96e', text: '#1f1a12', accent: '#c45c3a' },
  { bg: '#f5f0e8', border: '#b8996a', text: '#242018', accent: '#a0522d' },
];

const GongbiStyle: React.FC<GongbiStyleProps> = ({ data, scale }) => {
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
      <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .gongbi-container {
          font-family: 'Noto Serif SC', 'CustomPreviewFont', serif;
          background: linear-gradient(180deg, #f8f5f0 0%, #f0ebe3 100%);
          color: #2c2416;
          position: relative;
        }
        .gongbi-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c9a96e' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          pointer-events: none;
        }
        .gongbi-title {
          font-weight: 500;
          color: #2c2416;
          letter-spacing: 0.1em;
          line-height: 1.4;
          position: relative;
          z-index: 1;
          white-space: nowrap;
        }
        .card-item {
          transition: all 0.3s ease;
          position: relative;
          box-shadow: 0 2px 8px rgba(201, 169, 110, 0.2);
        }
        .card-item::after {
          content: '';
          position: absolute;
          top: 4px;
          left: 4px;
          right: 4px;
          bottom: 4px;
          border: 1px solid rgba(201, 169, 110, 0.3);
          pointer-events: none;
          border-radius: 2px;
        }
        .card-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(201, 169, 110, 0.3);
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .content-scale {
          transform-origin: center center;
        }
        .card-header {
          position: relative;
          z-index: 1;
        }
      `}</style>

      <div className="gongbi-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-16 box-border content-scale z-10"
          style={{ 
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX,
            paddingRight: layout.wrapperPaddingX
          }}
        >
          <div className="flex flex-col items-center relative z-10">
            <div className="gongbi-decorative-line" style={{ width: '120px', height: '2px', background: '#c9a96e', marginBottom: '16px' }}></div>
            <h1 
              ref={titleRef} 
              className="text-center gongbi-title"
              style={{ fontSize: titleConfig.initialFontSize }}
            >
              {data.mainTitle}
            </h1>
            <div className="gongbi-decorative-line" style={{ width: '120px', height: '2px', background: '#c9a96e', marginTop: '16px' }}></div>
          </div>

          <div className="card-zone flex-none w-full relative z-10">
            <div
              className="w-full flex flex-wrap justify-center content-center"
              style={{ 
                gap: layout.containerGap,
                '--container-gap': layout.containerGap
              } as React.CSSProperties}
            >
              {data.cards.map((card, idx) => {
                const color = getCardThemeColor(GONGBI_COLORS, idx);
                return (
                  <div 
                    key={idx} 
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: color.bg,
                      border: `2px solid ${color.border}`,
                      borderRadius: '4px',
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="card-header flex items-center gap-3 mb-3">
                      <span 
                        className="js-icon material-symbols-rounded"
                        style={{ color: color.accent, fontSize: layout.iconSize }}
                      >
                        {card.icon}
                      </span>
                      <h3 
                        className={`js-title font-medium leading-tight ${layout.titleSizeClass}`}
                        style={{ color: color.text, fontFamily: "'Noto Serif SC', serif" }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
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

export const gongbiStyleTemplate: TemplateConfig = {
  id: 'gongbiStyle',
  name: '工笔画',
  description: '细密线条、多层设色的传统工笔风格，线条精致、色彩雅致',
  icon: 'brush',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <GongbiStyle data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'gongbiStyle'),
};

export { GongbiStyle };
