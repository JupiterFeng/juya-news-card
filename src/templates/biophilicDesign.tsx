import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import { generateDownloadableHtml } from '../utils/template';
import {
    generateTitleFitScript,
    generateViewportFitScript,
    calculateStandardLayout,
    getStandardTitleConfig,
} from '../utils/layout-calculator';

/**
 * BiophilicDesign 渲染组件
 * 亲自然设计：自然光、材质与节律，营造呼吸般的舒适空间
 */
interface BiophilicDesignProps {
  data: GeneratedContent;
  scale: number;
}

const BIOPHILIC_COLORS = [
  { bg: '#E8F0E8', onBg: '#1A2E1A', accent: '#4A7C59' }, // 森林绿
  { bg: '#F0F4E8', onBg: '#2E331A', accent: '#7B9B3A' }, // 嫩芽绿
  { bg: '#E8F0EC', onBg: '#1A2E28', accent: '#5B9A8F' }, // 青苔绿
  { bg: '#F0ECE8', onBg: '#2E2A1A', accent: '#A8B570' }, // 亚麻绿
];

const BiophilicDesign: React.FC<BiophilicDesignProps> = ({ data, scale }) => {
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

  const getCardWidthClass = () => {
    if (N === 1) return 'w-2/3 mx-auto';
    if (N === 2) return 'card-width-2col';
    if (N === 3) return 'card-width-3col';
    if (N === 4) return 'card-width-2col';
    if (N <= 6) return 'card-width-3col';
    return 'card-width-4col';
  };

  return (
    <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', overflow: 'hidden' }}>
        <style>{`
            @font-face {
                font-family: 'CustomPreviewFont';
                src: url('/assets/htmlFont.ttf') format('truetype');
            }
            .main-container {
                font-family: 'Inter', 'Noto Sans SC', 'CustomPreviewFont', system-ui, sans-serif;
                background: linear-gradient(135deg, #F0F4E8 0%, #E8F0EC 50%, #E8F0E8 100%);
                color: #1A2E1A;
            }
            .biophilic-title {
                font-weight: 500;
                color: #1A2E1A;
                letter-spacing: 0.02em;
                line-height: 1.3;
                white-space: nowrap;
            }
            .card-item {
                border: none;
                transition: all 0.3s ease;
                border-radius: 16px;
                box-shadow: 0 4px 24px rgba(74, 124, 89, 0.12), 0 2px 8px rgba(74, 124, 89, 0.06);
                display: flex;
                flex-direction: column;
            }
            .card-item:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 32px rgba(74, 124, 89, 0.18), 0 4px 12px rgba(74, 124, 89, 0.1);
            }
            .card-width-2col { width: calc(50% - 18px); }
            .card-width-3col { width: calc(33.33% - 24px); }
            .card-width-4col { width: calc(25% - 27px); }

            .text-5-5xl { font-size: 3.375rem; line-height: 1.1; }
            .text-4-5xl { font-size: 2.625rem; line-height: 1.2; }
            .text-3-5xl { font-size: 2.0625rem; line-height: 1.3; }
            .text-2-5xl { font-size: 1.8125rem; line-height: 1.4; }
            
            .text-6xl { font-size: 3.75rem; line-height: 1; }
            .text-5xl { font-size: 3rem; line-height: 1; }
            .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
            .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
            .text-2xl { font-size: 1.5rem; line-height: 2rem; }
            .text-xl  { font-size: 1.25rem; line-height: 1.75rem; }
            .text-lg  { font-size: 1.125rem; line-height: 1.75rem; }
            .text-base { font-size: 1rem; line-height: 1.5rem; }
            .text-sm { font-size: 0.875rem; line-height: 1.25rem; }

            .content-scale { transform-origin: center center; }
        `}</style>

        <div
            className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
        >
            <div
                ref={wrapperRef}
                className="content-wrapper w-full flex flex-col items-center px-24 box-border content-scale z-10"
                style={{ gap: layout.wrapperGap }}
            >
                {/* 标题区域 */}
                <div className="flex flex-col items-center">
                    <h1
                        ref={titleRef}
                        className="text-center biophilic-title"
                        style={{ fontSize: titleConfig.initialFontSize }}
                    >
                        {data.mainTitle}
                    </h1>
                </div>

                {/* 卡片区域 */}
                <div className="card-zone flex-none w-full">
                    <div
                        className="w-full flex flex-wrap justify-center content-center"
                        style={{ gap: layout.containerGap }}
                    >
                        {data.cards.map((card, idx) => {
                            const color = BIOPHILIC_COLORS[idx % BIOPHILIC_COLORS.length];
                            return (
                                <div 
                                    key={idx} 
                                    className={`card-item ${getCardWidthClass()}`}
                                    style={{
                                        backgroundColor: color.bg,
                                        padding: layout.cardPadding
                                    }}
                                >
                                    <div className="card-header flex items-center gap-4 mb-4">
                                        <span 
                                            className="material-symbols-rounded"
                                            style={{
                                                color: color.accent,
                                                fontSize: layout.iconSize
                                            }}
                                        >
                                            {card.icon}
                                        </span>
                                        <h3 
                                            className={`font-medium leading-tight ${layout.titleSizeClass}`}
                                            style={{
                                                color: color.onBg,
                                                fontFamily: "'Noto Sans SC', 'Inter', system-ui, sans-serif",
                                                letterSpacing: '0.01em'
                                            }}
                                        >
                                            {card.title}
                                        </h3>
                                    </div>
                                    <p
                                        className={`font-normal leading-relaxed ${layout.descSizeClass}`}
                                        style={{
                                            color: color.onBg,
                                            opacity: 0.85,
                                            fontFamily: "'Noto Sans SC', 'Inter', system-ui, sans-serif"
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

        <script dangerouslySetInnerHTML={{
            __html: `
                ${generateTitleFitScript(titleConfig)}
                ${generateViewportFitScript()}
            `
        }} />
    </div>
  );
};

export const biophilicDesignTemplate: TemplateConfig = {
  id: 'biophilicDesign',
  name: '亲自然设计',
  description: '自然光、材质与节律，营造呼吸般的舒适空间',
  icon: 'nature',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <BiophilicDesign data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'biophilicDesign'),
};

export { BiophilicDesign };
