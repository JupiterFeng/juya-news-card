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

interface GenerativeParametricProps {
  data: GeneratedContent;
  scale: number;
}

const GenerativeParametric: React.FC<GenerativeParametricProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const generativeColors = [
    { primary: '#00D9FF', secondary: '#0099CC', accent: '#006688' },
    { primary: '#FF006E', secondary: '#CC0058', accent: '#88003C' },
    { primary: '#8338EC', secondary: '#662EBA', accent: '#492485' },
    { primary: '#3A86FF', secondary: '#2E6BCB', accent: '#1E4C8A' },
    { primary: '#FFBE0B', secondary: '#CB9809', accent: '#886506' },
    { primary: '#06FFA5', secondary: '#04CB84', accent: '#038858' },
    { primary: '#FB5607', secondary: '#C94506', accent: '#872E04' },
    { primary: '#FF00FF', secondary: '#CC00CC', accent: '#880088' },
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

  const generateGridPattern = () => {
    return (
      <svg className="generative-bg" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <circle cx="30" cy="30" r="1" fill="rgba(0, 217, 255, 0.3)" />
            <path d="M30 0 V60 M0 30 H60" stroke="rgba(0, 217, 255, 0.1)" strokeWidth="0.5" fill="none" />
          </pattern>
          <radialGradient id="glow1" cx="20%" cy="30%">
            <stop offset="0%" stopColor="rgba(0, 217, 255, 0.15)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="glow2" cx="80%" cy="70%">
            <stop offset="0%" stopColor="rgba(131, 56, 236, 0.12)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <circle cx="20%" cy="30%" r="400" fill="url(#glow1)" />
        <circle cx="80%" cy="70%" r="350" fill="url(#glow2)" />
      </svg>
    );
  };

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
        .generative-container {
          font-family: 'CustomPreviewFont', 'JetBrains Mono', 'Fira Code', monospace;
        }
        .generative-title {
          font-weight: 600;
          letter-spacing: 0.05em;
          background: linear-gradient(90deg, #00d9ff, #8338ec, #ff006e);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .generative-card {
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(10px);
        }
        .generative-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, var(--card-primary), transparent);
        }
        .generative-card::after {
          content: '';
          position: absolute;
          bottom: -50px;
          right: -50px;
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, var(--card-primary)20, transparent 70%);
          border-radius: 50%;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          position: relative;
          z-index: 1;
        }
        .js-desc {
          line-height: 1.5;
          font-weight: 400;
          position: relative;
          z-index: 1;
        }
        .js-desc code {
          background: rgba(0, 217, 255, 0.15);
          color: #00d9ff;
          padding: 0.15em 0.4em;
          border-radius: 6px;
          font-family: monospace;
          font-size: 0.9em;
          font-weight: 600;
        }
        .js-desc strong {
          font-weight: 700;
          color: var(--card-primary, #00d9ff);
        }
        .generative-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .generative-bg-layer {
          background: linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 50%, #0d0d0d 100%);
        }
      `}</style>

      <div
        ref={mainRef}
        className="generative-container generative-bg-layer relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        <div className="generative-bg">{generateGridPattern()}</div>

        <div
          ref={wrapperRef}
          className="content-wrapper relative z-10 w-full flex flex-col items-center px-16 box-border"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}
        >
          <div className="title-zone flex-none flex items-center justify-center">
            <div
              className="title-wrapper px-10 py-5"
              style={{ background: 'rgba(13, 13, 13, 0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0, 217, 255, 0.3)' }}
            >
              <h1 ref={titleRef} className="generative-title text-center">
                {data.mainTitle}
              </h1>
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
                boxSizing: 'border-box'
              } as React.CSSProperties}
            >
              {data.cards.map((card, idx) => {
                const colors = generativeColors[idx % generativeColors.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item generative-card ${layout.cardWidthClass}`}
                    style={{
                      '--card-primary': colors.primary,
                      background: `linear-gradient(135deg, ${colors.primary}15, ${colors.secondary}08)`,
                      border: `1px solid ${colors.primary}40`,
                      padding: layout.cardPadding,
                      minWidth: N <= 6 ? '350px' : '290px',
                    } as React.CSSProperties}
                  >
                    <div className="card-header">
                      <h3 className={`js-title font-bold ${layout.titleSizeClass}`} style={{ color: colors.primary }}>
                        {card.title}
                      </h3>
                      <span className="js-icon material-symbols-rounded" style={{ color: colors.primary, fontSize: layout.iconSize }}>
                        {card.icon}
                      </span>
                    </div>
                    <p
                      className={`js-desc ${layout.descSizeClass}`}
                      style={{ color: '#B0B0B0' }}
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

export const generativeParametricTemplate: TemplateConfig = {
  id: 'generativeParametric',
  name: '生成式参数化风格',
  description: '算法生成背景图案、粒子场的科技设计',
  icon: 'pattern',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <GenerativeParametric data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'generativeParametric'),
};

export { GenerativeParametric };
