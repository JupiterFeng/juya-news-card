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
 * Windows95 渲染组件
 * Windows 95 "桌面+任务栏+开始菜单" (1995) 风格
 * 灰阶、轻3D边框、清晰的窗口层级
 */
interface Windows95Props {
  data: GeneratedContent;
  scale: number;
}

const THEME_COLORS = [
  { bg: '#c0c0c0', dark: '#808080', light: '#ffffff', text: '#000000', icon: '#000080' },
  { bg: '#c0c0c0', dark: '#808080', light: '#ffffff', text: '#000000', icon: '#008080' },
  { bg: '#c0c0c0', dark: '#808080', light: '#ffffff', text: '#000000', icon: '#800080' },
  { bg: '#c0c0c0', dark: '#808080', light: '#ffffff', text: '#000000', icon: '#808000' },
];

const Windows95: React.FC<Windows95Props> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const taskbarTime = '09:41';

  const N = data?.cards?.length || 0;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);

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
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .win95-container {
          font-family: 'CustomPreviewFont', 'Segoe UI', Tahoma, sans-serif;
          background-color: #008080;
          color: #000000;
        }
        .win95-title {
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 0px;
          white-space: nowrap;
        }
        .card-item {
          position: relative;
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

        .js-desc strong { color: #000000; font-weight: 700; }
        .content-scale { transform-origin: center center; }
        .win95-button {
          background: #c0c0c0;
          border-top: 2px solid #ffffff;
          border-left: 2px solid #ffffff;
          border-right: 2px solid #808080;
          border-bottom: 2px solid #808080;
        }
      `}</style>

      <div className="win95-container relative box-border w-full h-full overflow-hidden flex flex-col">
        {/* Taskbar at top (simulated) */}
        <div className="w-full h-10 bg-[#c0c0c0] border-b-2 border-[#808080] flex items-center px-4 gap-4 z-20">
          <div className="px-3 py-1 bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-[#808080] flex items-center gap-2 font-bold shadow-[inset_-1px_-1px_#000,inset_1px_1px_#dfdfdf]">
            <span className="material-symbols-rounded text-xl">grid_view</span>
            <span>Start</span>
          </div>
          <div className="flex-1 flex gap-2">
            <div className="px-3 py-1 bg-[#c0c0c0] border-t-2 border-l-2 border-[#808080] border-b-2 border-r-2 border-white flex items-center gap-2 shadow-[inset_1px_1px_#000,inset_-1px_-1px_#dfdfdf]">
              <span className="material-symbols-rounded text-sm">description</span>
              <span className="text-sm">Prompt2View.exe</span>
            </div>
          </div>
          <div className="px-3 py-1 bg-[#c0c0c0] border-t-2 border-l-2 border-[#808080] border-b-2 border-r-2 border-white text-sm shadow-[inset_1px_1px_#000,inset_-1px_-1px_#dfdfdf]">
            {taskbarTime}
          </div>
        </div>

        <div
          ref={wrapperRef}
          className="content-wrapper flex-1 flex flex-col items-center justify-center p-12 box-border"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}
        >
          {/* Main Title Window */}
          <div className="w-full max-w-[1750px] bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-[#808080] shadow-[2px_2px_10px_rgba(0,0,0,0.5)]">
            <div className="h-8 bg-[#000080] flex items-center justify-between px-2 m-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-rounded text-white text-lg">computer</span>
                <span className="win95-title text-sm">{data.mainTitle}</span>
              </div>
              <div className="flex gap-1">
                <div className="w-5 h-5 bg-[#c0c0c0] border-t border-l border-white border-b border-r border-[#808080] flex items-center justify-center font-bold text-xs">_</div>
                <div className="w-5 h-5 bg-[#c0c0c0] border-t border-l border-white border-b border-r border-[#808080] flex items-center justify-center font-bold text-xs">□</div>
                <div className="w-5 h-5 bg-[#c0c0c0] border-t border-l border-white border-b border-r border-[#808080] flex items-center justify-center font-bold text-xs">×</div>
              </div>
            </div>
            <div className="p-8 flex flex-col items-center">
              <h1 
                ref={titleRef} 
                className="win95-title js-title-text"
                style={{ fontSize: titleConfig.initialFontSize + 'px' }}
              >
                {data.mainTitle}
              </h1>
            </div>
          </div>

          {/* Cards Grid */}
          <div
            className="card-zone w-full flex flex-wrap justify-center content-center"
            style={{
              gap: layout.containerGap,
              '--container-gap': layout.containerGap
            } as React.CSSProperties}
          >
            {data.cards.map((card, idx) => {
              const theme = THEME_COLORS[idx % THEME_COLORS.length];
              return (
                <div 
                  key={idx} 
                  className={`card-item flex flex-col bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-[#808080] ${layout.cardWidthClass}`}
                  style={{ padding: '2px' }}
                >
                  {/* Card Title Bar */}
                  <div className="h-6 bg-[#808080] flex items-center px-2 mb-1">
                    <span className="text-white text-xs font-bold truncate">{card.title}</span>
                  </div>
                  
                  {/* Card Content Area */}
                  <div className="flex-1 bg-white border-t border-l border-[#808080] border-b border-r border-white p-6 flex flex-col items-center text-center">
                    <div 
                      className="mb-4 flex items-center justify-center"
                      style={{ 
                        width: '64px', 
                        height: '64px',
                        backgroundColor: '#c0c0c0',
                        borderTop: '1px solid #ffffff',
                        borderLeft: '1px solid #ffffff',
                        borderBottom: '1px solid #808080',
                        borderRight: '1px solid #808080',
                      }}
                    >
                      <span className="material-symbols-rounded" style={{ fontSize: '40px', color: theme.icon }}>
                        {card.icon}
                      </span>
                    </div>
                    <h3 className={`font-bold mb-3 ${layout.titleSizeClass}`} style={{ color: '#000000' }}>
                      {card.title}
                    </h3>
                    <p
                      className={`leading-relaxed ${layout.descSizeClass}`}
                      style={{ color: '#000000' }}
                      dangerouslySetInnerHTML={{ __html: card.desc }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: generateTitleFitScript(titleConfig) }} />
      <script dangerouslySetInnerHTML={{ __html: generateViewportFitScript() }} />
    </div>
  );
};

export const windows95Template: TemplateConfig = {
  id: 'windows95',
  name: '复古桌面95',
  description: '1995年复古桌面风格，灰色窗口、斜面边框与青绿色背景。',
  icon: 'apps',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <Windows95 data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'windows95'),
};

export { Windows95 };
