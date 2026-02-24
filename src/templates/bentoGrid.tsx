import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import { generateDownloadableHtml } from '../utils/template';
import {
    generateTitleFitScript,
    generateViewportFitScript,
    calculateStandardLayout,
    getStandardTitleConfig,
} from '../utils/layout-calculator';

/**
 * BentoGrid 渲染组件
 * 便当格/卡片矩阵风格：模块化网格、强边框、Apple/Linear风格
 */
interface BentoGridProps {
  data: GeneratedContent;
  scale: number;
}

const BENTO_COLORS = [
    { bg: '#F5F5F7', border: '#E5E5E7', accent: '#0071E3' },  // Apple gray
    { bg: '#E8F4FD', border: '#D1E9F8', accent: '#0071E3' },  // Light blue
    { bg: '#F0F8FF', border: '#D9E8F5', accent: '#5AC8FA' },  // Sky
    { bg: '#FFF5F5', border: '#FFE8E8', accent: '#FF3B30' },  // Light red
    { bg: '#F5FFF8', border: '#E0F8E8', accent: '#34C759' },  // Light green
    { bg: '#FFF9F5', border: '#FFF0E8', accent: '#FF9500' },  // Light orange
    { bg: '#F8F5FF', border: '#EEE8FF', accent: '#AF52DE' },  // Light purple
    { bg: '#FFFBF0', border: '#FFF5D9', accent: '#FFCC00' },  // Light yellow
];

const BentoGrid: React.FC<BentoGridProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const N = data.cards.length;
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

  // Bento Grid 布局逻辑
  const getContainerStyle = (): React.CSSProperties => {
    if (N === 1) return { display: 'flex', justifyContent: 'center', gap: layout.containerGap };
    if (N <= 4) return {
      display: 'grid',
      gridTemplateColumns: N === 2 ? '1fr 1fr' : 'repeat(2, 1fr)',
      gridAutoRows: 'minmax(200px, auto)',
      gap: layout.containerGap
    };
    return {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gridAutoRows: 'minmax(180px, auto)',
      gap: layout.containerGap
    };
  };

  const getCardStyle = (idx: number): React.CSSProperties => {
    const style: React.CSSProperties = {};
    if (idx === 0 && N > 2 && N <= 6) {
      if (N === 4) {
        style.gridColumn = 'span 2';
        style.gridRow = 'span 2';
      }
    }
    if (idx === 0 && N > 6) {
      style.gridColumn = 'span 2';
      style.gridRow = 'span 2';
    }
    return style;
  };

  return (
    <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', overflow: 'hidden' }}>
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .bento-grid-container {
          font-family: 'CustomPreviewFont', -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', system-ui, sans-serif;
          background-color: #FAFAFC;
        }
        .bento-grid-title {
          font-weight: 600;
          letter-spacing: -0.02em;
          color: #1D1D1F;
          white-space: nowrap;
        }
        .card-item {
          position: relative;
          overflow: hidden;
          border-radius: 20px;
          transition: all 0.3s ease;
        }
        .card-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,0,0,0.05), transparent);
        }
        .card-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
          height: 100%;
        }
        .card-icon-wrapper {
          width: fit-content;
          padding: 12px;
          border-radius: 12px;
          background: rgba(255,255,255,0.8);
        }
        .desc-text code {
          background: rgba(0,0,0,0.06);
          color: #1D1D1F;
          padding: 0.15em 0.4em;
          border-radius: 6px;
          font-family: 'SF Mono', monospace;
          font-size: 0.9em;
          font-weight: 500;
        }
        .desc-text strong {
          font-weight: 600;
          color: #1D1D1F;
        }

        .text-5-5xl { font-size: 3.375rem; line-height: 1.1; }
        .text-4-5xl { font-size: 2.625rem; line-height: 1.2; }
        .text-3-5xl { font-size: 2.0625rem; line-height: 1.3; }
        .text-2-5xl { font-size: 1.8125rem; line-height: 1.4; }
        
        .text-6xl { font-size: 3.75rem; line-height: 1; }
        .text-5xl { font-size: 3rem; line-height: 1; }
        .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
        .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
        .text-2xl { font-size: 1.5rem; line-height: 2rem; }
        .text-xl  { font-size: 1.25rem; line-height: 1.75rem; }
        .text-lg  { font-size: 1.125rem; line-height: 1.75rem; }
        .text-base { font-size: 1rem; line-height: 1.5rem; }
        .text-sm { font-size: 0.875rem; line-height: 1.25rem; }

        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }

        .content-scale { transform-origin: center center; }
      `}</style>

      <div
        className="bento-grid-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-20 box-border content-scale"
          style={{ 
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined
          }}
        >
          {/* 标题区域 */}
          <div className="title-zone flex-none w-full">
            <div className="max-w-4xl mx-auto text-center">
              <h1
                ref={titleRef}
                className={`bento-grid-title ${layout.titleSizeClass}`}
                style={{ fontSize: titleConfig.initialFontSize }}
              >
                {data.mainTitle}
              </h1>
            </div>
          </div>

          {/* 卡片区域 */}
          <div className="card-zone flex-none w-full">
            <div
              className="w-full max-w-7xl mx-auto"
              style={{
                ...getContainerStyle(),
                '--container-gap': layout.containerGap
              } as React.CSSProperties}
            >
              {data.cards.map((card, idx) => {
                const colorScheme = BENTO_COLORS[idx % BENTO_COLORS.length];
                const cardStyle = getCardStyle(idx);
                return (
                  <div 
                    key={idx} 
                    className="card-item"
                    style={{
                      ...cardStyle,
                      backgroundColor: colorScheme.bg,
                      border: `1px solid ${colorScheme.border}`,
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="card-content">
                      <div className="card-icon-wrapper">
                        <span 
                          className="material-symbols-rounded"
                          style={{
                            fontSize: layout.iconSize,
                            color: colorScheme.accent
                          }}
                        >
                          {card.icon}
                        </span>
                      </div>
                      <div>
                        <h3 
                          className={`font-semibold ${layout.titleSizeClass}`}
                          style={{ color: '#1D1D1F', marginBottom: '8px' }}
                        >
                          {card.title}
                        </h3>
                        <p
                          className={`desc-text ${layout.descSizeClass}`}
                          style={{
                            color: '#6E6E73',
                            lineHeight: '1.5'
                          }}
                          dangerouslySetInnerHTML={{ __html: card.desc }}
                        />
                      </div>
                    </div>
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

/**
 * BentoGrid 模板配置
 */
export const bentoGridTemplate: TemplateConfig = {
  id: 'bentoGrid',
  name: '便当格风格',
  description: '模块化网格布局，强调整洁分区与信息分层',
  icon: 'grid_view',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <BentoGrid data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'bentoGrid'),
};

export { BentoGrid };
