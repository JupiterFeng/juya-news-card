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

interface StopMotionProps {
  data: GeneratedContent;
  scale: number;
}

const StopMotion: React.FC<StopMotionProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const stopColors = [
    { bg: '#d4a574', text: '#3d2914', accent: '#8b5a2b' },
    { bg: '#c9b896', text: '#2d2d2d', accent: '#8b7355' },
    { bg: '#e8dcc4', text: '#4a4a4a', accent: '#a0926b' },
    { bg: '#b8a88a', text: '#2a2a2a', accent: '#6b5d3d' },
    { bg: '#d6c6a8', text: '#3d3d3d', accent: '#8b7355' },
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
      <link href="https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .stopmotion-container {
          font-family: 'Courier Prime', 'CustomPreviewFont', monospace;
          background: linear-gradient(180deg, #f5f0e6 0%, #e8e0d0 100%);
          color: #3d2914;
          position: relative;
          overflow: hidden;
        }
        .stopmotion-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .stopmotion-title {
          font-weight: 700;
          color: #3d2914;
          letter-spacing: '0.05em';
          line-height: 1.3;
          position: relative;
          z-index: 10;
          text-shadow: 2px 2px 0 rgba(0,0,0,0.1);
        }
        .card-item {
          transition: all 0.2s steps(4);
          position: relative;
          z-index: 5;
        }
        .card-item::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='0.5' fill='rgba(0,0,0,0.1)'/%3E%3C/svg%3E");
          pointer-events: none;
          border-radius: 4px;
        }
        .card-item:hover {
          transform: translateY(-2px);
          box-shadow:
            2px 2px 0 rgba(0,0,0,0.1),
            4px 4px 0 rgba(0,0,0,0.1),
            6px 6px 0 rgba(0,0,0,0.1),
            12px 12px 0 rgba(0,0,0,0.2) !important;
        }
        .joint-mark {
          position: absolute;
          width: 6px;
          height: 6px;
          background: rgba(0,0,0,0.2);
          border-radius: 50%;
          pointer-events: none;
        }
        .joint-tl { top: 8px; left: 8px; }
        .joint-tr { top: 8px; right: 8px; }
        .joint-bl { bottom: 8px; left: 8px; }
        .joint-br { bottom: 8px; right: 8px; }
        .texture-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.05) 100%);
          pointer-events: none;
          border-radius: 4px;
        }
        .content-scale {
          transform-origin: center center;
        }
      `}</style>

      <div className="stopmotion-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
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
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <div style={{ width: '12px', height: '12px', background: '#d4a574', borderRadius: '50%', boxShadow: '2px 2px 0 rgba(0,0,0,0.2)' }}></div>
              <div style={{ width: '12px', height: '12px', background: '#c9b896', borderRadius: '2px' }}></div>
              <div style={{ width: '12px', height: '12px', background: '#b8a88a', borderRadius: '50%' }}></div>
            </div>
            <h1 ref={titleRef} className="text-center stopmotion-title">
              {data.mainTitle}
            </h1>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <div style={{ width: '12px', height: '12px', background: '#e8dcc4', borderRadius: '2px' }}></div>
              <div style={{ width: '12px', height: '12px', background: '#d6c6a8', borderRadius: '50%' }}></div>
              <div style={{ width: '12px', height: '12px', background: '#d4a574', borderRadius: '2px' }}></div>
            </div>
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
                const color = stopColors[idx % stopColors.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: color.bg,
                      borderRadius: '4px',
                      boxShadow: '2px 2px 0 rgba(0,0,0,0.1), 4px 4px 0 rgba(0,0,0,0.1), 6px 6px 0 rgba(0,0,0,0.1), 8px 8px 0 rgba(0,0,0,0.15)',
                      border: '2px solid rgba(0,0,0,0.2)',
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="joint-mark joint-tl"></div>
                    <div className="joint-mark joint-tr"></div>
                    <div className="joint-mark joint-bl"></div>
                    <div className="joint-mark joint-br"></div>
                    <div className="texture-overlay"></div>
                    <div className="card-header flex items-center gap-3 mb-4">
                      <span
                        className="js-icon material-symbols-rounded"
                        style={{
                          color: color.accent,
                          fontSize: layout.iconSize,
                          filter: 'drop-shadow(1px 1px 0 rgba(0,0,0,0.3))',
                        }}
                      >
                        {card.icon}
                      </span>
                      <h3
                        className={`js-title font-bold leading-tight ${layout.titleSizeClass}`}
                        style={{ color: color.text, fontFamily: "'Courier New', 'Georgia', serif" }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
                      style={{ color: color.text, opacity: '0.9' }}
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


export const stopMotionTemplate: TemplateConfig = {
  id: 'stopMotion',
  name: '定格',
  description: '逐帧拍摄实物材料的定格动画风格，材质纹理与帧感',
  icon: 'animation',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <StopMotion data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'stopMotion'),
};

export { StopMotion };
