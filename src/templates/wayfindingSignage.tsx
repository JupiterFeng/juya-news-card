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
 * WayfindingSignage 渲染组件
 * 导视设计系统：人在空间中的决策路径设计
 * 特点：方向箭头、编号系统、颜色分区、高对比度、决策点导向
 */
interface WayfindingSignageProps {
  data: GeneratedContent;
  scale: number;
}

const WayfindingSignage: React.FC<WayfindingSignageProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const wayfindingColors = [
    { bg: '#FFFFFF', primary: '#2E7D32', arrow: '#4CAF50', zone: 'A' },
    { bg: '#FFFFFF', primary: '#1565C0', arrow: '#2196F3', zone: 'B' },
    { bg: '#FFFFFF', primary: '#D84315', arrow: '#FF5722', zone: 'C' },
    { bg: '#FFFFFF', primary: '#6A1B9A', arrow: '#9C27B0', zone: 'D' },
    { bg: '#FFFFFF', primary: '#00695C', arrow: '#009688', zone: 'E' },
    { bg: '#FFFFFF', primary: '#C62828', arrow: '#F44336', zone: 'F' },
  ];
  const arrowSymbols = ['↑', '→', '↓', '←', '↗', '↘'];

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
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Inter:wght@400;500;600;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
        <style>{`
            @font-face {
                font-family: 'CustomPreviewFont';
                src: url('/assets/htmlFont.ttf') format('truetype');
            }
            .main-container {
                font-family: 'Roboto', 'Inter', 'CustomPreviewFont', sans-serif;
                background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
                color: '#212121';
                position: relative;
            }
            /* 背景网格模拟地面/地图 */
            .main-container::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-image:
                    linear-gradient(rgba(0,0,0,0.03) 2px, transparent 2px),
                    linear-gradient(90deg, rgba(0,0,0,0.03) 2px, transparent 2px);
                background-size: 60px 60px;
                pointer-events: none;
            }
            /* 顶部导视条 */
            .main-container::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 12px;
                background: repeating-linear-gradient(
                    90deg,
                    #2E7D32 0px, #2E7D32 200px,
                    #1565C0 200px, #1565C0 400px,
                    #D84315 400px, #D84315 600px,
                    #6A1B9A 600px, #6A1B9A 800px,
                    #00695C 800px, #00695C 1000px,
                    #C62828 1000px, #C62828 1200px
                );
            }
            .wayfinding-title {
                font-weight: 700;
                color: '#212121';
                letter-spacing: 0.08em;
                line-height: 1.2;
                text-transform: uppercase;
                position: relative;
                padding: 0 40px;
            }
            /* 标题两侧装饰线 */
            .wayfinding-title::before,
            .wayfinding-title::after {
                content: '';
                position: absolute;
                top: 50%;
                width: 100px;
                height: 4px;
                background: linear-gradient(90deg, transparent, #212121);
            }
            .wayfinding-title::before {
                right: 100%;
                background: linear-gradient(90deg, #212121, transparent);
            }
            .card-item {
                position: relative;
                padding: 24px;
            }
            /* 区域编号角标 */
            .card-item::before {
                content: attr(data-zone);
                position: absolute;
                top: -4px;
                left: -4px;
                width: 48px;
                height: 48px;
                background: attr(data-primaryColor);
                color: #fff;
                font-family: 'Roboto', sans-serif;
                font-size: 24px;
                font-weight: 700;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 8px 0 8px 0;
            }
            /* 方向箭头装饰 */
            .card-item::after {
                content: attr(data-arrow);
                position: absolute;
                bottom: 16px;
                right: 16px;
                font-size: 48px;
                font-weight: 300;
                opacity: 0.15;
                font-family: sans-serif;
            }
            .card-item:hover {
                transform: translateY(-6px);
                box-shadow: 0 12px 32px rgba(0,0,0,0.2), inset 0 0 0 2px currentColor !important;
            }
            .card-item:hover::after {
                opacity: 0.4;
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
                        className="text-center wayfinding-title"
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
                            const color = wayfindingColors[idx % wayfindingColors.length];
                            const arrow = arrowSymbols[idx % arrowSymbols.length];
                            return (
                                <div
                                    key={idx}
                                    data-card-item="true"
                                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                                    data-zone={color.zone}
                                    data-arrow={arrow}
                                    data-primary-color={color.primary}
                                    style={{
                                      backgroundColor: color.bg,
                                      borderRadius: '8px',
                                      border: `4px solid ${color.primary}`,
                                      boxShadow: `0 4px 16px rgba(0,0,0,0.15), inset 0 0 0 2px ${color.arrow}`,
                                      transition: 'all 0.3s ease',
                                      overflow: 'hidden',
                                      padding: layout.cardPadding,
                                    }}
                                >
                                    <div className="card-header flex items-center gap-4 mb-4">
                                        <span
                                          className="js-icon material-symbols-rounded"
                                          style={{
                                            color: color.arrow,
                                            fontSize: layout.iconSize,
                                            width: layout.iconSize,
                                            height: layout.iconSize,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '50%',
                                            backgroundColor: `${color.arrow}20`,
                                          }}
                                        >
                                          {card.icon}
                                        </span>
                                        <h3
                                          className={`js-title font-bold leading-tight ${layout.titleSizeClass}`}
                                          style={{
                                            color: color.primary,
                                            fontFamily: "'Roboto', 'Inter', sans-serif",
                                            letterSpacing: '0.02em',
                                            textAlign: 'left',
                                          }}
                                        >
                                          {card.title}
                                        </h3>
                                    </div>
                                    <p
                                        className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
                                        style={{
                                          color: '#424242',
                                          fontFamily: "'Roboto', sans-serif",
                                          textAlign: 'left',
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

export const wayfindingSignageTemplate: TemplateConfig = {
  id: 'wayfindingSignage',
  name: '导视设计系统',
  description: '决策路径导向，分区颜色与方向指示',
  icon: 'signpost',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <WayfindingSignage data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'wayfindingSignage'),
};

export { WayfindingSignage };
