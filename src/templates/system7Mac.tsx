import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import { 
  calculateStandardLayout, 
  getStandardTitleConfig, 
  generateTitleFitScript,
  generateViewportFitScript 
} from '../utils/layout-calculator';

/**
 * System7Mac 渲染组件
 * Classic Mac OS "System 7 时代" (1991) 风格
 * 经典 Mac 的灰阶窗口体系、稳定的菜单栏与一致的操作模式
 */
interface System7MacProps {
  data: GeneratedContent;
  scale: number;
}

const SYSTEM7_COLORS = [
  { bg: '#e8e8e8', dark: '#686868', light: '#ffffff', text: '#000000', icon: '#000000' },
  { bg: '#dcdcdc', dark: '#5c5c5c', light: '#f8f8f8', text: '#000000', icon: '#000000' },
  { bg: '#e0e0e0', dark: '#606060', light: '#fcfcfc', text: '#000000', icon: '#000000' },
  { bg: '#d8d8d8', dark: '#585858', light: '#f4f4f4', text: '#000000', icon: '#000000' },
];

const System7Mac: React.FC<System7MacProps> = ({ data, scale }) => {
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
        .system7-container {
          font-family: 'CustomPreviewFont', 'Geneva', 'Helvetica Neue', Arial, sans-serif;
          background: repeating-linear-gradient(
            0deg,
            #c8c8c8,
            #c8c8c8 2px,
            #d8d8d8 2px,
            #d8d8d8 4px
          );
          color: #000000;
        }
        .system7-title {
          font-weight: 700;
          color: #000000;
          font-family: 'CustomPreviewFont', 'Geneva', Arial, sans-serif;
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
        .js-desc strong { color: #000000; font-weight: 700; }
        .content-scale { transform-origin: center center; }
      `}</style>

      <div
        className="system7-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        {/* 模拟 Mac 菜单栏 */}
        <div style={{
          width: '100%',
          height: '28px',
          background: '#e8e8e8',
          borderBottom: '2px solid #686868',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          gap: '16px',
          fontSize: '13px',
          fontWeight: 'bold'
        }}>
          <span>&#63743;</span>
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
          <span>Special</span>
        </div>

        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-16 box-border content-scale"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}
        >
          {/* 顶部标题 */}
          <div className="flex flex-col items-center">
            <div style={{
              padding: '16px 28px',
              background: '#e8e8e8',
              borderTop: '3px solid #686868',
              borderLeft: '3px solid #686868',
              borderRight: '3px solid #ffffff',
              borderBottom: '3px solid #ffffff',
              borderRadius: '4px'
            }}>
              <h1
                ref={titleRef}
                className="text-center system7-title"
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
              style={{
                gap: layout.containerGap,
                '--container-gap': layout.containerGap
              } as React.CSSProperties}
            >
              {data.cards.map((card, idx) => {
                const theme = SYSTEM7_COLORS[idx % SYSTEM7_COLORS.length];
                return (
                  <div 
                    key={idx} 
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: theme.bg,
                      borderTop: `2px solid ${theme.light}`,
                      borderLeft: `2px solid ${theme.light}`,
                      borderRight: `2px solid ${theme.dark}`,
                      borderBottom: `2px solid ${theme.dark}`,
                      padding: layout.cardPadding,
                      borderRadius: '2px'
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span 
                        className="js-icon material-symbols-rounded"
                        style={{ fontSize: layout.iconSize, color: theme.icon }}
                      >
                        {card.icon}
                      </span>
                      <h3 
                        className={`js-title font-bold ${layout.titleSizeClass}`}
                        style={{ color: theme.text }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc ${layout.descSizeClass}`}
                      style={{ color: theme.text, lineHeight: '1.4' }}
                      dangerouslySetInnerHTML={{ __html: card.desc }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SSR Scripts */}
        <script dangerouslySetInnerHTML={{ __html: generateTitleFitScript(titleConfig) }} />
        <script dangerouslySetInnerHTML={{ __html: generateViewportFitScript() }} />
      </div>
    </div>
  );
};

import { generateDownloadableHtml } from '../utils/template';

export const system7MacTemplate: TemplateConfig = {
  id: 'system7Mac',
  name: '经典灰阶系统',
  description: '1991年经典灰阶系统风格 - 窗口层级与全局菜单栏',
  icon: 'computer',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <System7Mac data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'system7Mac'),
};

export { System7Mac };
