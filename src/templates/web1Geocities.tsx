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
 * Web1Geocities 渲染组件
 * Web 1.0/GeoCities 早期互联网风格：闪烁文字、花哨背景、表格布局感
 */
interface Web1GeocitiesProps {
  data: GeneratedContent;
  scale: number;
}

const GEOCITIES_COLORS = [
  { bg: '#FFFF00', text: '#0000FF', border: '#0000FF' },
  { bg: '#FF00FF', text: '#FFFF00', border: '#FFFF00' },
  { bg: '#00FF00', text: '#FF0000', border: '#FF0000' },
  { bg: '#00FFFF', text: '#800080', border: '#800080' },
  { bg: '#FF9900', text: '#000080', border: '#000080' },
  { bg: '#CC00CC', text: '#FFFF00', border: '#FFFF00' },
  { bg: '#00CCFF', text: '#FF0066', border: '#FF0066' },
  { bg: '#FFCC00', text: '#800000', border: '#800000' },
];

const Web1Geocities: React.FC<Web1GeocitiesProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

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
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .geocities-container {
          font-family: 'CustomPreviewFont', 'Comic Sans MS', 'Arial', sans-serif;
        }
        .geocities-title {
          font-weight: 900;
          letter-spacing: 0.05em;
          color: #FF0000;
          text-shadow: 2px 2px 0 #FFFF00, -1px -1px 0 #0000FF;
          animation: blink 1s step-end infinite;
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.8; }
        }
        .geocities-card {
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          position: relative;
        }
        .geocities-card::before {
          content: '★';
          position: absolute;
          top: 4px;
          left: 4px;
          font-size: 16px;
          color: #FFD700;
          animation: twinkle 2s ease-in-out infinite;
        }
        .geocities-card::after {
          content: '★';
          position: absolute;
          bottom: 4px;
          right: 4px;
          font-size: 16px;
          color: #FFD700;
          animation: twinkle 2s ease-in-out infinite 1s;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .js-desc {
          line-height: 1.4;
          font-weight: 500;
        }
        .js-desc code {
          background: #000;
          color: #0F0;
          padding: 0.1em 0.4em;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
          font-weight: 600;
          border: 1px dashed #0F0;
        }
        .js-desc strong {
          font-weight: 700;
          color: #FF0000;
          text-decoration: underline;
        }
        .content-scale { transform-origin: center center; }
        .material-symbols-rounded { font-family: 'Material Symbols Rounded' !important; font-weight: normal; font-style: normal; display: inline-block; }

        .geocities-bg {
          background: linear-gradient(45deg, #000080 25%, #0000CD 25%, #0000CD 50%, #000080 50%, #000080 75%, #0000CD 75%);
          background-size: 40px 40px;
          position: relative;
        }
        .geocities-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 10% 20%, rgba(255, 0, 0, 0.3) 0%, transparent 20%),
            radial-gradient(circle at 90% 80%, rgba(255, 255, 0, 0.3) 0%, transparent 20%),
            radial-gradient(circle at 50% 50%, rgba(0, 255, 0, 0.2) 0%, transparent 30%);
          pointer-events: none;
        }
        .hr-geocities {
          border: none;
          height: 4px;
          background: linear-gradient(90deg, #FF0000, #FFFF00, #00FF00, #00FFFF, #0000FF, #FF00FF, #FF0000);
          margin: 8px 0;
        }
        .visitor-counter {
          background: #000;
          color: #0F0;
          font-family: 'Courier New', monospace;
          padding: 4px 12px;
          border: 2px inset #808080;
          font-size: 14px;
        }
        .marquee {
          overflow: hidden;
          white-space: nowrap;
        }
        .marquee span {
          display: inline-block;
          animation: marquee 10s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>

      <div className="geocities-container geocities-bg relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
        <div
          ref={wrapperRef}
          className="content-wrapper relative z-10 w-full flex flex-col items-center px-16 box-border content-scale"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}
        >
          <div className="title-zone flex-none flex items-center justify-center">
            <div style={{ background: '#FFFFFF', border: '6px ridge #FF0000', padding: '16px 32px' }}>
              <div className="marquee" style={{ marginBottom: '8px', background: '#000080', color: '#FFFF00', padding: '4px' }}>
                <span>★ ★ ★ 欢迎访问我的主页 ★ ★ ★</span>
              </div>
              <h1 ref={titleRef} className="geocities-title text-center">
                {data.mainTitle}
              </h1>
              <hr className="hr-geocities" />
              <div className="visitor-counter" style={{ textAlign: 'center' }}>
                访客计数器: <span id="counter">000000</span>
              </div>
            </div>
          </div>

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
                boxSizing: 'border-box',
              } as React.CSSProperties}
            >
              {data.cards.map((card, idx) => {
                const colors = GEOCITIES_COLORS[idx % GEOCITIES_COLORS.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item geocities-card ${layout.cardWidthClass}`}
                    style={{
                      background: colors.bg,
                      border: `4px ridge ${colors.border}`,
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="card-header">
                      <h3 className={`js-title font-bold ${layout.titleSizeClass}`} style={{ color: colors.text }}>
                        {card.title}
                      </h3>
                      <span className="js-icon material-symbols-rounded" style={{ fontSize: layout.iconSize, color: colors.text }}>
                        {card.icon}
                      </span>
                    </div>
                    <hr className="hr-geocities" />
                    <p
                      className={`js-desc ${layout.descSizeClass}`}
                      style={{ color: colors.text }}
                      dangerouslySetInnerHTML={{ __html: autoAddSpaceToHtml(card.desc) }}
                    />
                    <div style={{ marginTop: 'auto', paddingTop: '12px', fontSize: '12px', textAlign: 'center' }}>
                      <span style={{ color: '#808080' }}>[ </span>
                      <a href="#" style={{ color: '#0000FF' }}>更多链接</a>
                      <span style={{ color: '#808080' }}> ]</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: generateTitleFitScript(titleConfig) }} />
      <script dangerouslySetInnerHTML={{ __html: generateViewportFitScript() }} />
    </div>
  );
};

/**
 * Web1Geocities 模板配置
 */
export const web1GeocitiesTemplate: TemplateConfig = {
  id: 'web1Geocities',
  name: 'Web 1.0早期风格',
  description: '闪烁文字、花哨背景的GeoCities复古风',
  icon: 'language',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <Web1Geocities data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'web1Geocities'),
};

export { Web1Geocities };
