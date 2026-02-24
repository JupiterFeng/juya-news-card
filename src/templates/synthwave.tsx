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

const Synthwave: React.FC<{ data: GeneratedContent; scale: number }> = ({ data, scale }) => {
  const mainRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardCount = data.cards.length;

  const layout = calculateStandardLayout(cardCount);
  const titleConfig = getStandardTitleConfig(cardCount);
  const cardZoneInsetX = cardCount === 3 || (cardCount >= 5 && cardCount <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = cardCount === 2 ? '1500px' : cardCount === 3 ? '1700px' : '100%';
  const synthColors = [
    { bg: 'linear-gradient(135deg, #ff006e 0%, #8338ec 100%)', border: '#ff006e' },
    { bg: 'linear-gradient(135deg, #fb5607 0%, #ff006e 100%)', border: '#fb5607' },
    { bg: 'linear-gradient(135deg, #ffbe0b 0%, #fb5607 100%)', border: '#ffbe0b' },
    { bg: 'linear-gradient(135deg, #3a86ff 0%, #8338ec 100%)', border: '#3a86ff' },
    { bg: 'linear-gradient(135deg, #06ffa5 0%, #3a86ff 100%)', border: '#06ffa5' },
    { bg: 'linear-gradient(135deg, #ff006e 0%, #06ffa5 100%)', border: '#ff006e' },
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
      <link href="https://fonts.googleapis.com/css2?family=Righteous&family=Rajdhani:wght@400;500;600;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'Rajdhani', sans-serif;
          background: linear-gradient(180deg, #0d0221 0%, #1a0a2e 40%, #2d1b4e 70%, #1a0a2e 100%);
          color: #ffffff;
        }
        .synth-title {
          font-family: 'Righteous', cursive;
          font-weight: 400;
          background: linear-gradient(180deg, #ffbe0b 0%, #ff006e 50%, #8338ec 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 0.08em;
          line-height: 1.1;
          text-shadow: none;
          filter: drop-shadow(0 0 20px rgba(255, 0, 110, 0.8));
        }
        .card-item {
          border-radius: 12px;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3), 0 0 20px rgba(255,0,110,0.2);
          transition: all 0.3s;
        }
        .card-item:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 48px rgba(0,0,0,0.4), 0 0 40px rgba(255,0,110,0.4);
        }
                .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
                .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
                .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .js-desc strong { font-weight: 700; color: #ffbe0b; }
        .js-desc code {
          background: rgba(255,190,11,0.2);
          padding: 0.15em 0.4em; border-radius: 4px;
          font-family: 'Rajdhani', monospace;
          font-size: 0.9em; color: #ffbe0b;
        }
        .content-scale { transform-origin: center center; }
        .material-symbols-rounded { font-family: 'Material Symbols Rounded' !important; font-weight: normal; font-style: normal; display: inline-block; }

        .synth-grid {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 35%;
          background:
            linear-gradient(90deg, rgba(255,0,110,0.3) 1px, transparent 1px),
            linear-gradient(rgba(255,0,110,0.3) 1px, transparent 1px);
          background-size: 60px 30px;
          transform: perspective(400px) rotateX(70deg) translateY(50%);
          transform-origin: bottom center;
          pointer-events: none;
          animation: gridMove 20s linear infinite;
        }
        @keyframes gridMove {
          0% { background-position: 0 0; }
          100% { background-position: 60px 30px; }
        }
        .synth-sun {
          position: absolute;
          bottom: 30%;
          left: 50%;
          transform: translateX(-50%);
          width: 180px;
          height: 180px;
          background: linear-gradient(180deg, #ffbe0b 0%, #ff006e 60%);
          border-radius: 50%;
          pointer-events: none;
          box-shadow: 0 0 60px rgba(255, 190, 11, 0.6);
        }
        .synth-sun::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 60%;
          background: repeating-linear-gradient(
            0deg,
            #ffbe0b 0px,
            #ff006e 6px,
            #8338ec 12px
          );
          border-radius: 0 0 50% 50%;
        }
        .stars {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 60%;
          background-image:
            radial-gradient(2px 2px at 20px 30px, #ffffff, transparent),
            radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 90px 40px, #ffffff, transparent),
            radial-gradient(2px 2px at 160px 120px, rgba(255,255,255,0.9), transparent),
            radial-gradient(1px 1px at 230px 80px, #ffffff, transparent),
            radial-gradient(2px 2px at 300px 150px, rgba(255,255,255,0.7), transparent),
            radial-gradient(1px 1px at 370px 50px, #ffffff, transparent),
            radial-gradient(2px 2px at 450px 180px, rgba(255,255,255,0.8), transparent);
          background-repeat: repeat;
          background-size: 500px 200px;
          pointer-events: none;
          animation: twinkle 4s ease-in-out infinite;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        .neon-line {
          position: absolute;
          height: 2px;
          background: linear-gradient(90deg, transparent, #ff006e, #8338ec, #3a86ff, transparent);
          box-shadow: 0 0 10px #ff006e, 0 0 20px #ff006e;
          pointer-events: none;
        }
      `}</style>

      <div
        ref={mainRef}
        className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        <div className="stars"></div>
        <div className="synth-grid"></div>
        <div className="synth-sun"></div>
        <div className="neon-line" style={{ top: '15%', left: '0', right: '0' }}></div>
        <div className="neon-line" style={{ bottom: '15%', left: '0', right: '0' }}></div>

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
            <div className="text-xs tracking-widest text-[#ffbe0b] font-bold uppercase">Retro Future</div>
            <h1 ref={titleRef} className="text-center synth-title">
              {data.mainTitle}
            </h1>
            <div className="flex gap-4 items-center">
              <div className="w-12 h-1 bg-gradient-to-r from-transparent via-[#ff006e] to-transparent"></div>
              <span className="text-2xl" style={{ textShadow: '0 0 10px #ff006e' }}>◆</span>
              <div className="w-12 h-1 bg-gradient-to-r from-transparent via-[#8338ec] to-transparent"></div>
            </div>
          </div>

          <div className="card-zone flex-none w-full">
            <div
              data-card-zone="true"
              className="w-full flex flex-wrap justify-center content-center gap-5"
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
                const color = synthColors[idx % synthColors.length];
                return (
                <div
                  key={idx}
                  data-card-item="true"
                  className={`card-item flex flex-col ${layout.cardWidthClass}`}
                  style={{
                    padding: layout.cardPadding,
                    background: color.bg,
                    border: `2px solid ${color.border}`,
                  }}
                >
                  <div className="card-header flex items-center gap-4 mb-6">
                    <span
                      className="js-icon material-symbols-rounded"
                      style={{ color: '#ffffff', fontSize: layout.iconSize, filter: 'drop-shadow(0 0 8px currentColor)' }}
                    >
                      {card.icon}
                    </span>
                    <h3 className={`js-title font-bold ${layout.titleSizeClass}`} style={{ color: '#ffffff', textShadow: '0 0 10px currentColor, 0 0 20px currentColor' }}>
                      {card.title}
                    </h3>
                  </div>
                  <p className={`js-desc font-medium ${layout.descSizeClass}`} style={{ color: '#ffffff' }} dangerouslySetInnerHTML={{ __html: autoAddSpaceToHtml(card.desc) }} />
                </div>
              )})}
            </div>
          </div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: generateTitleFitScript(titleConfig) }} />
      <script dangerouslySetInnerHTML={{ __html: generateViewportFitScript() }} />
    </div>
  );
};


export const synthwaveTemplate: TemplateConfig = {
  id: 'synthwave',
  name: '合成波',
  description: '80s霓虹网格地平线夜景',
  icon: 'nightlight',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <Synthwave data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'synthwave'),
};

export { Synthwave };
