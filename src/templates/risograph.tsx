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
 * Risograph 渲染组件
 * 孔版印刷风格 - 套色错位、颗粒、复古印刷质感
 */
interface RisographProps {
  data: GeneratedContent;
  scale: number;
}

const Risograph: React.FC<RisographProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardCount = data.cards.length;

  const layout = calculateStandardLayout(cardCount);
  const titleConfig = getStandardTitleConfig(cardCount);
  const cardZoneInsetX = cardCount === 3 || (cardCount >= 5 && cardCount <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = cardCount === 2 ? '1500px' : cardCount === 3 ? '1700px' : '100%';
  const risoColors = [
    { bg: '#fef3c7', text: '#1a1a1a', accent: '#dc2626' },
    { bg: '#e0f2fe', text: '#1a1a1a', accent: '#0891b2' },
    { bg: '#fae8ff', text: '#1a1a1a', accent: '#7c3aed' },
    { bg: '#d1fae5', text: '#1a1a1a', accent: '#059669' },
    { bg: '#ffedd5', text: '#1a1a1a', accent: '#ea580c' },
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
      <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face { font-family: 'CustomPreviewFont'; src: url('/assets/htmlFont.ttf') format('truetype'); }
        .main-container { font-family: 'Space Mono', 'CustomPreviewFont', monospace; background: #f5f5f0; color: #1a1a1a; }
        .riso-title { font-weight: 700; color: #1a1a1a; letter-spacing: 0.05em; line-height: 1.1; text-transform: uppercase; }
        .card-item { box-shadow: 4px 4px 0 #1a1a1a; }
                .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
                .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
                .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .js-desc strong { font-weight: 700; }
        .js-desc code { background: #1a1a1a; color: #fff; padding: 0.2em 0.4em; }
        .content-scale { transform-origin: center center; }
        .riso-texture { position: absolute; inset: 0; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E"); opacity: 0.5; pointer-events: none; }
      `}</style>
      <div ref={mainRef} className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
        <div className="riso-texture"></div>
        <div ref={wrapperRef} className="content-wrapper w-full flex flex-col items-center px-20 box-border content-scale relative z-10" style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}>
          <div className="title-zone flex-none flex items-center justify-center w-full">
            <h1 ref={titleRef} className="text-center riso-title">{data.mainTitle}</h1>
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
                const c = risoColors[idx % risoColors.length];
                return (
                <div
                  key={idx}
                  data-card-item="true"
                  className={`card-item flex flex-col ${layout.cardWidthClass}`}
                  style={{
                    backgroundColor: c.bg,
                    color: c.text,
                    padding: layout.cardPadding,
                    borderRadius: '2px',
                    border: '3px solid #1a1a1a',
                  }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <span className="js-icon material-symbols-rounded" style={{ color: c.accent, fontSize: layout.iconSize }}>
                      {card.icon}
                    </span>
                    <h3 className={`js-title font-bold ${layout.titleSizeClass}`} style={{ color: c.text }}>
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


export const risographTemplate: TemplateConfig = {
  id: 'risograph',
  name: '孔版印刷',
  description: '套色错位、颗粒、复古印刷质感；适合艺术出版、文化活动',
  icon: 'print',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <Risograph data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'risograph'),
};

export { Risograph };
