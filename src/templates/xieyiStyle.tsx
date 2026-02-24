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

interface XieyiStyleProps {
  data: GeneratedContent;
  scale: number;
}

const XieyiStyle: React.FC<XieyiStyleProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const inkShades = [
    { bg: '#fcfbf9', text: '#1a1a1a', accent: '#2d2d2d', opacity: 1 },
    { bg: '#f8f6f2', text: '#2a2a2a', accent: '#3d3d3d', opacity: 0.9 },
    { bg: '#f2efe9', text: '#3a3a3a', accent: '#4d4d4d', opacity: 0.8 },
    { bg: '#ebe7de', text: '#4a4a4a', accent: '#5d5d5d', opacity: 0.7 },
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
        .xieyi-container {
          font-family: 'Noto Serif SC', 'CustomPreviewFont', serif;
          background: linear-gradient(135deg, #f8f6f2 0%, #ebe7de 50%, #f2efe9 100%);
          color: #2a2a2a;
          position: relative;
          overflow: hidden;
        }
        .xieyi-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(ellipse at 30% 20%, rgba(45,45,45,0.03) 0%, transparent 50%),
                      radial-gradient(ellipse at 70% 80%, rgba(45,45,45,0.04) 0%, transparent 50%);
          pointer-events: none;
        }
        .xieyi-title {
          font-weight: 300;
          color: #1a1a1a;
          letter-spacing: 0.2em;
          line-height: 1.6;
          position: relative;
          z-index: 1;
        }
        .card-item {
          transition: all 0.3s ease;
          position: relative;
          z-index: 1;
        }
        .card-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.12);
        }
        .ink-seal {
          position: absolute;
          bottom: 20px;
          right: 20px;
          width: 40px;
          height: 40px;
          border: 2px solid #c1440e;
          color: #c1440e;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 500;
          opacity: 0.8;
        }
        .content-scale {
          transform-origin: center center;
        }
      `}</style>

      <div className="xieyi-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
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
            <div style={{ width: '60px', height: '3px', background: 'linear-gradient(90deg, transparent, #2a2a2a, transparent)', marginBottom: '20px' }}></div>
            <h1 ref={titleRef} className="text-center xieyi-title">
              {data.mainTitle}
            </h1>
            <div style={{ width: '60px', height: '3px', background: 'linear-gradient(90deg, transparent, #2a2a2a, transparent)', marginTop: '20px' }}></div>
          </div>

          <div className="card-zone flex-none w-full">
            <div
              data-card-zone="true"
              className="w-full flex flex-wrap justify-center content-start gap-6"
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
                const shade = inkShades[idx % inkShades.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: shade.bg,
                      border: 'none',
                      borderRadius: '2px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="ink-seal">墨</div>
                    <div className="card-header flex items-center gap-3 mb-4">
                      <span
                        className="js-icon material-symbols-rounded"
                        style={{ color: shade.accent, fontSize: layout.iconSize, opacity: shade.opacity.toString() }}
                      >
                        {card.icon}
                      </span>
                      <h3
                        className={`js-title font-normal leading-tight ${layout.titleSizeClass}`}
                        style={{ color: shade.text, fontFamily: "'Noto Serif SC', serif", fontWeight: '400' }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-light leading-relaxed ${layout.descSizeClass}`}
                      style={{ color: shade.text, opacity: '0.75' }}
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


export const xieyiStyleTemplate: TemplateConfig = {
  id: 'xieyiStyle',
  name: '写意画',
  description: '笔墨概括、形不求全的写意风格，重气韵、求神似',
  icon: 'water_drop',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <XieyiStyle data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'xieyiStyle'),
};

export { XieyiStyle };
