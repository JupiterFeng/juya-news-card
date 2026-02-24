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

interface HeavyInkProps {
  data: GeneratedContent;
  scale: number;
}

const HeavyInk: React.FC<HeavyInkProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';
  const heavyInkColors = [
    { bg: '#1a1a1a', text: '#ffffff', accent: '#ffffff', highlight: '#ff4444' },
    { bg: '#2a2a2a', text: '#f0f0f0', accent: '#f0f0f0', highlight: '#ff6666' },
    { bg: '#0a0a0a', text: '#ffffff', accent: '#e0e0e0', highlight: '#ff3333' },
    { bg: '#1f1f1f', text: '#ffffff', accent: '#ffffff', highlight: '#ff5555' },
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
      <link href="https://fonts.googleapis.com/css2?family=Bangers&family=Roboto:wght@400;700;900&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .heavyink-container {
          font-family: 'Bangers', 'CustomPreviewFont', cursive;
          background: #0a0a0a;
          color: #ffffff;
          position: relative;
          overflow: hidden;
        }
        .heavyink-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20 L20 0 L40 20 L20 40 Z' fill='none' stroke='%23ffffff' stroke-opacity='0.03'/%3E%3Cpath d='M10 10 L30 30' stroke='%23ffffff' stroke-opacity='0.02'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .heavyink-title {
          font-weight: 400;
          color: #ffffff;
          letter-spacing: 0.05em;
          line-height: 1.2;
          position: relative;
          z-index: 10;
          text-transform: uppercase;
          text-shadow: 4px 4px 0 rgba(0,0,0,0.8);
        }
        .card-item {
          transition: all 0.2s ease;
          position: relative;
          z-index: 5;
        }
        .card-item::after {
          content: '';
          position: absolute;
          inset: 3px;
          border: 2px solid rgba(255,255,255,0.2);
          pointer-events: none;
        }
        .card-item:hover {
          transform: translate(-4px, -4px);
          box-shadow: 12px 12px 0 rgba(0,0,0,0.6) !important;
        }
        .ink-splash {
          position: absolute;
          bottom: 10px;
          right: 10px;
          width: 40px;
          height: 40px;
          background: radial-gradient(ellipse, rgba(255,68,68,0.4) 0%, transparent 70%);
          pointer-events: none;
        }
        .speed-lines {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          opacity: 0;
        }
        .content-scale {
          transform-origin: center center;
        }
      `}</style>

      <div
        ref={mainRef}
        className="heavyink-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
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
            <h1 ref={titleRef} className="text-center heavyink-title">
              {data.mainTitle}
            </h1>
            <div style={{ width: '120px', height: '4px', background: '#ff4444', marginTop: '16px' }}></div>
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
                const color = heavyInkColors[idx % heavyInkColors.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: color.bg,
                      borderRadius: '0',
                      boxShadow: '0 8px 0 rgba(0,0,0,0.5)',
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="ink-splash"></div>
                    <div className="card-header flex items-center gap-3 mb-4">
                      <span
                        className="js-icon material-symbols-rounded"
                        style={{ color: color.highlight, fontSize: layout.iconSize }}
                      >
                        {card.icon}
                      </span>
                      <h3
                        className={`js-title font-black leading-tight ${layout.titleSizeClass}`}
                        style={{ color: color.text, fontFamily: "'Bangers', 'Impact', sans-serif" }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-bold leading-relaxed ${layout.descSizeClass}`}
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

export const heavyInkTemplate: TemplateConfig = {
  id: 'heavyInk',
  name: '重墨黑影',
  description: '大面积黑强对比的重墨风格，阴影硬朗、情绪压迫感强',
  icon: 'invert_colors_off',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <HeavyInk data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'heavyInk'),
};

export { HeavyInk };
