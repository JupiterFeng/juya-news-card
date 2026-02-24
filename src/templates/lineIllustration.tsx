import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import {
  calculateStandardLayout,
  getStandardTitleConfig,
  generateTitleFitScript,
  generateViewportFitScript,
} from '../utils/layout-calculator';
import { generateDownloadableHtml } from '../utils/template';
import { autoAddSpaceToHtml } from '../utils/text-spacing';

interface LineIllustrationProps {
  data: GeneratedContent;
  scale: number;
}

const LineIllustration: React.FC<LineIllustrationProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const lineColors = [
    { bg: '#ffffff', text: '#1a1a1a', accent: '#3a3a3a', border: '#e0e0e0' },
    { bg: '#fafafa', text: '#1a1a1a', accent: '#4a4a4a', border: '#e8e8e8' },
    { bg: '#f5f5f5', text: '#1a1a1a', accent: '#2a2a2a', border: '#dcdcdc' },
    { bg: '#ffffff', text: '#1a1a1a', accent: '#5a5a5a', border: '#e5e5e5' },
  ];

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
        const scaleVal = Math.max(0.6, maxH / contentH);
        wrapper.style.transform = `scale(${scaleVal})`;
        return;
      }
      wrapper.style.transform = '';
    };

    const timer = window.setTimeout(fitViewport, 50);
    return () => window.clearTimeout(timer);
  }, [data, titleConfig]);

  return (
    <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', overflow: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .lineillustration-container {
          font-family: 'Inter', 'CustomPreviewFont', sans-serif;
          background: #ffffff;
          color: #1a1a1a;
          position: relative;
          overflow: hidden;
        }
        .lineillustration-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='40' cy='40' r='20' stroke='%23e0e0e0' fill='none'/%3E%3Ccircle cx='0' cy='0' r='8' stroke='%23e8e8e8' fill='none'/%3E%3Ccircle cx='80' cy='80' r='12' stroke='%23e5e5e5' fill='none'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .line-title {
          font-weight: 500;
          color: #1a1a1a;
          letter-spacing: 0.05em;
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
          border-color: #3a3a3a !important;
        }
        .corner-dots {
          position: absolute;
          top: 8px;
          right: 8px;
          display: flex;
          gap: 4px;
          opacity: 0.3;
          pointer-events: none;
        }
        .dot {
          width: 4px;
          height: 4px;
          background: #1a1a1a;
          border-radius: 50%;
        }
        .content-scale {
          transform-origin: center center;
        }
      `}</style>

      <div
        ref={mainRef}
        className="lineillustration-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
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
            <div style={{ width: '100px', height: '2px', background: '#1a1a1a', marginBottom: '20px' }}></div>
            <h1 ref={titleRef} className="text-center line-title">
              {data.mainTitle}
            </h1>
            <div style={{ width: '100px', height: '2px', background: '#1a1a1a', marginTop: '20px' }}></div>
          </div>

          <div className="card-zone flex-none w-full">
            <div
              data-card-zone="true"
              className="w-full flex flex-wrap justify-center content-center"
              style={{
                gap: layout.containerGap,
                '--container-gap': layout.containerGap,
                paddingLeft: cardZoneInsetX,
                paddingRight: cardZoneInsetX,
                maxWidth: cardZoneMaxWidth,
                margin: '0 auto',
                boxSizing: 'border-box'
              } as React.CSSProperties}
            >
              {data.cards.map((card, idx) => {
                const color = lineColors[idx % lineColors.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: color.bg,
                      borderRadius: '2px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      border: `2px solid ${color.border}`,
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="corner-dots">
                      <div className="dot"></div>
                      <div className="dot"></div>
                    </div>
                    <div className="card-header flex items-center gap-3 mb-4">
                      <span className="js-icon material-symbols-rounded" style={{ color: color.accent, fontSize: layout.iconSize }}>
                        {card.icon}
                      </span>
                      <h3
                        className={`js-title font-medium leading-tight ${layout.titleSizeClass}`}
                        style={{ color: color.text, fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
                      style={{ color: color.text, opacity: '0.85' }}
                      dangerouslySetInnerHTML={{ __html: autoAddSpaceToHtml(card.desc) }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            ${generateTitleFitScript(titleConfig)}
            ${generateViewportFitScript()}
          `,
        }}
      />
    </div>
  );
};

export const lineIllustrationTemplate: TemplateConfig = {
  id: 'lineIllustration',
  name: '线描插画',
  description: '线条统一留白干净的线描风格，适合说明与科普',
  icon: 'show_chart',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <LineIllustration data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'lineIllustration'),
};

export { LineIllustration };
