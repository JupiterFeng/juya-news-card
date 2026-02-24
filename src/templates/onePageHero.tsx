import React, { useLayoutEffect, useRef } from 'react';
import { TemplateConfig } from './types';
import { GeneratedContent } from '../types';
import {
  calculateStandardLayout,
} from '../utils/layout-calculator';
import { generateDownloadableHtml } from '../utils/template';

/**
 * OnePageHero 渲染组件
 * 强Hero营销长页风格 - 头屏极强视觉 + 逐段卖点
 */
interface OnePageHeroProps {
  data: GeneratedContent;
  scale: number;
}

const OnePageHero: React.FC<OnePageHeroProps> = ({ data, scale }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);

  const layout = calculateStandardLayout(data.cards.length);
  const bottomSafeRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!mainRef.current || !wrapperRef.current || !cardContainerRef.current || !titleRef.current || !bottomSafeRef.current) return;
    const cards = Array.from(cardContainerRef.current.children) as HTMLElement[];
    const N = cards.length;

    wrapperRef.current.style.transform = '';
    wrapperRef.current.style.gap = '80px';
    cardContainerRef.current.style.gap = '40px';
    titleRef.current.style.fontSize = '';
    bottomSafeRef.current.style.height = '0px';

    const titleSizeClass = layout.titleSizeClass;
    const descSizeClass = layout.descSizeClass;
    const iconSize = layout.iconSize;

    cards.forEach(card => {
      card.className = 'card-item flex flex-row items-center gap-8';
      const t = card.querySelector('.js-title') as HTMLElement;
      const i = card.querySelector('.js-icon') as HTMLElement;
      const d = card.querySelector('.js-desc') as HTMLElement;
      card.style.padding = '';
      if(t) t.style.fontSize = '';
      if(i) i.style.fontSize = '';
      if(d) d.style.fontSize = '';
    });

    

    cards.forEach((card, idx) => {
      const t = card.querySelector('.js-title') as HTMLElement;
      const i = card.querySelector('.js-icon') as HTMLElement;
      const d = card.querySelector('.js-desc') as HTMLElement;

      card.style.backgroundColor = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
      card.style.color = '#1a1a1a';
      card.style.padding = '3rem 4rem';
      card.style.borderRadius = '16px';
      card.style.border = '1px solid #e5e7eb';

      if(i) { i.className = 'js-icon material-symbols-rounded'; i.style.color = '#6366f1'; i.style.fontSize = layout.iconSize; }
      if(t) { t.className = `js-title font-bold ${titleSizeClass}`; t.style.color = '#1a1a1a'; }
      if(d) { d.className = `js-desc font-medium leading-relaxed ${descSizeClass}`; d.style.color = '#4b5563'; }
    });

    let size = 110;
    titleRef.current.style.fontSize = size + 'px';
    let guard = 0;
    while(titleRef.current.scrollWidth > 1600 && size > 45 && guard < 100) {
      size -= 1;
      titleRef.current.style.fontSize = size + 'px';
      guard++;
    }

    const fitViewport = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const maxH = 1040;
      const contentH = wrapper.scrollHeight;
      if (contentH > maxH) {
        const scaleVal = Math.max(0.6, maxH / contentH);
        wrapper.style.transform = `scale(${scaleVal})`;
        return;
      }
      wrapper.style.transform = '';
    };
    setTimeout(fitViewport, 50);
  }, [data, layout]);

  return (
    <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'top left', overflow: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
      <style>{`
        @font-face { font-family: 'CustomPreviewFont'; src: url('/assets/htmlFont.ttf') format('truetype'); }
        .main-container { font-family: 'Inter', 'CustomPreviewFont', system-ui, sans-serif; background: linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%); color: #fff; }
        .hero-title { font-weight: 900; color: #fff; letter-spacing: -0.03em; line-height: 1.1; text-shadow: 0 4px 20px rgba(0,0,0,0.2); }
        .card-item { transition: all 0.3s ease; width: 100%; max-width: 1200px; }
        .card-item:hover { transform: translateX(8px); box-shadow: 0 8px 30px rgba(0,0,0,0.1); }
        .js-desc strong { font-weight: 700; color: #6366f1; }
        .js-desc code { background: #f3f4f6; color: #6366f1; padding: 0.2em 0.5em; border-radius: 6px; font-weight: 600; }
        .content-scale { transform-origin: center top; }
        .cta-button { background: #1a1a1a; color: #fff; padding: 1rem 2.5rem; border-radius: 50px; font-weight: 600; font-size: 1.1rem; box-shadow: 0 4px 14px rgba(0,0,0,0.2); }
      `}</style>
      <div ref={mainRef} className="main-container relative box-border w-full h-full overflow-hidden flex flex-col items-center">
        <div ref={wrapperRef} className="content-wrapper w-full flex flex-col items-center px-20 box-border content-scale" style={{ gap: '80px', paddingTop: '60px' }}>
          <div className="title-zone flex-none flex flex-col items-center justify-center w-full gap-6">
            <h1 ref={titleRef} className="text-center hero-title">{data.mainTitle}</h1>
            <button className="cta-button">开始使用 →</button>
          </div>
          <div className="card-zone flex-none w-full flex flex-col items-center gap-6">
            <div ref={cardContainerRef} className="w-full flex flex-col items-center">
              {data.cards.map((card, idx) => (
                <div key={idx} className="card-item flex flex-row items-center gap-8">
                  <span className="js-icon material-symbols-rounded">{card.icon}</span>
                  <div style={{ flex: 1 }}>
                    <h3 className="js-title">{card.title}</h3>
                    <p className="js-desc" dangerouslySetInnerHTML={{ __html: card.desc }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div ref={bottomSafeRef} className="hidden"></div>
      </div>
    </div>
  );
};


export const onePageHeroTemplate: TemplateConfig = {
  id: 'onePageHero',
  name: '强Hero营销',
  description: '头屏极强视觉 + 逐段卖点；适合 SaaS、AI、DTC 品牌官网',
  icon: 'rocket_launch',
  downloadable: true,
  ssrReady: true,
  render: (data, scale) => <OnePageHero data={data} scale={scale} />,
  generateHtml: (data) => generateDownloadableHtml(data, 'onePageHero'),
};

export { OnePageHero };
