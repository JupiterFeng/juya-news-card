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
 * GrainNoise 渲染组件
 * 颗粒噪点风格：噪点纹理、渐变背景、科技感
 */
interface GrainNoiseProps {
  data: GeneratedContent;
  scale: number;
}

// 科技感配色方案
const TECH_COLORS = [
  { from: '#667eea', to: '#764ba2', accent: '#A78BFA' },  // Purple
  { from: '#f093fb', to: '#f5576c', accent: '#F472B6' },  // Pink
  { from: '#4facfe', to: '#00f2fe', accent: '#38BDF8' },  // Blue
  { from: '#43e97b', to: '#38f9d7', accent: '#34D399' },  // Green
  { from: '#fa709a', to: '#fee140', accent: '#FBBF24' },  // Orange
  { from: '#a8edea', to: '#fed6e3', accent: '#5EEAD4' },  // Teal
  { from: '#ff9a9e', to: '#fecfef', accent: '#FDA4AF' },  // Rose
  { from: '#ffecd2', to: '#fcb69f', accent: '#FDBA74' },  // Peach
];

const GrainNoise: React.FC<GrainNoiseProps> = ({ data, scale }) => {
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
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .grain-container {
          font-family: 'CustomPreviewFont', 'Inter', system-ui, -apple-system, sans-serif;
        }
        .grain-title {
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #FFF;
          text-shadow: 0 2px 20px rgba(0,0,0,0.3);
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
        .grain-card {
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
        }
        .grain-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.08;
          pointer-events: none;
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
          background: rgba(0,0,0,0.2);
          color: #FFF;
          padding: 0.15em 0.4em;
          border-radius: 6px;
          font-family: monospace;
          font-size: 0.9em;
          font-weight: 600;
        }
        .js-desc strong {
          font-weight: 700;
          color: #FFF;
        }
        .noise-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.04;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          z-index: 0;
        }
      `}</style>

      <div
        className="grain-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
        }}
      >
        <div className="noise-overlay" />

        <div
          ref={wrapperRef}
          className="content-wrapper relative z-10 w-full flex flex-col items-center box-border"
          style={{ 
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined
          }}
        >
          <div className="title-zone flex-none flex items-center justify-center">
            <h1
              ref={titleRef}
              className={`grain-title text-center ${layout.titleSizeClass}`}
            >
              {data.mainTitle}
            </h1>
          </div>

          <div className="card-zone flex-none w-full">
            <div
              className="w-full flex flex-wrap justify-center content-center"
              style={{ 
                gap: layout.containerGap,
                '--container-gap': layout.containerGap
              } as React.CSSProperties}
            >
              {data.cards.map((card, idx) => {
                const colors = TECH_COLORS[idx % TECH_COLORS.length];
                return (
                  <div 
                    key={idx} 
                    className={`card-item grain-card ${layout.cardWidthClass}`}
                    style={{ 
                      background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
                      padding: layout.cardPadding
                    }}
                  >
                    <div className="card-header">
                      <h3 
                        className={`js-title font-bold ${layout.titleSizeClass}`}
                        style={{ color: '#FFF' }}
                      >{card.title}</h3>
                      <span 
                        className="js-icon material-symbols-rounded"
                        style={{ fontSize: layout.iconSize, color: 'rgba(255,255,255,0.95)' }}
                      >{card.icon}</span>
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
      <script dangerouslySetInnerHTML={{ __html: generateTitleFitScript(titleConfig) }} />
      <script dangerouslySetInnerHTML={{ __html: generateViewportFitScript() }} />
    </div>
  );
};

import { generateDownloadableHtml } from '../utils/template';

/**
 * GrainNoise 模板配置
 */
export const grainNoiseTemplate: TemplateConfig = {
  id: 'grainNoise',
  name: '颗粒噪点风格',
  description: '噪点纹理叠加渐变，科技感十足',
  icon: 'grain',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <GrainNoise data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'grainNoise'),
};

export { GrainNoise };
