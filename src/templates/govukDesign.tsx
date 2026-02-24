import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import { 
  calculateStandardLayout, 
  getStandardTitleConfig, 
  generateTitleFitScript, 
  generateViewportFitScript 
} from '../utils/layout-calculator';
import { autoAddSpaceToHtml } from '../utils/text-spacing';

const GOVUKDesign: React.FC<{ data: GeneratedContent; scale: number }> = ({ data, scale }) => {
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
        const nextScale = Math.max(0.65, maxH / contentH);
        wrapper.style.transform = `scale(${nextScale})`;
        return;
      }
      wrapper.style.transform = '';
    };

    const timer = window.setTimeout(fitViewport, 50);
    return () => window.clearTimeout(timer);
  }, [data, titleConfig]);

  return (
    <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', overflow: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=GDS+Transport:wght@400;500;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'GDS Transport', Arial, sans-serif;
          background-color: #f3f2f1;
          color: #0b0c0c;
        }
        .govuk-title {
          font-weight: 700;
          color: #0b0c0c;
          letter-spacing: -0.01em;
          line-height: 1.1;
        }
        .card-item {
          background: #ffffff;
          border-radius: 0;
          border-left: 5px solid #1d70b8;
          box-sizing: border-box;
          box-shadow: 0 2px 0 #b1b4b6;
          transition: box-shadow 0.2s;
        }
        .card-item:hover {
          box-shadow: 0 4px 0 #b1b4b6;
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .js-desc strong { color: #0b0c0c; font-weight: 700; }
        .js-desc code {
          background: #f3f2f1; padding: 0.1em 0.3em;
          font-family: monospace;
          font-size: 0.9em; color: #1d70b8;
        }
        .content-scale { transform-origin: center center; }
        .material-symbols-rounded { font-family: 'Material Symbols Rounded' !important; font-weight: normal; font-style: normal; display: inline-block; }

        .govuk-crest {
          width: 40px;
          height: 40px;
          background: #0b0c0c;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .govuk-crest::after {
          content: '✓';
          color: #ffffff;
          font-size: 24px;
          font-weight: bold;
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
            <div className="govuk-crest"></div>
            <h1 ref={titleRef} className="text-center govuk-title">
              {data.mainTitle}
            </h1>
            <div className="w-16 h-0.5 bg-[#1d70b8]"></div>
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
                      style={{ fontSize: layout.iconSize, color: '#1d70b8' }}
                    >
                      {card.icon}
                    </span>
                    <h3 
                      className={`js-title govuk-heading-m ${layout.titleSizeClass}`}
                      style={{ color: '#0b0c0c' }}
                    >
                      {card.title}
                    </h3>
                  </div>
                  <p 
                    className={`js-desc govuk-body ${layout.descSizeClass}`}
                    style={{ color: '#505a5f' }}
                    dangerouslySetInnerHTML={{ __html: autoAddSpaceToHtml(card.desc) }} 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SSR Scripts */}
      <script dangerouslySetInnerHTML={{ __html: generateTitleFitScript(titleConfig) }} />
      <script dangerouslySetInnerHTML={{ __html: generateViewportFitScript() }} />
    </div>
  );
};

import { generateDownloadableHtml } from '../utils/template';

export const govukDesignTemplate: TemplateConfig = {
  id: 'govukDesign',
  name: '公共服务规范界面',
  description: '公共服务可访问性优先风格',
  icon: 'account_balance',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <GOVUKDesign data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'govukDesign'),
};

export { GOVUKDesign };
