import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import { 
  calculateStandardLayout, 
  getStandardTitleConfig, 
  generateTitleFitScript,
  generateViewportFitScript 
} from '../utils/layout-calculator';

const Minimalism: React.FC<{ data: GeneratedContent; scale: number }> = ({ data, scale }) => {
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
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'CustomPreviewFont', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background-color: #fafafa;
          color: #1a1a1a;
        }
        .minimal-title {
          font-weight: 300;
          color: #1a1a1a;
          letter-spacing: -0.03em;
          line-height: 1.1;
        }
        .card-item {
          background: #ffffff;
          border-radius: 0;
          border: 1px solid #e5e5e5;
          transition: border-color 0.3s;
        }
        .card-item:hover {
          border-color: #1a1a1a;
        }
                .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
                .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
                .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .js-desc strong { font-weight: 500; }
        .js-desc code {
          background: #f5f5f5;
          padding: 0.1em 0.3em;
          font-family: 'SF Mono', monospace;
          font-size: 0.9em; color: #1a1a1a;
        }
        .content-scale { transform-origin: center center; }
        .material-symbols-rounded { font-family: 'Material Symbols Rounded' !important; font-weight: normal; font-style: normal; display: inline-block; }
      `}</style>

      <div
        className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-32 box-border content-scale"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}
        >
          <div className="flex flex-col items-center">
            <h1 ref={titleRef} className={`text-center minimal-title ${layout.titleSizeClass}`}>
              {data.mainTitle}
            </h1>
            <div className="w-12 h-px bg-[#1a1a1a] mt-6 opacity-20"></div>
          </div>

          <div className="card-zone flex-none w-full">
            <div
              className="w-full flex flex-wrap justify-center content-center"
              style={{ gap: layout.containerGap, '--container-gap': layout.containerGap } as React.CSSProperties}
            >
              {data.cards.map((card, idx) => (
                <div 
                  key={idx} 
                  className={`card-item flex flex-col ${layout.cardWidthClass}`}
                  style={{ padding: layout.cardPadding }}
                >
                  <div className="card-header flex items-center gap-5 mb-8">
                    <span 
                      className="js-icon material-symbols-rounded"
                      style={{ fontSize: layout.iconSize, color: '#1a1a1a' }}
                    >
                      {card.icon}
                    </span>
                    <h3 className={`js-title font-normal ${layout.titleSizeClass}`} style={{ color: '#1a1a1a' }}>
                      {card.title}
                    </h3>
                  </div>
                  <p 
                    className={`js-desc font-light ${layout.descSizeClass}`} 
                    style={{ color: '#666666' }}
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

import { generateDownloadableHtml } from '../utils/template';

export const minimalismTemplate: TemplateConfig = {
  id: 'minimalism',
  name: '极简主义',
  description: '极少元素大面积留白极简风格',
  icon: 'minimize',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <Minimalism data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'minimalism'),
};

export { Minimalism };
