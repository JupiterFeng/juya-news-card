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
 * 白描风格主题颜色（内联定义）
 */
const THEME_COLORS: ThemeColor[] = [
    { bg: 'transparent', onBg: '#1a1a1a', icon: '#1a1a1a' },
    { bg: 'transparent', onBg: '#1a1a1a', icon: '#1a1a1a' },
    { bg: 'transparent', onBg: '#1a1a1a', icon: '#1a1a1a' },
    { bg: 'transparent', onBg: '#1a1a1a', icon: '#1a1a1a' },
];

interface BaimiaoStyleProps {
  data: GeneratedContent;
  scale: number;
}

const BaimiaoStyle: React.FC<BaimiaoStyleProps> = ({ data, scale }) => {
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
            <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
            <style>{`
                @font-face {
                    font-family: 'CustomPreviewFont';
                    src: url('/assets/htmlFont.ttf') format('truetype');
                }
                .baimiao-container {
                    font-family: 'Noto Serif SC', 'CustomPreviewFont', serif;
                    background: #faf9f7;
                    color: #1a1a1a;
                    background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23d4d4d4' fill-opacity='0.15' fill-rule='evenodd'/%3E%3C/svg%3E");
                }
                .baimiao-title {
                    font-weight: 400;
                    color: #1a1a1a;
                    letter-spacing: 0.15em;
                    line-height: 1.5;
                    white-space: nowrap;
                }
                .card-item {
                    background: transparent;
                    transition: all 0.3s ease;
                    position: relative;
                }
                .card-item::before {
                    content: '';
                    position: absolute;
                    top: -4px;
                    left: -4px;
                    right: -4px;
                    bottom: -4px;
                    border: 1px solid rgba(26, 26, 26, 0.2);
                    pointer-events: none;
                }
                .card-item:hover {
                    background: 'rgba(255,255,255,0.5)';
                }
                .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
                .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
                .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
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
            `}</style>

            {/* SSR 兼容脚本 */}
            <script dangerouslySetInnerHTML={{
                __html: `
                    ${generateTitleFitScript(titleConfig)}
                    ${generateViewportFitScript()}
                `
            }} />

            <div
                className="baimiao-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
            >
                <div
                    ref={wrapperRef}
                    className="content-wrapper w-full flex flex-col items-center px-20 box-border content-scale z-10"
                    style={{
                        gap: layout.wrapperGap,
                        paddingLeft: layout.wrapperPaddingX || undefined,
                        paddingRight: layout.wrapperPaddingX || undefined
                    }}
                >
                    <div className="flex flex-col items-center">
                        <h1 ref={titleRef} className="text-center baimiao-title">
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
                                            padding: layout.cardPadding,
                                            backgroundColor: theme.bg,
                                            border: '2px solid #1a1a1a',
                                            borderRadius: '0'
                                        }}
                                    >
                                        <div className="card-header flex items-center gap-3 mb-3">
                                            <span
                                                className="material-symbols-rounded"
                                                style={{ color: theme.icon, fontSize: layout.iconSize }}
                                            >
                                                {card.icon}
                                            </span>
                                            <h3
                                                className={layout.titleSizeClass}
                                                style={{
                                                    color: theme.onBg,
                                                    fontFamily: "'Noto Serif SC', serif"
                                                }}
                                            >
                                                {card.title}
                                            </h3>
                                        </div>
                                        <p
                                            className={layout.descSizeClass}
                                            style={{ color: theme.onBg, opacity: 0.8 }}
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

export const baimiaoStyleTemplate: TemplateConfig = {
    id: 'baimiaoStyle',
    name: '白描',
    description: '纯线条造型的传统白描风格，以线塑形、疏密有致',
    icon: 'gesture',
    downloadable: true,
    ssrReady: true,
    render: (data, scale) => <BaimiaoStyle data={data} scale={scale} />,
    generateHtml: (data) => generateDownloadableHtml(data, 'baimiaoStyle'),
};

export { BaimiaoStyle };
