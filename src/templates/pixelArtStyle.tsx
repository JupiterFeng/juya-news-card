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

interface PixelArtStyleProps {
  data: GeneratedContent;
  scale: number;
}

const PixelArtStyle: React.FC<PixelArtStyleProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const pixelColors = [
    { bg: '#1a1c2c', text: '#f4f4f4', accent: '#ff0044' },
    { bg: '#5d275d', text: '#f4f4f4', accent: '#ffcc00' },
    { bg: '#b13e53', text: '#f4f4f4', accent: '#ef7d57' },
    { bg: '#ef7d57', text: '#1a1c2c', accent: '#ffcd75' },
    { bg: '#ffcd75', text: '#1a1c2c', accent: '#a7f070' },
    { bg: '#38b764', text: '#f4f4f4', accent: '#257179' },
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
      <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .pixelart-container {
          font-family: 'Press Start 2P', 'CustomPreviewFont', monospace;
          background: #0f0f23;
          color: #f4f4f4;
          position: relative;
          overflow: hidden;
        }
        .pixelart-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0' y='0' width='4' height='4' fill='%231a1c2c'/%3E%3Crect x='8' y='8' width='4' height='4' fill='%231a1c2c'/%3E%3Crect x='4' y='12' width='4' height='4' fill='%23152838'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .pixel-title {
          font-weight: 400;
          color: #f4f4f4;
          letter-spacing: 0.1em;
          line-height: 1.4;
          position: relative;
          z-index: 10;
          text-transform: uppercase;
          text-shadow: 4px 4px 0 #1a1c2c;
        }
        .card-item {
          transition: all 0.1s ease;
          position: relative;
          z-index: 5;
          image-rendering: pixelated;
        }
        .card-item:hover {
          transform: translate(-2px, -2px);
          box-shadow: 8px 8px 0 rgba(0,0,0,0.4) !important;
        }
        .pixel-corner {
          position: absolute;
          top: 0;
          right: 0;
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 0 16px 16px 0;
          border-color: transparent rgba(255,255,255,0.3) transparent transparent;
          pointer-events: none;
        }
        .star-particle {
          position: absolute;
          top: 10px;
          left: 10px;
          width: 8px;
          height: 8px;
          background: #ff0044;
          box-shadow: 0 0 4px #ff0044;
          pointer-events: none;
        }
        .content-scale {
          transform-origin: center center;
        }
      `}</style>

      <div
        ref={mainRef}
        className="pixelart-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
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
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <div style={{ width: '12px', height: '12px', background: '#ff0044' }}></div>
              <div style={{ width: '12px', height: '12px', background: '#ffcc00' }}></div>
              <div style={{ width: '12px', height: '12px', background: '#00ff99' }}></div>
              <div style={{ width: '12px', height: '12px', background: '#00ccff' }}></div>
            </div>
            <h1 ref={titleRef} className="text-center pixel-title">
              {data.mainTitle}
            </h1>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <div style={{ width: '12px', height: '12px', background: '#00ccff' }}></div>
              <div style={{ width: '12px', height: '12px', background: '#00ff99' }}></div>
              <div style={{ width: '12px', height: '12px', background: '#ffcc00' }}></div>
              <div style={{ width: '12px', height: '12px', background: '#ff0044' }}></div>
            </div>
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
                const color = pixelColors[idx % pixelColors.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: color.bg,
                      borderRadius: '0',
                      boxShadow: '6px 6px 0 rgba(0,0,0,0.3)',
                      border: '4px solid #000',
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="pixel-corner"></div>
                    <div className="star-particle"></div>
                    <div className="card-header flex items-center gap-3 mb-4">
                      <span className="js-icon material-symbols-rounded" style={{ color: color.accent, fontSize: layout.iconSize }}>
                        {card.icon}
                      </span>
                      <h3
                        className={`js-title font-bold leading-tight ${layout.titleSizeClass}`}
                        style={{ color: color.text, fontFamily: "'Press Start 2P', 'Courier New', monospace" }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
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

export const pixelArtStyleTemplate: TemplateConfig = {
  id: 'pixelArtStyle',
  name: '像素艺术',
  description: '网格有限色板的像素风格，适合复古与游戏感',
  icon: 'grid_on',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <PixelArtStyle data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'pixelArtStyle'),
};

export { PixelArtStyle };
