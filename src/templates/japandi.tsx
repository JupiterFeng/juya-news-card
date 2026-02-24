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
 * Japandi 渲染组件
 * 日式×北欧融合：克制与温暖的平衡
 */
interface JapandiProps {
  data: GeneratedContent;
  scale: number;
}

const Japandi: React.FC<JapandiProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const japandiColors = [
    { bg: '#F5F3EF', onBg: '#2C2A27', accent: '#C4B49A' },
    { bg: '#EAE8E3', onBg: '#1F1E1C', accent: '#A69C8E' },
    { bg: '#DAD6CE', onBg: '#2A2825', accent: '#8B8179' },
    { bg: '#EFECE6', onBg: '#262420', accent: '#B5A694' },
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Noto+Sans+SC:wght@400;500&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
        <style>{`
            @font-face {
                font-family: 'CustomPreviewFont';
                src: url('/assets/htmlFont.ttf') format('truetype');
            }
            .main-container {
                font-family: 'Inter', 'Noto Sans SC', 'CustomPreviewFont', system-ui, sans-serif;
                background-color: #FAF9F6;
                color: #2C2A27;
            }
            .japandi-title {
                font-weight: 500;
                color: #2C2A27;
                letter-spacing: -0.02em;
                line-height: 1.2;
            }
            .card-item {
                border: 1px solid rgba(0,0,0,0.06);
                transition: all 0.25s ease;
            }
            .card-item:hover {
                box-shadow: 0 8px 30px rgba(0,0,0,0.08);
                transform: translateY(-1px);
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
                {/* 标题区域 */}
                <div className="flex flex-col items-center">
                    <h1
                        ref={titleRef}
                        className="text-center japandi-title"
                    >
                        {data.mainTitle}
                    </h1>
                </div>

                {/* 卡片区域 */}
                <div className="card-zone flex-none w-full">
                    <div
                        data-card-zone="true"
                        className="w-full flex flex-wrap justify-center content-center gap-6"
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
                            const color = japandiColors[idx % japandiColors.length];
                            return (
                                <div
                                    key={idx}
                                    data-card-item="true"
                                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                                    style={{
                                      backgroundColor: color.bg,
                                      borderRadius: '8px',
                                      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                                      border: '1px solid rgba(0,0,0,0.06)',
                                      transition: 'all 0.25s ease',
                                      padding: layout.cardPadding,
                                    }}
                                >
                                    <div className="card-header flex items-center gap-4 mb-4">
                                        <span className="js-icon material-symbols-rounded" style={{ color: color.accent, fontSize: layout.iconSize }}>
                                          {card.icon}
                                        </span>
                                        <h3
                                          className={`js-title font-medium leading-tight ${layout.titleSizeClass}`}
                                          style={{
                                            color: color.onBg,
                                            fontFamily: "'Inter', 'Noto Sans SC', system-ui, sans-serif",
                                            letterSpacing: '-0.01em',
                                          }}
                                        >
                                          {card.title}
                                        </h3>
                                    </div>
                                    <p
                                        className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
                                        style={{
                                          color: color.onBg,
                                          opacity: '0.75',
                                          fontFamily: "'Inter', 'Noto Sans SC', system-ui, sans-serif",
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

export const japandiTemplate: TemplateConfig = {
  id: 'japandi',
  name: '日北融合',
  description: '日式克制与北欧温暖的完美平衡',
  icon: 'self_improvement',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <Japandi data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'japandi'),
};

export { Japandi };
