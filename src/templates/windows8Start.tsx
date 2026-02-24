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
 * Windows8Start 渲染组件
 * Windows 8 "Start Screen / Live Tiles（全屏信息面板）" (2012) 风格
 * 磁贴、模块化布局、扁平色块、动态信息展示
 */

const THEME_COLORS = [
  { bg: '#1fa3d0', text: '#ffffff', icon: '#ffffff' },  // 青色
  { bg: '#d64d4d', text: '#ffffff', icon: '#ffffff' },  // 红色
  { bg: '#4d9d4d', text: '#ffffff', icon: '#ffffff' },  // 绿色
  { bg: '#d6a64d', text: '#ffffff', icon: '#ffffff' },  // 橙色
  { bg: '#9b4dd6', text: '#ffffff', icon: '#ffffff' },  // 紫色
  { bg: '#4d8cd6', text: '#ffffff', icon: '#ffffff' },  // 蓝色
];

interface Windows8StartProps {
  data: GeneratedContent;
  scale: number;
}

const Windows8Start: React.FC<Windows8StartProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const N = data?.cards?.length || 0;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);

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
        .win8-container {
          font-family: 'CustomPreviewFont', 'Segoe UI', 'Helvetica Neue', sans-serif;
          background: linear-gradient(135deg, #1d1d1d 0%, #0a0a0a 100%);
          color: #ffffff;
        }
        .win8-title {
          font-weight: 300;
          color: '#ffffff';
          font-family: 'CustomPreviewFont', 'Segoe UI', sans-serif';
          letter-spacing: -0.02em;
        }
        .card-item {
          position: relative;
        }
                .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
                .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
                .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .js-desc strong { color: inherit; font-weight: 400; }
        .content-scale { transform-origin: center center; }
      `}</style>

      <div
        className="win8-container relative box-border w-full h-full overflow-hidden flex flex-col"
      >
        {/* Windows 8 字符栏 */}
        <div style={{
          height: '40px',
          background: '#1d1d1d',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: '16px',
          color: '#ffffff',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          <span style={{ fontSize: '24px' }}>&#9776;</span>
          <span style={{ opacity: 0.9 }}>User</span>
          <div style={{ flex: 1 }}></div>
          <span className="material-icons" style={{ fontSize: '18px' }}>search</span>
          <span className="material-icons" style={{ fontSize: '18px' }}>settings</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div
            ref={wrapperRef}
            className="content-wrapper w-full flex flex-col items-center px-16 box-border content-scale"
            style={{ gap: layout.wrapperGap, paddingLeft: layout.wrapperPaddingX, paddingRight: layout.wrapperPaddingX }}
          >
            {/* 顶部标题 */}
            <div className="flex flex-col items-center">
              <h1
                ref={titleRef}
                className={`text-center win8-title ${layout.titleSizeClass}`}
                style={{
                  padding: '20px 40px',
                  background: 'rgba(31, 163, 208, 0.3)',
                  borderLeft: '4px solid #1fa3d0'
                }}
              >
                {data.mainTitle}
              </h1>
            </div>

            {/* 卡片区域 - 磁贴风格 */}
            <div className="card-zone flex-none w-full">
              <div
                className="w-full flex flex-wrap justify-center content-center"
                style={{ gap: layout.containerGap, '--container-gap': layout.containerGap } as React.CSSProperties}
              >
                {data.cards.map((card, idx) => {
                  const theme = THEME_COLORS[idx % THEME_COLORS.length];
                  return (
                    <div
                      key={idx}
                      className={`card-item flex flex-col ${layout.cardWidthClass}`}
                      style={{
                        backgroundColor: theme.bg,
                        padding: layout.cardPadding,
                        boxShadow: '0 0 0 2px rgba(255,255,255,0.1), 0 4px 16px rgba(0,0,0,0.2)'
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
                          className={`js-title font-light ${layout.titleSizeClass}`}
                          style={{
                            color: theme.text,
                            fontFamily: '"Segoe UI", "Helvetica Neue", sans-serif',
                            fontWeight: 300
                          }}
                        >
                          {card.title}
                        </h3>
                      </div>
                      <p
                        className={`js-desc ${layout.descSizeClass}`}
                        style={{ color: theme.text, opacity: 0.9, lineHeight: '1.5' }}
                        dangerouslySetInnerHTML={{ __html: card.desc }}
                      />
                    </div>
                  );
                })}
              </div>
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

export const windows8StartTemplate: TemplateConfig = {
  id: 'windows8Start',
  name: '磁贴信息屏',
  description: '2012年磁贴信息屏风格 - 模块化、动态信息',
  icon: 'view_module',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <Windows8Start data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'windows8Start'),
};

export { Windows8Start };
