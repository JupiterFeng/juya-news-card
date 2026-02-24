import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import { 
  calculateStandardLayout, 
  getStandardTitleConfig, 
  generateTitleFitScript, 
  generateViewportFitScript 
} from '../utils/layout-calculator';

/**
 * ExpressiveType 渲染组件
 * 表现性标题字体风格 - 大标题作为主视觉，夸张字形
 */
interface ExpressiveTypeProps {
  data: GeneratedContent;
  scale: number;
}

const ExpressiveType: React.FC<ExpressiveTypeProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const cardCount = data.cards.length;
  const layout = calculateStandardLayout(cardCount);
  const titleConfig = getStandardTitleConfig(cardCount, {
    titleConfigs: {
      '1-3': { initialFontSize: 140, minFontSize: 50 },
      '4': { initialFontSize: 120, minFontSize: 50 },
      '5-6': { initialFontSize: 100, minFontSize: 50 },
      '7-8': { initialFontSize: 80, minFontSize: 40 },
      '9+': { initialFontSize: 70, minFontSize: 40 }
    }
  });

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if (!data || !wrapperRef.current || !titleRef.current) return;

    const wrapper = wrapperRef.current;
    const title = titleRef.current;

    // 调整主标题字体大小
    const fitTitle = () => {
      let size = titleConfig.initialFontSize;
      title.style.fontSize = size + 'px';
      let guard = 0;
      while(title.scrollWidth > 1600 && size > titleConfig.minFontSize && guard < 100) {
        size -= 1;
        title.style.fontSize = size + 'px';
        guard++;
      }
    };
    fitTitle();

    // 适配视口
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
      <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'Be Vietnam Pro', 'CustomPreviewFont', system-ui, sans-serif;
          background: #f8f9fa;
          color: #1a1a2e;
        }
        .expressive-title {
          font-weight: 900;
          color: #1a1a2e;
          letter-spacing: -0.06em;
          line-height: 0.85;
          text-transform: uppercase;
          text-shadow: 4px 4px 0 #ff6b6b;
        }
        .card-item {
          border-radius: 0;
          position: relative;
          overflow: hidden;
          transform: skewX(-2deg);
        }
        .card-item > * {
          transform: skewX(2deg);
        }
                .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
                .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
                .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }

        .js-desc strong {
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }
        .js-desc code {
          background: rgba(0,0,0,0.2);
          padding: 0.15em 0.4em;
          border-radius: 2px;
          font-family: 'Courier New', monospace;
          font-size: 0.85em;
          font-weight: 700;
        }
        .content-scale { transform-origin: center center; }

        /* 装饰性形状 */
        .decorative-shape {
          position: absolute;
          z-index: 0;
          pointer-events: none;
        }
        .shape-circle {
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: #ff6b6b;
          top: -100px;
          right: -50px;
        }
        .shape-triangle {
          width: 0;
          height: 0;
          border-left: 150px solid transparent;
          border-right: 150px solid transparent;
          border-bottom: 260px solid #4ecdc4;
          bottom: -80px;
          left: -80px;
        }
        .shape-square {
          width: 200px;
          height: 200px;
          background: #ffe66d;
          transform: rotate(45deg);
          top: 50%;
          left: -60px;
        }

        /* 大图标装饰 */
        .big-icon {
          position: absolute;
          font-size: 180px;
          opacity: 0.05;
          font-family: 'Material Symbols Rounded';
          bottom: -30px;
          right: 20px;
          pointer-events: none;
        }
      `}</style>

      <div
        className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        {/* 装饰性形状 */}
        <div className="decorative-shape shape-circle"></div>
        <div className="decorative-shape shape-triangle"></div>
        <div className="decorative-shape shape-square"></div>

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
              data-text={data.mainTitle}
              className="text-center expressive-title"
              style={{ fontSize: titleConfig.initialFontSize + 'px' }}
            >
              {data.mainTitle}
            </h1>
          </div>

          {/* 卡片区域 */}
          <div className="card-zone flex-none w-full">
            <div
              className="w-full flex flex-wrap justify-center content-center"
              style={{ gap: layout.containerGap, '--container-gap': layout.containerGap } as React.CSSProperties}
            >
              {data.cards.map((card, idx) => {
                // 表现性配色
                const expressiveColors = [
                  { bg: '#ff6b6b', text: '#ffffff', accent: '#fff' },
                  { bg: '#4ecdc4', text: '#1a1a2e', accent: '#1a1a2e' },
                  { bg: '#ffe66d', text: '#1a1a2e', accent: '#ff6b6b' },
                  { bg: '#95e1d3', text: '#1a1a2e', accent: '#ff6b6b' },
                  { bg: '#f38181', text: '#ffffff', accent: '#fff' },
                  { bg: '#aa96da', text: '#ffffff', accent: '#ffe66d' },
                ];
                const color = expressiveColors[idx % expressiveColors.length];

                return (
                  <div key={idx} className={`card-item flex flex-col ${layout.cardWidthClass}`} style={{
                    backgroundColor: color.bg,
                    color: color.text,
                    padding: cardCount <= 3 ? '3rem' : (cardCount <= 6 ? '2.5rem' : '2rem')
                  }}>
                    <div className="flex items-start gap-4 mb-5">
                      <span className="js-icon material-symbols-rounded" style={{ color: color.accent, fontSize: layout.iconSize }}>{card.icon}</span>
                      <h3 className={`js-title font-black ${layout.titleSizeClass}`} style={{ 
                        color: color.text,
                        textTransform: 'uppercase',
                        letterSpacing: '-0.04em',
                        lineHeight: '0.9'
                      }}>{card.title}</h3>
                    </div>
                    <p
                      className={`js-desc font-medium leading-relaxed ${layout.descSizeClass}`}
                      style={{ color: color.text }}
                      dangerouslySetInnerHTML={{ __html: card.desc }}
                    />
                    <div className="big-icon">{card.icon}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: generateTitleFitScript(titleConfig) }} />
      <script dangerouslySetInnerHTML={{ __html: generateViewportFitScript() }} />
    </div>
  );
};

import { generateDownloadableHtml } from '../utils/template';

export const expressiveTypeTemplate: TemplateConfig = {
  id: 'expressiveType',
  name: '表现性标题',
  description: '大标题作为主视觉，夸张字形；适合营销页、活动 KV',
  icon: 'title',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <ExpressiveType data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'expressiveType'),
};

export { ExpressiveType };
