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

interface PaperCutProps {
  data: GeneratedContent;
  scale: number;
}

const PaperCut: React.FC<PaperCutProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const papercutColors = [
    { bg: '#1a1a1a', fg: '#ffffff', accent: '#ff4444' },
    { bg: '#8b0000', fg: '#ffffff', accent: '#ffdd00' },
    { bg: '#000000', fg: '#ffffff', accent: '#ff6666' },
    { bg: '#a00000', fg: '#ffffff', accent: '#ffcc00' },
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
      <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@500;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .papercut-container {
          font-family: 'Noto Serif SC', 'CustomPreviewFont', serif;
          background: #1a1a1a;
          color: #ffffff;
          position: relative;
          overflow: hidden;
        }
        .papercut-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 10 L55 25 L70 25 L58 35 L63 50 L50 40 L37 50 L42 35 L30 25 L45 25 Z' fill='none' stroke='%23ffffff' stroke-opacity='0.05' stroke-width='1'/%3E%3Ccircle cx='50' cy='50' r='20' fill='none' stroke='%23ffffff' stroke-opacity='0.03' stroke-width='1'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .papercut-title {
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 0.3em;
          line-height: 1.4;
          position: relative;
          z-index: 10;
        }
        .card-item {
          transition: all 0.3s ease;
          position: relative;
          z-index: 5;
          clip-path: polygon(
            0 0,
            100% 0,
            100% calc(100% - 20px),
            calc(100% - 20px) 100%,
            0 100%
          );
        }
        .card-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255,68,68,0.1) 0%, transparent 50%);
          pointer-events: none;
        }
        .card-item::after {
          content: '';
          position: absolute;
          top: 8px;
          left: 8px;
          right: 8px;
          bottom: 8px;
          border: 1px solid rgba(0,0,0,0.1);
          pointer-events: none;
          clip-path: polygon(
            0 0,
            100% 0,
            100% calc(100% - 16px),
            calc(100% - 16px) 100%,
            0 100%
          );
        }
        .card-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.5);
        }
        .cutout-corner {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 20px;
          height: 20px;
          background: #1a1a1a;
          clip-path: polygon(0 100%, 100% 0, 100% 100%);
        }
        .content-scale {
          transform-origin: center center;
        }
      `}</style>

      <div className="papercut-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
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
            <svg width="80" height="24" viewBox="0 0 80 24" style={{ marginBottom: '16px' }}>
              <path d="M0 12 L20 4 L30 12 L40 4 L50 12 L60 4 L80 12" stroke="#ffffff" strokeWidth="2" fill="none" opacity="0.8"/>
              <circle cx="40" cy="12" r="4" fill="#ff4444"/>
            </svg>
            <h1 ref={titleRef} className="text-center papercut-title">
              {data.mainTitle}
            </h1>
            <svg width="80" height="24" viewBox="0 0 80 24" style={{ marginTop: '16px' }}>
              <path d="M0 12 L20 20 L30 12 L40 20 L50 12 L60 20 L80 12" stroke="#ffffff" strokeWidth="2" fill="none" opacity="0.8"/>
              <circle cx="40" cy="12" r="4" fill="#ff4444"/>
            </svg>
          </div>

          <div className="card-zone flex-none w-full">
            <div
              data-card-zone="true"
              className="w-full flex flex-wrap justify-center content-center gap-4"
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
                const colors = papercutColors[idx % papercutColors.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: colors.fg,
                      color: colors.bg,
                      borderRadius: '0',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                      position: 'relative',
                      overflow: 'hidden',
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="cutout-corner"></div>
                    <div className="card-header flex items-center gap-3 mb-4">
                      <span className="js-icon material-symbols-rounded" style={{ color: colors.accent, fontSize: layout.iconSize }}>
                        {card.icon}
                      </span>
                      <h3
                        className={`js-title font-medium leading-tight ${layout.titleSizeClass}`}
                        style={{ color: colors.bg, fontFamily: "'Noto Serif SC', serif" }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
                      style={{ color: colors.bg, opacity: '0.85' }}
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


export const paperCutTemplate: TemplateConfig = {
  id: 'paperCut',
  name: '剪纸艺术',
  description: '剪影负形、正负形同重的剪纸风格，一刀成识别',
  icon: 'content_cut',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <PaperCut data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'paperCut'),
};

export { PaperCut };
