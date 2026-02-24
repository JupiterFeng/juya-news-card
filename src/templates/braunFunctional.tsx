import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import {
    calculateStandardLayout,
    getStandardTitleConfig,
    getCardThemeColor,
    generateTitleFitScript,
    generateViewportFitScript,
} from '../utils/layout-calculator';
import { generateDownloadableHtml } from '../utils/template';

/**
 * Braun 配色 - 极简灰白色调 + 橙色点缀
 */
const BRAUN_COLORS = [
    { bg: '#FAFAFA', onBg: '#1A1A1A', icon: '#FF6B00' }, // 经典 Braun 橙
    { bg: '#F5F5F5', onBg: '#0A0A0A', icon: '#E55A00' },
    { bg: '#EEEEEE', onBg: '#1A1A1A', icon: '#FF6B00' },
    { bg: '#FAFAFA', onBg: '#0A0A0A', icon: '#E55A00' },
];

/**
 * BraunFunctional 渲染组件
 * Braun/Rams 式功能主义：克制、可理解、少即是多
 */
interface BraunFunctionalProps {
    data: GeneratedContent;
    scale: number;
}

const BraunFunctional: React.FC<BraunFunctionalProps> = ({ data, scale }) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);

    const N = data.cards.length;
    const layout = calculateStandardLayout(N);
    const titleConfig = getStandardTitleConfig(N);

    useLayoutEffect(() => {
        if (typeof window === 'undefined') return;
        if (!wrapperRef.current || !titleRef.current) return;

        const wrapper = wrapperRef.current;
        const title = titleRef.current;

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
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
            <style>{`
            @font-face {
                font-family: 'CustomPreviewFont';
                src: url('/assets/htmlFont.ttf') format('truetype');
            }
            .main-container {
                font-family: 'Inter', 'Helvetica Neue', 'CustomPreviewFont', Arial, sans-serif;
                background-color: #FFFFFF;
                color: #1A1A1A;
            }
            .braun-title {
                font-weight: 500;
                color: #1A1A1A;
                letter-spacing: -0.02em;
                line-height: 1.1;
                white-space: nowrap;
            }
            .card-item {
                border: 1px solid rgba(0,0,0,0.08);
                transition: all 0.2s ease;
            }
            .card-item:hover {
                box-shadow: 0 4px 16px rgba(0,0,0,0.08);
                transform: translateY(-1px);
            }
            .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 0.5px); }
            .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 0.5px); }
            .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 0.5px); }
            .content-scale { transform-origin: center center; }

            /* 中间档位字体 */
            .text-5-5xl { font-size: 3.375rem; line-height: 1.1; }
            .text-4-5xl { font-size: 2.625rem; line-height: 1.2; }
            .text-3-5xl { font-size: 2.0625rem; line-height: 1.3; }
            .text-2-5xl { font-size: 1.8125rem; line-height: 1.4; }
        `}</style>

            <div
                className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
            >
                <div
                    ref={wrapperRef}
                    className="content-wrapper w-full flex flex-col items-center px-24 box-border content-scale z-10"
                    style={{
                        gap: layout.wrapperGap,
                        paddingLeft: layout.wrapperPaddingX,
                        paddingRight: layout.wrapperPaddingX
                    }}
                >
                    <div className="flex flex-col items-center">
                        <h1
                            ref={titleRef}
                            className="text-center braun-title"
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
                                const color = getCardThemeColor(BRAUN_COLORS, idx);
                                return (
                                    <div
                                        key={idx}
                                        className={`card-item flex flex-col ${layout.cardWidthClass}`}
                                        style={{
                                            padding: layout.cardPadding,
                                            backgroundColor: color.bg,
                                            borderRadius: '4px'
                                        }}
                                    >
                                        <div className="card-header flex items-center gap-4 mb-4">
                                            <span
                                                className="js-icon material-symbols-rounded"
                                                style={{ fontSize: layout.iconSize, color: color.icon }}
                                            >
                                                {card.icon}
                                            </span>
                                            <h3
                                                className={`js-title font-medium leading-tight ${layout.titleSizeClass}`}
                                                style={{ color: color.onBg, fontWeight: 500 }}
                                            >
                                                {card.title}
                                            </h3>
                                        </div>
                                        <p
                                            className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
                                            style={{ color: color.onBg, opacity: 0.7 }}
                                            dangerouslySetInnerHTML={{ __html: card.desc }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <script dangerouslySetInnerHTML={{
                __html: `
            ${generateTitleFitScript(titleConfig)}
            ${generateViewportFitScript()}
          `
            }} />
        </div>
    );
};

export const braunFunctionalTemplate: TemplateConfig = {
    id: 'braunFunctional',
    name: '功能主义工业设计',
    description: '克制设计语言：少即是多，功能优先',
    icon: 'settings',
    downloadable: true,
    ssrReady: true,
    render: (data, scale) => <BraunFunctional data={data} scale={scale} />,
    generateHtml: (data) => generateDownloadableHtml(data, 'braunFunctional'),
};

export { BraunFunctional };
