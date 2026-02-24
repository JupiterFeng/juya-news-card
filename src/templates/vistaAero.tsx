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
 * VistaAero 渲染组件
 * Windows Vista "Aero Glass（玻璃拟真）" (2007) 风格
 * 玻璃半透明、光晕、模糊、强烈的层次深度
 */
interface VistaAeroProps {
  data: GeneratedContent;
  scale: number;
}

const AERO_COLORS = [
  { glass: 'rgba(80, 120, 200, 0.4)', glow: 'rgba(100, 180, 255, 0.3)', text: '#ffffff', icon: '#7ed9ff' },
  { glass: 'rgba(60, 100, 180, 0.4)', glow: 'rgba(80, 160, 240, 0.3)', text: '#ffffff', icon: '#7ed9ff' },
  { glass: 'rgba(70, 110, 190, 0.4)', glow: 'rgba(90, 170, 250, 0.3)', text: '#ffffff', icon: '#7ed9ff' },
  { glass: 'rgba(50, 90, 170, 0.4)', glow: 'rgba(70, 150, 230, 0.3)', text: '#ffffff', icon: '#7ed9ff' },
];

const VistaAero: React.FC<VistaAeroProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const cardCount = data?.cards?.length || 0;
  const layout = calculateStandardLayout(cardCount);
  const titleConfig = getStandardTitleConfig(cardCount);
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

  return (
    <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', overflow: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .aero-container {
          font-family: 'CustomPreviewFont', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
          background: linear-gradient(135deg, #1a3a5c 0%, #0d1f33 50%, #0a1520 100%);
          color: #ffffff;
          position: relative;
        }
        .aero-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 20% 30%, rgba(60, 140, 220, 0.2) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(40, 100, 180, 0.15) 0%, transparent 50%);
          pointer-events: none;
        }
        .aero-title {
          font-weight: 300;
          color: #ffffff;
          font-family: 'CustomPreviewFont', 'Segoe UI', sans-serif;
          text-shadow: 0 2px 20px rgba(100, 180, 255, 0.5), 0 0 40px rgba(100, 180, 255, 0.3);
        }
        .card-item {
          position: relative;
          box-sizing: border-box;
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .js-desc strong { color: #ffffff; font-weight: 600; }
        .content-scale { transform-origin: center center; }
      `}</style>

      <div
        className="aero-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-16 box-border content-scale relative z-10"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined
          }}
        >
          {/* 顶部标题 - Aero 玻璃标题栏 */}
          <div className="flex flex-col items-center">
            <div style={{
              padding: '18px 36px',
              background: 'rgba(60, 120, 200, 0.5)',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '10px',
              boxShadow: '0 8px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 0 60px rgba(100, 180, 255, 0.3)'
            }}>
              <h1
                ref={titleRef}
                className={`text-center aero-title ${layout.titleSizeClass}`}
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
                const theme = AERO_COLORS[idx % AERO_COLORS.length];
                return (
                  <div 
                    key={idx} 
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: theme.glass,
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '8px',
                      padding: layout.cardPadding,
                      boxShadow: `
                        0 8px 32px rgba(0, 0, 0, 0.3),
                        inset 0 1px 0 rgba(255, 255, 255, 0.4),
                        inset 0 -1px 0 rgba(0, 0, 0, 0.1),
                        0 0 40px ${theme.glow}
                      `
                    }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span 
                        className="js-icon material-symbols-rounded"
                        style={{
                          fontSize: layout.iconSize,
                          color: theme.icon,
                          filter: 'drop-shadow(0 0 10px rgba(126,217,255,0.6))'
                        }}
                      >
                        {card.icon}
                      </span>
                      <h3 
                        className={`js-title font-semibold ${layout.titleSizeClass}`}
                        style={{
                          color: theme.text,
                          fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
                          textShadow: '0 2px 8px rgba(0,0,0,0.5), 0 0 20px rgba(100,180,255,0.4)'
                        }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc ${layout.descSizeClass}`}
                      style={{
                        color: theme.text,
                        textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                        opacity: '0.95',
                        lineHeight: '1.5'
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

export const vistaAeroTemplate: TemplateConfig = {
  id: 'vistaAero',
  name: '玻璃光晕桌面',
  description: '2007年玻璃光晕桌面风格 - 半透明、光晕、模糊',
  icon: 'blur_on',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <VistaAero data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'vistaAero'),
};

export { VistaAero };
