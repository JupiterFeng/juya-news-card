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
 * 抽象艺术主题颜色（内联定义）
 */
const ABSTRACT_COLORS: ThemeColor[] = [
    { bg: '#ffffff', onBg: '#1a1a1a', icon: '#3a3a3a' },
    { bg: '#f5f5f5', onBg: '#1a1a1a', icon: '#4a4a4a' },
    { bg: '#fafafa', onBg: '#1a1a1a', icon: '#2a2a2a' },
    { bg: '#eeeeee', onBg: '#1a1a1a', icon: '#5a5a5a' },
];

interface AbstractArtProps {
  data: GeneratedContent;
  scale: number;
}

const AbstractArt: React.FC<AbstractArtProps> = ({ data, scale }) => {
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

    // 获取边框颜色（每张卡片的边框颜色不同）
    const getBorderColor = (idx: number) => {
        const colors = ['#e0e0e0', '#d0d0d0', '#e8e8e8', '#d8d8d8'];
        return colors[idx % colors.length];
    };

    return (
        <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', overflow: 'hidden' }}>
            <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
            <style>{`
                @font-face {
                    font-family: 'CustomPreviewFont';
                    src: url('/assets/htmlFont.ttf') format('truetype');
                }
                .abstract-container {
                    font-family: 'Roboto', 'CustomPreviewFont', sans-serif;
                    background: #ffffff;
                    color: #1a1a1a;
                    position: relative;
                    overflow: hidden;
                }
                .abstract-container::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='20' y='20' width='30' height='30' fill='none' stroke='%23000000' stroke-opacity='0.05'/%3E%3Crect x='60' y='60' width='25' height='25' fill='none' stroke='%23000000' stroke-opacity='0.05'/%3E%3Cline x1='55' y1='20' x2='55' y2='50' stroke='%23000000' stroke-opacity='0.05'/%3E%3Cline x1='20' y1='55' x2='50' y2='55' stroke='%23000000' stroke-opacity='0.05'/%3E%3C/svg%3E");
                    pointer-events: none;
                }
                .abstract-title {
                    font-weight: 100;
                    color: #1a1a1a;
                    letter-spacing: 0.3em;
                    line-height: 1.2;
                    position: relative;
                    z-index: 10;
                    text-transform: uppercase;
                    white-space: nowrap;
                }
                .card-item {
                    transition: all 0.3s ease;
                    position: relative;
                    z-index: 5;
                }
                .card-item::before {
                    content: '';
                    position: absolute;
                    top: -3px;
                    left: -3px;
                    width: 6px;
                    height: 6px;
                    background: #1a1a1a;
                }
                .card-item:hover {
                    transform: translate(-4px, -4px);
                    box-shadow: 12px 12px 0 rgba(0,0,0,0.15);
                }
                .minimal-accent {
                    position: absolute;
                    bottom: 15px;
                    right: 15px;
                    width: 20px;
                    height: 20px;
                    border: 2px solid rgba(0,0,0,0.2);
                    pointer-events: none;
                }
                .content-scale {
                    transform-origin: center center;
                }
                .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
                .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
                .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }

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
                className="abstract-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
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
                        <div style={{ width: '120px', height: '1px', background: '#1a1a1a', marginBottom: '24px' }}></div>
                        <h1 ref={titleRef} className="text-center abstract-title">
                            {data.mainTitle}
                        </h1>
                        <div style={{ width: '120px', height: '1px', background: '#1a1a1a', marginTop: '24px' }}></div>
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
                                const theme = getCardThemeColor(ABSTRACT_COLORS, idx);
                                return (
                                    <div
                                        key={idx}
                                        className={`card-item flex flex-col ${layout.cardWidthClass}`}
                                        style={{
                                            padding: layout.cardPadding,
                                            backgroundColor: theme.bg,
                                            border: '3px solid',
                                            borderColor: getBorderColor(idx),
                                            borderRadius: '0',
                                            boxShadow: '8px 8px 0 rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        <div className="minimal-accent"></div>
                                        <div className="card-header flex items-center gap-3 mb-4">
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
                                                    fontFamily: "'Helvetica Neue', 'Arial', sans-serif",
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.15em',
                                                    fontWeight: 300
                                                }}
                                            >
                                                {card.title}
                                            </h3>
                                        </div>
                                        <p
                                            className={layout.descSizeClass}
                                            style={{ color: theme.onBg, opacity: 0.8, fontWeight: 300 }}
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

export const abstractArtTemplate: TemplateConfig = {
    id: 'abstractArt',
    name: '抽象艺术',
    description: '网格比例与形色秩序的抽象风格，几何抽象与抒情抽象',
    icon: 'dashboard',
    downloadable: true,
    ssrReady: true,
    render: (data, scale) => <AbstractArt data={data} scale={scale} />,
    generateHtml: (data) => generateDownloadableHtml(data, 'abstractArt'),
};

export { AbstractArt };
