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
 * HolographicIridescent 渲染组件
 * 全息镭射/变彩风格：彩虹渐变、珠光效果、动态变色
 */
interface HolographicIridescentProps {
  data: GeneratedContent;
  scale: number;
}

const HolographicIridescent: React.FC<HolographicIridescentProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  // 全息镭射配色 - 彩虹渐变组合
  const holographicSchemes = [
    { gradient: 'linear-gradient(135deg, #FF6B6B, #FFE66D, #4ECDC4, #45B7D1)', accent: '#FF6B6B' },
    { gradient: 'linear-gradient(135deg, #A78BFA, #F472B6, #38BDF8, #34D399)', accent: '#A78BFA' },
    { gradient: 'linear-gradient(135deg, #FBBF24, #F87171, #C084FC, #60A5FA)', accent: '#FBBF24' },
    { gradient: 'linear-gradient(135deg, #34D399, #38BDF8, #A78BFA, #F472B6)', accent: '#34D399' },
    { gradient: 'linear-gradient(135deg, #F472B6, #FB7185, #FBBF24, #A3E635)', accent: '#F472B6' },
    { gradient: 'linear-gradient(135deg, #38BDF8, #818CF8, #C084FC, #E879F9)', accent: '#38BDF8' },
    { gradient: 'linear-gradient(135deg, #FCD34D, #F97316, #EF4444, #EC4899)', accent: '#FCD34D' },
    { gradient: 'linear-gradient(135deg, #2DD4BF, #06B6D4, #3B82F6, #8B5CF6)', accent: '#2DD4BF' },
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
        .holographic-container {
          font-family: 'CustomPreviewFont', 'Inter', system-ui, -apple-system, sans-serif;
        }
        .holographic-title {
          font-weight: 900;
          letter-spacing: -0.02em;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .holographic-card {
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          box-shadow: 0 12px 40px rgba(0,0,0,0.15);
        }
        .holographic-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.4) 0%,
            rgba(255,255,255,0.1) 50%,
            rgba(255,255,255,0) 100%
          );
          pointer-events: none;
        }
        .holographic-card::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent 30%,
            rgba(255,255,255,0.1) 50%,
            transparent 70%
          );
          animation: shimmer 3s infinite;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(100%) rotate(45deg); }
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
          background: rgba(0,0,0,0.25);
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
        /* 珠光背景效果 */
        .pearl-bg {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #1a1a2e 50%, #0f3460 75%, #1a1a2e 100%);
          background-size: 400% 400%;
          animation: pearl-shift 15s ease infinite;
        }
        @keyframes pearl-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>

      <div className="holographic-container pearl-bg relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
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
            <div className="title-wrapper px-8 py-4 rounded-2xl"
                 style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
              <h1
                ref={titleRef}
                className="holographic-title text-center"
                style={{
                  background: 'linear-gradient(90deg, #FF6B6B, #FFE66D, #4ECDC4, #45B7D1, #A78BFA, #FF6B6B)',
                  backgroundSize: '200% auto',
                }}
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
                const scheme = holographicSchemes[idx % holographicSchemes.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item holographic-card ${layout.cardWidthClass}`}
                    style={{
                      background: scheme.gradient,
                      padding: layout.cardPadding,
                      minWidth: N <= 6 ? '370px' : '310px',
                    }}
                  >
                    <div className="card-header">
                      <h3
                        className={`js-title font-bold ${layout.titleSizeClass}`}
                        style={{ color: '#FFF', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}
                      >
                        {card.title}
                      </h3>
                      <span
                        className="js-icon material-symbols-rounded"
                        style={{
                          fontSize: layout.iconSize,
                          color: '#FFF',
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                        }}
                      >
                        {card.icon}
                      </span>
                    </div>
                    <p
                      className={`js-desc ${layout.descSizeClass}`}
                      style={{ color: 'rgba(255,255,255,0.95)' }}
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
 * HolographicIridescent 模板配置
 */
export const holographicIridescentTemplate: TemplateConfig = {
  id: 'holographicIridescent',
  name: '全息镭射风格',
  description: '彩虹渐变、珠光效果的全息设计',
  icon: 'auto_awesome',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <HolographicIridescent data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'holographicIridescent'),
};

// 导出组件供下载模板使用
export { HolographicIridescent };
