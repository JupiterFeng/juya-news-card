import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import {
  calculateStandardLayout,
  getStandardTitleConfig,
  getCardThemeColor,
  generateTitleFitScript,
  generateViewportFitScript,
} from '../utils/layout-calculator';
import { generateDownloadableHtml } from '../utils/template';

/**
 * Gnome3Adwaita 渲染组件
 * GNOME 3 / GNOME Shell + Adwaita (2011) 风格
 * 极简顶栏、Activities概览、统一风格体系
 */
interface Gnome3AdwaitaProps {
  data: GeneratedContent;
  scale: number;
}

const ADWAITA_COLORS = [
  { bg: '#ffffff', header: '#e8e8e8', text: '#2e3436', icon: '#3584e4', border: '#d1d1d1' },
  { bg: '#fafafa', header: '#f0f0f0', text: '#2e3436', icon: '#3584e4', border: '#dcdcdc' },
  { bg: '#f8f8f8', header: '#eeeeee', text: '#2e3436', icon: '#3584e4', border: '#d8d8d8' },
  { bg: '#f5f5f5', header: '#ebebeb', text: '#2e3436', icon: '#3584e4', border: '#d4d4d4' },
];

const Gnome3Adwaita: React.FC<Gnome3AdwaitaProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const topbarTime = '09:41';

  const N = data?.cards?.length || 0;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);

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
        .gnome3-container {
          font-family: 'CustomPreviewFont', 'Cantarell', 'Segoe UI', Arial, sans-serif;
          background: linear-gradient(135deg, #e8e8e8 0%, #d8d8d8 100%);
          color: #2e3436;
        }
        .gnome3-title {
          font-weight: 600;
          color: #2e3436;
          font-family: 'CustomPreviewFont', 'Cantarell', sans-serif;
          white-space: nowrap;
        }
        .card-item {
          position: relative;
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .js-desc strong { color: #2e3436; font-weight: 600; }
        .content-scale { transform-origin: center center; }
      `}</style>

      <div className="gnome3-container relative box-border w-full h-full overflow-hidden flex flex-col">
        {/* GNOME 3 顶栏 */}
        <div style={{
          height: '32px',
          background: '#1c1c1c',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          gap: '16px',
          color: '#ffffff',
          fontSize: '13px',
          fontWeight: '500'
        }}>
          <span style={{ opacity: 0.7 }}>Activities</span>
          <div style={{ flex: 1 }}></div>
          <span style={{ opacity: 0.9 }}>{topbarTime}</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div
            ref={wrapperRef}
            className="content-wrapper w-full flex flex-col items-center px-16 box-border content-scale"
            style={{ 
              gap: layout.wrapperGap,
              paddingLeft: layout.wrapperPaddingX,
              paddingRight: layout.wrapperPaddingX
            }}
          >
            {/* 顶部标题 */}
            <div className="flex flex-col items-center">
              <div style={{
                padding: '16px 28px',
                background: '#ffffff',
                border: '1px solid #d1d1d1',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                <h1
                  ref={titleRef}
                  className="text-center gnome3-title"
                  style={{ fontSize: titleConfig.initialFontSize }}
                >
                  {data.mainTitle}
                </h1>
              </div>
            </div>

            {/* 卡片区域 */}
            <div className="card-zone flex-none w-full">
              <div
                className="w-full flex flex-wrap justify-center content-center"
                style={{ 
                  gap: layout.containerGap,
                  '--container-gap': layout.containerGap
                } as React.CSSProperties}
              >
                {data.cards.map((card, idx) => {
                  const theme = getCardThemeColor(ADWAITA_COLORS, idx);
                  return (
                    <div 
                      key={idx} 
                      className={`card-item flex flex-col ${layout.cardWidthClass}`}
                      style={{
                        backgroundColor: theme.bg,
                        border: `1px solid ${theme.border}`,
                        borderRadius: '8px',
                        padding: layout.cardPadding,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
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
                          style={{ color: theme.text, fontFamily: '"Cantarell", "Segoe UI", Arial, sans-serif' }}
                        >
                          {card.title}
                        </h3>
                      </div>
                      <p
                        className={`js-desc ${layout.descSizeClass}`}
                        style={{ color: theme.text, opacity: 0.8, lineHeight: '1.5' }}
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

      <script dangerouslySetInnerHTML={{
        __html: `
          ${generateTitleFitScript(titleConfig)}
          ${generateViewportFitScript()}
        `
      }} />
    </div>
  );
};

export const gnome3AdwaitaTemplate: TemplateConfig = {
  id: 'gnome3Adwaita',
  name: '极简顶栏桌面',
  description: '2011年极简顶栏桌面风格 - 活动概览与统一控件体系',
  icon: 'view_day',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <Gnome3Adwaita data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'gnome3Adwaita'),
};

export { Gnome3Adwaita };
