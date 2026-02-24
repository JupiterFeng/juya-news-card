import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import { generateDownloadableHtml } from '../utils/template';
import {
    generateTitleFitScript,
    generateViewportFitScript,
    calculateStandardLayout,
    getStandardTitleConfig,
} from '../utils/layout-calculator';

/**
 * BeOS 渲染组件
 * BeOS "媒体友好桌面" (1995) 风格
 * 轻量、简洁、强调响应速度与清晰布局
 */
interface BeOSProps {
  data: GeneratedContent;
  scale: number;
}

const BEOS_COLORS = [
  { bg: '#ffffff', border: '#cccccc', text: '#333333', icon: '#0066cc' },
  { bg: '#f8f8f8', border: '#d4d4d4', text: '#333333', icon: '#009933' },
  { bg: '#ffffff', border: '#c8c8c8', text: '#333333', icon: '#ff6600' },
  { bg: '#f5f5f5', border: '#d0d0d0', text: '#333333', icon: '#cc3399' },
];

const BeOS: React.FC<BeOSProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const N = data.cards.length;
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

  const getCardWidthClass = () => {
    if (N === 1) return 'w-2/3';
    if (N === 2) return 'card-width-2col';
    if (N === 3) return 'card-width-3col';
    if (N === 4) return 'card-width-2col';
    if (N <= 6) return 'card-width-3col';
    return 'card-width-4col';
  };

  return (
    <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', overflow: 'hidden' }}>
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .beos-container {
          font-family: 'CustomPreviewFont', Arial, Helvetica, sans-serif;
          background: linear-gradient(180deg, #e8f4fc 0%, #d0e8f8 100%);
          color: #333333;
        }
        .beos-title {
          font-weight: 600;
          color: #0066cc;
          letter-spacing: -1px;
          font-family: 'CustomPreviewFont', Arial, sans-serif;
          white-space: nowrap;
        }
        .card-item {
          position: relative;
          transition: box-shadow 0.2s ease;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          display: flex;
          flex-direction: column;
        }
        .card-width-2col { width: calc(50% - 12px); }
        .card-width-3col { width: calc(33.33% - 16px); }
        .card-width-4col { width: calc(25% - 18px); }
        
        .desc-text strong { color: #333333; font-weight: 600; }
        
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
        .text-lg  { font-size: 1.125rem; line-height: 1.75rem; }
        .text-base { font-size: 1rem; line-height: 1.5rem; }
        .text-sm { font-size: 0.875rem; line-height: 1.25rem; }

        .content-scale { transform-origin: center center; }
      `}</style>

      <div
        className="beos-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-16 box-border content-scale"
          style={{ gap: layout.wrapperGap }}
        >
          {/* 顶部标题 */}
          <div className="flex flex-col items-center">
            <div style={{
              padding: '16px 32px',
              background: '#ffffff',
              border: '1px solid #cccccc',
              borderRadius: '8px',
              boxShadow: '0 2px 12px rgba(0,102,204,0.15)'
            }}>
              <h1
                ref={titleRef}
                className="text-center beos-title"
                style={{ fontSize: titleConfig.initialFontSize }}
              >
                {data.mainTitle}
              </h1>
            </div>
          </div>

          {/* 卡片区域 */}
          <div className="card-zone flex-none w-full">
            <div
              className="w-full flex flex-wrap justify-center content-center"
              style={{ gap: layout.containerGap }}
            >
              {data.cards.map((card, idx) => {
                const theme = BEOS_COLORS[idx % BEOS_COLORS.length];
                return (
                  <div 
                    key={idx} 
                    className={`card-item ${getCardWidthClass()}`}
                    style={{
                      backgroundColor: theme.bg,
                      border: `1px solid ${theme.border}`,
                      padding: layout.cardPadding
                    }}
                  >
                    <div 
                      className="flex items-center gap-3 mb-4"
                    >
                      <span 
                        className="material-symbols-rounded"
                        style={{
                          fontSize: layout.iconSize,
                          color: theme.icon
                        }}
                      >
                        {card.icon}
                      </span>
                      <h3 
                        className={`font-semibold ${layout.titleSizeClass}`}
                        style={{ 
                          color: theme.text,
                          fontFamily: '"Arial", "Helvetica", sans-serif',
                          letterSpacing: '-0.5px'
                        }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`desc-text ${layout.descSizeClass}`}
                      style={{
                        color: theme.text,
                        opacity: 0.8,
                        lineHeight: '1.5'
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

      <script dangerouslySetInnerHTML={{
        __html: `
          ${generateTitleFitScript(titleConfig)}
          ${generateViewportFitScript()}
        `
      }} />
    </div>
  );
};

export const beosTemplate: TemplateConfig = {
  id: 'beos',
  name: '轻量媒体桌面',
  description: '1995年轻量媒体桌面风格 - 简洁快速与多媒体友好',
  icon: 'play_circle',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <BeOS data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'beos'),
};

export { BeOS };
