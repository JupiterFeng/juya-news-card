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

interface WatercolorStyleProps {
  data: GeneratedContent;
  scale: number;
}

const WatercolorStyle: React.FC<WatercolorStyleProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const watercolorColors = [
    { bg: 'linear-gradient(135deg, rgba(255,182,193,0.7) 0%, rgba(255,218,225,0.6) 100%)', text: '#4a3a40', accent: '#c87a8a' },
    { bg: 'linear-gradient(135deg, rgba(135,206,250,0.7) 0%, rgba(173,216,230,0.6) 100%)', text: '#3a404a', accent: '#7a9ac8' },
    { bg: 'linear-gradient(135deg, rgba(175,238,238,0.7) 0%, rgba(200,255,255,0.6) 100%)', text: '#3a4544', accent: '#7ac0c0' },
    { bg: 'linear-gradient(135deg, rgba(221,160,221,0.7) 0%, rgba(230,190,230,0.6) 100%)', text: '#443a4a', accent: '#a87aa8' },
    { bg: 'linear-gradient(135deg, rgba(255,255,224,0.7) 0%, rgba(255,250,205,0.6) 100%)', text: '#44443a', accent: '#c0c07a' },
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
      <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .watercolor-container {
          font-family: 'Caveat', 'CustomPreviewFont', cursive;
          background: linear-gradient(180deg, #fef9f5 0%, #faf5f0 50%, #fef9f5 100%);
          color: #4a3a40;
          position: relative;
          overflow: hidden;
        }
        .watercolor-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='watercolor'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.02' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23watercolor)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .watercolor-title {
          font-weight: 500;
          color: #4a3a40;
          letter-spacing: 0.05em;
          line-height: 1.4;
          position: relative;
          z-index: 10;
        }
        .card-item {
          transition: all 0.4s ease;
          position: relative;
          z-index: 5;
          backdrop-filter: blur(10px);
        }
        .card-item::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at top left, rgba(255,255,255,0.4) 0%, transparent 50%);
          border-radius: 8px;
          pointer-events: none;
        }
        .card-item:hover {
          transform: translateY(-2px) scale(1.01);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }
        .water-mark {
          position: absolute;
          bottom: 15px;
          left: 15px;
          width: 30px;
          height: 30px;
          opacity: 0.2;
          pointer-events: none;
        }
        .paint-drip {
          position: absolute;
          top: -3px;
          right: 20px;
          width: 8px;
          height: 20px;
          background: linear-gradient(180deg, rgba(255,182,193,0.5) 0%, transparent 100%);
          border-radius: 0 0 4px 4px;
          pointer-events: none;
        }
        .content-scale {
          transform-origin: center center;
        }
      `}</style>

      <div
        ref={mainRef}
        className="watercolor-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
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
            <svg width="120" height="30" viewBox="0 0 120 30" style={{ marginBottom: '16px', opacity: 0.4 }}>
              <ellipse cx="20" cy="15" rx="15" ry="8" fill="none" stroke="#4a3a40" strokeWidth="1" />
              <ellipse cx="60" cy="15" rx="20" ry="10" fill="none" stroke="#4a3a40" strokeWidth="1" />
              <ellipse cx="100" cy="15" rx="15" ry="8" fill="none" stroke="#4a3a40" strokeWidth="1" />
            </svg>
            <h1 ref={titleRef} className="text-center watercolor-title">
              {data.mainTitle}
            </h1>
            <svg width="120" height="30" viewBox="0 0 120 30" style={{ marginTop: '16px', opacity: 0.4 }}>
              <path d="M10 15 Q30 10, 50 15 T90 15" stroke="#4a3a40" strokeWidth="1.5" fill="none" />
              <path d="M30 20 Q50 15, 70 20 T110 20" stroke="#4a3a40" strokeWidth="1" fill="none" />
            </svg>
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
                const color = watercolorColors[idx % watercolorColors.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      background: color.bg,
                      borderRadius: '8px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                      border: '1px solid rgba(255,255,255,0.5)',
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="paint-drip"></div>
                    <svg className="water-mark" viewBox="0 0 30 30">
                      <circle cx="15" cy="15" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                      <path d="M15 5 L15 10" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <div className="card-header flex items-center gap-3 mb-4">
                      <span className="js-icon material-symbols-rounded" style={{ color: color.accent, fontSize: layout.iconSize }}>
                        {card.icon}
                      </span>
                      <h3
                        className={`js-title font-normal leading-tight ${layout.titleSizeClass}`}
                        style={{ color: color.text, fontFamily: "'Caveat', 'Georgia', cursive" }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-light leading-relaxed ${layout.descSizeClass}`}
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

export const watercolorStyleTemplate: TemplateConfig = {
  id: 'watercolorStyle',
  name: '水彩风格',
  description: '透明叠色边缘水痕的水彩风格，适合温柔氛围',
  icon: 'water_drop',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <WatercolorStyle data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'watercolorStyle'),
};

export { WatercolorStyle };
