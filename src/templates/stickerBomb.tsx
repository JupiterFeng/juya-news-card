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
 * StickerBomb 渲染组件
 * 贴纸轰炸风格 - 大量贴纸元素堆叠
 */
interface StickerBombProps {
  data: GeneratedContent;
  scale: number;
}

const StickerBomb: React.FC<StickerBombProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const stickerColors = [
    { bg: '#ff6b6b', text: '#fff', accent: '#fff' },
    { bg: '#4ecdc4', text: '#fff', accent: '#fff' },
    { bg: '#ffe66d', text: '#1a1a1a', accent: '#1a1a1a' },
    { bg: '#95e1d3', text: '#1a1a1a', accent: '#1a1a1a' },
    { bg: '#f38181', text: '#fff', accent: '#fff' },
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
      while (title.scrollWidth > 1650 && size > titleConfig.minFontSize && guard < 100) {
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
      <link href="https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Nunito:wght@400;700;800&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face { font-family: 'CustomPreviewFont'; src: url('/assets/htmlFont.ttf') format('truetype'); }
        .main-container { font-family: 'Nunito', 'CustomPreviewFont', system-ui, sans-serif; background: linear-gradient(135deg, #ffeaa7 0%, #dfe6e9 100%); color: #1a1a1a; }
        .sticker-title { font-family: 'Permanent Marker', 'CustomPreviewFont', cursive; font-weight: 400; color: #1a1a1a; letter-spacing: 0.02em; }
        .card-item { transition: transform 0.3s; position: relative; overflow: hidden; }
        .card-item::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%); pointer-events: none; }
        .card-item::after { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px); pointer-events: none; opacity: 0.5; }
        .card-item:hover { transform: scale(1.05) rotate(0deg) !important; z-index: 10; }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .js-desc strong { font-weight: 800; }
        .js-desc code { background: rgba(255,255,255,0.4); padding: 0.2em 0.4em; border-radius: 4px; font-weight: 700; }
        .content-scale { transform-origin: center center; }
        .tape { position: absolute; width: 80px; height: 25px; background: rgba(255,255,255,0.7); top: -10px; left: 50%; transform: translateX(-50%) rotate(-3deg); box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
      `}</style>
      <div className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-20 box-border content-scale relative z-10"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}
        >
          <div className="title-zone flex-none flex items-center justify-center w-full">
            <h1 ref={titleRef} className="text-center sticker-title">{data.mainTitle}</h1>
          </div>
          <div className="card-zone flex-none w-full">
            <div
              data-card-zone="true"
              className="w-full flex flex-wrap justify-center content-center"
              style={{ gap: layout.containerGap, '--container-gap': layout.containerGap,
                paddingLeft: cardZoneInsetX,
                paddingRight: cardZoneInsetX,
                maxWidth: cardZoneMaxWidth,
                margin: '0 auto',
                boxSizing: 'border-box' } as React.CSSProperties}
            >
              {data.cards.map((card, idx) => {
                const c = stickerColors[idx % stickerColors.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: c.bg,
                      color: c.text,
                      padding: layout.cardPadding,
                      borderRadius: '4px',
                      transform: `rotate(${(idx % 3 - 1) * 2}deg)`,
                      boxShadow: '4px 4px 8px rgba(0,0,0,0.2)',
                    }}
                  >
                    <div className="tape"></div>
                    <div className="flex items-start gap-4 mb-4">
                      <span className="js-icon material-symbols-rounded" style={{ color: c.accent, fontSize: layout.iconSize }}>
                        {card.icon}
                      </span>
                      <h3
                        className={`js-title font-bold ${layout.titleSizeClass}`}
                        style={{ color: c.text, textTransform: 'uppercase' }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-medium ${layout.descSizeClass}`}
                      style={{ color: c.text }}
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

export const stickerBombTemplate: TemplateConfig = {
  id: 'stickerBomb',
  name: '贴纸轰炸',
  description: '大量贴纸元素堆叠；适合街头潮流、社群活动、UGC视觉',
  icon: 'sticky_note_2',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <StickerBomb data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'stickerBomb'),
};

export { StickerBomb };
