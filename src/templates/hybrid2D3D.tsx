import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import { 
  calculateStandardLayout, 
  getStandardTitleConfig,
  generateTitleFitScript,
  generateViewportFitScript
} from '../utils/layout-calculator';
import { generateDownloadableHtml } from '../utils/template';
import { autoAddSpaceToHtml } from '../utils/text-spacing';

interface Hybrid2D3DProps {
  data: GeneratedContent;
  scale: number;
}

const HYBRID_COLORS = [
  { bg: 'linear-gradient(145deg, #667eea 0%, #764ba2 100%)', text: '#ffffff', accent: '#f093fb', depth: '#667eea' },
  { bg: 'linear-gradient(145deg, #11998e 0%, #38ef7d 100%)', text: '#ffffff', accent: '#764ba2', depth: '#11998e' },
  { bg: 'linear-gradient(145deg, #ee0979 0%, #ff6a00 100%)', text: '#ffffff', accent: '#667eea', depth: '#ee0979' },
  { bg: 'linear-gradient(145deg, #4facfe 0%, #00f2fe 100%)', text: '#1a1a1a', accent: '#f093fb', depth: '#4facfe' },
  { bg: 'linear-gradient(145deg, #fa709a 0%, #fee140 100%)', text: '#1a1a1a', accent: '#11998e', depth: '#fa709a' },
];

const getHybridCardTextClasses = (count: number): { title: string; desc: string } => {
  if (count <= 2) return { title: 'text-2xl', desc: 'text-lg' };
  if (count <= 4) return { title: 'text-xl', desc: 'text-base' };
  if (count <= 6) return { title: 'text-lg', desc: 'text-base' };
  if (count <= 8) return { title: 'text-base', desc: 'text-sm' };
  return { title: 'text-sm', desc: 'text-xs' };
};

