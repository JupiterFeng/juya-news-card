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
 * CalmTechnology 渲染组件
 * 平静技术：需要时出现，不需要时退到背景，减少打扰
 * 特点：柔和色彩、微妙动画、环境提示、非侵入式通知
 */
interface CalmTechnologyProps {
  data: GeneratedContent;
  scale: number;
}

const THEME_COLORS = [
  { bg: '#F5F5F0', primary: '#5C6B57', accent: '#8B9A83', glow: 'rgba(92,107,87,0.15)', mood: '宁静' },
  { bg: '#F0F4F5', primary: '#4A5B5C', accent: '#7A8B8C', glow: 'rgba(74,91,92,0.15)', mood: '平和' },
  { bg: '#F8F5F0', primary: '#6B5B4A', accent: '#9A8A7B', glow: 'rgba(107,91,74,0.15)', mood: '温暖' },
  { bg: '#F0F5F4', primary: '#4A6B5C', accent: '#7A9A8B', glow: 'rgba(74,107,92,0.15)', mood: '清新' },
  { bg: '#F5F0F4', primary: '#6B4A5C', accent: '#9A7A8B', glow: 'rgba(107,74,92,0.15)', mood: '柔和' },
  { bg: '#F2F5F0', primary: '#5A6B4A', accent: '#8A9A7A', glow: 'rgba(90,107,74,0.15)', mood: '自然' },
];

const CalmTechnology: React.FC<CalmTechnologyProps> = ({ data, scale }) => {
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

    const fitTitle = () => {
      let size = titleConfig.initialFontSize;
      title.style.fontSize = size + 'px';
      let guard = 0;
      while (title.scrollWidth > 1700 && size > titleConfig.minFontSize && guard < 100) {
        size -= 1;
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
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Roboto:wght@400;500;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'Inter', 'Roboto', 'CustomPreviewFont', sans-serif;
          background: linear-gradient(180deg, #FAFAFA 0%, #F5F5F0 50%, #FAFAFA 100%);
          color: #5C6B57;
          position: relative;
        }
        /* 呼吸光晕动画 */
        @keyframes breathe {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .main-container::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(139,154,131,0.08) 0%, transparent 70%);
          animation: breathe 8s ease-in-out infinite;
          pointer-events: none;
        }
        /* 状态指示器 */
        .main-container::after {
          content: '●';
          position: absolute;
          bottom: 24px;
          right: 24px;
          font-size: 12px;
          color: #8B9A83;
          animation: breathe 4s ease-in-out infinite;
        }
        .calm-title {
          font-weight: 500;
          color: #5C6B57;
          letter-spacing: 0.03em;
          line-height: 1.3;
          position: relative;
          white-space: nowrap;
        }
        /* 叶子装饰 */
        .calm-title::before {
          content: '🌿';
          position: absolute;
          left: -36px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 20px;
          opacity: 0.7;
        }
        /* 轻云装饰 */
        .calm-title::after {
          content: '☁';
          position: absolute;
          right: -32px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 18px;
          opacity: 0.5;
        }
        .card-item {
          position: relative;
        }

        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }

        .text-5-5xl { font-size: 3.375rem; line-height: 1.1; }
        .text-4-5xl { font-size: 2.625rem; line-height: 1.2; }
        .text-3-5xl { font-size: 2.0625rem; line-height: 1.3; }
        .text-2-5xl { font-size: 1.8125rem; line-height: 1.4; }

        .text-6xl { font-size: 3.75rem; line-height: 1; }
        .text-5xl { font-size: 3rem; line-height: 1; }
        .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
        .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
        .text-2xl { font-size: 1.5rem; line-height: 2rem; }
        .text-xl  { font-size: 1.25rem; line-height: 1.75rem; }

        .content-scale { transform-origin: center center; }
        .material-symbols-rounded { font-family: 'Material Symbols Rounded' !important; font-weight: normal; font-style: normal; display: inline-block; }
      `}</style>

      <div className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-16 box-border content-scale relative z-10"
          style={{ 
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined
          }}
        >
          <div className="flex flex-col items-center mb-4">
            <h1 
              ref={titleRef} 
              className={`text-center calm-title ${layout.titleSizeClass}`}
              style={{ fontSize: titleConfig.initialFontSize + 'px' }}
            >
              {data.mainTitle}
            </h1>
          </div>

          <div className="card-zone flex-none w-full">
            <div
              className="w-full flex flex-wrap justify-center content-center"
              style={{ 
                gap: layout.containerGap,
                '--container-gap': layout.containerGap
              } as React.CSSProperties}
            >
              {data.cards.map((card, idx) => {
                const theme = getCardThemeColor(THEME_COLORS, idx) as any;
                return (
                  <div 
                    key={idx} 
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: theme.bg,
                      borderRadius: '20px',
                      border: '1px solid rgba(0,0,0,0.04)',
                      boxShadow: `0 2px 12px ${theme.glow}, 0 0 0 1px rgba(0,0,0,0.02)`,
                      padding: layout.cardPadding,
                    }}
                  >
                    {/* 情绪标签 - 微妙显示 */}
                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      left: '16px',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '9px',
                      fontWeight: 500,
                      color: theme.accent,
                      background: theme.glow,
                      padding: '3px 8px',
                      borderRadius: '10px',
                      opacity: 0.6,
                    }}>
                      {theme.mood}
                    </div>
                    {/* 微光指示 */}
                    <div style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '12px',
                      width: '6px',
                      height: '6px',
                      background: theme.accent,
                      borderRadius: '50%',
                      opacity: 0.4,
                      animation: 'breathe 3s ease-in-out infinite',
                    }} />

                    <div className="flex items-center gap-3 mb-3">
                      <span 
                        className="js-icon material-symbols-rounded"
                        style={{ 
                          fontSize: layout.iconSize, 
                          color: theme.accent,
                          width: layout.iconSize,
                          height: layout.iconSize,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '14px',
                          backgroundColor: `${theme.accent}15`,
                          border: `1px solid ${theme.accent}30`
                        }}
                      >
                        {card.icon}
                      </span>
                      <h3 
                        className={`js-title font-medium leading-tight ${layout.titleSizeClass}`}
                        style={{ color: theme.primary, letterSpacing: '0.02em' }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
                      style={{ color: '#6B6B6B', opacity: 0.85 }}
                      dangerouslySetInnerHTML={{ __html: card.desc }}
                    />
                  </div>
                );
              })}
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

export const calmTechnologyTemplate: TemplateConfig = {
  id: 'calmTechnology',
  name: '平静技术',
  description: '非侵入式设计，柔和色彩与环境提示',
  icon: 'nights_stay',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <CalmTechnology data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'calmTechnology'),
};

export { CalmTechnology };
