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

interface GeometricMinimalProps {
  data: GeneratedContent;
  scale: number;
}

const GeometricMinimal: React.FC<GeometricMinimalProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const shapes = ['circle', 'square', 'triangle', 'diamond', 'hexagon'];

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if (!wrapperRef.current || !titleRef.current) return;
    const wrapper = wrapperRef.current;
    const title = titleRef.current;

    const fitTitle = () => {
      let size = titleConfig.initialFontSize;
      title.style.fontSize = size + 'px';
      let guard = 0;
      while (title.scrollWidth > 1650 && size > titleConfig.minFontSize && guard < 100) {
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
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'Inter', 'CustomPreviewFont', system-ui, sans-serif;
          background: #f5f5f5;
          color: #1a1a1a;
        }
        .geo-title {
          font-weight: 700;
          color: #1a1a1a;
          letter-spacing: -0.03em;
          line-height: 1;
        }
        .card-item {
          position: relative;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        .card-item::before,
        .card-item::after {
          content: '';
          position: absolute;
          width: 20px;
          height: 20px;
          border-color: #1a1a1a;
          border-style: solid;
          pointer-events: none;
        }
        .card-item::before {
          top: 12px;
          left: 12px;
          border-width: 2px 0 0 2px;
        }
        .card-item::after {
          bottom: 12px;
          right: 12px;
          border-width: 0 2px 2px 0;
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }

        .js-desc strong { font-weight: 600; }
        .js-desc code {
          background: #f0f0f0;
          color: #1a1a1a;
          padding: 0.15em 0.4em;
          border-radius: 2px;
          font-family: monospace;
          font-size: 0.9em;
        }
        .content-scale { transform-origin: center center; }

        .geo-shape {
          position: absolute;
          opacity: 0.03;
          pointer-events: none;
        }
        .shape-bg-circle {
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: #1a1a1a;
          top: -100px;
          right: -100px;
        }
        .shape-bg-square {
          width: 300px;
          height: 300px;
          background: #1a1a1a;
          bottom: -50px;
          left: -50px;
        }
      `}</style>

      <div
        ref={mainRef}
        className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        <div className="geo-shape shape-bg-circle"></div>
        <div className="geo-shape shape-bg-square"></div>

        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-20 box-border content-scale relative z-10"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}
        >
          <div className="title-zone flex-none flex items-center justify-center w-full">
            <h1 ref={titleRef} className="text-center geo-title">
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
                  data-shape={shapes[idx % shapes.length]}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#1a1a1a',
                    padding: layout.cardPadding,
                  }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <span className="js-icon material-symbols-rounded" style={{ color: '#1a1a1a', fontSize: layout.iconSize }}>
                      {card.icon}
                    </span>
                    <h3 className={`js-title font-semibold ${layout.titleSizeClass}`} style={{ color: '#1a1a1a' }}>
                      {card.title}
                    </h3>
                  </div>
                  <p
                    className={`js-desc font-medium leading-relaxed ${layout.descSizeClass}`}
                    style={{ color: '#333333' }}
                    dangerouslySetInnerHTML={{ __html: autoAddSpaceToHtml(card.desc) }}
                  />
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

export const geometricMinimalTemplate: TemplateConfig = {
  id: 'geometricMinimal',
  name: '几何极简',
  description: '用基础几何形构成视觉系统；适合科技、建筑、工具产品',
  icon: 'category',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <GeometricMinimal data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'geometricMinimal'),
};

export { GeometricMinimal };
