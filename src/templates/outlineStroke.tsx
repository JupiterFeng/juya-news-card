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

/**
 * OutlineStroke 渲染组件
 * 描边优先UI风格：线条主导、空心图形、极简配色
 */
interface OutlineStrokeProps {
  data: GeneratedContent;
  scale: number;
}

const STROKE_COLORS = [
  { stroke: '#000000', accent: '#FF6B6B' },
  { stroke: '#000000', accent: '#4ECDC4' },
  { stroke: '#000000', accent: '#FFE66D' },
  { stroke: '#000000', accent: '#95E1D3' },
  { stroke: '#000000', accent: '#F38181' },
  { stroke: '#000000', accent: '#AA96DA' },
  { stroke: '#000000', accent: '#FCBAD3' },
  { stroke: '#000000', accent: '#FFFFD2' },
];

const OutlineStroke: React.FC<OutlineStrokeProps> = ({ data, scale }) => {
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
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .stroke-container {
          font-family: 'CustomPreviewFont', 'Inter', 'Helvetica Neue', 'Arial', sans-serif;
        }
        .stroke-title {
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #000;
          position: relative;
        }
        .stroke-title::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          right: 0;
          height: 4px;
          background: #FF6B6B;
        }
        .stroke-card {
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          position: relative;
          background: transparent !important;
          transition: all 0.2s ease;
        }
        .stroke-card::before {
          content: '';
          position: absolute;
          top: -6px;
          left: -6px;
          right: -6px;
          bottom: -6px;
          border: 1px solid rgba(0,0,0,0.15);
          pointer-events: none;
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 2px solid rgba(0,0,0,0.1);
        }
        .js-desc {
          line-height: 1.5;
          font-weight: 500;
        }
        .js-desc code {
          background: transparent;
          color: #000;
          padding: 0.2em 0.5em;
          font-family: monospace;
          font-size: 0.9em;
          font-weight: 600;
          border: 2px solid #000;
        }
        .js-desc strong {
          font-weight: 700;
          color: #000;
          text-decoration: underline;
          text-decoration-thickness: 2px;
        }
        .content-scale { transform-origin: center center; }
        .material-symbols-rounded { font-family: 'Material Symbols Rounded' !important; font-weight: normal; font-style: normal; display: inline-block; }

        .stroke-bg {
          background: #FAFAFA;
          position: relative;
        }
        .stroke-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }
        .deco-circle {
          position: absolute;
          border: 2px solid rgba(0,0,0,0.1);
          border-radius: 50%;
          pointer-events: none;
        }
      `}</style>

      <div className="stroke-container stroke-bg relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
        <div className="deco-circle" style={{ width: '200px', height: '200px', top: '8%', left: '5%', opacity: 0.5 }} />
        <div className="deco-circle" style={{ width: '120px', height: '120px', bottom: '12%', right: '8%', opacity: 0.4 }} />
        <div className="deco-circle" style={{ width: '80px', height: '80px', top: '20%', right: '15%', opacity: 0.3 }} />

        <div
          ref={wrapperRef}
          className="content-wrapper relative z-10 w-full flex flex-col items-center px-16 box-border content-scale"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}
        >
          <div className="title-zone flex-none flex items-center justify-center">
            <div style={{ background: '#FFF', border: '4px solid #000', padding: '16px 48px', boxShadow: '6px 6px 0 #000' }}>
              <h1 ref={titleRef} className="stroke-title text-center">
                {data.mainTitle}
              </h1>
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
                const colors = STROKE_COLORS[idx % STROKE_COLORS.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item stroke-card ${layout.cardWidthClass}`}
                    style={{
                      background: 'transparent',
                      border: `3px solid ${colors.stroke}`,
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="card-header" style={{ borderColor: colors.accent }}>
                      <h3
                        className={`js-title font-bold ${layout.titleSizeClass}`}
                        style={{ color: colors.stroke, borderBottom: `3px solid ${colors.accent}` }}
                      >
                        {card.title}
                      </h3>
                      <span
                        className="js-icon material-symbols-rounded"
                        style={{
                          fontSize: layout.iconSize,
                          color: colors.stroke,
                          outline: `2px solid ${colors.accent}`,
                          outlineOffset: '4px'
                        }}
                      >
                        {card.icon}
                      </span>
                    </div>
                    <p
                      className={`js-desc ${layout.descSizeClass}`}
                      style={{ color: colors.stroke }}
                      dangerouslySetInnerHTML={{ __html: autoAddSpaceToHtml(card.desc) }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: generateTitleFitScript(titleConfig) }} />
      <script dangerouslySetInnerHTML={{ __html: generateViewportFitScript() }} />
    </div>
  );
};

/**
 * OutlineStroke 模板配置
 */
export const outlineStrokeTemplate: TemplateConfig = {
  id: 'outlineStroke',
  name: '描边线条风格',
  description: '线条主导、空心图形、极简配色',
  icon: 'border_outer',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <OutlineStroke data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'outlineStroke'),
};

export { OutlineStroke };
