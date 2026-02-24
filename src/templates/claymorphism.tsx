import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import {
  calculateStandardLayout,
  getStandardTitleConfig,
  generateTitleFitScript,
  generateViewportFitScript,
} from '../utils/layout-calculator';

const THEME_COLORS = [
  { bg: '#ffadad', shadow: '#ff8787' },
  { bg: '#ffd6a5', shadow: '#ffbc72' },
  { bg: '#fdffb6', shadow: '#f5f57a' },
  { bg: '#caffbf', shadow: '#a8e68f' },
  { bg: '#9bf6ff', shadow: '#6ee7f7' },
  { bg: '#bdb2ff', shadow: '#a195f5' },
];

const Claymorphism: React.FC<{ data: GeneratedContent; scale: number }> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const cardCount = data.cards.length;
  const layout = calculateStandardLayout(cardCount);
  const titleConfig = getStandardTitleConfig(cardCount);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if (!wrapperRef.current || !titleRef.current) return;

    const wrapper = wrapperRef.current;
    const title = titleRef.current;

    const fitTitle = () => {
      let size = titleConfig.initialFontSize;
      title.style.fontSize = size + 'px';
      let guard = 0;
      while (title.scrollWidth > 1600 && size > titleConfig.minFontSize && guard < 100) {
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
        const nextScale = Math.max(0.6, maxH / contentH);
        wrapper.style.transform = `scale(${nextScale})`;
        return;
      }
      wrapper.style.transform = '';
    };

    const timer = window.setTimeout(fitViewport, 50);
    return () => window.clearTimeout(timer);
  }, [data, titleConfig]);

  return (
    <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', overflow: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'Quicksand', sans-serif;
          background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
          color: #4a4a4a;
        }
        .clay-title {
          font-weight: 700;
          color: #4a4a4a;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }
        .card-item {
          border-radius: 30px;
          box-shadow:
            8px 8px 16px rgba(0,0,0,0.1),
            -8px -8px 16px rgba(255,255,255,0.8),
            inset 2px 2px 4px rgba(255,255,255,0.6),
            inset -2px -2px 4px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
        }
        .card-item:hover {
          transform: translateY(-4px);
          box-shadow:
            12px 12px 20px rgba(0,0,0,0.12),
            -12px -12px 20px rgba(255,255,255,0.9),
            inset 2px 2px 4px rgba(255,255,255,0.6),
            inset -2px -2px 4px rgba(0,0,0,0.05);
        }
                .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
                .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
                .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .js-desc strong { font-weight: 700; }
        .js-desc code {
          background: rgba(255,255,255,0.7);
          padding: 0.15em 0.4em; border-radius: 10px;
          box-shadow: 2px 2px 4px rgba(0,0,0,0.1);
          font-family: 'Nunito', sans-serif;
          font-size: 0.9em; color: #ff6b6b;
        }
        .content-scale { transform-origin: center center; }
        .material-symbols-rounded { font-family: 'Material Symbols Rounded' !important; font-weight: normal; font-style: normal; display: inline-block; }

        .clay-icon {
          background: #ffffff;
          box-shadow:
            4px 4px 8px rgba(0,0,0,0.1),
            -4px -4px 8px rgba(255,255,255,0.8);
        }
      `}</style>

      <div
        className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
          <div className="absolute w-40 h-40 rounded-full bg-[#ffadad]" style={{ top: '10%', left: '5%', filter: 'blur(40px)' }}></div>
          <div className="absolute w-32 h-32 rounded-full bg-[#caffbf]" style={{ top: '60%', left: '10%', filter: 'blur(30px)' }}></div>
          <div className="absolute w-36 h-36 rounded-full bg-[#bdb2ff]" style={{ top: '30%', right: '8%', filter: 'blur(35px)' }}></div>
        </div>

        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-24 box-border content-scale relative z-10"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}
        >
          <div className="flex flex-col items-center gap-5">
            <div className="clay-icon w-16 h-16 rounded-2xl flex items-center justify-center">
              <span className="material-icons" style={{ fontSize: '36px', color: '#ff6b6b' }}>toys</span>
            </div>
            <h1 ref={titleRef} className="text-center clay-title">
              {data.mainTitle}
            </h1>
            <div className="flex gap-2">
              {THEME_COLORS.map((color, i) => (
                <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: color.bg }}></div>
              ))}
            </div>
          </div>

          <div className="card-zone flex-none w-full">
            <div
              className="w-full flex flex-wrap justify-center content-center"
              style={{ gap: layout.containerGap, '--container-gap': layout.containerGap } as React.CSSProperties}
            >
              {data.cards.map((card, idx) => {
                const color = THEME_COLORS[idx % THEME_COLORS.length];
                return (
                  <div
                    key={idx}
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      padding: layout.cardPadding,
                      backgroundColor: color.bg,
                    }}
                  >
                    <div className="card-header flex items-center gap-4 mb-6">
                      <div className="clay-icon w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span
                          className="js-icon material-symbols-rounded"
                          style={{
                            fontSize: layout.iconSize,
                            color: '#4a4a4a',
                            filter: 'drop-shadow(2px 2px 3px rgba(0,0,0,0.15))',
                          }}
                        >
                          {card.icon}
                        </span>
                      </div>
                      <h3
                        className={`js-title font-bold ${layout.titleSizeClass}`}
                        style={{ color: '#4a4a4a' }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-medium ${layout.descSizeClass}`}
                      style={{ color: '#6b6b6b' }}
                      dangerouslySetInnerHTML={{ __html: card.desc }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: generateTitleFitScript(titleConfig) }} />
      <script dangerouslySetInnerHTML={{ __html: generateViewportFitScript() }} />
    </div>
  );
};

import { generateDownloadableHtml } from '../utils/template';

export const claymorphismTemplate: TemplateConfig = {
  id: 'claymorphism',
  name: '黏土拟态',
  description: '圆润3D软阴影黏土风格',
  icon: 'bubble_chart',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <Claymorphism data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'claymorphism'),
};

export { Claymorphism };
