import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import {
  calculateStandardLayout,
  getStandardTitleConfig,
  getCardThemeColor,
  generateTitleFitScript,
  generateViewportFitScript,
} from '../utils/layout-calculator';

interface DynamicExplosionProps {
  data: GeneratedContent;
  scale: number;
}

const DYNAMIC_COLORS = [
  { bg: 'linear-gradient(135deg, #ff4757 0%, #ff6348 100%)', text: '#ffffff', accent: '#ffa502', speed: 'fast' },
  { bg: 'linear-gradient(135deg, #2ed573 0%, #7bed9f 100%)', text: '#1a1a1a', accent: '#ff4757', speed: 'medium' },
  { bg: 'linear-gradient(135deg, #3742fa 0%, #5352ed 100%)', text: '#ffffff', accent: '#ffa502', speed: 'fast' },
  { bg: 'linear-gradient(135deg, #ffa502 0%, #ff7f50 100%)', text: '#1a1a1a', accent: '#2ed573', speed: 'medium' },
  { bg: 'linear-gradient(135deg, #ff6b81 0%, #ff4757 100%)', text: '#ffffff', accent: '#3742fa', speed: 'fast' },
];

const DynamicExplosion: React.FC<DynamicExplosionProps> = ({ data, scale }) => {
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
      <link href="https://fonts.googleapis.com/css2?family=Anton&family=Roboto:wght@400;700;900&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .dynamic-container {
          font-family: 'Anton', 'CustomPreviewFont', sans-serif;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          color: #ffffff;
          position: relative;
          overflow: hidden;
        }
        .dynamic-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 20% 30%, rgba(255,71,87,0.3) 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(46,213,115,0.2) 0%, transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(255,165,2,0.15) 0%, transparent 50%);
          pointer-events: none;
        }
        .dynamic-title {
          font-weight: 400;
          color: #ffffff;
          letter-spacing: '0.1em';
          line-height: 1.1;
          position: relative;
          z-index: 10;
          text-transform: uppercase;
          font-style: italic;
          text-shadow: 4px 4px 0 rgba(0,0,0,0.3), 0 0 40px rgba(255,71,87,0.5);
        }
        .card-item {
          transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          position: relative;
          z-index: 5;
        }
        .card-item:hover {
          transform: skewX(0deg) scale(1.1) translateY(-10px) !important;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5) !important;
        }
        .speed-lines {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          overflow: hidden;
          pointer-events: none;
        }
        .speed-line {
          position: absolute;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
          animation: speed 1s linear infinite;
        }
        .burst-element {
          position: absolute;
          pointer-events: none;
        }
        .burst-star {
          width: 8px;
          height: 8px;
          background: #ffa502;
          clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
          animation: burst 2s ease-in-out infinite;
        }
        @keyframes speed {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(200%); opacity: 0; }
        }
        @keyframes burst {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
          50% { transform: scale(1.5) rotate(180deg); opacity: 0.7; }
        }
        @keyframes pulse-0 {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes pulse-1 {
          0%, 100% { transform: scale(1) rotate(-10deg); }
          50% { transform: scale(1.15) rotate(10deg); }
        }
        @keyframes pulse-2 {
          0%, 100% { transform: scale(0.95); }
          50% { transform: scale(1.05) rotate(5deg); }
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
        className="dynamic-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
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
          <div className="flex flex-col items-center">
            <div className="burst-element burst-star" style={{ top: '-20px', left: '-40px', animationDelay: '0s' }}></div>
            <div className="burst-element burst-star" style={{ top: '-30px', right: '-50px', animationDelay: '0.5s' }}></div>
            <h1 
              ref={titleRef} 
              className={`text-center dynamic-title ${layout.titleSizeClass}`}
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
                const color = getCardThemeColor(DYNAMIC_COLORS, idx);
                return (
                  <div 
                    key={idx} 
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      background: color.bg,
                      borderRadius: '20px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                      transform: `skewX(${(idx % 3 - 1) * -3}deg)`,
                      padding: layout.cardPadding
                    }}
                  >
                    <div className="speed-lines">
                      <div className="speed-line" style={{ top: '20%', width: '60px', animationDelay: `${idx * 0.1}s` }}></div>
                      <div className="speed-line" style={{ top: '60%', width: '40px', animationDelay: `${idx * 0.1 + 0.3}s` }}></div>
                    </div>
                    <div className="burst-element burst-star" style={{ top: '5px', right: '5px', animationDelay: `${idx * 0.2}s` }}></div>
                    <div className="card-header flex items-center gap-3 mb-4">
                      <span 
                        className="js-icon material-symbols-rounded"
                        style={{
                          color: color.accent,
                          fontSize: layout.iconSize,
                          animation: `pulse-${idx % 3} 1.5s ease-in-out infinite`
                        }}
                      >
                        {card.icon}
                      </span>
                      <h3 
                        className={`js-title font-black leading-tight ${layout.titleSizeClass}`}
                        style={{
                          color: color.text,
                          fontFamily: "'Anton', 'Arial Black', sans-serif",
                          textTransform: 'uppercase',
                          fontStyle: 'italic'
                        }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-bold leading-relaxed ${layout.descSizeClass}`}
                      style={{ color: color.text }}
                      dangerouslySetInnerHTML={{ __html: card.desc }}
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

import { generateDownloadableHtml } from '../utils/template';

export const dynamicExplosionTemplate: TemplateConfig = {
  id: 'dynamicExplosion',
  name: '动势爆发',
  description: '夸张变形速度线的爆发动势风格，能量释放与视觉冲击',
  icon: 'flash_on',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <DynamicExplosion data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'dynamicExplosion'),
};

export { DynamicExplosion };
