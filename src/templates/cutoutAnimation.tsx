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

interface CutoutAnimationProps {
  data: GeneratedContent;
  scale: number;
}

const CUTOUT_COLORS = [
  { bg: '#1a1a1a', text: '#ffffff', accent: '#e74c3c', paper: '#ecf0f1' },
  { bg: '#2c3e50', text: '#ecf0f1', accent: '#3498db', paper: '#ffffff' },
  { bg: '#8e44ad', text: '#ffffff', accent: '#f39c12', paper: '#f5f5f5' },
  { bg: '#27ae60', text: '#ffffff', accent: '#e74c3c', paper: '#ffffff' },
  { bg: '#d35400', text: '#ffffff', accent: '#1abc9c', paper: '#ecf0f1' },
];

const CutoutAnimation: React.FC<CutoutAnimationProps> = ({ data, scale }) => {
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
      <link href="https://fonts.googleapis.com/css2?family=Lobster&family=Roboto:wght@400;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .cutout-container {
          font-family: 'Lobster', 'CustomPreviewFont', cursive;
          background: linear-gradient(180deg, #2c2c2c 0%, #1a1a1a 100%);
          color: #ffffff;
          position: relative;
          overflow: hidden;
        }
        .cutout-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='38' y='0' width='4' height='80' fill='rgba(255,255,255,0.03)'/%3E%3Crect x='0' y='38' width='80' height='4' fill='rgba(255,255,255,0.03)'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .cutout-title {
          font-weight: 400;
          color: #ffffff;
          letter-spacing: '0.05em';
          line-height: 1.3;
          position: relative;
          z-index: 10;
          text-shadow: 3px 3px 0 rgba(0,0,0,0.5), 0 0 30px rgba(255,255,255,0.2);
          white-space: nowrap;
        }
        .card-item {
          transition: all 0.3s ease;
          position: relative;
          z-index: 5;
        }
        .card-item::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%);
          pointer-events: none;
          border-radius: 2px;
        }
        .card-item:hover {
          transform: translateY(-4px) rotate(1deg);
          box-shadow:
            0 4px 0 rgba(255,255,255,0.4),
            0 6px 0 rgba(0,0,0,0.3),
            0 16px 32px rgba(0,0,0,0.5) !important;
        }
        .paper-cut {
          position: absolute;
          pointer-events: none;
        }
        .cut-circle {
          width: 30px;
          height: 30px;
          background: rgba(255,255,255,0.1);
          border-radius: 50%;
          top: -10px;
          right: -10px;
          clip-path: polygon(0% 0%, 100% 0%, 100% 80%, 80% 100%, 0% 100%);
        }
        .cut-triangle {
          width: 0;
          height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-bottom: 18px solid rgba(255,255,255,0.15);
          bottom: 10px;
          left: 10px;
        }
        .fold-line {
          position: absolute;
          width: 80%;
          height: 1px;
          background: rgba(255,255,255,0.2);
          left: 10%;
          pointer-events: none;
        }
        .scissor-mark {
          position: absolute;
          width: 20px;
          height: 2px;
          background: linear-gradient(90deg, transparent 50%, rgba(255,255,255,0.3) 50%);
          bottom: -5px;
          right: 15px;
          pointer-events: none;
        }
        .content-scale {
          transform-origin: center center;
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
      `}</style>

      <div className="cutout-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-20 box-border content-scale z-10"
          style={{ 
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX,
            paddingRight: layout.wrapperPaddingX
          }}
        >
          <div className="flex flex-col items-center">
            <div className="paper-cut cut-circle"></div>
            <h1 
              ref={titleRef} 
              className="text-center cutout-title"
              style={{ fontSize: titleConfig.initialFontSize }}
            >
              {data.mainTitle}
            </h1>
            <div className="paper-cut cut-triangle"></div>
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
                const color = CUTOUT_COLORS[idx % CUTOUT_COLORS.length];
                return (
                  <div 
                    key={idx} 
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: color.bg,
                      borderRadius: '2px',
                      boxShadow: '0 2px 0 rgba(255,255,255,0.3), 0 4px 0 rgba(0,0,0,0.2), 0 8px 16px rgba(0,0,0,0.3)',
                      border: '3px solid rgba(255,255,255,0.15)',
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="fold-line" style={{ top: '30%' }}></div>
                    <div className="fold-line" style={{ top: '70%' }}></div>
                    <div className="scissor-mark"></div>
                    <div className="card-header flex items-center gap-3 mb-4">
                      <span 
                        className="js-icon material-symbols-rounded"
                        style={{ color: color.accent, fontSize: layout.iconSize, filter: 'drop-shadow(2px 2px 0 rgba(0,0,0,0.3))' }}
                      >
                        {card.icon}
                      </span>
                      <h3 
                        className={`js-title font-bold leading-tight ${layout.titleSizeClass}`}
                        style={{ color: color.text, fontFamily: "'Lobster', 'Georgia', serif" }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
                      style={{ color: color.text, opacity: 0.9 }}
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

export const cutoutAnimationTemplate: TemplateConfig = {
  id: 'cutoutAnimation',
  name: '剪影',
  description: '剪纸皮影效果的剪影动画风格，分层叠加与关节活动',
  icon: 'content_cut',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <CutoutAnimation data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'cutoutAnimation'),
};

export { CutoutAnimation };
