import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import {
    ThemeColor,
    getCardThemeColor,
    generateTitleFitScript,
    generateViewportFitScript,
    calculateStandardLayout,
    getStandardTitleConfig,
} from '../utils/layout-calculator';

const IBMPlexSans = "'IBM Plex Sans', system-ui, -apple-system, sans-serif";

/**
 * IBM Carbon 主题颜色（内联定义）
 */
const THEME_COLORS: ThemeColor[] = [
    { bg: '#e8f4ff', onBg: '#161616', icon: '#0f62fe' },
    { bg: '#fff8e1', onBg: '#161616', icon: '#f1c21b' },
    { bg: '#defbe6', onBg: '#161616', icon: '#24a148' },
    { bg: '#ffd7d9', onBg: '#161616', icon: '#da1e28' },
];

const IBMCarbon: React.FC<{ data: GeneratedContent; scale: number }> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const N = data.cards.length;

  // ✅ 使用默认配置（无需传参）
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;  // SSR 环境跳过
    if (!wrapperRef.current || !titleRef.current) return;

    const wrapper = wrapperRef.current;
    const title = titleRef.current;

    // 标题适配
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

    // 视口适配
    const fitViewport = () => {
      const maxH = 1040;  // ✅ 使用 1040（1080 - 40px 边距）
      const contentH = wrapper.scrollHeight;
      if (contentH > maxH) {
        const nextScale = Math.max(0.6, maxH / contentH);
        wrapper.style.transform = `scale(${nextScale})`;
        return;
      }
      wrapper.style.transform = '';  // ✅ 重置 transform
    };

    const timer = window.setTimeout(fitViewport, 50);
    return () => window.clearTimeout(timer);  // ✅ cleanup 防止内存泄漏
  }, [data, titleConfig]);

  return (
    <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', overflow: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: ${IBMPlexSans};
          background-color: #f4f4f4;
          color: #161616;
        }
        /* ✅ 主标题不换行 */
        .carbon-title {
          font-weight: 300;
          color: #161616;
          letter-spacing: 0;
          line-height: 1.1;
          white-space: nowrap;
        }
        .card-item {
          background: #ffffff;
          border: 1px solid #e0e0e0;
          transition: all 0.1s cubic-bezier(0, 0, 0.38, 0.9);
        }
        .card-item:hover {
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
        /* 卡片宽度类 - 使用 CSS 变量计算 */
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }

        /* ✅ 强制包含：中间档位字体字号 (Tier Font Sizes) */
        .text-5-5xl { font-size: 3.375rem; line-height: 1.1; }
        .text-4-5xl { font-size: 2.625rem; line-height: 1.2; }
        .text-3-5xl { font-size: 2.0625rem; line-height: 1.3; }
        .text-2-5xl { font-size: 1.8125rem; line-height: 1.4; }

        /* 标准字体字号 */
        .text-5xl { font-size: 3rem; line-height: 1; }
        .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
        .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
        .text-2xl { font-size: 1.5rem; line-height: 2rem; }
        .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
        .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
        .text-base { font-size: 1rem; line-height: 1.5rem; }

        .js-desc strong { color: #161616; font-weight: 600; }
        .js-desc code {
          background: #e0e0e0; padding: 0.1em 0.3em;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.9em; color: #0f62fe;
        }
        .content-scale { transform-origin: center center; }
        .material-symbols-rounded { font-family: 'Material Symbols Rounded' !important; font-weight: normal; font-style: normal; display: inline-block; }

      `}</style>

      <div
        className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-24 box-border content-scale"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined
          }}
        >
          <div className="flex flex-col items-center">
            <h1 ref={titleRef} className="text-center carbon-title">
              {data.mainTitle}
            </h1>
            <div className="w-16 h-0.5 bg-[#0f62fe] mt-4"></div>
          </div>

          {/* 卡片容器 */}
          <div
            className="flex flex-wrap justify-center w-full"
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
                  className={`card-item ${layout.cardWidthClass}`}
                  style={{ padding: layout.cardPadding }}
                >
                  <div className="card-header flex items-center gap-4 mb-4">
                    <span
                      className="material-symbols-rounded"
                      style={{ color: theme.icon, fontSize: layout.iconSize }}
                    >
                      {card.icon}
                    </span>
                    <h3 className={layout.titleSizeClass} style={{ color: theme.onBg }}>
                      {card.title}
                    </h3>
                  </div>
                  <p
                    className={layout.descSizeClass}
                    style={{ color: '#525252' }}
                    dangerouslySetInnerHTML={{ __html: card.desc }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SSR 兼容脚本 */}
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

export const ibmCarbonTemplate: TemplateConfig = {
  id: 'ibmCarbon',
  name: '工业网格系统',
  description: '企业级深色网格化设计系统风格',
  icon: 'business_center',
  downloadable: true,
  ssrReady: true,           // ✅ 设为 true 启用 SSR
  render: (data, scale) => <IBMCarbon data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'ibmCarbon'),
};

export { IBMCarbon };
