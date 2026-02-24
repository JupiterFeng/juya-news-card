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
 * DuotonePhotography 渲染组件
 * 双色摄影风格 - 用双色覆盖统一品牌调性
 */
interface DuotonePhotographyProps {
  data: GeneratedContent;
  scale: number;
}

const DUOTONE_THEMES = [
  { light: '#e0f2fe', dark: '#0c4a6e', accent: '#0284c7', name: 'ocean' },     // 海洋蓝
  { light: '#fef3c7', dark: '#78350f', accent: '#d97706', name: 'sunset' },    // 日落橙
  { light: '#dcfce7', dark: '#14532d', accent: '#16a34a', name: 'forest' },    // 森林绿
  { light: '#f3e8ff', dark: '#581c87', accent: ' #9333ea', name: 'royal' },    // 皇家紫
  { light: '#ffe4e6', dark: '#881337', accent: '#e11d48', name: 'crimson' },   // 绯红
  { light: '#ecfdf5', dark: '#134e4a', accent: '#0d9488', name: 'teal' },      // 青绿
];

const DuotonePhotography: React.FC<DuotonePhotographyProps> = ({ data, scale }) => {
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
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'DM Sans', 'CustomPreviewFont', system-ui, sans-serif;
          background: #f8fafc;
          color: #0f172a;
        }
        .duotone-title {
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.03em;
          line-height: 1.1;
        }
        .card-item {
          border-radius: 16px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .card-item::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%);
          pointer-events: none;
        }
        .icon-bg {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
                .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
                .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
                .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }

        .js-desc strong { font-weight: 700; }
        .js-desc code {
          background: rgba(0,0,0,0.12);
          padding: 0.15em 0.4em;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
          font-weight: 600;
        }
        .content-scale { transform-origin: center center; }

        .bg-shape {
          position: absolute;
          border-radius: 50%;
          opacity: 0.4;
          pointer-events: none;
        }
        .shape-1 {
          width: 400px;
          height: 400px;
          top: -100px;
          right: -100px;
          background: linear-gradient(135deg, #0c4a6e 0%, #0284c7 100%);
          filter: blur(80px);
        }
        .shape-2 {
          width: 350px;
          height: 350px;
          bottom: -80px;
          left: -80px;
          background: linear-gradient(135deg, #78350f 0%, #d97706 100%);
          filter: blur(70px);
        }

        .icon-bg-ocean { background: #0c4a6e; }
        .icon-bg-sunset { background: #78350f; }
        .icon-bg-forest { background: #14532d; }
        .icon-bg-royal { background: #581c87; }
        .icon-bg-crimson { background: #881337; }
        .icon-bg-teal { background: #134e4a; }

        .icon-bg-ocean .js-icon { color: #e0f2fe; }
        .icon-bg-sunset .js-icon { color: #fef3c7; }
        .icon-bg-forest .js-icon { color: #dcfce7; }
        .icon-bg-royal .js-icon { color: #f3e8ff; }
        .icon-bg-crimson .js-icon { color: #ffe4e6; }
        .icon-bg-teal .js-icon { color: #ecfdf5; }
      `}</style>

      <div className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>

        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-20 box-border content-scale relative z-10"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}
        >
          <div className="title-zone flex-none flex items-center justify-center w-full">
            <h1 
              ref={titleRef} 
              className="text-center duotone-title js-title-text"
              style={{ fontSize: titleConfig.initialFontSize + 'px' }}
            >
              {data.mainTitle}
            </h1>
          </div>

          <div className="card-zone flex-none w-full">
            <div className="w-full flex flex-wrap justify-center content-center" style={{ gap: layout.containerGap, '--container-gap': layout.containerGap } as React.CSSProperties}>
              {data.cards.map((card, idx) => {
                const theme = DUOTONE_THEMES[idx % DUOTONE_THEMES.length];
                return (
                  <div 
                    key={idx} 
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: theme.light,
                      color: theme.dark,
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`icon-bg icon-bg-${theme.name}`}>
                        <span 
                          className="js-icon material-symbols-rounded"
                          style={{ fontSize: layout.iconSize }}
                        >{card.icon}</span>
                      </div>
                      <h3 className={`js-title font-bold ${layout.titleSizeClass}`} style={{ color: theme.dark }}>{card.title}</h3>
                    </div>
                    <p
                      className={`js-desc font-medium leading-relaxed ${layout.descSizeClass}`}
                      style={{ color: theme.dark, opacity: 0.85 }}
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

export const duotonePhotographyTemplate: TemplateConfig = {
  id: 'duotonePhotography',
  name: '双色摄影',
  description: '用双色覆盖统一品牌调性；适合活动页、招聘页、专题封面',
  icon: 'filter_vintage',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <DuotonePhotography data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'duotonePhotography'),
};

export { DuotonePhotography };
