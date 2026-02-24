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
 * SkeuomorphicMotion 渲染组件
 * 拟物动效风格 - 强物理感弹性、摩擦、惯性
 */
interface SkeuomorphicMotionProps {
  data: GeneratedContent;
  scale: number;
}

const SkeuomorphicMotion: React.FC<SkeuomorphicMotionProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const materials = [
    { bg: 'linear-gradient(145deg, #e6e6e6, #ffffff)', text: '#333333', accent: '#4a90d9' },
    { bg: 'linear-gradient(145deg, #ffd89b, #19547b)', text: '#ffffff', accent: '#ffffff' },
    { bg: 'linear-gradient(145deg, #a8e6cf, #dcedc1)', text: '#2d5a3d', accent: '#3d8b5a' },
    { bg: 'linear-gradient(145deg, #ffecd2, #fcb69f)', text: '#5a3d2d', accent: '#d4625a' },
    { bg: 'linear-gradient(145deg, #c7ceea, #9bb5e4)', text: '#2d3a5a', accent: '#5a7ad4' },
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
      while (title.scrollWidth > 1650 && size > titleConfig.minFontSize && guard < 100) {
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
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'Nunito', 'CustomPreviewFont', system-ui, sans-serif;
          background: linear-gradient(145deg, #d4d4d4, #f0f0f0);
          color: #333333;
        }
        .skeuo-title {
          font-weight: 800;
          color: #333333;
          letter-spacing: -0.02em;
          line-height: 1.1;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.05);
        }
        .card-item {
          border-radius: 16px;
          position: relative;
          box-shadow:
            8px 8px 16px rgba(0,0,0,0.15),
            -4px -4px 12px rgba(255,255,255,0.8),
            inset 1px 1px 2px rgba(255,255,255,0.5),
            inset -1px -1px 2px rgba(0,0,0,0.05);
          transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        /* 拟物按压效果 */
        .card-item:hover {
          box-shadow:
            4px 4px 8px rgba(0,0,0,0.15),
            -2px -2px 6px rgba(255,255,255,0.8),
            inset 2px 2px 4px rgba(0,0,0,0.1),
            inset -2px -2px 4px rgba(255,255,255,0.3);
          transform: scale(0.98);
        }
                .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
                .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
                .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }

        .js-desc strong {
          font-weight: 700;
          text-shadow: 0 1px 1px rgba(255,255,255,0.3);
        }
        .js-desc code {
          background: linear-gradient(145deg, rgba(0,0,0,0.15), rgba(0,0,0,0.05));
          color: #333;
          padding: 0.2em 0.5em;
          border-radius: 6px;
          font-family: 'Courier New', monospace;
          font-size: 0.85em;
          font-weight: 600;
          box-shadow: inset 1px 1px 2px rgba(0,0,0,0.2), inset -1px -1px 2px rgba(255,255,255,0.5);
        }
        .content-scale { transform-origin: center center; }

        /* 物理按钮图标 */
        .icon-button {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(145deg, #ffffff, #e6e6e6);
          box-shadow:
            4px 4px 8px rgba(0,0,0,0.15),
            -4px -4px 8px rgba(255,255,255,0.9);
          flex-shrink: 0;
        }
        .icon-button::after {
          content: '';
          position: absolute;
          inset: 4px;
          border-radius: 50%;
          background: linear-gradient(145deg, #e6e6e6, #ffffff);
          box-shadow: inset 1px 1px 3px rgba(0,0,0,0.1);
        }

        /* 弹性动画 */
        @keyframes elasticPulse {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.05); }
          50% { transform: scale(0.95); }
          75% { transform: scale(1.02); }
        }
        .icon-button {
          animation: elasticPulse 3s ease-in-out infinite;
        }
        .card-item:nth-child(1) .icon-button { animation-delay: 0s; }
        .card-item:nth-child(2) .icon-button { animation-delay: 0.3s; }
        .card-item:nth-child(3) .icon-button { animation-delay: 0.6s; }
        .card-item:nth-child(4) .icon-button { animation-delay: 0.9s; }
        .card-item:nth-child(5) .icon-button { animation-delay: 1.2s; }
        .card-item:nth-child(6) .icon-button { animation-delay: 1.5s; }

        /* 拟物切换开关装饰 */
        .switch-deco {
          width: 40px;
          height: 22px;
          background: linear-gradient(145deg, #e0e0e0, #ffffff);
          border-radius: 11px;
          position: relative;
          box-shadow: inset 2px 2px 4px rgba(0,0,0,0.1);
        }
        .switch-deco::after {
          content: '';
          position: absolute;
          width: 18px;
          height: 18px;
          background: linear-gradient(145deg, #ffffff, #e0e0e0);
          border-radius: 50%;
          top: 2px;
          left: 2px;
          box-shadow: 2px 2px 4px rgba(0,0,0,0.2);
          animation: switchToggle 2s ease-in-out infinite;
        }
        @keyframes switchToggle {
          0%, 45% { left: 2px; }
          55%, 100% { left: 20px; }
        }

        /* 旋钮装饰 */
        .knob-deco {
          width: 32px;
          height: 32px;
          background: linear-gradient(145deg, #4a90d9, #357abd);
          border-radius: 50%;
          position: relative;
          box-shadow:
            3px 3px 6px rgba(0,0,0,0.2),
            inset 1px 1px 2px rgba(255,255,255,0.3);
        }
        .knob-deco::before {
          content: '';
          position: absolute;
          width: 4px;
          height: 12px;
          background: rgba(255,255,255,0.8);
          border-radius: 2px;
          top: 6px;
          left: 50%;
          transform: translateX(-50%);
        }
        .knob-deco {
          animation: knobRotate 4s linear infinite;
        }
        @keyframes knobRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* 纹理背景 */
        .texture-overlay {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
          opacity: 0.5;
          pointer-events: none;
        }
      `}</style>

      <div className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
        {/* 纹理叠加 */}
        <div className="texture-overlay"></div>

        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-20 box-border content-scale relative z-10"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}
        >
          {/* 标题区域 */}
          <div className="title-zone flex-none flex items-center justify-center w-full gap-4">
            <div className="switch-deco"></div>
            <h1
              ref={titleRef}
              className="text-center skeuo-title"
            >
              {data.mainTitle}
            </h1>
            <div className="knob-deco"></div>
          </div>

          {/* 卡片区域 */}
          <div className="card-zone flex-none w-full">
            <div
              data-card-zone="true"
              className="w-full flex flex-wrap justify-center content-center gap-7"
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
                const material = materials[idx % materials.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      background: material.bg,
                      color: material.text,
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="icon-button">
                        <span
                          className="js-icon material-symbols-rounded"
                          style={{
                            position: 'relative',
                            zIndex: 1,
                            color: material.accent,
                            fontSize: layout.iconSize,
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                          }}
                        >
                          {card.icon}
                        </span>
                      </div>
                      <h3
                        className={`js-title font-semibold ${layout.titleSizeClass}`}
                        style={{ color: material.text, textShadow: '0 1px 2px rgba(255,255,255,0.5)' }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
                      style={{ color: material.text }}
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


export const skeuomorphicMotionTemplate: TemplateConfig = {
  id: 'skeuomorphicMotion',
  name: '拟物动效',
  description: '强物理感弹性、摩擦、惯性；适合"有手感"的移动端产品',
  icon: 'widgets',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <SkeuomorphicMotion data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'skeuomorphicMotion'),
};

export { SkeuomorphicMotion };
