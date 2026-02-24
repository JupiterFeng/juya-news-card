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

interface PomoStyleProps {
  data: GeneratedContent;
  scale: number;
}

const PomoStyle: React.FC<PomoStyleProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const splashColors = [
    { bg: 'linear-gradient(135deg, #f5f3f0 0%, #e8e4dc 100%)', text: '#1a1a1a', accent: '#2d2d2d' },
    { bg: 'linear-gradient(135deg, #e8e4dc 0%, #d9d4c8 100%)', text: '#252525', accent: '#3a3a3a' },
    { bg: 'linear-gradient(135deg, #f0ebe3 0%, #e0d9cc 100%)', text: '#1f1f1f', accent: '#333333' },
    { bg: 'linear-gradient(135deg, #e2ddd3 0%, #d4cdbf 100%)', text: '#2a2a2a', accent: '#404040' },
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
      <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .pomo-container {
          font-family: 'Noto Serif SC', 'CustomPreviewFont', serif;
          background: linear-gradient(180deg, #e8e4dc 0%, #f5f3f0 50%, #e2ddd3 100%);
          color: #1a1a1a;
          position: relative;
          overflow: hidden;
        }
        .pomo-container::before {
          content: '';
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(ellipse, rgba(45,45,45,0.08) 0%, transparent 70%);
          top: -200px;
          left: -100px;
          border-radius: 50%;
          pointer-events: none;
        }
        .pomo-container::after {
          content: '';
          position: absolute;
          width: 500px;
          height: 500px;
          background: radial-gradient(ellipse, rgba(45,45,45,0.06) 0%, transparent 70%);
          bottom: -150px;
          right: -100px;
          border-radius: 50%;
          pointer-events: none;
        }
        .pomo-title {
          font-weight: 500;
          color: #1a1a1a;
          letter-spacing: 0.3em;
          line-height: 1.4;
          position: relative;
          z-index: 1;
        }
        .card-item {
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          position: relative;
          z-index: 1;
          overflow: hidden;
        }
        .card-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, transparent, rgba(45,45,45,0.3), transparent);
        }
        .card-item:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 16px 40px rgba(0,0,0,0.2);
        }
        .ink-wash {
          position: absolute;
          bottom: 15px;
          right: 15px;
          width: 50px;
          height: 50px;
          background: radial-gradient(ellipse, rgba(45,45,45,0.2) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }
        .content-scale {
          transform-origin: center center;
        }
      `}</style>

      <div className="pomo-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-20 box-border content-scale z-10"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}
        >
          <div className="flex flex-col items-center">
            <div style={{ width: '100px', height: '4px', background: 'linear-gradient(90deg, transparent, #3a3a3a, transparent)', marginBottom: '24px', borderRadius: '2px' }}></div>
            <h1 ref={titleRef} className="text-center pomo-title">
              {data.mainTitle}
            </h1>
            <div style={{ width: '100px', height: '4px', background: 'linear-gradient(90deg, transparent, #3a3a3a, transparent)', marginTop: '24px', borderRadius: '2px' }}></div>
          </div>

          <div className="card-zone flex-none w-full">
            <div
              data-card-zone="true"
              className="w-full flex flex-wrap justify-center content-start gap-6"
              style={{
                gap: layout.containerGap,
                '--container-gap': layout.containerGap,
                paddingLeft: cardZoneInsetX,
                paddingRight: cardZoneInsetX,
                maxWidth: cardZoneMaxWidth,
                margin: '0 auto',
                boxSizing: 'border-box',
              } as React.CSSProperties}
            >
              {data.cards.map((card, idx) => {
                const color = splashColors[idx % splashColors.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      background: color.bg,
                      borderRadius: '8px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)',
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="ink-wash"></div>
                    <div className="card-header flex items-center gap-3 mb-4">
                      <span className="js-icon material-symbols-rounded" style={{ color: color.accent, fontSize: layout.iconSize }}>
                        {card.icon}
                      </span>
                      <h3
                        className={`js-title font-medium leading-tight ${layout.titleSizeClass}`}
                        style={{ color: color.text, fontFamily: "'Noto Serif SC', serif", fontWeight: '500' }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
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


export const pomoStyleTemplate: TemplateConfig = {
  id: 'pomoStyle',
  name: '泼墨泼彩',
  description: '大水大墨、随机性强的泼墨风格，肌理丰富、气势扑面',
  icon: 'format_paint',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <PomoStyle data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'pomoStyle'),
};

export { PomoStyle };
