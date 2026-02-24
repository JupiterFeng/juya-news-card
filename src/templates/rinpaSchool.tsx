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

interface RinpaSchoolProps {
  data: GeneratedContent;
  scale: number;
}

const RinpaSchool: React.FC<RinpaSchoolProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';
  const rinpaColors = [
    { bg: '#1a1a1a', border: '#d4a84b', text: '#f5f0e8', accent: '#d4a84b' },
    { bg: '#2d2d2d', border: '#c9983a', text: '#f8f5ed', accent: '#c9983a' },
    { bg: '#1f1f1f', border: '#deb050', text: '#faf8f0', accent: '#deb050' },
    { bg: '#252525', border: '#e0b85a', text: '#fcfaf5', accent: '#e0b85a' },
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
        .rinpa-container {
          font-family: 'Noto Serif JP', 'CustomPreviewFont', serif;
          background: linear-gradient(180deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%);
          color: #f5f0e8;
          position: relative;
          overflow: hidden;
        }
        .rinpa-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background:
            radial-gradient(ellipse at 20% 30%, rgba(212, 168, 75, 0.15) 0%, transparent 40%),
            radial-gradient(ellipse at 80% 70%, rgba(201, 152, 58, 0.12) 0%, transparent 45%);
          pointer-events: none;
        }
        .rinpa-container::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 10 L55 30 L75 30 L60 43 L65 63 L50 50 L35 63 L40 43 L25 30 L45 30 Z' fill='none' stroke='%23d4a84b' stroke-opacity='0.08' stroke-width='1'/%3E%3Ccircle cx='50' cy='50' r='15' fill='none' stroke='%23d4a84b' stroke-opacity='0.05' stroke-width='1'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .rinpa-title {
          font-weight: 500;
          color: #f5f0e8;
          letter-spacing: 0.4em;
          line-height: 1.4;
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
          top: 10px;
          left: 10px;
          right: 10px;
          bottom: 10px;
          border: 1px solid rgba(212, 168, 75, 0.3);
          pointer-events: none;
        }
        .card-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(212, 168, 75, 0.4);
        }
        .gold-corner {
          position: absolute;
          top: 0;
          left: 0;
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #d4a84b 0%, transparent 50%);
          pointer-events: none;
        }
        .gold-corner-br {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 20px;
          height: 20px;
          background: linear-gradient(-45deg, #d4a84b 0%, transparent 50%);
          pointer-events: none;
        }
        .nature-motif {
          position: absolute;
          bottom: 15px;
          right: 15px;
          width: 35px;
          height: 35px;
          opacity: 0.3;
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
        className="rinpa-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
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
            <svg width="100" height="30" viewBox="0 0 100 30" style={{ marginBottom: '20px' }}>
              <path d="M0 15 L20 15 L30 10 L40 15 L60 15 L70 10 L80 15 L100 15" stroke="#d4a84b" strokeWidth="2" fill="none" opacity="0.8"/>
              <circle cx="50" cy="15" r="4" fill="#d4a84b"/>
            </svg>
            <h1 ref={titleRef} className="text-center rinpa-title">
              {data.mainTitle}
            </h1>
            <svg width="100" height="30" viewBox="0 0 100 30" style={{ marginTop: '20px' }}>
              <path d="M0 15 L20 15 L30 20 L40 15 L60 15 L70 20 L80 15 L100 15" stroke="#d4a84b" strokeWidth="2" fill="none" opacity="0.8"/>
              <circle cx="50" cy="15" r="4" fill="#d4a84b"/>
            </svg>
          </div>

          <div className="card-zone flex-none w-full">
            <div
              data-card-zone="true"
              className="w-full flex flex-wrap justify-center content-start"
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
                const colors = rinpaColors[idx % rinpaColors.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: colors.bg,
                      border: `2px solid ${colors.border}`,
                      borderRadius: '2px',
                      boxShadow: '0 8px 24px rgba(212, 168, 75, 0.3)',
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="gold-corner"></div>
                    <div className="gold-corner-br"></div>
                    <svg className="nature-motif" viewBox="0 0 35 35">
                      <circle cx="17.5" cy="17.5" r="8" fill="none" stroke="#d4a84b" strokeWidth="1.5"/>
                      <path d="M17.5 5 L17.5 12 M17.5 23 L17.5 30 M5 17.5 L12 17.5 M23 17.5 L30 17.5" stroke="#d4a84b" strokeWidth="1.5"/>
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
                      style={{ color: colors.text, opacity: '0.9' }}
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

export const rinpaSchoolTemplate: TemplateConfig = {
  id: 'rinpaSchool',
  name: '琳派',
  description: '装饰屏风美学的琳派风格，大构成、金地留白、图案化自然母题',
  icon: 'auto_awesome',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <RinpaSchool data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'rinpaSchool'),
};

export { RinpaSchool };
