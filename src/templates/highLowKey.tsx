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

interface HighLowKeyProps {
  data: GeneratedContent;
  scale: number;
}

const HighLowKey: React.FC<HighLowKeyProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

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
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Space+Grotesk:wght@400;500;600;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'Inter', 'CustomPreviewFont', system-ui, sans-serif;
          background: linear-gradient(180deg, #e8e8e8 0%, #f5f5f5 50%, #e0e0e0 100%);
          color: #1a1a1a;
        }
        .key-title {
          font-family: 'Space Grotesk', 'CustomPreviewFont', sans-serif;
          font-weight: 600;
          color: #1a1a1a;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }
        .card-item {
          border-radius: 12px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .card-item:nth-child(odd) {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        .card-item:nth-child(even) {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }

        .card-item:nth-child(odd) .js-desc strong {
          color: #1a1a1a;
          font-weight: 600;
        }
        .card-item:nth-child(odd) .js-desc code {
          background: rgba(0,0,0,0.08);
          padding: 0.1em 0.4em;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
          color: #1a1a1a;
        }
        .card-item:nth-child(even) .js-desc strong {
          color: #e5e5e5;
          font-weight: 600;
        }
        .card-item:nth-child(even) .js-desc code {
          background: rgba(255,255,255,0.1);
          padding: 0.1em 0.4em;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
          color: #c4b5fd;
        }
        .content-scale { transform-origin: center center; }

        .light-glow {
          position: absolute;
          width: 60%;
          height: 60%;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.2;
          pointer-events: none;
        }
        .glow-high {
          top: -10%;
          right: -10%;
          background: rgba(255, 255, 255, 0.8);
        }
        .glow-low {
          bottom: -10%;
          left: -10%;
          background: rgba(139, 92, 246, 0.15);
        }

        .gradient-divider {
          position: absolute;
          width: 100%;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(0, 0, 0, 0.1), transparent);
          top: 0;
          left: 0;
        }
      `}</style>

      <div
        ref={mainRef}
        className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        <div className="light-glow glow-high"></div>
        <div className="light-glow glow-low"></div>

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
            <h1 ref={titleRef} className="text-center key-title">
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
                const isHighKey = idx % 2 === 0;
                const cardBg = isHighKey ? '#fafafa' : '#0f0f12';
                const cardText = isHighKey ? '#1a1a1a' : '#e5e5e5';
                const iconColor = isHighKey ? '#2563eb' : '#a78bfa';
                const descColor = isHighKey ? '#4a4a4a' : '#a0a0a0';
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: cardBg,
                      color: cardText,
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="gradient-divider"></div>
                    <div className="flex items-start gap-4 mb-4">
                      <span className="js-icon material-symbols-rounded" style={{ color: iconColor, fontSize: layout.iconSize }}>
                        {card.icon}
                      </span>
                      <h3 className={`js-title font-medium ${layout.titleSizeClass}`} style={{ color: cardText }}>
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
                      style={{ color: descColor }}
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

export const highLowKeyTemplate: TemplateConfig = {
  id: 'highLowKey',
  name: '高调低调',
  description: '高调干净或低调神秘；适合电商主图、科技产品、香氛/酒类氛围页',
  icon: 'tonality',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <HighLowKey data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'highLowKey'),
};

export { HighLowKey };
