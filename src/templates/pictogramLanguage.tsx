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

interface PictogramLanguageProps {
  data: GeneratedContent;
  scale: number;
}

const PictogramLanguage: React.FC<PictogramLanguageProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const pictogramColors = [
    { bg: '#0066CC', text: '#FFFFFF', icon: '#FFFFFF' },
    { bg: '#00A651', text: '#FFFFFF', icon: '#FFFFFF' },
    { bg: '#FF6B00', text: '#FFFFFF', icon: '#FFFFFF' },
    { bg: '#8B2F8F', text: '#FFFFFF', icon: '#FFFFFF' },
    { bg: '#E31E24', text: '#FFFFFF', icon: '#FFFFFF' },
    { bg: '#003366', text: '#FFFFFF', icon: '#66B2FF' },
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
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700&family=Roboto:wght@400;500;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'Inter', 'Roboto', 'CustomPreviewFont', sans-serif;
          background-color: #f5f5f0;
          background-image:
            linear-gradient(rgba(0,102,204,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,102,204,0.05) 1px, transparent 1px);
          background-size: 40px 40px;
          color: #1a1a1a;
          position: relative;
        }
        .main-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 8px;
          background: linear-gradient(90deg, #0066CC 0%, #00A651 20%, #FF6B00 40%, #8B2F8F 60%, #E31E24 80%, #0066CC 100%);
        }
        .main-container::after {
          content: 'PICTOGRAM SYSTEM // WAYFINDING';
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.2em;
          color: #999;
        }
        .picto-title {
          font-weight: 700;
          color: #1a1a1a;
          letter-spacing: 0.1em;
          line-height: 1.2;
          text-transform: uppercase;
          position: relative;
        }
        .picto-title::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 3px;
          background: linear-gradient(90deg, #0066CC, #00A651);
        }
        .card-item {
          position: relative;
          overflow: hidden;
          counter-increment: picto-card;
        }
        .card-item::before {
          content: counter(picto-card);
          position: absolute;
          top: 12px;
          left: 12px;
          font-size: 11px;
          font-weight: 600;
          color: rgba(255,255,255,0.5);
          background: rgba(0,0,0,0.2);
          padding: 2px 6px;
          border-radius: 10px;
        }
        .card-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.2), 0 12px 32px rgba(0,0,0,0.15) !important;
        }
        .card-item:hover .js-icon {
          transform: scale(1.1);
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .content-scale { transform-origin: center center; }
        .card-zone { counter-reset: picto-card; }
      `}</style>

      <div
        ref={mainRef}
        className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-24 box-border content-scale z-10"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}
        >
          <div className="flex flex-col items-center">
            <h1 ref={titleRef} className="text-center picto-title">
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
                const color = pictogramColors[idx % pictogramColors.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: color.bg,
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      transition: 'all 0.2s ease',
                      padding: layout.cardPadding,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                    }}
                  >
                    <div className="card-header flex flex-col items-center gap-3 mb-4">
                      <span
                        className="js-icon material-symbols-rounded"
                        style={{
                          color: color.icon,
                          fontSize: layout.iconSize,
                          width: layout.iconSize,
                          height: layout.iconSize,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          marginBottom: '16px',
                        }}
                      >
                        {card.icon}
                      </span>
                      <h3
                        className={`js-title font-semibold leading-tight ${layout.titleSizeClass}`}
                        style={{
                          color: color.text,
                          fontFamily: "'Inter', 'Roboto', 'Helvetica Neue', sans-serif",
                          letterSpacing: '0.02em',
                          textAlign: 'center',
                        }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
                      style={{
                        color: 'rgba(255,255,255,0.9)',
                        fontFamily: "'Inter', 'Roboto', sans-serif",
                        textAlign: 'center',
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

export const pictogramLanguageTemplate: TemplateConfig = {
  id: 'pictogramLanguage',
  name: '图形符号语言',
  description: '统一笔画、圆角、比例的系统化符号学',
  icon: 'signpost',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <PictogramLanguage data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'pictogramLanguage'),
};

export { PictogramLanguage };
