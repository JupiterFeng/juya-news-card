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

/**
 * InclusiveDesign 渲染组件
 * 包容性/通用设计：默认考虑不同能力、设备、环境
 * 特点：高对比度、大字体、清晰边界、多模态支持、无障碍标记
 */
interface InclusiveDesignProps {
  data: GeneratedContent;
  scale: number;
}

const INCLUSIVE_COLORS = [
  { bg: '#FFFFFF', fg: '#000000', accent: '#0052CC', border: '#000000', name: 'classic' },
  { bg: '#F4F4F4', fg: '#1A1A1A', accent: '#0066CC', border: '#1A1A1A', name: 'high-contrast' },
  { bg: '#FFFFFF', fg: '#000000', accent: '#00875A', border: '#000000', name: 'accessible' },
  { bg: '#FAFAFA', fg: '#0A0A0A', accent: '#FF991F', border: '#0A0A0A', name: 'vision' },
  { bg: '#FFFFFF', fg: '#1B1B1B', accent: '#DE350B', border: '#1B1B1B', name: 'colorblind' },
  { bg: '#EBECF0', fg: '#172B4D', accent: '#0052CC', border: '#172B4D', name: 'atlassian' },
];

const InclusiveDesign: React.FC<InclusiveDesignProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  
  const layout = calculateStandardLayout(data.cards.length);
  const titleConfig = getStandardTitleConfig(data.cards.length);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    
    const timer = window.setTimeout(() => {
      if (typeof (window as any).fitTitle === 'function') (window as any).fitTitle();
      if (typeof (window as any).fitViewport === 'function') (window as any).fitViewport();
    }, 50);
    
    return () => window.clearTimeout(timer);
  }, [data]);

  return (
    <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', overflow: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'Inter', 'Roboto', 'CustomPreviewFont', sans-serif;
          background: linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%);
          color: #000000;
          position: relative;
        }
        .main-container::before {
          content: '♿';
          position: absolute;
          top: 24px;
          left: 24px;
          font-size: 32px;
          opacity: 0.3;
        }
        .main-container::after {
          content: 'WCAG AAA';
          position: absolute;
          top: 24px;
          right: 24px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #00875A;
          background: #E3FCEF;
          padding: 6px 12px;
          border-radius: 6px;
          border: 2px solid #00875A;
        }
        .inclusive-title {
          font-weight: 700;
          color: #000000;
          letter-spacing: 0.02em;
          line-height: 1.2;
          position: relative;
          padding: 0 48px;
        }
        .inclusive-title::before,
        .inclusive-title::after {
          content: '🌐';
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          font-size: 24px;
        }
        .inclusive-title::before { left: -40px; }
        .inclusive-title::after { right: -40px; content: '🫂'; }
        .card-item {
          position: relative;
        }
        .card-item::before {
          content: 'A11Y';
          position: absolute;
          top: -2px;
          left: -2px;
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          font-weight: 700;
          color: #fff;
          background: #00875A;
          padding: 3px 6px;
          border-radius: 6px 0 6px 0;
        }
        .card-item:hover {
          outline: 4px solid #0052CC;
          outline-offset: 2px;
          transform: translateY(-4px);
        }
        .card-item:focus-within {
          outline: 4px solid #0052CC;
          outline-offset: 2px;
        }
                .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
                .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
                .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .content-scale { transform-origin: center center; }
      `}</style>

      <div className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-24 box-border content-scale z-10"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}
        >
          <div className="title-zone flex-none flex items-center justify-center w-full">
            <h1 
              ref={titleRef} 
              className="text-center inclusive-title js-title-text"
              style={{ fontSize: titleConfig.initialFontSize + 'px' }}
            >
              {data.mainTitle}
            </h1>
          </div>

          <div className="card-zone flex-none w-full">
            <div className="w-full flex flex-wrap justify-center content-center" style={{ gap: layout.containerGap, '--container-gap': layout.containerGap } as React.CSSProperties}>
              {data.cards.map((card, idx) => {
                const color = INCLUSIVE_COLORS[idx % INCLUSIVE_COLORS.length];
                return (
                  <div 
                    key={idx} 
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: color.bg,
                      borderRadius: '12px',
                      border: `3px solid ${color.border}`,
                      boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                      padding: layout.cardPadding,
                      minHeight: '200px',
                    }}
                  >
                    <div className="card-header flex items-center gap-5 mb-5">
                      <span 
                        className="js-icon material-symbols-rounded"
                        style={{ 
                          color: '#FFFFFF', 
                          fontSize: layout.iconSize,
                          width: layout.iconSize,
                          height: layout.iconSize,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '12px',
                          backgroundColor: color.accent,
                          border: `2px solid ${color.border}`
                        }}
                      >{card.icon}</span>
                      <h3 
                        className={`js-title font-bold leading-tight ${layout.titleSizeClass}`}
                        style={{ 
                          color: color.fg,
                          fontFamily: "'Inter', 'Roboto', sans-serif",
                          letterSpacing: '0.01em',
                          lineHeight: '1.3'
                        }}
                      >{card.title}</h3>
                    </div>
                    <p
                      className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
                      style={{ 
                        color: color.fg,
                        fontFamily: "'Inter', sans-serif",
                        lineHeight: '1.6',
                        opacity: 0.85 
                      }}
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

export const inclusiveDesignTemplate: TemplateConfig = {
  id: 'inclusiveDesign',
  name: '包容性通用设计',
  description: '高对比度、大字体、清晰边界的无障碍设计',
  icon: 'accessibility',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <InclusiveDesign data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'inclusiveDesign'),
};

export { InclusiveDesign };
