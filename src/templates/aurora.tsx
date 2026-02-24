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
 * Aurora 极光风格主题颜色（内联定义）
 */
const AURORA_COLORS: ThemeColor[] = [
    { bg: 'rgba(99, 102, 241, 0.3)', onBg: '#ffffff', icon: '#818cf8' },
    { bg: 'rgba(236, 72, 153, 0.3)', onBg: '#ffffff', icon: '#f472b6' },
    { bg: 'rgba(34, 211, 238, 0.3)', onBg: '#ffffff', icon: '#38bdf8' },
    { bg: 'rgba(16, 185, 129, 0.3)', onBg: '#ffffff', icon: '#34d399' },
    { bg: 'rgba(251, 146, 60, 0.3)', onBg: '#ffffff', icon: '#fb923c' },
    { bg: 'rgba(139, 92, 246, 0.3)', onBg: '#ffffff', icon: '#a78bfa' },
];

const Aurora: React.FC<{ data: GeneratedContent; scale: number }> = ({ data, scale }) => {
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

    // 获取渐变背景
    const getGradientBg = (idx: number) => {
        const gradients = [
            'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(168, 85, 247, 0.3) 100%)',
            'linear-gradient(135deg, rgba(236, 72, 153, 0.3) 0%, rgba(239, 68, 68, 0.3) 100%)',
            'linear-gradient(135deg, rgba(34, 211, 238, 0.3) 0%, rgba(59, 130, 246, 0.3) 100%)',
            'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(5, 150, 105, 0.3) 100%)',
            'linear-gradient(135deg, rgba(251, 146, 60, 0.3) 0%, rgba(251, 191, 36, 0.3) 100%)',
            'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(236, 72, 153, 0.3) 100%)',
        ];
        return gradients[idx % gradients.length];
    };

    return (
        <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', overflow: 'hidden' }}>
            <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
            <style>{`
                @font-face {
                    font-family: 'CustomPreviewFont';
                    src: url('/assets/htmlFont.ttf') format('truetype');
                }
                .main-container {
                    font-family: 'Outfit', sans-serif;
                    background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
                    color: #ffffff;
                }
                .aurora-title {
                    font-weight: 700;
                    background: linear-gradient(90deg, #818cf8, #c084fc, #f472b6, #38bdf8);
                    background-size: 300% 100%;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    letter-spacing: -0.02em;
                    line-height: 1.1;
                    animation: shimmer 8s linear infinite;
                    white-space: nowrap;
                }
                @keyframes shimmer {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 300% 50%; }
                }
                .card-item {
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                    transition: transform 0.3s, box-shadow 0.3s;
                }
                .card-item:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 40px rgba(0,0,0,0.2);
                }
                .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
                .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
                .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
                .js-desc strong { color: #ffffff; font-weight: 600; }
                .js-desc code {
                    background: rgba(255,255,255,0.2);
                    padding: 0.1em 0.3em; border-radius: 6px;
                    font-family: monospace;
                    font-size: 0.9em; color: #ffffff;
                }
                .content-scale { transform-origin: center center; }
                .material-symbols-rounded { font-family: 'Material Symbols Rounded' !important; font-weight: normal; font-style: normal; display: inline-block; }

                .aurora-blob {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(80px);
                    opacity: 0.5;
                    animation: float 20s ease-in-out infinite;
                }
                @keyframes float {
                    0%, 100% { transform: translate(0, 0); }
                    25% { transform: translate(50px, -50px); }
                    50% { transform: translate(-30px, 30px); }
                    75% { transform: translate(-50px, -30px); }
                }

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
                className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
            >
                <div className="aurora-blob w-96 h-96" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', top: '-10%', left: '-5%', animationDelay: '0s' }}></div>
                <div className="aurora-blob w-80 h-80" style={{ background: 'linear-gradient(135deg, #f093fb, #f5576c)', bottom: '-10%', right: '-5%', animationDelay: '-5s' }}></div>
                <div className="aurora-blob w-64 h-64" style={{ background: 'linear-gradient(135deg, #4facfe, #00f2fe)', top: '40%', right: '10%', animationDelay: '-10s' }}></div>

                <div
                    ref={wrapperRef}
                    className="content-wrapper w-full flex flex-col items-center px-24 box-border content-scale relative z-10"
                    style={{
                        gap: layout.wrapperGap,
                        paddingLeft: layout.wrapperPaddingX || undefined,
                        paddingRight: layout.wrapperPaddingX || undefined
                    }}
                >
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#818cf8]"></div>
                            <div className="w-2 h-2 rounded-full bg-[#a78bfa]"></div>
                            <div className="w-2 h-2 rounded-full bg-[#f472b6]"></div>
                        </div>
                        <h1 ref={titleRef} className="text-center aurora-title">
                            {data.mainTitle}
                        </h1>
                    </div>

                    <div className="card-zone flex-none w-full">
                        <div
                            className="w-full flex flex-wrap justify-center content-center"
                            style={{
                                gap: layout.containerGap,
                                '--container-gap': layout.containerGap
                            } as React.CSSProperties}
                        >
                            {data.cards.map((card, idx) => {
                                const theme = getCardThemeColor(AURORA_COLORS, idx);
                                return (
                                    <div
                                        key={idx}
                                        className={`card-item flex flex-col ${layout.cardWidthClass}`}
                                        style={{
                                            padding: layout.cardPadding,
                                            background: getGradientBg(idx),
                                            borderRadius: '24px',
                                            border: '1px solid rgba(255,255,255,0.2)'
                                        }}
                                    >
                                        <div className="card-header flex items-center gap-4 mb-6">
                                            <span
                                                className="material-symbols-rounded"
                                                style={{ color: theme.icon, fontSize: layout.iconSize }}
                                            >
                                                {card.icon}
                                            </span>
                                            <h3 className={layout.titleSizeClass} style={{ color: theme.onBg }}>
                                                {card.title}
                                            </h3>
                                        </div>
                                        <p
                                            className={layout.descSizeClass}
                                            style={{ color: 'rgba(255,255,255,0.9)' }}
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

export const auroraTemplate: TemplateConfig = {
    id: 'aurora',
    name: '极光风',
    description: '大面积渐变光晕氛围风格',
    icon: 'glow',
    downloadable: true,
    ssrReady: true,
    render: (data, scale) => <Aurora data={data} scale={scale} />,
    generateHtml: (data) => generateDownloadableHtml(data, 'aurora'),
};

export { Aurora };
