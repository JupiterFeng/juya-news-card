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

interface MidCenturyModernProps {
  data: GeneratedContent;
  scale: number;
}

const MidCenturyModern: React.FC<MidCenturyModernProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const midCenturyColors = [
    { bg: '#F4E8D8', onBg: '#1A1510', accent: '#E67E50' },
    { bg: '#E8DDD0', onBg: '#1A1916', accent: '#5DA862' },
    { bg: '#D4C5B0', onBg: '#151412', accent: '#4A90A4' },
    { bg: '#E5DAC8', onBg: '#1C1813', accent: '#D4A574' },
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
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@400;500&family=Noto+Sans+SC:wght@400;500&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'Inter', 'Noto Sans SC', 'CustomPreviewFont', system-ui, sans-serif;
          background-color: #ede8e0;
          color: #1a1510;
        }
        .midcentury-title {
          font-weight: 600;
          color: #1a1510;
          letter-spacing: -0.02em;
          line-height: 1.2;
          font-family: 'Playfair Display', 'Georgia', serif;
        }
        .card-item {
          border: none;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 0 rgba(0,0,0,0.1), 0 12px 30px rgba(0,0,0,0.12);
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .content-scale { transform-origin: center center; }
      `}</style>

      <div
        ref={mainRef}
        className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-24 box-border content-scale z-10"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}
        >
          <div className="flex flex-col items-center">
            <h1 ref={titleRef} className="text-center midcentury-title">
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
                const color = midCenturyColors[idx % midCenturyColors.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: color.bg,
                      borderRadius: '12px',
                      boxShadow: '0 2px 0 rgba(0,0,0,0.1), 0 6px 20px rgba(0,0,0,0.08)',
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="card-header flex items-center gap-4 mb-4">
                      <span
                        className="js-icon material-symbols-rounded"
                        style={{
                          color: color.accent,
                          fontSize: layout.iconSize,
                          fontVariationSettings: "'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24",
                        }}
                      >
                        {card.icon}
                      </span>
                      <h3
                        className={`js-title font-semibold leading-tight ${layout.titleSizeClass}`}
                        style={{
                          color: color.onBg,
                          fontFamily: "'Playfair Display', 'Georgia', serif",
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
                      style={{
                        color: color.onBg,
                        opacity: '0.8',
                        fontFamily: "'Inter', 'Noto Sans SC', system-ui, sans-serif",
                      }}
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

export const midCenturyModernTemplate: TemplateConfig = {
  id: 'midCenturyModern',
  name: '中世纪现代',
  description: '20世纪中叶的友好功能主义，有机曲线与轻快色彩',
  icon: 'chair',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <MidCenturyModern data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'midCenturyModern'),
};

export { MidCenturyModern };
