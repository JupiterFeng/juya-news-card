import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import {
  calculateStandardLayout,
  getStandardTitleConfig,
  generateTitleFitScript,
  generateViewportFitScript,
} from '../utils/layout-calculator';
import { autoAddSpaceToHtml } from '../utils/text-spacing';
import { generateDownloadableHtml } from '../utils/template';

/**
 * NeoBrutalism 渲染组件
 * 新粗野/新野性设计风格：高饱和、粗描边、硬阴影、强对比
 */
interface NeoBrutalismProps {
  data: GeneratedContent;
  scale: number;
}

const NeoBrutalism: React.FC<NeoBrutalismProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;

  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  // 新粗野风格配色方案
  const colorSchemes = [
    { bg: '#FF6B6B' }, // 珊瑚红
    { bg: '#4ECDC4' }, // 绿松石
    { bg: '#FFE66D' }, // 亮黄
    { bg: '#95E1D3' }, // 薄荷绿
    { bg: '#F38181' }, // 鲑鱼红
    { bg: '#AA96DA' }, // 薰衣草
    { bg: '#FCBAD3' }, // 粉色
    { bg: '#A8E6CF' }, // 鼠尾草
    { bg: '#FFD93D' }, // 金色
    { bg: '#6BCB77' }, // 青柠
    { bg: '#4D96FF' }, // 蓝色
    { bg: '#FF6F91' }, // 玫瑰红
  ];

  const frame = useMemo(() => {
    if (N === 1) {
      return { borderWidth: '5px', shadowOffset: '14px' };
    }
    if (layout.cardWidthClass === 'card-width-4col') {
      return { borderWidth: '3px', shadowOffset: '8px' };
    }
    if (N > 3) {
      return { borderWidth: '4px', shadowOffset: '10px' };
    }
    return { borderWidth: '4px', shadowOffset: '12px' };
  }, [N, layout.cardWidthClass]);

  // 让卡片标题/正文保持可读比例，避免标题过大、正文过小。
  const cardTypography = useMemo(() => {
    if (N <= 3) {
      return { titleClass: 'text-4-5xl', descClass: 'text-3-5xl' };
    }
    if (N === 4) {
      return { titleClass: 'text-4xl', descClass: 'text-3xl' };
    }
    return { titleClass: layout.titleSizeClass, descClass: layout.descSizeClass };
  }, [N, layout.titleSizeClass, layout.descSizeClass]);

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
        size -= 2;
        title.style.fontSize = size + 'px';
        guard += 1;
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

  const ssrScript = `
    ${generateTitleFitScript(titleConfig)}
    ${generateViewportFitScript()}
  `;

  return (
    <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', overflow: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .neo-brutalism-container {
          font-family: 'CustomPreviewFont', 'Space Grotesk', 'Inter', system-ui, -apple-system, sans-serif;
        }
        .neo-brutalism-title {
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #000;
          text-shadow: 4px 4px 0 #fff;
          -webkit-text-stroke: 3px #000;
          paint-order: stroke fill;
        }
        .card-item {
          border-radius: 0;
          display: flex;
          flex-direction: column;
          transition: transform 0.1s ease;
        }
        .card-width-2col {
          width: calc((100% - var(--container-gap)) / 2 - 1px);
          min-width: 500px;
        }
        .card-width-3col {
          width: calc((100% - var(--container-gap) * 2) / 3 - 1px);
          min-width: 380px;
        }
        .card-width-4col {
          width: calc((100% - var(--container-gap) * 3) / 4 - 1px);
          min-width: 320px;
        }
        .text-5-5xl { font-size: 3.375rem; line-height: 1.1; }
        .text-4-5xl { font-size: 2.625rem; line-height: 1.2; }
        .text-3-5xl { font-size: 2.0625rem; line-height: 1.3; }
        .text-2-5xl { font-size: 1.8125rem; line-height: 1.4; }
        .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
        .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
        .text-2xl { font-size: 1.5rem; line-height: 2rem; }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 16px;
          margin-bottom: 16px;
        }
        .js-desc {
          line-height: 1.4;
          font-weight: 500;
        }
        .js-desc code {
          background: #000;
          color: #fff;
          padding: 0.1em 0.4em;
          font-family: monospace;
          font-size: 0.9em;
          font-weight: bold;
        }
        .js-desc strong {
          font-weight: 900;
          text-decoration: underline;
          text-decoration-thickness: 3px;
        }
        .content-scale { transform-origin: center center; }
      `}</style>

      <div
        className="neo-brutalism-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
        style={{ backgroundColor: '#FFF5E1' }}
      >
        <div
          ref={wrapperRef}
          className="content-wrapper content-scale w-full flex flex-col items-center px-16 box-border"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}
        >
          {/* 标题区域 */}
          <div className="title-zone flex-none flex items-center justify-center py-8">
            <div className="title-wrapper bg-yellow-300 border-4 border-black px-12 py-6"
                 style={{ boxShadow: '8px 8px 0 #000' }}>
              <h1
                ref={titleRef}
                className="neo-brutalism-title text-center"
                style={{ fontSize: `${titleConfig.initialFontSize}px` }}
              >
                {data.mainTitle}
              </h1>
            </div>
          </div>

          {/* 卡片区域 */}
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
                const scheme = colorSchemes[idx % colorSchemes.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item ${N === 1 ? '' : layout.cardWidthClass}`}
                    style={{
                      ...(N === 1 ? { width: '70%', maxWidth: '1200px' } : {}),
                      backgroundColor: scheme.bg,
                      borderWidth: frame.borderWidth,
                      borderColor: '#000',
                      borderStyle: 'solid',
                      boxShadow: `${frame.shadowOffset} ${frame.shadowOffset} 0 0 #000`,
                      padding: layout.cardPadding,
                    }}
                  >
                    <div
                      className="card-header"
                      style={{
                        borderBottomWidth: frame.borderWidth,
                        borderBottomStyle: 'solid',
                        borderColor: '#000',
                      }}
                    >
                      <h3
                        className={`js-title font-black ${cardTypography.titleClass}`}
                        style={{ color: '#000' }}
                      >
                        {card.title}
                      </h3>
                      <span
                        className="js-icon material-symbols-rounded"
                        style={{ fontSize: layout.iconSize, color: '#000' }}
                      >
                        {card.icon}
                      </span>
                    </div>
                    <p
                      className={`js-desc ${cardTypography.descClass}`}
                      style={{ color: '#000' }}
                      dangerouslySetInnerHTML={{ __html: autoAddSpaceToHtml(card.desc) }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: ssrScript }} />
    </div>
  );
};


/**
 * NeoBrutalism 模板配置
 */
export const neoBrutalismTemplate: TemplateConfig = {
  id: 'neoBrutalism',
  name: '新粗野风格',
  description: '高饱和、粗描边、硬阴影的潮流设计',
  icon: 'brush',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <NeoBrutalism data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'neoBrutalism'),
};

// 导出组件供下载模板使用
export { NeoBrutalism };
