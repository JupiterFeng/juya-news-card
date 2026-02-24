import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import {
    ThemeColor,
    getCardThemeColor,
    generateTitleFitScript,
    generateFitTextScript,
    generateViewportFitScript,
    calculateStandardLayout,
    getStandardTitleConfig,
} from '../utils/layout-calculator';
import { generateDownloadableHtml } from '../utils/template';
import { autoAddSpace, autoAddSpaceToHtml } from '../utils/text-spacing';

/**
 * ClaudeStyle 主题颜色
 */
const THEME_COLORS: ThemeColor[] = [
    { bg: '#f0eee6', onBg: '#4a403a', icon: '#c96442' }, // 基础暖色
    { bg: '#f0eee6', onBg: '#4a403a', icon: '#e09f3e' }, // 暖黄点缀
    { bg: '#f0eee6', onBg: '#4a403a', icon: '#335c67' }, // 对比蓝绿
    { bg: '#f0eee6', onBg: '#4a403a', icon: '#9e2a2b' }  // 深红点缀
];

/**
 * ClaudeStyle 渲染组件
 * 温暖矩形风格 - 白色卡片包裹彩色标题块
 */
interface ClaudeStyleProps {
    data: GeneratedContent;
    scale: number;
}

const ClaudeStyle: React.FC<ClaudeStyleProps> = ({ data, scale }) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const CARD_TITLE_MIN_FONT_SIZE = 24;

    const N = data.cards.length;
    
    // 纯函数预计算布局（SSR 友好）
    const layout = calculateStandardLayout(N);
    const titleConfig = getStandardTitleConfig(N);
    const descSizeClass =
        N <= 6
            ? (N <= 3 ? layout.descSizeClass : 'text-3-75xl')
            : (N <= 8 ? 'text-3-25xl' : layout.descSizeClass);

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

        // 2. 卡片标题适配 (防止换行并自动缩小)
        const fitCardTitles = () => {
            const titles = wrapper.querySelectorAll('.card-title') as NodeListOf<HTMLElement>;
            titles.forEach(el => {
                el.style.fontSize = ''; // Reset to CSS class defined size
                const style = window.getComputedStyle(el);
                const baseFontSize = parseFloat(style.fontSize);
                if (!baseFontSize) return;
                let fontSize = baseFontSize;
                const minFontSize = Math.max(CARD_TITLE_MIN_FONT_SIZE, Math.floor(baseFontSize * 0.7));

                let guard = 0;
                while (el.scrollWidth > el.clientWidth && fontSize > minFontSize && guard < 50) {
                    fontSize--;
                    el.style.fontSize = fontSize + 'px';
                    guard++;
                }
            });
        };
        fitCardTitles();

        // 3. 视口适配
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
        const settleTimer = window.setTimeout(() => {
            fitCardTitles();
            fitViewport();
        }, 220);

        let disposed = false;
        if (document.fonts?.ready) {
            Promise.race([
                document.fonts.ready,
                new Promise<void>((resolve) => window.setTimeout(resolve, 1500)),
            ])
                .then(() => {
                    if (disposed) return;
                    window.requestAnimationFrame(() => {
                        if (disposed) return;
                        fitCardTitles();
                        window.setTimeout(() => {
                            if (disposed) return;
                            fitViewport();
                        }, 50);
                    });
                })
                .catch(() => {});
        }

        return () => {
            disposed = true;
            window.clearTimeout(timer);
            window.clearTimeout(settleTimer);
        };
    }, [data, titleConfig]);

    // 生成 SSR 用的调整脚本
    const ssrScript = `
      ${generateTitleFitScript(titleConfig)}
      ${generateFitTextScript('.card-title', CARD_TITLE_MIN_FONT_SIZE)}
      ${generateViewportFitScript()}
    `;

    return (
        <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', overflow: 'hidden' }}>
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,300,0,0&display=swap" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet" />
            <style>{`
            @font-face {
                font-family: 'CustomPreviewFont';
                src: url('/assets/htmlFont.ttf') format('truetype');
            }
            .main-container {
                font-family: system-ui, -apple-system, sans-serif;
                background-color: #fbf9f6;
                color: #4a403a;
            }
            .warm-title {
                font-weight: 700;
                color: #c96442;
                line-height: 1.2;
                white-space: nowrap;
                text-shadow: 2px 2px 0px rgba(201, 100, 66, 0.1);
            }
            .material-symbols-rounded {
                font-family: 'Material Symbols Rounded' !important;
                font-weight: 300 !important;
                font-style: normal;
                display: inline-block;
                line-height: 1;
                text-transform: none;
                letter-spacing: normal;
                white-space: nowrap;
                direction: ltr;
                font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24 !important;
            }
            .card-item {
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            }
            
            /* 卡片宽度类 - 匹配 layout-calculator 逻辑 */
            .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
            .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
            .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }

            /* 自定义大字号阶梯 - 匹配 layout-calculator 返回的类名 */
            .text-5-5xl { font-size: 3.375rem; line-height: 1.1; } /* 54px */
            .text-4-5xl { font-size: 2.625rem; line-height: 1.2; } /* 42px */
            .text-3-5xl { font-size: 2.0625rem; line-height: 1.3; } /* 33px */
            .text-2-5xl { font-size: 1.8125rem; line-height: 1.4; } /* 29px */
            .text-3-75xl { font-size: 2.125rem; line-height: 1.35; } /* 34px */
            .text-3-25xl { font-size: 2rem; line-height: 1.35; } /* 32px */

            .js-desc strong { font-weight: 700; }
            .js-desc code {
                background-color: rgb(240, 239, 235) !important;
                color: rgb(92, 22, 22) !important;
                border: 0.5px solid #d1cfcc !important;
                border-radius: 8px !important;
                padding: 0.1em 0.3em;
                font-family: system-ui, -apple-system, sans-serif;
                font-size: 0.9em;
            }
            .content-scale { transform-origin: center center; }

            .title-box {
                /* 标题区域样式 - 移除背景后仅用于布局 */
            }
        `}</style>

            <div className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
                <div
                    ref={wrapperRef}
                    className="content-wrapper w-full flex flex-col items-center px-24 box-border content-scale z-10"
                    style={{
                        gap: layout.wrapperGap,
                        paddingLeft: layout.wrapperPaddingX || undefined,
                        paddingRight: layout.wrapperPaddingX || undefined
                    }}
                >
                    {/* 顶部标题（对齐 risograph 的标题-卡片间距结构） */}
                    <div className="title-zone flex-none flex items-center justify-center w-full">
                        <h1
                            ref={titleRef}
                            className="text-center warm-title main-title"
                            style={{ fontSize: `${titleConfig.initialFontSize}px` }}
                        >
                            {data.mainTitle}
                        </h1>
                    </div>

                    {/* 卡片容器 */}
                    <div className="card-zone flex-none w-full">
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
                                            padding: '8px',
                                            backgroundColor: '#ffffff', // 白色卡片背景
                                            borderRadius: '32px',
                                            boxShadow: '0 10px 30px -10px rgba(74, 64, 58, 0.1)',
                                            border: '1px solid rgb(218, 216, 212)' // 恢复边框
                                        }}
                                    >
                                        {/* 标题区域 - 移除背景色 */}
                                        <div 
                                            className="title-box flex items-center gap-2 mb-0 px-5 pt-5 pb-2"
                                        >
                                            <span
                                                className="material-symbols-rounded"
                                                style={{ fontSize: layout.iconSize, color: theme.icon }}
                                            >
                                                {card.icon}
                                            </span>
                                            <h3
                                                className={`font-bold leading-tight ${layout.titleSizeClass} card-title`}
                                                style={{ 
                                                    color: theme.icon,
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}
                                            >
                                                {card.title}
                                            </h3>
                                        </div>
                                        
                                        {/* 内容区域 - 直接在白色卡片上 */}
                                        <div 
                                            className="flex-1 w-full px-5 pb-5 pt-0"
                                            style={{ minHeight: '80px' }}
                                        >
                                            <p
                                                className={`font-medium leading-relaxed ${descSizeClass} js-desc`}
                                                style={{ color: '#141413' }}
                                                dangerouslySetInnerHTML={{ __html: autoAddSpaceToHtml(card.desc) }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* SSR 兼容脚本 */}
            <script dangerouslySetInnerHTML={{ __html: ssrScript }} />
        </div>
    );
};

export const claudeStyleTemplate: TemplateConfig = {
    id: 'claudeStyle',
    name: '暖调卡片反转',
    description: '白色卡片包裹彩色标题块的反转风格',
    icon: 'space_dashboard',
    downloadable: true,
    ssrReady: true,
    render: (data, scale) => <ClaudeStyle data={data} scale={scale} />,
    generateHtml: (data) => generateDownloadableHtml(data, 'claudeStyle'),
};

export { ClaudeStyle };
