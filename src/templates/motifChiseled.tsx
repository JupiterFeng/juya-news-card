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
 * MotifChiseled 渲染组件
 * Motif "Chiseled 3D" (1989) 风格
 * 方正、硬朗、可用性导向的工业3D凿刻控件语言
 */
interface MotifChiseledProps {
  data: GeneratedContent;
  scale: number;
}

const MotifChiseled: React.FC<MotifChiseledProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const motifColors = [
    { bg: '#bdbdbd', shadow: '#666666', highlight: '#e8e8e8', text: '#000000', icon: '#000080' },
    { bg: '#a8a8a8', shadow: '#585858', highlight: '#d4d4d4', text: '#000000', icon: '#000080' },
    { bg: '#c8c8c8', shadow: '#707070', highlight: '#f0f0f0', text: '#000000', icon: '#000080' },
    { bg: '#b0b0b0', shadow: '#606060', highlight: '#dcdcdc', text: '#000000', icon: '#000080' },
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
        .motif-container {
          font-family: 'CustomPreviewFont', 'Helvetica Neue', Arial, sans-serif;
          background-color: #8a8a8a;
          color: #000000;
        }
        .motif-title {
          font-weight: 700;
          color: #000000;
          letter-spacing: 1px;
          font-family: 'CustomPreviewFont', 'Helvetica Neue', Arial, sans-serif;
          text-transform: uppercase;
        }
        .card-item {
          position: relative;
          background: #bdbdbd;
        }
                .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
                .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
                .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .js-desc strong { color: #000000; font-weight: 700; }
        .content-scale { transform-origin: center center; }
      `}</style>

      <div className="motif-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-16 box-border content-scale"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}
        >
          {/* 顶部标题 */}
          <div className="flex flex-col items-center">
            <div style={{
              padding: '20px 40px',
              background: '#bdbdbd',
              borderTop: '4px solid #e8e8e8',
              borderLeft: '4px solid #e8e8e8',
              borderRight: '4px solid #666666',
              borderBottom: '4px solid #666666'
            }}>
              <h1
                ref={titleRef}
                className="text-center motif-title"
              >
                {data.mainTitle}
              </h1>
            </div>
          </div>

          {/* 卡片区域 */}
          <div className="card-zone flex-none w-full">
            <div
              data-card-zone="true"
              className="w-full flex flex-wrap justify-center content-center gap-5"
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
                const theme = motifColors[idx % motifColors.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: theme.bg,
                      borderTop: `3px solid ${theme.highlight}`,
                      borderLeft: `3px solid ${theme.highlight}`,
                      borderRight: `3px solid ${theme.shadow}`,
                      borderBottom: `3px solid ${theme.shadow}`,
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="js-icon material-symbols-rounded" style={{ fontSize: layout.iconSize, color: theme.icon }}>
                        {card.icon}
                      </span>
                      <h3
                        className={`js-title font-bold ${layout.titleSizeClass}`}
                        style={{ color: theme.text, fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc leading-relaxed ${layout.descSizeClass}`}
                      style={{ color: theme.text }}
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


export const motifChiseledTemplate: TemplateConfig = {
  id: 'motifChiseled',
  name: '凿刻式工业界面',
  description: '1989年工业桌面风格 - 方正硬朗、3D凿刻控件、强调可用性',
  icon: 'widgets',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <MotifChiseled data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'motifChiseled'),
};

export { MotifChiseled };
