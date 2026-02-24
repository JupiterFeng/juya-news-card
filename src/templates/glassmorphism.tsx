import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import { 
  calculateStandardLayout, 
  getStandardTitleConfig, 
  generateTitleFitScript,
  generateViewportFitScript 
} from '../utils/layout-calculator';
import { generateDownloadableHtml } from '../utils/template';

const GLASS_COLORS = [
  { accent: '#667eea', glow: 'rgba(102, 126, 234, 0.4)' },
  { accent: '#f093fb', glow: 'rgba(240, 147, 251, 0.4)' },
  { accent: '#4facfe', glow: 'rgba(79, 172, 254, 0.4)' },
  { accent: '#43e97b', glow: 'rgba(67, 233, 123, 0.4)' },
  { accent: '#fa709a', glow: 'rgba(250, 112, 154, 0.4)' },
  { accent: '#fee140', glow: 'rgba(254, 225, 64, 0.4)' },
];

const Glassmorphism: React.FC<{ data: GeneratedContent; scale: number }> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const cardCount = data?.cards?.length || 0;
  const layout = calculateStandardLayout(cardCount);
  const titleConfig = getStandardTitleConfig(cardCount);

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
        const nextScale = Math.max(0.65, maxH / contentH);
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
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'Poppins', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #ffffff;
        }
        .glass-title {
          font-weight: 600;
          color: #ffffff;
          letter-spacing: -0.02em;
          line-height: 1.1;
          text-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        .card-item {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }
        .card-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
        }
        .card-item:hover {
          background: rgba(255, 255, 255, 0.2);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }
        .js-desc strong { color: #ffffff; font-weight: 600; }
        .js-desc code {
          background: rgba(255,255,255,0.2);
          padding: 0.1em 0.3em; border-radius: 6px;
          font-family: monospace;
          font-size: 0.9em; color: #ffffff;
        }
        .content-scale { transform-origin: center center; }
        .material-symbols-rounded { font-family: 'Material Symbols Rounded' !important; font-weight: normal; font-style: normal; display: inline-block; }

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

        .glass-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.6;
          pointer-events: none;
        }
      `}</style>

      <div
        className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        <div className="glass-orb w-96 h-96 bg-[#667eea]" style={{ top: '-10%', left: '-5%' }}></div>
        <div className="glass-orb w-80 h-80 bg-[#f093fb]" style={{ bottom: '-10%', right: '-5%' }}></div>
        <div className="glass-orb w-64 h-64 bg-[#4facfe]" style={{ top: '40%', right: '10%' }}></div>

        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-24 box-border content-scale relative z-10"
          style={{ 
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined
          }}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
              <span className="material-symbols-rounded text-white" style={{ fontSize: '32px' }}>auto_awesome</span>
            </div>
            <h1 ref={titleRef} className={`text-center glass-title ${layout.titleSizeClass}`}>
              {data.mainTitle}
            </h1>
            <div className="w-24 h-1 bg-white/30 rounded-full"></div>
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
                const color = GLASS_COLORS[idx % GLASS_COLORS.length];
                return (
                  <div 
                    key={idx} 
                    className={`card-item flex flex-col ${layout.cardWidthClass} relative`}
                    style={{ padding: layout.cardPadding }}
                  >
                    <div className="card-header flex items-center gap-4 mb-6">
                      <span 
                        className="js-icon material-symbols-rounded"
                        style={{ fontSize: layout.iconSize, color: color.accent }}
                      >
                        {card.icon}
                      </span>
                      <h3 className={`js-title font-semibold ${layout.titleSizeClass}`} style={{ color: '#ffffff' }}>
                        {card.title}
                      </h3>
                    </div>
                    <p 
                      className={`js-desc font-normal ${layout.descSizeClass}`}
                      style={{ color: 'rgba(255, 255, 255, 0.8)' }}
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

export const glassmorphismTemplate: TemplateConfig = {
  id: 'glassmorphism',
  name: '玻璃拟态',
  description: '毛玻璃半透明设计风格',
  icon: 'blur_on',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <Glassmorphism data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'glassmorphism'),
};

export { Glassmorphism };
