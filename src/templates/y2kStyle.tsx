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

const Y2KStyle: React.FC<{ data: GeneratedContent; scale: number }> = ({ data, scale }) => {
  const mainRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardCount = data.cards.length;

  const layout = calculateStandardLayout(cardCount);
  const titleConfig = getStandardTitleConfig(cardCount);
  const cardZoneInsetX = cardCount === 3 || (cardCount >= 5 && cardCount <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = cardCount === 2 ? '1500px' : cardCount === 3 ? '1700px' : '100%';
  const y2kColors = [
    { bg: 'linear-gradient(135deg, #00d4ff 0%, #7b2cbf 100%)', text: '#ffffff' },
    { bg: 'linear-gradient(135deg, #ff00ff 0%, #00d4ff 100%)', text: '#ffffff' },
    { bg: 'linear-gradient(135deg, #ffd700 0%, #ff6b9d 100%)', text: '#000000' },
    { bg: 'linear-gradient(135deg, #c0c0c0 0%, #e0e0e0 100%)', text: '#000000' },
    { bg: 'linear-gradient(135deg, #ff006e 0%, #8338ec 100%)', text: '#ffffff' },
    { bg: 'linear-gradient(135deg, #00f5d4 0%, #00bbf9 100%)', text: '#000000' },
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
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Nunito:wght@400;600;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'Nunito', sans-serif;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          color: #ffffff;
        }
        .y2k-title {
          font-family: 'Orbitron', sans-serif;
          font-weight: 900;
          background: linear-gradient(90deg, #00d4ff, #ff00ff, #ffd700, #00d4ff);
          background-size: 300% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 0.05em;
          line-height: 1.1;
          animation: shimmer 4s linear infinite;
          text-shadow: 0 0 30px rgba(0, 212, 255, 0.5);
        }
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }
        .card-item {
          border-radius: 20px;
          border: 3px solid rgba(255,255,255,0.3);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.4);
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .card-item:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 12px 40px rgba(0,212,255,0.4), inset 0 1px 0 rgba(255,255,255,0.4);
        }
                .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
                .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
                .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .js-desc strong { font-weight: 700; }
        .js-desc code {
          background: rgba(0,0,0,0.3);
          padding: 0.15em 0.4em; border-radius: 6px;
          font-family: 'Orbitron', monospace;
          font-size: 0.9em;
        }
        .content-scale { transform-origin: center center; }
        .material-symbols-rounded { font-family: 'Material Symbols Rounded' !important; font-weight: normal; font-style: normal; display: inline-block; }

        .y2k-star {
          position: absolute;
          pointer-events: none;
          animation: twinkle 2s ease-in-out infinite;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .chrome-effect {
          background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.3) 100%);
          -webkit-background-clip: text;
          background-clip: text;
        }
      `}</style>

      <div
        ref={mainRef}
        className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        <div className="y2k-star text-4xl" style={{ top: '10%', left: '15%', animationDelay: '0s' }}>✦</div>
        <div className="y2k-star text-3xl" style={{ top: '20%', right: '20%', animationDelay: '0.5s' }}>★</div>
        <div className="y2k-star text-2xl" style={{ bottom: '25%', left: '10%', animationDelay: '1s' }}>✧</div>
        <div className="y2k-star text-4xl" style={{ bottom: '15%', right: '15%', animationDelay: '1.5s' }}>✦</div>

        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-24 box-border content-scale relative z-10"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}
        >
          <div className="flex flex-col items-center gap-5">
            <div className="chrome-effect text-6xl font-black">Y2K</div>
            <h1 ref={titleRef} className="text-center y2k-title">
              {data.mainTitle}
            </h1>
            <div className="flex gap-3">
              <div className="w-4 h-4 rounded-full bg-[#00d4ff] shadow-[0_0_10px_#00d4ff]"></div>
              <div className="w-4 h-4 rounded-full bg-[#ff00ff] shadow-[0_0_10px_#ff00ff]"></div>
              <div className="w-4 h-4 rounded-full bg-[#ffd700] shadow-[0_0_10px_#ffd700]"></div>
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
                const color = y2kColors[idx % y2kColors.length];
                return (
                <div
                  key={idx}
                  data-card-item="true"
                  className={`card-item flex flex-col ${layout.cardWidthClass}`}
                  style={{
                    padding: layout.cardPadding,
                    background: color.bg,
                  }}
                >
                  <div className="card-header flex items-center gap-4 mb-6">
                    <span
                      className="js-icon material-symbols-rounded"
                      style={{ color: color.text, fontSize: layout.iconSize, filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.6))' }}
                    >
                      {card.icon}
                    </span>
                    <h3 className={`js-title font-bold ${layout.titleSizeClass}`} style={{ color: color.text, textShadow: '0 0 10px rgba(255,255,255,0.8)' }}>
                      {card.title}
                    </h3>
                  </div>
                  <p className={`js-desc font-medium ${layout.descSizeClass}`} style={{ color: color.text }} dangerouslySetInnerHTML={{ __html: autoAddSpaceToHtml(card.desc) }} />
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


export const y2kStyleTemplate: TemplateConfig = {
  id: 'y2kStyle',
  name: 'Y2K风格',
  description: '金属荧光液态高光未来怀旧',
  icon: 'auto_awesome',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <Y2KStyle data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'y2kStyle'),
};

export { Y2KStyle };
