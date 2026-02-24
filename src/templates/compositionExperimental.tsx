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

const COMP_COLORS = [
  { bg: '#ff6b35', text: '#1a1a1a', accent: '#f7c59f', angle: 45 },
  { bg: '#004e89', text: '#ffffff', accent: '#1a659e', angle: 90 },
  { bg: '#06d6a0', text: '#1a1a1a', accent: '#118ab2', angle: 135 },
  { bg: '#ffd166', text: '#1a1a1a', accent: '#ef476f', angle: 180 },
  { bg: '#118ab2', text: '#ffffff', accent: '#06d6a0', angle: 225 },
  { bg: '#ef476f', text: '#ffffff', accent: '#ffd166', angle: 270 },
];

interface CompositionExperimentalProps {
  data: GeneratedContent;
  scale: number;
}

const CompositionExperimental: React.FC<CompositionExperimentalProps> = ({ data, scale }) => {
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
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Roboto:wght@400;700;900&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .composition-container {
          font-family: 'Bebas Neue', 'CustomPreviewFont', sans-serif;
          background-color: #f5f5f5;
          color: #1a1a1a;
          position: relative;
          overflow: hidden;
        }
        .composition-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='28' y='0' width='4' height='60' fill='%231a1a1a' fill-opacity='0.1'/%3E%3Crect x='0' y='28' width='60' height='4' fill='%231a1a1a' fill-opacity='0.1'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .composition-title {
          font-weight: 400;
          color: #1a1a1a;
          letter-spacing: 0.15em;
          line-height: 1.1;
          position: relative;
          z-index: 10;
          text-transform: uppercase;
        }
        .card-item {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          z-index: 5;
          border: 4px solid #1a1a1a;
          display: flex;
          flex-direction: column;
        }
        .card-item:hover {
          transform: scale(1.05) rotate(0deg) !important;
          box-shadow: 12px 12px 0 rgba(0,0,0,0.2) !important;
          z-index: 10;
        }
        .geometric-shape {
          position: absolute;
          pointer-events: none;
        }
        .circle-shape {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(0,0,0,0.2);
          border-radius: 50%;
          top: -15px;
          right: -15px;
        }
        .triangle-shape {
          width: 0;
          height: 0;
          border-left: 12px solid transparent;
          border-right: 12px solid transparent;
          border-bottom: 20px solid rgba(0,0,0,0.2);
          bottom: -10px;
          left: 10px;
        }
        .diagonal-line {
          position: absolute;
          width: 100px;
          height: 2px;
          background: rgba(0,0,0,0.1);
          transform: rotate(-45deg);
          pointer-events: none;
        }
        .content-scale {
          transform-origin: center center;
        }
        .js-title {
          font-family: 'Bebas Neue', 'Arial Black', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.05em;
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

        .material-symbols-rounded { font-family: 'Material Symbols Rounded' !important; font-weight: normal; font-style: normal; display: inline-block; }
      `}</style>

      <div
        className="composition-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
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
          <div className="flex flex-col items-center mb-4">
            <div className="flex items-center gap-4 mb-2">
              <div style={{ width: '40px', height: '12px', background: '#1a1a1a' }}></div>
              <div style={{ width: '12px', height: '12px', background: '#1a1a1a', borderRadius: '50%' }}></div>
              <div style={{ width: '40px', height: '12px', background: '#1a1a1a' }}></div>
            </div>
            <h1 
              ref={titleRef} 
              className={`text-center composition-title ${layout.titleSizeClass}`}
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
                const color = COMP_COLORS[idx % COMP_COLORS.length];
                const rotation = (idx % 3 - 1) * 2;
                const borderRadius = `${idx % 2 === 0 ? 0 : 24}px ${idx % 3 === 0 ? 24 : 0}px ${idx % 2 === 0 ? 24 : 0}px ${idx % 3 === 0 ? 0 : 24}px`;
                
                return (
                  <div 
                    key={idx} 
                    className={`card-item ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: color.bg,
                      borderRadius: borderRadius,
                      boxShadow: `8px 8px 0 ${color.accent}`,
                      transform: `rotate(${rotation}deg)`,
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="geometric-shape circle-shape"></div>
                    <div className="geometric-shape triangle-shape"></div>
                    <div className="card-header flex items-center gap-3 mb-4">
                      <span 
                        className="js-icon material-symbols-rounded"
                        style={{ 
                          color: color.accent, 
                          fontSize: layout.iconSize,
                          transform: `rotate(${color.angle}deg)`
                        }}
                      >
                        {card.icon}
                      </span>
                      <h3 
                        className={`js-title font-black leading-tight ${layout.titleSizeClass}`}
                        style={{ color: color.text }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
                      style={{ color: color.text, opacity: 0.95 }}
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

export const compositionExperimentalTemplate: TemplateConfig = {
  id: 'compositionExperimental',
  name: '构图实验',
  description: '突破常规网格的动态构图风格，视觉张力与不对称平衡',
  icon: 'grid_on',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <CompositionExperimental data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'compositionExperimental'),
};

export { CompositionExperimental };
