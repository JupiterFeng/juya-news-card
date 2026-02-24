import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import { 
  calculateStandardLayout, 
  getStandardTitleConfig, 
  generateTitleFitScript, 
  generateViewportFitScript 
} from '../utils/layout-calculator';

const EditorialMagazine: React.FC<{ data: GeneratedContent; scale: number }> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const cardCount = data.cards.length;
  const layout = calculateStandardLayout(cardCount);
  const titleConfig = {
    ...getStandardTitleConfig(cardCount),
    initialFontSize: 96,
    minFontSize: 48,
  };

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
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;900&family=Lora:wght@400;500;600&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'Lora', Georgia, serif;
          background-color: #fefefe;
          background-image:
            linear-gradient(90deg, transparent 49%, rgba(0,0,0,0.03) 49%, rgba(0,0,0,0.03) 51%, transparent 51%),
            linear-gradient(transparent 49%, rgba(0,0,0,0.03) 49%, rgba(0,0,0,0.03) 51%, transparent 51%);
          background-size: 100px 100px;
          color: #1a1a1a;
        }
        .editorial-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 900;
          font-style: italic;
          color: #1a1a1a;
          letter-spacing: -0.02em;
          line-height: 0.95;
        }
        .card-item {
          background: transparent;
          border-left: 4px solid #c9a227;
          transition: all 0.3s;
        }
        .card-item:hover {
          border-left-color: #1a1a1a;
          background: rgba(201, 162, 39, 0.05);
        }
        .card-item:hover .js-title {
          color: #c9a227;
        }
        .js-desc strong { font-weight: 600; font-style: italic; }
        .js-desc code {
          background: #f5f5f0;
          padding: 0.1em 0.4em;
          font-family: 'SF Mono', monospace;
          font-size: 0.9em;
          color: #c9a227;
          border: 1px solid #e5e5e0;
        }
        .content-scale { transform-origin: center center; }
        .material-symbols-rounded { font-family: 'Material Symbols Rounded' !important; font-weight: normal; font-style: normal; display: inline-block; }

        .decorative-line {
          width: 60px;
          height: 3px;
          background: #c9a227;
        }
        .drop-cap::first-letter {
          float: left;
          font-family: 'Playfair Display', serif;
          font-size: 4em;
          line-height: 0.8;
          padding-right: 8px;
          color: #c9a227;
          font-weight: 700;
        }
        .page-number {
          position: absolute;
          font-family: 'Playfair Display', serif;
          font-size: 14px;
          color: #c9a227;
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
      `}</style>

      <div
        className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        <div className="page-number" style={{ top: '32px', left: '32px' }}>VOL. {new Date().getFullYear()}</div>
        <div className="page-number" style={{ top: '32px', right: '32px' }}>42</div>
        <div className="page-number" style={{ bottom: '32px', left: '32px' }}>THE COLLECTION</div>
        <div className="page-number" style={{ bottom: '32px', right: '32px' }}>FEB 2026</div>

        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-32 box-border content-scale"
          style={{ 
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined
          }}
        >
          <div className="flex flex-col items-center gap-6">
            <div className="decorative-line"></div>
            <h1 
              ref={titleRef} 
              className={`text-center editorial-title ${layout.titleSizeClass}`}
              style={{ fontSize: titleConfig.initialFontSize + 'px' }}
            >
              {data.mainTitle}
            </h1>
            <div className="flex items-center gap-4">
              <div className="w-px h-8 bg-[#c9a227]"></div>
              <div className="text-xs uppercase tracking-[0.4em] text-[#c9a227]">Special Feature</div>
              <div className="w-px h-8 bg-[#c9a227]"></div>
            </div>
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
                  style={{ 
                    padding: layout.cardPadding,
                    paddingLeft: '24px' 
                  }}
                >
                  <div className="card-header flex items-center gap-4 mb-4">
                    <span 
                      className="js-icon material-symbols-rounded"
                      style={{ 
                        color: '#c9a227',
                        fontSize: layout.iconSize 
                      }}
                    >{card.icon}</span>
                    <h3 
                      className={`js-title font-bold leading-tight ${layout.titleSizeClass}`}
                      style={{ color: '#1a1a1a' }}
                    >{card.title}</h3>
                  </div>
                  <p 
                    className={`js-desc drop-cap font-normal leading-relaxed ${layout.descSizeClass}`}
                    style={{ color: '#4a4a4a' }}
                    dangerouslySetInnerHTML={{ __html: card.desc }} 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: generateTitleFitScript({ ...titleConfig, maxWidth: 1600 }) }} />
      <script dangerouslySetInnerHTML={{ __html: generateViewportFitScript() }} />
    </div>
  );
};

import { generateDownloadableHtml } from '../utils/template';

export const editorialMagazineTemplate: TemplateConfig = {
  id: 'editorialMagazine',
  name: '杂志社论风',
  description: '大标题精排版图文节奏',
  icon: 'article',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <EditorialMagazine data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'editorialMagazine'),
};

export { EditorialMagazine };
