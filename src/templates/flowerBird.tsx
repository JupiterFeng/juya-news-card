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

interface FlowerBirdProps {
  data: GeneratedContent;
  scale: number;
}

const FlowerBird: React.FC<FlowerBirdProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';
  const flowerBirdColors = [
    { bg: '#fef9f6', border: '#d4a574', text: '#2a2218', accent: '#c45838', flower: '#e8b89c' },
    { bg: '#fcf7f2', border: '#c99a6a', text: '#2a2218', accent: '#b84828', flower: '#f0c8a8' },
    { bg: '#fafaf6', border: '#b89a7a', text: '#262016', accent: '#d46848', flower: '#f8d8b8' },
    { bg: '#fef8f4', border: '#d4aa84', text: '#282018', accent: '#c45030', flower: '#f0c0a0' },
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
      <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;500&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .flowerbird-container {
          font-family: 'Noto Serif SC', 'CustomPreviewFont', serif;
          background: linear-gradient(180deg, #faf9f6 0%, #f5f3ef 50%, #fbf9f4 100%);
          color: #2a2218;
          position: relative;
          overflow: hidden;
        }
        .flowerbird-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='40' cy='40' r='2' fill='%23d4a574' fill-opacity='0.08'/%3E%3Ccircle cx='20' cy='20' r='1' fill='%23c99a6a' fill-opacity='0.06'/%3E%3Ccircle cx='60' cy='60' r='1.5' fill='%23d4aa84' fill-opacity='0.07'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .flowerbird-title {
          font-weight: 400;
          color: #2a2218;
          letter-spacing: 0.25em;
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
          top: 8px;
          left: 8px;
          width: 20px;
          height: 20px;
          background: radial-gradient(ellipse, rgba(196, 88, 56, 0.2) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }
        .card-item:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(212, 165, 116, 0.3);
        }
        .branch-decor {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          opacity: 0.1;
        }
        .content-scale {
          transform-origin: center center;
        }
      `}</style>

      <div
        ref={mainRef}
        className="flowerbird-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
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
            <svg width="60" height="20" viewBox="0 0 60 20" style={{ marginBottom: '12px' }}>
              <path d="M0 10 Q15 5, 30 10 T60 10" stroke="#d4a574" strokeWidth="1" fill="none" opacity="0.6"/>
              <circle cx="30" cy="10" r="3" fill="#c45838" opacity="0.4"/>
            </svg>
            <h1 ref={titleRef} className="text-center flowerbird-title">
              {data.mainTitle}
            </h1>
            <svg width="60" height="20" viewBox="0 0 60 20" style={{ marginTop: '12px' }}>
              <path d="M0 10 Q15 15, 30 10 T60 10" stroke="#d4a574" strokeWidth="1" fill="none" opacity="0.6"/>
              <circle cx="30" cy="10" r="3" fill="#c45838" opacity="0.4"/>
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
                boxSizing: 'border-box',
              } as React.CSSProperties}
            >
              {data.cards.map((card, idx) => {
                const colors = flowerBirdColors[idx % flowerBirdColors.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: colors.bg,
                      border: `1px solid ${colors.border}`,
                      borderRadius: '8px',
                      boxShadow: '0 4px 16px rgba(212, 165, 116, 0.2)',
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="card-header flex items-center gap-3 mb-4">
                      <span
                        className="js-icon material-symbols-rounded"
                        style={{ color: colors.accent, fontSize: layout.iconSize }}
                      >
                        {card.icon}
                      </span>
                      <h3
                        className={`js-title font-normal leading-tight ${layout.titleSizeClass}`}
                        style={{ color: colors.text, fontFamily: "'Noto Serif SC', serif" }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-light leading-relaxed ${layout.descSizeClass}`}
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

export const flowerBirdTemplate: TemplateConfig = {
  id: 'flowerBird',
  name: '花鸟画',
  description: '以生机与格调为重的花鸟风格，笔墨分层、姿态气息',
  icon: 'local_florist',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <FlowerBird data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'flowerBird'),
};

export { FlowerBird };
