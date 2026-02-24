import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import { 
  calculateStandardLayout, 
  getStandardTitleConfig,
  generateTitleFitScript,
  generateViewportFitScript
} from '../utils/layout-calculator';
import { autoAddSpaceToHtml } from '../utils/text-spacing';

/**
 * NeXTSTEP 渲染组件
 * NeXTSTEP "Object UI" (1989) 风格
 * 极简灰阶、精细图标、面板式窗口、列视图体系
 */
interface NeXTSTEPProps {
  data: GeneratedContent;
  scale: number;
}

// NeXTSTEP 灰阶配色
const NEXT_GRAY = [
  { bg: '#e8e8e8', border: '#a0a0a0', text: '#1a1a1a', icon: '#404040' },
  { bg: '#d8d8d8', border: '#909090', text: '#1a1a1a', icon: '#404040' },
  { bg: '#e0e0e0', border: '#989898', text: '#1a1a1a', icon: '#404040' },
  { bg: '#d0d0d0', border: '#888888', text: '#1a1a1a', icon: '#404040' },
];

const NeXTSTEP: React.FC<NeXTSTEPProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const cardCount = data.cards.length;
  const layout = calculateStandardLayout(cardCount);
  const titleConfig = getStandardTitleConfig(cardCount);
  const cardZoneInsetX = cardCount === 3 || (cardCount >= 5 && cardCount <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = cardCount === 2 ? '1500px' : cardCount === 3 ? '1700px' : '100%';

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if (!wrapperRef.current || !titleRef.current) return;

    const wrapper = wrapperRef.current;
    const title = titleRef.current;

    // 调整标题
    const fitTitle = () => {
      let size = titleConfig.initialFontSize;
      title.style.fontSize = size + 'px';
      let guard = 0;
      while (title.scrollWidth > 1700 && size > titleConfig.minFontSize && guard < 100) {
        size -= 2;
        title.style.fontSize = size + 'px';
        guard++;
      }
    };
    fitTitle();

    // 适配视口
    const fitViewport = () => {
      const maxH = 1060;
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
        .nextstep-container {
          font-family: 'CustomPreviewFont', 'Helvetica Neue', Helvetica, Arial, sans-serif;
          background: linear-gradient(180deg, #c8c8c8 0%, #b8b8b8 100%);
          color: #1a1a1a;
        }
        .nextstep-title {
          font-weight: 600;
          color: #1a1a1a;
          letter-spacing: -1px;
          font-family: 'CustomPreviewFont', 'Helvetica Neue', Arial, sans-serif;
        }
        .card-item {
          position: relative;
          box-sizing: border-box;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .js-desc strong { color: #1a1a1a; font-weight: 600; }
        .content-scale { transform-origin: center center; }
      `}</style>

      <div className="nextstep-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-16 box-border content-scale"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}
        >
          {/* 顶部标题 - NeXTSTEP 风格标题栏 */}
          <div className="flex flex-col items-center">
            <div style={{
              padding: '18px 36px',
              background: '#e8e8e8',
              border: '2px solid #a0a0a0',
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}>
              <h1
                ref={titleRef}
                className="text-center nextstep-title"
                style={{ fontSize: titleConfig.initialFontSize }}
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
                const theme = NEXT_GRAY[idx % NEXT_GRAY.length];
                return (
                  <div 
                    key={idx} 
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: theme.bg,
                      border: `2px solid ${theme.border}`,
                      borderRadius: '4px',
                      padding: layout.cardPadding
                    }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span 
                        className="js-icon material-symbols-rounded"
                        style={{ fontSize: layout.iconSize, color: theme.icon }}
                      >
                        {card.icon}
                      </span>
                      <h3 
                        className={`js-title font-semibold ${layout.titleSizeClass}`}
                        style={{ 
                          color: theme.text,
                          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                          letterSpacing: '-0.5px'
                        }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc ${layout.descSizeClass}`}
                      style={{ color: theme.text, opacity: 0.85, lineHeight: '1.5' }}
                      dangerouslySetInnerHTML={{ __html: autoAddSpaceToHtml(card.desc) }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* SSR Scripts */}
      <script dangerouslySetInnerHTML={{ __html: generateTitleFitScript(titleConfig) }} />
      <script dangerouslySetInnerHTML={{ __html: generateViewportFitScript() }} />
    </div>
  );
};

import { generateDownloadableHtml } from '../utils/template';

export const nextstepTemplate: TemplateConfig = {
  id: 'nextstep',
  name: '对象化工作台',
  description: '1989年对象化桌面风格 - 极简灰阶、面板窗口、列视图体系',
  icon: 'view_column',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <NeXTSTEP data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'nextstep'),
};

export { NeXTSTEP };