const Hybrid2D3D: React.FC<Hybrid2D3DProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const cardCount = data.cards.length;
  const layout = calculateStandardLayout(cardCount);
  const cardText = getHybridCardTextClasses(cardCount);
  const titleConfig = getStandardTitleConfig(cardCount, {
    titleConfigs: {
      '1-3': { initialFontSize: 80, minFontSize: 36 },
      '4': { initialFontSize: 80, minFontSize: 36 },
      '5-6': { initialFontSize: 80, minFontSize: 36 },
      '7-8': { initialFontSize: 80, minFontSize: 36 },
      '9+': { initialFontSize: 80, minFontSize: 36 }
    }
  });
  const cardZoneInsetX = cardCount === 3 || (cardCount >= 5 && cardCount <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = cardCount === 2 ? '1500px' : cardCount === 3 ? '1700px' : '100%';

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if (!data || !wrapperRef.current || !titleRef.current) return;

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
        const nextScale = Math.max(0.65, maxH / contentH);
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
      <link href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;600;700&family=Roboto:wght@400;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .hybrid-container {
          font-family: 'Exo 2', 'CustomPreviewFont', sans-serif;
          background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
          color: #ffffff;
          position: relative;
          overflow: hidden;
        }
        .hybrid-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 30% 20%, rgba(102,126,234,0.3) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, rgba(240,147,251,0.2) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(17,153,142,0.15) 0%, transparent 50%);
          pointer-events: none;
        }
        .hybrid-title {
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 0.1em;
          line-height: 1.2;
          position: relative;
          z-index: 10;
          text-shadow: 0 4px 20px rgba(102,126,234,0.6), 0 8px 40px rgba(0,0,0,0.4);
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
        .text-2-5xl { font-size: 1.8125rem; line-height: 1.4; }
        .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
        .text-3-5xl { font-size: 2.0625rem; line-height: 1.3; }
        .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
        .text-4-5xl { font-size: 2.625rem; line-height: 1.2; }
        .text-5xl { font-size: 3rem; line-height: 1; }
        .text-5-5xl { font-size: 3.375rem; line-height: 1.1; }
        .text-6xl { font-size: 3.75rem; line-height: 1; }
        .text-7xl { font-size: 4.5rem; line-height: 1; }
        .text-8xl { font-size: 6rem; line-height: 1; }
        .text-9xl { font-size: 8rem; line-height: 1; }
        .card-item {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative;
          z-index: 5;
        }
        .card-item::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%);
          border-radius: 16px;
          pointer-events: none;
        }
        .card-item::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 10%;
          width: 80%;
          height: 20%;
          background: radial-gradient(ellipse, rgba(0,0,0,0.4) 0%, transparent 70%);
          filter: blur(10px);
          pointer-events: none;
        }
        .card-item:hover {
          transform: perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(-10px) scale(var(--hover-scale, 1.05)) !important;
          box-shadow:
            0 30px 60px rgba(0,0,0,0.4),
            0 0 0 1px rgba(255,255,255,0.2) inset,
            0 -15px 30px rgba(255,255,255,0.15) inset !important;
        }
        .depth-layer {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 20px;
          height: 20px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          filter: blur(4px);
          pointer-events: none;
        }
        .cube-corner {
          position: absolute;
          width: 12px;
          height: 12px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 2px;
          transform: rotate(45deg);
          pointer-events: none;
        }
        .cube-corner.top-right {
          top: 10px;
          right: 10px;
        }
        .cube-corner.bottom-left {
          bottom: 10px;
          left: 10px;
        }
        .floating-particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: rgba(255,255,255,0.6);
          border-radius: 50%;
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
          50% { transform: translateY(-10px) scale(1.5); opacity: 1; }
        }
        .content-scale {
          transform-origin: center center;
        }
      `}</style>

      <div
        className="hybrid-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-20 box-border content-scale z-10"
          style={{ 
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined
          }}
        >
          <div className="flex flex-col items-center">
            <div className="cube-corner top-right" style={{ top: '-25px', right: '-40px' }}></div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
              <div style={{ width: '30px', height: '4px', background: 'linear-gradient(90deg, #667eea, #764ba2)', borderRadius: '2px', boxShadow: '0 0 10px rgba(102,126,234,0.5)' }}></div>
              <div style={{ width: '10px', height: '4px', background: '#f093fb', borderRadius: '2px' }}></div>
              <div style={{ width: '30px', height: '4px', background: 'linear-gradient(90deg, #764ba2, #f093fb)', borderRadius: '2px', boxShadow: '0 0 10px rgba(118,75,162,0.5)' }}></div>
            </div>
            <h1 ref={titleRef} className={`text-center hybrid-title ${layout.titleSizeClass}`}>
              {data.mainTitle}
            </h1>
            <div style={{ display: 'flex', gap: '6px', marginTop: '16px' }}>
              <div style={{ width: '30px', height: '4px', background: 'linear-gradient(90deg, #11998e, #38ef7d)', borderRadius: '2px', boxShadow: '0 0 10px rgba(17,153,142,0.5)' }}></div>
              <div style={{ width: '10px', height: '4px', background: '#667eea', borderRadius: '2px' }}></div>
              <div style={{ width: '30px', height: '4px', background: 'linear-gradient(90deg, #38ef7d, #11998e)', borderRadius: '2px', boxShadow: '0 0 10px rgba(56,239,125,0.5)' }}></div>
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
                const color = HYBRID_COLORS[idx % HYBRID_COLORS.length];
                return (
                  <div 
                    key={idx} 
                    data-card-item="true"
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      '--hover-scale': data.cards.length >= 7 ? '1.02' : '1.05',
                      background: color.bg,
                      borderRadius: '16px',
                      padding: layout.cardPadding,
                      boxShadow: `
                        0 20px 40px rgba(0,0,0,0.3),
                        0 0 0 1px rgba(255,255,255,0.1) inset,
                        0 -10px 20px rgba(255,255,255,0.1) inset
                      `,
                      transform: `perspective(1000px) rotateX(${idx % 2 * 2}deg) rotateY(${(idx % 3 - 1) * 2}deg)`
                    } as React.CSSProperties}
                  >
                    <div className="depth-layer"></div>
                    <div className="cube-corner top-right"></div>
                    <div className="cube-corner bottom-left"></div>
                    <div className="floating-particle" style={{ top: '20%', left: '15%', animationDelay: `${idx * 0.3}s` }}></div>
                    <div className="floating-particle" style={{ top: '60%', right: '20%', animationDelay: `${idx * 0.3 + 0.5}s` }}></div>
                    
                    <div className="card-header flex items-center gap-3 mb-4">
                      <span 
                        className="js-icon material-symbols-rounded"
                        style={{
                          color: color.accent,
                          fontSize: layout.iconSize,
                          filter: `drop-shadow(0 4px 8px ${color.depth})`
                        }}
                      >{card.icon}</span>
                      <h3 
                        className={`js-title font-bold leading-tight ${cardText.title}`}
                        style={{
                          color: color.text,
                          fontFamily: "'Exo 2', 'Roboto', sans-serif",
                          textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                        }}
                      >{card.title}</h3>
                    </div>
                    <p
                      className={`js-desc font-medium leading-relaxed ${cardText.desc}`}
                      style={{
                        color: color.text,
                        opacity: '0.95'
                      }}
                      dangerouslySetInnerHTML={{ __html: autoAddSpaceToHtml(card.desc) }}
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

export const hybrid2D3DTemplate: TemplateConfig = {
  id: 'hybrid2D3D',
  name: '2D+3D混合',
  description: '三维渲染二维角色融合的混合风格，空间深度与层次感',
  icon: 'view_in_ar',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <Hybrid2D3D data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'hybrid2D3D'),
};

export { Hybrid2D3D };
