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
 * Bauhaus 主题颜色（内联定义）
 * 几何原色功能主义
 */
const BAUHAUS_COLORS: ThemeColor[] = [
    { bg: '#e53935', onBg: '#ffffff', icon: '#ffffff' },
    { bg: '#1e88e5', onBg: '#ffffff', icon: '#ffffff' },
    { bg: '#fdd835', onBg: '#000000', icon: '#000000' },
    { bg: '#212121', onBg: '#ffffff', icon: '#ffffff' },
    { bg: '#ffffff', onBg: '#000000', icon: '#000000' },
];

const Bauhaus: React.FC<{ data: GeneratedContent; scale: number }> = ({ data, scale }) => {
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
            <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;500;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
            <style>{`
                @font-face {
                    font-family: 'CustomPreviewFont';
                    src: url('/assets/htmlFont.ttf') format('truetype');
                }
                .main-container {
                    font-family: 'Space Grotesk', sans-serif;
                    background-color: #f5f5f0;
                    color: #000000;
                }
                .bauhaus-title {
                    font-family: 'Bebas Neue', sans-serif;
                    font-weight: 400;
                    color: #000000;
                    letter-spacing: 0.05em;
                    line-height: 1;
                    text-transform: uppercase;
                    white-space: nowrap;
                }
                .card-item {
                    border-radius: 0;
                    transition: transform 0.15s;
                }
                .card-item:hover {
                    transform: translate(-2px, -2px);
                }
                .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
                .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
                .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
                .js-desc strong { font-weight: 700; }
                .js-desc code {
                    background: rgba(0,0,0,0.2);
                    padding: 0.1em 0.3em;
                    font-family: 'Courier New', monospace;
                    font-size: 0.9em;
                }
                .content-scale { transform-origin: center center; }
                .material-symbols-rounded { font-family: 'Material Symbols Rounded' !important; font-weight: normal; font-style: normal; display: inline-block; }

                .bauhaus-shape {
                    position: absolute;
                    pointer-events: none;
                    opacity: 0.15;
                }

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
                <div className="bauhaus-shape w-64 h-64 bg-[#e53935] rounded-full" style={{ top: '-5%', left: '-5%' }}></div>
                <div className="bauhaus-shape w-48 h-48 bg-[#fdd835]" style={{ top: '10%', right: '10%' }}></div>
                <div className="bauhaus-shape w-32 h-32 bg-[#1e88e5]" style={{ bottom: '10%', left: '15%' }}></div>

                <div
                    ref={wrapperRef}
                    className="content-wrapper w-full flex flex-col items-center px-24 box-border content-scale relative z-10"
                    style={{
                        gap: layout.wrapperGap,
                        paddingLeft: layout.wrapperPaddingX || undefined,
                        paddingRight: layout.wrapperPaddingX || undefined
                    }}
                >
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#e53935]"></div>
                            <div className="w-8 h-8 rounded-full bg-[#fdd835]"></div>
                            <div className="w-8 h-8 bg-[#1e88e5]"></div>
                        </div>
                        <h1 ref={titleRef} className="text-center bauhaus-title">
                            {data.mainTitle}
                        </h1>
                        <div className="w-32 h-1 bg-[#000000]"></div>
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
                                const theme = getCardThemeColor(BAUHAUS_COLORS, idx);
                                return (
                                    <div
                                        key={idx}
                                        className={`card-item flex flex-col ${layout.cardWidthClass}`}
                                        style={{
                                            padding: layout.cardPadding,
                                            backgroundColor: theme.bg,
                                            border: '3px solid #000000'
                                        }}
                                    >
                                        <div className="flex items-center gap-4 mb-6">
                                            <span
                                                className="material-symbols-rounded"
                                                style={{ color: theme.icon, fontSize: layout.iconSize }}
                                            >
                                                {card.icon}
                                            </span>
                                            <h3
                                                className={`${layout.titleSizeClass} font-bold uppercase`}
                                                style={{ color: theme.onBg }}
                                            >
                                                {card.title}
                                            </h3>
                                        </div>
                                        <p
                                            className={`${layout.descSizeClass} font-medium`}
                                            style={{ color: theme.onBg }}
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

export const bauhausTemplate: TemplateConfig = {
    id: 'bauhaus',
    name: '包豪斯',
    description: '几何原色功能主义包豪斯风格',
    icon: 'category',
    downloadable: true,
    ssrReady: true,
    render: (data, scale) => <Bauhaus data={data} scale={scale} />,
    generateHtml: (data) => generateDownloadableHtml(data, 'bauhaus'),
};

export { Bauhaus };
