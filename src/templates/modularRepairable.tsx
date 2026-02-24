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
 * ModularRepairable 渲染组件
 * 模块化与可维修设计：标准接口、可替换模块、可见的结构逻辑
 */
interface ModularRepairableProps {
  data: GeneratedContent;
  scale: number;
}

const ModularRepairable: React.FC<ModularRepairableProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const modularColors = [
    { bg: '#E8EEF2', onBg: '#1A2633', accent: '#2563EB', border: '#CBD5E1' },
    { bg: '#EEF2F6', onBg: '#1A2633', accent: '#0891B2', border: '#D1D5DB' },
    { bg: '#F0F4F8', onBg: '#263345', accent: '#7C3AED', border: '#D1D5DB' },
    { bg: '#E8EDF2', onBg: '#1A2633', accent: '#059669', border: '#CBD5E1' },
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
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;600&family=Inter:wght@400;500&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
        <style>{`
            @font-face {
                font-family: 'CustomPreviewFont';
                src: url('/assets/htmlFont.ttf') format('truetype');
            }
            .main-container {
                font-family: 'Inter', 'CustomPreviewFont', system-ui, sans-serif;
                background-color: '#F8FAFC';
                color: '#1A2633';
                background-image: linear-gradient(rgba(148, 163, 184, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.05) 1px, transparent 1px);
                background-size: 24px 24px;
            }
            .modular-title {
                font-weight: 600;
                color: '#1A2633';
                letter-spacing: 0.05em;
                line-height: 1.2;
                font-family: 'JetBrains Mono', 'SF Mono', monospace;
                text-transform: uppercase;
            }
            .card-item {
                transition: all 0.15s ease;
            }
            .card-item:hover {
                transform: translate(2px, 2px);
                box-shadow: 2px 2px 0 currentColor !important;
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
                        className="text-center modular-title"
                    >
                        {data.mainTitle}
                    </h1>
                </div>

                <div className="card-zone flex-none w-full">
                    <div
                        data-card-zone="true"
                        className="w-full flex flex-wrap justify-center content-center gap-4"
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
                            const color = modularColors[idx % modularColors.length];
                            return (
                                <div
                                    key={idx}
                                    data-card-item="true"
                                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                                    data-module-id={`mod-${idx}`}
                                    style={{
                                      backgroundColor: color.bg,
                                      borderRadius: '6px',
                                      border: `2px solid ${color.border}`,
                                      boxShadow: `4px 4px 0 ${color.border}`,
                                      transition: 'all 0.15s ease',
                                      padding: layout.cardPadding,
                                    }}
                                >
                                    <div className="card-header flex items-center gap-3 mb-3">
                                        <span
                                          className="js-icon material-symbols-rounded"
                                          style={{
                                            color: color.accent,
                                            fontSize: layout.iconSize,
                                            backgroundColor: 'rgba(255,255,255,0.8)',
                                            padding: '8px',
                                            borderRadius: '4px',
                                            border: `1px solid ${color.border}`,
                                          }}
                                        >
                                          {card.icon}
                                        </span>
                                        <h3
                                          className={`js-title font-semibold leading-tight ${layout.titleSizeClass}`}
                                          style={{
                                            color: color.onBg,
                                            fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                                            letterSpacing: '-0.01em',
                                            textTransform: 'uppercase',
                                          }}
                                        >
                                          {card.title}
                                        </h3>
                                    </div>
                                    <p
                                        className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
                                        style={{
                                          color: color.onBg,
                                          opacity: '0.8',
                                          fontFamily: "'Inter', system-ui, sans-serif",
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

export const modularRepairableTemplate: TemplateConfig = {
  id: 'modularRepairable',
  name: '模块化设计',
  description: '标准接口与可替换模块，可见的结构逻辑',
  icon: 'extension',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <ModularRepairable data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'modularRepairable'),
};

export { ModularRepairable };
