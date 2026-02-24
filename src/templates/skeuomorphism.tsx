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

const Skeuomorphism: React.FC<{ data: GeneratedContent; scale: number }> = ({ data, scale }) => {
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
      <link href="https://fonts.googleapis.com/css2?family=Helvetica+Neue:wght@400;600;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          background: linear-gradient(180deg, #c9c9c9 0%, #e8e8e8 50%, #c9c9c9 100%);
          color: #2c2c2c;
        }
        .skeuo-title {
          font-weight: 700;
          color: #2c2c2c;
          letter-spacing: -0.02em;
          line-height: 1.1;
          text-shadow: 0 2px 0 rgba(255,255,255,0.5), 0 -1px 0 rgba(0,0,0,0.1);
        }
        .card-item {
          box-sizing: border-box;
          background: linear-gradient(180deg, #f5f5f5 0%, #e0e0e0 100%);
          border-radius: 12px;
          border: 1px solid #b0b0b0;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.1);
          transition: box-shadow 0.2s;
        }
        .card-item:hover {
          box-shadow: 0 6px 12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.8);
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .js-desc strong { color: #1a1a1a; font-weight: 700; }
        .js-desc code {
          background: linear-gradient(180deg, #f0f0f0 0%, #d5d5d5 100%);
          padding: 0.1em 0.3em; border-radius: 4px;
          border: 1px solid #aaa;
          box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);
          font-family: 'Courier New', monospace;
          font-size: 0.9em; color: #0066cc;
        }
        .content-scale { transform-origin: center center; }
        .material-symbols-rounded { font-family: 'Material Symbols Rounded' !important; font-weight: normal; font-style: normal; display: inline-block; }

        .skeuo-button {
          background: linear-gradient(180deg, #6ba34d 0%, #4d7a2e 100%);
          border: 1px solid #3d6224;
          border-radius: 6px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3);
        }
      `}</style>

      <div className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
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
            <div className="skeuo-button px-6 py-2">
              <span className="text-white text-sm font-bold">SKEUOMORPHISM</span>
            </div>
            <h1 ref={titleRef} className="text-center skeuo-title">
              {data.mainTitle}
            </h1>
            <div className="w-32 h-1 rounded-full" style={{ background: 'linear-gradient(90deg, transparent, #999, transparent)' }}></div>
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
                  <div className="card-header flex items-center gap-4 mb-6" style={{ borderBottom: '1px solid #bbb', paddingBottom: '12px' }}>
                    <span
                      className="js-icon material-symbols-rounded"
                      style={{
                        fontSize: layout.iconSize,
                        color: '#555555',
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}
                    >
                      {card.icon}
                    </span>
                    <h3
                      className={`js-title ${layout.titleSizeClass}`}
                      style={{
                        color: '#2c2c2c',
                        textShadow: '0 1px 0 rgba(255,255,255,0.8)'
                      }}
                    >
                      {card.title}
                    </h3>
                  </div>
                  <p
                    className={`js-desc ${layout.descSizeClass}`}
                    style={{ color: '#555555' }}
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

export const skeuomorphismTemplate: TemplateConfig = {
  id: 'skeuomorphism',
  name: '拟物化',
  description: '真实材质拟物化设计风格',
  icon: 'widgets',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <Skeuomorphism data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'skeuomorphism'),
};

export { Skeuomorphism };
