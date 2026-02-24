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
 * Adobe Spectrum 主题颜色（内联定义）
 */
const THEME_COLORS: ThemeColor[] = [
    { bg: '#ffffff', onBg: '#323232', icon: '#ff8a00' },
    { bg: '#f5f5f5', onBg: '#323232', icon: '#e66c00' },
    { bg: '#ffffff', onBg: '#323232', icon: '#cc5d00' },
    { bg: '#fafafa', onBg: '#323232', icon: '#ff8a00' },
];

const AdobeSpectrum: React.FC<{ data: GeneratedContent; scale: number }> = ({ data, scale }) => {
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
            <link href="https://fonts.googleapis.com/css2?family=Adobe+Clean:wght@400;500;700&family=Source++Sans+Pro:wght@400;600&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
            <style>{`
                @font-face {
                    font-family: 'CustomPreviewFont';
                    src: url('/assets/htmlFont.ttf') format('truetype');
                }
                .main-container {
                    font-family: 'Source Sans Pro', 'Adobe Clean', -apple-system, BlinkMacSystemFont, sans-serif;
                    background: linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%);
                    color: #323232;
                }
                .spectrum-title {
                    font-weight: 700;
                    color: #323232;
                    letter-spacing: -0.01em;
                    line-height: 1.1;
                    white-space: nowrap;
                }
                .card-item {
                    background: #ffffff;
                    border-radius: 6px;
                    border: 1px solid #d0d0d0;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                    transition: box-shadow 0.15s, border-color 0.15s;
                }
                .card-item:hover {
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    border-color: #ff8a00;
                }
                .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
                .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
                .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
                .js-desc strong { color: #323232; font-weight: 600; }
                .js-desc code {
                    background: #f5f5f5; padding: 0.1em 0.3em; border-radius: 4px;
                    font-family: 'Source Code Pro', monospace;
                    font-size: 0.9em; color: #1473e6;
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
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
                    <div className="absolute top-[-10%] left-[-10%] w-[35%] h-[35%] bg-orange-200 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-100 rounded-full blur-[100px]"></div>
                </div>

                <div
                    ref={wrapperRef}
                    className="content-wrapper w-full flex flex-col items-center px-24 box-border content-scale relative z-10"
                    style={{
                        gap: layout.wrapperGap,
                        paddingLeft: layout.wrapperPaddingX || undefined,
                        paddingRight: layout.wrapperPaddingX || undefined
                    }}
                >
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-1 rounded-full bg-[#ff8a00]"></div>
                            <div className="w-8 h-1 rounded-full bg-[#e66c00]"></div>
                            <div className="w-8 h-1 rounded-full bg-[#cc5d00]"></div>
                        </div>
                        <h1 ref={titleRef} className="text-center spectrum-title">
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
                                            style={{ color: '#6e6e6e' }}
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

export const adobeSpectrumTemplate: TemplateConfig = {
    id: 'adobeSpectrum',
    name: '创意工具光谱',
    description: '创意软件工作台风格',
    icon: 'brush',
    downloadable: true,
    ssrReady: true,
    render: (data, scale) => <AdobeSpectrum data={data} scale={scale} />,
    generateHtml: (data) => generateDownloadableHtml(data, 'adobeSpectrum'),
};

export { AdobeSpectrum };
