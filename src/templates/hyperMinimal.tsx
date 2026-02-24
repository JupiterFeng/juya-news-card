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

interface HyperMinimalProps {
  data: GeneratedContent;
  scale: number;
}

const HyperMinimal: React.FC<HyperMinimalProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
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
        .minimal-container {
          font-family: 'CustomPreviewFont', 'Inter', 'SF Pro Display', 'Helvetica Neue', sans-serif;
        }
        .minimal-title {
          font-weight: 300;
          letter-spacing: -0.04em;
          color: #111;
          line-height: 1.1;
        }
        .minimal-card {
          display: flex;
          flex-direction: column;
          position: relative;
          border-bottom: 1px solid #e5e5e5;
        }
        .minimal-card:last-child {
          border-bottom: none;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }
        .js-desc {
          line-height: 1.6;
          font-weight: 400;
          max-width: 900px;
        }
        .js-desc code {
          background: transparent;
          color: #111;
          padding: 0;
          font-family: 'SF Mono', 'Menlo', monospace;
          font-size: 0.9em;
          font-weight: 500;
          border-bottom: 1px solid #ddd;
        }
        .js-desc strong {
          font-weight: 600;
          color: #111;
        }
        .minimal-bg {
          background: #fff;
          position: relative;
        }
        .page-number {
          position: absolute;
          bottom: 40px;
          right: 60px;
          font-size: 14px;
          color: #999;
          font-weight: 400;
        }
      `}</style>

      <div
        ref={mainRef}
        className="minimal-container minimal-bg relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        <div
          ref={wrapperRef}
          className="content-wrapper relative z-10 w-full flex flex-col items-center px-24 box-border"
          style={{
            gap: layout.wrapperGap,
            maxWidth: '1400px',
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}
        >
          <div className="title-zone flex-none w-full" style={{ paddingBottom: '20px', borderBottom: '1px solid #E5E5E5' }}>
            <h1 ref={titleRef} className="minimal-title">
              {data.mainTitle}
            </h1>
          </div>

          <div className="card-zone flex-none w-full">
            <div
              data-card-zone="true"
              className="w-full flex flex-col justify-center"
              style={{
                gap: layout.containerGap,
                '--container-gap': layout.containerGap,
              } as React.CSSProperties}
            >
              {data.cards.map((card, idx) => (
                <div
                  key={idx}
                  data-card-item="true"
                  className="card-item minimal-card"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #E5E5E5',
                    padding: '40px 0',
                    width: '100%',
                    minWidth: '600px',
                  }}
                >
                  <div className="card-header">
                    <h3 className={`js-title font-bold ${layout.titleSizeClass}`} style={{ color: '#111', letterSpacing: '-0.03em', lineHeight: '1.1' }}>
                      {card.title}
                    </h3>
                    <span className="js-icon material-symbols-rounded" style={{ color: '#999', fontSize: layout.iconSize }}>
                      {card.icon}
                    </span>
                  </div>
                  <p
                    className={`js-desc ${layout.descSizeClass}`}
                    style={{ color: '#666', maxWidth: '900px' }}
                    dangerouslySetInnerHTML={{ __html: card.desc }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="page-number">
          {data.cards.length} {data.cards.length === 1 ? 'item' : 'items'}
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

export const hyperMinimalTemplate: TemplateConfig = {
  id: 'hyperMinimal',
  name: '超极简风格',
  description: '纯排版、大量留白、字体主导的极简设计',
  icon: 'text_fields',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <HyperMinimal data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'hyperMinimal'),
};

export { HyperMinimal };
