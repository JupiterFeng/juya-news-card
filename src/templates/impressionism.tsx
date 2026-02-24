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

interface ImpressionismProps {
  data: GeneratedContent;
  scale: number;
}

const Impressionism: React.FC<ImpressionismProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';
  const impressionColors = [
    { bg: 'linear-gradient(135deg, #a8d5e5 0%, #d4e8f0 50%, #b8ddd8 100%)', text: '#1a2830', accent: '#2d5a6a' },
    { bg: 'linear-gradient(135deg, #f5d8c8 0%, #fce8d8 50%, #f8e0c8 100%)', text: '#2a2018', accent: '#8a5030' },
    { bg: 'linear-gradient(135deg, #d8c8e8 0%, #e8d8f0 50%, #d8d8f0 100%)', text: '#1a1828', accent: '#5a407a' },
    { bg: 'linear-gradient(135deg, #c8e0d0 0%, #d8e8d8 50%, #c8e0d0 100%)', text: '#182820', accent: '#406a50' },
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
        .impressionism-container {
          font-family: 'Georgia', 'CustomPreviewFont', serif;
          background: linear-gradient(180deg, #e8f0f4 0%, #f0e8dc 50%, #e4ece8 100%);
          color: #1a2830;
          position: relative;
          overflow: hidden;
        }
        .impressionism-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Ccircle cx='50' cy='50' r='2'/%3E%3Ccircle cx='25' cy='25' r='1.5'/%3E%3Ccircle cx='75' cy='75' r='1.5'/%3E%3Ccircle cx='75' cy='25' r='1'/%3E%3Ccircle cx='25' cy='75' r='1'/%3E%3C/g%3E%3C/svg%3E");
          pointer-events: none;
        }
        .impressionism-title {
          font-weight: 500;
          color: #1a2830;
          letter-spacing: 0.05em;
          line-height: 1.3;
          position: relative;
          z-index: 10;
          font-style: italic;
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
          background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%);
          pointer-events: none;
        }
        .card-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(0,0,0,0.15);
        }
        .light-spot {
          position: absolute;
          top: -20px;
          right: -20px;
          width: 60px;
          height: 60px;
          background: radial-gradient(ellipse, rgba(255,255,255,0.4) 0%, transparent 70%);
          border-radius: 50%;
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
        className="impressionism-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
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
            <h1 ref={titleRef} className="text-center impressionism-title">
              {data.mainTitle}
            </h1>
            <div style={{ width: '100px', height: '2px', background: 'linear-gradient(90deg, transparent, rgba(45,90,106,0.4), transparent)', marginTop: '16px' }}></div>
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
                const color = impressionColors[idx % impressionColors.length];
                return (
                <div
                  key={idx}
                  data-card-item="true"
                  className={`card-item flex flex-col ${layout.cardWidthClass}`}
                  style={{
                    background: color.bg,
                    borderRadius: '4px',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
                    border: 'none',
                    padding: layout.cardPadding
                  }}
                >
                  <div className="light-spot"></div>
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

export const impressionismTemplate: TemplateConfig = {
  id: 'impressionism',
  name: '印象派',
  description: '光色瞬间的印象派风格，短笔触并置、弱轮廓、色彩写光',
  icon: 'palette',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <Impressionism data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'impressionism'),
};

export { Impressionism };
