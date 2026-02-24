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

interface SilkscreenStyleProps {
  data: GeneratedContent;
  scale: number;
}

const SilkscreenStyle: React.FC<SilkscreenStyleProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const silkscreenColors = [
    { bg: '#e63946', text: '#ffffff', accent: '#f1faee' },
    { bg: '#457b9d', text: '#ffffff', accent: '#f1faee' },
    { bg: '#a8dadc', text: '#1d3557', accent: '#1d3557' },
    { bg: '#1d3557', text: '#ffffff', accent: '#f1faee' },
    { bg: '#f4a261', text: '#1d3557', accent: '#ffffff' },
    { bg: '#2a9d8f', text: '#ffffff', accent: '#f1faee' },
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
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Roboto:wght@400;700;900&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .silkscreen-container {
          font-family: 'Bebas Neue', 'CustomPreviewFont', sans-serif;
          background: #f1faee;
          color: #1d3557;
          position: relative;
          overflow: hidden;
        }
        .silkscreen-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='10' y='10' width='20' height='20' fill='%23e63946' fill-opacity='0.15'/%3E%3Crect x='30' y='30' width='25' height='25' fill='%23457b9d' fill-opacity='0.15'/%3E%3Crect x='5' y='40' width='15' height='15' fill='%232a9d8f' fill-opacity='0.15'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .silkscreen-title {
          font-weight: 400;
          color: #1d3557;
          letter-spacing: 0.15em;
          line-height: 1.1;
          position: relative;
          z-index: 10;
          text-transform: uppercase;
        }
        .card-item {
          transition: all 0.2s ease;
          position: relative;
          z-index: 5;
        }
        .card-item::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: rgba(0,0,0,0.3);
        }
        .card-item:hover {
          transform: translate(-2px, -2px);
          box-shadow: 10px 10px 0 rgba(0,0,0,0.25);
        }
        .screen-overlay {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='0.5' fill='rgba(0,0,0,0.1)'/%3E%3Ccircle cx='3' cy='3' r='0.5' fill='rgba(0,0,0,0.08)'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .content-scale {
          transform-origin: center center;
        }
      `}</style>

      <div className="silkscreen-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
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
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
              <div style={{ width: '50px', height: '8px', background: '#e63946' }}></div>
              <div style={{ width: '50px', height: '8px', background: '#457b9d' }}></div>
              <div style={{ width: '50px', height: '8px', background: '#2a9d8f' }}></div>
            </div>
            <h1 ref={titleRef} className="text-center silkscreen-title">
              {data.mainTitle}
            </h1>
            <div style={{ display: 'flex', gap: '6px', marginTop: '16px' }}>
              <div style={{ width: '50px', height: '8px', background: '#2a9d8f' }}></div>
              <div style={{ width: '50px', height: '8px', background: '#f4a261' }}></div>
              <div style={{ width: '50px', height: '8px', background: '#e63946' }}></div>
            </div>
          </div>

          <div className="card-zone flex-none w-full">
            <div
              data-card-zone="true"
              className="w-full flex flex-wrap justify-center content-center gap-5"
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
                const color = silkscreenColors[idx % silkscreenColors.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: color.bg,
                      borderRadius: '0',
                      boxShadow: '0 8px 0 rgba(0,0,0,0.2)',
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="screen-overlay"></div>
                    <div className="card-header flex items-center gap-3 mb-4">
                      <span className="js-icon material-symbols-rounded" style={{ color: color.accent, fontSize: layout.iconSize }}>
                        {card.icon}
                      </span>
                      <h3
                        className={`js-title font-black leading-tight ${layout.titleSizeClass}`}
                        style={{
                          color: color.text,
                          fontFamily: "'Bebas Neue', 'Impact', sans-serif",
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                        }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-bold leading-relaxed ${layout.descSizeClass}`}
                      style={{ color: color.text }}
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


export const silkscreenStyleTemplate: TemplateConfig = {
  id: 'silkscreenStyle',
  name: '丝网印刷',
  description: '色块干净层层套色的丝网风格，大色块构成优先',
  icon: 'layers',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <SilkscreenStyle data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'silkscreenStyle'),
};

export { SilkscreenStyle };
