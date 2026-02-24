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

/**
 * MonogramSignature 渲染组件
 * 字标/字母组合系统：用字体结构做品牌核心
 * 特点：经典优雅、超大字标、衬线字体、奢华质感
 */
interface MonogramSignatureProps {
  data: GeneratedContent;
  scale: number;
}

const MonogramSignature: React.FC<MonogramSignatureProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const N = data.cards.length;
  const layout = calculateStandardLayout(N);
  const titleConfig = getStandardTitleConfig(N);
  const cardZoneInsetX = N === 3 || (N >= 5 && N <= 8) ? '36px' : '0px';
  const cardZoneMaxWidth = N === 2 ? '1500px' : N === 3 ? '1700px' : '100%';

  const monogramColors = [
    { bg: '#1A1A1A', text: '#D4AF37', accent: '#FFD700', textShadow: '0 0 30px rgba(212,175,55,0.5)' },
    { bg: '#0A1628', text: '#C9A961', accent: '#E8D5A3', textShadow: '0 0 30px rgba(201,169,97,0.4)' },
    { bg: '#1C0A0A', text: '#D4AF37', accent: '#B8860B', textShadow: '0 0 30px rgba(212,175,55,0.5)' },
    { bg: '#0D1B2A', text: '#C9A961', accent: '#D4AF37', textShadow: '0 0 30px rgba(201,169,97,0.4)' },
    { bg: '#1A1A1A', text: '#E5E4E2', accent: '#C0C0C0', textShadow: '0 0 30px rgba(229,228,226,0.3)' },
    { bg: '#2D1B1B', text: '#D4AF37', accent: '#FFD700', textShadow: '0 0 30px rgba(212,175,55,0.5)' },
  ];

  const getInitials = (text: string) => {
    const words = text.toUpperCase().split(/\s+/);
    if (words.length >= 2) {
      return words[0][0] + words[1][0];
    }
    return text.substring(0, 2).toUpperCase();
  };

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
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Cormorant+Garamond:wght@400;500;600&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
        <style>{`
            @font-face {
                font-family: 'CustomPreviewFont';
                src: url('/assets/htmlFont.ttf') format('truetype');
            }
            .main-container {
                font-family: 'Cormorant Garamond', 'CustomPreviewFont', serif;
                background: linear-gradient(180deg, #0D0D0D 0%, #1A1A1A 50%, #0D0D0D 100%);
                color: #D4AF37;
                position: relative;
            }
            /* 奢华纹理背景 */
            .main-container::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-image:
                    repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(212,175,55,0.03) 2px, rgba(212,175,55,0.03) 4px),
                    repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(212,175,55,0.03) 2px, rgba(212,175,55,0.03) 4px);
                pointer-events: none;
            }
            /* 装饰性边框 */
            .main-container::after {
                content: '';
                position: absolute;
                top: 40px;
                left: 40px;
                right: 40px;
                bottom: 40px;
                border: 1px solid rgba(212,175,55,0.2);
                pointer-events: none;
            }
            .monogram-title {
                font-family: 'Playfair Display', 'Cormorant Garamond', serif;
                font-weight: 600;
                color: #D4AF37;
                letter-spacing: 0.15em;
                line-height: 1.2;
                text-transform: uppercase;
                text-shadow: 0 0 40px rgba(212,175,55,0.4);
                position: relative;
                z-index: 10;
            }
            .monogram-title::before,
            .monogram-title::after {
                content: '❖';
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                color: rgba(212,175,55,0.3);
                font-size: 24px;
            }
            .monogram-title::before { left: -40px; }
            .monogram-title::after { right: -40px; }
            .card-item {
                position: relative;
                transition: all 0.3s ease;
            }
            /* 卡片角标装饰 */
            .card-item::before {
                content: attr(data-monogram);
                position: absolute;
                top: -20px;
                right: 20px;
                font-family: 'Playfair Display', serif;
                font-size: 48px;
                font-weight: 700;
                color: attr(data-accent);
                text-shadow: 0 2px 10px rgba(0,0,0,0.5);
                opacity: 0.6;
            }
            /* 内边框装饰 */
            .card-item::after {
                content: '';
                position: absolute;
                top: 8px;
                left: 8px;
                right: 8px;
                bottom: 8px;
                border: 1px solid rgba(212,175,55,0.15);
                pointer-events: none;
            }
            .card-item:hover {
                box-shadow: inset 0 0 80px rgba(0,0,0,0.6), 0 12px 48px rgba(0,0,0,0.5), 0 0 0 3px rgba(212,175,55,0.3) !important;
                border-color: rgba(212,175,55,0.6) !important;
            }
            .card-item:hover::after {
                border-color: rgba(212,175,55,0.3);
            }
                    .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
                    .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
                    .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }
            .content-scale { transform-origin: center center; }
        `}</style>

        <div className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center">
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
                        className="text-center monogram-title"
                    >
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
                        {data.cards.map((card, idx) => {
                            const color = monogramColors[idx % monogramColors.length];
                            return (
                                <div
                                    key={idx}
                                    data-card-item="true"
                                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                                    data-monogram={getInitials(card.title)}
                                    data-accent={color.accent}
                                    style={{
                                      backgroundColor: color.bg,
                                      borderRadius: '0',
                                      border: `2px solid ${color.accent}`,
                                      boxShadow: 'inset 0 0 60px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.4)',
                                      transition: 'all 0.3s ease',
                                      overflow: 'visible',
                                      padding: layout.cardPadding,
                                    }}
                                >
                                    <div className="card-header flex items-center gap-4 mb-6">
                                        <span
                                          className="js-icon material-symbols-rounded"
                                          style={{
                                            color: color.accent,
                                            fontSize: layout.iconSize,
                                            opacity: '0.9',
                                          }}
                                        >
                                          {card.icon}
                                        </span>
                                        <h3
                                          className={`js-title font-medium leading-tight ${layout.titleSizeClass}`}
                                          style={{
                                            color: color.text,
                                            fontFamily: "'Playfair Display', 'Cormorant Garamond', 'Georgia', serif",
                                            letterSpacing: '0.05em',
                                            textShadow: color.textShadow,
                                            textTransform: 'uppercase',
                                          }}
                                        >
                                          {card.title}
                                        </h3>
                                    </div>
                                    <p
                                        className={`js-desc font-normal leading-relaxed ${layout.descSizeClass}`}
                                        style={{
                                          color: 'rgba(255,255,255,0.7)',
                                          fontFamily: "'Cormorant Garamond', 'Georgia', serif",
                                          letterSpacing: '0.02em',
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

export const monogramSignatureTemplate: TemplateConfig = {
  id: 'monogramSignature',
  name: '字标签名系统',
  description: '字体结构作为品牌核心，经典优雅的奢华质感',
  icon: 'text_fields',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <MonogramSignature data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'monogramSignature'),
};

export { MonogramSignature };
