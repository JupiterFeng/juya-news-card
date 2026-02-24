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

interface PainterlyStyleProps {
  data: GeneratedContent;
  scale: number;
}

const PainterlyStyle: React.FC<PainterlyStyleProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const painterlyColors = [
    { bg: 'linear-gradient(145deg, #8b7355 0%, #a08060 50%, #8b7355 100%)', text: '#faf8f5', accent: '#e8dcc8' },
    { bg: 'linear-gradient(145deg, #6b8a9a 0%, #80a0b0 50%, #6b8a9a 100%)', text: '#faf8f5', accent: '#d0e8f0' },
    { bg: 'linear-gradient(145deg, #9a7a8a 0%, #b090a0 50%, #9a7a8a 100%)', text: '#faf8f5', accent: '#f0d8e8' },
    { bg: 'linear-gradient(145deg, #7a9a8a 0%, #90b0a0 50%, #7a9a8a 100%)', text: '#faf8f5', accent: '#d8f0e8' },
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
      <link href="https://fonts.googleapis.com/css2?family=Georgia:wght@400;500;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .painterly-container {
          font-family: 'Georgia', 'CustomPreviewFont', serif;
          background: linear-gradient(180deg, #e8e0d8 0%, #f0e8dc 50%, #e8e0d8 100%);
          color: #2a2824;
          position: relative;
          overflow: hidden;
        }
        .painterly-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .painterly-title {
          font-weight: 500;
          color: #2a2824;
          letter-spacing: 0.08em;
          line-height: 1.4;
          position: relative;
          z-index: 10;
        }
        .card-item {
          transition: all 0.3s ease;
          position: relative;
          z-index: 5;
        }
        .card-item::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise2'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='4' height='4' filter='url(%23noise2)' opacity='0.08'/%3E%3C/svg%3E");
          border-radius: 4px;
          pointer-events: none;
        }
        .card-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.25);
        }
        .brush-stroke {
          position: absolute;
          top: -5px;
          left: -5px;
          width: calc(100% + 10px);
          height: calc(100% + 10px);
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 6px;
          pointer-events: none;
        }
        .content-scale {
          transform-origin: center center;
        }
      `}</style>

      <div
        ref={mainRef}
        className="painterly-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
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
            <h1 ref={titleRef} className="text-center painterly-title">
              {data.mainTitle}
            </h1>
            <div style={{ width: '80px', height: '3px', background: 'linear-gradient(90deg, transparent, #8b7355, transparent)', marginTop: '16px', borderRadius: '2px' }}></div>
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
                const color = painterlyColors[idx % painterlyColors.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      background: color.bg,
                      borderRadius: '4px',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="brush-stroke"></div>
                    <div className="card-header flex items-center gap-3 mb-4">
                      <span className="js-icon material-symbols-rounded" style={{ color: color.accent, fontSize: layout.iconSize }}>
                        {card.icon}
                      </span>
                      <h3
                        className={`js-title font-medium leading-tight ${layout.titleSizeClass}`}
                        style={{ color: color.text, fontFamily: "'Georgia', 'Times New Roman', serif" }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
                      style={{ color: color.text, opacity: '0.95' }}
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

export const painterlyStyleTemplate: TemplateConfig = {
  id: 'painterlyStyle',
  name: '厚涂风格',
  description: '笔触塑形材质真实的厚涂风格，适合概念插画',
  icon: 'brush',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <PainterlyStyle data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'painterlyStyle'),
};

export { PainterlyStyle };
