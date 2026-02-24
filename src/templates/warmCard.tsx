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
 * WarmCard 主题颜色
 */
const THEME_COLORS: ThemeColor[] = [
    { bg: '#f0eee6', onBg: '#4a403a', icon: '#c96442' }, // 基础暖色
    { bg: '#f0eee6', onBg: '#4a403a', icon: '#e09f3e' }, // 暖黄点缀
    { bg: '#f0eee6', onBg: '#4a403a', icon: '#335c67' }, // 对比蓝绿
    { bg: '#f0eee6', onBg: '#4a403a', icon: '#9e2a2b' }  // 深红点缀
];

/**
 * WarmCard 渲染组件
 * 暖色调卡片风格
 */
interface WarmCardProps {
    data: GeneratedContent;
    scale: number;
}

const WarmCard: React.FC<WarmCardProps> = ({ data, scale }) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);

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

    // 生成 SSR 用的调整脚本
    const ssrScript = `
      ${generateTitleFitScript(titleConfig)}
      ${generateViewportFitScript()}
    `;

    return (
        <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', overflow: 'hidden' }}>
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet" />
            <style>{`
            @font-face {
                font-family: 'CustomPreviewFont';
                src: url('/assets/htmlFont.ttf') format('truetype');
            }
            .main-container {
                font-family: 'Nunito', 'CustomPreviewFont', system-ui, -apple-system, sans-serif;
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

            .js-desc strong { color: #c96442; font-weight: 700; }
            .js-desc code {
                background: rgba(201, 100, 66, 0.1);
                padding: 0.1em 0.3em;
                border-radius: 6px;
                font-family: 'SF Mono', 'Roboto Mono', monospace;
                font-size: 0.9em;
                color: #c96442;
            }
            .content-scale { transform-origin: center center; }

            .card-inner-box {
                background-color: #ffffff;
                border-radius: 28px;
                box-shadow: inset 0 2px 6px rgba(0,0,0,0.02);
                border: 1px solid rgb(218, 216, 212);
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
                                        backgroundColor: theme.bg,
                                        borderRadius: '32px',
                                        boxShadow: '0 10px 30px -10px rgba(74, 64, 58, 0.1)'
                                    }}
                                >
                                    <div className="card-header flex items-center gap-2 mt-1 mb-2 px-2">
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
                                    
                                    {/* 内容区域 - 白色盒子 */}
                                    <div 
                                        className="card-inner-box flex-1 w-full p-5"
                                        style={{ minHeight: '100px' }}
                                    >
                                        <p
                                            className={`font-medium leading-relaxed ${layout.descSizeClass}`}
                                            style={{ color: '#6d635f' }}
                                            dangerouslySetInnerHTML={{ __html: card.desc }}
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

export const warmCardTemplate: TemplateConfig = {
    id: 'warmCard',
    name: '温暖卡片',
    description: '柔和暖色调、圆角卡片与内部内容块设计',
    icon: 'dashboard',
    downloadable: true,
    ssrReady: true,
    render: (data, scale) => <WarmCard data={data} scale={scale} />,
    generateHtml: (data) => generateDownloadableHtml(data, 'warmCard'),
};

export { WarmCard };
