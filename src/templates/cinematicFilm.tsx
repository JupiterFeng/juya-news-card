import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import { 
  calculateStandardLayout, 
  getStandardTitleConfig, 
  generateTitleFitScript,
  generateViewportFitScript 
} from '../utils/layout-calculator';
import { generateDownloadableHtml } from '../utils/template';

/**
 * CinematicFilm 渲染组件
 * 电影感风格 - 宽银幕构图、暗部层次、氛围光
 */
const THEME_COLORS = [
  { bg: 'rgba(20, 20, 25, 0.85)', border: '#d4af37', accent: '#f4d03f', text: '#f5f5f5' }, // 金色
  { bg: 'rgba(15, 25, 30, 0.85)', border: '#5dade2', accent: '#85c1e9', text: '#e8f4f8' }, // 青色
  { bg: 'rgba(25, 15, 20, 0.85)', border: '#c0392b', accent: '#e74c3c', text: '#fdedec' }, // 红色
  { bg: 'rgba(15, 20, 25, 0.85)', border: '#27ae60', accent: '#2ecc71', text: '#e9f7ef' }, // 绿色
];

interface CinematicFilmProps {
  data: GeneratedContent;
  scale: number;
}

const CinematicFilm: React.FC<CinematicFilmProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const cardCount = data.cards.length;
  const layout = calculateStandardLayout(cardCount);
  const titleConfig = getStandardTitleConfig(cardCount);

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
        const nextScale = Math.max(0.6, maxH / contentH);
        wrapper.style.transform = `scale(${nextScale})`;
        return;
      }
      wrapper.style.transform = '';
    };

    const timer = window.setTimeout(fitViewport, 50);
    return () => window.clearTimeout(timer);
  }, [data, titleConfig]);

  return (
    <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', overflow: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'Montserrat', 'CustomPreviewFont', system-ui, sans-serif;
          background: linear-gradient(135deg, #0a0a0f 0%, #1a1a25 50%, #0f0f15 100%);
          color: #f5f5f5;
        }
        .cinematic-title {
          font-family: 'Playfair Display', 'CustomPreviewFont', serif;
          font-weight: 500;
          color: #f5f5f5;
          letter-spacing: 0.02em;
          line-height: 1.2;
          text-shadow: 0 2px 20px rgba(0, 0, 0, 0.8), 0 0 60px rgba(212, 175, 55, 0.3);
        }
        .card-item {
          border-radius: 4px;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(212, 175, 55, 0.3);
        }
        .card-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        }
                .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
                .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
                .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }

        .js-desc strong { color: #f4d03f; font-weight: 600; }
        .js-desc code {
          background: rgba(0,0,0,0.3); padding: 0.1em 0.4em; border-radius: 3px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em; color: #85c1e9;
        }
        .content-scale { transform-origin: center center; }

        /* 宽银幕效果 */
        .letterbox {
          position: absolute;
          left: 0;
          right: 0;
          height: 8%;
          background: #000;
          z-index: 5;
          pointer-events: none;
        }
        .letterbox-top { top: 0; }
        .letterbox-bottom { bottom: 0; }

        /* 氛围光效果 */
        .ambient-glow {
          position: absolute;
          width: 60%;
          height: 60%;
          border-radius: 50%;
          filter: blur(150px);
          opacity: 0.15;
          pointer-events: none;
        }
        .glow-1 {
          top: -10%;
          right: -10%;
          background: #d4af37;
        }
        .glow-2 {
          bottom: -10%;
          left: -10%;
          background: #5dade2;
        }

        /* 电影颗粒效果 */
        .film-grain {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.03;
          pointer-events: none;
          z-index: 10;
        }
      `}</style>

      <div className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
        {/* 宽银幕黑边 */}
        <div className="letterbox letterbox-top"></div>
        <div className="letterbox letterbox-bottom"></div>

        {/* 氛围光 */}
        <div className="ambient-glow glow-1"></div>
        <div className="ambient-glow glow-2"></div>

        {/* 电影颗粒 */}
        <div className="film-grain"></div>

        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-24 box-border content-scale relative z-20"
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
              className="text-center cinematic-title"
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
                const color = THEME_COLORS[idx % THEME_COLORS.length];
                return (
                  <div 
                    key={idx} 
                    className={`card-item flex flex-col ${cardCount > 1 ? layout.cardWidthClass : 'w-2/3'}`}
                    style={{
                      backgroundColor: color.bg,
                      borderColor: color.border,
                      padding: layout.cardPadding
                    }}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <span 
                        className="js-icon material-symbols-rounded"
                        style={{ color: color.accent, fontSize: layout.iconSize }}
                      >
                        {card.icon}
                      </span>
                      <h3 
                        className={`js-title font-semibold tracking-wide ${layout.titleSizeClass}`}
                        style={{ color: color.text }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
                      style={{ color: color.text, opacity: 0.85 }}
                      dangerouslySetInnerHTML={{ __html: card.desc }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* SSR Scripts */}
      <script dangerouslySetInnerHTML={{ __html: generateTitleFitScript(titleConfig) }} />
      <script dangerouslySetInnerHTML={{ __html: generateViewportFitScript() }} />
    </div>
  );
};

export const cinematicFilmTemplate: TemplateConfig = {
  id: 'cinematicFilm',
  name: '电影感',
  description: '宽银幕构图、暗部层次、氛围光；适合品牌片、产品故事页、发布会 KV',
  icon: 'theaters',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <CinematicFilm data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'cinematicFilm'),
};

export { CinematicFilm };
