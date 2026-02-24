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

interface WoodcutStyleProps {
  data: GeneratedContent;
  scale: number;
}

const WoodcutStyle: React.FC<WoodcutStyleProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const woodcutColors = [
    { bg: '#f5f0e8', text: '#1a1a1a', accent: '#2a2a2a' },
    { bg: '#ebe5dc', text: '#1a1a1a', accent: '#3a3a3a' },
    { bg: '#f0ebe0', text: '#1a1a1a', accent: '#252525' },
    { bg: '#e8e2d6', text: '#1a1a1a', accent: '#353535' },
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
      <link href="https://fonts.googleapis.com/css2?family=Rock+Salt&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .woodcut-container {
          font-family: 'Rock Salt', 'CustomPreviewFont', cursive;
          background: #ebe8e0;
          color: #1a1a1a;
          position: relative;
          overflow: hidden;
        }
        .woodcut-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20 L10 18 L15 22 L25 18 L30 22 L40 20' stroke='%231a1a1a' stroke-opacity='0.08' fill='none'/%3E%3Cpath d='M0 25 L10 23 L20 27 L30 23 L40 25' stroke='%231a1a1a' stroke-opacity='0.06' fill='none'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .woodcut-title {
          font-weight: 400;
          color: #1a1a1a;
          letter-spacing: 0.05em;
          line-height: 1.3;
          position: relative;
          z-index: 10;
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
          background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 L5 8 L10 12 L15 8 L20 10' stroke='%23000000' stroke-opacity='0.1' fill='none'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .card-item:hover {
          transform: translate(-2px, -2px);
          box-shadow: 8px 8px 0 rgba(0,0,0,0.2);
        }
        .wood-grain {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: repeating-linear-gradient(
            90deg,
            transparent 0px,
            transparent 3px,
            rgba(0,0,0,0.02) 3px,
            rgba(0,0,0,0.02) 6px
          );
          pointer-events: none;
        }
        .content-scale {
          transform-origin: center center;
        }
      `}</style>

      <div className="woodcut-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
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
            <div style={{ width: '150px', height: '3px', background: '#1a1a1a', marginBottom: '20px' }}></div>
            <h1 ref={titleRef} className="text-center woodcut-title">
              {data.mainTitle}
            </h1>
            <div style={{ width: '150px', height: '3px', background: '#1a1a1a', marginTop: '20px' }}></div>
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
                const color = woodcutColors[idx % woodcutColors.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: color.bg,
                      borderRadius: '0',
                      boxShadow: '0 6px 0 rgba(0,0,0,0.15)',
                      border: '3px solid #1a1a1a',
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="wood-grain"></div>
                    <div className="card-header flex items-center gap-3 mb-4">
                      <span className="js-icon material-symbols-rounded" style={{ color: color.accent, fontSize: layout.iconSize }}>
                        {card.icon}
                      </span>
                      <h3
                        className={`js-title font-black leading-tight ${layout.titleSizeClass}`}
                        style={{ color: color.text, fontFamily: "'Rock Salt', 'Courier New', monospace" }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-medium leading-relaxed ${layout.descSizeClass}`}
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


export const woodcutStyleTemplate: TemplateConfig = {
  id: 'woodcutStyle',
  name: '木刻版画',
  description: '刀痕强黑白对比的木刻风格，剪影压形、粗粝边缘',
  icon: 'content_cut',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <WoodcutStyle data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'woodcutStyle'),
};

export { WoodcutStyle };
