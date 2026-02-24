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

const Wireframe: React.FC<{ data: GeneratedContent; scale: number }> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
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
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@400;500;600&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'Inter', -apple-system, sans-serif;
          background-color: #f8fafc;
          background-image:
            linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
          color: #1e293b;
        }
        .wire-title {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 500;
          color: #2563eb;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }
        .card-item {
          background: #ffffff;
          border: 2px dashed #94a3b8;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .card-item:hover {
          border-color: #2563eb;
          border-style: solid;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .js-desc strong { font-weight: 600; color: #2563eb; }
        .js-desc code {
          background: #f1f5f9;
          padding: 0.1em 0.3em;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.9em;
          color: #2563eb;
          border: 1px solid #e2e8f0;
          border-radius: 3px;
        }
        .content-scale { transform-origin: center center; }
        .material-symbols-rounded { font-family: 'Material Symbols Rounded' !important; font-weight: normal; font-style: normal; display: inline-block; }

        .placeholder-box {
          background: repeating-linear-gradient(45deg, #f1f5f9, #f1f5f9 5px, #e2e8f0 5px, #e2e8f0 10px);
          border: 2px dashed #cbd5e1;
        }
        .wire-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .connector-dot {
          width: 8px;
          height: 8px;
          border: 2px solid #2563eb;
          background: #ffffff;
          border-radius: 50%;
        }
      `}</style>

      <div
        ref={mainRef}
        className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        <div className="absolute top-6 left-6 wire-label">[PROTOTYPE_v1.0]</div>
        <div className="absolute top-6 right-6 flex items-center gap-2">
          <div className="connector-dot"></div>
          <span className="wire-label">GRID: 12 COL</span>
          <div className="connector-dot"></div>
        </div>
        <div className="absolute bottom-6 left-6 wire-label">WIDTH: 1920px | HEIGHT: 1080px</div>
        <div className="absolute bottom-6 right-6 wire-label">© WIREFRAME_KIT</div>

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
            <div className="flex items-center gap-3">
              <div className="connector-dot"></div>
              <div className="w-16 h-px bg-[#2563eb]"></div>
              <span className="wire-label text-[#2563eb]">PAGE_HEADER</span>
              <div className="w-16 h-px bg-[#2563eb]"></div>
              <div className="connector-dot"></div>
            </div>
            <h1 ref={titleRef} className="text-center wire-title">
              {data.mainTitle}
            </h1>
            <div className="placeholder-box w-48 h-3 rounded"></div>
          </div>

          <div className="card-zone flex-none w-full">
            <div className="flex items-center gap-2 mb-3">
              <div className="connector-dot"></div>
              <span className="wire-label">CARD_CONTAINER</span>
              <div className="connector-dot"></div>
            </div>
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
                  <div className="flex items-center gap-3 mb-4 border-b border-dashed border-[#cbd5e1] pb-3">
                    <div className="placeholder-box w-10 h-10 rounded flex items-center justify-center">
                      <span className="js-icon material-symbols-rounded" style={{ color: '#2563eb', fontSize: layout.iconSize, opacity: '0.7' }}>
                        {card.icon}
                      </span>
                    </div>
                    <h3 className={`js-title font-medium ${layout.titleSizeClass}`} style={{ color: '#2563eb' }}>
                      {card.title}
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <div className="placeholder-box w-full h-3 rounded"></div>
                    <p
                      className={`js-desc font-normal ${layout.descSizeClass}`}
                      style={{ color: '#64748b' }}
                      dangerouslySetInnerHTML={{ __html: autoAddSpaceToHtml(card.desc) }}
                    />
                    <div className="placeholder-box w-3/4 h-3 rounded"></div>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="wire-label">ITEM_{String(idx + 1).padStart(2, '0')}</span>
                    <div className="connector-dot"></div>
                  </div>
                </div>
              ))}
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

export const wireframeTemplate: TemplateConfig = {
  id: 'wireframe',
  name: '线框结构风',
  description: '骨架展示虚线边框原型感',
  icon: 'view_quilt',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <Wireframe data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'wireframe'),
};

export { Wireframe };
