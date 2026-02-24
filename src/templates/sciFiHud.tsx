import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import {
  calculateStandardLayout,
  getStandardTitleConfig,
  generateTitleFitScript,
  generateViewportFitScript,
} from '../utils/layout-calculator';
import { generateDownloadableHtml } from '../utils/template';
import { autoAddSpaceToHtml } from '../utils/text-spacing';

/**
 * SciFiHud 渲染组件
 * 科幻HUD/FUI风格：线框、发光描边、扫描线、仪表盘元素
 */
interface SciFiHudProps {
  data: GeneratedContent;
  scale: number;
}

const SciFiHud: React.FC<SciFiHudProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  // 科幻HUD配色 - 青色、品红、霓虹绿
  const hudColors = [
    { primary: '#00FFFF', secondary: '#0080FF', glow: 'rgba(0, 255, 255, 0.5)' },      // 青色
    { primary: '#FF00FF', secondary: '#FF0080', glow: 'rgba(255, 0, 255, 0.5)' },      // 品红
    { primary: '#00FF80', secondary: '#00FF00', glow: 'rgba(0, 255, 128, 0.5)' },      // 绿色
    { primary: '#FF8000', secondary: '#FF4000', glow: 'rgba(255, 128, 0, 0.5)' },      // 橙色
    { primary: '#80FF00', secondary: '#FFFF00', glow: 'rgba(128, 255, 0, 0.5)' },      // 黄绿
    { primary: '#0080FF', secondary: '#8000FF', glow: 'rgba(0, 128, 255, 0.5)' },      // 蓝紫
    { primary: '#FF0080', secondary: '#FF0000', glow: 'rgba(255, 0, 128, 0.5)' },      // 玫红
    { primary: '#00FF00', secondary: '#00FFFF', glow: 'rgba(0, 255, 0, 0.5)' },        // 青绿
  ];

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if (!wrapperRef.current || !titleRef.current) return;
    const wrapper = wrapperRef.current;
    const title = titleRef.current;

    const fitTitle = () => {
      let size = titleConfig.initialFontSize;
      title.style.fontSize = size + 'px';
      let guard = 0;
      while(title.scrollWidth > 1700 && size > titleConfig.minFontSize && guard < 100) {
        size -= 1;
        title.style.fontSize = size + 'px';
        guard++;
      }
    };
    fitTitle();

    // 视口适配
    const fitViewport = () => {
      const maxH = 1040;
      const contentH = wrapper.scrollHeight;
      if (contentH > maxH) {
        const scaleVal = Math.max(0.6, maxH / contentH);
        wrapper.style.transform = `scale(${scaleVal})`;
        return;
      }
      wrapper.style.transform = '';
    };

    const timer = window.setTimeout(fitViewport, 50);
    return () => window.clearTimeout(timer);
  }, [data, titleConfig]);

  return (
    <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', overflow: 'hidden' }}>
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .hud-container {
          font-family: 'CustomPreviewFont', 'Orbitron', 'Share Tech Mono', 'Rajdhani', monospace;
        }
        .hud-title {
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #00FFFF;
          text-shadow: 0 0 20px rgba(0, 255, 255, 0.8), 0 0 40px rgba(0, 255, 255, 0.4);
        }
        .hud-card {
          position: relative;
          display: flex;
          flex-direction: column;
          background: rgba(0, 10, 20, 0.8);
          border-radius: 8px;
          overflow: hidden;
        }
        .hud-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--hud-color), transparent);
          animation: scan-line 2s linear infinite;
        }
        @keyframes scan-line {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .hud-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 255, 255, 0.03) 2px,
            rgba(0, 255, 255, 0.03) 4px
          );
          pointer-events: none;
        }
        .corner-deco {
          position: absolute;
          width: 20px;
          height: 20px;
          border: 2px solid var(--hud-color);
          opacity: 0.7;
        }
        .corner-deco.tl { top: 4px; left: 4px; border-right: none; border-bottom: none; }
        .corner-deco.tr { top: 4px; right: 4px; border-left: none; border-bottom: none; }
        .corner-deco.bl { bottom: 4px; left: 4px; border-right: none; border-top: none; }
        .corner-deco.br { bottom: 4px; right: 4px; border-left: none; border-top: none; }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          position: relative;
          z-index: 1;
          border-bottom: 1px solid var(--hud-color);
          padding-bottom: 10px;
        }
        .js-desc {
          line-height: 1.5;
          font-weight: 400;
          position: relative;
          z-index: 1;
        }
        .js-desc code {
          background: rgba(0, 255, 255, 0.15);
          color: #00FFFF;
          padding: 0.1em 0.4em;
          font-family: monospace;
          font-size: 0.9em;
          font-weight: 600;
          border: 1px solid rgba(0, 255, 255, 0.3);
        }
        .js-desc strong {
          font-weight: 700;
          color: #00FFFF;
        }

        /* HUD背景 */
        .hud-bg {
          background: linear-gradient(180deg, #0a0a0f 0%, #0d1117 50%, #0a0a0f 100%);
          position: relative;
        }
        .hud-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          pointer-events: none;
        }
        /* 扫描线效果 */
        .scanlines {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.1) 2px,
            rgba(0, 0, 0, 0.1) 4px
          );
          pointer-events: none;
          z-index: 1;
        }
      `}</style>

      <div className="hud-container hud-bg relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
        {/* 扫描线覆盖 */}
        <div className="scanlines" />

        <div
          ref={wrapperRef}
          className="content-wrapper relative z-10 w-full flex flex-col items-center px-16 box-border"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}
        >
          {/* 标题区域 */}
          <div className="title-zone flex-none flex items-center justify-center">
            <div className="title-wrapper border-2 border-cyan-400 px-10 py-4"
                 style={{ background: 'rgba(0, 20, 40, 0.8)', boxShadow: '0 0 30px rgba(0, 255, 255, 0.3)' }}>
              <h1 ref={titleRef} className="hud-title text-center">
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
                const colors = hudColors[idx % hudColors.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item hud-card ${layout.cardWidthClass}`}
                    style={{
                      '--hud-color': colors.primary,
                      border: `2px solid ${colors.primary}`,
                      boxShadow: `0 0 20px ${colors.glow}, inset 0 0 20px ${colors.glow}20`,
                      padding: layout.cardPadding,
                      minWidth: N <= 6 ? '340px' : '280px',
                    } as React.CSSProperties}
                  >
                    {/* 角落装饰 */}
                    <span className="corner-deco tl" />
                    <span className="corner-deco tr" />
                    <span className="corner-deco bl" />
                    <span className="corner-deco br" />

                    <div className="card-header">
                      <h3
                        className={`js-title font-bold ${layout.titleSizeClass}`}
                        style={{ color: colors.primary, textShadow: `0 0 10px ${colors.glow}` }}
                      >
                        {card.title}
                      </h3>
                      <span
                        className="js-icon material-symbols-rounded"
                        style={{ fontSize: layout.iconSize, color: colors.primary, textShadow: `0 0 10px ${colors.glow}` }}
                      >
                        {card.icon}
                      </span>
                    </div>
                    <p
                      className={`js-desc ${layout.descSizeClass}`}
                      style={{ color: colors.secondary }}
                      dangerouslySetInnerHTML={{ __html: autoAddSpaceToHtml(card.desc) }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            ${generateTitleFitScript(titleConfig)}
            ${generateViewportFitScript()}
          `,
        }}
      />
    </div>
  );
};


/**
 * SciFiHud 模板配置
 */
export const sciFiHudTemplate: TemplateConfig = {
  id: 'sciFiHud',
  name: '科幻HUD风格',
  description: '线框、发光描边、扫描线的科幻界面',
  icon: 'monitor',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <SciFiHud data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'sciFiHud'),
};

// 导出组件供下载模板使用
export { SciFiHud };
