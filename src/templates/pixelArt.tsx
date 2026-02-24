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

const PIXEL_COLORS = [
  { bg: '#3b82f6', border: '#1d4ed8', text: '#ffffff' },
  { bg: '#10b981', border: '#047857', text: '#ffffff' },
  { bg: '#f59e0b', border: '#d97706', text: '#000000' },
  { bg: '#ef4444', border: '#dc2626', text: '#ffffff' },
  { bg: '#8b5cf6', border: '#7c3aed', text: '#ffffff' },
  { bg: '#ec4899', border: '#db2777', text: '#ffffff' },
];

const PixelArt: React.FC<{ data: GeneratedContent; scale: number }> = ({ data, scale }) => {
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
      <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'VT323', monospace;
          background-color: #1a1c2c;
          background-image:
            linear-gradient(45deg, #1a1c2c 25%, transparent 25%),
            linear-gradient(-45deg, #1a1c2c 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #29366f 75%),
            linear-gradient(-45deg, transparent 75%, #29366f 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
          color: #ffffff;
        }
        .pixel-title {
          font-family: 'Press Start 2P', cursive;
          font-weight: 400;
          color: #fce94f;
          text-shadow:
            4px 4px 0 #000000,
            -2px -2px 0 #000000,
            2px -2px 0 #000000,
            -2px 2px 0 #000000;
          letter-spacing: 0.05em;
          line-height: 1.4;
        }
        .card-item {
          box-sizing: border-box;
          border-radius: 0;
          transition: transform 0.1s;
        }
        .card-item:hover {
          transform: translate(-4px, -4px);
          box-shadow: 12px 12px 0 currentColor;
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .js-desc strong { font-weight: 700; }
        .js-desc code {
          background: rgba(0,0,0,0.3);
          padding: 0.1em 0.3em;
          font-family: 'Press Start 2P', cursive;
          font-size: 0.7em;
        }
        .content-scale { transform-origin: center center; }
        .material-symbols-rounded { font-family: 'Material Symbols Rounded' !important; font-weight: normal; font-style: normal; display: inline-block; }

        .pixel-cloud {
          position: absolute;
          background: #ffffff;
          border-radius: 4px;
          opacity: 0.1;
          pointer-events: none;
        }
        .pixel-star {
          position: absolute;
          width: 8px;
          height: 8px;
          background: #fce94f;
          animation: blink 2s steps(2) infinite;
          pointer-events: none;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .game-over {
          position: absolute;
          font-family: 'Press Start 2P', cursive;
          font-size: 12px;
          color: #ef4444;
          opacity: 0.3;
          pointer-events: none;
        }
      `}</style>

      <div className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
        <div className="pixel-star" style={{ top: '8%', left: '12%', animationDelay: '0s' }}></div>
        <div className="pixel-star" style={{ top: '15%', right: '18%', animationDelay: '0.5s' }}></div>
        <div className="pixel-star" style={{ top: '25%', left: '8%', animationDelay: '1s' }}></div>
        <div className="pixel-star" style={{ bottom: '30%', right: '12%', animationDelay: '1.5s' }}></div>
        <div className="pixel-star" style={{ bottom: '20%', left: '15%', animationDelay: '2s' }}></div>
        <div className="pixel-star" style={{ top: '40%', right: '8%', animationDelay: '0.7s' }}></div>

        <div className="pixel-cloud" style={{ top: '5%', right: '10%', width: '120px', height: '40px' }}></div>
        <div className="pixel-cloud" style={{ bottom: '8%', left: '8%', width: '100px', height: '35px' }}></div>

        <div className="game-over" style={{ top: '3%', left: '3%' }}>INSERT COIN</div>
        <div className="game-over" style={{ top: '3%', right: '3%' }}>HIGH SCORE</div>

        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-24 box-border content-scale relative z-10"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="text-[#10b981] font-bold mb-2" style={{ fontFamily: 'Press Start 2P', fontSize: '14px' }}>▶ PLAYER 1 ◀</div>
            <h1 ref={titleRef} className="text-center pixel-title">
              {data.mainTitle}
            </h1>
            <div className="flex gap-3 items-center mt-2">
              <div className="w-6 h-6 bg-[#3b82f6] border-4 border-[#1d4ed8]"></div>
              <div className="w-6 h-6 bg-[#10b981] border-4 border-[#047857]"></div>
              <div className="w-6 h-6 bg-[#f59e0b] border-4 border-[#d97706]"></div>
              <div className="w-6 h-6 bg-[#ef4444] border-4 border-[#dc2626]"></div>
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
                boxSizing: 'border-box',
              } as React.CSSProperties}
            >
              {data.cards.map((card, idx) => {
                const color = PIXEL_COLORS[idx % PIXEL_COLORS.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      padding: layout.cardPadding,
                      backgroundColor: color.bg,
                      border: `4px solid ${color.border}`,
                      boxShadow: `8px 8px 0 ${color.border}`,
                      color: color.border,
                    }}
                  >
                    <div className="card-header flex items-center gap-4 mb-6">
                      <span
                        className="js-icon material-symbols-rounded"
                        style={{
                          color: color.text,
                          fontSize: layout.iconSize,
                          imageRendering: 'pixelated'
                        }}
                      >
                        {card.icon}
                      </span>
                      <h3 className={`js-title font-bold ${layout.titleSizeClass}`} style={{ color: color.text }}>
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-medium ${layout.descSizeClass}`}
                      style={{ color: color.text }}
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

export const pixelArtTemplate: TemplateConfig = {
  id: 'pixelArt',
  name: '像素风',
  description: '像素化游戏感块状图形',
  icon: 'grid_on',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <PixelArt data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'pixelArt'),
};

export { PixelArt };
