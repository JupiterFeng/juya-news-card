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

interface OS2WarpProps {
  data: GeneratedContent;
  scale: number;
}

const OS2Warp: React.FC<OS2WarpProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const os2Colors = [
    { bg: '#d4d4d4', dark: '#808080', light: '#ffffff', text: '#000000', icon: '#004080' },
    { bg: '#c8c8c8', dark: '#707070', light: '#f0f0f0', text: '#000000', icon: '#005090' },
    { bg: '#dcdcdc', dark: '#888888', light: '#fcfcfc', text: '#000000', icon: '#003070' },
    { bg: '#d0d0d0', dark: '#787878', light: '#f4f4f4', text: '#000000', icon: '#004080' },
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
        .os2-container {
          font-family: 'CustomPreviewFont', 'Helvetica Neue', Arial, sans-serif;
          background: linear-gradient(135deg, #3a6ea5 0%, #004080 100%);
          color: #000000;
        }
        .os2-title {
          font-weight: 700;
          color: #ffffff;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          letter-spacing: 1px;
          font-family: 'CustomPreviewFont', 'Helvetica Neue', Arial, sans-serif;
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
        className="os2-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
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
                padding: '18px 24px',
                background: '#d4d4d4',
                borderTop: '4px solid #ffffff',
                borderLeft: '4px solid #ffffff',
                borderRight: '4px solid #808080',
                borderBottom: '4px solid #808080',
                borderRadius: '4px',
              }}
            >
              <h1 ref={titleRef} className="text-center os2-title" style={{ color: '#004080' }}>
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
                const theme = os2Colors[idx % os2Colors.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: theme.bg,
                      borderTop: `3px solid ${theme.light}`,
                      borderLeft: `3px solid ${theme.light}`,
                      borderRight: `3px solid ${theme.dark}`,
                      borderBottom: `3px solid ${theme.dark}`,
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className="js-icon material-symbols-rounded"
                        style={{ fontSize: layout.iconSize, color: theme.icon }}
                      >
                        {card.icon}
                      </span>
                      <h3
                        className={`js-title font-bold ${layout.titleSizeClass}`}
                        style={{ color: theme.text, fontFamily: "'WarpSans', 'Helvetica Neue', Arial, sans-serif" }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc ${layout.descSizeClass}`}
                      style={{ color: theme.text, lineHeight: '1.4' }}
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

export const os2WarpTemplate: TemplateConfig = {
  id: 'os2Warp',
  name: '对象化桌面',
  description: '1996年对象化桌面风格 - 工作区组织与启动中心',
  icon: 'folder_open',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <OS2Warp data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'os2Warp'),
};

export { OS2Warp };
