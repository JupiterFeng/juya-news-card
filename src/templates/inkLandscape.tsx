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

interface InkLandscapeProps {
  data: GeneratedContent;
  scale: number;
}

const InkLandscape: React.FC<InkLandscapeProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';
  const inkLayers = [
    { bg: 'rgba(255,255,255,0.95)', text: '#0a0a0a', accent: '#1a1a1a', shadow: 'rgba(0,0,0,0.1)' },
    { bg: 'rgba(250,248,245,0.9)', text: '#151515', accent: '#252525', shadow: 'rgba(0,0,0,0.12)' },
    { bg: 'rgba(245,240,235,0.85)', text: '#1a1a1a', accent: '#2a2a2a', shadow: 'rgba(0,0,0,0.14)' },
    { bg: 'rgba(240,235,228,0.8)', text: '#1f1f1f', accent: '#2f2f2f', shadow: 'rgba(0,0,0,0.16)' },
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
      <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;500&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .ink-landscape-container {
          font-family: 'Noto Serif SC', 'CustomPreviewFont', serif;
          background: linear-gradient(180deg, #e8e4dc 0%, #d9d4c8 30%, #c9c4b8 70%, #e0d9cc 100%);
          color: #1a1a1a;
          position: relative;
          overflow: hidden;
        }
        .ink-landscape-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background:
            radial-gradient(ellipse at 20% 30%, rgba(200,195,185,0.6) 0%, transparent 40%),
            radial-gradient(ellipse at 80% 70%, rgba(180,175,165,0.4) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 90%, rgba(190,185,175,0.5) 0%, transparent 35%);
          pointer-events: none;
        }
        .mountain-layer-1 {
          position: absolute;
          bottom: 0;
          left: -10%;
          width: 50%;
          height: 300px;
          background: linear-gradient(135deg, transparent 0%, rgba(180,175,165,0.3) 100%);
          clip-path: polygon(0 100%, 30% 20%, 60% 60%, 100% 0, 100% 100%);
          pointer-events: none;
        }
        .mountain-layer-2 {
          position: absolute;
          bottom: 0;
          right: -5%;
          width: 60%;
          height: 400px;
          background: linear-gradient(135deg, rgba(170,165,155,0.2) 0%, transparent 100%);
          clip-path: polygon(0 100%, 25% 30%, 50% 10%, 75% 40%, 100% 100%);
          pointer-events: none;
        }
        .mist-layer {
          position: absolute;
          bottom: 100px;
          left: 0;
          right: 0;
          height: 200px;
          background: linear-gradient(0deg, rgba(245,240,235,0.8) 0%, transparent 100%);
          pointer-events: none;
        }
        .ink-title {
          font-weight: 300;
          color: #1a1a1a;
          letter-spacing: 0.3em;
          line-height: 1.6;
          position: relative;
          z-index: 10;
        }
        .card-item {
          transition: all 0.3s ease;
          position: relative;
          z-index: 5;
        }
        .card-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.15);
        }
        .content-scale {
          transform-origin: center center;
        }
      `}</style>

      <div
        ref={mainRef}
        className="ink-landscape-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        <div className="mountain-layer-1"></div>
        <div className="mountain-layer-2"></div>
        <div className="mist-layer"></div>

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
            <div style={{ width: '100px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(26,26,26,0.5), transparent)', marginBottom: '20px' }}></div>
            <h1 ref={titleRef} className="text-center ink-title">
              {data.mainTitle}
            </h1>
            <div style={{ width: '100px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(26,26,26,0.5), transparent)', marginTop: '20px' }}></div>
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
                boxSizing: 'border-box',
              } as React.CSSProperties}
            >
              {data.cards.map((card, idx) => {
                const layer = inkLayers[idx % inkLayers.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: layer.bg,
                      backdropFilter: 'blur(10px)',
                      borderRadius: '4px',
                      boxShadow: `0 4px 20px ${layer.shadow}, inset 0 1px 0 rgba(255,255,255,0.3)`,
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="card-header flex items-center gap-3 mb-4">
                      <span
                        className="js-icon material-symbols-rounded"
                        style={{ color: layer.accent, fontSize: layout.iconSize }}
                      >
                        {card.icon}
                      </span>
                      <h3
                        className={`js-title font-normal leading-tight ${layout.titleSizeClass}`}
                        style={{ color: layer.text, fontFamily: "'Noto Serif SC', serif" }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-light leading-relaxed ${layout.descSizeClass}`}
                      style={{ color: layer.text, opacity: '0.8' }}
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

export const inkLandscapeTemplate: TemplateConfig = {
  id: 'inkLandscape',
  name: '水墨山水',
  description: '层层远近、气韵流动的水墨山水空间，虚实相生、可游可居',
  icon: 'landscape',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <InkLandscape data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'inkLandscape'),
};

export { InkLandscape };
