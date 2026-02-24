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

const Bootstrap: React.FC<{ data: GeneratedContent; scale: number }> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);

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
        const nextScale = Math.max(0.6, maxH / contentH);
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
      <link href="https://fonts.googleapis.com/css2?family=system-ui:wght@400;500;600&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", "Liberation Sans", Arial, sans-serif;
          background-color: #ffffff;
          color: #212529;
        }
        .bootstrap-title {
          font-weight: 500;
          color: #212529;
          letter-spacing: -0.02em;
          line-height: 1.1;
          white-space: nowrap;
        }
        .card-item {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.125);
          border-radius: 0.375rem;
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
          transition: box-shadow 0.2s;
        }
        .card-item:hover {
          box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.2);
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 0.5px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 0.5px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 0.5px); }
        .js-desc strong { color: #212529; font-weight: 600; }
        .js-desc code {
          background: #e9ecef; padding: 0.1em 0.3em; border-radius: 4px;
          font-family: SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.9em; color: #d63384;
        }
        .content-scale { transform-origin: center center; }
        .material-symbols-rounded { font-family: 'Material Symbols Rounded' !important; font-weight: normal; font-style: normal; display: inline-block; }

        .badge-bootstrap {
          background: #712cf9;
        }

        /* 中间档位字体 */
        .text-5-5xl { font-size: 3.375rem; line-height: 1.1; }
        .text-4-5xl { font-size: 2.625rem; line-height: 1.2; }
        .text-3-5xl { font-size: 2.0625rem; line-height: 1.3; }
        .text-2-5xl { font-size: 1.8125rem; line-height: 1.4; }
      `}</style>

      <div
        className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-5">
          <div className="absolute top-0 left-0 w-32 h-32 bg-[#712cf9] rounded-bl-full"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#0d6efd] rounded-tl-full"></div>
        </div>

        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-24 box-border content-scale relative z-10"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX,
            paddingRight: layout.wrapperPaddingX
          }}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="badge-bootstrap text-white text-xs font-bold px-3 py-1 rounded-full">BOOTSTRAP</span>
            </div>
            <h1 ref={titleRef} className="text-center bootstrap-title">
              {data.mainTitle}
            </h1>
            <div className="w-24 h-0.5 bg-gradient-to-r from-[#0d6efd] via-[#6610f2] to-[#d63384] rounded-full"></div>
          </div>

          <div className="card-zone flex-none w-full">
            <div
              className="w-full flex flex-wrap justify-center content-center"
              style={{
                gap: layout.containerGap,
                '--container-gap': layout.containerGap
              } as React.CSSProperties}
            >
              {data.cards.map((card, idx) => (
                <div
                  key={idx}
                  className={`card-item flex flex-col ${layout.cardWidthClass}`}
                  style={{ padding: layout.cardPadding }}
                >
                  <div className="card-header flex items-center gap-4 mb-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.125)', paddingBottom: '12px' }}>
                    <span
                      className="js-icon material-symbols-rounded"
                      style={{ fontSize: layout.iconSize, color: '#0d6efd' }}
                    >
                      {card.icon}
                    </span>
                    <h3
                      className={`js-title font-bold leading-tight ${layout.titleSizeClass}`}
                      style={{ color: '#212529' }}
                    >
                      {card.title}
                    </h3>
                  </div>
                  <p
                    className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
                    style={{ color: '#6c757d' }}
                    dangerouslySetInnerHTML={{ __html: card.desc }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <script dangerouslySetInnerHTML={{
          __html: `
            ${generateTitleFitScript(titleConfig)}
            ${generateViewportFitScript()}
          `
        }} />
      </div>
    </div>
  );
};

export const bootstrapTemplate: TemplateConfig = {
  id: 'bootstrap',
  name: '经典组件库',
  description: '标准化组件系统风格',
  icon: 'grid_on',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <Bootstrap data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'bootstrap'),
};

export { Bootstrap };
