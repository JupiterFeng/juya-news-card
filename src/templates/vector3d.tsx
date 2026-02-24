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
 * Vector3D 渲染组件
 * 矢量感3D图标风格 - 3D 但干净，形体清晰
 */
interface Vector3DProps {
  data: GeneratedContent;
  scale: number;
}

const Vector3D: React.FC<Vector3DProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const vectorColors = [
    { bg: '#ffffff', text: '#1a1a2e', accent: '#6366f1', border: '#e5e7eb' },
    { bg: '#ffffff', text: '#1a1a2e', accent: '#8b5cf6', border: '#e5e7eb' },
    { bg: '#ffffff', text: '#1a1a2e', accent: '#06b6d4', border: '#e5e7eb' },
    { bg: '#ffffff', text: '#1a1a2e', accent: '#10b981', border: '#e5e7eb' },
    { bg: '#ffffff', text: '#1a1a2e', accent: '#f59e0b', border: '#e5e7eb' },
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
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'Inter', 'CustomPreviewFont', system-ui, sans-serif;
          background: #f8fafc;
          color: #1a1a2e;
        }
        .vector-title {
          font-weight: 700;
          color: '#1a1a2e';
          letter-spacing: -0.03em;
          line-height: 1.1;
        }
        .card-item {
          border-radius: 16px;
          position: relative;
          overflow: hidden;
          box-shadow:
            0 1px 3px rgba(0,0,0,0.04),
            0 4px 12px rgba(0,0,0,0.03);
          transition: all 0.2s ease;
        }
        .card-item:hover {
          box-shadow:
            0 2px 6px rgba(0,0,0,0.06),
            0 8px 24px rgba(0,0,0,0.04);
        }
        /* 矢量3D深度效果 */
        .card-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 100%;
          background: linear-gradient(135deg, rgba(255,255,255,0.8) 0%, transparent 50%, rgba(0,0,0,0.02) 100%);
          pointer-events: none;
        }
                .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
                .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
                .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }

        .js-desc strong {
          font-weight: 600;
          color: #6366f1;
        }
        .js-desc code {
          background: #f1f5f9;
          color: '#6366f1';
          padding: 0.15em 0.4em;
          border-radius: 6px;
          font-family: 'SF Mono', 'Menlo', monospace;
          font-size: 0.9em;
          font-weight: 500;
        }
        .content-scale { transform-origin: center center; }

        /* 网格背景 */
        .vector-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(to right, rgba(99, 102, 241, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        /* 矢量3D图标容器 */
        .icon-vector-3d {
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          flex-shrink: 0;
        }
        /* 3D层叠效果 */
        .icon-vector-3d::before,
        .icon-vector-3d::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 14px;
          background: inherit;
        }
        .icon-vector-3d::before {
          transform: translate(2px, 2px);
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          opacity: 0.15;
          z-index: -1;
        }
        .icon-vector-3d::after {
          transform: translate(4px, 4px);
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          opacity: 0.08;
          z-index: -2;
        }

        /* SDF风格装饰 */
        .sdf-shape {
          position: absolute;
          opacity: 0.05;
          pointer-events: none;
        }
        .sdf-circle {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle, #6366f1 0%, transparent 70%);
        }
        .sdf-square {
          width: 150px;
          height: 150px;
          background: linear-gradient(135deg, #8b5cf6 0%, transparent 100%);
          border-radius: 20px;
        }

        /* 矢量路径装饰 */
        .vector-path {
          position: absolute;
          stroke: rgba(99, 102, 241, 0.1);
          stroke-width: 2;
          fill: none;
          pointer-events: none;
        }

        /* 动画浮动 */
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .floating {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>

      <div className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
        {/* 网格背景 */}
        <div className="vector-grid"></div>

        {/* SDF风格装饰 */}
        <div className="sdf-shape sdf-circle" style={{ top: '10%', right: '15%' }}></div>
        <div className="sdf-shape sdf-square" style={{ bottom: '15%', left: '10%' }}></div>

        {/* 浮动元素 */}
        <div className="floating" style={{ position: 'absolute', top: '20%', left: '8%' }}>
          <svg width="60" height="60" viewBox="0 0 60 60" className="vector-path">
            <circle cx="30" cy="30" r="25" />
          </svg>
        </div>
        <div className="floating" style={{ position: 'absolute', bottom: '25%', right: '12%', animationDelay: '1s' }}>
          <svg width="80" height="80" viewBox="0 0 80 80" className="vector-path">
            <rect x="10" y="10" width="60" height="60" rx="10" />
          </svg>
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
              className="text-center vector-title"
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
                const color = vectorColors[idx % vectorColors.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: color.bg,
                      color: color.text,
                      border: `1px solid ${color.border}`,
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="icon-vector-3d">
                        <span
                          className="js-icon material-symbols-rounded"
                          style={{ position: 'relative', zIndex: 1, color: color.accent, fontSize: layout.iconSize }}
                        >
                          {card.icon}
                        </span>
                      </div>
                      <h3 className={`js-title font-semibold ${layout.titleSizeClass}`} style={{ color: color.text }}>
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-medium leading-relaxed ${layout.descSizeClass}`}
                      style={{ color: color.text, opacity: '0.8' }}
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


export const vector3DTemplate: TemplateConfig = {
  id: 'vector3D',
  name: '矢量3D',
  description: '"3D 但干净"，形体清晰；适合 SaaS、AI 产品的图标体系',
  icon: 'vector_square',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <Vector3D data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'vector3D'),
};

export { Vector3D };
