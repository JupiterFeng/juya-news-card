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
 * CardFirst 渲染组件
 * 卡片化/瓷砖风格 - 强模块化，适配多入口
 */
interface CardFirstProps {
  data: GeneratedContent;
  scale: number;
}

const THEME_COLORS = [
  { bg: '#ef4444', text: '#fff', icon: '#fff' },
  { bg: '#3b82f6', text: '#fff', icon: '#fff' },
  { bg: '#10b981', text: '#fff', icon: '#fff' },
  { bg: '#f59e0b', text: '#fff', icon: '#fff' },
  { bg: '#8b5cf6', text: '#fff', icon: '#fff' },
  { bg: '#ec4899', text: '#fff', icon: '#fff' },
];

const CardFirst: React.FC<CardFirstProps> = ({ data, scale }) => {
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
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face { font-family: 'CustomPreviewFont'; src: url('/assets/htmlFont.ttf') format('truetype'); }
        .main-container { font-family: 'Inter', 'CustomPreviewFont', system-ui, sans-serif; background: #f3f4f6; color: #1a1a1a; }
        .tile-title { font-weight: 700; color: #1a1a1a; letter-spacing: -0.02em; white-space: nowrap; }
        .card-item { transition: all 0.3s ease; display: flex; flex-direction: column; }
        .card-item:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.15); }
        .js-desc strong { font-weight: 600; }
        .js-desc code { background: rgba(255,255,255,0.25); padding: 0.15em 0.4em; border-radius: 4px; font-weight: 500; }

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
      <div className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-16 box-border content-scale"
          style={{ 
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined
          }}
        >
          <div className="title-zone flex-none flex items-center justify-center w-full">
            <h1
              ref={titleRef}
              className={`text-center tile-title ${layout.titleSizeClass}`}
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
              {data.cards.map((card, idx) => {
                const theme = getCardThemeColor(THEME_COLORS, idx);
                return (
                  <div 
                    key={idx} 
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: theme.bg,
                      color: theme.text,
                      padding: layout.cardPadding,
                      borderRadius: '12px',
                      aspectRatio: N > 6 ? '1/1' : '4/3'
                    }}
                  >
                    <span 
                      className="js-icon material-symbols-rounded" 
                      style={{ 
                        marginBottom: '1rem', 
                        display: 'block',
                        fontSize: layout.iconSize,
                        color: theme.icon
                      }}
                    >
                      {card.icon}
                    </span>
                    <h3 
                      className={`js-title font-semibold ${layout.titleSizeClass}`}
                      style={{ color: theme.text }}
                    >
                      {card.title}
                    </h3>
                    <p 
                      className={`js-desc font-medium ${layout.descSizeClass}`} 
                      style={{ marginTop: 'auto', paddingTop: '1rem', color: theme.text, opacity: '0.9' }} 
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

export const cardFirstTemplate: TemplateConfig = {
  id: 'cardFirst',
  name: '卡片化瓷砖',
  description: '强模块化，适配多入口；适合内容聚合、仪表盘、移动端首页',
  icon: 'grid_view',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <CardFirst data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'cardFirst'),
};

export { CardFirst };
