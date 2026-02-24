import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import {
    ThemeColor,
    StandardLayoutConfig,
    getCardThemeColor,
    generateTitleFitScript,
    generateViewportFitScript,
    calculateStandardLayout,
    getStandardTitleConfig,
} from '../utils/layout-calculator';

/**
 * AppleEvent 主题颜色（内联定义）
 */
const THEME_COLORS: ThemeColor[] = [
    { bg: '#ffffff', onBg: '#1d1d1f', icon: '#0071e3' }, // Blue
    { bg: '#ffffff', onBg: '#1d1d1f', icon: '#862737' }, // Deep Red
    { bg: '#ffffff', onBg: '#1d1d1f', icon: '#c93300' }, // Orange
    { bg: '#ffffff', onBg: '#1d1d1f', icon: '#006621' }, // Green
    { bg: '#ffffff', onBg: '#1d1d1f', icon: '#52239a' }, // Purple
    { bg: '#ffffff', onBg: '#1d1d1f', icon: '#1d1d1f' }, // Dark Grey
];

/**
 * AppleEvent 自定义布局配置（与默认不同）
 */
const APPLE_EVENT_LAYOUT: Partial<StandardLayoutConfig> = {
    tiers: {
        tier1: {
            titleSizeClass: 'text-5xl', descSizeClass: 'text-3xl',
            iconSize: '96px', wrapperGap: '80px', containerGap: '24px', cardPadding: '40px'
        },
        tier1_5: {
            titleSizeClass: 'text-4xl', descSizeClass: 'text-2xl',
            iconSize: '80px', wrapperGap: '80px', containerGap: '24px', cardPadding: '40px'
        },
        tier2: {
            titleSizeClass: 'text-4xl', descSizeClass: 'text-2xl',
            iconSize: '80px', wrapperGap: '80px', containerGap: '24px', cardPadding: '40px'
        },
        tier2_5: {
            titleSizeClass: 'text-3xl', descSizeClass: 'text-xl',
            iconSize: '64px', wrapperGap: '80px', containerGap: '24px', cardPadding: '40px'
        },
        tier3: {
            titleSizeClass: 'text-3xl', descSizeClass: 'text-xl',
            iconSize: '64px', wrapperGap: '80px', containerGap: '24px', cardPadding: '40px'
        }
    }
};

/**
 * AppleEvent 渲染组件
 * 仿苹果发布会 Keynote 风格
 *
 * 使用纯函数预计算布局，确保 SSR 和浏览器渲染一致
 */
interface AppleEventProps {
    data: GeneratedContent;
    scale: number;
}

const AppleEvent: React.FC<AppleEventProps> = ({ data, scale }) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);

    const N = data.cards.length;

    // 纯函数预计算布局（SSR 友好） - 使用自定义配置
    const layout = calculateStandardLayout(N, APPLE_EVENT_LAYOUT);
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
      const maxH = 1040;
      const contentH = wrapper.scrollHeight;
      if (contentH > maxH) {
        const scaleVal = Math.max(0.6, maxH / contentH);
        wrapper.style.transform = `scale(${scaleVal})`;
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
            <style>{`
            @font-face {
                font-family: 'CustomPreviewFont';
                src: url('/assets/htmlFont.ttf') format('truetype');
            }
            .main-container {
                font-family: 'CustomPreviewFont', -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, sans-serif;
                background-color: #f5f5f7;
                color: #1d1d1f;
            }
            .apple-title {
                font-weight: 700;
                letter-spacing: -0.02em;
                background: linear-gradient(180deg, #1d1d1f 0%, #424245 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                line-height: 1.1;
                white-space: nowrap;
            }
            .card-item {
                background: #ffffff;
                border-radius: 36px;
                transition: transform 0.3s ease;
                box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
                border: 1px solid rgba(0, 0, 0, 0.02);
            }
            /* 卡片宽度类（使用 CSS 变量实现响应式，添加 -1px 安全余量） */
            .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
            .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
            .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }

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

            .js-desc strong { color: #1d1d1f; font-weight: 600; }
            .js-desc code {
                background: rgba(0,0,0,0.05); padding: 0.1em 0.3em; border-radius: 4px;
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                font-size: 0.9em; color: #d02120;
            }
            .content-scale { transform-origin: center center; }

            /* Background subtle glow */
            .bg-glow {
                position: absolute;
                top: -10%;
                left: 50%;
                transform: translateX(-50%);
                width: 80%;
                height: 40%;
                background: radial-gradient(circle at center, rgba(0, 113, 227, 0.03) 0%, transparent 70%);
                pointer-events: none;
            }
        `}</style>

            <div
                className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
            >
                <div className="bg-glow"></div>

                <div
                    ref={wrapperRef}
                    className="content-wrapper w-full flex flex-col items-center px-24 box-border content-scale z-10"
                    style={{
                        gap: layout.wrapperGap,
                        paddingLeft: layout.wrapperPaddingX || undefined,
                        paddingRight: layout.wrapperPaddingX || undefined
                    }}
                >
                    {/* 标题区域 */}
                    <div className="title-zone flex-none flex items-center justify-center">
                        <h1
                            ref={titleRef}
                            className="text-center apple-title main-title"
                            style={{ fontSize: `${titleConfig.initialFontSize}px` }}
                        >
                            {data.mainTitle}
                        </h1>
                    </div>

                    {/* 卡片区域 */}
                    <div className="card-zone flex-none w-full">
                        <div
                            className="card-container w-full flex flex-wrap justify-center content-center"
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
                                        style={{ padding: layout.cardPadding }}
                                    >
                                        <div className="card-header flex flex-col items-start gap-4 mb-6">
                                            <span
                                                className="js-icon material-icons"
                                                style={{ color: theme.icon, fontSize: layout.iconSize }}
                                            >
                                                {card.icon}
                                            </span>
                                            <h3 className={`js-title font-bold text-[#1d1d1f] tracking-tight leading-tight ${layout.titleSizeClass}`}>
                                                {card.title}
                                            </h3>
                                        </div>
                                        <p
                                            className={`js-desc text-[#424245] font-medium leading-relaxed ${layout.descSizeClass}`}
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

export const appleEventTemplate: TemplateConfig = {
    id: 'appleEvent',
    name: '极简发布会',
    description: '极致简约的科技发布会风格',
    icon: 'campaign',
    downloadable: true,
    ssrReady: true,
    render: (data, scale) => <AppleEvent data={data} scale={scale} />,
    generateHtml: (data) => generateDownloadableHtml(data, 'appleEvent'),
};

export { AppleEvent };
