import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import { 
  calculateStandardLayout, 
  getStandardTitleConfig, 
  generateTitleFitScript, 
  generateViewportFitScript 
} from '../utils/layout-calculator';

/**
 * WhitespaceLuxury 渲染组件
 * 留白奢华风格 - 大留白 + 精致排版
 */
interface WhitespaceLuxuryProps {
  data: GeneratedContent;
  scale: number;
}

const WhitespaceLuxury: React.FC<WhitespaceLuxuryProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const cardCount = data.cards.length;
  const layout = calculateStandardLayout(cardCount);
  const titleConfig = getStandardTitleConfig(cardCount);

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
        const nextScale = Math.max(0.6, maxH / contentH);
        wrapper.style.transform = `scale(${nextScale})`;
        return;
      }
      wrapper.style.transform = '';
    };

    const timer = window.setTimeout(fitViewport, 50);
    return () => window.clearTimeout(timer);
  }, [data, titleConfig]);

  return (
    <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', overflow: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Inter:wght@300;400&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face { font-family: 'CustomPreviewFont'; src: url('/assets/htmlFont.ttf') format('truetype'); }
        .main-container { font-family: 'Inter', 'CustomPreviewFont', system-ui, sans-serif; background: #fafafa; color: #1a1a1a; }
        .luxury-title { font-family: 'Cormorant Garamond', 'CustomPreviewFont', serif; font-weight: 300; color: #1a1a1a; letter-spacing: 0.1em; line-height: 1.2; }
        .card-item { transition: all 0.5s ease; border: 1px solid #e5e5e5; background-color: #ffffff; }
        .card-item:hover { border-color: #1a1a1a; }
                .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
                .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
                .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .js-desc strong { font-weight: 400; }
        .js-desc code { background: transparent; border-bottom: 1px solid #1a1a1a; padding: 0 0.2em; font-family: 'Cormorant Garamond', serif; font-style: italic; }
        .content-scale { transform-origin: center center; }
        .divider { width: 40px; height: 1px; background: #1a1a1a; margin: 2rem 0; opacity: 0.2; }
      `}</style>
      <div className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
        <div 
          ref={wrapperRef} 
          className="content-wrapper w-full flex flex-col items-center px-32 box-border content-scale" 
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}
        >
          <div className="title-zone flex-none flex items-center justify-center w-full">
            <h1 ref={titleRef} className="text-center luxury-title">{data.mainTitle}</h1>
          </div>
          <div className="card-zone flex-none w-full">
            <div 
              className="w-full flex flex-wrap justify-center content-center" 
              style={{ gap: layout.containerGap, '--container-gap': layout.containerGap } as React.CSSProperties}
            >
              {data.cards.map((card, idx) => (
                <div 
                  key={idx} 
                  className={`card-item flex flex-col ${layout.cardWidthClass}`}
                  style={{ padding: layout.cardPadding }}
                >
                  <span 
                    className="js-icon material-symbols-rounded" 
                    style={{ 
                      display: 'block', 
                      marginBottom: '2rem',
                      fontSize: layout.iconSize,
                      color: '#1a1a1a',
                      opacity: '0.3'
                    }}
                  >{card.icon}</span>
                  <h3 
                    className={`js-title font-normal ${layout.titleSizeClass}`}
                    style={{ color: '#1a1a1a', letterSpacing: '0.05em' }}
                  >{card.title}</h3>
                  <div className="divider"></div>
                  <p 
                    className={`js-desc font-light leading-relaxed ${layout.descSizeClass}`}
                    style={{ color: '#666', marginTop: '1rem' }}
                    dangerouslySetInnerHTML={{ __html: card.desc }} 
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

import { generateDownloadableHtml } from '../utils/template';

export const whitespaceLuxuryTemplate: TemplateConfig = {
  id: 'whitespaceLuxury',
  name: '留白奢华',
  description: '大留白 + 精致排版；适合奢品、摄影、设计工作室',
  icon: 'spa',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <WhitespaceLuxury data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'whitespaceLuxury'),
};

export { WhitespaceLuxury };
