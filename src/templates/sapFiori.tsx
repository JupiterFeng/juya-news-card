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

const SAPFiori: React.FC<{ data: GeneratedContent; scale: number }> = ({ data, scale }) => {
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
      <link href="https://fonts.googleapis.com/css2?family=72:wght@400;500;600&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: '72', 'Helvetica Neue', Helvetica, Arial, sans-serif;
          background-color: #f5f6f7;
          color: #32363a;
        }
        .fiori-title {
          font-weight: 400;
          color: #32363a;
          letter-spacing: -0.01em;
          line-height: 1.1;
        }
        .card-item {
          box-sizing: border-box;
          background: #ffffff;
          border-radius: 0.5rem;
          border: 1px solid #e0e0e0;
          box-shadow: 0 0 2px rgba(0, 0, 0, 0.12);
          transition: box-shadow 0.2s;
        }
        .card-item:hover {
          box-shadow: 0 0 6px rgba(0, 0, 0, 0.16);
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .js-desc strong { color: #32363a; font-weight: 600; }
        .js-desc code {
          background: #edf5f8; padding: 0.1em 0.3em; border-radius: 4px;
          font-family: '72mono', monospace;
          font-size: 0.9em; color: #0a6ed1;
        }
        .content-scale { transform-origin: center center; }
        .material-symbols-rounded { font-family: 'Material Symbols Rounded' !important; font-weight: normal; font-style: normal; display: inline-block; }

        .fiori-gold-ring {
          width: 40px;
          height: 40px;
          border: 3px solid #f0ab00;
          border-radius: 50%;
        }
      `}</style>

      <div
        className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-24 box-border content-scale"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center">
              <div className="fiori-gold-ring"></div>
            </div>
            <h1 ref={titleRef} className="text-center fiori-title">
              {data.mainTitle}
            </h1>
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
                  <div className="card-header flex items-center gap-4 mb-4">
                    <span
                      className="js-icon material-symbols-rounded"
                      style={{ fontSize: layout.iconSize, color: '#0a6ed1' }}
                    >
                      {card.icon}
                    </span>
                    <h3
                      className={`js-title sapMTitle ${layout.titleSizeClass}`}
                      style={{ color: '#32363a' }}
                    >
                      {card.title}
                    </h3>
                  </div>
                  <p
                    className={`js-desc sapMText ${layout.descSizeClass}`}
                    style={{ color: '#6a6d70' }}
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


export const sapFioriTemplate: TemplateConfig = {
  id: 'sapFiori',
  name: '企业流程面板',
  description: '企业应用流程化界面风格',
  icon: 'business',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <SAPFiori data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'sapFiori'),
};

export { SAPFiori };
