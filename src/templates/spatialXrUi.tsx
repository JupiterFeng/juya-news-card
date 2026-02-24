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
 * SpatialXRUI 渲染组件
 * 空间计算界面：距离、深度、注视与手势的空间布局
 * 特点：3D层级、深度阴影、空间定位、漂浮元素、手势提示
 */
interface SpatialXRUIProps {
  data: GeneratedContent;
  scale: number;
}

const SpatialXRUI: React.FC<SpatialXRUIProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const xrColors = [
    { bg: 'rgba(30, 30, 40, 0.95)', primary: '#00E5FF', accent: '#00B8CC', glow: 'rgba(0, 229, 255, 0.4)', depth: 'close' },
    { bg: 'rgba(25, 35, 45, 0.9)', primary: '#7C4DFF', accent: '#651FFF', glow: 'rgba(124, 77, 255, 0.4)', depth: 'mid' },
    { bg: 'rgba(20, 40, 35, 0.88)', primary: '#00E676', accent: '#00C853', glow: 'rgba(0, 230, 118, 0.4)', depth: 'far' },
    { bg: 'rgba(40, 25, 35, 0.92)', primary: '#FF4081', accent: '#F50057', glow: 'rgba(255, 64, 129, 0.4)', depth: 'close' },
    { bg: 'rgba(35, 30, 25, 0.9)', primary: '#FFAB40', accent: '#FF9100', glow: 'rgba(255, 171, 64, 0.4)', depth: 'mid' },
    { bg: 'rgba(25, 30, 40, 0.93)', primary: '#40C4FF', accent: '#00B0FF', glow: 'rgba(64, 196, 255, 0.4)', depth: 'far' },
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
                background: radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a14 100%);
                color: '#00E5FF';
                position: relative;
            }
            /* 网格空间 */
            @keyframes gridFloat {
                0% { transform: perspective(500px) rotateX(60deg) translateY(0); }
                100% { transform: perspective(500px) rotateX(60deg) translateY(40px); }
            }
            .main-container::before {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 200%;
                height: 200%;
                background-image:
                    linear-gradient(rgba(0, 229, 255, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0, 229, 255, 0.1) 1px, transparent 1px);
                background-size: 60px 60px;
                transform: translate(-50%, -50%) perspective(500px) rotateX(60deg);
                animation: gridFloat 20s linear infinite;
                pointer-events: none;
            }
            /* 眼动追踪指示 */
            .main-container::after {
                content: '👁 SPATIAL UI';
                position: absolute;
                top: 24px;
                right: 24px;
                font-size: 11px;
                font-weight: 600;
                letter-spacing: 0.15em;
                color: '#00E5FF';
                background: 'rgba(0, 229, 255, 0.1)';
                padding: 8px 16px;
                border-radius: 20px;
                border: 1px solid rgba(0, 229, 255, 0.3);
                box-shadow: 0 0 20px rgba(0, 229, 255, 0.3);
            }
            .xr-title {
                font-weight: 700;
                color: '#00E5FF';
                letter-spacing: '0.1em';
                line-height: 1.2;
                text-transform: uppercase;
                position: relative;
                text-shadow: 0 0 40px rgba(0, 229, 255, 0.6);
            }
            /* 立方体装饰 */
            .xr-title::before,
            .xr-title::after {
                content: '';
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                width: 16px;
                height: 16px;
                border: 2px solid #00E5FF;
                box-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
            }
            .xr-title::before {
                left: -32px;
                transform: translateY(-50%) rotate(45deg);
            }
            .xr-title::after {
                right: -32px;
                transform: translateY(-50%) rotate(45deg);
            }
            .card-item {
                position: relative;
                transform-style: preserve-3d;
            }
            /* 深度标签 */
            .card-item::before {
                content: attr(data-depth);
                position: absolute;
                top: -8px;
                right: 16px;
                font-family: 'Inter', sans-serif;
                font-size: 9px;
                font-weight: 600;
                color: attr(data-accent);
                background: 'rgba(0,0,0,0.5)';
                padding: 4px 10px;
                border-radius: 10px;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                border: 1px solid attr(data-accent);
            }
            /* 注视点 */
            .card-item::after {
                content: '';
                position: absolute;
                bottom: 16px;
                right: 16px;
                width: 10px;
                height: 10px;
                background: attr(data-accent);
                border-radius: 50%;
                box-shadow: 0 0 20px attr(data-glow-color), 0 0 0 4px attr(data-accent);
                animation: pulse 2s ease-in-out infinite;
            }
            @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.6; transform: scale(1.2); }
            }
            .card-item:hover {
                transform: translateZ(30px) translateY(-10px);
                box-shadow: 0 16px 48px attr(data-glow-color), 0 0 0 2px attr(data-accent)40 !important;
            }
            .card-item:hover .js-icon {
                box-shadow: 0 0 40px attr(data-glow-color), 0 0 0 6px attr(data-accent)60 !important;
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
                        className="text-center xr-title"
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
                            const color = xrColors[idx % xrColors.length];
                            return (
                                <div
                                    key={idx}
                                    data-card-item="true"
                                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                                    data-depth={color.depth}
                                    data-glow-color={color.glow}
                                    data-accent={color.accent}
                                    style={{
                                      backgroundColor: color.bg,
                                      borderRadius: '20px',
                                      border: `1px solid ${color.accent}40`,
                                      boxShadow: `0 8px 32px ${color.glow}, 0 0 0 1px ${color.accent}20, inset 0 1px 0 ${color.accent}30`,
                                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                      padding: layout.cardPadding,
                                      backdropFilter: 'blur(20px)',
                                      WebkitBackdropFilter: 'blur(20px)',
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
                                            borderRadius: '16px',
                                            backgroundColor: color.accent,
                                            boxShadow: `0 0 30px ${color.glow}, 0 0 0 4px ${color.accent}40`,
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
                                            textShadow: `0 0 20px ${color.glow}`,
                                          }}
                                        >
                                          {card.title}
                                        </h3>
                                    </div>
                                    <p
                                        className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
                                        style={{
                                          color: 'rgba(255,255,255,0.85)',
                                          fontFamily: '"Inter", sans-serif',
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

export const spatialXrUiTemplate: TemplateConfig = {
  id: 'spatialXrUi',
  name: '空间计算界面',
  description: '距离深度与手势提示的空间布局',
  icon: 'view_in_ar',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <SpatialXRUI data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'spatialXrUi'),
};

export { SpatialXRUI };
