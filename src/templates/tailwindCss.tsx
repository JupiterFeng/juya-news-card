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

const TailwindCSS: React.FC<{ data: GeneratedContent; scale: number }> = ({ data, scale }) => {
  const mainRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardCount = data.cards.length;

  const layout = calculateStandardLayout(cardCount);
  const titleConfig = getStandardTitleConfig(cardCount);
  const cardZoneInsetX = cardCount === 3 || (cardCount >= 5 && cardCount <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = cardCount === 2 ? '1500px' : cardCount === 3 ? '1700px' : '100%';
  const tailwindColors = [
    { bg: '#fef2f2', border: '#fecaca', icon: '#ef4444' },
    { bg: '#fffbeb', border: '#fde68a', icon: '#f59e0b' },
    { bg: '#ecfdf5', border: '#a7f3d0', icon: '#10b981' },
    { bg: '#eff6ff', border: '#bfdbfe', icon: '#3b82f6' },
    { bg: '#f5f3ff', border: '#ddd6fe', icon: '#8b5cf6' },
    { bg: '#fdf2f8', border: '#fbcfe8', icon: '#ec4899' },
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
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          background-color: #f9fafb;
          color: #111827;
        }
        .tailwind-title {
          font-weight: 700;
          background: linear-gradient(to right, #0ea5e9, #8b5cf6, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }
        .card-item {
          border-radius: 0.75rem;
          border-width: 2px;
          border-style: solid;
          transition: all 0.2s;
        }
        .card-item:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
                .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
                .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
                .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .js-desc strong { color: #1f2937; font-weight: 600; }
        .js-desc code {
          background: rgba(0, 0, 0, 0.08); padding: 0.1em 0.3em; border-radius: 4px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.9em; color: #0ea5e9;
        }
        .content-scale { transform-origin: center center; }
        .material-symbols-rounded { font-family: 'Material Symbols Rounded' !important; font-weight: normal; font-style: normal; display: inline-block; }

      `}</style>

      <div
        ref={mainRef}
        className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-24 box-border content-scale"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-sky-500"></div>
              <div className="w-3 h-3 rounded-full bg-violet-500"></div>
              <div className="w-3 h-3 rounded-full bg-pink-500"></div>
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            </div>
            <h1 ref={titleRef} className="text-center tailwind-title">
              {data.mainTitle}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <span className="px-3 py-1 bg-sky-100 text-sky-700 text-xs font-semibold rounded-full">utility-first</span>
              <span className="px-3 py-1 bg-violet-100 text-violet-700 text-xs font-semibold rounded-full">composable</span>
            </div>
          </div>

          <div className="card-zone flex-none w-full">
            <div
              data-card-zone="true"
              className="w-full flex flex-wrap justify-center content-center gap-4"
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
                const theme = tailwindColors[idx % tailwindColors.length];
                return (
                <div
                  key={idx}
                  data-card-item="true"
                  className={`card-item flex flex-col ${layout.cardWidthClass}`}
                  style={{
                    padding: layout.cardPadding,
                    backgroundColor: theme.bg,
                    borderColor: theme.border,
                  }}
                >
                  <div className="card-header flex items-center gap-4 mb-4">
                    <span className="js-icon material-symbols-rounded" style={{ color: theme.icon, fontSize: layout.iconSize }}>
                      {card.icon}
                    </span>
                    <h3 className={`js-title font-semibold ${layout.titleSizeClass}`} style={{ color: '#1f2937' }}>
                      {card.title}
                    </h3>
                  </div>
                  <p className={`js-desc ${layout.descSizeClass}`} style={{ color: '#4b5563' }} dangerouslySetInnerHTML={{ __html: autoAddSpaceToHtml(card.desc) }} />
                </div>
              )})}
            </div>
          </div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: generateTitleFitScript(titleConfig) }} />
      <script dangerouslySetInnerHTML={{ __html: generateViewportFitScript() }} />
    </div>
  );
};


export const tailwindCssTemplate: TemplateConfig = {
  id: 'tailwindCss',
  name: '原子化样式',
  description: '原子化工具类界面风格',
  icon: 'dashboard',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <TailwindCSS data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'tailwindCss'),
};

export { TailwindCSS };
