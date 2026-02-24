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

interface GhibliStyleProps {
  data: GeneratedContent;
  scale: number;
}

const GhibliStyle: React.FC<GhibliStyleProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';
  const ghibliColors = [
    { bg: 'linear-gradient(135deg, #e8f4e8 0%, #d4ecd8 50%, #c8dcc0 100%)', text: '#2a3a32', accent: '#5a8a6a' },
    { bg: 'linear-gradient(135deg, #f0e8d8 0%, #e8dcc8 50%, #d8d0c0 100%)', text: '#3a322a', accent: '#8a7a5a' },
    { bg: 'linear-gradient(135deg, #e8ecf4 0%, #d8dce8 50%, #c8d0dc 100%)', text: '#2a2e3a', accent: '#5a6a8a' },
    { bg: 'linear-gradient(135deg, #f4f0e8 0%, #ece8d0 50%, #e0dcc8 100%)', text: '#3a362a', accent: '#8a7a6a' },
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
      <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .ghibli-container {
          font-family: 'Quicksand', 'CustomPreviewFont', sans-serif;
          background: linear-gradient(180deg, #f0f8f0 0%, #e8f4e8 30%, #f0e8d8 70%, #e8ecf4 100%);
          color: #2a3a32;
          position: relative;
          overflow: hidden;
        }
        .ghibli-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='30' r='40' fill='%23c8dcc0' fill-opacity='0.2'/%3E%3Ccircle cx='80' cy='70' r='35' fill='%23d8d0c0' fill-opacity='0.15'/%3E%3Ccircle cx='50' cy='50' r='30' fill='%23c8d0dc' fill-opacity='0.1'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .ghibli-title {
          font-weight: 500;
          color: #2a3a32;
          letter-spacing: 0.08em;
          line-height: 1.4;
          position: relative;
          z-index: 10;
        }
        .card-item {
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          position: relative;
          z-index: 5;
          backdrop-filter: blur(5px);
        }
        .card-item::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%);
          border-radius: 8px;
          pointer-events: none;
        }
        .card-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.12);
        }
        .nature-element {
          position: absolute;
          bottom: 15px;
          right: 15px;
          width: 30px;
          height: 30px;
          opacity: 0.3;
          pointer-events: none;
        }
        .cloud-accent {
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 20px;
          background: rgba(255,255,255,0.6);
          border-radius: 20px;
          pointer-events: none;
        }
        .content-scale {
          transform-origin: center center;
        }
      `}</style>

      <div
        ref={mainRef}
        className="ghibli-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
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
            <svg width="60" height="20" viewBox="0 0 60 20" style={{ marginBottom: '12px', opacity: 0.6 }}>
              <ellipse cx="30" cy="10" rx="25" ry="6" fill="none" stroke="#5a8a6a" strokeWidth="1.5"/>
            </svg>
            <h1 ref={titleRef} className="text-center ghibli-title">
              {data.mainTitle}
            </h1>
            <div style={{ width: '80px', height: '2px', background: 'linear-gradient(90deg, transparent, #5a8a6a, transparent)', marginTop: '12px', opacity: 0.4 }}></div>
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
                const color = ghibliColors[idx % ghibliColors.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      background: color.bg,
                      borderRadius: '8px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                      border: '1px solid rgba(0,0,0,0.08)',
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="cloud-accent"></div>
                    <svg className="nature-element" viewBox="0 0 30 30">
                      <circle cx="15" cy="15" r="8" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M15 3 L15 8 M15 22 L15 27 M3 15 L8 15 M22 15 L27 15" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    <div className="card-header flex items-center gap-3 mb-4">
                      <span
                        className="js-icon material-symbols-rounded"
                        style={{ color: color.accent, fontSize: layout.iconSize }}
                      >
                        {card.icon}
                      </span>
                      <h3
                        className={`js-title font-medium leading-tight ${layout.titleSizeClass}`}
                        style={{ color: color.text, fontFamily: "'Quicksand', 'Nunito', sans-serif" }}
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

export const ghibliStyleTemplate: TemplateConfig = {
  id: 'ghibliStyle',
  name: '自然叙事动画',
  description: '自然环境信息量高的叙事动画风格，细节层次清楚、日常动作写实',
  icon: 'nature_people',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <GhibliStyle data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'ghibliStyle'),
};

export { GhibliStyle };
