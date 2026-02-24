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

interface MetroModernProps {
  data: GeneratedContent;
  scale: number;
}

const MetroModern: React.FC<MetroModernProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const metroColors = [
    { bg: '#1d1d1d', text: '#ffffff', icon: '#00bcf2' },
    { bg: '#cf0016', text: '#ffffff', icon: '#ffffff' },
    { bg: '#0078d7', text: '#ffffff', icon: '#ffffff' },
    { bg: '#107c10', text: '#ffffff', icon: '#ffffff' },
    { bg: '#ff8c00', text: '#ffffff', icon: '#ffffff' },
    { bg: '#9b0086', text: '#ffffff', icon: '#ffffff' },
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
        .metro-container {
          font-family: 'CustomPreviewFont', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
          background-color: #000000;
          color: #ffffff;
        }
        .metro-title {
          font-weight: 300;
          color: #ffffff;
          font-family: 'CustomPreviewFont', 'Segoe UI', sans-serif;
          letter-spacing: -0.03em;
        }
        .card-item {
          position: relative;
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .js-desc strong { color: inherit; font-weight: 400; }
        .content-scale { transform-origin: center center; }
      `}</style>

      <div
        ref={mainRef}
        className="metro-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
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
            <h1
              ref={titleRef}
              className="text-center metro-title"
              style={{ textTransform: 'uppercase', fontWeight: '300' }}
            >
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
                boxSizing: 'border-box',
              } as React.CSSProperties}
            >
              {data.cards.map((card, idx) => {
                const theme = metroColors[idx % metroColors.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: theme.bg,
                      padding: layout.cardPadding,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <span
                        className="js-icon material-symbols-rounded"
                        style={{ fontSize: layout.iconSize, color: theme.icon }}
                      >
                        {card.icon}
                      </span>
                      <h3
                        className={`js-title font-light ${layout.titleSizeClass}`}
                        style={{
                          color: theme.text,
                          fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
                          fontWeight: '300',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc ${layout.descSizeClass}`}
                      style={{
                        color: theme.text,
                        opacity: '0.85',
                        lineHeight: '1.6',
                        fontWeight: '300',
                      }}
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

export const metroModernTemplate: TemplateConfig = {
  id: 'metroModern',
  name: '现代磁贴界面',
  description: '2010年现代磁贴风格 - 大字排版、纯色块、内容优先',
  icon: 'grid_view',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <MetroModern data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'metroModern'),
};

export { MetroModern };
