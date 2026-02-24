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
 * PatternDriven 渲染组件
 * 图案驱动风格 - 重复纹理/图案作为系统
 */
interface PatternDrivenProps {
  data: GeneratedContent;
  scale: number;
}

const PatternDriven: React.FC<PatternDrivenProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const patternColors = [
    { bg: '#1a1a2e', text: '#eaeaea', accent: '#e94560', pattern: 'dots' },
    { bg: '#0f3460', text: '#eaeaea', accent: '#00d9ff', pattern: 'lines' },
    { bg: '#16213e', text: '#eaeaea', accent: '#ff6b6b', pattern: 'zigzag' },
    { bg: '#1f1f3a', text: '#eaeaea', accent: '#ffd93d', pattern: 'cross' },
    { bg: '#0d1b2a', text: '#eaeaea', accent: '#80ffdb', pattern: 'waves' },
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
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'Space Grotesk', 'CustomPreviewFont', system-ui, sans-serif;
          background: #1a1a2e;
          color: #eaeaea;
        }
        .pattern-title {
          font-weight: 700;
          color: '#eaeaea';
          letter-spacing: -0.02em;
          line-height: 1.1;
        }
        .card-item {
          border-radius: 12px;
          position: relative;
          overflow: hidden;
          border: 2px solid rgba(255,255,255,0.1);
        }
        /* 图案叠加 */
        .card-item::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0.08;
          pointer-events: none;
        }
        /* 点状图案 */
        .card-item[data-pattern="dots"]::before {
          background-image: radial-gradient(circle, #ffffff 1px, transparent 1px);
          background-size: 20px 20px;
        }
        /* 线条图案 */
        .card-item[data-pattern="lines"]::before {
          background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, #ffffff 10px, #ffffff 11px);
        }
        /* 锯齿图案 */
        .card-item[data-pattern="zigzag"]::before {
          background: linear-gradient(135deg, #ffffff 25%, transparent 25%) -20px 0,
                      linear-gradient(225deg, #ffffff 25%, transparent 25%) -20px 0,
                      linear-gradient(315deg, #ffffff 25%, transparent 25%),
                      linear-gradient(45deg, #ffffff 25%, transparent 25%);
          background-size: 40px 40px;
        }
        /* 十字图案 */
        .card-item[data-pattern="cross"]::before {
          background-image: linear-gradient(#ffffff 2px, transparent 2px),
                              linear-gradient(90deg, #ffffff 2px, transparent 2px);
          background-size: 30px 30px;
        }
        /* 波浪图案 */
        .card-item[data-pattern="waves"]::before {
          background-image: url("data:image/svg+xml,%3Csvg width='40' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q10 0 20 10 T40 10' stroke='%23ffffff' stroke-width='1' fill='none'/%3E%3C/svg%3E");
          background-size: 40px 20px;
        }
                .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
                .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
                .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }

        .js-desc strong {
          font-weight: 700;
        }
        .js-desc code {
          background: rgba(255,255,255,0.1);
          color: #e94560;
          padding: 0.2em 0.5em;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
          font-weight: 500;
        }
        .content-scale { transform-origin: center center; }

        /* 背景图案 */
        .bg-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          pointer-events: none;
        }

        /* 图案边框装饰 */
        .pattern-border {
          position: absolute;
          inset: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          pointer-events: none;
        }
      `}</style>

      <div className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
        {/* 背景图案 */}
        <div className="bg-pattern"></div>

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
              className="text-center pattern-title"
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
                const pattern = patternColors[idx % patternColors.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    data-pattern={pattern.pattern}
                    style={{
                      backgroundColor: pattern.bg,
                      color: pattern.text,
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="pattern-border"></div>
                    <div className="flex items-start gap-4 mb-4">
                      <span className="js-icon material-symbols-rounded" style={{ color: pattern.accent, fontSize: layout.iconSize }}>
                        {card.icon}
                      </span>
                      <h3 className={`js-title font-semibold ${layout.titleSizeClass}`} style={{ color: pattern.text }}>
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-medium leading-relaxed ${layout.descSizeClass}`}
                      style={{ color: pattern.text }}
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


export const patternDrivenTemplate: TemplateConfig = {
  id: 'patternDriven',
  name: '图案驱动',
  description: '重复纹理/图案作为系统；适合品牌识别、包装、电商活动',
  icon: 'pattern',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <PatternDriven data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'patternDriven'),
};

export { PatternDriven };
