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

interface UkiyoPrintProps {
  data: GeneratedContent;
  scale: number;
}

const UkiyoPrint: React.FC<UkiyoPrintProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';
  const ukiyoColors = [
    { bg: '#f5ebe0', border: '#1a1a1a', text: '#1a1a1a', accent: '#c84028', pattern: '#e8d0b8' },
    { bg: '#fff8ed', border: '#1a1a1a', text: '#1a1a1a', accent: '#a03018', pattern: '#f0e0c8' },
    { bg: '#f8f0e4', border: '#1a1a1a', text: '#1a1a1a', accent: '#d85038', pattern: '#f8e8d0' },
    { bg: '#fcf4e8', border: '#1a1a1a', text: '#1a1a1a', accent: '#b83820', pattern: '#f5e0c8' },
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
      <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@500;700;900&family=Noto+Serif+SC:wght@500;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .ukiyo-container {
          font-family: 'Noto Serif JP', 'CustomPreviewFont', serif;
          background: #f8f0e4;
          color: #1a1a1a;
          position: relative;
          overflow: hidden;
        }
        .ukiyo-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='40' cy='40' r='20' fill='none' stroke='%231a1a1a' stroke-opacity='0.05' stroke-width='1'/%3E%3Ccircle cx='0' cy='0' r='8' fill='%231a1a1a' fill-opacity='0.04'/%3E%3Ccircle cx='80' cy='80' r='8' fill='%231a1a1a' fill-opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .ukiyo-title {
          font-weight: 900;
          color: #1a1a1a;
          letter-spacing: 0.2em;
          line-height: 1.3;
          position: relative;
          z-index: 10;
        }
        .card-item {
          transition: all 0.2s ease;
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
          height: 8px;
          background: repeating-linear-gradient(
            90deg,
            #1a1a1a 0px,
            #1a1a1a 4px,
            transparent 4px,
            transparent 8px
          );
        }
        .card-item::after {
          content: '';
          position: absolute;
          bottom: 0;
          right: 0;
          width: 100%;
          height: 8px;
          background: repeating-linear-gradient(
            90deg,
            #1a1a1a 0px,
            #1a1a1a 4px,
            transparent 4px,
            transparent 8px
          );
        }
        .card-item:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0 rgba(26, 26, 26, 0.25);
        }
        .pattern-block {
          position: absolute;
          bottom: 12px;
          right: 12px;
          width: 40px;
          height: 40px;
          background-image: repeating-linear-gradient(
            45deg,
            rgba(200, 64, 40, 0.2) 0px,
            rgba(200, 64, 40, 0.2) 2px,
            transparent 2px,
            transparent 6px
          );
          pointer-events: none;
        }
        .content-scale {
          transform-origin: center center;
        }
      `}</style>

      <div
        ref={mainRef}
        className="ukiyo-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
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
            <div
              style={{
                width: '180px',
                height: '3px',
                background: '#1a1a1a',
                marginBottom: '20px',
              }}
            ></div>
            <h1 ref={titleRef} className="text-center ukiyo-title">
              {data.mainTitle}
            </h1>
            <div
              style={{
                width: '180px',
                height: '3px',
                background: '#1a1a1a',
                marginTop: '20px',
              }}
            ></div>
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
                const colors = ukiyoColors[idx % ukiyoColors.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: colors.bg,
                      border: `3px solid ${colors.border}`,
                      borderRadius: '0',
                      boxShadow: '4px 4px 0 rgba(26, 26, 26, 0.15)',
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="pattern-block"></div>
                    <div className="card-header flex items-center gap-3 mb-4">
                      <span
                        className="js-icon material-symbols-rounded"
                        style={{ color: colors.accent, fontSize: layout.iconSize }}
                      >
                        {card.icon}
                      </span>
                      <h3
                        className={`js-title font-bold leading-tight ${layout.titleSizeClass}`}
                        style={{ color: colors.text, fontFamily: "'Noto Serif JP', 'Noto Serif SC', serif" }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
                      style={{ color: colors.text }}
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

export const ukiyoPrintTemplate: TemplateConfig = {
  id: 'ukiyoPrint',
  name: '浮世绘',
  description: '明确轮廓线、平涂色块、大胆裁切的浮世绘风格，平面设计语言',
  icon: 'brush',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <UkiyoPrint data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'ukiyoPrint'),
};

export { UkiyoPrint };
