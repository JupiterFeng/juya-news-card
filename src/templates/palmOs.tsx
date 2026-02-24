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

interface PalmOSProps {
  data: GeneratedContent;
  scale: number;
}

const PalmOS: React.FC<PalmOSProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const palmColors = [
    { bg: '#ffffff', text: '#000000', icon: '#000000' },
    { bg: '#f8f8f8', text: '#000000', icon: '#000000' },
    { bg: '#ffffff', text: '#000000', icon: '#000000' },
    { bg: '#f0f0f0', text: '#000000', icon: '#000000' },
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
        .palm-container {
          font-family: 'CustomPreviewFont', Arial, sans-serif;
          background-color: #c0c0c0;
          color: #000000;
        }
        .palm-title {
          font-weight: 700;
          color: #000000;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-family: 'CustomPreviewFont', Arial, sans-serif;
        }
        .card-item {
          position: relative;
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .js-desc strong { color: #000000; font-weight: 700; }
        .content-scale { transform-origin: center center; }
      `}</style>

      <div
        ref={mainRef}
        className="palm-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
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
          <div className="flex flex-col items-center w-full">
            <div
              style={{
                width: '100%',
                padding: '14px 20px',
                background: '#ffffff',
                border: '3px solid #000000',
                borderBottom: 'none',
              }}
            >
              <h1 ref={titleRef} className="text-center palm-title">
                {data.mainTitle}
              </h1>
            </div>
            <div
              style={{
                width: '100%',
                height: '40px',
                background: '#e0e0e0',
                border: '3px solid #000000',
                borderTop: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#666666',
              }}
            >
              GRAFFITI WRITE AREA
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
                const theme = palmColors[idx % palmColors.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: theme.bg,
                      border: '2px solid #000000',
                      borderRadius: '2px',
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="js-icon material-symbols-rounded"
                        style={{ fontSize: layout.iconSize, color: theme.icon }}
                      >
                        {card.icon}
                      </span>
                      <h3
                        className={`js-title font-bold ${layout.titleSizeClass}`}
                        style={{
                          color: theme.text,
                          fontFamily: "'Arial', sans-serif",
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                        }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc ${layout.descSizeClass}`}
                      style={{ color: theme.text, lineHeight: '1.3' }}
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

export const palmOsTemplate: TemplateConfig = {
  id: 'palmOs',
  name: '掌上效率界面',
  description: '1996年掌上效率界面风格 - 小屏高对比与图标化',
  icon: 'smartphone',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <PalmOS data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'palmOs'),
};

export { PalmOS };
