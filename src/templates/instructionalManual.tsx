import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import {
  calculateStandardLayout,
  getStandardTitleConfig,
  generateTitleFitScript,
  generateViewportFitScript,
} from '../utils/layout-calculator';
import { generateDownloadableHtml } from '../utils/template';
import { autoAddSpaceToHtml } from '../utils/text-spacing';

/**
 * InstructionalManual 渲染组件
 * 说明书式设计：最少文字让所有人都能懂的分步表达
 * 特点：步骤编号、线稿风格、最小化文字、对错对比、清晰动作分解
 */
interface InstructionalManualProps {
  data: GeneratedContent;
  scale: number;
}

const InstructionalManual: React.FC<InstructionalManualProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const manualColors = [
    { bg: '#FFFEF9', line: '#2C2C2C', accent: '#4A90A4', step: '1' },
    { bg: '#FFFEF9', line: '#2C2C2C', accent: '#7B9B3A', step: '2' },
    { bg: '#FFFEF9', line: '#2C2C2C', accent: '#D4A574', step: '3' },
    { bg: '#FFFEF9', line: '#2C2C2C', accent: '#E67E50', step: '4' },
    { bg: '#FFFEF9', line: '#2C2C2C', accent: '#6B5D52', step: '5' },
    { bg: '#FFFEF9', line: '#2C2C2C', accent: '#8B7355', step: '6' },
  ];

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
        const scaleVal = Math.max(0.6, maxH / contentH);
        wrapper.style.transform = `scale(${scaleVal})`;
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
                background-color: '#F5F3EF';
                background-image:
                    repeating-linear-gradient(0deg, transparent, transparent 47px, rgba(44,44,44,0.03) 47px, rgba(44,44,44,0.03) 48px),
                    repeating-linear-gradient(90deg, transparent, transparent 47px, rgba(44,44,44,0.03) 47px, rgba(44,44,44,0.03) 48px);
                color: '#2C2C2C';
                position: relative;
            }
            /* 装饰性工具提示 */
            .main-container::before {
                content: '⚠ INSTRUCTION MANUAL';
                position: absolute;
                top: 24px;
                right: 24px;
                font-size: 12px;
                font-weight: 600;
                letter-spacing: 0.1em;
                color: '#999';
                padding: 8px 16px;
                border: 2px solid rgba(44,44,44,0.1);
                border-radius: 8px;
            }
            /* 底部提示 */
            .main-container::after {
                content: 'Follow each step carefully · No tools required';
                position: absolute;
                bottom: 16px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 11px;
                font-weight: 500;
                letter-spacing: 0.05em;
                color: '#999';
            }
            .manual-title {
                font-weight: 600;
                color: '#2C2C2C';
                letter-spacing: 0.05em;
                line-height: 1.2;
                text-transform: uppercase;
                position: relative;
            }
            /* 工具图标装饰 */
            .manual-title::before,
            .manual-title::after {
                content: '🔧';
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                font-size: 24px;
                opacity: 0.5;
            }
            .manual-title::before { left: -40px; }
            .manual-title::after { right: -40px; content: '📋'; }
            .card-item {
                position: relative;
            }
            /* 步骤编号圆圈 */
            .card-item::before {
                content: attr(data-stepNum);
                position: absolute;
                top: -12px;
                left: -12px;
                width: 32px;
                height: 32px;
                background: attr(data-accentColor);
                color: #fff;
                font-family: 'Inter', sans-serif;
                font-size: 16px;
                font-weight: 700;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                border: 2px solid #fff;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            }
            /* 箭头指示 */
            .card-item::after {
                content: '→';
                position: absolute;
                bottom: -8px;
                right: 16px;
                font-size: 20px;
                color: attr(data-lineColor);
                opacity: 0.3;
            }
            .card-item:hover {
                transform: translateY(-4px);
                box-shadow: 6px 6px 0 attr(data-lineColor)60, 0 12px 32px rgba(0,0,0,0.12) !important;
            }
            .card-item:hover .js-icon {
                transform: scale(1.1) rotate(5deg);
            }
                    .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
                    .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
                    .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
            .content-scale { transform-origin: center center; }
        `}</style>

        <div className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
            <div
                ref={wrapperRef}
                className="content-wrapper w-full flex flex-col items-center px-24 box-border content-scale z-10"
                style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}
            >
                <div className="flex flex-col items-center">
                    <h1
                        ref={titleRef}
                        className="text-center manual-title"
                    >
                        {data.mainTitle}
                    </h1>
                </div>

                <div className="card-zone flex-none w-full">
                    <div
                        data-card-zone="true"
                        className="w-full flex flex-wrap justify-center content-center"
              style={{
                gap: layout.containerGap,
                '--container-gap': layout.containerGap,
                paddingLeft: cardZoneInsetX,
                paddingRight: cardZoneInsetX,
                maxWidth: cardZoneMaxWidth,
                margin: '0 auto',
                boxSizing: 'border-box'
              } as React.CSSProperties}
                    >
                        {data.cards.map((card, idx) => {
                            const color = manualColors[idx % manualColors.length];
                            return (
                                <div
                                    key={idx}
                                    data-card-item="true"
                                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                                    data-step-num={color.step}
                                    data-line-color={color.line}
                                    data-accent-color={color.accent}
                                    style={{
                                      backgroundColor: color.bg,
                                      borderRadius: '16px',
                                      border: `2px solid ${color.line}`,
                                      boxShadow: `4px 4px 0 ${color.line}40, 0 6px 16px rgba(0,0,0,0.08)`,
                                      transition: 'all 0.3s ease',
                                      padding: layout.cardPadding,
                                      alignItems: 'center',
                                      textAlign: 'center',
                                    }}
                                >
                                    <div className="card-header flex flex-col items-center gap-3 mb-4">
                                        <span
                                          className="js-icon material-symbols-rounded"
                                          style={{
                                            color: color.accent,
                                            fontSize: layout.iconSize,
                                            width: layout.iconSize,
                                            height: layout.iconSize,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: `2px solid ${color.line}`,
                                            borderRadius: '50%',
                                            backgroundColor: '#fff',
                                            marginBottom: '12px',
                                          }}
                                        >
                                          {card.icon}
                                        </span>
                                        <h3
                                          className={`js-title font-semibold leading-tight ${layout.titleSizeClass}`}
                                          style={{
                                            color: color.line,
                                            fontFamily: "'Inter', 'Roboto', sans-serif",
                                            letterSpacing: '0.02em',
                                            textAlign: 'center',
                                            maxWidth: '100%',
                                          }}
                                        >
                                          {card.title}
                                        </h3>
                                    </div>
                                    <p
                                        className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
                                        style={{
                                          color: '#4A4A4A',
                                          fontFamily: "'Inter', sans-serif",
                                          textAlign: 'center',
                                        }}
                                        dangerouslySetInnerHTML={{ __html: autoAddSpaceToHtml(card.desc) }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            ${generateTitleFitScript(titleConfig)}
            ${generateViewportFitScript()}
          `,
        }}
      />
    </div>
  );
};

export const instructionalManualTemplate: TemplateConfig = {
  id: 'instructionalManual',
  name: '说明书式设计',
  description: '最少文字分步表达，步骤编号与线稿风格',
  icon: 'menu_book',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <InstructionalManual data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'instructionalManual'),
};

export { InstructionalManual };
