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

interface SumiStyleProps {
  data: GeneratedContent;
  scale: number;
}

const SumiStyle: React.FC<SumiStyleProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';
  const sumiColors = [
    { bg: '#ffffff', text: '#1a1a1a', accent: '#2d2d2d', shadow: 'rgba(0,0,0,0.08)' },
    { bg: '#fafafa', text: '#1a1a1a', accent: '#3d3d3d', shadow: 'rgba(0,0,0,0.1)' },
    { bg: '#f5f5f5', text: '#1a1a1a', accent: '#4d4d4d', shadow: 'rgba(0,0,0,0.12)' },
    { bg: '#ffffff', text: '#1a1a1a', accent: '#5d5d5d', shadow: 'rgba(0,0,0,0.08)' },
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
      <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@200;300;400&family=Noto+Serif+SC:wght@200;300;400&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .sumi-container {
          font-family: 'Noto Serif JP', 'CustomPreviewFont', serif;
          background: #f8f8f8;
          color: #1a1a1a;
          position: relative;
          overflow: hidden;
        }
        .sumi-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background:
            radial-gradient(ellipse at 30% 20%, rgba(0,0,0,0.03) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, rgba(0,0,0,0.04) 0%, transparent 50%);
          pointer-events: none;
        }
        .sumi-title {
          font-weight: 300;
          color: #1a1a1a;
          letter-spacing: 0.5em;
          line-height: 1.6;
          position: relative;
          z-index: 10;
        }
        .card-item {
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          position: relative;
          z-index: 5;
          background: #ffffff;
        }
        .card-item::after {
          content: '';
          position: absolute;
          bottom: 0;
          right: 0;
          width: 100%;
          height: 100%;
          border: 1px solid rgba(0,0,0,0.06);
          pointer-events: none;
        }
        .card-item:hover {
          transform: translateY(-2px);
          box-shadow: 8px 8px 24px rgba(0,0,0,0.12);
        }
        .seal-mark {
          position: absolute;
          bottom: 16px;
          left: 16px;
          width: 28px;
          height: 28px;
          border: 2px solid #b9382b;
          color: #b9382b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 500;
          opacity: 0.8;
          pointer-events: none;
        }
        .minimal-line {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 30px;
          height: 1px;
          background: rgba(0,0,0,0.2);
          pointer-events: none;
        }
        .content-scale {
          transform-origin: center center;
        }
      `}</style>

      <div
        ref={mainRef}
        className="sumi-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-24 box-border content-scale z-10"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}
        >
          <div className="flex flex-col items-center">
            <div style={{ width: '60px', height: '1px', background: '#1a1a1a', marginBottom: '32px', opacity: 0.5 }}></div>
            <h1 ref={titleRef} className="text-center sumi-title">
              {data.mainTitle}
            </h1>
            <div style={{ width: '60px', height: '1px', background: '#1a1a1a', marginTop: '32px', opacity: 0.5 }}></div>
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
                const color = sumiColors[idx % sumiColors.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: color.bg,
                      border: 'none',
                      borderRadius: '0',
                      boxShadow: `4px 4px 16px ${color.shadow}`,
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="seal-mark">墨</div>
                    <div className="minimal-line"></div>
                    <div className="card-header flex items-center gap-4 mb-5">
                      <span
                        className="js-icon material-symbols-rounded"
                        style={{ color: color.accent, fontSize: layout.iconSize }}
                      >
                        {card.icon}
                      </span>
                      <h3
                        className={`js-title font-light leading-tight ${layout.titleSizeClass}`}
                        style={{ color: color.text, fontFamily: "'Noto Serif JP', 'Noto Serif SC', serif" }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-light leading-relaxed ${layout.descSizeClass}`}
                      style={{ color: color.text, opacity: '0.7' }}
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

export const sumiStyleTemplate: TemplateConfig = {
  id: 'sumiStyle',
  name: '墨绘',
  description: '极简笔势、黑白对比的墨绘风格，一笔决定形、留白即是空气',
  icon: 'gesture',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <SumiStyle data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'sumiStyle'),
};

export { SumiStyle };
