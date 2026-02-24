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
 * LowPoly3D 渲染组件
 * 低多边形3D风格 - 几何切面、轻量
 */
interface LowPoly3DProps {
  data: GeneratedContent;
  scale: number;
}

const LowPoly3D: React.FC<LowPoly3DProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const polyColors = [
    { bg: '#2d3436', text: '#dfe6e9', accent: '#74b9ff' },
    { bg: '#6c5ce7', text: '#dfe6e9', accent: '#fd79a8' },
    { bg: '#00b894', text: '#dfe6e9', accent: '#ffeaa7' },
    { bg: '#e17055', text: '#dfe6e9', accent: '#81ecec' },
    { bg: '#0984e3', text: '#dfe6e9', accent: '#00cec9' },
    { bg: '#fdcb6e', text: '#2d3436', accent: '#e84393' },
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
      <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'Rajdhani', 'CustomPreviewFont', system-ui, sans-serif;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          color: #dfe6e9;
        }
        .lowpoly-title {
          font-weight: 700;
          color: #dfe6e9;
          letter-spacing: 0.05em;
          line-height: 1.1;
          text-transform: uppercase;
          /* 多边形文字阴影 */
          text-shadow:
            2px 2px 0 #636e72,
            4px 4px 0 #2d3436;
        }
        .card-item {
          position: relative;
          box-shadow: 8px 8px 0 rgba(0,0,0,0.2);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card-item:hover {
          transform: translate(-2px, -2px);
          box-shadow: 12px 12px 0 rgba(0,0,0,0.3);
        }
                .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
                .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
                .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }

        .js-desc strong {
          font-weight: 700;
          color: #74b9ff;
        }
        .js-desc code {
          background: rgba(0,0,0,0.2);
          color: #ffeaa7;
          padding: 0.15em 0.4em;
          border-radius: 0;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
          font-weight: 600;
          clip-path: polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%);
        }
        .content-scale { transform-origin: center center; }

        /* 多边形装饰 */
        .poly-shape {
          position: absolute;
          opacity: 0.1;
          pointer-events: none;
        }
        .poly-tri {
          width: 0;
          height: 0;
          border-left: 60px solid transparent;
          border-right: 60px solid transparent;
          border-bottom: 100px solid #74b9ff;
        }
        .poly-hex {
          width: 80px;
          height: 46px;
          background: #fd79a8;
          position: relative;
        }
        .poly-hex::before,
        .poly-hex::after {
          content: '';
          position: absolute;
          width: 0;
          border-left: 40px solid transparent;
          border-right: 40px solid transparent;
        }
        .poly-hex::before {
          bottom: 100%;
          border-bottom: 23px solid #fd79a8;
        }
        .poly-hex::after {
          top: 100%;
          border-top: 23px solid #fd79a8;
        }

        /* 菱形背景 */
        .diamond-bg {
          position: absolute;
          width: 300px;
          height: 300px;
          background: linear-gradient(135deg, rgba(116, 185, 255, 0.1), rgba(253, 121, 168, 0.1));
          transform: rotate(45deg);
          pointer-events: none;
        }

        /* 三角形图案背景 */
        .tri-pattern {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0 L60 30 L30 60 L0 30 Z' fill='none' stroke='rgba(255,255,255,0.03)' stroke-width='1'/%3E%3C/svg%3E");
          pointer-events: none;
        }

        /* 低多边形图标容器 */
        .icon-poly {
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05));
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          flex-shrink: 0;
        }

        /* 浮动多边形 */
        .floating-poly {
          position: absolute;
          animation: floatPoly 6s ease-in-out infinite;
        }
        @keyframes floatPoly {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        /* 几何线条装饰 */
        .geo-line {
          position: absolute;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(116, 185, 255, 0.5), transparent);
        }
      `}</style>

      <div className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
        {/* 三角形图案背景 */}
        <div className="tri-pattern"></div>

        {/* 菱形装饰 */}
        <div className="diamond-bg" style={{ top: '10%', left: '5%' }}></div>
        <div className="diamond-bg" style={{ bottom: '10%', right: '5%' }}></div>

        {/* 浮动多边形 */}
        <div className="floating-poly poly-tri" style={{ top: '15%', right: '20%', animationDelay: '0s' }}></div>
        <div className="floating-poly poly-tri" style={{ bottom: '20%', left: '15%', animationDelay: '2s', transform: 'scale(0.7)' }}></div>

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
              className="text-center lowpoly-title"
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
                const color = polyColors[idx % polyColors.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: color.bg,
                      color: color.text,
                      padding: layout.cardPadding,
                      clipPath: 'polygon(0 8px, 8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px))',
                    }}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="icon-poly">
                        <span className="js-icon material-symbols-rounded" style={{ color: color.accent, fontSize: layout.iconSize }}>
                          {card.icon}
                        </span>
                      </div>
                      <h3 className={`js-title font-bold ${layout.titleSizeClass}`} style={{ color: color.text }}>
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-medium leading-relaxed ${layout.descSizeClass}`}
                      style={{ color: color.text }}
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


export const lowPoly3DTemplate: TemplateConfig = {
  id: 'lowPoly3D',
  name: '低多边形3D',
  description: '几何切面、轻量；适合解释型插画、游戏与科技视觉',
  icon: 'hexagon',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <LowPoly3D data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'lowPoly3D'),
};

export { LowPoly3D };
