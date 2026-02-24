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

const TerminalCli: React.FC<{ data: GeneratedContent; scale: number }> = ({ data, scale }) => {
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
      <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          background-color: #0a0a0a;
          color: #00ff00;
        }
        .terminal-title {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 500;
          color: #00ff00;
          text-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
          letter-spacing: 0.05em;
          line-height: 1.2;
        }
        .cursor {
          display: inline-block;
          width: 12px;
          height: 1.2em;
          background: #00ff00;
          margin-left: 4px;
          animation: blink 1s step-end infinite;
          vertical-align: text-bottom;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .card-item {
          border-radius: 4px;
          transition: all 0.2s;
        }
        .card-item:hover {
          background-color: rgba(0, 255, 0, 0.1) !important;
          box-shadow: 0 0 20px rgba(0, 255, 0, 0.2) !important;
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .js-desc strong { font-weight: 600; color: #00ff00; }
        .js-desc code {
          background: rgba(0, 255, 0, 0.15);
          padding: 0.1em 0.3em;
          font-family: 'Fira Code', monospace;
          font-size: 0.9em;
          color: #00ff00;
          border: 1px solid rgba(0, 255, 0, 0.3);
        }
        .content-scale { transform-origin: center center; }
        .material-symbols-rounded { font-family: 'Material Symbols Rounded' !important; font-weight: normal; font-style: normal; display: inline-block; }

        .scanline {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.15),
            rgba(0, 0, 0, 0.15) 1px,
            transparent 1px,
            transparent 2px
          );
          pointer-events: none;
          z-index: 100;
        }
        .flicker {
          animation: flicker 0.15s infinite;
        }
        @keyframes flicker {
          0% { opacity: 0.97; }
          50% { opacity: 1; }
          100% { opacity: 0.98; }
        }
        .prompt-symbol {
          color: #00ff00;
          font-weight: 600;
        }
        .card-header::before {
          content: '$ ';
          color: #00ff00;
          font-family: 'JetBrains Mono', monospace;
        }
      `}</style>

      <div
        ref={mainRef}
        className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center flicker"
      >
        <div className="scanline"></div>

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
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#666666]">root@dev</span>
              <span className="text-[#00ff00]">:</span>
              <span className="text-[#6699ff]">~</span>
              <span className="prompt-symbol">$</span>
              <span className="text-[#00ff00]">./generate.sh --title</span>
              <span className="cursor"></span>
            </div>
            <h1 ref={titleRef} className="text-center terminal-title">
              {data.mainTitle}
            </h1>
            <div className="flex items-center gap-4 text-xs mt-2">
              <span className="text-[#666666]">[</span>
              <span className="text-[#00ff00]">OK</span>
              <span className="text-[#666666]">]</span>
              <span className="text-[#666666]">Build completed in 0.042s</span>
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
              {data.cards.map((card, idx) => (
                <div
                  key={idx}
                  data-card-item="true"
                  className={`card-item flex flex-col ${layout.cardWidthClass}`}
                  style={{
                    backgroundColor: 'rgba(0, 255, 0, 0.05)',
                    border: '1px solid rgba(0, 255, 0, 0.3)',
                    boxShadow: '0 0 10px rgba(0, 255, 0, 0.1)',
                    padding: layout.cardPadding,
                  }}
                >
                  <div className="card-header flex items-center gap-3 mb-5">
                    <span className="js-icon material-symbols-rounded" style={{ color: '#00ff00', fontSize: layout.iconSize }}>
                      {card.icon}
                    </span>
                    <h3 className={`js-title font-bold ${layout.titleSizeClass}`} style={{ color: '#00ff00' }}>
                      {card.title}
                    </h3>
                  </div>
                  <p
                    className={`js-desc font-normal ${layout.descSizeClass}`}
                    style={{ color: '#00cc00' }}
                    dangerouslySetInnerHTML={{ __html: autoAddSpaceToHtml(card.desc) }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 text-xs text-[#666666] z-20">
          <span className="text-[#00ff00]">❯</span> bash — 80×24
        </div>
        <div className="absolute bottom-4 right-4 text-xs text-[#666666] z-20">PID: 1337 | MEM: 18%</div>
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

export const terminalCliTemplate: TemplateConfig = {
  id: 'terminalCli',
  name: '终端风格',
  description: '等宽字体绿色荧光极客气质',
  icon: 'terminal',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <TerminalCli data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'terminalCli'),
};

export { TerminalCli };
