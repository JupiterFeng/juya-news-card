import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import { 
  calculateStandardLayout, 
  getStandardTitleConfig, 
  generateTitleFitScript, 
  generateViewportFitScript 
} from '../utils/layout-calculator';

/**
 * FrutigerAero 渲染组件
 * 果味千禧/2005风风格：蓝绿渐变、光晕、气泡、水滴元素
 */
interface FrutigerAeroProps {
  data: GeneratedContent;
  scale: number;
}

const FrutigerAero: React.FC<FrutigerAeroProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Frutiger Aero 配色 - 蓝绿自然系
  const aeroColors = [
    { bg1: '#00CED1', bg2: '#20B2AA', accent: '#E0FFFF', glow: 'rgba(0, 206, 209, 0.4)' },  // 青绿
    { bg1: '#87CEEB', bg2: '#4682B4', accent: '#F0FFFF', glow: 'rgba(135, 206, 235, 0.4)' },  // 天蓝
    { bg1: '#98FB98', bg2: '#3CB371', accent: '#F5FFF5', glow: 'rgba(152, 251, 152, 0.4)' },  // 嫩绿
    { bg1: '#00BFFF', bg2: '#1E90FF', accent: '#F0F8FF', glow: 'rgba(0, 191, 255, 0.4)' },  // 深蓝
    { bg1: '#40E0D0', bg2: '#48D1CC', accent: '#E0FFFF', glow: 'rgba(64, 224, 208, 0.4)' },  // 绿松石
    { bg1: '#7FFFD4', bg2: '#66CDAA', accent: '#F0FFF0', glow: 'rgba(127, 255, 212, 0.4)' },  // 水色
    { bg1: '#ADD8E6', bg2: '#87CEFA', accent: '#F0F8FF', glow: 'rgba(173, 216, 230, 0.4)' },  // 浅蓝
    { bg1: '#90EE90', bg2: '#32CD32', accent: '#F5FFF5', glow: 'rgba(144, 238, 144, 0.4)' },  // 浅绿
  ];

  const cardCount = data.cards?.length || 0;
  const layout = calculateStandardLayout(cardCount);
  const titleConfig = getStandardTitleConfig(cardCount);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    const timer = setTimeout(() => {
      if (wrapperRef.current) {
        wrapperRef.current.style.transform = '';
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [data]);

  return (
    <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', overflow: 'hidden' }}>
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .aero-container {
          font-family: 'CustomPreviewFont', 'Segoe UI', 'Verdana', system-ui, -apple-system, sans-serif;
        }
        .aero-title {
            font-weight: 700;
            letter-spacing: 0.02em;
            color: #FFF;
            text-shadow: 0 2px 8px rgba(0,100,100,0.5), 0 4px 16px rgba(0,0,0,0.3);
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
        .aero-card {
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          border: 2px solid rgba(255,255,255,0.5);
        }
        .aero-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 50%;
          background: linear-gradient(180deg, rgba(255,255,255,0.3), transparent);
          pointer-events: none;
        }
        .aero-card::after {
          content: '';
          position: absolute;
          bottom: -10px;
          right: -10px;
          width: 60px;
          height: 60px;
          background: radial-gradient(circle, rgba(255,255,255,0.4), transparent 70%);
          border-radius: 50%;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
          position: relative;
          z-index: 1;
        }
        .js-desc {
          line-height: 1.5;
          font-weight: 500;
          position: relative;
          z-index: 1;
        }
        .js-desc code {
          background: rgba(255,255,255,0.25);
          color: #FFF;
          padding: 0.15em 0.45em;
          border-radius: 8px;
          font-family: monospace;
          font-size: 0.9em;
          font-weight: 600;
        }
        .js-desc strong {
          font-weight: 700;
          color: #FFF;
        }
        /* Frutiger Aero 背景 */
        .aero-bg {
          background: linear-gradient(180deg, #1E90FF 0%, #00CED1 40%, #20B2AA 70%, #2E8B57 100%);
          position: relative;
        }
        .aero-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 20% 20%, rgba(255,255,255,0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 40%);
          pointer-events: none;
        }
        /* 气泡装饰 */
        .bubble {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6), rgba(255,255,255,0.1));
          pointer-events: none;
        }
      `}</style>

      <div
        className="aero-container aero-bg relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        {/* 气泡装饰 */}
        <div className="bubble" style={{ width: '120px', height: '120px', top: '10%', left: '5%', opacity: 0.4 }} />
        <div className="bubble" style={{ width: '80px', height: '80px', top: '20%', right: '10%', opacity: 0.3 }} />
        <div className="bubble" style={{ width: '100px', height: '100px', bottom: '15%', left: '8%', opacity: 0.35 }} />
        <div className="bubble" style={{ width: '60px', height: '60px', bottom: '25%', right: '15%', opacity: 0.25 }} />

        <div
          ref={wrapperRef}
          className="content-wrapper relative z-10 w-full flex flex-col items-center px-20 box-border transition-transform duration-500 ease-out"
          style={{ 
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined
          }}
        >
          {/* 标题区域 */}
          <div className="title-zone flex-none flex items-center justify-center">
            <div className="title-wrapper px-12 py-6"
                 style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', borderRadius: '20px', border: '2px solid rgba(255,255,255,0.4)' }}>
              <h1 
                ref={titleRef} 
                className={`aero-title text-center ${layout.titleSizeClass}`}
                style={{ fontSize: `${titleConfig.initialFontSize}px` }}
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
                const colors = aeroColors[idx % aeroColors.length];
                return (
                  <div 
                    key={idx} 
                    className={`card-item aero-card ${layout.cardWidthClass}`}
                    style={{
                      background: `linear-gradient(180deg, ${colors.bg1}, ${colors.bg2})`,
                      padding: layout.cardPadding,
                      boxShadow: `0 8px 32px ${colors.glow}, inset 0 2px 0 rgba(255,255,255,0.3)`,
                    }}
                  >
                    <div className="card-header">
                      <h3 
                        className={`js-title font-bold text-white ${layout.titleSizeClass}`}
                        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                      >
                        {card.title}
                      </h3>
                      <span 
                        className="js-icon material-symbols-rounded text-white"
                        style={{ fontSize: layout.iconSize, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
                      >
                        {card.icon}
                      </span>
                    </div>
                    <p
                      className={`js-desc text-white/95 leading-relaxed ${layout.descSizeClass}`}
                      dangerouslySetInnerHTML={{ __html: card.desc }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
        ${generateTitleFitScript(titleConfig)}
        ${generateViewportFitScript()}
      `}} />
    </div>
  );
};

import { generateDownloadableHtml } from '../utils/template';

/**
 * FrutigerAero 模板配置
 */
export const frutigerAeroTemplate: TemplateConfig = {
  id: 'frutigerAero',
  name: '果味千禧风格',
  description: '蓝绿渐变、光晕、气泡的2005年清爽未来感',
  icon: 'water_drop',
  downloadable: true,
  render: (data, scale) => <FrutigerAero data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'frutigerAero'),
  ssrReady: true,
};

// 导出组件供下载模板使用
export { FrutigerAero };
