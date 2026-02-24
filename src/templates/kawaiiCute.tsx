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
 * KawaiiCute 渲染组件
 * 可爱系UI风格：超大圆角、柔和粉彩、可爱装饰
 */
interface KawaiiCuteProps {
  data: GeneratedContent;
  scale: number;
}

// Kawaii 可爱配色方案
const KAWAII_COLORS = [
  { bg: '#FFB3BA', accent: '#FF8A94', icon: '#FF6B7A', name: 'sakura' },      // 樱花粉
  { bg: '#BAFFC9', accent: '#94E8A8', icon: '#6BD684', name: 'mint' },        // 薄荷绿
  { bg: '#FFDFBA', accent: '#FFCC8F', icon: '#FFB85D', name: 'peach' },       // 蜜桃橙
  { bg: '#BAE1FF', accent: '#8CC9FF', icon: '#5BA8FF', name: 'sky' },         // 天空蓝
  { bg: '#FFFFBA', accent: '#FFFF8A', icon: '#FFFF5A', name: 'lemon' },       // 柠檬黄
  { bg: '#E8D5FF', accent: '#D4B8FF', icon: '#B797FF', name: 'lavender' },    // 薰衣草
  { bg: '#FFD6FF', accent: '#FFB3FF', icon: '#FF8AFF', name: 'strawberry' },  // 草莓粉
  { bg: '#BFFFFF', accent: '#8FFFFF', icon: '#5FFFFF', name: 'ocean' },       // 海洋蓝
];

// 可爱装饰字符
const DECORATIONS = ['✨', '♡', '★', '♪', '♬', '☁️', '⭐', '🌸', '🎀', '💫', '🌈', '💕'];

const KawaiiCute: React.FC<KawaiiCuteProps> = ({ data, scale }) => {
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
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .kawaii-container {
          font-family: 'CustomPreviewFont', 'Nunito', 'Quicksand', 'M PLUS Rounded 1c', system-ui, -apple-system, sans-serif;
        }
        .kawaii-title {
          font-weight: 800;
          color: #FF8A94;
          text-shadow: 3px 3px 0 #FFF, 5px 5px 0 #FFD6FF;
          letter-spacing: 0.05em;
        }
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .text-xs { font-size: 0.75rem; line-height: 1rem; }
        .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
        .text-base { font-size: 1rem; line-height: 1.5rem; }
        .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
        .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
        .text-2xl { font-size: 1.5rem; line-height: 2rem; }
        .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
        .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
        .text-5xl { font-size: 3rem; line-height: 1; }
        .text-6xl { font-size: 3.75rem; line-height: 1; }
        .text-7xl { font-size: 4.5rem; line-height: 1; }
        .text-8xl { font-size: 6rem; line-height: 1; }
        .text-9xl { font-size: 8rem; line-height: 1; }
        .kawaii-card {
          border-radius: 32px;
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
          position: relative;
          border: 4px solid #FFF;
        }
        .kawaii-card::before {
          content: '';
          position: absolute;
          top: -8px;
          left: -8px;
          right: -8px;
          bottom: -8px;
          background: inherit;
          border-radius: 36px;
          opacity: 0.3;
          z-index: -1;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .kawaii-deco {
          position: absolute;
          top: 12px;
          right: 12px;
          opacity: 0.6;
        }
        .js-desc {
          line-height: 1.6;
          font-weight: 500;
        }
        .js-desc code {
          background: rgba(255,255,255,0.7);
          color: #6A6A6A;
          padding: 0.15em 0.5em;
          border-radius: 12px;
          font-family: monospace;
          font-size: 0.9em;
          font-weight: bold;
        }
        .js-desc strong {
          font-weight: 800;
          color: #FF6B7A;
        }
        .cloud-decoration {
          position: absolute;
          opacity: 0.4;
          pointer-events: none;
        }
      `}</style>

      <div
        className="kawaii-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
        style={{
          backgroundColor: '#FFF9FC',
          backgroundImage: `
            radial-gradient(circle at 20% 30%, #FFE8F0 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, #E8F4FF 0%, transparent 50%),
            radial-gradient(circle at 50% 90%, #FFF4E8 0%, transparent 50%)
          `
        }}
      >
        <div className="cloud-decoration" style={{ top: '10%', left: '5%', fontSize: '60px' }}>☁️</div>
        <div className="cloud-decoration" style={{ top: '15%', right: '8%', fontSize: '50px' }}>✨</div>
        <div className="cloud-decoration" style={{ bottom: '15%', left: '8%', fontSize: '55px' }}>⭐</div>
        <div className="cloud-decoration" style={{ bottom: '20%', right: '5%', fontSize: '45px' }}>🌸</div>

        <div
          ref={wrapperRef}
          className="content-wrapper relative z-10 w-full flex flex-col items-center px-20 box-border"
          style={{ 
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined
          }}
        >
          <div className="title-zone flex-none flex items-center justify-center">
            <div className="title-wrapper bg-white/80 backdrop-blur-sm rounded-full px-12 py-6 border-4 border-pink-200">
              <h1 ref={titleRef} className={`kawaii-title text-center ${layout.titleSizeClass}`}>
                {data.mainTitle}
              </h1>
            </div>
          </div>

          <div className="card-zone flex-none w-full">
            <div
              className="w-full flex flex-wrap justify-center content-center"
              style={{ 
                gap: layout.containerGap,
                '--container-gap': layout.containerGap
              } as React.CSSProperties}
            >
              {data.cards.map((card, idx) => {
                const color = KAWAII_COLORS[idx % KAWAII_COLORS.length];
                return (
                  <div 
                    key={idx} 
                    className={`card-item kawaii-card ${layout.cardWidthClass}`}
                    style={{ 
                      backgroundColor: color.bg,
                      padding: layout.cardPadding,
                      boxShadow: `0 8px 24px ${color.accent}40, 0 4px 12px ${color.accent}20`
                    }}
                  >
                    <span 
                      className="kawaii-deco"
                      style={{ fontSize: '24px' }}
                    >{DECORATIONS[idx % DECORATIONS.length]}</span>
                    <div className="card-header">
                      <h3 
                        className={`js-title font-bold ${layout.titleSizeClass}`}
                        style={{ color: '#5A5A5A' }}
                      >{card.title}</h3>
                      <span 
                        className="js-icon material-symbols-rounded"
                        style={{ fontSize: layout.iconSize, color: color.icon }}
                      >{card.icon}</span>
                    </div>
                    <p
                      className={`js-desc ${layout.descSizeClass}`}
                      style={{ color: '#7A7A7A', lineHeight: '1.6' }}
                      dangerouslySetInnerHTML={{ __html: card.desc }}
                    />
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

/**
 * KawaiiCute 模板配置
 */
export const kawaiiCuteTemplate: TemplateConfig = {
  id: 'kawaiiCute',
  name: '可爱系风格',
  description: '超大圆角、柔和粉彩的可爱设计',
  icon: 'favorite',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <KawaiiCute data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'kawaiiCute'),
};

export { KawaiiCute };
