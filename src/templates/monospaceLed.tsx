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
 * MonospaceLed 渲染组件
 * 等宽字体主导风格 - 极客、系统感、理性
 */
interface MonospaceLedProps {
  data: GeneratedContent;
  scale: number;
}

const MonospaceLed: React.FC<MonospaceLedProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const terminalColors = [
    { bg: '#0d1117', border: '#30363d', text: '#c9d1d9', accent: '#58a6ff' },
    { bg: '#1e1e1e', border: '#3c3c3c', text: '#d4d4d4', accent: '#4fc1ff' },
    { bg: '#002b36', border: '#073642', text: '#839496', accent: '#268bd2' },
    { bg: '#282c34', border: '#3e4451', text: '#abb2bf', accent: '#61afef' },
    { bg: '#1a1b26', border: '#24283b', text: '#a9b1d6', accent: '#7aa2f7' },
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
      while(title.scrollWidth > 1650 && size > titleConfig.minFontSize && guard < 100) {
        size -= 1;
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
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'JetBrains Mono', 'CustomPreviewFont', 'Courier New', monospace;
          background: #0d1117;
          color: #c9d1d9;
        }
        .mono-title {
          font-weight: 500;
          color: #c9d1d9;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }
        /* 标题前缀装饰 */
        .mono-title::before {
          content: '>';
          margin-right: 0.3em;
          color: #58a6ff;
          animation: blink 1s infinite;
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .card-item {
          border-radius: 4px;
          position: relative;
          overflow: hidden;
        }
        /* 终端窗口装饰 */
        .card-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 24px;
          background: rgba(255,255,255,0.05);
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .card-item::after {
          content: '● ● ●';
          position: absolute;
          top: 4px;
          left: 10px;
          font-size: 8px;
          color: rgba(255,255,255,0.3);
          letter-spacing: 2px;
        }
                .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
                .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
                .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }

        .text-5-5xl { font-size: 3.375rem; line-height: 1.1; }
        .text-4-5xl { font-size: 2.625rem; line-height: 1.2; }
        .text-3-5xl { font-size: 2.0625rem; line-height: 1.3; }
        .text-2-5xl { font-size: 1.8125rem; line-height: 1.4; }

        .js-desc strong {
          color: #58a6ff;
          font-weight: 500;
        }
        .js-desc code {
          background: rgba(88, 166, 255, 0.15);
          padding: 0.1em 0.3em;
          border-radius: 2px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.9em;
          color: #58a6ff;
        }
        .content-scale { transform-origin: center center; }

        /* 网格线背景 */
        .grid-lines {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(48, 54, 61, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(48, 54, 61, 0.3) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        /* 行号装饰 */
        .line-numbers {
          position: absolute;
          left: 8px;
          top: 32px;
          font-size: 10px;
          color: rgba(255,255,255,0.15);
          line-height: 1.6;
          pointer-events: none;
        }

        /* 提示符 */
        .prompt::before {
          content: '$ ';
          color: #58a6ff;
        }
      `}</style>

      <div className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
        {/* 网格线背景 */}
        <div className="grid-lines"></div>

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
          <div className="title-zone flex-none flex items-center justify-center w-full">
            <h1
              ref={titleRef}
              className="text-center mono-title"
            >
              {data.mainTitle}
            </h1>
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
                const color = terminalColors[idx % terminalColors.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: color.bg,
                      border: `1px solid ${color.border}`,
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="line-numbers">1<br/>2<br/>3<br/>4<br/>5</div>

                    <div className="flex items-start gap-3 mb-3" style={{ paddingLeft: '32px', paddingTop: '8px' }}>
                      <span className="js-icon material-symbols-rounded" style={{ color: color.accent, fontSize: layout.iconSize }}>
                        {card.icon}
                      </span>
                      <h3
                        className={`js-title font-medium ${layout.titleSizeClass}`}
                        style={{ color: color.text, fontFamily: "'JetBrains Mono', 'CustomPreviewFont', 'Courier New', monospace" }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc prompt font-normal leading-relaxed ${layout.descSizeClass}`}
                      style={{ color: color.text, opacity: '0.85', paddingLeft: '32px' }}
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

export const monospaceLedTemplate: TemplateConfig = {
  id: 'monospaceLed',
  name: '等宽字体',
  description: '极客、系统感、理性；适合开发者产品、AI 工具、数据产品',
  icon: 'terminal',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <MonospaceLed data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'monospaceLed'),
};

export { MonospaceLed };
