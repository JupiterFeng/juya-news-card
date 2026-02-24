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

const ShopifyPolaris: React.FC<{ data: GeneratedContent; scale: number }> = ({ data, scale }) => {
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
      while (title.scrollWidth > 1600 && size > titleConfig.minFontSize && guard < 100) {
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
      <link href="https://fonts.googleapis.com/css2?family=Shopify+Sans:wght@400;500;600;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'Shopify Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          background-color: #f1f2f4;
          color: #202223;
        }
        .polaris-title {
          font-weight: 600;
          color: #202223;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }
        .card-item {
          box-sizing: border-box;
          background: #ffffff;
          border-radius: 8px;
          border: 1px solid #e1e3e5;
          box-shadow: 0 0 0 1px rgba(63, 63, 68, 0.05), 0 1px 3px 0 rgba(63, 63, 68, 0.15);
          transition: box-shadow 0.2s;
        }
        .card-item:hover {
          box-shadow: 0 0 0 1px rgba(63, 63, 68, 0.1), 0 4px 6px 0 rgba(63, 63, 68, 0.15);
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .js-desc strong { color: #202223; font-weight: 600; }
        .js-desc code {
          background: #f1f2f4; padding: 0.1em 0.3em; border-radius: 4px;
          font-family: monospace;
          font-size: 0.9em; color: #5c6ac4;
        }
        .content-scale { transform-origin: center center; }
        .material-symbols-rounded { font-family: 'Material Symbols Rounded' !important; font-weight: normal; font-style: normal; display: inline-block; }

      `}</style>

      <div
        className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-24 box-border content-scale"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}
        >
          <div className="flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#f1f2f4] rounded-full mb-4">
              <div className="w-2 h-2 rounded-full bg-[#5c6ac4]"></div>
              <span className="text-xs font-medium text-[#6d7175]">SHOPIFY POLARIS</span>
            </div>
            <h1 ref={titleRef} className="text-center polaris-title">
              {data.mainTitle}
            </h1>
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
              {data.cards.map((card, idx) => (
                <div
                  key={idx}
                  data-card-item="true"
                  className={`card-item flex flex-col ${layout.cardWidthClass}`}
                  style={{ padding: layout.cardPadding }}
                >
                  <div className="card-header flex items-center gap-4 mb-4">
                    <span
                      className="js-icon material-symbols-rounded"
                      style={{ fontSize: layout.iconSize, color: '#5c6ac4' }}
                    >
                      {card.icon}
                    </span>
                    <h3
                      className={`js-title Polaris-Text--heading ${layout.titleSizeClass}`}
                      style={{ color: '#202223' }}
                    >
                      {card.title}
                    </h3>
                  </div>
                  <p
                    className={`js-desc Polaris-Text--body ${layout.descSizeClass}`}
                    style={{ color: '#6d7175' }}
                    dangerouslySetInnerHTML={{ __html: autoAddSpaceToHtml(card.desc) }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: generateTitleFitScript(titleConfig) }} />
      <script dangerouslySetInnerHTML={{ __html: generateViewportFitScript() }} />
    </div>
  );
};


export const shopifyPolarisTemplate: TemplateConfig = {
  id: 'shopifyPolaris',
  name: '电商后台极简',
  description: '电商商家后台界面风格',
  icon: 'shopping_cart',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <ShopifyPolaris data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'shopifyPolaris'),
};

export { ShopifyPolaris };
