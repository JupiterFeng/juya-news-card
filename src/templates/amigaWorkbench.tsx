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
 * Amiga Workbench 主题颜色（内联定义）
 */
const AMIGA_COLORS: ThemeColor[] = [
    { bg: '#c0c0c0', onBg: '#000000', icon: '#000080' },
    { bg: '#008080', onBg: '#ffffff', icon: '#ffffff' },
    { bg: '#800080', onBg: '#ffffff', icon: '#ffffff' },
    { bg: '#808000', onBg: '#000000', icon: '#000080' },
];

/**
 * AmigaWorkbench 渲染组件
 * Amiga Workbench (1985) 风格
 * 高对比配色、像素图标、强烈3D凹凸控件
 */
interface AmigaWorkbenchProps {
  data: GeneratedContent;
  scale: number;
}

const AmigaWorkbench: React.FC<AmigaWorkbenchProps> = ({ data, scale }) => {
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
                size -= 2;
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

    // 获取 Amiga 3D 边框颜色
    const getBorderColors = (idx: number) => {
        const themes = [
            { light: '#ffffff', dark: '#808080' },
            { light: '#00ffff', dark: '#004040' },
            { light: '#ff00ff', dark: '#400040' },
            { light: '#ffff00', dark: '#404000' },
        ];
        return themes[idx % themes.length];
    };

    return (
        <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', overflow: 'hidden' }}>
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
            <style>{`
                @font-face {
                    font-family: 'CustomPreviewFont';
                    src: url('/assets/htmlFont.ttf') format('truetype');
                }
                .amiga-container {
                    font-family: 'CustomPreviewFont', 'Courier New', monospace;
                    background: linear-gradient(135deg, #000080 0%, #000040 100%);
                    color: #ffffff;
                }
                .amiga-title {
                    font-weight: bold;
                    color: #ffffff;
                    text-shadow: 4px 4px 0 #000000, -2px -2px 0 #808080;
                    letter-spacing: 2px;
                    font-family: 'CustomPreviewFont', 'Courier New', monospace;
                    white-space: nowrap;
                }
                .card-item {
                    position: relative;
                }
                /* ✅ 中间档位字体字号 (强制包含) */
                .text-5-5xl { font-size: 3.375rem; line-height: 1.1; }
                .text-4-5xl { font-size: 2.625rem; line-height: 1.2; }
                .text-3-5xl { font-size: 2.0625rem; line-height: 1.3; }
                .text-2-5xl { font-size: 1.8125rem; line-height: 1.4; }
                /* 标准字号（显式定义以脱离对外部 CDN 的依赖） */
                .text-6xl { font-size: 3.75rem; line-height: 1; }
                .text-5xl { font-size: 3rem; line-height: 1; }
                .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
                .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
                .text-2xl { font-size: 1.5rem; line-height: 2rem; }
                .text-xl  { font-size: 1.25rem; line-height: 1.75rem; }
                .text-lg  { font-size: 1.125rem; line-height: 1.75rem; }
                .text-base { font-size: 1rem; line-height: 1.5rem; }
                .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
                .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
                .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
                .js-desc strong { color: inherit; font-weight: bold; }
                .content-scale { transform-origin: center center; }
                .material-symbols-rounded { font-family: 'Material Symbols Rounded' !important; font-weight: normal; font-style: normal; display: inline-block; }
            `}</style>

            {/* SSR 兼容脚本 */}
            <script dangerouslySetInnerHTML={{
                __html: `
                    ${generateTitleFitScript(titleConfig)}
                    ${generateViewportFitScript()}
                `
            }} />

            <div
                className="amiga-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
            >
                <div
                    ref={wrapperRef}
                    className="content-wrapper w-full flex flex-col items-center px-16 box-border content-scale"
                    style={{
                        gap: layout.wrapperGap,
                        paddingLeft: layout.wrapperPaddingX || undefined,
                        paddingRight: layout.wrapperPaddingX || undefined
                    }}
                >
                    {/* 顶部标题 */}
                    <div className="flex flex-col items-center">
                        <h1
                            ref={titleRef}
                            className="text-center amiga-title"
                            style={{
                                padding: '16px 32px',
                                background: '#c0c0c0',
                                borderRight: '4px solid #ffffff',
                                borderBottom: '4px solid #ffffff',
                                borderLeft: '4px solid #808080',
                                borderTop: '4px solid #808080',
                                color: '#000000'
                            }}
                        >
                            {data.mainTitle}
                        </h1>
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
                                const theme = getCardThemeColor(AMIGA_COLORS, idx);
                                const borderColors = getBorderColors(idx);
                                return (
                                    <div
                                        key={idx}
                                        className={`card-item flex flex-col ${layout.cardWidthClass}`}
                                        style={{
                                            padding: layout.cardPadding,
                                            backgroundColor: theme.bg,
                                            borderTop: '4px solid ' + borderColors.light,
                                            borderLeft: '4px solid ' + borderColors.light,
                                            borderRight: '4px solid ' + borderColors.dark,
                                            borderBottom: '4px solid ' + borderColors.dark,
                                            boxShadow: `inset 2px 2px 0 ${borderColors.light}, inset -2px -2px 0 ${borderColors.dark}`
                                        }}
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <span
                                                className="material-symbols-rounded"
                                                style={{ color: theme.icon, fontSize: layout.iconSize }}
                                            >
                                                {card.icon}
                                            </span>
                                            <h3
                                                className={`js-title font-bold ${layout.titleSizeClass}`}
                                                style={{
                                                    color: theme.onBg,
                                                    fontFamily: 'Topaz, monospace',
                                                    textShadow: `1px 1px 0 ${borderColors.light}`
                                                }}
                                            >
                                                {card.title}
                                            </h3>
                                        </div>
                                        <p
                                            className={`js-desc ${layout.descSizeClass}`}
                                            style={{
                                                color: theme.onBg
                                            }}
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

export const amigaWorkbenchTemplate: TemplateConfig = {
    id: 'amigaWorkbench',
    name: '复古工作台',
    description: '1985年复古工作台风格 - 高对比、像素化、3D凹凸控件',
    icon: 'computer',
    downloadable: true,
    ssrReady: true,
    render: (data, scale) => <AmigaWorkbench data={data} scale={scale} />,
    generateHtml: (data) => generateDownloadableHtml(data, 'amigaWorkbench'),
};

export { AmigaWorkbench };
