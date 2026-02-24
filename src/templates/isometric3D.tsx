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
 * Isometric3D 渲染组件
 * 等距3D UI风格 - 用等距空间讲产品结构
 */
interface Isometric3DProps {
  data: GeneratedContent;
  scale: number;
}

const Isometric3D: React.FC<Isometric3DProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const cardCount = data.cards.length;
  const layout = calculateStandardLayout(cardCount);
  const titleConfig = getStandardTitleConfig(cardCount, {
    titleConfigs: {
      '1-3': { initialFontSize: 100, minFontSize: 40 },
      '4': { initialFontSize: 90, minFontSize: 40 },
      '5-6': { initialFontSize: 80, minFontSize: 40 },
      '7-8': { initialFontSize: 70, minFontSize: 40 },
      '9+': { initialFontSize: 60, minFontSize: 40 }
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
      while(title.scrollWidth > 1650 && size > titleConfig.minFontSize && guard < 100) {
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
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'Inter', 'CustomPreviewFont', system-ui, sans-serif;
          background: linear-gradient(180deg, #e8f4f8 0%, #d0e8f0 100%);
          color: #2c3e50;
        }
        .iso-title {
          font-weight: 700;
          color: #2c3e50;
          letter-spacing: -0.02em;
          line-height: 1.1;
          text-shadow: 2px 2px 0 #ffffff, 4px 4px 0 rgba(0,0,0,0.1);
        }
        .card-item {
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.3s ease;
        }
        /* 等距3D效果 */
        .card-item::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 20px;
          background: linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.25));
          transform: skewX(-45deg);
          transform-origin: bottom left;
          border-radius: 0 0 4px 4px;
        }
        .card-item::after {
          content: '';
          position: absolute;
          bottom: 0;
          right: 0;
          width: 20px;
          height: 100%;
          background: linear-gradient(to left, rgba(0,0,0,0.1), rgba(0,0,0,0.2));
          transform: skewY(-45deg);
          transform-origin: bottom right;
          border-radius: 0 4px 4px 0;
        }
        .card-item:hover {
          transform: translateY(-4px);
        }
                .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
                .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
                .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }

        .js-desc strong {
          font-weight: 700;
        }
        .js-desc code {
          background: rgba(255,255,255,0.3);
          color: #ffffff;
          padding: 0.2em 0.5em;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.85em;
          font-weight: 600;
        }
        .content-scale { transform-origin: center center; }

        /* 等距网格背景 */
        .iso-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(30deg, rgba(74, 144, 226, 0.05) 12%, transparent 12.5%, transparent 87%, rgba(74, 144, 226, 0.05) 87.5%, rgba(74, 144, 226, 0.05)),
            linear-gradient(150deg, rgba(74, 144, 226, 0.05) 12%, transparent 12.5%, transparent 87%, rgba(74, 144, 226, 0.05) 87.5%, rgba(74, 144, 226, 0.05)),
            linear-gradient(30deg, rgba(74, 144, 226, 0.05) 12%, transparent 12.5%, transparent 87%, rgba(74, 144, 226, 0.05) 87.5%, rgba(74, 144, 226, 0.05)),
            linear-gradient(150deg, rgba(74, 144, 226, 0.05) 12%, transparent 12.5%, transparent 87%, rgba(74, 144, 226, 0.05) 87.5%, rgba(74, 144, 226, 0.05)),
            linear-gradient(60deg, rgba(80, 200, 120, 0.05) 25%, transparent 25.5%, transparent 75%, rgba(80, 200, 120, 0.05) 75%, rgba(80, 200, 120, 0.05)),
            linear-gradient(60deg, rgba(80, 200, 120, 0.05) 25%, transparent 25.5%, transparent 75%, rgba(80, 200, 120, 0.05) 75%, rgba(80, 200, 120, 0.05));
          background-size: 80px 140px;
          background-position: 0 0, 0 0, 40px 70px, 40px 70px, 0 0, 40px 70px;
          pointer-events: none;
        }

        /* 等距立方体装饰 */
        .iso-cube {
          position: absolute;
          width: 40px;
          height: 40px;
          transform-style: preserve-3d;
          transform: rotateX(-35deg) rotateY(45deg);
        }
        .cube-face {
          position: absolute;
          width: 40px;
          height: 40px;
          border: 1px solid rgba(74, 144, 226, 0.3);
        }
        .cube-front { transform: translateZ(20px); background: rgba(74, 144, 226, 0.1); }
        .cube-back { transform: rotateY(180deg) translateZ(20px); background: rgba(74, 144, 226, 0.05); }
        .cube-left { transform: rotateY(-90deg) translateZ(20px); background: rgba(61, 125, 196, 0.1); }
        .cube-right { transform: rotateY(90deg) translateZ(20px); background: rgba(91, 163, 245, 0.1); }
        .cube-top { transform: rotateX(90deg) translateZ(20px); background: rgba(91, 163, 245, 0.15); }
        .cube-bottom { transform: rotateX(-90deg) translateZ(20px); background: rgba(61, 125, 196, 0.15); }

        /* 浮动等距元素 */
        .floating-iso {
          position: absolute;
          animation: floatIso 4s ease-in-out infinite;
        }
        @keyframes floatIso {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }

        /* 图标容器 */
        .icon-iso {
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.2);
          border-radius: 12px;
          flex-shrink: 0;
          box-shadow: inset 0 2px 4px rgba(255,255,255,0.3);
        }
      `}</style>

      <div
        className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        {/* 等距网格背景 */}
        <div className="iso-grid"></div>

        {/* 浮动等距立方体装饰 */}
        <div className="floating-iso iso-cube" style={{ top: '15%', left: '10%', animationDelay: '0s' }}>
          <div className="cube-face cube-front"></div>
          <div className="cube-face cube-back"></div>
          <div className="cube-face cube-left"></div>
          <div className="cube-face cube-right"></div>
          <div className="cube-face cube-top"></div>
          <div className="cube-face cube-bottom"></div>
        </div>
        <div className="floating-iso iso-cube" style={{ bottom: '20%', right: '15%', animationDelay: '1s', transform: 'rotateX(-35deg) rotateY(45deg) scale(0.7)' }}>
          <div className="cube-face cube-front"></div>
          <div className="cube-face cube-back"></div>
          <div className="cube-face cube-left"></div>
          <div className="cube-face cube-right"></div>
          <div className="cube-face cube-top"></div>
          <div className="cube-face cube-bottom"></div>
        </div>

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
              className="text-center iso-title"
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
                const isoColors = [
                  { bg: '#4a90e2', top: '#5ba3f5', side: '#3d7dc4', text: '#ffffff', icon: '#ffffff' },
                  { bg: '#50c878', top: '#63d98a', side: '#42b366', text: '#ffffff', icon: '#ffffff' },
                  { bg: '#9b59b6', top: '#a86cc4', side: '#8e44ad', text: '#ffffff', icon: '#ffffff' },
                  { bg: '#f39c12', top: '#f5b041', side: '#e67e22', text: '#ffffff', icon: '#ffffff' },
                  { bg: '#e74c3c', top: '#ec7063', side: '#cb4335', text: '#ffffff', icon: '#ffffff' },
                  { bg: '#1abc9c', top: '#29d3b5', side: '#17a589', text: '#ffffff', icon: '#ffffff' },
                ];
                const color = isoColors[idx % isoColors.length];

                return (
                  <div key={idx} className={`card-item flex flex-col ${layout.cardWidthClass}`} style={{
                    backgroundColor: color.bg,
                    backgroundImage: `
                      linear-gradient(to bottom, ${color.top} 0%, ${color.bg} 30%, ${color.side} 100%)
                    `,
                    padding: layout.cardPadding,
                    paddingBottom: cardCount <= 3 ? '3.5rem' : (cardCount <= 6 ? '3rem' : '2.5rem')
                  }}>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="icon-iso">
                        <span className="js-icon material-symbols-rounded" style={{ color: color.icon, fontSize: layout.iconSize }}>{card.icon}</span>
                      </div>
                      <h3 className={`js-title font-semibold ${layout.titleSizeClass}`} style={{ color: color.text }}>{card.title}</h3>
                    </div>
                    <p
                      className={`js-desc font-medium leading-relaxed ${layout.descSizeClass}`}
                      style={{ color: color.text }}
                      dangerouslySetInnerHTML={{ __html: card.desc }}
                    />
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

export const isometric3DTemplate: TemplateConfig = {
  id: 'isometric3D',
  name: '等距3D',
  description: '用等距空间讲产品结构；适合 B 端方案、系统架构展示',
  icon: 'view_in_ar',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <Isometric3D data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'isometric3D'),
};

export { Isometric3D };
