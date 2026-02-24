import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import {
  calculateStandardLayout,
  getStandardTitleConfig,
  generateTitleFitScript,
  generateViewportFitScript,
} from '../utils/layout-calculator';

/**
 * WindowsXpLuna 渲染组件
 * Windows XP "Luna（彩色塑料）" (2001) 风格
 * 彩色塑料感、圆角标题栏、强调按钮可点击性
 */

const THEME_COLORS = [
  { header: '#245edb', headerGrad: '#0a246e', bg: '#ffffff', text: '#000000', icon: '#245edb', border: '#7aa9ea' },
  { header: '#3d8ed9', headerGrad: '#0e4a8a', bg: '#ffffff', text: '#000000', icon: '#3d8ed9', border: '#8cb8f0' },
  { header: '#286ac7', headerGrad: '#103c7a', bg: '#ffffff', text: '#000000', icon: '#286ac7', border: '#7aa9ea' },
  { header: '#1e5ebb', headerGrad: '#082e66', bg: '#ffffff', text: '#000000', icon: '#1e5ebb', border: '#6ba0e8' },
];

interface WindowsXpLunaProps {
  data: GeneratedContent;
  scale: number;
}

const WindowsXpLuna: React.FC<WindowsXpLunaProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const taskbarTime = '09:41';

  const N = data?.cards?.length || 0;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N <= 3 ? '44px' : '28px';
  const cardZoneMaxWidth = N === 1 ? '1320px' : N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

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
        .luna-container {
          font-family: 'CustomPreviewFont', 'Tahoma', 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #3c8adb 0%, #1a5fb4 100%);
          color: #000000;
        }
        .luna-title {
          font-weight: 700;
          color: #ffffff;
          font-family: 'CustomPreviewFont', 'Tahoma', sans-serif;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .card-item {
          position: relative;
          box-sizing: border-box;
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .js-desc strong { color: #000000; font-weight: 700; }
        .content-scale { transform-origin: center center; }
        .luna-taskbar {
          background: linear-gradient(180deg, #245edb 0%, #1941a5 100%);
          border-top: 1px solid #4a90e2;
        }
      `}</style>

      <div
        className="luna-container relative box-border w-full h-full overflow-hidden flex flex-col"
      >
        {/* 桌面区域 */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div
            ref={wrapperRef}
            className="content-wrapper w-full flex flex-col items-center px-16 box-border content-scale"
            style={{
              gap: layout.wrapperGap,
              paddingLeft: layout.wrapperPaddingX ? `max(${layout.wrapperPaddingX}, 88px)` : '88px',
              paddingRight: layout.wrapperPaddingX ? `max(${layout.wrapperPaddingX}, 88px)` : '88px'
            }}
          >
            {/* 顶部标题栏 */}
            <div className="flex flex-col items-center w-full">
              <div style={{
                width: '100%',
                padding: '14px 20px',
                background: 'linear-gradient(180deg, #245edb 0%, #0a246e 100%)',
                borderRadius: '8px',
                border: '1px solid #4a90e2'
              }}>
                <h1
                  ref={titleRef}
                  className={`text-center luna-title ${layout.titleSizeClass}`}
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
                      className={`card-item flex flex-col ${N === 1 ? '' : layout.cardWidthClass}`}
                      style={{
                        ...(N === 1 ? { width: '70%', maxWidth: '1180px' } : {}),
                        backgroundColor: theme.bg,
                        border: `1px solid ${theme.border}`,
                        borderRadius: '8px',
                        overflow: 'hidden',
                        padding: 0
                      }}
                    >
                      <div
                        className="luna-header flex items-center gap-3"
                        style={{
                          background: `linear-gradient(180deg, ${theme.header} 0%, ${theme.headerGrad} 100%)`,
                          padding: '10px 14px'
                        }}
                      >
                        <span 
                             className="js-icon material-symbols-rounded"
                             style={{ fontSize: layout.iconSize, color: '#ffffff' }}
                           >
                          {card.icon}
                        </span>
                        <h3
                          className={`js-title font-bold ${layout.titleSizeClass}`}
                          style={{
                            color: '#ffffff',
                            fontFamily: '"Tahoma", "Segoe UI", sans-serif',
                            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                          }}
                        >
                          {card.title}
                        </h3>
                      </div>
                      <div
                        className="luna-body"
                        style={{ padding: layout.cardPadding }}
                      >
                        <p
                          className={`js-desc ${layout.descSizeClass}`}
                          style={{ color: theme.text, lineHeight: '1.4' }}
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

        {/* 任务栏 */}
        <div className="luna-taskbar" style={{
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 8px',
          gap: '6px'
        }}>
          <div style={{
            padding: '4px 12px',
            background: 'linear-gradient(180deg, #3a95f0 0%, #1e68d3 100%)',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            <span className="material-icons" style={{ fontSize: '16px' }}>windows</span>
            start
          </div>
          <div style={{ flex: 1 }}></div>
          <div style={{
            padding: '4px 10px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '3px',
            fontSize: '11px',
            color: '#ffffff'
          }}>
            {taskbarTime}
          </div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: generateTitleFitScript(titleConfig) }} />
      <script dangerouslySetInnerHTML={{ __html: generateViewportFitScript() }} />
    </div>
  );
};

import { generateDownloadableHtml } from '../utils/template';

export const windowsXpLunaTemplate: TemplateConfig = {
  id: 'windowsXpLuna',
  name: '彩塑界面经典',
  description: '2001年彩塑质感界面风格 - 圆角、渐变、亲和布局',
  icon: 'computer',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <WindowsXpLuna data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'windowsXpLuna'),
};

export { WindowsXpLuna };
