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

interface WebOSCardsProps {
  data: GeneratedContent;
  scale: number;
}

const WebOSCards: React.FC<WebOSCardsProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const webosColors = [
    { bg: '#1a1a1a', header: '#2a2a2a', text: '#ffffff', icon: '#00d4ff' },
    { bg: '#1e1e1e', header: '#2e2e2e', text: '#ffffff', icon: '#ff6b35' },
    { bg: '#1c1c1c', header: '#2c2c2c', text: '#ffffff', icon: '#4cd964' },
    { bg: '#1d1d1d', header: '#2d2d2d', text: '#ffffff', icon: '#ffcc00' },
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
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .webos-container {
          font-family: 'CustomPreviewFont', 'Helvetica Neue', Arial, sans-serif;
          background: linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%);
          color: #ffffff;
        }
        .webos-title {
          font-weight: 500;
          color: #ffffff;
          font-family: 'CustomPreviewFont', 'Helvetica Neue', sans-serif;
          text-shadow: 0 2px 8px rgba(0,0,0,0.5);
        }
        .card-item {
          position: relative;
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .js-desc strong { color: #ffffff; font-weight: 600; }
        .content-scale { transform-origin: center center; }
        .webos-gesture-bar {
          height: 4px;
          background: rgba(255,255,255,0.3);
          border-radius: 2px;
          margin: 0 auto 12px;
          width: 80px;
        }
      `}</style>

      <div
        ref={mainRef}
        className="webos-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-16 box-border content-scale"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}
        >
          <div className="flex flex-col items-center">
            <div
              style={{
                padding: '16px 32px',
                background: '#2a2a2a',
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              }}
            >
              <h1 ref={titleRef} className="text-center webos-title">
                {data.mainTitle}
              </h1>
            </div>
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
                boxSizing: 'border-box',
              } as React.CSSProperties}
            >
              {data.cards.map((card, idx) => {
                const theme = webosColors[idx % webosColors.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: theme.bg,
                      borderRadius: '16px',
                      padding: '0',
                      overflow: 'hidden',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)',
                    }}
                  >
                    <div
                      className="webos-header flex items-center justify-between"
                      style={{
                        backgroundColor: theme.header,
                        padding: '12px 16px',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      <h3
                        className={`js-title font-semibold ${layout.titleSizeClass}`}
                        style={{
                          color: theme.text,
                          fontFamily: "'Prelude', 'Helvetica Neue', Arial, sans-serif",
                        }}
                      >
                        {card.title}
                      </h3>
                      <span
                        className="js-icon material-symbols-rounded"
                        style={{ fontSize: layout.iconSize, color: theme.icon }}
                      >
                        {card.icon}
                      </span>
                    </div>
                    <div className="webos-body" style={{ padding: layout.cardPadding }}>
                      <div className="webos-gesture-bar"></div>
                      <p
                        className={`js-desc ${layout.descSizeClass}`}
                        style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.5' }}
                        dangerouslySetInnerHTML={{ __html: autoAddSpaceToHtml(card.desc) }}
                      />
                    </div>
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

export const webosCardsTemplate: TemplateConfig = {
  id: 'webosCards',
  name: '卡片式多任务',
  description: '2009年卡片式多任务风格 - 手势切换与堆叠窗口',
  icon: 'style',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <WebOSCards data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'webosCards'),
};

export { WebOSCards };
