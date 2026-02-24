import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import { generateDownloadableHtml } from '../utils/template';
import {
    getCardThemeColor,
    generateTitleFitScript,
    generateViewportFitScript,
    calculateStandardLayout,
    getStandardTitleConfig,
} from '../utils/layout-calculator';

/**
 * BehavioralNudge 渲染组件
 * 行为设计/助推：选择架构帮助用户做更好的决定
 * 特点：默认项突出、渐进式提示、即时反馈、减少认知负担
 */
interface BehavioralNudgeProps {
  data: GeneratedContent;
  scale: number;
}

const NUDGE_COLORS = [
    { bg: '#E8F5E9', primary: '#2E7D32', accent: '#4CAF50', isDefault: true, label: '推荐' },
    { bg: '#E3F2FD', primary: '#1565C0', accent: '#2196F3', isDefault: false, label: '可选' },
    { bg: '#FFF3E0', primary: '#E65100', accent: '#FF9800', isDefault: false, label: '高级' },
    { bg: '#F3E5F5', primary: '#6A1B9A', accent: '#9C27B0', isDefault: false, label: '灵活' },
    { bg: '#FFEBEE', primary: '#C62828', accent: '#F44336', isDefault: false, label: '谨慎' },
    { bg: '#E0F7FA', primary: '#006064', accent: '#00BCD4', isDefault: false, label: '快速' },
];

const BehavioralNudge: React.FC<BehavioralNudgeProps> = ({ data, scale }) => {
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
        <style>{`
            @font-face {
                font-family: 'CustomPreviewFont';
                src: url('/assets/htmlFont.ttf') format('truetype');
            }
            .main-container {
                font-family: 'Inter', 'Roboto', 'CustomPreviewFont', sans-serif;
                background: linear-gradient(135deg, #FAFAFA 0%, #F0F0F0 100%);
                color: #212121;
                position: relative;
            }
            .main-container::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-image: radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent 1px);
                background-size: 24px 24px;
                pointer-events: none;
            }
            .main-container::after {
                content: '💡 Smart Defaults · Better Choices';
                position: absolute;
                top: 20px;
                right: 24px;
                font-size: 11px;
                font-weight: 500;
                letter-spacing: 0.05em;
                color: #757575;
                background: #fff;
                padding: 6px 12px;
                border-radius: 20px;
                border: 1px solid rgba(0,0,0,0.08);
            }
            .nudge-title {
                font-weight: 700;
                color: #212121;
                letter-spacing: -0.01em;
                line-height: 1.2;
                position: relative;
                white-space: nowrap;
            }
            .nudge-title::before {
                content: '👍';
                position: absolute;
                left: -40px;
                top: 50%;
                transform: translateY(-50%);
                font-size: 28px;
            }
            .nudge-title::after {
                content: '→';
                position: absolute;
                right: -32px;
                top: 50%;
                transform: translateY(-50%);
                font-size: 24px;
                color: #4CAF50;
            }
            .card-item {
                position: relative;
                transition: all 0.3s ease;
            }
            .card-badge {
                position: absolute;
                font-family: 'Inter', sans-serif;
                padding: 4px 10px;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                font-size: 11px;
                font-weight: 600;
                color: #fff;
                top: -10px;
                right: 16px;
                z-index: 10;
            }
            .card-badge-secondary {
                position: absolute;
                top: 12px;
                right: 12px;
                font-family: 'Inter', sans-serif;
                font-size: 10px;
                font-weight: 500;
                color: #757575;
                background: rgba(255,255,255,0.9);
                padding: 3px 8px;
                border-radius: 8px;
                z-index: 10;
            }
            .card-item:hover {
                transform: translateY(-6px);
            }
            
            .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
            .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
            .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }

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
                <div className="flex flex-col items-center">
                    <h1
                        ref={titleRef}
                        className="text-center nudge-title"
                        style={{ fontSize: titleConfig.initialFontSize }}
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
                            const color = NUDGE_COLORS[idx % NUDGE_COLORS.length];
                            return (
                                <div 
                                    key={idx} 
                                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                                    style={{
                                        backgroundColor: color.bg,
                                        borderRadius: '16px',
                                        border: color.isDefault ? `3px solid ${color.primary}` : '2px solid rgba(0,0,0,0.1)',
                                        boxShadow: color.isDefault
                                            ? `0 8px 24px ${color.primary}40, 0 0 0 4px ${color.primary}20`
                                            : `0 4px 12px rgba(0,0,0,0.08)`,
                                        padding: layout.cardPadding,
                                        position: 'relative'
                                    }}
                                >
                                    {color.isDefault ? (
                                        <div className="card-badge" style={{ backgroundColor: color.primary }}>
                                            ⭐ {color.label}
                                        </div>
                                    ) : (
                                        <div className="card-badge-secondary">
                                            {color.label}
                                        </div>
                                    )}
                                    <div className="card-header flex items-center gap-4 mb-4">
                                        <span 
                                            className="material-symbols-rounded"
                                            style={{
                                                color: '#FFFFFF',
                                                fontSize: layout.iconSize,
                                                width: layout.iconSize,
                                                height: layout.iconSize,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: '14px',
                                                backgroundColor: color.accent,
                                                boxShadow: color.isDefault ? `0 4px 12px ${color.primary}40` : '0 2px 8px rgba(0,0,0,0.1)'
                                            }}
                                        >
                                            {card.icon}
                                        </span>
                                        <h3 
                                            className={`font-semibold leading-tight ${layout.titleSizeClass}`}
                                            style={{ 
                                                color: color.primary,
                                                fontFamily: "'Inter', 'Roboto', sans-serif",
                                                letterSpacing: '0.01em'
                                            }}
                                        >
                                            {card.title}
                                        </h3>
                                    </div>
                                    <p
                                        className={`font-normal leading-relaxed ${layout.descSizeClass}`}
                                        style={{
                                            color: '#424242',
                                            fontFamily: "'Inter', sans-serif"
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

export const behavioralNudgeTemplate: TemplateConfig = {
  id: 'behavioralNudge',
  name: '行为设计助推',
  description: '选择架构，默认项突出与渐进式提示',
  icon: 'psychology',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <BehavioralNudge data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'behavioralNudge'),
};

export { BehavioralNudge };
