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
 * 环境式界面主题颜色（内联定义）
 * 场景化、微妙、温度
 */
const AMBIENT_COLORS: ThemeColor[] = [
    { bg: '#F8F6F3', onBg: '#5C544A', icon: '#9A8A7A' },
    { bg: '#F0F4F6', onBg: '#4A545C', icon: '#7A8A9A' },
    { bg: '#F6F3F0', onBg: '#544A4A', icon: '#8A7A7A' },
    { bg: '#F3F6F4', onBg: '#4A544A', icon: '#7A8A7A' },
    { bg: '#FAF8F4', onBg: '#6B5C4A', icon: '#9A8A6A' },
    { bg: '#F4F6FA', onBg: '#4A4C5C', icon: '#7A7A9A' },
];

/**
 * AmbientUI 渲染组件
 * 环境式界面：融入生活场景，灯光、声音、屏幕边缘状态
 * 特点：低注意力可读、场景化设计、环境提示、微妙变化
 */
interface AmbientUIProps {
  data: GeneratedContent;
  scale: number;
}

const AmbientUI: React.FC<AmbientUIProps> = ({ data, scale }) => {
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

    // 获取场景信息
    const getSceneInfo = (idx: number) => {
        const scenes = [
            { scene: 'morning', temp: 'warm' },
            { scene: 'afternoon', temp: 'cool' },
            { scene: 'evening', temp: 'neutral' },
            { scene: 'night', temp: 'calm' },
            { scene: 'home', temp: 'cozy' },
            { scene: 'work', temp: 'focus' },
        ];
        return scenes[idx % scenes.length];
    };

    // 获取光晕颜色
    const getGlowColor = (idx: number) => {
        const glows = [
            'rgba(154,138,122,0.15)',
            'rgba(122,138,154,0.15)',
            'rgba(138,122,122,0.15)',
            'rgba(122,138,122,0.15)',
            'rgba(154,138,106,0.15)',
            'rgba(122,122,154,0.15)',
        ];
        return glows[idx % glows.length];
    };

    return (
        <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', overflow: 'hidden' }}>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Roboto:wght@400;500;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
            <style>{`
                @font-face {
                    font-family: 'CustomPreviewFont';
                    src: url('/assets/htmlFont.ttf') format('truetype');
                }
                .main-container {
                    font-family: 'Inter', 'Roboto', 'CustomPreviewFont', sans-serif;
                    background: linear-gradient(180deg, #FAFAFA 0%, #F5F5F0 50%, #FAFAFA 100%);
                    color: '#5C544A';
                    position: relative;
                }
                /* 环境光晕 */
                @keyframes ambientShift {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.5; }
                }
                .main-container::before {
                    content: '';
                    position: absolute;
                    top: 20%;
                    left: 10%;
                    width: 300px;
                    height: 300px;
                    background: radial-gradient(circle, rgba(154,138,122,0.15) 0%, transparent 70%);
                    animation: ambientShift 8s ease-in-out infinite;
                    pointer-events: none;
                }
                .main-container::after {
                    content: '';
                    position: absolute;
                    bottom: 20%;
                    right: 10%;
                    width: 250px;
                    height: 250px;
                    background: radial-gradient(circle, rgba(122,138,154,0.12) 0%, transparent 70%);
                    animation: ambientShift 10s ease-in-out infinite 2s;
                    pointer-events: none;
                }
                .ambient-title {
                    font-weight: '500';
                    color: '#5C544A';
                    letter-spacing: '0.03em';
                    line-height: 1.3;
                    position: relative;
                    white-space: nowrap;
                }
                /* 温度装饰 */
                .ambient-title::before {
                    content: '☀';
                    position: absolute;
                    left: -36px;
                    top: 50%;
                    transform: translateY(-50%);
                    font-size: 20px;
                    opacity: 0.6;
                }
                .ambient-title::after {
                    content: '🌙';
                    position: absolute;
                    right: -36px;
                    top: 50%;
                    transform: translateY(-50%);
                    font-size: 18px;
                    opacity: 0.4;
                }
                .card-item {
                    position: relative;
                    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                }
                /* 场景标签 - 极微妙 */
                .card-item::before {
                    content: attr(data-scene);
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    font-family: 'Inter', sans-serif;
                    font-size: 8px;
                    font-weight: 400;
                    color: attr(data-accent);
                    opacity: 0.4;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }
                /* 状态指示 */
                .card-item::after {
                    content: '';
                    position: absolute;
                    bottom: 10px;
                    right: 10px;
                    width: 4px;
                    height: 4px;
                    background: attr(data-accent);
                    border-radius: 50%;
                    opacity: 0.3;
                }
                .card-item:hover {
                    transform: translateY(-2px);
                    border-color: attr(data-accent)30 !important;
                }
                .card-item:hover::after {
                    opacity: 0.6;
                    width: 6px;
                    height: 6px;
                }
                .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
                .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
                .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
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
                .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
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
                <div
                    ref={wrapperRef}
                    className="content-wrapper w-full flex flex-col items-center px-24 box-border content-scale z-10"
                    style={{
                        gap: layout.wrapperGap,
                        paddingLeft: layout.wrapperPaddingX || undefined,
                        paddingRight: layout.wrapperPaddingX || undefined
                    }}
                >
                    <div className="flex flex-col items-center">
                        <h1
                            ref={titleRef}
                            className="text-center ambient-title"
                        >
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
                                const theme = getCardThemeColor(AMBIENT_COLORS, idx);
                                const sceneInfo = getSceneInfo(idx);
                                const glow = getGlowColor(idx);
                                return (
                                    <div
                                        key={idx}
                                        className={`card-item flex flex-col ${layout.cardWidthClass}`}
                                        data-scene={sceneInfo.scene}
                                        data-temp={sceneInfo.temp}
                                        data-accent={theme.icon}
                                        style={{
                                            padding: layout.cardPadding,
                                            backgroundColor: theme.bg,
                                            borderRadius: '24px',
                                            border: '1px solid rgba(0,0,0,0.03)',
                                            boxShadow: `0 2px 8px ${glow}, 0 0 0 1px rgba(0,0,0,0.01)`
                                        }}
                                    >
                                        <div className="card-header flex items-center gap-3 mb-3">
                                            <span
                                                className="material-symbols-rounded"
                                                style={{
                                                    color: theme.icon,
                                                    fontSize: layout.iconSize,
                                                    width: layout.iconSize,
                                                    height: layout.iconSize,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderRadius: '16px',
                                                    backgroundColor: `${theme.icon}12`,
                                                    border: '1px solid ' + theme.icon + '20'
                                                }}
                                            >
                                                {card.icon}
                                            </span>
                                            <h3
                                                className={layout.titleSizeClass}
                                                style={{
                                                    color: theme.onBg,
                                                    fontFamily: '"Inter", "Roboto", sans-serif',
                                                    letterSpacing: '0.01em',
                                                    fontWeight: '500'
                                                }}
                                            >
                                                {card.title}
                                            </h3>
                                        </div>
                                        <p
                                            className={layout.descSizeClass}
                                            style={{
                                                color: '#6B6B6B',
                                                fontFamily: "\"Inter\", sans-serif",
                                                opacity: 0.7
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

export const ambientUiTemplate: TemplateConfig = {
    id: 'ambientUi',
    name: '环境式界面',
    description: '低注意力可读，场景化与环境提示',
    icon: 'wb_twilight',
    downloadable: true,
    ssrReady: true,
    render: (data, scale) => <AmbientUI data={data} scale={scale} />,
    generateHtml: (data) => generateDownloadableHtml(data, 'ambientUi'),
};

export { AmbientUI };
