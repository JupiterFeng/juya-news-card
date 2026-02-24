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
 * Windows11 渲染组件
 * Windows 11 "圆角 + 新图标 + Mica 材质" (2021) 风格
 * 更柔和的几何与材质、居中任务栏、图标体系重做
 */

const THEME_COLORS = [
  { bg: 'rgba(255, 255, 255, 0.85)', text: '#202020', icon: '#0067c0', border: 'rgba(0,0,0,0.06)' },
  { bg: 'rgba(255, 255, 255, 0.80)', text: '#202020', icon: '#0067c0', border: 'rgba(0,0,0,0.06)' },
  { bg: 'rgba(255, 255, 255, 0.85)', text: '#202020', icon: '#0067c0', border: 'rgba(0,0,0,0.06)' },
  { bg: 'rgba(255, 255, 255, 0.80)', text: '#202020', icon: '#0067c0', border: 'rgba(0,0,0,0.06)' },
];

interface Windows11Props {
  data: GeneratedContent;
  scale: number;
}

const Windows11: React.FC<Windows11Props> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const taskbarTime = '09:41';

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
        .win11-container {
          font-family: 'CustomPreviewFont', 'Segoe UI Variable', 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #f0f4f8 0%, #e8f0f5 100%);
          color: #202020;
        }
        .win11-title {
          font-weight: 600;
          color: '#202020';
          font-family: 'CustomPreviewFont', 'Segoe UI Variable', sans-serif;
        }
        .card-item {
          position: relative;
        }
                .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
                .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
                .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .js-desc strong { color: #202020; font-weight: 600; }
        .content-scale { transform-origin: center center; }
      `}</style>

      <div
        className="win11-container relative box-border w-full h-full overflow-hidden flex flex-col"
      >
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div
            ref={wrapperRef}
            className="content-wrapper w-full flex flex-col items-center px-16 box-border content-scale"
            style={{ gap: layout.wrapperGap, paddingLeft: layout.wrapperPaddingX, paddingRight: layout.wrapperPaddingX }}
          >
            {/* 顶部标题 */}
            <div className="flex flex-col items-center">
              <div style={{
                padding: '18px 36px',
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(0,0,0,0.06)',
                borderRadius: '8px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
              }}>
                <h1
                  ref={titleRef}
                  className={`text-center win11-title ${layout.titleSizeClass}`}
                >
                  {data.mainTitle}
                </h1>
              </div>
            </div>

            {/* 卡片区域 */}
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
                        backdropFilter: 'blur(40px)',
                        WebkitBackdropFilter: 'blur(40px)',
                        border: `1px solid ${theme.border}`,
                        borderRadius: '8px',
                        padding: layout.cardPadding,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)'
                      }}
                    >
                      <div className="flex items-center gap-3 mb-3">
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
                            fontFamily: '"Segoe UI Variable", "Segoe UI", sans-serif'
                          }}
                        >
                          {card.title}
                        </h3>
                      </div>
                      <p
                        className={`js-desc ${layout.descSizeClass}`}
                        style={{ color: theme.text, opacity: 0.82, lineHeight: '1.5' }}
                        dangerouslySetInnerHTML={{ __html: card.desc }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Windows 11 居中任务栏 */}
        <div style={{
          height: '48px',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(40px)',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '0 16px'
        }}>
          <div style={{
            padding: '6px 12px',
            background: 'rgba(0, 103, 192, 0.1)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px'
          }}>
            <span className="material-icons" style={{ fontSize: '16px', color: '#0067c0' }}>search</span>
            <span style={{ color: '#202020' }}>搜索</span>
          </div>
          <div style={{
            width: '40px',
            height: '40px',
            background: '#0067c0',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span className="material-icons" style={{ fontSize: '20px', color: '#ffffff' }}>widgets</span>
          </div>
          <div style={{ flex: 1 }}></div>
          <div style={{
            padding: '6px 10px',
            fontSize: '12px',
            color: '#202020'
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

export const windows11Template: TemplateConfig = {
  id: 'windows11',
  name: '现代居中桌面',
  description: '2021年现代桌面风格 - 圆角、通透材质、居中任务栏',
  icon: 'computer',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <Windows11 data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'windows11'),
};

export { Windows11 };
