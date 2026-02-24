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
import { generateDownloadableHtml } from '../utils/template';

/**
 * BlogGlass 主题颜色（内联定义）
 */
const THEME_COLORS: ThemeColor[] = [
    { bg: 'rgba(255, 255, 255, 0.4)', onBg: '#334f52', icon: '#35bfab' },
    { bg: 'rgba(255, 255, 255, 0.4)', onBg: '#334f52', icon: '#1fc9e7' },
    { bg: 'rgba(255, 255, 255, 0.4)', onBg: '#334f52', icon: '#334f52' },
    { bg: 'rgba(255, 255, 255, 0.5)', onBg: '#334f52', icon: '#35bfab' }
];

/**
 * BlogGlass 渲染组件
 * 仿博客毛玻璃卡片风格
 */
interface BlogGlassProps {
    data: GeneratedContent;
    scale: number;
}

const BlogGlass: React.FC<BlogGlassProps> = ({ data, scale }) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);

    const N = data.cards.length;
    const layout = calculateStandardLayout(N);
    const titleConfig = getStandardTitleConfig(N);

    // 布局适配算法
    useLayoutEffect(() => {
        if (typeof window === 'undefined') return;
        if (!wrapperRef.current || !titleRef.current) return;

        const wrapper = wrapperRef.current;
        const title = titleRef.current;

        // 1. 标题适配
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

        // 2. 视口适配
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
            .main-container {
                font-family: 'CustomPreviewFont', system-ui, -apple-system, sans-serif;
                background-color: #eeeeee;
                color: #334f52;
            }
            .blog-title {
                font-weight: 700;
                background: linear-gradient(to right bottom, #0003 0%, #aaa1), linear-gradient(to right bottom, #35bfab 40%, #1fc9e7);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                line-height: 1.2;
                white-space: nowrap;
            }
            .card-item {
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            }
            
            /* 卡片宽度类 */
            .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 0.5px); }
            .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 0.5px); }
            .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 0.5px); }

            .js-desc strong { color: #334f52; font-weight: 700; }
            .js-desc code {
                background: rgba(51, 79, 82, 0.1);
                padding: 0.1em 0.3em;
                border-radius: 8px;
                font-family: 'SF Mono', 'Roboto Mono', monospace;
                font-size: 0.9em;
                color: #334f52;
            }
            .content-scale { transform-origin: center center; }

            /* 中间档位字体 */
            .text-5-5xl { font-size: 3.375rem; line-height: 1.1; }
            .text-4-5xl { font-size: 2.625rem; line-height: 1.2; }
            .text-3-5xl { font-size: 2.0625rem; line-height: 1.3; }
            .text-2-5xl { font-size: 1.8125rem; line-height: 1.4; }
        `}</style>

            <div className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
                <div
                    ref={wrapperRef}
                    className="content-wrapper w-full flex flex-col items-center px-24 box-border content-scale z-10"
                    style={{
                        gap: layout.wrapperGap,
                        paddingLeft: layout.wrapperPaddingX,
                        paddingRight: layout.wrapperPaddingX
                    }}
                >
                    {/* 顶部标题 */}
                    <div className="flex flex-col items-center">
                        <h1
                            ref={titleRef}
                            className="text-center blog-title main-title"
                        >
                            {data.mainTitle}
                        </h1>
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
                                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                                    style={{
                                        padding: layout.cardPadding,
                                        backgroundColor: theme.bg,
                                        backdropFilter: 'blur(4px)',
                                        WebkitBackdropFilter: 'blur(4px)',
                                        borderRadius: '40px',
                                        border: '1px solid rgba(255, 255, 255, 0.8)',
                                        boxShadow: '0 40px 50px -32px rgba(0, 0, 0, 0.05), inset 0 0 20px rgba(255, 255, 255, 0.25)'
                                    }}
                                >
                                    <div className="card-header flex items-center gap-4 mb-4">
                                        <span
                                            className="material-symbols-rounded"
                                            style={{ fontSize: layout.iconSize, color: theme.icon }}
                                        >
                                            {card.icon}
                                        </span>
                                        <h3
                                            className={`font-bold leading-tight ${layout.titleSizeClass}`}
                                            style={{ color: theme.onBg }}
                                        >
                                            {card.title}
                                        </h3>
                                    </div>
                                    <p
                                        className={`font-medium leading-relaxed ${layout.descSizeClass}`}
                                        style={{ color: '#7b888e' }}
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

export const blogGlassTemplate: TemplateConfig = {
    id: 'blogGlass',
    name: '博客毛玻璃',
    description: '仿博客毛玻璃卡片风格',
    icon: 'blur_on',
    downloadable: true,
    ssrReady: true,
    render: (data, scale) => <BlogGlass data={data} scale={scale} />,
    generateHtml: (data) => generateDownloadableHtml(data, 'blogGlass'),
};

export { BlogGlass };
