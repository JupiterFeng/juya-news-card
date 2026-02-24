import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import { calculateStandardLayout, getStandardTitleConfig, getCardThemeColor, generateTitleFitScript, generateViewportFitScript } from '../utils/layout-calculator';

/**
 * BreezeFlat 渲染组件
 * KDE Plasma 5 "Breeze（清爽可读的扁平化）" (2014)风格
 * 更轻的图标与控件、留白充足、整体克制
 */
interface BreezeFlatProps {
  data: GeneratedContent;
  scale: number;
}

const THEME_COLORS = [
  { bg: '#ffffff', text: '#232627', icon: '#3daee9', border: '#bdc3c7' },
  { bg: '#fafafa', text: '#232627', icon: '#3daee9', border: '#c0c8cc' },
  { bg: '#f8f8f8', text: '#232627', icon: '#3daee9', border: '#bcc4c8' },
  { bg: '#fcfcfc', text: '#232627', icon: '#3daee9', border: '#c2cad0' },
];

const BreezeFlat: React.FC<BreezeFlatProps> = ({ data, scale }) => {
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
    <div style={{ 
      width: 1920, 
      height: 1080, 
      transform: `scale(${scale})`, 
      transformOrigin: 'top left', 
      overflow: 'hidden',
    } as React.CSSProperties}>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .breeze-container {
          font-family: 'CustomPreviewFont', 'Noto Sans', 'Segoe UI', Arial, sans-serif;
          background: linear-gradient(135deg, #eff3f5 0%, #e3e8eb 100%);
          color: #232627;
        }
        .breeze-title {
          font-weight: 500;
          color: #232627;
          font-family: 'CustomPreviewFont', 'Noto Sans', sans-serif;
          white-space: nowrap;
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

        .js-desc strong { color: #232627; font-weight: 600; }
        .content-scale { transform-origin: center center; }
      `}</style>

      <div
        className="breeze-container relative box-border w-full h-full overflow-hidden flex flex-col"
      >
        {/* KDE 面板 */}
        <div style={{
          height: '36px',
          background: '#eff3f5',
          borderBottom: '1px solid #bdc3c7',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          gap: '12px',
          fontSize: '13px'
        }}>
          <span style={{ fontWeight: '500', color: '#3daee9' }}>Kickoff</span>
          <div style={{ flex: 1, display: 'flex', gap: '16px' }}>
            <span style={{ opacity: 0.7 }}>Applications</span>
            <span style={{ opacity: 0.7 }}>Settings</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="material-symbols-rounded" style={{ fontSize: '18px', opacity: 0.7 }}>wifi</span>
            <span className="material-symbols-rounded" style={{ fontSize: '18px', opacity: 0.7 }}>volume_up</span>
            <span style={{ opacity: 0.7 }}>9:41 AM</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div
            ref={wrapperRef}
            className="content-wrapper w-full flex flex-col items-center content-scale"
            style={{ 
              gap: layout.wrapperGap,
              paddingLeft: layout.wrapperPaddingX || undefined,
              paddingRight: layout.wrapperPaddingX || undefined
            }}
          >
            {/* 顶部标题 */}
            <div className="flex flex-col items-center">
              <div style={{
                padding: '18px 32px',
                background: '#ffffff',
                border: '1px solid #bdc3c7',
                borderRadius: '4px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
              }}>
                <h1
                  ref={titleRef}
                  className="text-center breeze-title"
                  style={{ fontSize: `${titleConfig.initialFontSize}px` }}
                >
                  {data.mainTitle}
                </h1>
              </div>
            </div>

            {/* 卡片区域 */}
            <div className="card-zone flex-none w-full">
              <div
                className="w-full flex flex-wrap justify-center content-center"
                style={{ 
                  gap: layout.containerGap,
                  '--container-gap': layout.containerGap
                } as React.CSSProperties}
              >
                {data.cards.map((card, idx) => {
                  const theme = getCardThemeColor(THEME_COLORS, idx);
                  
                  return (
                    <div 
                      key={idx} 
                      className={`card-item flex flex-col ${layout.cardWidthClass}`}
                      style={{
                        backgroundColor: theme.bg,
                        border: `1px solid ${theme.border || '#bdc3c7'}`,
                        borderRadius: '4px',
                        padding: layout.cardPadding,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
                      }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <span 
                          className="js-icon material-symbols-rounded"
                          style={{
                            fontSize: layout.iconSize,
                            color: theme.icon
                          }}
                        >
                          {card.icon}
                        </span>
                        <h3 
                          className={`js-title font-medium ${layout.titleSizeClass}`}
                          style={{
                            color: theme.text,
                            fontFamily: '"Noto Sans", "Segoe UI", Arial, sans-serif'
                          }}
                        >
                          {card.title}
                        </h3>
                      </div>
                      <p
                        className={`js-desc ${layout.descSizeClass}`}
                        style={{
                          color: theme.text,
                          opacity: '0.8',
                          lineHeight: '1.7'
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

import { generateDownloadableHtml } from '../utils/template';

export const breezeFlatTemplate: TemplateConfig = {
  id: 'breezeFlat',
  name: '轻盈扁平界面',
  description: '2014年桌面扁平化风格 - 清爽可读、轻量化层级',
  icon: 'widgets',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <BreezeFlat data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'breezeFlat'),
};

export { BreezeFlat };
