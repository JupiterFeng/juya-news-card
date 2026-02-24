import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import {
  calculateStandardLayout,
  getStandardTitleConfig,
  getCardThemeColor,
  generateTitleFitScript,
  generateViewportFitScript,
} from '../utils/layout-calculator';
import { generateDownloadableHtml } from '../utils/template';

/**
 * CDE 渲染组件
 * CDE Common Desktop Environment (1993) 风格
 * 商业Unix工作站标准桌面、面板化组织、工具型桌面
 */
interface CDEProps {
  data: GeneratedContent;
  scale: number;
}

const THEME_COLORS = [
  { bg: '#c8c8c8', header: '#404040', text: '#000000', icon: '#2060a0' },
  { bg: '#d0d0d0', header: '#383838', text: '#000000', icon: '#1a5090' },
  { bg: '#c0c0c0', header: '#484848', text: '#000000', icon: '#2860b0' },
  { bg: '#d8d8d8', header: '#303030', text: '#000000', icon: '#1870a0' },
];

const CDE: React.FC<CDEProps> = ({ data, scale }) => {
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
        size -= 2;
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
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .cde-container {
          font-family: 'CustomPreviewFont', 'Helvetica Neue', Helvetica, Arial, sans-serif;
          background: linear-gradient(135deg, #606060 0%, #404040 100%);
          color: #000000;
        }
        .cde-title {
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 1px;
          white-space: nowrap;
        }
        .card-item {
          position: relative;
          box-shadow: 2px 2px 8px rgba(0,0,0,0.3);
        }
        .js-desc strong { color: #000000; font-weight: 700; }

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

        .content-scale { transform-origin: center center; }
        .material-symbols-rounded { font-family: 'Material Symbols Rounded' !important; font-weight: normal; font-style: normal; display: inline-block; }
      `}</style>

      <div className="cde-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-16 box-border content-scale"
          style={{ 
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined
          }}
        >
          {/* 顶部标题栏 */}
          <div className="flex flex-col items-center w-full">
            <div style={{
              width: '100%',
              padding: '16px 24px',
              background: '#404040',
              borderTop: '2px solid #707070',
              borderBottom: '2px solid #202020'
            }}>
              <h1
                ref={titleRef}
                className={`text-center cde-title ${layout.titleSizeClass}`}
                style={{ fontSize: titleConfig.initialFontSize + 'px' }}
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
                const theme = getCardThemeColor(THEME_COLORS, idx) as any;
                return (
                  <div 
                    key={idx} 
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: theme.bg,
                      border: '2px solid #707070',
                      borderRadius: '2px',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{
                      backgroundColor: theme.header,
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '12px'
                    }}>
                      <span 
                        className="js-icon material-symbols-rounded"
                        style={{ fontSize: layout.iconSize, color: '#ffffff' }}
                      >
                        {card.icon}
                      </span>
                      <h3 
                        className={`js-title font-bold ${layout.titleSizeClass}`}
                        style={{ color: '#ffffff', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <div style={{ padding: layout.cardPadding }}>
                      <p
                        className={`js-desc ${layout.descSizeClass}`}
                        style={{ color: theme.text, lineHeight: '1.4' }}
                        dangerouslySetInnerHTML={{ __html: card.desc }}
                      />
                    </div>
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

export const cdeDesktopTemplate: TemplateConfig = {
  id: 'cdeDesktop',
  name: 'CDE桌面',
  description: '1993年 CDE 风格 - 商业Unix工作站标准桌面、面板化组织',
  icon: 'dashboard',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <CDE data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'cdeDesktop'),
};

export { CDE };
