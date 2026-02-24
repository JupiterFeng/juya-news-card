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

/**
 * Atlassian Design 主题颜色（内联定义）
 */
const THEME_COLORS: ThemeColor[] = [
    { bg: '#ffffff', onBg: '#172b4d', icon: '#0052cc' },
    { bg: '#fafbfc', onBg: '#172b4d', icon: '#00875a' },
    { bg: '#ffffff', onBg: '#172b4d', icon: '#ff991f' },
    { bg: '#f4f5f7', onBg: '#172b4d', icon: '#0052cc' },
];

const AtlassianDesign: React.FC<{ data: GeneratedContent; scale: number }> = ({ data, scale }) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);

    const N = data.cards.length;

    // 使用默认配置
    const layout = calculateStandardLayout(N);
    const titleConfig = getStandardTitleConfig(N);

    useLayoutEffect(() => {
        if (typeof window === 'undefined') return;
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
            <link href="https://fonts.googleapis.com/css2?family=Charlie+Text:wght@400;500;600&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
            <style>{`
                @font-face {
                    font-family: 'CustomPreviewFont';
                    src: url('/assets/htmlFont.ttf') format('truetype');
                }
                .main-container {
                    font-family: 'Charlie Text', -apple-system, BlinkMacSystemFont, sans-serif;
                    background-color: #ebecf0;
                    color: #172b4d;
                }
                .atlassian-title {
                    font-weight: 500;
                    color: #172b4d;
                    letter-spacing: -0.02em;
                    line-height: 1.1;
                    white-space: nowrap;
                }
                .card-item {
                    background: #ffffff;
                    border-radius: 3px;
                    border: none;
                    box-shadow: 0 1px 2px rgba(9, 30, 66, 0.25);
                    transition: box-shadow 0.2s, background-color 0.2s;
                }
                .card-item:hover {
                    background-color: #fafbfc;
                    box-shadow: 0 4px 8px rgba(9, 30, 66, 0.25);
                }
                .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
                .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
                .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
                .js-desc strong { color: #172b4d; font-weight: 600; }
                .js-desc code {
                    background: #ebecf0; padding: 0.1em 0.3em; border-radius: 3px;
                    font-family: 'SF Mono', monospace;
                    font-size: 0.9em; color: #0052cc;
                }
                .content-scale { transform-origin: center center; }
                .material-symbols-rounded { font-family: 'Material Symbols Rounded' !important; font-weight: normal; font-style: normal; display: inline-block; }

                /* 中间档位字体字号 (Tier Font Sizes) */
                .text-5-5xl { font-size: 3.375rem; line-height: 1.1; }
                .text-4-5xl { font-size: 2.625rem; line-height: 1.2; }
                .text-3-5xl { font-size: 2.0625rem; line-height: 1.3; }
                .text-2-5xl { font-size: 1.8125rem; line-height: 1.4; }

                /* 标准 Tailwind 字号 */
                .text-5xl { font-size: 3rem; line-height: 1; }
                .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
                .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
                .text-2xl { font-size: 1.5rem; line-height: 2rem; }
                .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
                .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
                .text-base { font-size: 1rem; line-height: 1.5rem; }
                .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
            `}</style>

            {/* SSR 兼容脚本 */}
            <script dangerouslySetInnerHTML={{
                __html: `
                    ${generateTitleFitScript(titleConfig)}
                    ${generateViewportFitScript()}
                `
            }} />

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
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-2 h-2 rounded-full bg-[#0052cc]"></div>
                            <div className="w-2 h-2 rounded-full bg-[#00875a]"></div>
                            <div className="w-2 h-2 rounded-full bg-[#ff991f]"></div>
                        </div>
                        <h1 ref={titleRef} className="text-center atlassian-title">
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
                                        style={{ padding: layout.cardPadding }}
                                    >
                                        <div className="card-header flex items-center gap-3 mb-3">
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
                                            style={{ color: '#5e6c84' }}
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
    );
};

import { generateDownloadableHtml } from '../utils/template';

export const atlassianDesignTemplate: TemplateConfig = {
    id: 'atlassianDesign',
    name: '协作蓝图',
    description: '高信息密度协作工具风格',
    icon: 'grid_view',
    downloadable: true,
    ssrReady: true,
    render: (data, scale) => <AtlassianDesign data={data} scale={scale} />,
    generateHtml: (data) => generateDownloadableHtml(data, 'atlassianDesign'),
};

export { AtlassianDesign };
