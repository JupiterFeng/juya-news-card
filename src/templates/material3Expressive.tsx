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

interface Material3ExpressiveProps {
  data: GeneratedContent;
  scale: number;
}

const Material3Expressive: React.FC<Material3ExpressiveProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const expressiveColors = [
    {
      primary: '#6750A4',
      onPrimary: '#FFFFFF',
      primaryContainer: '#EADDFF',
      onPrimaryContainer: '#21005D',
    },
    {
      primary: '#984760',
      onPrimary: '#FFFFFF',
      primaryContainer: '#FFD9E3',
      onPrimaryContainer: '#3E061E',
    },
    {
      primary: '#4F6A36',
      onPrimary: '#FFFFFF',
      primaryContainer: '#D1E8C4',
      onPrimaryContainer: '#0E2005',
    },
    {
      primary: '#8E4F3E',
      onPrimary: '#FFFFFF',
      primaryContainer: '#FFDAD3',
      onPrimaryContainer: '#360D04',
    },
    {
      primary: '#006C4C',
      onPrimary: '#FFFFFF',
      primaryContainer: '#89F8C7',
      onPrimaryContainer: '#002114',
    },
    {
      primary: '#6B5E8F',
      onPrimary: '#FFFFFF',
      primaryContainer: '#E2DFFF',
      onPrimaryContainer: '#251A4A',
    },
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
        .m3-expressive-container {
          font-family: 'CustomPreviewFont', 'Google Sans', 'Roboto', sans-serif;
          background: linear-gradient(135deg, #ffd9e3 0%, #eaddff 25%, #d1e8c4 50%, #ffdad3 75%, #e2dfff 100%);
          background-size: 400% 400%;
          animation: gradientShift 25s ease infinite;
          color: #21005d;
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .m3-expressive-title {
          font-weight: 400;
          color: #21005d;
          font-family: 'CustomPreviewFont', 'Google Sans', sans-serif;
          letter-spacing: -0.04em;
        }
        .card-item {
          position: relative;
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .js-desc strong { color: inherit; font-weight: 700; }
        .content-scale { transform-origin: center center; }
      `}</style>

      <div
        ref={mainRef}
        className="m3-expressive-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
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
                padding: '28px 56px',
                background: '#6750A4',
                borderRadius: '40px',
                boxShadow: '0 12px 40px rgba(103, 80, 164, 0.35), inset 0 2px 0 rgba(255, 255, 255, 0.3)',
              }}
            >
              <h1 ref={titleRef} className="text-center m3-expressive-title" style={{ color: '#ffffff' }}>
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
                const theme = expressiveColors[idx % expressiveColors.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: theme.primaryContainer,
                      borderRadius: '32px',
                      padding: layout.cardPadding,
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), inset 0 2px 0 rgba(255, 255, 255, 0.5)',
                    }}
                  >
                    <div className="flex items-center gap-4 mb-5">
                      <span
                        className="js-icon material-symbols-rounded"
                        style={{ fontSize: layout.iconSize, color: theme.primary }}
                      >
                        {card.icon}
                      </span>
                      <h3
                        className={`js-title font-bold ${layout.titleSizeClass}`}
                        style={{
                          color: theme.onPrimaryContainer,
                          fontFamily: "'Google Sans', 'Roboto', sans-serif",
                          letterSpacing: '-0.03em',
                        }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc ${layout.descSizeClass}`}
                      style={{
                        color: theme.onPrimaryContainer,
                        opacity: '0.85',
                        lineHeight: '1.6',
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

export const material3ExpressiveTemplate: TemplateConfig = {
  id: 'material3Expressive',
  name: '高表现材质界面',
  description: '2025年高表现材质风格 - 大胆形状与情绪化表达',
  icon: 'brush',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <Material3Expressive data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'material3Expressive'),
};

export { Material3Expressive };
