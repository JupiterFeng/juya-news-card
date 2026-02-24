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

const Vaporwave: React.FC<{ data: GeneratedContent; scale: number }> = ({ data, scale }) => {
  const mainRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardCount = data.cards.length;

  const layout = calculateStandardLayout(cardCount);
  const titleConfig = getStandardTitleConfig(cardCount);
  const cardZoneInsetX = cardCount === 3 || (cardCount >= 5 && cardCount <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = cardCount === 2 ? '1500px' : cardCount === 3 ? '1700px' : '100%';
  const vaporColors = [
    { bg: 'rgba(255, 0, 128, 0.85)', border: '#ff0080' },
    { bg: 'rgba(128, 0, 255, 0.85)', border: '#8000ff' },
    { bg: 'rgba(0, 255, 255, 0.85)', border: '#00ffff' },
    { bg: 'rgba(255, 0, 255, 0.85)', border: '#ff00ff' },
    { bg: 'rgba(255, 105, 180, 0.85)', border: '#ff69b4' },
    { bg: 'rgba(186, 85, 211, 0.85)', border: '#ba55d3' },
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
      <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Exo+2:wght@400;600;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'Exo 2', sans-serif;
          background: linear-gradient(180deg, #0d0221 0%, #190035 30%, #2d1b4e 60%, #1a0a2e 100%);
          color: #ffffff;
        }
        .vapor-title {
          font-family: 'Press Start 2P', cursive;
          font-weight: 400;
          color: #ff00ff;
          text-shadow:
            0 0 10px #ff00ff,
            0 0 20px #ff00ff,
            0 0 40px #ff00ff,
            3px 3px 0 #00ffff;
          letter-spacing: 0.05em;
          line-height: 1.3;
        }
        .card-item {
          border-radius: 8px;
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .card-item:hover {
          transform: translateY(-4px) rotate(1deg);
        }
                .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
                .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
                .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .js-desc strong { font-weight: 700; color: #00ffff; }
        .js-desc code {
          background: rgba(0,255,255,0.2);
          padding: 0.15em 0.4em; border-radius: 4px;
          font-family: 'Press Start 2P', cursive;
          font-size: 0.7em; color: #00ffff;
        }
        .content-scale { transform-origin: center center; }
        .material-symbols-rounded { font-family: 'Material Symbols Rounded' !important; font-weight: normal; font-style: normal; display: inline-block; }

        .vapor-grid {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 40%;
          background: linear-gradient(180deg, transparent 0%, rgba(255,0,255,0.1) 100%);
          background-image:
            linear-gradient(rgba(255,0,255,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,0,255,0.3) 1px, transparent 1px);
          background-size: 50px 50px;
          transform: perspective(500px) rotateX(60deg);
          transform-origin: bottom center;
          pointer-events: none;
        }
        .vapor-sun {
          position: absolute;
          bottom: 25%;
          left: 50%;
          transform: translateX(-50%);
          width: 200px;
          height: 200px;
          background: linear-gradient(180deg, #ff6b00 0%, #ff0080 50%, #8000ff 100%);
          border-radius: 50%;
          filter: blur(2px);
          pointer-events: none;
        }
        .vapor-sun::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 50%;
          background: repeating-linear-gradient(
            0deg,
            #ff6b00 0px,
            #ff0080 4px,
            #8000ff 8px,
            #ff6b00 12px
          );
          clip-path: polygon(0 50%, 100% 50%, 100% 100%, 0 100%);
        }
        .palm-leaf {
          position: absolute;
          font-size: 80px;
          opacity: 0.6;
          pointer-events: none;
        }
      `}</style>

      <div
        ref={mainRef}
        className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        <div className="vapor-grid"></div>
        <div className="vapor-sun"></div>
        <div className="palm-leaf" style={{ top: '5%', left: '5%' }}>🌴</div>
        <div className="palm-leaf" style={{ top: '10%', right: '8%' }}>🌴</div>

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
            <div className="text-sm text-[#00ffff] font-bold" style={{ fontFamily: 'Press Start 2P', letterSpacing: '0.1em' }}>ＶＡＰＯＲＷＡＶＥ</div>
            <h1 ref={titleRef} className="text-center vapor-title">
              {data.mainTitle}
            </h1>
            <div className="flex gap-4 items-center">
              <span className="text-2xl">●</span>
              <span className="text-3xl">◐</span>
              <span className="text-2xl">◆</span>
              <span className="text-3xl">◐</span>
              <span className="text-2xl">●</span>
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
                const color = vaporColors[idx % vaporColors.length];
                return (
                <div
                  key={idx}
                  data-card-item="true"
                  className={`card-item flex flex-col ${layout.cardWidthClass}`}
                  style={{
                    padding: layout.cardPadding,
                    backgroundColor: color.bg,
                    border: `3px solid ${color.border}`,
                    boxShadow: `0 0 20px ${color.border}40, inset 0 0 20px ${color.border}20`,
                  }}
                >
                  <div className="card-header flex items-center gap-4 mb-6">
                    <span
                      className="js-icon material-symbols-rounded"
                      style={{ color: '#ffffff', fontSize: layout.iconSize, filter: 'drop-shadow(2px 2px 0 #000000)' }}
                    >
                      {card.icon}
                    </span>
                    <h3 className={`js-title font-bold ${layout.titleSizeClass}`} style={{ color: '#ffffff', textShadow: '2px 2px 0 #000000, -1px -1px 0 #000000' }}>
                      {card.title}
                    </h3>
                  </div>
                  <p className={`js-desc font-medium ${layout.descSizeClass}`} style={{ color: '#ffffff', textShadow: '1px 1px 0 #000000' }} dangerouslySetInnerHTML={{ __html: autoAddSpaceToHtml(card.desc) }} />
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


export const vaporwaveTemplate: TemplateConfig = {
  id: 'vaporwave',
  name: '蒸汽波',
  description: '霓虹紫粉复古3D超现实',
  icon: 'palette',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <Vaporwave data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'vaporwave'),
};

export { Vaporwave };
