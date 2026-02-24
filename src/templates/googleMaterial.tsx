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
 * GoogleMaterial 主题颜色（内联定义）
 */
const THEME_COLORS: ThemeColor[] = [
    { bg: '#d3e3fd', onBg: '#041e49', icon: '#0b57d0' }, // Blue
    { bg: '#f9dada', onBg: '#3f0e0e', icon: '#b9382b' }, // Red
    { bg: '#fef7e0', onBg: '#322900', icon: '#7d6400' }, // Yellow
    { bg: '#c4eed0', onBg: '#072711', icon: '#146c2e' }, // Green
];

/**
 * GoogleMaterial 渲染组件
 * 仿 Google Material Design 3 风格
 * 
 * 使用纯函数预计算布局，确保 SSR 和浏览器渲染一致
 */
interface GoogleMaterialProps {
    data: GeneratedContent;
    scale: number;
}

const GoogleMaterial: React.FC<GoogleMaterialProps> = ({ data, scale }) => {
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
            <link href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
            <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'Google Sans', 'CustomPreviewFont', system-ui, sans-serif;
          background-color: #f8f9fa;
          color: #1f1f1f;
        }
        .google-title {
          font-weight: 500;
          color: #1f1f1f;
          letter-spacing: -0.01em;
          line-height: 1.2;
          white-space: nowrap;
        }
        .card-item {
          border-radius: 28px;
          border: none;
          transition: transform 0.2s cubic-bezier(0, 0, 0.2, 1);
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-2col-wide { width: calc((100% - var(--container-gap) * 3) / 2 - 1px); } /* 2张/4张卡片用，增加左右边距 */
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }

        /* 精细化字体阶梯 */
        .text-5-5xl { font-size: 3.375rem; line-height: 1.1; } /* 54px */
        .text-4-5xl { font-size: 2.625rem; line-height: 1.2; } /* 42px */
        .text-3-5xl { font-size: 2.0625rem; line-height: 1.3; } /* 33px */
        .text-2-5xl { font-size: 1.8125rem; line-height: 1.4; } /* 29px (Aligned with Tier 2 size) */
        
        .js-desc strong { color: #1f1f1f; font-weight: 700; }
        .js-desc code {
          background: rgba(0,0,0,0.08); padding: 0.1em 0.3em; border-radius: 8px;
          font-family: 'Roboto Mono', monospace;
          font-size: 0.9em; color: #1f1f1f;
        }
        .content-scale { transform-origin: center center; }
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
                    {/* 顶部标识 */}
                    <div className="flex flex-col items-center">
                        <h1
                            ref={titleRef}
                            className="text-center google-title main-title"
                            style={{ fontSize: `${titleConfig.initialFontSize}px` }}
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
                                const theme = getCardThemeColor(THEME_COLORS, idx);
                                return (
                                    <div
                                        key={idx}
                                        className={`card-item flex flex-col ${N !== 1 ? layout.cardWidthClass : 'w-2/3'}`}
                                        style={{
                                            backgroundColor: theme.bg,
                                            padding: layout.cardPadding,
                                        }}
                                    >
                                        <div className="card-header flex items-center gap-4 mb-4">
                                            <span
                                                className="js-icon material-symbols-rounded"
                                                style={{ color: theme.icon, fontSize: layout.iconSize }}
                                            >
                                                {card.icon}
                                            </span>
                                            <h3
                                                className={`js-title font-bold leading-tight ${layout.titleSizeClass}`}
                                                style={{ color: theme.onBg }}
                                            >
                                                {card.title}
                                            </h3>
                                        </div>
                                        <p
                                            className={`js-desc font-medium leading-relaxed ${layout.descSizeClass}`}
                                            style={{ color: theme.onBg, opacity: 0.9 }}
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
        </div>
    );
};

import { generateDownloadableHtml } from '../utils/template';

export const googleMaterialTemplate: TemplateConfig = {
    id: 'googleMaterial',
    name: '灵动材质',
    description: '多彩活泼的现代材质设计风格',
    icon: 'explore',
    downloadable: true,
    ssrReady: true,
    render: (data, scale) => <GoogleMaterial data={data} scale={scale} />,
    generateHtml: (data) => generateDownloadableHtml(data, 'googleMaterial'),
};

export { GoogleMaterial };
