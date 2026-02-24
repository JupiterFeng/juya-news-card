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
 * Ios7Flat 渲染组件
 * iOS 7 "扁平 + 半透明层（去拟物化）" (2013) 风格
 * 细线图标、更轻的层级、模糊半透明
 */
interface Ios7FlatProps {
  data: GeneratedContent;
  scale: number;
}

const Ios7Flat: React.FC<Ios7FlatProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const cardCount = data.cards.length;
  const layout = calculateStandardLayout(cardCount);
  const titleConfig = getStandardTitleConfig(cardCount, {
    titleConfigs: {
      '1-3': { initialFontSize: 70, minFontSize: 34 },
      '4': { initialFontSize: 70, minFontSize: 34 },
      '5-6': { initialFontSize: 70, minFontSize: 34 },
      '7-8': { initialFontSize: 70, minFontSize: 34 },
      '9+': { initialFontSize: 70, minFontSize: 34 }
    }
  });
  const cardZoneInsetX = cardCount === 3 || (cardCount >= 5 && cardCount <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = cardCount === 2 ? '1500px' : cardCount === 3 ? '1700px' : '100%';

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

  // iOS 7 配色 - 轻透明白色卡片
  const ios7Colors = [
    { bg: 'rgba(255, 255, 255, 0.75)', text: '#000000', icon: '#007aff' },
    { bg: 'rgba(255, 255, 255, 0.70)', text: '#000000', icon: '#ff3b30' },
    { bg: 'rgba(255, 255, 255, 0.75)', text: '#000000', icon: '#4cd964' },
    { bg: 'rgba(255, 255, 255, 0.70)', text: '#000000', icon: '#ffcc00' },
  ];

  return (
    <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', overflow: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .ios7-container {
          font-family: 'CustomPreviewFont', 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif;
          background: linear-gradient(135deg, #e8f0f8 0%, #d0e0f0 50%, #c8d8ec 100%);
          color: #000000;
        }
        .ios7-title {
          font-weight: 600;
          color: #000000;
          font-family: 'CustomPreviewFont', 'SF Pro Display', sans-serif;
          letter-spacing: -0.03em;
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .text-xs { font-size: 0.75rem; line-height: 1rem; }
        .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
        .text-base { font-size: 1rem; line-height: 1.5rem; }
        .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
        .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
        .text-2xl { font-size: 1.5rem; line-height: 2rem; }
        .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
        .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
        .text-5xl { font-size: 3rem; line-height: 1; }
        .text-6xl { font-size: 3.75rem; line-height: 1; }
        .text-7xl { font-size: 4.5rem; line-height: 1; }
        .text-8xl { font-size: 6rem; line-height: 1; }
        .text-9xl { font-size: 8rem; line-height: 1; }
        .card-item {
          transition: all 0.3s ease;
          position: relative;
        }
        .js-desc strong { color: #000000; font-weight: 600; }
        .content-scale { transform-origin: center center; }
      `}</style>

      <div
        className="ios7-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center box-border content-scale"
          style={{ 
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined
          }}
        >
          {/* 顶部标题 */}
          <div className="flex flex-col items-center">
            <div style={{
              padding: '16px 28px',
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              borderRadius: '14px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
            }}>
              <h1
                ref={titleRef}
                className={`text-center ios7-title ${layout.titleSizeClass}`}
                style={{ fontSize: titleConfig.initialFontSize + 'px' }}
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
                boxSizing: 'border-box',
              } as React.CSSProperties}
            >
              {data.cards.map((card, idx) => {
                const theme = ios7Colors[idx % ios7Colors.length];
                return (
                  <div 
                    key={idx} 
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: theme.bg,
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      borderRadius: '14px',
                      padding: layout.cardPadding,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                      border: '0.5px solid rgba(255,255,255,0.3)'
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span 
                        className="js-icon material-symbols-rounded"
                        style={{
                          fontSize: layout.iconSize,
                          color: theme.icon
                        }}
                      >{card.icon}</span>
                      <h3 
                        className={`js-title font-semibold ${layout.titleSizeClass}`}
                        style={{
                          color: theme.text,
                          fontFamily: '"SF Pro Display", "Helvetica Neue", Arial, sans-serif',
                          letterSpacing: '-0.02em'
                        }}
                      >{card.title}</h3>
                    </div>
                    <p
                      className={`js-desc leading-relaxed ${layout.descSizeClass}`}
                      style={{
                        color: theme.text,
                        opacity: 0.75
                      }}
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

import { generateDownloadableHtml } from '../utils/template';

export const ios7FlatTemplate: TemplateConfig = {
  id: 'ios7Flat',
  name: '轻透扁平界面',
  description: '2013年轻透扁平风格 - 半透明层、细线图标',
  icon: 'smartphone',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <Ios7Flat data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'ios7Flat'),
};

export { Ios7Flat };
