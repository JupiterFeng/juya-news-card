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
 * ChromeosMaterialYou 渲染组件
 * ChromeOS "Material You 化" (2023) 风格
 * 更圆润的控件、更现代的系统面板、主题一致性
 */
const THEME_COLORS = [
  { bg: '#f2f5fa', text: '#1a1c1e', icon: '#1a73e8', accent: '#e8f0fe' },
  { bg: '#fef7e0', text: '#1a1c1e', icon: '#f9ab00', accent: '#fef7e0' },
  { bg: '#fce8e6', text: '#1a1c1e', icon: '#ea4335', accent: '#fce8e6' },
  { bg: '#e6f4ea', text: '#1a1c1e', icon: '#34a853', accent: '#e6f4ea' },
];

interface ChromeosMaterialYouProps {
  data: GeneratedContent;
  scale: number;
}

const ChromeosMaterialYou: React.FC<ChromeosMaterialYouProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const cardCount = data.cards.length;
  const layout = calculateStandardLayout(cardCount);
  const titleConfig = getStandardTitleConfig(cardCount);
  const cardZoneInsetX = cardCount <= 3 ? '40px' : '0px';
  const cardZoneMaxWidth = cardCount === 2 ? '1480px' : cardCount === 3 ? '1680px' : '100%';

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
        .chromeos-container {
          font-family: 'CustomPreviewFont', 'Google Sans', 'Roboto', sans-serif;
          background: #ffffff;
          color: #1a1c1e;
        }
        .chromeos-title {
          font-weight: 500;
          font-family: 'CustomPreviewFont', 'Google Sans', sans-serif;
        }
        .card-item {
          position: relative;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .js-desc strong { color: #1a1c1e; font-weight: 500; }
        .content-scale { transform-origin: center center; }
      `}</style>

      <div className="chromeos-container relative box-border w-full h-full overflow-hidden flex flex-col">
        {/* ChromeOS 状态栏 */}
        <div style={{
          height: '32px',
          background: '#ffffff',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: '12px',
          fontSize: '13px'
        }}>
          <span style={{ opacity: 0.7 }}>9:41 AM</span>
          <div style={{ flex: 1 }}></div>
          <span className="material-symbols-rounded" style={{ fontSize: '18px', opacity: 0.6 }}>wifi</span>
          <span className="material-symbols-rounded" style={{ fontSize: '18px', opacity: 0.6 }}>battery_full</span>
          <span className="material-symbols-rounded" style={{ fontSize: '18px', opacity: 0.6 }}>notifications</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div
            ref={wrapperRef}
            className="content-wrapper w-full flex flex-col items-center px-16 box-border content-scale"
            style={{
              gap: layout.wrapperGap,
              paddingLeft: layout.wrapperPaddingX ? `max(${layout.wrapperPaddingX}, 80px)` : '80px',
              paddingRight: layout.wrapperPaddingX ? `max(${layout.wrapperPaddingX}, 80px)` : '80px',
            }}
          >
            {/* 顶部标题 */}
            <div className="flex flex-col items-center">
              <div style={{
                padding: '20px 40px',
                background: '#1a73e8',
                borderRadius: '24px',
                boxShadow: '0 4px 20px rgba(26, 115, 232, 0.25)'
              }}>
                <h1
                  ref={titleRef}
                  className={`text-center chromeos-title ${layout.titleSizeClass}`}
                  style={{ color: '#ffffff' }}
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
                  const theme = THEME_COLORS[idx % THEME_COLORS.length];
                  return (
                    <div 
                      key={idx} 
                      data-card-item="true"
                      className={`card-item flex flex-col ${cardCount > 1 ? layout.cardWidthClass : 'w-2/3'}`}
                      style={{ 
                        backgroundColor: theme.bg,
                        padding: layout.cardPadding,
                        maxWidth: cardCount === 2 ? '680px' : cardCount === 3 ? '520px' : undefined
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
                          className={`js-title font-medium ${layout.titleSizeClass}`}
                          style={{ 
                            color: theme.text,
                            fontFamily: '"Google Sans", "Roboto", sans-serif'
                          }}
                        >
                          {card.title}
                        </h3>
                      </div>
                      <p
                        className={`js-desc ${layout.descSizeClass}`}
                        style={{ 
                          color: theme.text,
                          opacity: 0.75,
                          lineHeight: '1.5'
                        }}
                        dangerouslySetInnerHTML={{ __html: card.desc }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ChromeOS 底架 */}
        <div style={{
          height: '48px',
          background: '#f8f9fa',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#e8f0fe'
          }}>
            <span className="material-symbols-rounded" style={{ fontSize: '20px', color: '#1a73e8' }}>apps</span>
          </div>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#1a73e8'
          }}></div>
        </div>
      </div>
      
      {/* SSR Scripts */}
      <script dangerouslySetInnerHTML={{ __html: generateTitleFitScript(titleConfig) }} />
      <script dangerouslySetInnerHTML={{ __html: generateViewportFitScript() }} />
    </div>
  );
};

export const chromeosMaterialYouTemplate: TemplateConfig = {
  id: 'chromeosMaterialYou',
  name: '卡片化材质系统',
  description: '2023年卡片化材质风格 - 圆润控件、现代面板',
  icon: 'laptop',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <ChromeosMaterialYou data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'chromeosMaterialYou'),
};

export { ChromeosMaterialYou };
