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

const Neumorphism: React.FC<{ data: GeneratedContent; scale: number }> = ({ data, scale }) => {
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
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'Nunito', sans-serif;
          background-color: #e0e5ec;
          color: #4a5568;
        }
        .neu-title {
          font-weight: 600;
          color: #4a5568;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }
        .card-item {
          background: #e0e5ec;
          border-radius: 20px;
          box-shadow: 8px 8px 16px #b8bec7, -8px -8px 16px #ffffff;
          transition: all 0.3s ease;
        }
        .card-item:hover {
          box-shadow: 12px 12px 20px #b8bec7, -12px -12px 20px #ffffff;
        }
        .js-desc strong { color: #2d3748; font-weight: 600; }
        .js-desc code {
          background: #e0e5ec;
          padding: 0.2em 0.4em; border-radius: 8px;
          box-shadow: inset 3px 3px 6px #b8bec7, inset -3px -3px 6px #ffffff;
          font-family: monospace;
          font-size: 0.9em; color: #667eea;
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

        .neu-button {
          background: #e0e5ec;
          box-shadow: 5px 5px 10px #b8bec7, -5px -5px 10px #ffffff;
          border-radius: 50px;
        }
      `}</style>

      <div
        className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-24 box-border content-scale"
          style={{ 
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined
          }}
        >
          <div className="flex flex-col items-center gap-5">
            <div className="neu-button w-16 h-16 flex items-center justify-center">
              <span className="material-symbols-rounded" style={{ color: '#667eea', fontSize: '32px' }}>auto_awesome</span>
            </div>
            <h1 ref={titleRef} className={`text-center neu-title ${layout.titleSizeClass}`}>
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
              {data.cards.map((card, idx) => (
                <div 
                  key={idx} 
                  className={`card-item flex flex-col ${layout.cardWidthClass}`}
                  style={{ padding: layout.cardPadding }}
                >
                  <div className="card-header flex items-center gap-5 mb-6">
                    <div className="neu-button w-14 h-14 flex items-center justify-center flex-shrink-0">
                      <span 
                        className="js-icon material-symbols-rounded"
                        style={{ fontSize: layout.iconSize, color: '#718096' }}
                      >
                        {card.icon}
                      </span>
                    </div>
                    <h3 className={`js-title font-medium ${layout.titleSizeClass}`} style={{ color: '#4a5568' }}>
                      {card.title}
                    </h3>
                  </div>
                  <p 
                    className={`js-desc font-light ${layout.descSizeClass}`}
                    style={{ color: '#718096' }}
                    dangerouslySetInnerHTML={{ __html: card.desc }} 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: generateTitleFitScript(titleConfig) }} />
      <script dangerouslySetInnerHTML={{ __html: generateViewportFitScript() }} />
    </div>
  );
};

export const neumorphismTemplate: TemplateConfig = {
  id: 'neumorphism',
  name: '新拟物',
  description: '同色系浮雕新拟物风格',
  icon: 'album',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <Neumorphism data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'neumorphism'),
};

export { Neumorphism };
