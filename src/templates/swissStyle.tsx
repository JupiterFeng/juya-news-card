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

const SwissStyle: React.FC<{ data: GeneratedContent; scale: number }> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if (!wrapperRef.current || !titleRef.current) return;

    const wrapper = wrapperRef.current;
    const title = titleRef.current;

    const fitTitle = () => {
      let size = titleConfig.initialFontSize;
      title.style.fontSize = size + 'px';
      let guard = 0;
      while (title.scrollWidth > 1600 && size > titleConfig.minFontSize && guard < 100) {
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
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background-color: #ffffff;
          color: #000000;
        }
        .swiss-title {
          font-weight: 900;
          color: #000000;
          letter-spacing: -0.04em;
          line-height: 0.9;
          text-transform: uppercase;
        }
        .card-item {
          box-sizing: border-box;
          background: #ffffff;
          border-radius: 0;
          border: 2px solid #000000;
          transition: all 0.15s;
        }
        .card-item:hover {
          background: #f5f5f5;
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .js-desc strong { font-weight: 700; }
        .js-desc code {
          background: #000000; color: #ffffff;
          padding: 0.1em 0.3em;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
        }
        .content-scale { transform-origin: center center; }
        .material-symbols-rounded { font-family: 'Material Symbols Rounded' !important; font-weight: normal; font-style: normal; display: inline-block; }

        .swiss-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 4px;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          opacity: 0.05;
        }
      `}</style>

      <div className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
        <div className="swiss-grid">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} style={{ border: '1px solid #000' }}></div>
          ))}
        </div>

        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-24 box-border content-scale relative z-10"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}
        >
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="flex items-center justify-between w-full">
              <div className="w-20 h-0.5 bg-[#e53935]"></div>
              <h1 ref={titleRef} className="text-center swiss-title flex-1">
                {data.mainTitle}
              </h1>
              <div className="w-20 h-0.5 bg-[#e53935]"></div>
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
              {data.cards.map((card, idx) => (
                <div
                  key={idx}
                  data-card-item="true"
                  className={`card-item flex flex-col ${layout.cardWidthClass}`}
                  style={{ padding: layout.cardPadding }}
                >
                  <div className="card-header flex items-center gap-4 mb-6" style={{ borderBottom: '2px solid #000000', paddingBottom: '16px' }}>
                    <span
                      className="js-icon material-symbols-rounded"
                      style={{ fontSize: layout.iconSize, color: '#e53935' }}
                    >
                      {card.icon}
                    </span>
                    <h3
                      className={`js-title ${layout.titleSizeClass}`}
                      style={{ color: '#000000', textTransform: 'uppercase' }}
                    >
                      {card.title}
                    </h3>
                  </div>
                  <p
                    className={`js-desc ${layout.descSizeClass}`}
                    style={{ color: '#424242' }}
                    dangerouslySetInnerHTML={{ __html: autoAddSpaceToHtml(card.desc) }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: generateTitleFitScript(titleConfig) }} />
      <script dangerouslySetInnerHTML={{ __html: generateViewportFitScript() }} />
    </div>
  );
};

export const swissStyleTemplate: TemplateConfig = {
  id: 'swissStyle',
  name: '瑞士风格',
  description: '网格系统强对齐瑞士国际主义风格',
  icon: 'grid_on',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <SwissStyle data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'swissStyle'),
};

export { SwissStyle };
