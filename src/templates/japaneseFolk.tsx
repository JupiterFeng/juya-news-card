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

interface JapaneseFolkProps {
  data: GeneratedContent;
  scale: number;
}

const JapaneseFolk: React.FC<JapaneseFolkProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';
  const japanFolkColors = [
    { bg: '#fff8f0', border: '#d4a068', text: '#2a2418', accent: '#c45838', pattern: '#e8c898' },
    { bg: '#faf5ed', border: '#c89860', text: '#2a2418', accent: '#a04028', pattern: '#f0d8a8' },
    { bg: '#fefaf2', border: '#dca870', text: '#2a2418', accent: '#b84830', pattern: '#f8e0b0' },
    { bg: '#fcf8f0', border: '#d0a068', text: '#2a2418', accent: '#c05038', pattern: '#f5d8a0' },
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
      <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500;600&family=Noto+Serif+SC:wght@400;500&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .japanfolk-container {
          font-family: 'Noto Serif JP', 'CustomPreviewFont', serif;
          background: linear-gradient(180deg, #faf8f4 0%, #f5f0e8 50%, #faf8f4 100%);
          color: #2a2418;
          position: relative;
          overflow: hidden;
        }
        .japanfolk-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='2' fill='%23d4a068' fill-opacity='0.08'/%3E%3Cpath d='M10 30 Q30 20 50 30' stroke='%23d4a068' stroke-opacity='0.05' fill='none'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .japanfolk-title {
          font-weight: 500;
          color: #2a2418;
          letter-spacing: 0.2em;
          line-height: 1.5;
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
          top: 0;
          left: 0;
          width: 100%;
          height: 6px;
          background: linear-gradient(90deg, rgba(196, 88, 56, 0.3) 0%, rgba(196, 88, 56, 0.1) 50%, rgba(196, 88, 56, 0.3) 100%);
        }
        .card-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(212, 160, 104, 0.3);
        }
        .wave-pattern {
          position: absolute;
          bottom: 12px;
          right: 12px;
          width: 40px;
          height: 20px;
          opacity: 0.4;
          pointer-events: none;
        }
        .seal-red {
          position: absolute;
          top: -6px;
          right: -6px;
          width: 20px;
          height: 20px;
          background: #c45838;
          border-radius: 2px;
          opacity: 0.9;
          pointer-events: none;
        }
        .content-scale {
          transform-origin: center center;
        }
      `}</style>

      <div
        ref={mainRef}
        className="japanfolk-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
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
            <svg width="120" height="28" viewBox="0 0 120 28" style={{ marginBottom: '16px' }}>
              <path d="M0 14 L20 14 L30 10 L40 14 L60 14 L70 10 L80 14 L100 14 L110 10 L120 14" stroke="#d4a068" strokeWidth="2" fill="none" opacity="0.6"/>
            </svg>
            <h1 ref={titleRef} className="text-center japanfolk-title">
              {data.mainTitle}
            </h1>
            <svg width="120" height="28" viewBox="0 0 120 28" style={{ marginTop: '16px' }}>
              <path d="M0 14 L20 14 L30 18 L40 14 L60 14 L70 18 L80 14 L100 14 L110 18 L120 14" stroke="#d4a068" strokeWidth="2" fill="none" opacity="0.6"/>
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
                const colors = japanFolkColors[idx % japanFolkColors.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: colors.bg,
                      border: `2px solid ${colors.border}`,
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(212, 160, 104, 0.2)',
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="seal-red"></div>
                    <svg className="wave-pattern" viewBox="0 0 40 20">
                      <path d="M0 10 Q10 5, 20 10 T40 10" stroke="#d4a068" strokeWidth="1.5" fill="none"/>
                      <path d="M0 14 Q10 9, 20 14 T40 14" stroke="#d4a068" strokeWidth="1" fill="none" opacity="0.6"/>
                    </svg>
                    <div className="card-header flex items-center gap-3 mb-4">
                      <span
                        className="js-icon material-symbols-rounded"
                        style={{ color: colors.accent, fontSize: layout.iconSize }}
                      >
                        {card.icon}
                      </span>
                      <h3
                        className={`js-title font-medium leading-tight ${layout.titleSizeClass}`}
                        style={{ color: colors.text, fontFamily: "'Noto Serif JP', 'Noto Serif SC', serif" }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
                      style={{ color: colors.text, opacity: '0.85' }}
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

export const japaneseFolkTemplate: TemplateConfig = {
  id: 'japaneseFolk',
  name: '和风插画',
  description: '复古配色、图案纹样的和风插画风格，大正浪漫感、柔和怀旧',
  icon: 'waves',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <JapaneseFolk data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'japaneseFolk'),
};

export { JapaneseFolk };
