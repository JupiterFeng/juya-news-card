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
 * FilmGrainAnalog 渲染组件
 * 胶片/模拟摄影风格 - 胶片颗粒、色偏、漏光
 */
interface FilmGrainAnalogProps {
  data: GeneratedContent;
  scale: number;
}

const FilmGrainAnalog: React.FC<FilmGrainAnalogProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const cardCount = data.cards.length;
  const layout = calculateStandardLayout(cardCount);
  const titleConfig = getStandardTitleConfig(cardCount, {
    titleConfigs: {
      '1-3': { initialFontSize: 95, minFontSize: 40 },
      '4': { initialFontSize: 90, minFontSize: 40 },
      '5-6': { initialFontSize: 85, minFontSize: 40 },
      '7-8': { initialFontSize: 75, minFontSize: 40 },
      '9+': { initialFontSize: 65, minFontSize: 40 }
    }
  });

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    
    const timer = window.setTimeout(() => {
      if (typeof (window as any).fitTitle === 'function') (window as any).fitTitle();
      if (typeof (window as any).fitViewport === 'function') (window as any).fitViewport();
    }, 50);
    
    return () => window.clearTimeout(timer);
  }, [data]);

  return (
    <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', overflow: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'EB Garamond', 'CustomPreviewFont', Georgia, serif;
          background: linear-gradient(180deg, #e8dcc8 0%, #f5e6d3 50%, #ddd4c5 100%);
          color: #2c2416;
        }
        .analog-title {
          font-weight: 500;
          color: #2c2416;
          letter-spacing: 0.03em;
          line-height: 1.3;
          font-style: italic;
        }
        .card-item {
          border-radius: 2px;
          border: 1px solid;
          box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
        }
        /* 胶片边缘效果 */
        .card-item::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(0,0,0,0.02) 0%,
            transparent 10%,
            transparent 90%,
            rgba(0,0,0,0.02) 100%
          );
          pointer-events: none;
        }
                .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
                .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
                .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }

        .js-desc strong { color: #8b4513; font-weight: 600; }
        .js-desc code {
          background: rgba(139, 69, 19, 0.1); padding: 0.1em 0.4em; border-radius: 2px;
          font-family: 'Courier New', monospace;
          font-size: 0.95em; color: #5d4e37;
        }
        .content-scale { transform-origin: center center; }

        /* 胶片颗粒效果 */
        .film-grain {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E");
          opacity: 0.06;
          pointer-events: none;
          z-index: 10;
        }

        /* 漏光效果 */
        .light-leak {
          position: absolute;
          width: 50%;
          height: 50%;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.12;
          pointer-events: none;
        }
        .leak-1 {
          top: -15%;
          right: -10%;
          background: #ff6b35;
        }
        .leak-2 {
          bottom: -15%;
          left: -10%;
          background: #ffd700;
        }

        /* 色差效果 */
        .chromatic-aberration {
          position: relative;
        }
        .card-item {
          filter: sepia(0.15) saturate(1.1);
        }

        /* 胶片边框 */
        .film-border {
          position: absolute;
          left: 0;
          right: 0;
          height: 20px;
          background: repeating-linear-gradient(
            to right,
            #1a1a1a 0px,
            #1a1a1a 8px,
            transparent 8px,
            transparent 12px
          );
          opacity: 0.3;
          z-index: 5;
          pointer-events: none;
        }
        .film-border-top { top: 0; }
        .film-border-bottom { bottom: 0; }
      `}</style>

      <div
        className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        {/* 胶片颗粒 */}
        <div className="film-grain"></div>

        {/* 漏光效果 */}
        <div className="light-leak leak-1"></div>
        <div className="light-leak leak-2"></div>

        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-20 box-border content-scale relative z-20"
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
              className="text-center analog-title js-title-text"
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
                // 胶片感配色 - 温暖的复古色调
                const analogColors = [
                  { bg: '#f5e6d3', border: '#c9a66b', accent: '#d4a574', text: '#2c2416' }, // 暖棕
                  { bg: '#e8dcc8', border: '#a8b5a0', accent: '#8b9d83', text: '#1a2018' }, // 橄榄绿
                  { bg: '#f0e4d4', border: '#c4a482', accent: '#d49a6a', text: '#2a1f12' }, // 蜜糖
                  { bg: '#ddd4c5', border: '#9a8b7a', accent: '#8a7b6a', text: '#1a1812' }, // 胶片灰
                  { bg: '#f2e6dc', border: '#c99a8a', accent: '#d48570', text: '#2a1a14' }, // 珊瑚暖
                ];
                const color = analogColors[idx % analogColors.length];

                return (
                  <div key={idx} className={`card-item chromatic-aberration flex flex-col ${layout.cardWidthClass}`} style={{
                    backgroundColor: color.bg,
                    borderColor: color.border,
                    padding: cardCount <= 3 ? '2rem' : (cardCount <= 6 ? '1.75rem' : '1.25rem')
                  }}>
                    <div className="film-border film-border-top"></div>
                    <div className="flex items-start gap-3 mb-3">
                      <span className="js-icon material-symbols-rounded" style={{ color: color.accent, fontSize: layout.iconSize }}>{card.icon}</span>
                      <h3 className={`js-title font-medium ${layout.titleSizeClass}`} style={{ color: color.text }}>{card.title}</h3>
                    </div>
                    <p
                      className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
                      style={{ color: color.text, opacity: 0.8 }}
                      dangerouslySetInnerHTML={{ __html: card.desc }}
                    />
                    <div className="film-border film-border-bottom"></div>
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

export const filmGrainAnalogTemplate: TemplateConfig = {
  id: 'filmGrainAnalog',
  name: '胶片模拟',
  description: '胶片颗粒、色偏、漏光；适合生活方式品牌、内容平台、情绪表达',
  icon: 'photo_camera',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <FilmGrainAnalog data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'filmGrainAnalog'),
};

export { FilmGrainAnalog };
