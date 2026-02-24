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
 * MaterialHonesty 渲染组件
 * 材料诚实：不"假装"成别的材质，金属像金属、塑料像塑料
 */
interface MaterialHonestyProps {
  data: GeneratedContent;
  scale: number;
}

const MaterialHonesty: React.FC<MaterialHonestyProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const materialColors = [
    { bg: '#D4D4D4', onBg: '#1A1A1A', accent: '#A0A0A0', name: 'aluminum', shadow: 'inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.15)' },
    { bg: '#E8E8E8', onBg: '#1A1A1A', accent: '#B0B0B0', name: 'steel', shadow: 'inset 0 2px 4px rgba(255,255,255,0.4), 0 6px 16px rgba(0,0,0,0.2)' },
    { bg: '#F5E6D3', onBg: '#2A1F18', accent: '#C9A882', name: 'wood', shadow: 'inset 0 0 0 1px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.1)' },
    { bg: '#2A2A2A', onBg: '#F5F5F5', accent: '#505050', name: 'carbon', shadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 6px 20px rgba(0,0,0,0.4)' },
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
        <style>{`
            @font-face {
                font-family: 'CustomPreviewFont';
                src: url('/assets/htmlFont.ttf') format('truetype');
            }
            .main-container {
                font-family: 'Inter', 'CustomPreviewFont', system-ui, sans-serif;
                background-color: '#F0F0F0';
                color: '#1A1A1A';
                background-image: linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px);
                background-size: 20px 20px;
            }
            .honest-title {
                font-weight: 500;
                color: '#1A1A1A';
                letter-spacing: -0.02em;
                line-height: 1.2;
            }
            .card-item {
                transition: all 0.2s ease;
            }
            .card-item:hover {
                transform: translateY(-2px);
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
                        className="text-center honest-title"
                    >
                        {data.mainTitle}
                    </h1>
                </div>

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
                            const material = materialColors[idx % materialColors.length];
                            const cardStyle: React.CSSProperties = {
                              backgroundColor: material.bg,
                              boxShadow: material.shadow,
                              transition: 'all 0.2s ease',
                              padding: layout.cardPadding,
                            };

                            if (material.name === 'aluminum' || material.name === 'steel') {
                              cardStyle.borderRadius = '2px';
                              cardStyle.border = '1px solid rgba(0,0,0,0.1)';
                            } else if (material.name === 'wood') {
                              cardStyle.borderRadius = '3px';
                              cardStyle.border = 'none';
                              cardStyle.backgroundImage = 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.02) 2px, rgba(0,0,0,0.02) 4px)';
                            } else if (material.name === 'carbon') {
                              cardStyle.borderRadius = '2px';
                              cardStyle.border = '1px solid rgba(255,255,255,0.1)';
                              cardStyle.backgroundImage = 'repeating-linear-gradient(45deg, transparent, transparent 1px, rgba(255,255,255,0.03) 1px, rgba(255,255,255,0.03) 2px)';
                            }

                            return (
                                <div
                                    key={idx}
                                    data-card-item="true"
                                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                                    style={cardStyle}
                                >
                                    <div className="card-header flex items-center gap-4 mb-4">
                                        <span className="js-icon material-symbols-rounded" style={{ color: material.accent, fontSize: layout.iconSize }}>
                                          {card.icon}
                                        </span>
                                        <h3
                                          className={`js-title font-medium leading-tight ${layout.titleSizeClass}`}
                                          style={{
                                            color: material.onBg,
                                            fontFamily: "'Inter', system-ui, sans-serif",
                                            letterSpacing: '-0.01em',
                                          }}
                                        >
                                          {card.title}
                                        </h3>
                                    </div>
                                    <p
                                        className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
                                        style={{
                                          color: material.onBg,
                                          opacity: '0.75',
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

export const materialHonestyTemplate: TemplateConfig = {
  id: 'materialHonesty',
  name: '材料诚实',
  description: '真实材质表达，不假装成别的材质',
  icon: 'layers',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <MaterialHonesty data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'materialHonesty'),
};

export { MaterialHonesty };
