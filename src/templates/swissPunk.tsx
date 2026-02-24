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
 * SwissPunk 渲染组件
 * 瑞士朋克风格：瑞士网格骨架、故意错位、撞色
 */
interface SwissPunkProps {
  data: GeneratedContent;
  scale: number;
}

const SWISS_PUNK_COLORS = [
  { primary: '#FF0000', secondary: '#000000', accent: '#FFFFFF' },
  { primary: '#0000FF', secondary: '#FFFF00', accent: '#000000' },
  { primary: '#00FF00', secondary: '#FF00FF', accent: '#000000' },
  { primary: '#FF6600', secondary: '#000033', accent: '#FFFFFF' },
  { primary: '#CC00CC', secondary: '#00CC00', accent: '#FFFF00' },
  { primary: '#00CCCC', secondary: '#FF0000', accent: '#000000' },
  { primary: '#FF0066', secondary: '#0066FF', accent: '#FFFF00' },
  { primary: '#000000', secondary: '#FFFFFF', accent: '#FF0000' },
];

const CARD_OFFSETS = [
  { x: -4, y: 2 }, { x: 3, y: -3 }, { x: -2, y: 4 }, { x: 5, y: -1 },
  { x: -3, y: 3 }, { x: 2, y: -4 }, { x: 4, y: 2 }, { x: -1, y: -2 }
];

const SwissPunk: React.FC<SwissPunkProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

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
        .swiss-container {
          font-family: 'CustomPreviewFont', 'Helvetica Now', 'Helvetica Neue', 'Arial Black', sans-serif;
        }
        .swiss-title {
          font-weight: 900;
          letter-spacing: -0.04em;
          color: #000;
          text-transform: uppercase;
          position: relative;
        }
        .swiss-title::before {
          content: attr(data-text);
          position: absolute;
          left: 4px;
          top: 4px;
          color: #FF0000;
          z-index: -1;
        }
        .swiss-card {
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          position: relative;
          transition: transform 0.2s ease;
        }
        .swiss-card:hover {
          z-index: 10;
        }
        .swiss-card::before {
          content: '';
          position: absolute;
          top: -8px;
          left: -8px;
          right: -8px;
          bottom: -8px;
          border: 2px solid #000;
          pointer-events: none;
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
          border-bottom: 3px solid;
        }
        .js-desc {
          line-height: 1.4;
          font-weight: 700;
          text-transform: uppercase;
        }
        .js-desc code {
          background: #000;
          color: #FFF;
          padding: 0.2em 0.5em;
          font-family: 'Courier New', monospace;
          font-size: 0.85em;
          font-weight: 600;
          text-transform: none;
        }
        .js-desc strong {
          font-weight: 900;
          text-decoration: underline;
          text-decoration-thickness: 3px;
        }
        .content-scale { transform-origin: center center; }
        .material-symbols-rounded { font-family: 'Material Symbols Rounded' !important; font-weight: normal; font-style: normal; display: inline-block; }

        .swiss-bg {
          background: #FFFF00;
          position: relative;
        }
        .swiss-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            linear-gradient(90deg, transparent 49%, #FF0000 49%, #FF0000 51%, transparent 51%),
            linear-gradient(0deg, transparent 49%, #000 49%, #000 51%, transparent 51%);
          background-size: 100px 100px;
          opacity: 0.3;
          pointer-events: none;
        }
        .diagonal-stripe {
          position: absolute;
          width: 200%;
          height: 20px;
          background: repeating-linear-gradient(
            -45deg,
            #000,
            #000 10px,
            #FF0000 10px,
            #FF0000 20px
          );
          opacity: 0.8;
        }
      `}</style>

      <div className="swiss-container swiss-bg relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
        <div className="diagonal-stripe" style={{ top: '10%', left: '-50%' }} />
        <div className="diagonal-stripe" style={{ bottom: '15%', left: '-50%' }} />

        <div
          ref={wrapperRef}
          className="content-wrapper relative z-10 w-full flex flex-col items-center px-16 box-border content-scale"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}
        >
          <div className="title-zone flex-none flex items-center justify-center">
            <div style={{ background: '#FFF', border: '8px solid #000', padding: '12px 32px', boxShadow: '8px 8px 0 #FF0000' }}>
              <h1 ref={titleRef} className="swiss-title text-center" data-text={data.mainTitle}>
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
                boxSizing: 'border-box'
              } as React.CSSProperties}
            >
              {data.cards.map((card, idx) => {
                const colors = SWISS_PUNK_COLORS[idx % SWISS_PUNK_COLORS.length];
                const offset = CARD_OFFSETS[idx % CARD_OFFSETS.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item swiss-card ${layout.cardWidthClass}`}
                    style={{
                      background: colors.primary,
                      border: `4px solid ${colors.secondary}`,
                      padding: layout.cardPadding,
                      transform: `translate(${offset.x}px, ${offset.y}px)`,
                    }}
                  >
                    <div className="card-header" style={{ borderColor: colors.secondary }}>
                      <h3
                        className={`js-title font-black ${layout.titleSizeClass}`}
                        style={{
                          color: colors.accent,
                          transform: `translate(${-offset.x * 0.5}px, ${-offset.y * 0.5}px)`
                        }}
                      >
                        {card.title}
                      </h3>
                      <span
                        className="js-icon material-symbols-rounded"
                        style={{ fontSize: layout.iconSize, color: colors.accent }}
                      >
                        {card.icon}
                      </span>
                    </div>
                    <p
                      className={`js-desc ${layout.descSizeClass}`}
                      style={{ color: colors.secondary }}
                      dangerouslySetInnerHTML={{ __html: autoAddSpaceToHtml(card.desc) }}
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

/**
 * SwissPunk 模板配置
 */
export const swissPunkTemplate: TemplateConfig = {
  id: 'swissPunk',
  name: '瑞士朋克风格',
  description: '瑞士网格骨架、故意错位、高对比撞色',
  icon: 'grid_on',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <SwissPunk data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'swissPunk'),
};

export { SwissPunk };
