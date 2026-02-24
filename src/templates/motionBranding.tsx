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

interface MotionBrandingProps {
  data: GeneratedContent;
  scale: number;
}

const MotionBranding: React.FC<MotionBrandingProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const brandColors = [
    { bg: '#ffffff', text: '#1a1a2e', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { bg: '#ffffff', text: '#1a1a2e', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { bg: '#ffffff', text: '#1a1a2e', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { bg: '#ffffff', text: '#1a1a2e', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
    { bg: '#ffffff', text: '#1a1a2e', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
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
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'Poppins', 'CustomPreviewFont', system-ui, sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          color: #1a1a2e;
        }
        .brand-title {
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
          line-height: 1.1;
          animation: titleBreath 4s ease-in-out infinite;
        }
        @keyframes titleBreath {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
        .card-item {
          border-radius: 24px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(102, 126, 234, 0.15);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          animation: cardBreath 5s ease-in-out infinite;
        }
        @keyframes cardBreath {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .card-item:nth-child(1) { animation-delay: 0s; }
        .card-item:nth-child(2) { animation-delay: 0.5s; }
        .card-item:nth-child(3) { animation-delay: 1s; }
        .card-item:nth-child(4) { animation-delay: 1.5s; }
        .card-item:nth-child(5) { animation-delay: 2s; }
        .card-item:nth-child(6) { animation-delay: 2.5s; }

        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }

        .js-desc strong {
          font-weight: 600;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .js-desc code {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
          color: #667eea;
          padding: 0.2em 0.5em;
          border-radius: 8px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
          font-weight: 500;
        }
        .content-scale { transform-origin: center center; }

        .brand-accent {
          position: absolute;
          width: 120%;
          height: 120%;
          top: -10%;
          left: -10%;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
          pointer-events: none;
        }

        .pulse-ring {
          position: absolute;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 2px solid;
          opacity: 0;
          animation: pulse 3s ease-out infinite;
        }
        @keyframes pulse {
          0% { transform: scale(0.8); opacity: 0.6; }
          100% { transform: scale(2); opacity: 0; }
        }
        .pulse-ring:nth-child(1) { animation-delay: 0s; border-color: #667eea; }
        .pulse-ring:nth-child(2) { animation-delay: 1s; border-color: #764ba2; }
        .pulse-ring:nth-child(3) { animation-delay: 2s; border-color: #f093fb; }

        .brand-mark {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          position: relative;
        }
        .brand-mark::before {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 16px;
          opacity: 0.2;
          animation: logoGlow 2s ease-in-out infinite;
        }
        @keyframes logoGlow {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.1); opacity: 0.3; }
        }

        .flow-line {
          position: absolute;
          height: 3px;
          animation: flowMove 3s linear infinite;
        }
        @keyframes flowMove {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .rhythm-indicator {
          display: flex;
          gap: 6px;
          align-items: center;
        }
        .rhythm-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          animation: rhythmPulse 1.5s ease-in-out infinite;
        }
        .rhythm-dot:nth-child(1) { animation-delay: 0s; }
        .rhythm-dot:nth-child(2) { animation-delay: 0.2s; }
        .rhythm-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes rhythmPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
        }
      `}</style>

      <div
        ref={mainRef}
        className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        <div className="brand-accent"></div>

        <div className="pulse-ring" style={{ top: '20%', right: '15%' }}></div>
        <div className="pulse-ring" style={{ bottom: '20%', left: '15%' }}></div>
        <div className="pulse-ring" style={{ top: '50%', left: '10%' }}></div>

        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-20 box-border content-scale relative z-10"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}
        >
          <div className="title-zone flex-none flex flex-col items-center justify-center w-full gap-4">
            <div className="rhythm-indicator">
              <div className="rhythm-dot"></div>
              <div className="rhythm-dot"></div>
              <div className="rhythm-dot"></div>
            </div>
            <h1 ref={titleRef} className="text-center brand-title">
              {data.mainTitle}
            </h1>
            <div className="rhythm-indicator">
              <div className="rhythm-dot"></div>
              <div className="rhythm-dot"></div>
              <div className="rhythm-dot"></div>
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
                const brand = brandColors[idx % brandColors.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: brand.bg,
                      border: 'none',
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="flow-line" style={{ width: '60px', top: '16px', left: '50%', background: `linear-gradient(90deg, transparent, ${brand.gradient.includes('#667eea') ? '#667eea' : '#f093fb'}, ${brand.gradient.includes('#764ba2') ? '#764ba2' : '#f5576c'}, transparent)` }}></div>

                    <div className="flex items-start gap-4 mb-4">
                      <div className="brand-mark" style={{ background: brand.gradient }}>
                        <span className="js-icon material-symbols-rounded" style={{ color: '#fff', fontSize: '24px', position: 'relative', zIndex: 1 }}>
                          {card.icon}
                        </span>
                      </div>
                      <h3 className={`js-title font-semibold ${layout.titleSizeClass}`} style={{ color: brand.text }}>
                        {card.title}
                      </h3>
                    </div>
                    <p className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`} style={{ color: brand.text }} dangerouslySetInnerHTML={{ __html: autoAddSpaceToHtml(card.desc) }} />
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

export const motionBrandingTemplate: TemplateConfig = {
  id: 'motionBranding',
  name: '动效品牌',
  description: '动效作为品牌资产（转场、节奏、呼吸）；适合品牌体系与多端一致性',
  icon: 'animation',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <MotionBranding data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'motionBranding'),
};

export { MotionBranding };
