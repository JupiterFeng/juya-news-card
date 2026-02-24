import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import {
  calculateStandardLayout,
  getStandardTitleConfig,
  generateTitleFitScript,
  generateViewportFitScript,
} from '../utils/layout-calculator';

interface DigitalEffectsProps {
  data: GeneratedContent;
  scale: number;
}

const DIGITAL_COLORS = [
  { bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', text: '#00d9ff', accent: '#00ffcc', glow: 'rgba(0,217,255,0.5)' },
  { bg: 'linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%)', text: '#ff00ff', accent: '#ff6bff', glow: 'rgba(255,0,255,0.5)' },
  { bg: 'linear-gradient(135deg, #1a1a2e 0%, #0d1b2a 100%)', text: '#00ff88', accent: '#88ffaa', glow: 'rgba(0,255,136,0.5)' },
  { bg: 'linear-gradient(135deg, #16213e 0%, #1a1a2e 100%)', text: '#ffaa00', accent: '#ffcc44', glow: 'rgba(255,170,0,0.5)' },
];

const DigitalEffects: React.FC<DigitalEffectsProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const N = data?.cards?.length || 0;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);

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
        const nextScale = Math.max(0.6, maxH / contentH);
        wrapper.style.transform = `scale(${nextScale})`;
        return;
      }
      wrapper.style.transform = '';
    };

    const timer = window.setTimeout(fitViewport, 50);
    return () => window.clearTimeout(timer);
  }, [data, titleConfig]);

  return (
    <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', overflow: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Roboto+Mono:wght@400;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .digital-container {
          font-family: 'Orbitron', 'CustomPreviewFont', sans-serif;
          background: #0a0a0f;
          color: #00d9ff;
          position: relative;
          overflow: hidden;
        }
        .digital-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='grid1' x1='0%25' y1='0%25' x2='0%75' y2='0%75'%3E%3Cstop offset='0%' stop-color='%2300d9ff' stop-opacity='0.1'/%3E%3Cstop offset='100%' stop-color='%2300d9ff' stop-opacity='0'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpattern id='smallGrid' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='url(%23grid1)' stroke-width='0.5'/%3C/pattern%3E%3Crect width='200' height='200' fill='url(%23smallGrid)'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .digital-title {
          font-weight: 700;
          color: #00d9ff;
          letter-spacing: 0.15em;
          line-height: 1.2;
          position: relative;
          z-index: 10;
          text-transform: uppercase;
          text-shadow: 0 0 30px rgba(0,217,255,0.8);
          white-space: nowrap;
        }
        .card-item {
          transition: all 0.3s ease;
          position: relative;
          z-index: 5;
        }
        .card-item::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, rgba(0,217,255,0.1) 0%, transparent 70%);
          pointer-events: none;
        }
        .card-item:hover {
          box-shadow: 0 0 40px rgba(0,217,255,0.3), 0 12px 32px rgba(0,0,0,0.4) !important;
          border-color: #00d9ff !important;
        }
        .scan-line {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(0,217,255,0.8), transparent);
          animation: scan 3s linear-in-out infinite;
          pointer-events: none;
        }
        @keyframes scan {
          0%, 100% { opacity: 0; transform: translateY(-100%); }
          50% { opacity: 1; transform: translateY(100%); }
        }
        .glitch-corner {
          position: absolute;
          bottom: 10px;
          right: 10px;
          width: 16px;
          height: 16px;
          clip-path: polygon(20% 0%, 80% 0%, 100% 20%, 80% 100%, 0% 80%, 20% 80%);
          background: rgba(0,217,255,0.3);
          animation: glitch 2s steps-1 infinite;
          pointer-events: none;
        }
        @keyframes glitch {
          0%, 100% { transform: translate(0,0); }
          20% { transform: translate(-2px,2px); }
          40% { transform: translate(2px,-2px); }
          60% { transform: translate(-2px,-2px); }
          80% { transform: translate(2px,2px); }
        }

        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }

        .text-5-5xl { font-size: 3.375rem; line-height: 1.1; }
        .text-4-5xl { font-size: 2.625rem; line-height: 1.2; }
        .text-3-5xl { font-size: 2.0625rem; line-height: 1.3; }
        .text-2-5xl { font-size: 1.8125rem; line-height: 1.4; }

        .text-6xl { font-size: 3.75rem; line-height: 1; }
        .text-5xl { font-size: 3rem; line-height: 1; }
        .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
        .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
        .text-2xl { font-size: 1.5rem; line-height: 2rem; }
        .text-xl  { font-size: 1.25rem; line-height: 1.75rem; }

        .content-scale {
          transform-origin: center center;
        }
        .material-symbols-rounded { font-family: 'Material Symbols Rounded' !important; font-weight: normal; font-style: normal; display: inline-block; }
      `}</style>

      <div
        className="digital-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-20 box-border content-scale z-10"
          style={{ 
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined
          }}
        >
          <div className="flex flex-col items-center relative py-8">
            <div className="scan-line" style={{ background: 'linear-gradient(90deg, transparent, #00d9ff, transparent)' }}></div>
            <h1 
              ref={titleRef} 
              className={`text-center digital-title ${layout.titleSizeClass}`}
              style={{ fontSize: titleConfig.initialFontSize + 'px' }}
            >
              {data.mainTitle}
            </h1>
          </div>

          <div className="card-zone flex-none w-full">
            <div
              className="w-full flex flex-wrap justify-center content-center"
              style={{ 
                gap: layout.containerGap,
                '--container-gap': layout.containerGap
              } as React.CSSProperties}
            >
              {data.cards.map((card, idx) => {
                const color = DIGITAL_COLORS[idx % DIGITAL_COLORS.length];
                return (
                  <div 
                    key={idx} 
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      background: color.bg,
                      borderRadius: '12px',
                      boxShadow: `0 0 30px ${color.glow}, 0 8px 24px rgba(0,0,0,0.3)`,
                      border: `1px solid ${color.text}`,
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="scan-line"></div>
                    <div className="glitch-corner"></div>
                    <div className="card-header flex items-center gap-3 mb-4">
                      <span 
                        className="js-icon material-symbols-rounded"
                        style={{ color: color.accent, fontSize: layout.iconSize, filter: `drop-shadow(0 0 10px ${color.accent})` }}
                      >
                        {card.icon}
                      </span>
                      <h3 
                        className={`js-title font-bold leading-tight ${layout.titleSizeClass}`}
                        style={{ color: color.text, fontFamily: "'Orbitron', 'Roboto Mono', monospace", textShadow: `0 0 20px ${color.glow}` }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
                      style={{ color: color.text, opacity: 0.9 }}
                      dangerouslySetInnerHTML={{ __html: card.desc }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{
        __html: `
          ${generateTitleFitScript(titleConfig)}
          ${generateViewportFitScript()}
        `
      }} />
    </div>
  );
};

import { generateDownloadableHtml } from '../utils/template';

export const digitalEffectsTemplate: TemplateConfig = {
  id: 'digitalEffects',
  name: '数字高光效',
  description: '强光效粒子镜头光斑的数字合成风格，画面更电影化',
  icon: 'blur_on',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <DigitalEffects data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'digitalEffects'),
};

export { DigitalEffects };
