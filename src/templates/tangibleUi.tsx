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
 * TangibleUI 渲染组件
 * 可触式交互：把交互从屏幕搬到实体
 * 特点：物理控件隐喻、旋钮/滑块、触感分级、清晰边界
 */
interface TangibleUIProps {
  data: GeneratedContent;
  scale: number;
}

const TangibleUI: React.FC<TangibleUIProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const tangibleColors = [
    { bg: '#E8E4DF', primary: '#2A2520', control: '#C99B6E', texture: 'wood' },
    { bg: '#E4E8EB', primary: '#1A2028', control: '#4A5B6C', texture: 'metal' },
    { bg: '#EBE8E4', primary: '#282420', control: '#6B5343', texture: 'bronze' },
    { bg: '#E8EBE8', primary: '#1A2820', control: '#4A6B4A', texture: 'copper' },
    { bg: '#EAE6E4', primary: '#282018', control: '#8B5C3A', texture: 'leather' },
    { bg: '#E6E8EB', primary: '#182028', control: '#5A6B7C', texture: 'steel' },
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
                background: linear-gradient(180deg, #E0DCD6 0%, #D8D4CE 50%, #E0DCD6 100%);
                color: '#2A2520';
                position: relative;
            }
            /* 螺丝装饰 */
            .main-container::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-image:
                    radial-gradient(circle at 20% 30%, rgba(0,0,0,0.02) 1px, transparent 1px),
                    radial-gradient(circle at 80% 70%, rgba(0,0,0,0.02) 1px, transparent 1px);
                background-size: 40px 40px;
                pointer-events: none;
            }
            /* 物理装饰线 */
            .main-container::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 8px;
                background: linear-gradient(90deg,
                    #C99B6E 0%, #4A5B6C 20%, #6B5343 40%,
                    #4A6B4A 60%, #8B5C3A 80%, #5A6B7C 100%
                );
            }
            .tangible-title {
                font-weight: 700;
                color: '#2A2520';
                letter-spacing: '0.05em';
                line-height: 1.2;
                text-transform: uppercase;
                position: relative;
                text-shadow: 0 2px 0 rgba(255,255,255,0.5);
            }
            /* 旋钮装饰 */
            .tangible-title::before,
            .tangible-title::after {
                content: '';
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                width: 24px;
                height: 24px;
                background: radial-gradient(circle, #D4A574 30%, #C99B6E 100%);
                border-radius: 50%;
                box-shadow: inset 0 -2px 4px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2);
            }
            .tangible-title::before { left: -40px; }
            .tangible-title::after { right: -40px; }
            .card-item {
                position: relative;
            }
            /* 材质标签 */
            .card-item::before {
                content: attr(data-texture);
                position: absolute;
                top: -10px;
                right: 16px;
                font-family: 'Inter', sans-serif;
                font-size: 9px;
                font-weight: 600;
                color: '#2A2520';
                background: 'rgba(255,255,255,0.9)';
                padding: 3px 8px;
                border-radius: 4px;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            /* 控制指示器 */
            .card-item::after {
                content: '';
                position: absolute;
                bottom: 12px;
                right: 12px;
                width: 8px;
                height: 8px;
                background: attr(data-control-color);
                border-radius: 50%;
                box-shadow: inset 0 -1px 2px rgba(0,0,0,0.3);
            }
            .card-item:hover {
                transform: translateY(-2px);
                box-shadow: inset 0 2px 4px rgba(0,0,0,0.1), inset 0 -2px 4px rgba(255,255,255,0.5), 0 6px 12px rgba(0,0,0,0.2), 0 12px 24px rgba(0,0,0,0.15) !important;
            }
            .card-item:hover .js-icon {
                box-shadow: inset 0 -2px 4px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.4), 0 3px 6px rgba(0,0,0,0.25);
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
                        className="text-center tangible-title"
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
                            const color = tangibleColors[idx % tangibleColors.length];
                            return (
                                <div
                                    key={idx}
                                    data-card-item="true"
                                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                                    data-control-color={color.control}
                                    data-texture={color.texture}
                                    style={{
                                      backgroundColor: color.bg,
                                      borderRadius: '4px',
                                      border: `2px solid ${color.primary}`,
                                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 -2px 4px rgba(255,255,255,0.5), 0 4px 8px rgba(0,0,0,0.15), 0 8px 16px rgba(0,0,0,0.1)',
                                      transition: 'all 0.2s ease',
                                      padding: layout.cardPadding,
                                    }}
                                >
                                    <div className="card-header flex items-center gap-4 mb-4">
                                        <span
                                          className="js-icon material-symbols-rounded"
                                          style={{
                                            color: '#FFFFFF',
                                            fontSize: layout.iconSize,
                                            width: layout.iconSize,
                                            height: layout.iconSize,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '50%',
                                            backgroundColor: color.control,
                                            boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.2)',
                                          }}
                                        >
                                          {card.icon}
                                        </span>
                                        <h3
                                          className={`js-title font-semibold leading-tight ${layout.titleSizeClass}`}
                                          style={{
                                            color: color.primary,
                                            fontFamily: '"Inter", "Roboto", sans-serif',
                                            letterSpacing: '0.02em',
                                            textShadow: '0 1px 0 rgba(255,255,255,0.5)',
                                          }}
                                        >
                                          {card.title}
                                        </h3>
                                    </div>
                                    <p
                                        className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
                                        style={{
                                          color: color.primary,
                                          fontFamily: '"Inter", sans-serif',
                                          opacity: '0.85',
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

export const tangibleUiTemplate: TemplateConfig = {
  id: 'tangibleUi',
  name: '可触式交互',
  description: '物理控件隐喻，旋钮滑块与触感分级',
  icon: 'dialpad',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <TangibleUI data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'tangibleUi'),
};

export { TangibleUI };
