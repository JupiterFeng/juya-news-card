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

interface LimitedAnimationProps {
  data: GeneratedContent;
  scale: number;
}

const LimitedAnimation: React.FC<LimitedAnimationProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const limitedColors = [
    { bg: '#2d3436', text: '#dfe6e9', accent: '#74b9ff', border: '#0984e3' },
    { bg: '#2d3436', text: '#dfe6e9', accent: '#55efc4', border: '#00b894' },
    { bg: '#2d3436', text: '#dfe6e9', accent: '#a29bfe', border: '#6c5ce7' },
    { bg: '#2d3436', text: '#dfe6e9', accent: '#fd79a8', border: '#e84393' },
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
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700;900&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .limited-container {
          font-family: 'Roboto', 'CustomPreviewFont', sans-serif;
          background: #1e1e1e;
          color: #dfe6e9;
          position: relative;
          overflow: hidden;
        }
        .limited-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='18' y='18' width='4' height='4' fill='%2374b9ff' fill-opacity='0.1'/%3E%3Crect x='8' y='8' width='4' height='4' fill='%2355efc4' fill-opacity='0.1'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .limited-title {
          font-weight: 900;
          color: #dfe6e9;
          letter-spacing: 0.1em;
          line-height: 1.2;
          position: relative;
          z-index: 10;
          text-transform: uppercase;
        }
        .card-item {
          transition: all 0.2s ease;
          position: relative;
          z-index: 5;
        }
        .card-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, transparent, rgba(116,185,255,0.5), transparent);
          pointer-events: none;
        }
        .card-item:hover {
          transform: translateY(-2px);
          box-shadow: 6px 6px 0 rgba(0,0,0,0.4) !important;
        }
        .frame-accent {
          position: absolute;
          top: 8px;
          left: 8px;
          width: 8px;
          height: 8px;
          background: rgba(255,255,255,0.2);
          pointer-events: none;
        }
        .speed-line {
          position: absolute;
          bottom: -5px;
          right: 10px;
          width: 20px;
          height: 2px;
          background: rgba(255,255,255,0.3);
          transform: rotate(-30deg);
          pointer-events: none;
        }
        .content-scale {
          transform-origin: center center;
        }
      `}</style>

      <div
        ref={mainRef}
        className="limited-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
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
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
              <div style={{ width: '20px', height: '3px', background: '#74b9ff' }}></div>
              <div style={{ width: '20px', height: '3px', background: '#55efc4' }}></div>
              <div style={{ width: '20px', height: '3px', background: '#a29bfe' }}></div>
            </div>
            <h1 ref={titleRef} className="text-center limited-title">
              {data.mainTitle}
            </h1>
            <div style={{ display: 'flex', gap: '6px', marginTop: '16px' }}>
              <div style={{ width: '20px', height: '3px', background: '#a29bfe' }}></div>
              <div style={{ width: '20px', height: '3px', background: '#74b9ff' }}></div>
              <div style={{ width: '20px', height: '3px', background: '#55efc4' }}></div>
            </div>
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
                const color = limitedColors[idx % limitedColors.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: color.bg,
                      borderRadius: '0',
                      boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
                      border: `3px solid ${color.border}`,
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="frame-accent"></div>
                    <div className="speed-line"></div>
                    <div className="card-header flex items-center gap-3 mb-4">
                      <span className="js-icon material-symbols-rounded" style={{ color: color.accent, fontSize: layout.iconSize }}>
                        {card.icon}
                      </span>
                      <h3
                        className={`js-title font-bold leading-tight ${layout.titleSizeClass}`}
                        style={{
                          color: color.text,
                          fontFamily: "'Roboto', 'Helvetica Neue', sans-serif",
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
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

export const limitedAnimationTemplate: TemplateConfig = {
  id: 'limitedAnimation',
  name: '有限动画',
  description: '帧数省依赖镜头切换的有限动画风格，设计图形化易重复',
  icon: 'fast_forward',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <LimitedAnimation data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'limitedAnimation'),
};

export { LimitedAnimation };
