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

/**
 * HalftoneComic 渲染组件
 * 网点/漫画风格 - 网点阴影、漫画线、夸张拟声
 */
interface HalftoneComicProps {
  data: GeneratedContent;
  scale: number;
}

const HalftoneComic: React.FC<HalftoneComicProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardCount = data.cards.length;

  const layout = calculateStandardLayout(cardCount);
  const titleConfig = getStandardTitleConfig(cardCount);
  const cardZoneInsetX = cardCount === 3 || (cardCount >= 5 && cardCount <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = cardCount === 2 ? '1500px' : cardCount === 3 ? '1700px' : '100%';
  const comicColors = [
    { bg: '#ffeb3b', text: '#1a1a1a', accent: '#e91e63', stroke: '#1a1a1a' },
    { bg: '#4fc3f7', text: '#1a1a1a', accent: '#ff5722', stroke: '#1a1a1a' },
    { bg: '#81c784', text: '#1a1a1a', accent: '#9c27b0', stroke: '#1a1a1a' },
    { bg: '#ffb74d', text: '#1a1a1a', accent: '#2196f3', stroke: '#1a1a1a' },
    { bg: '#e040fb', text: '#fff', accent: '#ffeb3b', stroke: '#fff' },
  ];

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if (!wrapperRef.current || !titleRef.current) return;
    const wrapper = wrapperRef.current;
    const title = titleRef.current;

    let size = titleConfig.initialFontSize;
    title.style.fontSize = size + 'px';
    let guard = 0;
    while(title.scrollWidth > 1650 && size > titleConfig.minFontSize && guard < 100) {
      size -= 1;
      title.style.fontSize = size + 'px';
      guard++;
    }

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
      <link href="https://fonts.googleapis.com/css2?family=Bangers&family=Comic+Neue:wght@400;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face { font-family: 'CustomPreviewFont'; src: url('/assets/htmlFont.ttf') format('truetype'); }
        .main-container { font-family: 'Comic Neue', 'CustomPreviewFont', cursive; background: #fff9c4; color: #1a1a1a; }
        .comic-title { font-family: 'Bangers', 'CustomPreviewFont', cursive; font-weight: 400; color: #e91e63; letter-spacing: 0.05em; text-shadow: 3px 3px 0 #1a1a1a; }
        .card-item { transition: transform 0.2s; }
        .card-item:hover { transform: translate(-2px, -2px); box-shadow: 12px 12px 0 rgba(0,0,0,0.2); }
                .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
                .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
                .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .js-desc strong { font-weight: 700; color: #e91e63; }
        .js-desc code { background: #1a1a1a; color: #ffeb3b; padding: 0.2em 0.4em; font-weight: 700; }
        .content-scale { transform-origin: center center; }
        .halftone-dot { position: absolute; width: 4px; height: 4px; background: rgba(0,0,0,0.1); border-radius: 50%; }
      `}</style>
      <div ref={mainRef} className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
        <div ref={wrapperRef} className="content-wrapper w-full flex flex-col items-center px-20 box-border content-scale relative z-10" style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}>
          <div className="title-zone flex-none flex items-center justify-center w-full">
            <h1 ref={titleRef} className="text-center comic-title">{data.mainTitle}</h1>
          </div>
          <div className="card-zone flex-none w-full">
            <div
              data-card-zone="true"
              className="w-full flex flex-wrap justify-center content-center gap-7"
              style={{ gap: layout.containerGap, '--container-gap': layout.containerGap,
                paddingLeft: cardZoneInsetX,
                paddingRight: cardZoneInsetX,
                maxWidth: cardZoneMaxWidth,
                margin: '0 auto',
                boxSizing: 'border-box' } as React.CSSProperties}
            >
              {data.cards.map((card, idx) => {
                const c = comicColors[idx % comicColors.length];
                return (
                <div
                  key={idx}
                  data-card-item="true"
                  className={`card-item flex flex-col ${layout.cardWidthClass}`}
                  style={{
                    backgroundColor: c.bg,
                    color: c.text,
                    padding: layout.cardPadding,
                    borderRadius: '0',
                    border: `4px solid ${c.stroke}`,
                    boxShadow: '8px 8px 0 rgba(0,0,0,0.2)',
                  }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <span className="js-icon material-symbols-rounded" style={{ color: c.accent, fontSize: layout.iconSize }}>
                      {card.icon}
                    </span>
                    <h3 className={`js-title font-black ${layout.titleSizeClass}`} style={{ color: c.text, textTransform: 'uppercase' }}>
                      {card.title}
                    </h3>
                  </div>
                  <p className={`js-desc font-medium ${layout.descSizeClass}`} style={{ color: c.text }} dangerouslySetInnerHTML={{ __html: autoAddSpaceToHtml(card.desc) }} />
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


export const halftoneComicTemplate: TemplateConfig = {
  id: 'halftoneComic',
  name: '网点漫画',
  description: '网点阴影、漫画线、夸张拟声；适合年轻化营销、游戏、娱乐',
  icon: 'bubble_chart',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <HalftoneComic data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'halftoneComic'),
};

export { HalftoneComic };
