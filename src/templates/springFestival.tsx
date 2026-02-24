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
 * SpringFestivalStyle 主题颜色
 * 春节红金配色
 */
const THEME_COLORS: ThemeColor[] = [
    { bg: '#fffdf5', onBg: '#591c1c', icon: '#c41e3a' }, // 正红
    { bg: '#fffdf5', onBg: '#591c1c', icon: '#dfa218' }, // 金色
    { bg: '#fffdf5', onBg: '#591c1c', icon: '#bf360c' }, // 深橘
    { bg: '#fffdf5', onBg: '#591c1c', icon: '#880e4f' }  // 紫红
];

/**
 * SpringFestivalStyle 渲染组件
 * 基于 ClaudeStyle 的春节风格 - 加入灯笼和中国结元素
 */
interface SpringFestivalStyleProps {
    data: GeneratedContent;
    scale: number;
}

const SpringFestivalStyle: React.FC<SpringFestivalStyleProps> = ({ data, scale }) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const CARD_TITLE_MIN_FONT_SIZE = 24;

    const N = data.cards.length;
    
    // 纯函数预计算布局（SSR 友好）
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
            <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap" rel="stylesheet" />
            <style>{`
            @font-face {
                font-family: 'CustomPreviewFont';
                src: url('/assets/htmlFont.ttf') format('truetype');
            }
            .main-container {
                font-family: 'Noto Serif SC', system-ui, -apple-system, sans-serif;
                background-color: #fffbf0;
                color: #591c1c;
                background-image: radial-gradient(#ffe0b2 1px, transparent 1px);
                background-size: 40px 40px;
            }
            .warm-title {
                font-weight: 700;
                color: #c41e3a;
                line-height: 1.2;
                white-space: nowrap;
                text-shadow: 2px 2px 0px rgba(196, 30, 58, 0.1);
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

            .js-desc strong { font-weight: 700; }
            .js-desc code {
                background-color: rgba(255, 235, 238, 0.6) !important;
                color: #b71c1c !important;
                border: 0.5px solid #ffcdd2 !important;
                border-radius: 8px !important;
                padding: 0.1em 0.3em;
                font-family: system-ui, -apple-system, sans-serif;
                font-size: 0.9em;
            }
            .content-scale { transform-origin: center center; }

            .title-box {
                /* 标题区域样式 */
            }

            .decoration-lantern {
                position: absolute;
                top: 40px;
                left: 60px;
                opacity: 0.9;
                animation: swing 3s ease-in-out infinite alternate;
                transform-origin: top center;
            }

            .decoration-knot {
                position: absolute;
                top: 40px;
                right: 60px;
                opacity: 0.9;
            }

            @keyframes swing {
                0% { transform: rotate(-2deg); }
                100% { transform: rotate(2deg); }
            }
        `}</style>

            <div className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
                {/* 装饰元素：灯笼 (左上) */}
                <div className="decoration-lantern">
                    <svg width="80" height="120" viewBox="0 0 80 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <line x1="40" y1="0" x2="40" y2="20" stroke="#c41e3a" strokeWidth="2"/>
                        <rect x="15" y="20" width="50" height="60" rx="25" fill="#c41e3a" />
                        <path d="M15 35C15 35 25 40 40 40C55 40 65 35 65 35" stroke="#ffeb3b" strokeWidth="1.5" fill="none" opacity="0.6"/>
                        <path d="M15 65C15 65 25 70 40 70C55 70 65 65 65 65" stroke="#ffeb3b" strokeWidth="1.5" fill="none" opacity="0.6"/>
                        <rect x="30" y="80" width="20" height="6" fill="#b71c1c"/>
                        <rect x="30" y="16" width="20" height="4" fill="#b71c1c"/>
                        <path d="M40 86V110" stroke="#c41e3a" strokeWidth="2"/>
                        <path d="M35 86V105" stroke="#c41e3a" strokeWidth="1.5"/>
                        <path d="M45 86V105" stroke="#c41e3a" strokeWidth="1.5"/>
                    </svg>
                </div>

                {/* 装饰元素：中国结 (右上) */}
                <div className="decoration-knot">
                    <svg width="80" height="120" viewBox="0 0 80 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <line x1="40" y1="0" x2="40" y2="20" stroke="#c41e3a" strokeWidth="2"/>
                        <path d="M40 20 L60 40 L40 60 L20 40 Z" fill="none" stroke="#c41e3a" strokeWidth="4" />
                        <path d="M40 30 L50 40 L40 50 L30 40 Z" fill="#c41e3a" />
                        <path d="M40 60V100" stroke="#c41e3a" strokeWidth="2"/>
                        <path d="M30 60V90" stroke="#c41e3a" strokeWidth="1.5"/>
                        <path d="M50 60V90" stroke="#c41e3a" strokeWidth="1.5"/>
                        <circle cx="40" cy="40" r="2" fill="#ffeb3b"/>
                    </svg>
                </div>

                <div
                    ref={wrapperRef}
                    className="content-wrapper w-full flex flex-col items-center px-24 box-border content-scale z-10"
                    style={{
                        gap: layout.wrapperGap,
                        paddingLeft: layout.wrapperPaddingX || undefined,
                        paddingRight: layout.wrapperPaddingX || undefined
                    }}
                >
                    {/* 顶部标题 */}
                    <div className="flex flex-col items-center mb-8">
                        <h1
                            ref={titleRef}
                            className="text-center warm-title main-title"
                            style={{ fontSize: `${titleConfig.initialFontSize}px` }}
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
                                        padding: '8px',
                                        backgroundColor: '#ffffff', // 白色卡片背景
                                        borderRadius: '24px',
                                        boxShadow: '0 8px 24px -8px rgba(183, 28, 28, 0.15)',
                                        border: '2px solid rgba(229, 115, 115, 0.3)' // 红色系边框
                                    }}
                                >
                                    {/* 标题区域 */}
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
                                    
                                    {/* 内容区域 */}
                                    <div 
                                        className="flex-1 w-full px-5 pb-5 pt-0"
                                        style={{ minHeight: '80px' }}
                                    >
                                        <p
                                            className={`font-medium leading-relaxed ${layout.descSizeClass} js-desc`}
                                            style={{ color: '#421a1a' }}
                                            dangerouslySetInnerHTML={{ __html: autoAddSpaceToHtml(card.desc) }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* SSR 兼容脚本 */}
            <script dangerouslySetInnerHTML={{ __html: ssrScript }} />
        </div>
    );
};

export const springFestivalStyleTemplate: TemplateConfig = {
    id: 'springFestivalStyle',
    name: '春节 (Spring Festival)',
    description: '红金配色的春节风格，点缀抽象灯笼与中国结',
    icon: 'festival',
    downloadable: true,
    ssrReady: true,
    render: (data, scale) => <SpringFestivalStyle data={data} scale={scale} />,
    generateHtml: (data) => generateDownloadableHtml(data, 'springFestivalStyle'),
};

export { SpringFestivalStyle };
