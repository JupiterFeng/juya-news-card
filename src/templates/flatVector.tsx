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

interface FlatVectorProps {
  data: GeneratedContent;
  scale: number;
}

const FLAT_COLORS = [
  { bg: '#6c5ce7', text: '#ffffff', accent: '#a29bfe' },
  { bg: '#00b894', text: '#ffffff', accent: '#55efc4' },
  { bg: '#fd79a8', text: '#ffffff', accent: '#fab1a0' },
  { bg: '#e17055', text: '#ffffff', accent: '#ffeaa7' },
  { bg: '#0984e3', text: '#ffffff', accent: '#74b9ff' },
];

const FlatVector: React.FC<FlatVectorProps> = ({ data, scale }) => {
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
      <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .flat-vector-container {
          font-family: 'Fredoka', 'CustomPreviewFont', sans-serif;
          background-color: #f0f2f5;
        }
        .flat-vector-title {
          font-weight: 700;
          color: #2d3436;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }
        .card-item {
          border-radius: 24px;
          transition: transform 0.3s ease;
        }
        .card-item:hover {
          transform: translateY(-8px);
        }
        .content-scale { transform-origin: center center; }

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

      <div className="flat-vector-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center p-20">
        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center box-border content-scale z-10"
          style={{ 
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined
          }}
        >
          <div className="title-zone flex-none flex items-center justify-center w-full">
            <h1 
              ref={titleRef} 
              className={`text-center flat-vector-title js-title-text ${layout.titleSizeClass}`}
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
                const color = FLAT_COLORS[idx % FLAT_COLORS.length];
                return (
                  <div 
                    key={idx} 
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: color.bg,
                      color: color.text,
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 rounded-2xl bg-white/20">
                        <span 
                          className="js-icon material-symbols-rounded"
                          style={{ fontSize: layout.iconSize }}
                        >{card.icon}</span>
                      </div>
                      <h3 className={`js-title font-bold ${layout.titleSizeClass}`}>{card.title}</h3>
                    </div>
                    <p
                      className={`js-desc font-medium leading-relaxed opacity-90 ${layout.descSizeClass}`}
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

export const flatVectorTemplate: TemplateConfig = {
  id: 'flatVector',
  name: '扁平插画',
  description: '高对比度、圆角设计；适合创意演示、产品功能介绍',
  icon: 'palette',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <FlatVector data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'flatVector'),
};

export { FlatVector };
