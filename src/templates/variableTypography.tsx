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
 * VariableTypography 渲染组件
 * 可变字体风格 - 用字重/宽度/倾斜做动态层级
 */
interface VariableTypographyProps {
  data: GeneratedContent;
  scale: number;
}

const VariableTypography: React.FC<VariableTypographyProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const gradientColors = [
    { bg: '#0a0a0a', text: '#ffffff', accent: '#ff6b6b' },
    { bg: '#1a1a2e', text: '#f8f9fa', accent: '#4ecdc4' },
    { bg: '#16213e', text: '#eaeaea', accent: '#f9ca24' },
    { bg: '#1f1f3a', text: '#f0f0f0', accent: '#a29bfe' },
    { bg: '#0f0f1a', text: '#ffffff', accent: '#fd79a8' },
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
      while (title.scrollWidth > 1650 && size > titleConfig.minFontSize && guard < 100) {
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
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'Inter', 'CustomPreviewFont', system-ui, sans-serif;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0f0f1a 100%);
          color: #ffffff;
        }
        .variable-title {
          font-weight: 900;
          font-stretch: 150%;
          color: #ffffff;
          letter-spacing: -0.03em;
          line-height: 0.95;
          text-transform: uppercase;
          background: linear-gradient(135deg, #ffffff 0%, #a0a0a0 50%, #ffffff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .card-item {
          border-radius: 8px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        /* 可变字体视觉指示器 */
        .card-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: linear-gradient(to bottom, var(--accent-color, #ff6b6b), transparent);
          opacity: 0.8;
        }
                .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
                .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
                .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }

        .js-desc strong {
          font-weight: 700;
        }
        .js-desc code {
          background: rgba(255,255,255,0.15);
          padding: 0.1em 0.4em;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.85em;
          color: #4ecdc4;
          font-weight: 500;
        }
        .content-scale { transform-origin: center center; }

        /* 动态背景网格 */
        .dynamic-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 80px 80px;
          pointer-events: none;
        }

        /* 可变字体轴指示器 */
        .axis-indicator {
          position: absolute;
          bottom: 12px;
          right: 12px;
          font-size: 10px;
          font-family: monospace;
          opacity: 0.3;
          color: #ffffff;
        }
      `}</style>

      <div className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
        {/* 动态网格背景 */}
        <div className="dynamic-grid"></div>

        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-20 box-border content-scale relative z-10"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}
        >
          {/* 标题区域 */}
          <div className="title-zone flex-none flex items-center justify-center w-full">
            <h1
              ref={titleRef}
              className="text-center variable-title"
            >
              {data.mainTitle}
            </h1>
          </div>

          {/* 卡片区域 */}
          <div className="card-zone flex-none w-full">
            <div
              data-card-zone="true"
              className="w-full flex flex-wrap justify-center content-center gap-7"
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
                const weightScale = 100 + (idx % 5) * 100;
                const widthScale = 75 + (idx % 3) * 25;
                const italLevel = (idx % 2) * 12;
                const color = gradientColors[idx % gradientColors.length];

                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      '--accent-color': color.accent,
                      backgroundColor: color.bg,
                      padding: layout.cardPadding,
                    } as React.CSSProperties}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <span
                        className="js-icon material-symbols-rounded"
                        style={{
                          color: color.accent,
                          fontSize: layout.iconSize,
                          fontVariationSettings: `'wght' ${weightScale}, 'wdth' ${widthScale}`,
                        }}
                      >
                        {card.icon}
                      </span>
                      <h3
                        className={`js-title ${layout.titleSizeClass}`}
                        style={{
                          color: color.text,
                          fontWeight: String(weightScale) as React.CSSProperties['fontWeight'],
                          fontStretch: `${widthScale}%`,
                          fontStyle: italLevel > 0 ? 'italic' : 'normal',
                          letterSpacing: `${(idx % 3) * 0.02 - 0.02}em`,
                        }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
                      style={{ color: color.text, opacity: '0.85', fontWeight: '300' }}
                      dangerouslySetInnerHTML={{ __html: autoAddSpaceToHtml(card.desc) }}
                    />
                    <div className="axis-indicator">wght:{weightScale} wdth:{widthScale}</div>
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


export const variableTypographyTemplate: TemplateConfig = {
  id: 'variableTypography',
  name: '可变字体',
  description: '用字重/宽度/倾斜做动态层级；适合互动叙事、品牌首页',
  icon: 'text_fields',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <VariableTypography data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'variableTypography'),
};

export { VariableTypography };
