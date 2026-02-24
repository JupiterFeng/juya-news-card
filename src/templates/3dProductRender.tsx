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
 * 3D 材质配色（内联定义）
 * 金属质感的渐变配色
 */
const MATERIALS: ThemeColor[] = [
    { bg: '#2a2a2a', onBg: '#ffffff', icon: '#00d4ff' },
    { bg: '#3d3d3d', onBg: '#ffffff', icon: '#ff6b35' },
    { bg: '#4a4a4a', onBg: '#ffffff', icon: '#00ff88' },
    { bg: '#505050', onBg: '#ffffff', icon: '#a855f7' },
    { bg: '#5a5a5a', onBg: '#ffffff', icon: '#ffdd00' },
];

/**
 * Render3D 渲染组件
 * 写实3D渲染风格 - 写实材质与灯光
 */
interface Render3DProps {
  data: GeneratedContent;
  scale: number;
}

const Render3D: React.FC<Render3DProps> = ({ data, scale }) => {
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

    return (
        <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', overflow: 'hidden' }}>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
            <style>{`
                @font-face {
                    font-family: 'CustomPreviewFont';
                    src: url('/assets/htmlFont.ttf') format('truetype');
                }
                .main-container {
                    font-family: 'Inter', 'CustomPreviewFont', system-ui, sans-serif;
                    background: radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a0f 100%);
                    color: #ffffff;
                }
                .render-title {
                    font-weight: 700;
                    background: linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    letter-spacing: -0.03em;
                    line-height: 1.1;
                    text-shadow: 0 4px 20px rgba(0,0,0,0.5);
                    white-space: nowrap;
                }
                .card-item {
                    border-radius: 16px;
                    position: relative;
                    overflow: hidden;
                    box-shadow:
                        0 20px 60px rgba(0,0,0,0.5),
                        0 0 0 1px rgba(255,255,255,0.05),
                        inset 0 1px 0 rgba(255,255,255,0.1);
                }
                /* 3D高光效果 */
                .card-item::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 50%;
                    background: linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%);
                    pointer-events: none;
                }
                /* 3D反射效果 */
                .card-item::after {
                    content: '';
                    position: absolute;
                    bottom: -50%;
                    left: 0;
                    right: 0;
                    height: 50%;
                    background: linear-gradient(0deg, rgba(0,0,0,0.3) 0%, transparent 100%);
                    pointer-events: none;
                }
                .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
                .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
                .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }

                .js-desc strong {
                    font-weight: 600;
                    color: #00d4ff;
                }
                .js-desc code {
                    background: rgba(0,0,0,0.3);
                    color: #00d4ff;
                    padding: 0.2em 0.5em;
                    border-radius: 4px;
                    font-family: 'Courier New', monospace;
                    font-size: 0.85em;
                    font-weight: 500;
                    border: 1px solid rgba(0, 212, 255, 0.2);
                }
                .content-scale { transform-origin: center center; }

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

                /* 3D灯光效果 */
                .light-source {
                    position: absolute;
                    width: 400px;
                    height: 400px;
                    border-radius: 50%;
                    filter: blur(100px);
                    opacity: 0.15;
                    pointer-events: none;
                }
                .light-1 {
                    top: -10%;
                    right: -5%;
                    background: #00d4ff;
                }
                .light-2 {
                    bottom: -10%;
                    left: -5%;
                    background: #ff6b35;
                }

                /* 网格地板 */
                .grid-floor {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 40%;
                    background:
                        linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 100%),
                        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px),
                        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px);
                    background-size: 100% 100%, 60px 60px, 60px 60px;
                    transform: perspective(500px) rotateX(60deg);
                    transform-origin: bottom center;
                    pointer-events: none;
                }

                /* 3D图标容器 */
                .icon-3d {
                    width: 72px;
                    height: 72px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
                    border-radius: 16px;
                    border: 1px solid rgba(255,255,255,0.1);
                    box-shadow:
                        0 8px 32px rgba(0,0,0,0.3),
                        inset 0 1px 0 rgba(255,255,255,0.1);
                    flex-shrink: 0;
                }

                /* 景深效果 */
                .depth-blur {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    top: 0;
                    left: 0;
                    backdrop-filter: blur(0px);
                    pointer-events: none;
                }

                /* 环境光反射 */
                .ambient-reflection {
                    position: absolute;
                    width: 150px;
                    height: 150px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(0, 212, 255, 0.1) 0%, transparent 70%);
                    pointer-events: none;
                }
            `}</style>

            {/* SSR 兼容脚本 */}
            <script dangerouslySetInnerHTML={{
                __html: `
                    ${generateTitleFitScript(titleConfig)}
                    ${generateViewportFitScript()}
                `
            }} />

            <div
                className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
            >
                {/* 3D灯光 */}
                <div className="light-source light-1"></div>
                <div className="light-source light-2"></div>

                {/* 网格地板 */}
                <div className="grid-floor"></div>

                {/* 环境反射 */}
                <div className="ambient-reflection" style={{ top: '20%', left: '10%' }}></div>
                <div className="ambient-reflection" style={{ top: '60%', right: '15%' }}></div>

                <div
                    ref={wrapperRef}
                    className="content-wrapper w-full flex flex-col items-center px-20 box-border content-scale relative z-10"
                    style={{
                        gap: layout.wrapperGap,
                        paddingLeft: layout.wrapperPaddingX || undefined,
                        paddingRight: layout.wrapperPaddingX || undefined
                    }}
                >
                    {/* 标题区域 */}
                    <div className="title-zone flex-none flex items-center justify-center w-full">
                        <h1
                            ref={titleRef}
                            className="text-center render-title"
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
                                const theme = getCardThemeColor(MATERIALS, idx);
                                // 3D 渐变背景
                                const bgGradient = idx === 0 ? 'linear-gradient(145deg, #2a2a2a, #1a1a1a)' :
                                    idx === 1 ? 'linear-gradient(145deg, #3d3d3d, #252525)' :
                                    idx === 2 ? 'linear-gradient(145deg, #4a4a4a, #2d2d2d)' :
                                    idx === 3 ? 'linear-gradient(145deg, #505050, #323232)' :
                                    'linear-gradient(145deg, #5a5a5a, #383838)';
                                const shine = idx === 0 ? 'rgba(0, 212, 255, 0.3)' :
                                    idx === 1 ? 'rgba(255, 107, 53, 0.3)' :
                                    idx === 2 ? 'rgba(0, 255, 136, 0.3)' :
                                    idx === 3 ? 'rgba(168, 85, 247, 0.3)' :
                                    'rgba(255, 221, 0, 0.3)';

                                return (
                                    <div
                                        key={idx}
                                        className={`card-item flex flex-col ${layout.cardWidthClass}`}
                                        style={{
                                            padding: layout.cardPadding,
                                            background: bgGradient,
                                            color: theme.onBg,
                                            border: '1px solid rgba(255, 255, 255, 0.1)'
                                        }}
                                    >
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="icon-3d">
                                                <span
                                                    className="material-symbols-rounded"
                                                    style={{
                                                        color: theme.icon,
                                                        fontSize: layout.iconSize,
                                                        filter: `drop-shadow(0 0 10px ${shine})`
                                                    }}
                                                >
                                                    {card.icon}
                                                </span>
                                            </div>
                                            <h3
                                                className={layout.titleSizeClass}
                                                style={{
                                                    color: theme.onBg,
                                                    textShadow: '0 2px 8px rgba(0,0,0,0.5)'
                                                }}
                                            >
                                                {card.title}
                                            </h3>
                                        </div>
                                        <p
                                            className={layout.descSizeClass}
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
        </div>
    );
};

import { generateDownloadableHtml } from '../utils/template';

export const render3DTemplate: TemplateConfig = {
    id: 'render3D',
    name: '写实3D',
    description: '写实材质与灯光；适合硬件、消费电子、汽车概念页',
    icon: 'view_in_ar',
    downloadable: true,
    ssrReady: true,
    render: (data, scale) => <Render3D data={data} scale={scale} />,
    generateHtml: (data) => generateDownloadableHtml(data, 'render3D'),
};

export { Render3D };
