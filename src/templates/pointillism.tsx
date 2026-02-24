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

interface PointillismProps {
  data: GeneratedContent;
  scale: number;
}

const Pointillism: React.FC<PointillismProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';
  const pointillismColors = [
    { bg: '#f0f8ff', text: '#1a2838', accent: '#3a6a8a', dot1: '#4a90c8', dot2: '#6ab0d8' },
    { bg: '#fff8f0', text: '#2a2018', accent: '#9a6a40', dot1: '#c8a070', dot2: '#e8c8a0' },
    { bg: '#f8f0ff', text: '#1a1828', accent: '#6a4a9a', dot1: '#9a70c8', dot2: '#c8a0e8' },
    { bg: '#f0fff8', text: '#182820', accent: '#4a9a6a', dot1: '#70c890', dot2: '#a0e8b8' },
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
      while(title.scrollWidth > 1700 && size > titleConfig.minFontSize && guard < 100) {
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
      <link href="https://fonts.googleapis.com/css2?family=Georgia:wght@400;500;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .pointillism-container {
          font-family: 'Georgia', 'CustomPreviewFont', serif;
          background: #f8f8f8;
          color: #1a2838;
          position: relative;
          overflow: hidden;
        }
        .pointillism-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%234a90c8' fill-opacity='0.15'/%3E%3Ccircle cx='12' cy='8' r='1' fill='%236ab0d8' fill-opacity='0.12'/%3E%3Ccircle cx='6' cy='14' r='1' fill='%234a90c8' fill-opacity='0.1'/%3E%3Ccircle cx='16' cy='16' r='1' fill='%23c8a070' fill-opacity='0.13'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .pointillism-title {
          font-weight: 500;
          color: #1a2838;
          letter-spacing: 0.08em;
          line-height: 1.3;
          position: relative;
          z-index: 10;
        }
        .card-item {
          transition: all 0.3s ease;
          position: relative;
          z-index: 5;
          overflow: hidden;
        }
        .card-item::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23000000' fill-opacity='0.04'/%3E%3Ccircle cx='8' cy='6' r='0.8' fill='%23000000' fill-opacity='0.03'/%3E%3Ccircle cx='4' cy='10' r='0.6' fill='%23000000' fill-opacity='0.05'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .card-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }
        .dot-corner {
          position: absolute;
          top: 0;
          right: 0;
          width: 50px;
          height: 50px;
          background-image: radial-gradient(circle, rgba(74,144,200,0.15) 1px, transparent 1px);
          background-size: 6px 6px;
          pointer-events: none;
        }
        .content-scale {
          transform-origin: center center;
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 0.5px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 0.5px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 0.5px); }

        .text-5-5xl { font-size: 3.375rem; line-height: 1.1; }
        .text-4-5xl { font-size: 2.625rem; line-height: 1.2; }
        .text-3-5xl { font-size: 2.0625rem; line-height: 1.3; }
        .text-2-5xl { font-size: 1.8125rem; line-height: 1.4; }
      `}</style>

      <div
        ref={mainRef}
        className="pointillism-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
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
            <h1 ref={titleRef} className="text-center pointillism-title">
              {data.mainTitle}
            </h1>
            <div style={{
              width: '100px',
              height: '4px',
              background: 'repeating-linear-gradient(90deg, #3a6a8a 0px, #3a6a8a 3px, transparent 3px, transparent 6px)',
              marginTop: '16px',
              opacity: 0.6
            }}></div>
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
                const color = pointillismColors[idx % pointillismColors.length];
                return (
                <div
                  key={idx}
                  data-card-item="true"
                  className={`card-item flex flex-col ${layout.cardWidthClass}`}
                  style={{
                    backgroundColor: color.bg,
                    borderRadius: '2px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(0,0,0,0.08)',
                    padding: layout.cardPadding
                  }}
                >
                  <div className="dot-corner"></div>
                  <div className="card-header flex items-center gap-3 mb-4">
                    <span className="js-icon material-symbols-rounded" style={{ color: color.accent, fontSize: layout.iconSize }}>
                      {card.icon}
                    </span>
                    <h3 className={`js-title font-medium leading-tight ${layout.titleSizeClass}`} style={{ color: color.text, fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                      {card.title}
                    </h3>
                  </div>
                  <p
                    className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
                    style={{ color: color.text, opacity: '0.85' }}
                    dangerouslySetInnerHTML={{ __html: autoAddSpaceToHtml(card.desc) }}
                  />
                </div>
              )})}
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

export const pointillismTemplate: TemplateConfig = {
  id: 'pointillism',
  name: '点彩派',
  description: '颜色像素点的点彩风格，光学混色、颗粒节奏',
  icon: 'grain',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <Pointillism data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'pointillism'),
};

export { Pointillism };
