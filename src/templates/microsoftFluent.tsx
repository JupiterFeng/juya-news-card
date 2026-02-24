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
 * MicrosoftFluent 主题颜色（内联定义）
 */
const THEME_COLORS: ThemeColor[] = [
    { bg: '', onBg: '#0078d4', icon: '' }, // Communication Blue
    { bg: '', onBg: '#107c10', icon: '' }, // Excel Green
    { bg: '', onBg: '#d83b01', icon: '' }, // Office Orange
    { bg: '', onBg: '#4b53bc', icon: '' }, // Teams Purple
    { bg: '', onBg: '#008272', icon: '' }, // Teal
    { bg: '', onBg: '#c239b3', icon: '' }  // Magenta
];

/**
 * MicrosoftFluent 渲染组件
 * 仿 Microsoft Fluent Design 风格
 */
interface MicrosoftFluentProps {
    data: GeneratedContent;
    scale: number;
}

const MicrosoftFluent: React.FC<MicrosoftFluentProps> = ({ data, scale }) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);

    const N = data.cards.length;

    // 纯函数预计算布局（SSR 友好） - 使用默认配置
    const layout = calculateStandardLayout(N);
    const titleConfig = getStandardTitleConfig(N);


    // 仅用于浏览器环境的动态调整（标题溢出检测、视口适配）
    useLayoutEffect(() => {
        if (typeof window === 'undefined') return; // SSR 环境跳过
        if (!wrapperRef.current || !titleRef.current) return;

        const wrapper = wrapperRef.current;
        const title = titleRef.current;

        // 调整标题字号以防止溢出
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

        // 适配视口（内容溢出时缩放）
        const fitViewport = () => {
            // 使用计算比例代替不准确的 while 循环判断 scrollHeight
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
            <link href="https://fonts.googleapis.com/css2?family=Segoe+UI:wght@400;600;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
            <style>{`
            @font-face {
                font-family: 'CustomPreviewFont';
                src: url('/assets/htmlFont.ttf') format('truetype');
            }
            .main-container {
                font-family: 'Segoe UI', 'CustomPreviewFont', system-ui, -apple-system, sans-serif;
                background: linear-gradient(135deg, #f3f3f3 0%, #ffffff 100%);
                color: #242424;
            }
            .fluent-title {
                font-weight: 700;
                color: #242424;
                letter-spacing: -0.01em;
                line-height: 1.1;
                white-space: nowrap;
            }
            .card-item {
                background: rgba(255, 255, 255, 0.8);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border-radius: 8px;
                border: 1px solid rgba(0, 0, 0, 0.06);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04), 0 0 2px rgba(0, 0, 0, 0.06);
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                overflow: hidden;
            }
            .card-item::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 4px;
                height: 0;
                background: #0078d4;
                transition: height 0.3s ease;
            }
            .card-item:hover::before {
                height: 100%;
            }
            /* 使用 Flex 布局配合 calc(-1px) 安全余量，确保不换行且支持居中 */
            .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
            .card-width-2col-wide { width: calc((100% - var(--container-gap) * 3) / 2 - 1px); } /* 2张/4张卡片用，增加左右边距 */
            .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
            .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
            
            .js-desc strong { color: #0078d4; font-weight: 600; }

            /* 精细化字体阶梯 */
            .text-5-5xl { font-size: 3.375rem; line-height: 1.1; } /* 54px */
            .text-4-5xl { font-size: 2.625rem; line-height: 1.2; } /* 42px */
            .text-3-5xl { font-size: 2.0625rem; line-height: 1.3; } /* 33px */
            .text-2-5xl { font-size: 1.8125rem; line-height: 1.4; } /* 29px */
            
            .js-desc strong { color: #0078d4; font-weight: 600; }
            .js-desc code {
                background: rgba(0,0,0,0.05); padding: 0.1em 0.3em; border-radius: 4px;
                font-family: 'Cascadia Code', 'Consolas', monospace;
                font-size: 0.9em; color: #0078d4;
            }
            .content-scale { transform-origin: center center; }
            
            /* Reveal effect simulation */
            .card-item:hover {
                background: rgba(255, 255, 255, 0.9);
                box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08), 0 0 2px rgba(0, 0, 0, 0.06);
                transform: translateY(-2px);
            }
        `}</style>

            <div
                className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
            >
                {/* Background decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
                    <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-indigo-50 rounded-full blur-[100px]"></div>
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
                    {/* 顶部标识 */}
                    <div className="flex flex-col items-center">
                        <h1
                            ref={titleRef}
                            className="text-center fluent-title main-title"
                            style={{ fontSize: `${titleConfig.initialFontSize}px` }}
                        >
                            {data.mainTitle}
                        </h1>
                        <div className="w-24 h-1.5 bg-[#0078d4] mt-6 rounded-full opacity-80"></div>
                    </div>

                    {/* 卡片区域 - Flex Layout (支持居中) */}
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
                                                className="js-icon material-symbols-rounded"
                                                style={{ color: theme.onBg, fontSize: layout.iconSize }}
                                            >
                                                {card.icon}
                                            </span>
                                            <h3
                                                className={`js-title font-semibold leading-tight ${layout.titleSizeClass}`}
                                                style={{ color: '#242424' }}
                                            >
                                                {card.title}
                                            </h3>
                                        </div>
                                        <p
                                            className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
                                            style={{ color: '#424242' }}
                                            dangerouslySetInnerHTML={{ __html: card.desc }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
            {/* 注入 SSR 适配脚本 */}
            <script dangerouslySetInnerHTML={{ __html: ssrScript }} />
        </div >
    );
};

import { generateDownloadableHtml } from '../utils/template';

export const microsoftFluentTemplate: TemplateConfig = {
    id: 'microsoftFluent',
    name: '清透流体界面',
    description: '清新现代的流体层次界面风格',
    icon: 'web_asset',
    downloadable: true,
    ssrReady: true,
    render: (data, scale) => <MicrosoftFluent data={data} scale={scale} />,
    generateHtml: (data) => generateDownloadableHtml(data, 'microsoftFluent'),
};

export { MicrosoftFluent };
