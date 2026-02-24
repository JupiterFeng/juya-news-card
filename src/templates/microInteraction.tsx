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

interface MicroInteractionProps {
  data: GeneratedContent;
  scale: number;
}

const MicroInteraction: React.FC<MicroInteractionProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const microColors = [
    { bg: '#ffffff', text: '#1a1a2e', accent: '#6366f1' },
    { bg: '#ffffff', text: '#1a1a2e', accent: '#8b5cf6' },
    { bg: '#ffffff', text: '#1a1a2e', accent: '#ec4899' },
    { bg: '#ffffff', text: '#1a1a2e', accent: '#14b8a6' },
    { bg: '#ffffff', text: '#1a1a2e', accent: '#f59e0b' },
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
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'Nunito', 'CustomPreviewFont', system-ui, sans-serif;
          background: linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #fff5f5 100%);
          color: #1a1a2e;
        }
        .micro-title {
          font-weight: 800;
          color: #1a1a2e;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }
        @keyframes titlePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        .micro-title {
          animation: titlePulse 3s ease-in-out infinite;
        }
        .card-item {
          border-radius: 20px;
          border: 2px solid rgba(99, 102, 241, 0.1);
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }
        .card-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(99, 102, 241, 0.2);
        }
        @keyframes iconBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .js-icon {
          animation: iconBounce 2s ease-in-out infinite;
        }
        .card-item:nth-child(1) .js-icon { animation-delay: 0s; }
        .card-item:nth-child(2) .js-icon { animation-delay: 0.2s; }
        .card-item:nth-child(3) .js-icon { animation-delay: 0.4s; }
        .card-item:nth-child(4) .js-icon { animation-delay: 0.6s; }
        .card-item:nth-child(5) .js-icon { animation-delay: 0.8s; }
        .card-item:nth-child(6) .js-icon { animation-delay: 1s; }

        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }

        .js-desc strong {
          font-weight: 700;
          color: #6366f1;
        }
        .js-desc code {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #ffffff;
          padding: 0.2em 0.5em;
          border-radius: 8px;
          font-family: 'Courier New', monospace;
          font-size: 0.85em;
          font-weight: 600;
        }
        .content-scale { transform-origin: center center; }

        .ripple {
          position: absolute;
          border-radius: 50%;
          background: rgba(99, 102, 241, 0.1);
          animation: rippleEffect 2s ease-out infinite;
        }
        @keyframes rippleEffect {
          0% { width: 0; height: 0; opacity: 0.5; }
          100% { width: 200px; height: 200px; opacity: 0; }
        }

        .progress-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
          animation: progressAnim 2s ease-in-out infinite;
        }
        @keyframes progressAnim {
          0% { width: 0%; left: 0; }
          50% { width: 100%; left: 0; }
          100% { width: 0%; left: 100%; }
        }

        .icon-circle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
          flex-shrink: 0;
        }
      `}</style>

      <div
        ref={mainRef}
        className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-20 box-border content-scale relative z-10"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}
        >
          <div className="title-zone flex-none flex items-center justify-center w-full">
            <h1 ref={titleRef} className="text-center micro-title">
              {data.mainTitle}
            </h1>
          </div>

          <div className="card-zone flex-none w-full">
            <div
              data-card-zone="true"
              className="w-full flex flex-wrap justify-center content-center"
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
                const color = microColors[idx % microColors.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: color.bg,
                      borderColor: `${color.accent}20`,
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="ripple" style={{ top: '20px', right: '20px' }}></div>

                    <div className="flex items-start gap-4 mb-4">
                      <div className="icon-circle">
                        <span className="js-icon material-symbols-rounded" style={{ color: color.accent, fontSize: layout.iconSize }}>
                          {card.icon}
                        </span>
                      </div>
                      <h3 className={`js-title font-semibold ${layout.titleSizeClass}`} style={{ color: color.text }}>
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
                      style={{ color: color.text, opacity: '0.8' }}
                      dangerouslySetInnerHTML={{ __html: autoAddSpaceToHtml(card.desc) }}
                    />

                    <div className="progress-bar" style={{ animationDelay: `${idx * 0.2}s` }}></div>
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

export const microInteractionTemplate: TemplateConfig = {
  id: 'microInteraction',
  name: '微交互',
  description: '强反馈（hover/press/loading）、轻量愉悦；适合 ToC 产品、工具类体验提升',
  icon: 'touch_app',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <MicroInteraction data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'microInteraction'),
};

export { MicroInteraction };
