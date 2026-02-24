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

/**
 * MaterialYou 渲染组件
 * Android 12 "Material You（动态配色）" (2021) 风格
 * 从壁纸抽取色板、组件自动适配、更圆润柔和
 */
interface MaterialYouProps {
  data: GeneratedContent;
  scale: number;
}

const MATERIAL_YOU_COLORS = [
  {
    container: '#e8def8',
    onContainer: '#1d1b20',
    primary: '#6750a4',
    onPrimary: '#ffffff',
    secondary: '#625b71',
    tertiary: '#7d5260'
  },
  {
    container: '#f3edf7',
    onContainer: '#1d1b20',
    primary: '#6750a4',
    onPrimary: '#ffffff',
    secondary: '#625b71',
    tertiary: '#7d5260'
  },
  {
    container: '#ffd8e4',
    onContainer: '#31111d',
    primary: '#984064',
    onPrimary: '#ffffff',
    secondary: '#745762',
    tertiary: '#5e4131'
  },
  {
    container: '#e7f3f5',
    onContainer: '#191c1a',
    primary: '#006874',
    onPrimary: '#ffffff',
    secondary: '#465258',
    tertiary: '#4b4f2c'
  },
  {
    container: '#fff9d7',
    onContainer: '#1b1b12',
    primary: '#6a6212',
    onPrimary: '#ffffff',
    secondary: '#626042',
    tertiary: '#3f4b19'
  },
  {
    container: '#ffdad6',
    onContainer: '#3b1612',
    primary: '#bf4322',
    onPrimary: '#ffffff',
    secondary: '#76564f',
    tertiary: '#765830'
  },
];

const MaterialYou: React.FC<MaterialYouProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const cardCount = data?.cards?.length || 0;
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
        size -= 2;
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
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face {
          font-family: 'CustomPreviewFont';
          src: url('/assets/htmlFont.ttf') format('truetype');
        }
        .material-you-container {
          font-family: 'CustomPreviewFont', 'Google Sans', 'Roboto', sans-serif;
          background: linear-gradient(135deg, #fef7ff 0%, #f3edf7 50%, #e8def8 100%);
          color: #1d1b20;
        }
        .material-you-title {
          font-weight: 400;
          color: #1d1b20;
          font-family: 'CustomPreviewFont', 'Google Sans', sans-serif;
        }
        .card-item {
          position: relative;
        }
        
        .card-width-2col { width: calc((100% - var(--container-gap)) / 2 - 1px); }
        .card-width-3col { width: calc((100% - var(--container-gap) * 2) / 3 - 1px); }
        .card-width-4col { width: calc((100% - var(--container-gap) * 3) / 4 - 1px); }

        .text-5-5xl { font-size: 3.375rem; line-height: 1.1; }
        .text-4-5xl { font-size: 2.625rem; line-height: 1.2; }
        .text-3-5xl { font-size: 2.0625rem; line-height: 1.3; }
        .text-2-5xl { font-size: 1.8125rem; line-height: 1.4; }

        .text-6xl { font-size: 3.75rem; line-height: 1; }
        .text-5xl { font-size: 3rem; line-height: 1; }
        .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
        .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
        .text-2xl { font-size: 1.5rem; line-height: 2rem; }
        .text-xl  { font-size: 1.25rem; line-height: 1.75rem; }

        .js-desc strong { color: inherit; font-weight: 500; }
        .content-scale { transform-origin: center center; }
      `}</style>

      <div
        className="material-you-container relative box-border w-full h-full overflow-hidden flex flex-col items-center justify-center"
      >
        <div
          ref={wrapperRef}
          className="content-wrapper w-full flex flex-col items-center px-16 box-border content-scale"
          style={{ 
            gap: layout.wrapperGap,
            paddingLeft: layout.wrapperPaddingX || undefined,
            paddingRight: layout.wrapperPaddingX || undefined
          }}
        >
          {/* 顶部标题 */}
          <div className="flex flex-col items-center">
            <div style={{
              padding: '24px 48px',
              background: '#f3edf7',
              borderRadius: '100px',
              border: '1px solid #dcd8df'
            }}>
              <h1 
                ref={titleRef} 
                className={`text-center material-you-title ${layout.titleSizeClass}`}
                style={{ fontSize: titleConfig.initialFontSize + 'px' }}
              >
                {data.mainTitle}
              </h1>
            </div>
          </div>

          {/* 卡片区域 */}
          <div className="card-zone flex-none w-full">
            <div
              className="w-full flex flex-wrap justify-center content-center"
              style={{ 
                gap: layout.containerGap,
                '--container-gap': layout.containerGap
              } as React.CSSProperties}
            >
              {data?.cards?.map((card, idx) => {
                const theme = MATERIAL_YOU_COLORS[idx % MATERIAL_YOU_COLORS.length];
                return (
                  <div 
                    key={idx} 
                    className={`card-item flex flex-col ${layout.cardWidthClass}`}
                    style={{
                      backgroundColor: theme.container,
                      borderRadius: '24px',
                      padding: layout.cardPadding,
                    }}
                  >
                    <div className="card-header flex items-center gap-5 mb-6">
                      <span 
                        className="js-icon material-symbols-rounded"
                        style={{ fontSize: layout.iconSize, color: theme.primary }}
                      >
                        {card.icon}
                      </span>
                      <h3 
                        className={`js-title font-medium ${layout.titleSizeClass}`}
                        style={{ color: theme.onContainer, fontFamily: '"Google Sans", "Roboto", sans-serif' }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className={`js-desc ${layout.descSizeClass}`}
                      style={{ color: theme.onContainer, opacity: 0.8, lineHeight: 1.6 }}
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

export const materialYouTemplate: TemplateConfig = {
  id: 'materialYou',
  name: '动态配色界面',
  description: '动态配色驱动的个性化界面风格',
  icon: 'palette',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <MaterialYou data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'materialYou'),
};

export { MaterialYou };
