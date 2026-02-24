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
 * Aqua/Web2.0 配色（内联定义）
 * 高光泽感
 */
const AQUA_COLORS: ThemeColor[] = [
    { bg: '#007AFF', onBg: '#ffffff', icon: '#4DA3FF' },
    { bg: '#34C759', onBg: '#ffffff', icon: '#5DD681' },
    { bg: '#FF3B30', onBg: '#ffffff', icon: '#FF6961' },
    { bg: '#FF9500', onBg: '#ffffff', icon: '#FFB340' },
    { bg: '#5856D6', onBg: '#ffffff', icon: '#7B79EB' },
    { bg: '#FF2D55', onBg: '#ffffff', icon: '#FF5C7C' },
    { bg: '#00C7BE', onBg: '#ffffff', icon: '#38D9D1' },
    { bg: '#FFCC00', onBg: '#ffffff', icon: '#FFDD40' },
];

/**
 * AquaGlossy 渲染组件
 * Aqua水晶高光/Web2.0光泽风格：玻璃高光、反光、圆角、胶囊标签
 */
interface AquaGlossyProps {
  data: GeneratedContent;
  scale: number;
}

const AquaGlossy: React.FC<AquaGlossyProps> = ({ data, scale }) => {
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

    // 获取次级颜色（用于渐变底部）
    const getSecondaryColor = (idx: number) => {
        const colors = ['#0051D5', '#248A3D', '#D70015', '#C73600', '#3634A3', '#D41A53', '#008A84', '#C79C00'];
        return colors[idx % colors.length];
    };

    // 获取高光颜色（用于渐变顶部）
    const getHighlightColor = (idx: number) => {
        const colors = ['#4DA3FF', '#5DD681', '#FF6961', '#FFB340', '#7B79EB', '#FF5C7C', '#38D9D1', '#FFDD40'];
        return colors[idx % colors.length];
    };

    return (
        <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', overflow: 'hidden' }}>
            <style>{`
                @font-face {
                    font-family: 'CustomPreviewFont';
                    src: url('/assets/htmlFont.ttf') format('truetype');
                }
                .aqua-container {
                    font-family: 'CustomPreviewFont', 'SF Pro Display', 'Helvetica Neue', 'Arial', sans-serif;
                }
                .aqua-title {
                    font-weight: 700;
                    letter-spacing: -0.02em;
                    background: linear-gradient(180deg, #FFF 0%, #E0E0E0 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    text-shadow: none;
                    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
                    white-space: nowrap;
                }
                .aqua-card {
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    overflow: hidden;
                    border: 1px solid rgba(255,255,255,0.3);
                }
                /* 玻璃高光效果 */
                .aqua-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 50%;
                    background: linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.2) 50%, transparent 100%);
                    border-radius: 20px 20px 0 0;
                    pointer-events: none;
                }
                .aqua-card::after {
                    content: '';
                    position: absolute;
                    top: 8px;
                    left: 8px;
                    right: 8px;
                    height: 40%;
                    background: linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%);
                    border-radius: 16px 16px 50% 50%;
                    pointer-events: none;
                }
                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                    position: relative;
                    z-index: 1;
                }
                .js-desc {
                    line-height: 1.5;
                    font-weight: 500;
                    position: relative;
                    z-index: 1;
                }
                .js-desc code {
                    background: rgba(0,0,0,0.2);
                    color: #FFF;
                    padding: 0.2em 0.5em;
                    border-radius: 8px;
                    font-family: monospace;
                    font-size: 0.9em;
                    font-weight: 600;
                    border: 1px solid rgba(255,255,255,0.2);
                }
                .js-desc strong {
                    font-weight: 700;
                    color: #FFF;
                }
                /* Aqua 背景 */
                .aqua-bg {
                    background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
                    position: relative;
                }
                .aqua-bg::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background:
                        radial-gradient(ellipse at 30% 20%, rgba(0, 122, 255, 0.15) 0%, transparent 50%),
                        radial-gradient(ellipse at 70% 80%, rgba(52, 199, 89, 0.12) 0%, transparent 50%),
                        radial-gradient(ellipse at 50% 50%, rgba(255, 59, 48, 0.08) 0%, transparent 40%);
                    pointer-events: none;
                }
                /* 胶囊标签样式 */
                .capsule-label {
                    display: inline-block;
                    background: linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%);
                    border: 1px solid rgba(255,255,255,0.4);
                    border-radius: 20px;
                    padding: 8px 20px;
                    box-shadow: 0 4px 0 rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.4);
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
                className="aqua-container aqua-bg relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
            >
                <div
                    ref={wrapperRef}
                    className="content-wrapper relative z-10 w-full flex flex-col items-center px-16 box-border content-scale"
                    style={{
                        gap: layout.wrapperGap,
                        paddingLeft: layout.wrapperPaddingX || undefined,
                        paddingRight: layout.wrapperPaddingX || undefined
                    }}
                >
                    {/* 标题区域 */}
                    <div className="title-zone flex-none flex items-center justify-center">
                        <div className="capsule-label">
                            <h1 ref={titleRef} className="aqua-title text-center">
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
                                const theme = getCardThemeColor(AQUA_COLORS, idx);
                                const secondary = getSecondaryColor(idx);
                                const highlight = getHighlightColor(idx);
                                return (
                                    <div
                                        key={idx}
                                        className={`card-item aqua-card flex flex-col ${layout.cardWidthClass}`}
                                        style={{
                                            padding: layout.cardPadding,
                                            background: `linear-gradient(180deg, ${highlight} 0%, ${theme.bg} 50%, ${secondary} 100%)`,
                                            borderRadius: '20px',
                                            boxShadow: `0 8px 0 ${secondary}40, 0 16px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.4)`,
                                            minWidth: N <= 6 ? '370px' : '310px'
                                        }}
                                    >
                                        <div className="card-header">
                                            <h3 className={layout.titleSizeClass} style={{ color: '#FFF', textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.3)' }}>
                                                {card.title}
                                            </h3>
                                            <span
                                                className="material-symbols-rounded"
                                                style={{
                                                    color: 'rgba(255,255,255,0.95)',
                                                    fontSize: layout.iconSize,
                                                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))'
                                                }}
                                            >
                                                {card.icon}
                                            </span>
                                        </div>
                                        <p
                                            className={`js-desc ${layout.descSizeClass}`}
                                            style={{
                                                color: 'rgba(255,255,255,0.92)',
                                                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
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

/**
 * AquaGlossy 模板配置
 */
export const aquaGlossyTemplate: TemplateConfig = {
    id: 'aquaGlossy',
    name: '水晶高光风格',
    description: '玻璃高光、反光、圆角的Web2.0质感',
    icon: 'auto_awesome',
    downloadable: true,
    ssrReady: true,
    render: (data, scale) => <AquaGlossy data={data} scale={scale} />,
    generateHtml: (data) => generateDownloadableHtml(data, 'aquaGlossy'),
};

// 导出组件供下载模板使用
export { AquaGlossy };
