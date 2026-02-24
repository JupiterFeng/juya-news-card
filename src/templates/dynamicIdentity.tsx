import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import { generateDownloadableHtml } from '../utils/template';
import {
  calculateStandardLayout,
  getStandardTitleConfig,
  generateTitleFitScript,
  generateViewportFitScript,
} from '../utils/layout-calculator';

/**
 * DynamicIdentity 渲染组件
 * 动态视觉识别：变形、生成、适配的规则系统
 * 特点：流动渐变、几何变形、充满活力的视觉冲击
 */
interface DynamicIdentityProps {
  data: GeneratedContent;
  scale: number;
}

const DYNAMIC_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 50%, #43e97b 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 50%, #f093fb 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 50%, #a8edea 100%)',
  'linear-gradient(135deg, #ff9a56 0%, #ff6a88 50%, #ff9a9e 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 50%, #fad0c4 100%)',
];

const TEXT_COLORS = ['#FFFFFF', '#FFFFFF', '#1A1A2E', '#1A1A2E', '#FFFFFF', '#1A1A2E'];
const SKEW_VALUES = ['-2deg', '0deg', '2deg', '-1deg', '1deg', '0deg'];
const BORDER_RADIUS_VALUES = ['24px', '32px 8px 32px 8px', '8px 32px 8px 32px', '20px', '32px', '16px'];

const DynamicIdentity: React.FC<DynamicIdentityProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const N = data?.cards?.length || 0;
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
      while(title.scrollWidth > 1700 && size > titleConfig.minFontSize && guard < 100) {
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
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .main-container {
          font-family: 'Poppins', 'CustomPreviewFont', sans-serif;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          color: #FFFFFF;
          position: relative;
          overflow: hidden;
        }
        .main-container::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.15) 0%, transparent 50%),
                      radial-gradient(circle at 80% 50%, rgba(240, 147, 251, 0.15) 0%, transparent 50%),
                      radial-gradient(circle at 50% 80%, rgba(79, 172, 254, 0.1) 0%, transparent 50%);
          animation: bgMove 20s ease-in-out infinite;
        }
        @keyframes bgMove {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(2%, 2%) rotate(5deg); }
          66% { transform: translate(-2%, -1%) rotate(-5deg); }
        }
        .dynamic-title {
          font-weight: 700;
          background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #4facfe, #667eea);
          background-size: 300% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.03em;
          line-height: 1.1;
          animation: gradientMove 6s ease infinite;
          position: relative;
          z-index: 10;
        }
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .card-item {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
        }
        .card-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
          pointer-events: none;
        }
        .card-item:hover {
          transform: skewX(0deg) scale(1.05) translateY(-8px) !important;
          box-shadow: 0 20px 60px rgba(0,0,0,0.25), 0 8px 20px rgba(0,0,0,0.15) !important;
          z-index: 20;
        }
        .card-item:hover .js-title,
        .card-item:hover .js-icon,
        .card-item:hover .js-desc {
          transform: skewX(0deg) !important;
        }
                .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
                .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
                .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
        .content-scale { transform-origin: center center; }
      `}</style>

      <div
        className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-24 box-border content-scale z-10"
          style={{
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined,
          }}
        >
          <div className="flex flex-col items-center">
            <h1
              ref={titleRef}
              className="text-center dynamic-title"
              style={{ fontSize: titleConfig.initialFontSize }}
            >
              {data.mainTitle}
            </h1>
          </div>

          <div className="card-zone flex-none w-full">
            <div
              className="w-full flex flex-wrap justify-center content-center"
              style={{ gap: layout.containerGap, '--container-gap': layout.containerGap } as React.CSSProperties}
            >
              {data.cards.map((card, idx) => {
                const gradient = DYNAMIC_GRADIENTS[idx % DYNAMIC_GRADIENTS.length];
                const textColor = TEXT_COLORS[idx % TEXT_COLORS.length];
                const skewValue = SKEW_VALUES[idx % SKEW_VALUES.length];
                const borderRadiusValue = BORDER_RADIUS_VALUES[idx % BORDER_RADIUS_VALUES.length];

                return (
                  <div 
                    key={idx} 
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      background: gradient,
                      borderRadius: borderRadiusValue,
                      transform: `skewX(${skewValue})`,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)',
                      padding: layout.cardPadding,
                      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      overflow: 'hidden'
                    }}
                  >
                    <div className="card-header flex items-center gap-3 mb-4">
                      <span 
                        className="js-icon material-symbols-rounded"
                        style={{
                          color: textColor,
                          fontSize: layout.iconSize,
                          backgroundColor: 'rgba(255,255,255,0.25)',
                          padding: '12px',
                          borderRadius: '50%',
                          transform: `skewX(${(parseFloat(skewValue) * -1).toString() + 'deg'})`
                        }}
                      >
                        {card.icon}
                      </span>
                      <h3 
                        className={`js-title font-bold leading-tight ${layout.titleSizeClass}`}
                        style={{
                          color: textColor,
                          fontFamily: "'Poppins', 'Inter', sans-serif",
                          letterSpacing: '-0.02em',
                          transform: `skewX(${(parseFloat(skewValue) * -1).toString() + 'deg'})`,
                          textShadow: textColor === '#FFFFFF' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
                        }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc font-medium leading-relaxed ${layout.descSizeClass}`}
                      style={{
                        color: textColor,
                        opacity: 0.95,
                        fontFamily: "'Poppins', 'Inter', sans-serif",
                        transform: `skewX(${(parseFloat(skewValue) * -1).toString() + 'deg'})`
                      }}
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

export const dynamicIdentityTemplate: TemplateConfig = {
  id: 'dynamicIdentity',
  name: '动态视觉识别',
  description: '变形、生成、适配的规则系统，充满活力的视觉冲击',
  icon: 'auto_awesome',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <DynamicIdentity data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'dynamicIdentity'),
};

export { DynamicIdentity };
