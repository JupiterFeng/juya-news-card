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
 * LiquidGlass 渲染组件
 * Apple "Liquid Glass（实时渲染玻璃语言）" (2025) 风格
 * 玻璃从静态透明升级为实时渲染、随环境与动势变化
 */
interface LiquidGlassProps {
  data: GeneratedContent;
  scale: number;
}

const LIQUID_GLASS_COLORS = [
  { bg: 'rgba(255, 255, 255, 0.25)', text: '#1d1d1f', icon: '#0071e3' },
  { bg: 'rgba(220, 230, 255, 0.35)', text: '#1d1d1f', icon: '#0071e3' },
  { bg: 'rgba(200, 220, 255, 0.30)', text: '#1d1d1f', icon: '#0071e3' },
  { bg: 'rgba(240, 245, 255, 0.25)', text: '#1d1d1f', icon: '#0071e3' },
];

const LiquidGlass: React.FC<LiquidGlassProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const cardCount = data.cards.length;
  const layout = calculateStandardLayout(cardCount);
  const titleConfig = getStandardTitleConfig(cardCount);
  const isEdgeSensitiveCount = cardCount === 3 || (cardCount >= 5 && cardCount <= 8);
  const cardZoneInsetX = isEdgeSensitiveCount ? '36px' : '0px';
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
        .liquid-glass-container {
          font-family: 'CustomPreviewFont', 'SF Pro Display', -apple-system, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%);
          background-size: 400% 400%;
          animation: gradientShift 20s ease infinite;
          color: #1d1d1f;
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .liquid-glass-title {
          font-weight: 600;
          color: #ffffff;
          font-family: 'CustomPreviewFont', 'SF Pro Display', sans-serif;
          text-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        .card-item {
          position: relative;
          transition: transform 0.3s ease;
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .text-5-5xl { font-size: 3.375rem; line-height: 1.1; }
        .text-4-5xl { font-size: 2.625rem; line-height: 1.2; }
        .text-3-5xl { font-size: 2.0625rem; line-height: 1.3; }
        .text-2-5xl { font-size: 1.8125rem; line-height: 1.4; }
        .js-desc strong { color: #1d1d1f; font-weight: 600; }
        .content-scale { transform-origin: center center; }
      `}</style>

      <div
        className="liquid-glass-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        {/* 动态光晕效果 */}
        <div style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
          top: '20%',
          left: '10%',
          pointerEvents: 'none',
          filter: 'blur(60px)'
        }}></div>
        <div style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(0,113,227,0.2) 0%, transparent 70%)',
          bottom: '20%',
          right: '15%',
          pointerEvents: 'none',
          filter: 'blur(50px)'
        }}></div>

        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-24 box-border content-scale relative z-10"
          style={{ 
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX ? `max(${layout.wrapperPaddingX}, 64px)` : '64px',
            paddingRight: layout.wrapperPaddingX ? `max(${layout.wrapperPaddingX}, 64px)` : '64px'
          }}
        >
          {/* 顶部标题 - Liquid Glass */}
          <div className="flex flex-col items-center">
            <div style={{
              padding: '24px 48px',
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(60px) saturate(180%)',
              borderRadius: '24px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.4)'
            }}>
              <h1
                ref={titleRef}
                className={`text-center liquid-glass-title ${layout.titleSizeClass}`}
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
                const theme = LIQUID_GLASS_COLORS[idx % LIQUID_GLASS_COLORS.length];
                return (
                  <div 
                    key={idx} 
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: theme.bg,
                      backdropFilter: 'blur(60px) saturate(180%)',
                      borderRadius: '20px',
                      padding: layout.cardPadding,
                      boxShadow: `
                        0 8px 32px rgba(0, 0, 0, 0.12),
                        inset 0 1px 0 rgba(255, 255, 255, 0.5),
                        inset 0 -1px 0 rgba(0, 0, 0, 0.1),
                        0 0 80px rgba(0, 113, 227, 0.15)
                      `,
                      border: '1px solid rgba(255, 255, 255, 0.4)'
                    }}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <span 
                        className="js-icon material-symbols-rounded"
                        style={{
                          fontSize: layout.iconSize,
                          color: theme.icon,
                          filter: 'drop-shadow(0 2px 8px rgba(0,113,227,0.4))'
                        }}
                      >
                        {card.icon}
                      </span>
                      <h3 
                        className={`js-title font-semibold ${layout.titleSizeClass}`}
                        style={{
                          color: theme.text,
                          fontFamily: '"SF Pro Display", -apple-system, sans-serif',
                          textShadow: '0 1px 2px rgba(255,255,255,0.3)'
                        }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc ${layout.descSizeClass}`}
                      style={{
                        color: theme.text,
                        opacity: '0.85',
                        lineHeight: '1.6'
                      }}
                      dangerouslySetInnerHTML={{ __html: autoAddSpaceToHtml(card.desc) }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SSR Scripts */}
        <script dangerouslySetInnerHTML={{ __html: generateTitleFitScript(titleConfig) }} />
        <script dangerouslySetInnerHTML={{ __html: generateViewportFitScript() }} />
      </div>
    </div>
  );
};

import { generateDownloadableHtml } from '../utils/template';

export const liquidGlassTemplate: TemplateConfig = {
  id: 'liquidGlass',
  name: '液态玻璃界面',
  description: '2025年实时渲染液态玻璃风格 - 环境响应与通透层次',
  icon: 'water_drop',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <LiquidGlass data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'liquidGlass'),
};

export { LiquidGlass };
