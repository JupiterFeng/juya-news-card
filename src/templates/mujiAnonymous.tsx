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

interface MujiAnonymousProps {
  data: GeneratedContent;
  scale: number;
}

const MujiAnonymous: React.FC<MujiAnonymousProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const mujiColors = [
    { bg: '#F4F3F0', onBg: '#3E3C3A', accent: '#8B4513' },
    { bg: '#EFEDE8', onBg: '#3A3836', accent: '#6B4423' },
    { bg: '#F5F4F1', onBg: '#3E3C3A', accent: '#8B4513' },
    { bg: '#EFECE6', onBg: '#383634', accent: '#6B4423' },
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
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'Noto Sans JP', 'Hiragino Sans', 'CustomPreviewFont', sans-serif;
          background-color: #fafaf8;
          color: #3e3c3a;
        }
        .muji-title {
          font-weight: 400;
          color: #3e3c3a;
          letter-spacing: 0.08em;
          line-height: 1.4;
        }
        .card-item {
          border: 1px solid rgba(0,0,0,0.05);
          transition: all 0.25s ease;
        }
        .card-item:hover {
          border-color: rgba(0,0,0,0.12);
          transform: none;
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .content-scale { transform-origin: center center; }
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
            <h1 ref={titleRef} className="text-center muji-title">
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
                const color = mujiColors[idx % mujiColors.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: color.bg,
                      borderRadius: '0',
                      border: '1px solid rgba(0,0,0,0.05)',
                      boxShadow: 'none',
                      transition: 'all 0.25s ease',
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="card-header flex items-center gap-4 mb-5">
                      <span
                        className="js-icon material-symbols-rounded"
                        style={{ color: color.accent, fontSize: layout.iconSize, opacity: '0.6' }}
                      >
                        {card.icon}
                      </span>
                      <h3
                        className={`js-title font-normal leading-tight ${layout.titleSizeClass}`}
                        style={{
                          color: color.onBg,
                          fontFamily: "'Noto Sans JP', 'Hiragino Sans', sans-serif",
                          letterSpacing: '0.05em',
                          fontWeight: '400',
                        }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
                      style={{
                        color: color.onBg,
                        opacity: '0.65',
                        fontFamily: "'Noto Sans JP', 'Hiragino Sans', sans-serif",
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

export const mujiAnonymousTemplate: TemplateConfig = {
  id: 'mujiAnonymous',
  name: '无品牌极简',
  description: '克制中性的无品牌极简设计，风格降到最低',
  icon: 'category',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <MujiAnonymous data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'mujiAnonymous'),
};

export { MujiAnonymous };
