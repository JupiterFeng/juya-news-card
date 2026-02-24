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

interface WoodblockPrintProps {
  data: GeneratedContent;
  scale: number;
}

const WoodblockPrint: React.FC<WoodblockPrintProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';
  const nianhuaColors = [
    { bg: '#fef8f0', border: '#c44230', text: '#1a1a1a', accent: '#c44230', pattern: '#e8c8a0' },
    { bg: '#fff8ed', border: '#d45038', text: '#1a1a1a', accent: '#d45038', pattern: '#f0d8b0' },
    { bg: '#fefaf2', border: '#b83820', text: '#1a1a1a', accent: '#b83820', pattern: '#f8e8c0' },
    { bg: '#fef5eb', border: '#c84830', text: '#1a1a1a', accent: '#c84830', pattern: '#f0d0a0' },
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
      <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@500;700;900&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .woodblock-container {
          font-family: 'Noto Serif SC', 'CustomPreviewFont', serif;
          background: #f5f0e8;
          color: #1a1a1a;
          position: relative;
          overflow: hidden;
        }
        .woodblock-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='28' y='28' width='4' height='4' fill='%23c44230' fill-opacity='0.1'/%3E%3Ccircle cx='30' cy='10' r='2' fill='%23c44230' fill-opacity='0.08'/%3E%3Ccircle cx='10' cy='30' r='2' fill='%23c44230' fill-opacity='0.08'/%3E%3Ccircle cx='50' cy='30' r='2' fill='%23c44230' fill-opacity='0.08'/%3E%3Ccircle cx='30' cy='50' r='2' fill='%23c44230' fill-opacity='0.08'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .woodblock-title {
          font-weight: 900;
          color: #1a1a1a;
          letter-spacing: 0.15em;
          line-height: 1.3;
          position: relative;
          z-index: 10;
        }
        .card-item {
          transition: all 0.2s ease;
          position: relative;
          z-index: 5;
        }
        .card-item:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0 rgba(196, 66, 48, 0.3);
        }
        .auspicious-symbol {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 24px;
          height: 24px;
          background: #c44230;
          color: #fef8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          border-radius: 2px;
        }
        .border-pattern {
          position: absolute;
          inset: 4px;
          border: 1px solid rgba(196, 66, 48, 0.3);
          pointer-events: none;
        }
        .content-scale {
          transform-origin: center center;
        }
      `}</style>

      <div
        ref={mainRef}
        className="woodblock-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
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
                width: '200px',
                height: '4px',
                background: 'repeating-linear-gradient(90deg, #c44230 0px, #c44230 8px, transparent 8px, transparent 16px)',
                marginBottom: '20px',
              }}
            ></div>
            <h1 ref={titleRef} className="text-center woodblock-title">
              {data.mainTitle}
            </h1>
            <div
              style={{
                width: '200px',
                height: '4px',
                background: 'repeating-linear-gradient(90deg, #c44230 0px, #c44230 8px, transparent 8px, transparent 16px)',
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
                boxSizing: 'border-box',
              } as React.CSSProperties}
            >
              {data.cards.map((card, idx) => {
                const colors = nianhuaColors[idx % nianhuaColors.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: colors.bg,
                      border: `3px solid ${colors.border}`,
                      borderRadius: '0',
                      boxShadow: '4px 4px 0 rgba(196, 66, 48, 0.2)',
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="auspicious-symbol">吉</div>
                    <div className="border-pattern"></div>
                    <div className="card-header flex items-center gap-3 mb-4">
                      <span
                        className="js-icon material-symbols-rounded"
                        style={{ color: colors.accent, fontSize: layout.iconSize }}
                      >
                        {card.icon}
                      </span>
                      <h3
                        className={`js-title font-bold leading-tight ${layout.titleSizeClass}`}
                        style={{ color: colors.text, fontFamily: "'Noto Serif SC', serif" }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-medium leading-relaxed ${layout.descSizeClass}`}
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

export const woodblockPrintTemplate: TemplateConfig = {
  id: 'woodblockPrint',
  name: '木版年画',
  description: '平涂强符号的木版年画风格，轮廓鲜明、吉祥图案',
  icon: 'style',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <WoodblockPrint data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'woodblockPrint'),
};

export { WoodblockPrint };
