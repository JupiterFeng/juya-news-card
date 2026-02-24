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
 * ScrollStory 渲染组件
 * 滚动叙事风格 - 滚动触发分镜、动画与数据讲述
 */
interface ScrollStoryProps {
  data: GeneratedContent;
  scale: number;
}

const ScrollStory: React.FC<ScrollStoryProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const cardCount = data.cards.length;
  const layout = calculateStandardLayout(cardCount);
  const titleConfig = getStandardTitleConfig(cardCount, {
    titleConfigs: {
      '1-3': { initialFontSize: 90, minFontSize: 35 },
      '4': { initialFontSize: 90, minFontSize: 35 },
      '5-6': { initialFontSize: 90, minFontSize: 35 },
      '7-8': { initialFontSize: 90, minFontSize: 35 },
      '9+': { initialFontSize: 90, minFontSize: 35 }
    }
  });

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if (!wrapperRef.current || !titleRef.current) return;

    const wrapper = wrapperRef.current;
    const title = titleRef.current;

    const fitTitle = () => {
      let size = titleConfig.initialFontSize;
      title.style.fontSize = size + 'px';
      let guard = 0;
      while (title.scrollWidth > 1400 && size > titleConfig.minFontSize && guard < 100) {
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

  // 滚动叙事垂直宽度
  const verticalWidth = cardCount <= 3 ? 'w-3/4' : (cardCount <= 6 ? 'w-2/3' : 'w-1/2');

  return (
    <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', overflow: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'Inter', 'CustomPreviewFont', system-ui, sans-serif;
          background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
          color: #1a1a2e;
        }
        .story-title {
          font-family: 'Playfair Display', 'CustomPreviewFont', serif;
          font-weight: 600;
          color: #1a1a2e;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }
        .card-item {
          transition: all 0.3s ease;
          position: relative;
        }
        .timeline-connector {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 3px;
          height: calc(100% + 2rem);
          background: linear-gradient(to bottom, #6366f1, #8b5cf6, #ec4899);
          z-index: 0;
          opacity: 0.3;
        }
        .timeline-node {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #6366f1;
          border: 4px solid #fff;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
          z-index: 1;
        }
        .timeline-node.top { top: -10px; }
        .timeline-node.bottom { bottom: -10px; }
        .step-indicator {
          position: absolute;
          left: -60px;
          top: 50%;
          transform: translateY(-50%);
          font-family: 'Playfair Display', serif;
          font-size: 48px;
          font-weight: 700;
          color: rgba(99, 102, 241, 0.15);
        }
        .js-desc strong { color: #6366f1; font-weight: 600; }
        .js-desc code {
          background: rgba(99, 102, 241, 0.1);
          color: #6366f1;
          padding: 0.15em 0.4em;
          border-radius: 6px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
          font-weight: 500;
        }
        .content-scale { transform-origin: center top; }
        .scroll-hint {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          animation: bounce 2s infinite;
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        .scroll-hint-text {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(99, 102, 241, 0.6);
        }
        .progress-indicator {
          position: fixed;
          top: 0;
          left: 0;
          height: 4px;
          background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
          animation: progressFill 3s ease-in-out infinite;
        }
        @keyframes progressFill {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .data-dot {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #6366f1;
          animation: dataFloat 3s ease-in-out infinite;
        }
        @keyframes dataFloat {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(-10px); opacity: 1; }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .card-item { animation: slideInUp 0.6s ease-out forwards; }
        .card-item:nth-child(1) { animation-delay: 0.1s; }
        .card-item:nth-child(2) { animation-delay: 0.2s; }
        .card-item:nth-child(3) { animation-delay: 0.3s; }
        .card-item:nth-child(4) { animation-delay: 0.4s; }
        .card-item:nth-child(5) { animation-delay: 0.5s; }
        .card-item:nth-child(6) { animation-delay: 0.6s; }
      `}</style>

      <div className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center">
        <div className="progress-indicator" style={{ width: '60%' }}></div>

        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-20 box-border content-scale relative"
          style={{ gap: layout.wrapperGap, paddingTop: '60px' }}
        >
          <div className="title-zone flex-none flex flex-col items-center justify-center w-full gap-4">
            <h1
              ref={titleRef}
              className="text-center story-title"
              style={{ fontSize: titleConfig.initialFontSize + 'px' }}
            >
              {data.mainTitle}
            </h1>
            <div className="scroll-hint">
              <span className="material-symbols-rounded" style={{ fontSize: '24px', color: '#6366f1' }}>keyboard_arrow_down</span>
              <span className="scroll-hint-text">Scroll to explore</span>
            </div>
          </div>

          <div className="card-zone flex-none w-full flex flex-col items-center">
            <div
              className="relative flex flex-col items-center"
              style={{ maxWidth: '900px' }}
            >
              <div className="timeline-connector"></div>

              {data.cards.map((card, idx) => {
                const hueShift = (idx * 30) % 360;
                const accentColor = `hsl(${hueShift}, 70%, 50%)`;
                return (
                  <div key={idx} className={`card-item flex flex-col ${verticalWidth}`} style={{ 
                    position: 'relative',
                    backgroundColor: '#ffffff',
                    border: '2px solid rgba(99, 102, 241, 0.1)',
                    padding: '2rem',
                    marginBottom: idx < cardCount - 1 ? '2rem' : '0',
                    borderRadius: '16px'
                  }}>
                    <div className="step-indicator">{String(idx + 1).padStart(2, '0')}</div>
                    {idx > 0 && <div className="timeline-node top"></div>}

                    <div className="flex items-start gap-4 mb-3" style={{ paddingLeft: '20px' }}>
                      <span 
                        className="js-icon material-symbols-rounded"
                        style={{
                          color: accentColor,
                          fontSize: layout.iconSize
                        }}
                      >{card.icon}</span>
                      <h3 
                        className={`js-title font-semibold ${layout.titleSizeClass}`}
                        style={{ color: '#1a1a2e' }}
                      >{card.title}</h3>
                    </div>
                    <p
                      className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
                      style={{ 
                        paddingLeft: '68px',
                        color: '#1a1a2e',
                        opacity: 0.8
                      }}
                      dangerouslySetInnerHTML={{ __html: card.desc }}
                    />

                    <div className="data-dot" style={{ top: '20%', right: '10%', animationDelay: `${idx * 0.3}s` }}></div>
                    <div className="data-dot" style={{ bottom: '20%', left: '10%', animationDelay: `${idx * 0.3 + 0.5}s` }}></div>

                    <div className="timeline-node bottom"></div>
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

import { generateDownloadableHtml } from '../utils/template';

export const scrollStoryTemplate: TemplateConfig = {
  id: 'scrollStory',
  name: '滚动叙事',
  description: '滚动触发分镜、动画与数据讲述；适合长页发布、报告、媒体专题',
  icon: 'auto_stories',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <ScrollStory data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'scrollStory'),
};

export { ScrollStory };
