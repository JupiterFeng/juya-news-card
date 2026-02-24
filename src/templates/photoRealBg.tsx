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

interface PhotoRealBgProps {
  data: GeneratedContent;
  scale: number;
}

const PhotoRealBg: React.FC<PhotoRealBgProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const photoColors = [
    { bg: 'rgba(255,255,255,0.95)', text: '#1a1a1a', accent: '#2a506a' },
    { bg: 'rgba(255,255,255,0.95)', text: '#1a1a1a', accent: '#6a4a3a' },
    { bg: 'rgba(255,255,255,0.95)', text: '#1a1a1a', accent: '#3a5a4a' },
    { bg: 'rgba(255,255,255,0.95)', text: '#1a1a1a', accent: '#8a6a4a' },
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
      <link href="https://fonts.googleapis.com/css2?family=Helvetica+Neue:wght@400;500;600&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .photoreal-container {
          font-family: 'Helvetica Neue', 'CustomPreviewFont', sans-serif;
          background: linear-gradient(180deg, #87ceeb 0%, #e0f7fa 50%, #b0e0e0 100%);
          color: #1a1a1a;
          position: relative;
          overflow: hidden;
        }
        .photoreal-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='80' cy='30' r='40' fill='rgba(255,255,255,0.3)'/%3E%3Ccircle cx='20' cy='70' r='30' fill='rgba(255,255,255,0.2)'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .photoreal-title {
          font-weight: 500;
          color: #1a1a1a;
          letter-spacing: '0.08em';
          line-height: 1.3;
          position: relative;
          z-index: 10;
        }
        .card-item {
          transition: all 0.3s ease;
          position: relative;
          z-index: 5;
        }
        .card-item::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 50%);
          border-radius: 2px;
          pointer-events: none;
        }
        .card-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }
        .light-ray {
          position: absolute;
          top: -20px;
          left: 50%;
          width: 100px;
          height: 60px;
          background: linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 100%);
          clip-path: polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%);
          pointer-events: none;
        }
        .content-scale {
          transform-origin: center center;
        }
      `}</style>

      <div className="photoreal-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-20 box-border content-scale z-10"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}
        >
          <div className="flex flex-col items-center">
            <h1 ref={titleRef} className="text-center photoreal-title">
              {data.mainTitle}
            </h1>
            <div style={{ width: '100px', height: '1px', background: 'rgba(255,255,255,0.6)', marginTop: '16px' }}></div>
          </div>

          <div className="card-zone flex-none w-full">
            <div
              data-card-zone="true"
              className="w-full flex flex-wrap justify-center content-center gap-5"
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
                const color = photoColors[idx % photoColors.length];
                return (
                  <div
                    key={idx}
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: color.bg,
                      borderRadius: '2px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      border: '1px solid rgba(255,255,255,0.8)',
                      backdropFilter: 'blur(10px)',
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="light-ray"></div>
                    <div className="card-header flex items-center gap-3 mb-4">
                      <span className="js-icon material-symbols-rounded" style={{ color: color.accent, fontSize: layout.iconSize }}>
                        {card.icon}
                      </span>
                      <h3
                        className={`js-title font-medium leading-tight ${layout.titleSizeClass}`}
                        style={{ color: color.text, fontFamily: "'Helvetica Neue', 'Arial', sans-serif" }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
                      style={{ color: color.text, opacity: '0.9' }}
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


export const photoRealBgTemplate: TemplateConfig = {
  id: 'photoRealBg',
  name: '写实背景',
  description: '真实光照空气的写实背景风格，角色线条干净',
  icon: 'photo_camera',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <PhotoRealBg data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'photoRealBg'),
};

export { PhotoRealBg };
