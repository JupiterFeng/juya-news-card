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

interface PopArtProps {
  data: GeneratedContent;
  scale: number;
}

const PopArt: React.FC<PopArtProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';
  const popArtColors = [
    { bg: '#ff0040', text: '#ffffff', accent: '#ffffff', halftone: 'rgba(255,255,255,0.15)' },
    { bg: '#00e0ff', text: '#1a1a1a', accent: '#ffffff', halftone: 'rgba(0,0,0,0.1)' },
    { bg: '#ffe600', text: '#1a1a1a', accent: '#1a1a1a', halftone: 'rgba(0,0,0,0.08)' },
    { bg: '#ff00ff', text: '#ffffff', accent: '#ffffff', halftone: 'rgba(255,255,255,0.12)' },
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
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700;900&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .popart-container {
          font-family: 'Roboto', 'CustomPreviewFont', sans-serif;
          background: #f0f0f0;
          color: #1a1a1a;
          position: relative;
          overflow: hidden;
        }
        .popart-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='3' cy='3' r='1.5' fill='%23000000' fill-opacity='0.08'/%3E%3Ccircle cx='9' cy='9' r='1.5' fill='%23000000' fill-opacity='0.08'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .popart-title {
          font-weight: 900;
          color: #1a1a1a;
          letter-spacing: 0.05em;
          line-height: 1.1;
          position: relative;
          z-index: 10;
          text-transform: uppercase;
          -webkit-text-stroke: 2px #1a1a1a;
          text-shadow: 4px 4px 0 #ff0040, -2px -2px 0 #00e0ff;
        }
        .card-item {
          transition: all 0.2s ease;
          position: relative;
          z-index: 5;
        }
        .card-item::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='8' height='8' viewBox='0 0 8 8' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='rgba(255,255,255,0.2)'/%3E%3Ccircle cx='6' cy='6' r='1' fill='rgba(0,0,0,0.1)'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .card-item:hover {
          transform: translate(-4px, -4px);
          box-shadow: 12px 12px 0 rgba(0,0,0,0.4);
        }
        .halftone-accent {
          position: absolute;
          bottom: 10px;
          left: 10px;
          width: 35px;
          height: 35px;
          background-image: radial-gradient(circle, rgba(0,0,0,0.3) 1px, transparent 1px);
          background-size: 4px 4px;
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
        className="popart-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
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
            <h1 ref={titleRef} className="text-center popart-title">
              {data.mainTitle}
            </h1>
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
                const color = popArtColors[idx % popArtColors.length];
                return (
                <div
                  key={idx}
                  data-card-item="true"
                  className={`card-item flex flex-col ${layout.cardWidthClass}`}
                  style={{
                    backgroundColor: color.bg,
                    borderRadius: '0',
                    boxShadow: '8px 8px 0 rgba(0,0,0,0.3)',
                    border: '4px solid #000',
                    padding: layout.cardPadding
                  }}
                >
                  <div className="halftone-accent"></div>
                  <div className="card-header flex items-center gap-3 mb-4">
                    <span className="js-icon material-symbols-rounded" style={{ color: color.accent, fontSize: layout.iconSize }}>
                      {card.icon}
                    </span>
                    <h3 className={`js-title font-black leading-tight ${layout.titleSizeClass}`} style={{ color: color.text, fontFamily: "'Impact', 'Arial Black', sans-serif", textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {card.title}
                    </h3>
                  </div>
                  <p
                    className={`js-desc font-bold leading-relaxed ${layout.descSizeClass}`}
                    style={{ color: color.text }}
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

export const popArtTemplate: TemplateConfig = {
  id: 'popArt',
  name: '波普艺术',
  description: '大众符号平面化的波普风格，商业语言、网点、强轮廓',
  icon: 'stars',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <PopArt data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'popArt'),
};

export { PopArt };
