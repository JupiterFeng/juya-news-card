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

interface PainterlyComicProps {
  data: GeneratedContent;
  scale: number;
}

const PainterlyComic: React.FC<PainterlyComicProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';
  const painterlyComicColors = [
    { bg: 'linear-gradient(145deg, #d4a574 0%, #b8956a 50%, #9a7a5a 100%)', text: '#faf8f5', accent: '#e8dcc8' },
    { bg: 'linear-gradient(145deg, #6b8a9a 0%, #5a7a8a 50%, #4a6a7a 100%)', text: '#faf8f5', accent: '#d0e8f0' },
    { bg: 'linear-gradient(145deg, #9a7a8a 0%, #8a6a7a 50%, #7a5a6a 100%)', text: '#faf8f5', accent: '#f0d8e8' },
    { bg: 'linear-gradient(145deg, #7a9a8a 0%, #6a8a7a 50%, #5a7a6a 100%)', text: '#faf8f5', accent: '#d8f0e8' },
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
      <link href="https://fonts.googleapis.com/css2?family=Georgia:wght@400;700;900&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .painterlycomic-container {
          font-family: 'Georgia', 'CustomPreviewFont', serif;
          background: linear-gradient(180deg, #e8e0d8 0%, #f0e8dc 50%, #e8e0d8 100%);
          color: #2a2824;
          position: relative;
          overflow: hidden;
        }
        .painterlycomic-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paintnoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23paintnoise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .painterlycomic-title {
          font-weight: 700;
          color: #2a2824;
          letter-spacing: '0.05em';
          line-height: 1.3;
          position: relative;
          z-index: 10;
          text-shadow: 3px 3px 6px rgba(0,0,0,0.2);
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
          background-image: url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='cardnoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='4' height='4' filter='url(%23cardnoise)' opacity='0.06'/%3E%3C/svg%3E");
          border-radius: 4px;
          pointer-events: none;
        }
        .card-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.25);
        }
        .paint-drip {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 30px;
          height: 8px;
          background: linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%);
          border-radius: 0 0 4px 4px;
          pointer-events: none;
        }
        .cinematic-bar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, rgba(0,0,0,0.3), transparent);
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
        className="painterlycomic-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
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
            <h1 ref={titleRef} className="text-center painterlycomic-title">
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
                const color = painterlyComicColors[idx % painterlyComicColors.length];
                return (
                <div
                  key={idx}
                  data-card-item="true"
                  className={`card-item flex flex-col ${layout.cardWidthClass}`}
                  style={{
                    background: color.bg,
                    borderRadius: '4px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                    padding: layout.cardPadding
                  }}
                >
                  <div className="cinematic-bar"></div>
                  <div className="paint-drip"></div>
                  <div className="card-header flex items-center gap-3 mb-4">
                    <span className="js-icon material-symbols-rounded" style={{ color: color.accent, fontSize: layout.iconSize, filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))' }}>
                      {card.icon}
                    </span>
                    <h3 className={`js-title font-bold leading-tight ${layout.titleSizeClass}`} style={{ color: color.text, fontFamily: "'Georgia', 'Times New Roman', serif", textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                      {card.title}
                    </h3>
                  </div>
                  <p
                    className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
                    style={{ color: color.text, textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}
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

export const painterlyComicTemplate: TemplateConfig = {
  id: 'painterlyComic',
  name: '厚涂漫画',
  description: '更像绘画体积材质强的厚涂漫画风格，镜头感重',
  icon: 'palette',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <PainterlyComic data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'painterlyComic'),
};

export { PainterlyComic };
