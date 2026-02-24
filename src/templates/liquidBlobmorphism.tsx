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
 * LiquidBlobmorphism 渲染组件
 * 液态/有机团块风格：有机blob形状、渐变填充、流动感
 */
interface LiquidBlobmorphismProps {
  data: GeneratedContent;
  scale: number;
}

// 液态渐变配色
const LIQUID_COLORS = [
  { from: '#667eea', to: '#764ba2', glow: 'rgba(102, 126, 234, 0.5)' },
  { from: '#f093fb', to: '#f5576c', glow: 'rgba(240, 147, 251, 0.5)' },
  { from: '#4facfe', to: '#00f2fe', glow: 'rgba(79, 172, 254, 0.5)' },
  { from: '#43e97b', to: '#38f9d7', glow: 'rgba(67, 233, 123, 0.5)' },
  { from: '#fa709a', to: '#fee140', glow: 'rgba(250, 112, 154, 0.5)' },
  { from: '#a8edea', to: '#fed6e3', glow: 'rgba(168, 237, 234, 0.5)' },
  { from: '#ff9a9e', to: '#fecfef', glow: 'rgba(255, 154, 158, 0.5)' },
  { from: '#a18cd1', to: '#fbc2eb', glow: 'rgba(161, 140, 209, 0.5)' },
];

// Blob形状（不规则的border-radius）
const BLOB_SHAPES = [
  '60% 40% 30% 70% / 60% 30% 70% 40%',
  '30% 70% 70% 30% / 30% 30% 70% 70%',
  '50% 50% 30% 70% / 50% 70% 30% 50%',
  '70% 30% 50% 50% / 30% 50% 70% 50%',
  '40% 60% 60% 40% / 60% 40% 60% 40%',
  '55% 45% 35% 65% / 45% 55% 65% 35%',
  '65% 35% 45% 55% / 35% 65% 55% 45%',
  '45% 55% 65% 35% / 55% 45% 35% 65%',
];

const LiquidBlobmorphism: React.FC<LiquidBlobmorphismProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const cardCount = data.cards.length;
  const layout = calculateStandardLayout(cardCount);
  const titleConfig = {
    ...getStandardTitleConfig(cardCount),
    initialFontSize: cardCount <= 3 ? 76 : 60,
    minFontSize: 38,
  };

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
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .liquid-container {
          font-family: 'CustomPreviewFont', 'Quicksand', 'Nunito', system-ui, -apple-system, sans-serif;
        }
        .liquid-title {
          font-weight: 800;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          background-size: 300% 300%;
          animation: gradient-shift 8s ease infinite;
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .text-xs { font-size: 0.75rem; line-height: 1rem; }
        .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
        .text-base { font-size: 1rem; line-height: 1.5rem; }
        .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
        .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
        .text-2xl { font-size: 1.5rem; line-height: 2rem; }
        .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
        .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
        .text-5xl { font-size: 3rem; line-height: 1; }
        .text-6xl { font-size: 3.75rem; line-height: 1; }
        .text-7xl { font-size: 4.5rem; line-height: 1; }
        .text-8xl { font-size: 6rem; line-height: 1; }
        .text-9xl { font-size: 8rem; line-height: 1; }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .blob-card {
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          transition: all 0.4s ease;
        }
        .blob-card::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .blob-card:hover::before {
          opacity: 1;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          position: relative;
          z-index: 1;
        }
        .js-desc {
          line-height: 1.5;
          font-weight: 500;
          position: relative;
          z-index: 1;
        }
        .js-desc code {
          background: rgba(255,255,255,0.25);
          color: #FFF;
          padding: 0.15em 0.45em;
          border-radius: 8px;
          font-family: monospace;
          font-size: 0.9em;
          font-weight: 600;
        }
        .js-desc strong {
          font-weight: 700;
          color: #FFF;
        }
        /* 液态背景 */
        .liquid-bg {
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #1e3c72 100%);
          position: relative;
        }
        .liquid-bg::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background:
            radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(240, 147, 251, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(79, 172, 254, 0.2) 0%, transparent 40%);
          pointer-events: none;
        }
      `}</style>

      <div className="liquid-container liquid-bg relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
        <div
          ref={wrapperRef}
          className="content-wrapper relative z-10 w-full flex flex-col items-center box-border"
          style={{ 
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined
          }}
        >
          {/* 标题区域 */}
          <div className="title-zone flex-none flex items-center justify-center">
            <h1
              ref={titleRef}
              className={`liquid-title text-center js-title-text ${layout.titleSizeClass}`}
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
                const colors = LIQUID_COLORS[idx % LIQUID_COLORS.length];
                const shape = BLOB_SHAPES[idx % BLOB_SHAPES.length];
                return (
                  <div 
                    key={idx} 
                    className={`card-item blob-card ${layout.cardWidthClass}`}
                    style={{
                      background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
                      borderRadius: shape,
                      padding: layout.cardPadding,
                      boxShadow: `0 20px 60px ${colors.glow}, 0 10px 30px rgba(0,0,0,0.1)`,
                    }}
                  >
                    <div className="card-header">
                      <h3 
                        className={`js-title font-bold ${layout.titleSizeClass}`}
                        style={{ color: '#FFF' }}
                      >
                        {card.title}
                      </h3>
                      <span 
                        className="js-icon material-symbols-rounded"
                        style={{ fontSize: layout.iconSize, color: 'rgba(255,255,255,0.95)' }}
                      >
                        {card.icon}
                      </span>
                    </div>
                    <p
                      className={`js-desc ${layout.descSizeClass}`}
                      style={{ color: 'rgba(255,255,255,0.9)', lineHeight: '1.5' }}
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

/**
 * LiquidBlobmorphism 模板配置
 */
export const liquidBlobmorphismTemplate: TemplateConfig = {
  id: 'liquidBlobmorphism',
  name: '液态有机风格',
  description: '有机blob形状、渐变填充的流动设计',
  icon: 'bubble_chart',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <LiquidBlobmorphism data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'liquidBlobmorphism'),
};

// 导出组件供下载模板使用
export { LiquidBlobmorphism };
