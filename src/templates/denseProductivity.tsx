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

/**
 * DenseProductivity 渲染组件
 * 高密度效率UI风格 - 表格/快捷键/紧凑间距
 */
interface DenseProductivityProps {
  data: GeneratedContent;
  scale: number;
}

const DenseProductivity: React.FC<DenseProductivityProps> = ({ data, scale }) => {
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
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face { font-family: 'CustomPreviewFont'; src: url('/assets/htmlFont.ttf') format('truetype'); }
        .main-container { font-family: 'Inter', 'CustomPreviewFont', system-ui, sans-serif; background: #f9fafb; color: #1a1a1a; }
        .dense-title { font-weight: 600; color: #1a1a1a; letter-spacing: -0.02em; white-space: nowrap; }
        .card-item { transition: all 0.2s; }
        .card-item:hover { background: #f3f4f6; border-color: #d1d5db; }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .js-desc strong { font-weight: 600; color: #6366f1; }
        .js-desc code { background: #f3f4f6; color: #6366f1; padding: 0.1em 0.3em; border-radius: 2px; font-family: 'IBM Plex Mono', monospace; font-size: 0.9em; }
        .content-scale { transform-origin: center center; }
        .shortcut-hint { font-family: 'IBM Plex Mono', monospace; font-size: 10px; background: #e5e7eb; padding: 2px 6px; border-radius: 3px; color: #6b7280; margin-left: auto; }
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
          <div className="title-zone flex-none flex items-center justify-between w-full" style={{ maxWidth: '1600px' }}>
            <h1 
              ref={titleRef} 
              className="dense-title"
              style={{ fontSize: titleConfig.initialFontSize }}
            >
              {data.mainTitle}
            </h1>
            <div className="shortcut-hint">⌘K 搜索</div>
          </div>

          <div className="card-zone flex-none w-full" style={{ maxWidth: '1600px' }}>
            <div 
              className="w-full flex flex-wrap justify-start content-center"
              style={{ 
                gap: layout.containerGap,
                '--container-gap': layout.containerGap
              } as React.CSSProperties}
            >
              {data.cards.map((card, idx) => (
                <div 
                  key={idx} 
                  className={`card-item flex flex-row items-center ${layout.cardWidthClass}`}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#1a1a1a',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    gap: '12px',
                  }}
                >
                  <span 
                    className="js-icon material-symbols-rounded"
                    style={{ color: '#6366f1', fontSize: layout.iconSize }}
                  >
                    {card.icon}
                  </span>
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <h3 
                      className={`js-title font-medium ${layout.titleSizeClass}`}
                      style={{ color: '#1a1a1a', whiteSpace: 'nowrap' }}
                    >
                      {card.title}
                    </h3>
                    <p 
                      className={`js-desc font-normal ${layout.descSizeClass}`}
                      style={{ color: '#6b7280', flex: '1' }}
                      dangerouslySetInnerHTML={{ __html: card.desc }} 
                    />
                  </div>
                  <div className="shortcut-hint">⌘{idx + 1}</div>
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

export const denseProductivityTemplate: TemplateConfig = {
  id: 'denseProductivity',
  name: '高密度效率UI',
  description: '表格/快捷键/紧凑间距；适合专业工具、交易、数据后台',
  icon: 'dashboard',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <DenseProductivity data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'denseProductivity'),
};

export { DenseProductivity };
