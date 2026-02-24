import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import { 
  calculateStandardLayout, 
  getStandardTitleConfig, 
  generateTitleFitScript,
  generateViewportFitScript 
} from '../utils/layout-calculator';
import { generateDownloadableHtml } from '../utils/template';

/**
 * RetroWin95 渲染组件
 * 复古系统UI/Win95风格：灰色窗口、斜面浮雕边框、像素字体
 */
interface RetroWin95Props {
  data: GeneratedContent;
  scale: number;
}

const THEME_COLORS = [
  { titleBg: '#000080', titleText: '#FFFFFF', gray: '#c0c0c0' },  // 经典蓝
  { titleBg: '#800000', titleText: '#FFFFFF', gray: '#c0c0c0' },  // 深红
  { titleBg: '#008080', titleText: '#FFFFFF', gray: '#c0c0c0' },  // 青色
  { titleBg: '#008000', titleText: '#FFFFFF', gray: '#c0c0c0' },  // 绿色
  { titleBg: '#808000', titleText: '#FFFFFF', gray: '#c0c0c0' },  // 橄榄
  { titleBg: '#800080', titleText: '#FFFFFF', gray: '#c0c0c0' },  // 紫色
  { titleBg: '#808080', titleText: '#FFFFFF', gray: '#c0c0c0' },  // 灰色
];

const RetroWin95: React.FC<RetroWin95Props> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const cardCount = data?.cards?.length || 0;
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
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .win95-container {
          font-family: 'CustomPreviewFont', 'MS Sans Serif', 'Segoe UI', 'Arial', sans-serif;
          background: #008080;
        }
        .win95-title {
          font-weight: 700;
          letter-spacing: 0;
          color: #000;
          text-shadow: 1px 1px 0 #ffffff;
        }
        .win95-card {
          display: flex;
          flex-direction: column;
          position: relative;
          background: #c0c0c0;
          box-shadow: inset -2px -2px 0 #0a0a0a, inset 2px 2px 0 #ffffff, inset -1px -1px 0 #808080, inset 1px 1px 0 #dfdfdf;
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .text-5-5xl { font-size: 3.375rem; line-height: 1.1; }
        .text-4-5xl { font-size: 2.625rem; line-height: 1.2; }
        .text-3-5xl { font-size: 2.0625rem; line-height: 1.3; }
        .text-2-5xl { font-size: 1.8125rem; line-height: 1.4; }
        .win95-title-bar {
          color: #fff;
          padding: 4px 8px;
          margin-bottom: 12px;
          font-weight: bold;
          font-size: 14px;
          display: flex;
          align-items: center;
          letter-spacing: 0.5px;
        }
        .win95-title-bar .title-text {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .window-controls {
          display: flex;
          gap: 2px;
        }
        .win95-button {
          width: 18px;
          height: 18px;
          background: #c0c0c0;
          border: none;
          box-shadow: inset -1px -1px 0 #0a0a0a, inset 1px 1px 0 #ffffff, inset -1px -1px 0 #808080, inset 1px 1px 0 #dfdfdf;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
          color: #000;
        }
        .js-desc {
          line-height: 1.4;
        }
        .js-desc code {
          background: #fff;
          color: #000;
          padding: 0.1em 0.4em;
          border: 2px solid;
          border-color: #808080 #fff #fff #808080;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
          font-weight: 600;
        }
        .js-desc strong {
          font-weight: 700;
          color: #000;
        }
        .outset-border {
          box-shadow: inset -2px -2px 0 #0a0a0a, inset 2px 2px 0 #ffffff, inset -1px -1px 0 #808080, inset 1px 1px 0 #dfdfdf;
        }
        .content-scale { transform-origin: center center; }
      `}</style>

      <div className="win95-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
        <div
          ref={wrapperRef}
          className="content-wrapper relative z-10 w-full flex flex-col items-center px-16 box-border content-scale"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}
        >
          {/* 标题区域 */}
          <div className="title-zone flex-none flex items-center justify-center">
            <div className="outset-border" style={{ background: '#c0c0c0', padding: '12px 24px' }}>
              <h1 ref={titleRef} className="win95-title text-center main-title">
                {data.mainTitle}
              </h1>
            </div>
          </div>

          {/* 卡片区域 */}
          <div className="card-zone flex-none w-full">
            <div
              className="w-full flex flex-wrap justify-center content-center"
              style={{
                gap: layout.containerGap,
                '--container-gap': layout.containerGap
              } as React.CSSProperties}
            >
              {data.cards.map((card, idx) => {
                const colors = THEME_COLORS[idx % THEME_COLORS.length];
                return (
                  <div 
                    key={idx} 
                    className={`win95-card ${layout.cardWidthClass}`}
                    style={{ padding: layout.cardPadding }}
                  >
                    <div className="win95-title-bar" style={{ background: colors.titleBg, color: colors.titleText, margin: `-${layout.cardPadding} -${layout.cardPadding} 12px -${layout.cardPadding}` }}>
                      <span className="title-text">
                        <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>{card.icon}</span>
                        {card.title}
                      </span>
                      <div className="window-controls">
                        <div className="win95-button">_</div>
                        <div className="win95-button">□</div>
                        <div className="win95-button">×</div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <h3 className={`js-title font-bold ${layout.titleSizeClass}`} style={{ color: '#000' }}>
                        {card.title}
                      </h3>
                      <p
                        className={`js-desc ${layout.descSizeClass}`}
                        style={{ color: '#000' }}
                        dangerouslySetInnerHTML={{ __html: card.desc }}
                      />
                    </div>
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

export const retroWin95Template: TemplateConfig = {
  id: 'retroWin95',
  name: '复古系统风格',
  description: '灰色窗口与斜面浮雕边框的经典复古界面',
  icon: 'computer',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <RetroWin95 data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'retroWin95'),
};

export { RetroWin95 };
