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

/**
 * Deconstructivism 渲染组件
 * 解构主义：打破秩序，错位切割，隐藏秩序下的视觉张力
 */
interface DeconstructivismProps {
  data: GeneratedContent;
  scale: number;
}

const DECONSTRUCT_COLORS = [
  { bg: '#1A1A1A', onBg: '#FFFFFF', accent: '#FF3B30' }, // 高对比红黑
  { bg: '#000000', onBg: '#F5F5F5', accent: '#FFD60A' }, // 黑黄对比
  { bg: '#2C2C2C', onBg: '#FFFFFF', accent: '#32ADE6' }, // 黑蓝对比
  { bg: '#121212', onBg: '#E0E0E0', accent: '#FF2D55' }, // 深黑粉红
];

const TILT_ANGLES = ['-1deg', '1deg', '-0.5deg', '0.5deg', '1.5deg', '-1.5deg', '-2deg', '2deg'];

const Deconstructivism: React.FC<DeconstructivismProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const N = data?.cards?.length || 0;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);

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
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Noto+Sans+SC:wght@400;700;900&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'Inter', 'Noto Sans SC', 'CustomPreviewFont', system-ui, sans-serif;
          background-color: #0A0A0A;
          color: #FFFFFF;
          background-image: linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px),
                            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .deconstruct-title {
          font-weight: 900;
          color: #FFFFFF;
          letter-spacing: -0.04em;
          line-height: 0.95;
          text-transform: uppercase;
          transform: rotate(-0.5deg);
          white-space: nowrap;
        }
        .card-item {
          border: 2px solid rgba(255,255,255,0.1);
          transition: all 0.2s ease;
        }
        .card-item:hover {
          transform: scale(1.02) rotate(0deg) !important;
          box-shadow: 12px 12px 0 currentColor, 16px 16px 32px rgba(0,0,0,0.4) !important;
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
            paddingLeft: layout.wrapperPaddingX,
            paddingRight: layout.wrapperPaddingX
          }}
        >
          {/* 标题区域 */}
          <div className="flex flex-col items-center w-full">
            <h1
              ref={titleRef}
              className="text-center deconstruct-title w-full"
              style={{ fontSize: titleConfig.initialFontSize }}
            >
              {data.mainTitle}
            </h1>
          </div>

          {/* 卡片区域 */}
          <div className="card-zone flex-none w-full">
            <div
              className="w-full flex flex-wrap justify-center content-center"
              style={{ 
                gap: layout.containerGap,
                '--container-gap': layout.containerGap
              } as React.CSSProperties}
            >
              {data.cards.map((card, idx) => {
                const color = DECONSTRUCT_COLORS[idx % DECONSTRUCT_COLORS.length];
                const tilt = TILT_ANGLES[idx % TILT_ANGLES.length];
                return (
                  <div 
                    key={idx} 
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: color.bg,
                      borderRadius: '2px',
                      boxShadow: `8px 8px 0 ${color.accent}, 12px 12px 24px rgba(0,0,0,0.3)`,
                      transform: `rotate(${tilt})`,
                      padding: layout.cardPadding,
                      color: color.accent, // 用于 hover 时的 boxShadow currentColor
                    }}
                  >
                    <div className="card-header flex items-center gap-4 mb-4">
                      <span 
                        className="js-icon material-symbols-rounded"
                        style={{ color: color.accent, fontSize: layout.iconSize }}
                      >
                        {card.icon}
                      </span>
                      <h3 
                        className={`js-title font-bold leading-tight ${layout.titleSizeClass}`}
                        style={{ 
                          color: color.onBg, 
                          fontFamily: "'Inter', 'Noto Sans SC', system-ui, sans-serif",
                          letterSpacing: '-0.03em',
                          textTransform: 'uppercase'
                        }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
                      style={{ 
                        color: color.onBg, 
                        opacity: 0.9,
                        fontFamily: "'Inter', 'Noto Sans SC', system-ui, sans-serif"
                      }}
                      dangerouslySetInnerHTML={{ __html: card.desc }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{
        __html: `
          ${generateTitleFitScript(titleConfig)}
          ${generateViewportFitScript()}
        `
      }} />
    </div>
  );
};

export const deconstructivismTemplate: TemplateConfig = {
  id: 'deconstructivism',
  name: '解构主义',
  description: '解构主义风格：打破秩序，错位切割，隐藏秩序下的视觉张力',
  icon: 'layers_clear',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <Deconstructivism data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'deconstructivism'),
};

export { Deconstructivism };
