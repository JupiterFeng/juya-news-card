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

const GitHubPrimer: React.FC<{ data: GeneratedContent; scale: number }> = ({ data, scale }) => {
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
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
          background-color: #0d1117;
          color: #c9d1d9;
        }
        .github-title {
          font-weight: 600;
          color: #c9d1d9;
          letter-spacing: -0.01em;
          line-height: 1.1;
          white-space: nowrap;
        }
        .card-item {
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 6px;
          transition: border-color 0.2s;
        }
        .card-item:hover {
          border-color: #58a6ff;
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        
        .js-desc strong { color: #c9d1d9; font-weight: 600; }
        .js-desc code {
          background: rgba(110, 118, 129, 0.4); padding: 0.1em 0.3em; border-radius: 6px;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", monospace;
          font-size: 0.9em; color: #58a6ff;
        }
        .content-scale { transform-origin: center center; }
        .material-symbols-rounded { font-family: 'Material Symbols Rounded' !important; font-weight: normal; font-style: normal; display: inline-block; }

        .github-border-bottom { border-bottom: 1px solid #30363d; }
      `}</style>

      <div className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-16 box-border content-scale"
          style={{ 
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX,
            paddingRight: layout.wrapperPaddingX
          }}
        >
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#238636] flex items-center justify-center mb-4">
              <svg height="24" viewBox="0 0 16 16" width="24" fill="#ffffff">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
              </svg>
            </div>
            <h1 
              ref={titleRef} 
              className="text-center github-title"
              style={{ fontSize: titleConfig.initialFontSize }}
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
              {data.cards.map((card, idx) => (
                <div 
                  key={idx} 
                  className={`card-item flex flex-col ${layout.cardWidthClass}`}
                  style={{ padding: layout.cardPadding }}
                >
                  <div className="card-header flex items-center gap-4 mb-4 github-border-bottom" style={{ paddingBottom: '12px' }}>
                    <span 
                      className="js-icon material-symbols-rounded"
                      style={{ fontSize: layout.iconSize, color: '#58a6ff' }}
                    >{card.icon}</span>
                    <h3 className={`js-title font-semibold ${layout.titleSizeClass}`} style={{ color: '#c9d1d9' }}>{card.title}</h3>
                  </div>
                  <p 
                    className={`js-desc ${layout.descSizeClass}`} 
                    style={{ color: '#8b949e', lineHeight: '1.6' }}
                    dangerouslySetInnerHTML={{ __html: card.desc }} 
                  />
                </div>
              ))}
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

export const githubPrimerTemplate: TemplateConfig = {
  id: 'githubPrimer',
  name: '开发者深色面板',
  description: '开发者工具深色系统风格',
  icon: 'code',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <GitHubPrimer data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'githubPrimer'),
};

export { GitHubPrimer };
