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
 * ClaySoft3D 渲染组件
 * 软3D泛化风格 - 圆润软材质
 */
const THEME_COLORS = [
  { bg: '#ffe5ec', text: '#5c4046', accent: '#ff9eb5', shadow: '#e8c4d0' },
  { bg: '#e5f3ff', text: '#3d4a5c', accent: '#9ec5fe', shadow: '#c4d9ed' },
  { bg: '#fff5e5', text: '#5c4a3d', accent: '#ffd9b3', shadow: '#ede0c4' },
  { bg: '#e5ffe9', text: '#3d5c45', accent: '#b3ffc9', shadow: '#c4edb8' },
  { bg: '#f0e5ff', text: '#4a3d5c', accent: '#d9b3ff', shadow: '#d8c4ed' },
  { bg: '#fffbe5', text: '#5c5a3d', accent: '#fffab3', shadow: '#edeec4' },
];

interface ClaySoft3DProps {
  data: GeneratedContent;
  scale: number;
}

const ClaySoft3D: React.FC<ClaySoft3DProps> = ({ data, scale }) => {
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
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'Nunito', 'CustomPreviewFont', system-ui, sans-serif;
          background: linear-gradient(135deg, #fff5f8 0%, #f0f5ff 50%, #f5fff8 100%);
          color: #5c4046;
        }
        .clay-title {
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.1;
          text-shadow: 3px 3px 0 rgba(255,200,220,0.5);
        }
        .card-item {
          border-radius: 32px;
          position: relative;
          box-shadow:
            0 8px 24px rgba(0,0,0,0.08),
            0 2px 8px rgba(0,0,0,0.04),
            inset 0 -3px 10px rgba(0,0,0,0.05),
            inset 0 3px 10px rgba(255,255,255,0.8);
          transition: all 0.3s ease;
        }
        .card-item:hover {
          transform: translateY(-4px);
          box-shadow:
            0 16px 40px rgba(0,0,0,0.12),
            0 4px 12px rgba(0,0,0,0.06),
            inset 0 -3px 10px rgba(0,0,0,0.05),
            inset 0 3px 10px rgba(255,255,255,0.8);
        }
        /* 软3D高光效果 */
        .card-item::before {
          content: '';
          position: absolute;
          top: 8px;
          left: 8px;
          right: 8px;
          height: 20px;
          background: linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 100%);
          border-radius: 20px;
          pointer-events: none;
        }
                .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
                .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
                .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }

        .js-desc strong {
          font-weight: 700;
        }
        .js-desc code {
          background: rgba(255,255,255,0.6);
          padding: 0.2em 0.5em;
          border-radius: 12px;
          font-family: 'Courier New', monospace;
          font-size: 0.85em;
          font-weight: 600;
          box-shadow: inset 0 -2px 4px rgba(0,0,0,0.05), inset 0 2px 4px rgba(255,255,255,0.8);
        }
        .content-scale { transform-origin: center center; }

        /* 柔和装饰形状 */
        .soft-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.4;
          pointer-events: none;
        }
        .blob-1 {
          width: 400px;
          height: 400px;
          background: #ffccd5;
          top: -100px;
          right: -100px;
        }
        .blob-2 {
          width: 350px;
          height: 350px;
          background: #cce5ff;
          bottom: -80px;
          left: -80px;
        }
        .blob-3 {
          width: 300px;
          height: 300px;
          background: #d4ffb3;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        /* 软图标容器 */
        .icon-clay {
          width: 72px;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(145deg, rgba(255,255,255,0.9), rgba(255,255,255,0.4));
          border-radius: 24px;
          flex-shrink: 0;
          box-shadow:
            0 4px 12px rgba(0,0,0,0.08),
            inset 0 -2px 6px rgba(0,0,0,0.05),
            inset 0 2px 6px rgba(255,255,255,0.9);
        }

        /* 圆形装饰 */
        .circle-dot {
          position: absolute;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(145deg, rgba(255,255,255,0.8), rgba(255,255,255,0.3));
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
      `}</style>

      <div className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
        {/* 柔和装饰形状 */}
        <div className="soft-blob blob-1"></div>
        <div className="soft-blob blob-2"></div>
        <div className="soft-blob blob-3"></div>

        {/* 圆形点装饰 */}
        <div className="circle-dot" style={{ top: '15%', left: '10%' }}></div>
        <div className="circle-dot" style={{ top: '25%', left: '20%' }}></div>
        <div className="circle-dot" style={{ bottom: '30%', right: '12%' }}></div>
        <div className="circle-dot" style={{ bottom: '20%', right: '22%' }}></div>

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
              className="text-center clay-title"
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
                      color: color.text,
                      padding: layout.cardPadding
                    }}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="icon-clay">
                        <span 
                          className="js-icon material-symbols-rounded"
                          style={{ color: color.accent, fontSize: layout.iconSize }}
                        >
                          {card.icon}
                        </span>
                      </div>
                      <h3 
                        className={`js-title font-semibold ${layout.titleSizeClass}`}
                        style={{ color: color.text }}
                      >
                        {card.title}
                      </h3>
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
      
      {/* SSR Scripts */}
      <script dangerouslySetInnerHTML={{ __html: generateTitleFitScript(titleConfig) }} />
      <script dangerouslySetInnerHTML={{ __html: generateViewportFitScript() }} />
    </div>
  );
};

export const claySoft3DTemplate: TemplateConfig = {
  id: 'claySoft3D',
  name: '软3D',
  description: '圆润软材质；适合新手引导、亲和型品牌',
  icon: 'bubble_chart',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <ClaySoft3D data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'claySoft3D'),
};

export { ClaySoft3D };
