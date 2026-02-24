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
 * Android Holo 主题颜色（内联定义）
 * 经典霓虹蓝
 */
const HOLO_COLORS: ThemeColor[] = [
    { bg: '#ffffff', onBg: '#333333', icon: '#33b5e5' },
    { bg: '#fafafa', onBg: '#333333', icon: '#33b5e5' },
    { bg: '#f8f8f8', onBg: '#333333', icon: '#33b5e5' },
    { bg: '#fcfcfc', onBg: '#333333', icon: '#33b5e5' },
];

/**
 * AndroidHolo 渲染组件
 * Android 4.0 "Holo（霓虹蓝扁平 + 阴影深度）" (2011) 风格
 * 霓虹蓝强调色、硬边、适度阴影、Roboto字体
 */
interface AndroidHoloProps {
  data: GeneratedContent;
  scale: number;
}

const AndroidHolo: React.FC<AndroidHoloProps> = ({ data, scale }) => {
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

    // 获取分隔线颜色
    const getDividerColor = (idx: number) => {
        const colors = ['#e0e0e0', '#e5e5e5', '#e8e8e8', '#ececec'];
        return colors[idx % colors.length];
    };

    return (
        <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', overflow: 'hidden' }}>
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
            <style>{`
                @font-face {
                    font-family: 'CustomPreviewFont';
                    src: url('/assets/htmlFont.ttf') format('truetype');
                }
                .holo-container {
                    font-family: 'CustomPreviewFont', 'Roboto', 'Arial', sans-serif;
                    background: linear-gradient(180deg, #111111 0%, #1a1a1a 100%);
                    color: #ffffff;
                }
                .holo-title {
                    font-weight: 500;
                    color: '#33b5e5';
                    font-family: 'CustomPreviewFont', 'Roboto', sans-serif;
                    textTransform: 'uppercase';
                    letterSpacing: '2px';
                    white-space: nowrap;
                }
                .card-item {
                    position: relative;
                }
                .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
                .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
                .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
                .js-desc strong { color: #33b5e5; font-weight: 600; }
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
                className="holo-container relative box-border w-full h-full overflow-hidden flex flex-col"
            >
                {/* Android 状态栏 */}
                <div style={{
                    height: '24px',
                    background: '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 12px',
                    gap: '8px',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: '500'
                }}>
                    <span>9:41</span>
                    <div style={{ flex: 1 }}></div>
                    <span className="material-icons" style={{ fontSize: '14px' }}>signal_cellular_alt</span>
                    <span className="material-icons" style={{ fontSize: '14px' }}>battery_full</span>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <div
                        ref={wrapperRef}
                        className="content-wrapper w-full flex flex-col items-center content-scale"
                        style={{
                            gap: layout.wrapperGap,
                            paddingLeft: layout.wrapperPaddingX || undefined,
                            paddingRight: layout.wrapperPaddingX || undefined
                        }}
                    >
                        {/* 顶部标题 */}
                        <div className="flex flex-col items-center">
                            <div style={{
                                padding: '14px 24px',
                                background: '#222222',
                                borderBottom: '3px solid #33b5e5',
                                display: 'inline-block'
                            }}>
                                <h1
                                    ref={titleRef}
                                    className="text-center holo-title"
                                >
                                    {data.mainTitle}
                                </h1>
                            </div>
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
                                    const theme = getCardThemeColor(HOLO_COLORS, idx);
                                    return (
                                        <div
                                            key={idx}
                                            className={`card-item flex flex-col ${layout.cardWidthClass}`}
                                            style={{
                                                padding: layout.cardPadding,
                                                backgroundColor: theme.bg,
                                                border: '1px solid ' + getDividerColor(idx),
                                                borderLeft: '4px solid #33b5e5',
                                                borderRadius: '2px'
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
                                                    className={layout.titleSizeClass}
                                                    style={{
                                                        color: theme.onBg,
                                                        fontFamily: '"Roboto", "Arial", sans-serif',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                        fontWeight: 500
                                                    }}
                                                >
                                                    {card.title}
                                                </h3>
                                            </div>
                                            <p
                                                className={layout.descSizeClass}
                                                style={{
                                                    color: theme.onBg,
                                                    opacity: 0.85,
                                                    lineHeight: '1.5'
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
        </div>
    );
};

import { generateDownloadableHtml } from '../utils/template';

export const androidHoloTemplate: TemplateConfig = {
    id: 'androidHolo',
    name: '霓虹硬边界面',
    description: '2011年霓虹蓝硬边风格 - 强对比与科技感',
    icon: 'smartphone',
    downloadable: true,
    ssrReady: true,
    render: (data, scale) => <AndroidHolo data={data} scale={scale} />,
    generateHtml: (data) => generateDownloadableHtml(data, 'androidHolo'),
};

export { AndroidHolo };
