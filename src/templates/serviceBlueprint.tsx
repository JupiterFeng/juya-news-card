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
 * ServiceBlueprint 渲染组件
 * 服务蓝图：前台体验、后台流程、支持系统的可视化
 * 特点：泳道图、前后台分离、时间轴、交互点标记
 */
interface ServiceBlueprintProps {
  data: GeneratedContent;
  scale: number;
}

const ServiceBlueprint: React.FC<ServiceBlueprintProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const blueprintZones = [
    { zone: 'frontstage', name: '前台', bg: '#E3F2FD', line: '#1976D2', icon: 'person' },
    { zone: 'backstage', name: '后台', bg: '#F3E5F5', line: '#7B1FA2', icon: 'settings' },
    { zone: 'support', name: '支持', bg: '#E8F5E9', line: '#388E3C', icon: 'support' },
    { zone: 'physical', name: '物理', bg: '#FFF3E0', line: '#F57C00', icon: 'store' },
    { zone: 'digital', name: '数字', bg: '#E1F5FE', line: '#0288D1', icon: 'devices' },
    { zone: 'process', name: '流程', bg: '#FFEBEE', line: '#D32F2F', icon: 'account_tree' },
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
                background: linear-gradient(180deg, #FAFAFA 0%, #F5F5F5 100%);
                color: '#212121';
                position: relative;
            }
            /* 泳道分隔线 */
            .main-container::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background:
                    linear-gradient(90deg, rgba(25,118,210,0.05) 0%, rgba(25,118,210,0.05) 16.66%,
                    rgba(123,31,162,0.05) 16.66%, rgba(123,31,162,0.05) 33.33%,
                    rgba(56,142,60,0.05) 33.33%, rgba(56,142,60,0.05) 50%,
                    rgba(245,124,0,0.05) 50%, rgba(245,124,0,0.05) 66.66%,
                    rgba(2,136,209,0.05) 66.66%, rgba(2,136,209,0.05) 83.33%,
                    rgba(211,47,47,0.05) 83.33%, rgba(211,47,47,0.05) 100%);
                pointer-events: none;
            }
            /* 时间轴装饰 */
            .main-container::after {
                content: '';
                position: absolute;
                top: 0;
                left: 12.5%;
                width: 2px;
                height: 100%;
                background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.1) 10%, rgba(0,0,0,0.1) 90%, transparent 100%);
            }
            .blueprint-title {
                font-weight: 700;
                color: '#212121';
                letter-spacing: 0.05em;
                line-height: 1.2;
                text-transform: uppercase;
                position: relative;
            }
            /* 标题图钉装饰 */
            .blueprint-title::before {
                content: '📌';
                position: absolute;
                left: -36px;
                top: 50%;
                transform: translateY(-50%);
                font-size: 20px;
            }
            .card-item {
                position: relative;
            }
            /* 区域标签 */
            .card-item::before {
                content: attr(data-zone-name);
                position: absolute;
                top: 12px;
                right: 12px;
                font-family: 'Inter', sans-serif;
                font-size: 10px;
                font-weight: 600;
                color: attr(data-zone-color);
                background: 'rgba(255,255,255,0.8)';
                padding: 4px 8px;
                border-radius: 4px;
                letter-spacing: 0.05em;
                text-transform: uppercase;
            }
            /* 连接点 */
            .card-item::after {
                content: '';
                position: absolute;
                bottom: 12px;
                left: 12px;
                width: 8px;
                height: 8px;
                background: attr(data-zone-color);
                border-radius: 50%;
                border: 2px solid #fff;
                box-shadow: 0 0 0 2px attr(data-zone-color);
            }
            .card-item:hover {
                transform: translateX(8px);
                box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important;
                border-left-width: '8px';
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
                        className="text-center blueprint-title"
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
                            const zone = blueprintZones[idx % blueprintZones.length];
                            return (
                                <div
                                    key={idx}
                                    data-card-item="true"
                                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                                    data-zone-name={zone.name}
                                    data-zone-color={zone.line}
                                    data-zone-icon={zone.icon}
                                    style={{
                                      backgroundColor: zone.bg,
                                      borderRadius: '12px',
                                      borderLeft: `6px solid ${zone.line}`,
                                      borderTop: '1px solid rgba(0,0,0,0.08)',
                                      borderRight: '1px solid rgba(0,0,0,0.08)',
                                      borderBottom: '1px solid rgba(0,0,0,0.08)',
                                      boxShadow: `0 4px 12px ${zone.line}20`,
                                      transition: 'all 0.3s ease',
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
                                            borderRadius: '8px',
                                            backgroundColor: zone.line,
                                          }}
                                        >
                                          {card.icon}
                                        </span>
                                        <h3
                                          className={`js-title font-semibold leading-tight ${layout.titleSizeClass}`}
                                          style={{
                                            color: zone.line,
                                            fontFamily: "'Inter', 'Roboto', sans-serif",
                                            letterSpacing: '0.02em',
                                          }}
                                        >
                                          {card.title}
                                        </h3>
                                    </div>
                                    <p
                                        className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
                                        style={{
                                          color: '#424242',
                                          fontFamily: "'Inter', sans-serif",
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

export const serviceBlueprintTemplate: TemplateConfig = {
  id: 'serviceBlueprint',
  name: '服务蓝图',
  description: '前台后台流程可视化，泳道图与交互点标记',
  icon: 'account_tree',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <ServiceBlueprint data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'serviceBlueprint'),
};

export { ServiceBlueprint };
