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

interface ExpressionismProps {
  data: GeneratedContent;
  scale: number;
}

const Expressionism: React.FC<ExpressionismProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';
  const expressionColors = [
    { bg: '#2d1a3a', text: '#f0e8f8', accent: '#b880c8', skew: '-1deg' },
    { bg: '#3a1a2a', text: '#f8e8ec', accent: '#c86080', skew: '1deg' },
    { bg: '#1a2a3a', text: '#e8f0fc', accent: '#6080c8', skew: '-0.5deg' },
    { bg: '#1a3a2a', text: '#e8f8ec', accent: '#60b890', skew: '0.5deg' },
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
      while(title.scrollWidth > 1700 && size > titleConfig.minFontSize && guard < 100) {
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
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@500;700;900&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .expressionism-container {
          font-family: 'Roboto', 'CustomPreviewFont', sans-serif;
          background: #1a1a2e;
          color: #f0e8f8;
          position: relative;
          overflow: hidden;
        }
        .expressionism-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            linear-gradient(45deg, transparent 40%, rgba(184,128,200,0.1) 50%, transparent 60%),
            linear-gradient(-45deg, transparent 40%, rgba(200,96,128,0.08) 50%, transparent 60%);
          pointer-events: none;
        }
        .expressionism-title {
          font-weight: 900;
          color: #f0e8f8;
          letter-spacing: 0.1em;
          line-height: 1.2;
          position: relative;
          z-index: 10;
          text-transform: uppercase;
          text-shadow: 4px 4px 0 rgba(0,0,0,0.3);
        }
        .card-item {
          transition: all 0.3s ease;
          position: relative;
          z-index: 5;
        }
        .card-item:hover {
          filter: brightness(1.2);
        }
        .emotion-splash {
          position: absolute;
          top: -10px;
          left: -10px;
          width: 40px;
          height: 40px;
          background: radial-gradient(ellipse, rgba(255,255,255,0.2) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }
        .content-scale {
          transform-origin: center center;
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 0.5px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 0.5px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 0.5px); }

        .text-5-5xl { font-size: 3.375rem; line-height: 1.1; }
        .text-4-5xl { font-size: 2.625rem; line-height: 1.2; }
        .text-3-5xl { font-size: 2.0625rem; line-height: 1.3; }
        .text-2-5xl { font-size: 1.8125rem; line-height: 1.4; }
      `}</style>

      <div
        ref={mainRef}
        className="expressionism-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
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
            <h1 ref={titleRef} className="text-center expressionism-title">
              {data.mainTitle}
            </h1>
            <div style={{ width: '150px', height: '4px', background: 'linear-gradient(90deg, #b880c8, #c86080)', marginTop: '20px' }}></div>
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
                const color = expressionColors[idx % expressionColors.length];
                const reverseSkew = color.skew.startsWith('-') ? color.skew.slice(1) : `-${color.skew}`;
                return (
                <div
                  key={idx}
                  data-card-item="true"
                  className={`card-item flex flex-col ${layout.cardWidthClass}`}
                  style={{
                    backgroundColor: color.bg,
                    color: color.text,
                    borderRadius: '0',
                    transform: `skew(${color.skew})`,
                    boxShadow: '8px 8px 0 rgba(0,0,0,0.3)',
                    border: '3px solid rgba(255,255,255,0.1)',
                    padding: layout.cardPadding,
                  }}
                >
                  <div className="emotion-splash"></div>
                  <div className="card-header flex items-center gap-3 mb-4">
                    <span
                      className="js-icon material-symbols-rounded"
                      style={{
                        color: color.accent,
                        fontSize: layout.iconSize,
                        transform: `skew(${reverseSkew})`,
                        display: 'inline-block'
                      }}
                    >
                      {card.icon}
                    </span>
                    <h3
                      className={`js-title font-bold leading-tight ${layout.titleSizeClass}`}
                      style={{
                        color: color.text,
                        fontFamily: "'Impact', 'Arial Black', sans-serif",
                        transform: `skew(${reverseSkew})`,
                        display: 'inline-block',
                        textTransform: 'uppercase'
                      }}
                    >
                      {card.title}
                    </h3>
                  </div>
                  <p
                    className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
                    style={{
                      color: color.text,
                      opacity: '0.9',
                      transform: `skew(${reverseSkew})`,
                      display: 'inline-block'
                    }}
                    dangerouslySetInnerHTML={{ __html: autoAddSpaceToHtml(card.desc) }}
                  />
                </div>
              )})}
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

export const expressionismTemplate: TemplateConfig = {
  id: 'expressionism',
  name: '表现主义',
  description: '扭曲为情绪服务的表现主义风格，形体可变形、笔触粗粝',
  icon: 'sentiment_very_dissatisfied',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <Expressionism data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'expressionism'),
};

export { Expressionism };
