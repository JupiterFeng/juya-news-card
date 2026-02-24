import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import { generateDownloadableHtml } from '../utils/template';
import {
  calculateStandardLayout,
  calculateNewsCardLayout,
  NEWS_CARD_THEMES,
  getCardThemeColor,
  generateTitleFitScript,
  generateViewportFitScript,
} from '../utils/layout-calculator';

/**
 * NewsCard 渲染组件
 * 新闻卡片模板的渲染逻辑
 */
interface NewsCardProps {
  data: GeneratedContent;
  scale: number;
}

const NewsCard: React.FC<NewsCardProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);

  const N = data.cards.length;
  const standardLayout = calculateStandardLayout(N);
  
  // 1. 获取布局配置
  const layout = calculateNewsCardLayout(N);
  
  // 2. 标题适配配置
  const titleConfig = { initialFontSize: 90, minFontSize: 40 };

  // 布局适配算法 (仅客户端运行)
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if (!wrapperRef.current || !titleRef.current) return;

    const wrapper = wrapperRef.current;
    const title = titleRef.current;

    // 2. 调整主标题字体大小
    const fitTitle = () => {
        let size = titleConfig.initialFontSize; 
        title.style.fontSize = size + 'px';
        let guard = 0;
        while(title.scrollWidth > 1700 && size > titleConfig.minFontSize && guard < 100) {
          size -= 1;
          title.style.fontSize = size + 'px';
          guard++;
        }
    };
    fitTitle();

    // 3. 视口适配
    const fitViewport = () => {
        const maxH = 1040; // 1080 - 40px margin
        const contentH = wrapper.scrollHeight;
        if (contentH > maxH) {
            const nextScale = Math.max(0.6, maxH / contentH);
            wrapper.style.transform = `scale(${nextScale})`;
            return;
        }
        wrapper.style.transform = '';
    };

    // 给一点时间让浏览器完成前面的布局渲染
    const timer = setTimeout(fitViewport, 50);
    return () => clearTimeout(timer);

  }, [data, layout]);

  return (
    <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', overflow: 'hidden' }}>
        {/* CSS 样式注入 */}
        <style>{`
            @font-face {
                font-family: 'CustomPreviewFont';
                src: url('/assets/htmlFont.ttf') format('truetype');
            }
            .main-container {
                font-family: 'CustomPreviewFont', system-ui, -apple-system, sans-serif;
            }
            .title-effect {
                --t-stroke: 0.06em; --t-shadow: 0.08em; --t-color: #ec4899;
                position: relative; isolation: isolate; z-index: 2;
                white-space: nowrap; line-height: 1.1; letter-spacing: 0.1em;
            }
            .title-effect::before {
                content: attr(data-text); position: absolute; inset: 0; z-index: -1;
                -webkit-text-stroke: var(--t-stroke) var(--t-color); color: transparent;
            }
            .title-effect::after {
                content: attr(data-text); position: absolute; inset: 0; z-index: -2;
                transform: translate(var(--t-shadow), var(--t-shadow));
                color: var(--t-color); -webkit-text-stroke: var(--t-stroke) var(--t-color);
            }
            .card-item {
                background: #fff; border: 4px solid #000;
                box-shadow: 0 10px 24px rgba(0,0,0,0.12), 12px 12px 0 0 var(--card-shadow-color);
                border-radius: 30px; overflow: hidden;
            }
            .card-header::after {
                content: ""; position: absolute; left: 0; bottom: -2px; height: 3px; width: 100%;
                background: var(--card-accent-color); opacity: 0.9;
            }
            /* 使用 CSS 变量计算宽度 */
            .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); min-width: 500px; }
            .card-width-2col-wide { width: calc((100% - var(--container-gap) * 3) / 2 - 1px); min-width: 500px; } /* 2张/4张卡片用，增加左右边距 */
            .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); min-width: 400px; }
            .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); min-width: 340px; }
            
            .js-desc { letter-spacing: 0.02em; line-height: 1.5 !important; color: #0f172a; }
            .js-desc code {
                background: #f1f5f9;
                padding: 0.1em 0.35em; border-radius: 4px;
                margin: 0 0.2em;
                color: #000;
                border: 1px solid #cbd5e1;
                font-family: 'Cascadia Code', 'Consolas', 'Monaco', monospace;
                font-size: 0.85em; font-weight: 500;
            }
            .js-desc strong { color: #000; font-weight: 800; }
            .content-scale { transform-origin: center center; }

            /* 强制包含：中间档位字体字号 (Tier Font Sizes) */
            .text-5-5xl { font-size: 3.375rem; line-height: 1.1; }
            .text-4-5xl { font-size: 2.625rem; line-height: 1.2; }
            .text-3-5xl { font-size: 2.0625rem; line-height: 1.3; }
            .text-2-5xl { font-size: 1.8125rem; line-height: 1.4; }

            /* 标准 Tailwind 字号 (防止环境缺失 Tailwind) */
            .text-6xl { font-size: 3.75rem; line-height: 1; }
            .text-5xl { font-size: 3rem; line-height: 1; }
            .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
            .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
            .text-2xl { font-size: 1.5rem; line-height: 2rem; }
            .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
            
            .font-bold { font-weight: 700; }
            .font-black { font-weight: 900; }
            .text-center { text-align: center; }
            .text-white { color: #fff; }
            .text-black { color: #000; }
            .flex { display: flex; }
            .flex-col { flex-direction: column; }
            .justify-between { justify-content: space-between; }
            .items-center { align-items: center; }
            .relative { position: relative; }
            .border-b-2 { border-bottom-width: 2px; }
            .border-black { border-color: #000; }
            .pb-4 { padding-bottom: 1rem; }
            .mb-4 { margin-bottom: 1rem; }
        `}</style>

        <div
            className="main-container relative box-border bg-[#f6f5f0] w-full h-full overflow-hidden flex flex-col items-center justify-center"
        >
            <div
                ref={wrapperRef}
                className="content-wrapper w-full flex flex-col items-center px-16 box-border content-scale"
                style={{ 
                    gap: layout.wrapperGap,
                    paddingLeft: layout.wrapperPaddingX || standardLayout.wrapperPaddingX,
                    paddingRight: layout.wrapperPaddingX || standardLayout.wrapperPaddingX
                }}
            >
                {/* 标题区域 */}
                <div className="title-zone flex-none flex items-center justify-center">
                    <h1
                        ref={titleRef}
                        data-text={data.mainTitle}
                        className="text-white text-center font-black title-effect"
                    >
                        {data.mainTitle}
                    </h1>
                </div>

                {/* 卡片区域 */}
                <div className="card-zone flex-none w-full">
                    <div
                        ref={cardContainerRef}
                        className="w-full flex flex-wrap justify-center content-center"
                        style={{ 
                            gap: layout.containerGap,
                            '--container-gap': layout.containerGap
                        } as React.CSSProperties}
                    >
                        {data.cards.map((card, idx) => {
                            const theme = getCardThemeColor(NEWS_CARD_THEMES, idx);
                            return (
                                <div 
                                    key={idx} 
                                    className={`card-item ${layout.cardWidthClass} flex flex-col text-black`}
                                    style={{ 
                                        padding: layout.cardPadding,
                                        '--card-shadow-color': theme.hex,
                                        '--card-accent-color': theme.hex
                                    } as React.CSSProperties}
                                >
                                    <div className="card-header flex justify-between items-center border-b-2 border-black pb-4 mb-4 relative">
                                        <h3 className={`js-title font-bold ${layout.titleSizeClass}`}>{card.title}</h3>
                                        <span className={`js-icon material-icons ${theme.txt}`} style={{ fontSize: layout.iconSize }}>{card.icon}</span>
                                    </div>
                                    <p
                                        className={`js-desc ${layout.descSizeClass}`}
                                        dangerouslySetInnerHTML={{ __html: card.desc }}
                                    />
                                </div>
                            );
                        })}
                    </div>
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

/**
 * NewsCard 模板配置
 */
export const newsCardTemplate: TemplateConfig = {
  id: 'newsCard',
  name: '新闻卡片',
  description: '精美的新闻摘要卡片样式',
  icon: 'style',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <NewsCard data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'newsCard'),
};

// 导出组件供下载模板使用
export { NewsCard };
