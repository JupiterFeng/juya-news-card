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
 * TransitMapAbstract 渲染组件
 * 交通图抽象法：拓扑结构优先于地理真实
 * 特点：45/90度角、统一线宽、节点清晰、换乘标记、线路色
 */
interface TransitMapAbstractProps {
  data: GeneratedContent;
  scale: number;
}

const TransitMapAbstract: React.FC<TransitMapAbstractProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const transitLines = [
    { color: '#E32017', name: 'Central' },
    { color: '#0019A8', name: 'Victoria' },
    { color: '#FFD329', name: 'Circle' },
    { color: '#007D32', name: 'District' },
    { color: '#9B0058', name: 'Metropolitan' },
    { color: '#F386A1', name: 'Hammersmith' },
    { color: '#A1A5A7', name: 'Jubilee' },
    { color: '#6950A1', name: 'Elizabeth' },
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
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Gill+Sans:wght@400;500;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
        <style>{`
            @font-face {
                font-family: 'CustomPreviewFont';
                src: url('/assets/htmlFont.ttf') format('truetype');
            }
            .main-container {
                font-family: 'Roboto', 'CustomPreviewFont', sans-serif;
                background-color: '#F5F5F0';
                color: '#1A1A1A';
                position: relative;
            }
            /* 背景网格模拟地铁地图 */
            .main-container::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-image:
                    linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px);
                background-size: 40px 40px;
                pointer-events: none;
            }
            /* 底部线路装饰 */
            .main-container::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 16px;
                background: repeating-linear-gradient(
                    90deg,
                    #E32017 0px, #E32017 100px,
                    #0019A8 100px, #0019A8 200px,
                    #FFD329 200px, #FFD329 300px,
                    #007D32 300px, #007D32 400px,
                    #9B0058 400px, #9B0058 500px,
                    #F386A1 500px, #F386A1 600px,
                    #A1A5A7 600px, #A1A5A7 700px
                );
            }
            .transit-title {
                font-weight: 700;
                color: '#1A1A1A';
                letter-spacing: 0.05em;
                line-height: 1.1;
                text-transform: uppercase;
                position: relative;
            }
            /* 车站圆点装饰 */
            .transit-title::before {
                content: '';
                position: absolute;
                left: -40px;
                top: 50%;
                transform: translateY(-50%);
                width: 20px;
                height: 20px;
                background: #E32017;
                border: 4px solid #fff;
                border-radius: 50%;
                box-shadow: 0 0 0 2px #E32017;
            }
            .transit-title::after {
                content: '';
                position: absolute;
                right: -40px;
                top: 50%;
                transform: translateY(-50%);
                width: 20px;
                height: 20px;
                background: #0019A8;
                border: 4px solid #fff;
                border-radius: 50%;
                box-shadow: 0 0 0 2px #0019A8;
            }
            .card-item {
                position: relative;
            }
            /* 线路标识 */
            .card-item::before {
                content: attr(data-lineName);
                position: absolute;
                top: 12px;
                right: 12px;
                font-family: 'Roboto', sans-serif;
                font-size: 11px;
                font-weight: 700;
                color: #FFFFFF;
                background: attr(data-lineColor);
                padding: 4px 8px;
                border-radius: 12px;
                letter-spacing: 0.05em;
            }
            /* 换乘站圆点 */
            .card-item::after {
                content: '';
                position: absolute;
                bottom: 12px;
                left: 12px;
                width: 12px;
                height: 12px;
                background: #FFFFFF;
                border: 3px solid attr(data-lineColor);
                border-radius: 50%;
            }
            .card-item:hover {
                transform: translateY(-8px);
                box-shadow: 0 16px 40px rgba(0,0,0,0.15) !important;
            }
            .card-item:hover::after {
                transform: scale(1.5);
                transition: transform 0.3s ease;
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
                        className="text-center transit-title"
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
                            const line = transitLines[idx % transitLines.length];
                            return (
                                <div
                                    key={idx}
                                    data-card-item="true"
                                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                                    data-line-name={line.name}
                                    data-line-color={line.color}
                                    style={{
                                      backgroundColor: '#FFFFFF',
                                      borderRadius: '12px',
                                      border: `3px solid ${line.color}`,
                                      boxShadow: `0 4px 12px ${line.color}30, 0 8px 24px rgba(0,0,0,0.08)`,
                                      transition: 'all 0.3s ease',
                                      padding: layout.cardPadding,
                                    }}
                                >
                                    <div className="card-header flex items-center gap-4 mb-5">
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
                                            backgroundColor: line.color,
                                            boxShadow: `0 0 0 4px ${line.color}30`,
                                          }}
                                        >
                                          {card.icon}
                                        </span>
                                        <h3
                                          className={`js-title font-bold leading-tight ${layout.titleSizeClass}`}
                                          style={{
                                            color: '#1A1A1A',
                                            fontFamily: "'Johnston ITC', 'Gill Sans', 'Roboto', sans-serif",
                                            letterSpacing: '0.02em',
                                            borderBottom: `3px solid ${line.color}`,
                                            paddingBottom: '8px',
                                          }}
                                        >
                                          {card.title}
                                        </h3>
                                    </div>
                                    <p
                                        className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
                                        style={{ color: '#424242', fontFamily: "'Roboto', sans-serif" }}
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

export const transitMapAbstractTemplate: TemplateConfig = {
  id: 'transitMapAbstract',
  name: '交通图抽象法',
  description: '拓扑结构优先，45/90度角，统一线宽节点',
  icon: 'subway',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <TransitMapAbstract data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'transitMapAbstract'),
};

export { TransitMapAbstract };
