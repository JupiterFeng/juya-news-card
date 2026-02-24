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
 * SerifClassic 渲染组件
 * 衬线主导古典风格 - 衬线字体 + 克制排版
 */
interface SerifClassicProps {
  data: GeneratedContent;
  scale: number;
}

const SerifClassic: React.FC<SerifClassicProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const classicColors = [
    { bg: '#faf8f5', accent: '#8b7355', text: '#2c2420', border: '#d4c4a8' },
    { bg: '#f8f6f2', accent: '#6b5b4f', text: '#1a1410', border: '#c9bba8' },
    { bg: '#f5f3ed', accent: '#7a6958', text: '#25201a', border: '#d0c2b0' },
    { bg: '#faf5f0', accent: '#8b6914', text: '#1f1a12', border: '#dcc9a0' },
    { bg: '#f0ebe4', accent: '#4a5d4a', text: '#1a1f18', border: '#b8c4b0' },
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
      while (title.scrollWidth > 1600 && size > titleConfig.minFontSize && guard < 100) {
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
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'Cormorant Garamond', 'CustomPreviewFont', Georgia, serif;
          background: linear-gradient(180deg, #f8f6f2 0%, #faf8f5 50%, #f5f3ed 100%);
          color: #2c2420;
        }
        .classic-title {
          font-family: 'Playfair Display', 'CustomPreviewFont', serif;
          font-weight: 400;
          font-style: italic;
          color: #2c2420;
          letter-spacing: 0.02em;
          line-height: 1.2;
        }
        .card-item {
          border-radius: 4px;
          position: relative;
          overflow: hidden;
        }
        /* 装饰性角纹 */
        .card-item::before {
          content: '';
          position: absolute;
          top: 8px;
          left: 8px;
          right: 8px;
          bottom: 8px;
          border: 1px solid rgba(139, 115, 85, 0.2);
          pointer-events: none;
        }
                .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
                .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
                .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }

        .js-desc strong {
          font-weight: 500;
          font-style: italic;
        }
        .js-desc code {
          background: rgba(139, 115, 85, 0.1);
          padding: 0.1em 0.4em;
          border-radius: 2px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
          color: #6b5b4f;
        }
        .content-scale { transform-origin: center center; }

        /* 装饰性分割线 */
        .decorative-line {
          width: 60px;
          height: 2px;
          background: linear-gradient(to right, transparent, #8b7355, transparent);
          margin: 0 auto;
        }

        /* 首字母下沉效果 */
        .drop-cap::first-letter {
          float: left;
          font-family: 'Playfair Display', serif;
          font-size: 3.5em;
          line-height: 0.8;
          padding-right: 0.1em;
          color: #8b7355;
        }

        /* 纸张纹理 */
        .paper-texture {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23paper)' opacity='0.03'/%3E%3C/svg%3E");
          opacity: 0.5;
          pointer-events: none;
        }
      `}</style>

      <div className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
        {/* 纸张纹理 */}
        <div className="paper-texture"></div>

        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-24 box-border content-scale relative z-10"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}
        >
          {/* 标题区域 */}
          <div className="title-zone flex-none flex flex-col items-center justify-center w-full gap-4">
            <div className="decorative-line"></div>
            <h1
              ref={titleRef}
              className="text-center classic-title"
            >
              {data.mainTitle}
            </h1>
            <div className="decorative-line"></div>
          </div>

          {/* 卡片区域 */}
          <div className="card-zone flex-none w-full">
            <div
              data-card-zone="true"
              className="w-full flex flex-wrap justify-center content-center gap-8"
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
                const color = classicColors[idx % classicColors.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: color.bg,
                      border: `1px solid ${color.border}`,
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <span className="js-icon material-symbols-rounded" style={{ color: color.accent, fontSize: layout.iconSize }}>
                        {card.icon}
                      </span>
                      <h3
                        className={`js-title font-normal ${layout.titleSizeClass}`}
                        style={{ color: color.text, fontFamily: "'Playfair Display', 'CustomPreviewFont', serif" }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc drop-cap font-light leading-relaxed ${layout.descSizeClass}`}
                      style={{ color: color.text, opacity: '0.85' }}
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


export const serifClassicTemplate: TemplateConfig = {
  id: 'serifClassic',
  name: '衬线古典',
  description: '衬线字体 + 克制排版，偏"可信/文化"；适合金融、出版、教育、奢品',
  icon: 'format_size',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <SerifClassic data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'serifClassic'),
};

export { SerifClassic };
