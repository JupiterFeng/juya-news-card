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

interface YosemiteFlatProps {
  data: GeneratedContent;
  scale: number;
}

const YosemiteFlat: React.FC<YosemiteFlatProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1320px' : N === 3 ? '1480px' : '100%';

  const yosemiteColors = [
    { bg: '#ffffff', text: '#333333', icon: '#007aff', border: '#e0e0e0' },
    { bg: '#fafafa', text: '#333333', icon: '#007aff', border: '#e5e5e5' },
    { bg: '#f8f8f8', text: '#333333', icon: '#007aff', border: '#e3e3e3' },
    { bg: '#fcfcfc', text: '#333333', icon: '#007aff', border: '#e8e8e8' },
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
        .yosemite-container {
          font-family: 'CustomPreviewFont', 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif;
          background: linear-gradient(135deg, #f0f4f8 0%, #e8ecf0 100%);
          color: #333333;
        }
        .yosemite-title {
          font-weight: 600;
          color: #333333;
          font-family: 'CustomPreviewFont', 'SF Pro Display', sans-serif;
          letter-spacing: -0.02em;
        }
        .card-item {
          position: relative;
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .js-desc strong { color: #333333; font-weight: 600; }
        .content-scale { transform-origin: center center; }
      `}</style>

      <div ref={mainRef} className="yosemite-container relative box-border w-full h-full overflow-hidden flex flex-row">
        <div
          style={{
            width: '220px',
            height: '100%',
            background: 'rgba(245, 245, 245, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRight: '1px solid #e0e0e0',
            display: 'flex',
            flexDirection: 'column',
            padding: '16px 12px',
            gap: '4px',
          }}
        >
          <div style={{ padding: '8px', fontSize: '13px', fontWeight: '600', color: '#999999' }}>Favorites</div>
          {['AirDrop', 'Applications', 'Desktop', 'Documents', 'Downloads'].map((item) => (
            <div
              key={item}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                color: '#333333',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: '16px', color: '#007aff' }}>
                folder
              </span>
              {item}
            </div>
          ))}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div
            ref={wrapperRef}
            className="content-wrapper w-full flex flex-col items-center content-scale"
            style={{
              gap: layout.wrapperGap,
              paddingLeft: layout.wrapperPaddingX || undefined,
              paddingRight: layout.wrapperPaddingX || undefined,
            }}
          >
            <div className="flex flex-col items-center">
              <div
                style={{
                  padding: '16px 28px',
                  background: '#ffffff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <h1 ref={titleRef} className="text-center yosemite-title">
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
                  const theme = yosemiteColors[idx % yosemiteColors.length];
                  return (
                    <div
                      key={idx}
                      data-card-item="true"
                      className={`card-item flex flex-col ${layout.cardWidthClass}`}
                      style={{
                        backgroundColor: theme.bg,
                        border: `1px solid ${theme.border}`,
                        borderRadius: '6px',
                        padding: layout.cardPadding,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
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
                          className={`js-title font-semibold ${layout.titleSizeClass}`}
                          style={{
                            color: theme.text,
                            fontFamily: "'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
                            letterSpacing: '-0.015em',
                          }}
                        >
                          {card.title}
                        </h3>
                      </div>
                      <p
                        className={`js-desc ${layout.descSizeClass}`}
                        style={{ color: theme.text, opacity: '0.8', lineHeight: '1.6' }}
                        dangerouslySetInnerHTML={{ __html: autoAddSpaceToHtml(card.desc) }}
                      />
                    </div>
                  );
                })}
              </div>
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

export const yosemiteFlatTemplate: TemplateConfig = {
  id: 'yosemiteFlat',
  name: '轻透扁平桌面',
  description: '2014年轻透扁平桌面风格 - 半透明侧栏与统一图标',
  icon: 'laptop',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <YosemiteFlat data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'yosemiteFlat'),
};

export { YosemiteFlat };
