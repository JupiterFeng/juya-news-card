/**
 * 布局计算纯函数模块
 * 
 * 将模板的布局计算逻辑提取为纯函数，使其可在 SSR 和浏览器环境中复用。
 * 这确保了 CLI 生成的 HTML 与前端预览效果一致。
 */

import type { GeneratedContent } from '../types';

export const BOTTOM_RESERVED_PX = 100;

// ============================================================================
// 通用布局配置类型
// ============================================================================

export interface CardLayoutConfig {
    /** 卡片宽度类名 */
    cardWidthClass: string;
    /** 标题字号类名 */
    titleSizeClass: string;
    /** 描述字号类名 */
    descSizeClass: string;
    /** 图标大小（px） */
    iconSize: string;
    /** 内容区包裹器间距 */
    wrapperGap: string;
    /** 卡片容器间距 */
    containerGap: string;
    /** 卡片内边距 */
    cardPadding: string;
    /** 内容区左右边距 (px)，可选，默认使用模板默认值 */
    wrapperPaddingX?: string;
}

export interface TitleLayoutConfig {
    /** 标题初始字号（px） */
    initialFontSize: number;
    /** 标题最小字号（px） */
    minFontSize: number;
    /** 标题最大宽度（px），默认 1700 */
    maxWidth?: number;
}

export interface ThemeColor {
    bg: string;
    onBg: string;
    icon: string;
}

// ============================================================================
// 新版通用布局引擎 (Configuration Driven)
// ============================================================================

export interface LayoutTierConfig {
    /** 标题字号类名 (如 text-6xl) */
    titleSizeClass: string;
    /** 描述字号类名 (如 text-4xl) */
    descSizeClass: string;
    /** 图标大小 (px) */
    iconSize: string;
    /** 内容区包裹器间距 (px) */
    wrapperGap: string;
    /** 卡片容器间距 (px) */
    containerGap: string;
    /** 卡片内边距 (px) */
    cardPadding: string;
    /** 卡片宽度计算逻辑 (默认 auto) */
    cardWidthStrategy?: '2col' | '3col' | '4col' | 'single';
}

export interface TitleConfig {
    initialFontSize: number;
    minFontSize: number;
}

export interface StandardLayoutConfig {
    /** 主题色组 */
    themes: ThemeColor[];
    /** 标题最大宽度（px），默认 1700 */
    maxWidth?: number;
    /** 标题字号配置 (按卡片数量) */
    titleConfigs: {
        [key: string]: TitleConfig; // '1-3', '4', '5-6', '7-8', '9+'
    };
    /** 布局梯度配置 */
    tiers: {
        tier1: LayoutTierConfig;   // 1-3 cards
        tier1_5: LayoutTierConfig; // 4 cards
        tier2: LayoutTierConfig;   // 5-6 cards
        tier2_5: LayoutTierConfig; // 7-8 cards
        tier3: LayoutTierConfig;   // 9+ cards
    };
}

// ============================================================================
// 默认布局配置（大多数标准主题共用）
// ============================================================================

/**
 * 默认布局梯度配置
 * 适用于大多数标准卡片式主题
 */
export const DEFAULT_LAYOUT_TIERS: StandardLayoutConfig['tiers'] = {
    tier1: {
        titleSizeClass: 'text-5-5xl', descSizeClass: 'text-4xl',
        iconSize: '72px', wrapperGap: '72px', containerGap: '32px', cardPadding: '40px'
    },
    tier1_5: {
        titleSizeClass: 'text-5xl', descSizeClass: 'text-3-5xl',
        iconSize: '68px', wrapperGap: '68px', containerGap: '28px', cardPadding: '36px'
    },
    tier2: {
        titleSizeClass: 'text-4-5xl', descSizeClass: 'text-3xl',
        iconSize: '64px', wrapperGap: '36px', containerGap: '24px', cardPadding: '32px'
    },
    tier2_5: {
        // Optimized for 7-8 cards (Anti-Scaling)
        titleSizeClass: 'text-4xl', descSizeClass: 'text-2-5xl',
        iconSize: '52px', wrapperGap: '32px', containerGap: '20px', cardPadding: '20px'
    },
    tier3: {
        titleSizeClass: 'text-3-5xl', descSizeClass: 'text-2xl',
        iconSize: '48px', wrapperGap: '32px', containerGap: '12px', cardPadding: '16px'
    }
};

/**
 * 默认标题字号配置
 */
export const DEFAULT_TITLE_CONFIGS: StandardLayoutConfig['titleConfigs'] = {
    '1-3': { initialFontSize: 90, minFontSize: 45 }, // 105 -> 90
    '4': { initialFontSize: 80, minFontSize: 40 },   // 95 -> 80
    '5-6': { initialFontSize: 72, minFontSize: 36 }, // 85 -> 72
    '7-8': { initialFontSize: 64, minFontSize: 32 }, // 75 -> 64
    '9+': { initialFontSize: 56, minFontSize: 30 },  // 65 -> 56
};

/**
 * 通用标准布局计算引擎
 * @param cardCount - 卡片数量
 * @param config - 可选的布局配置，不传则使用默认配置
 */
export function calculateStandardLayout(cardCount: number, config?: Partial<StandardLayoutConfig>): CardLayoutConfig {
    const tiers = config?.tiers || DEFAULT_LAYOUT_TIERS;

    let tier: LayoutTierConfig;
    let cardWidthClass = 'card-width-4col'; // Default fallback
    let wrapperPaddingX: string | undefined = undefined;

    if (cardCount <= 2) {
        tier = tiers.tier1;
        cardWidthClass = cardCount === 1 ? 'w-2/3' : 'card-width-2col';
        wrapperPaddingX = '220px'; // 2 张卡片增加左右边距
    } else if (cardCount === 3) {
        tier = tiers.tier1;
        cardWidthClass = 'card-width-3col';
    } else if (cardCount <= 6) {
        // 4-6 张卡片统一使用 tier2
        tier = tiers.tier2;
        cardWidthClass = cardCount === 4 ? 'card-width-2col' : 'card-width-3col';
        if (cardCount === 4) {
            wrapperPaddingX = '200px'; // 4 张卡片增加左右边距
        }
    } else if (cardCount <= 8) {
        tier = tiers.tier2_5;
        cardWidthClass = 'card-width-4col';
    } else {
        tier = tiers.tier3;
        cardWidthClass = 'card-width-4col';
    }

    return {
        cardWidthClass,
        titleSizeClass: tier.titleSizeClass,
        descSizeClass: tier.descSizeClass,
        iconSize: tier.iconSize,
        wrapperGap: tier.wrapperGap,
        containerGap: tier.containerGap,
        cardPadding: tier.cardPadding,
        wrapperPaddingX
    };
}

/**
 * 通用标题配置获取
 * @param cardCount - 卡片数量
 * @param config - 可选的布局配置，不传则使用默认配置
 */
export function getStandardTitleConfig(cardCount: number, config?: Partial<StandardLayoutConfig>): TitleLayoutConfig {
    const titleConfigs = config?.titleConfigs || DEFAULT_TITLE_CONFIGS;
    const maxWidth = config?.maxWidth;

    let baseConfig: TitleConfig;
    if (cardCount <= 3) baseConfig = titleConfigs['1-3'];
    else if (cardCount === 4) baseConfig = titleConfigs['4'];
    else if (cardCount <= 6) baseConfig = titleConfigs['5-6'];
    else if (cardCount <= 8) baseConfig = titleConfigs['7-8'];
    else baseConfig = titleConfigs['9+'];

    return {
        ...baseConfig,
        maxWidth
    };
}


// ============================================================================
// Terminal CLI 主题布局计算
// ============================================================================

/**
 * 计算 Terminal CLI 主题的布局配置
 */
export function calculateTerminalCliLayout(cardCount: number): CardLayoutConfig {
    if (cardCount <= 3) {
        return {
            cardWidthClass: cardCount === 1 ? 'w-2/3' : (cardCount === 2 ? 'card-width-2col' : 'card-width-3col'),
            titleSizeClass: 'text-4xl',
            descSizeClass: 'text-xl',
            iconSize: '40px',
            wrapperGap: '48px',
            containerGap: '16px',
            cardPadding: '24px',
        };
    } else if (cardCount <= 6) {
        return {
            cardWidthClass: cardCount === 4 ? 'card-width-2col' : 'card-width-3col',
            titleSizeClass: 'text-3xl',
            descSizeClass: 'text-lg',
            iconSize: '36px',
            wrapperGap: '40px',
            containerGap: '14px',
            cardPadding: '20px',
        };
    } else {
        return {
            cardWidthClass: 'card-width-4col',
            titleSizeClass: 'text-2xl',
            descSizeClass: 'text-base',
            iconSize: '32px',
            wrapperGap: '36px',
            containerGap: '12px',
            cardPadding: '16px',
        };
    }
}

// ============================================================================
// News Card 主题布局计算
// ============================================================================

/**
 * News Card 主题颜色
 */
export const NEWS_CARD_THEMES = [
    { txt: 'text-sky-400', hex: '#38bdf8' },
    { txt: 'text-pink-400', hex: '#f472b6' },
    { txt: 'text-lime-500', hex: '#84cc16' },
    { txt: 'text-violet-400', hex: '#a78bfa' },
    { txt: 'text-amber-400', hex: '#fbbf24' },
];

/**
 * 计算 News Card 主题的布局配置
 */
export function calculateNewsCardLayout(cardCount: number): CardLayoutConfig {
    if (cardCount <= 3) {
        return {
            cardWidthClass: cardCount === 1 ? 'w-3/4' : (cardCount === 2 ? 'card-width-2col-wide' : 'card-width-3col'),
            titleSizeClass: 'text-6xl',
            descSizeClass: 'text-5xl',
            iconSize: '3.75rem', // text-6xl
            wrapperGap: '60px',
            containerGap: '32px',
            cardPadding: '24px',
            // 为2张卡片增加显式容器内边距
            wrapperPaddingX: cardCount === 2 ? '140px' : undefined,
        };
    } else if (cardCount <= 6) {
        return {
            cardWidthClass: cardCount === 4 ? 'card-width-2col-wide' : 'card-width-3col',
            titleSizeClass: 'text-5xl',
            descSizeClass: 'text-4xl',
            iconSize: '3rem', // text-5xl
            wrapperGap: '52px',
            containerGap: '28px',
            cardPadding: '20px',
            // 为4张卡片增加显式容器内边距
            wrapperPaddingX: cardCount === 4 ? '140px' : undefined,
        };
    } else {
        return {
            cardWidthClass: 'card-width-4col',
            titleSizeClass: 'text-4xl',
            descSizeClass: 'text-3xl',
            iconSize: '2.25rem', // text-4xl
            wrapperGap: '44px',
            containerGap: '24px',
            cardPadding: '16px',
        };
    }
}

// ============================================================================
// 通用辅助函数
// ============================================================================

/**
 * 获取卡片颜色（循环分配）
 */
export function getCardThemeColor<T>(themes: T[], index: number): T {
    return themes[index % themes.length];
}

/**
 * 生成字体加载完成后执行回调的脚本
 * 用于减少 SSR 和客户端渲染之间的布局漂移
 * @param callbackName - 字体加载后要调用的函数名字符串
 * @private
 */
function generateFontWaitScript(callbackName: string): string {
    return `
  try {
    var hasFonts = document.fonts && document.fonts.ready;
    if (hasFonts) {
      Promise.race([
        document.fonts.ready,
        new Promise(function(resolve) { return setTimeout(resolve, 1500); }),
      ]).then(function() {
        requestAnimationFrame(function() {
          ${callbackName}();
          setTimeout(${callbackName}, 50);
        });
      });
    } else {
      setTimeout(${callbackName}, 50);
    }
  } catch (_) {}
  `;
}

/**
 * 生成用于 SSR 场景的底部留白脚本
 * 该脚本会在浏览器加载时为主容器追加 padding-bottom，并将留白高度写入 dataset
 */
export function generateBottomReserveScript(reservePx: number = BOTTOM_RESERVED_PX): string {
    return `
(function() {
  var reserve = ${reservePx};
  function apply() {
    try { document.documentElement.dataset.p2vBottomReserved = String(reserve); } catch (e) {}

    var target = document.querySelector('.main-container');
    if (!target) {
      var all = document.querySelectorAll('*');
      for (var i = 0; i < all.length; i++) {
        var el = all[i];
        if (!(el instanceof HTMLElement)) continue;
        var cn = el.className;
        if (typeof cn !== 'string') continue;
        if (
          cn.indexOf('container') !== -1 &&
          cn.indexOf('flex') !== -1 &&
          cn.indexOf('flex-col') !== -1 &&
          cn.indexOf('items-center') !== -1 &&
          cn.indexOf('justify-center') !== -1 &&
          cn.indexOf('w-full') !== -1 &&
          cn.indexOf('h-full') !== -1
        ) {
          target = el;
          break;
        }
      }
    }

    if (!target) return;
    var prevReserve = 0;
    if (target.dataset && target.dataset.bottomReserved) {
      prevReserve = parseFloat(target.dataset.bottomReserved) || 0;
    }

    var basePb = NaN;
    if (target.dataset && target.dataset.p2vBasePaddingBottom) {
      basePb = parseFloat(target.dataset.p2vBasePaddingBottom);
    }
    if (!isFinite(basePb)) {
      var currentPb = 0;
      try { currentPb = parseFloat(getComputedStyle(target).paddingBottom) || 0; } catch (e) {}
      basePb = currentPb - prevReserve;
      if (!isFinite(basePb) || basePb < 0) basePb = currentPb;
    }

    target.style.paddingBottom = (basePb + reserve) + 'px';
    target.style.boxSizing = 'border-box';
    if (target.dataset) {
      target.dataset.p2vBasePaddingBottom = String(basePb);
      target.dataset.bottomReserved = String(reserve);
    }

    try {
      if (typeof window.CustomEvent === 'function') {
        window.dispatchEvent(new window.CustomEvent('p2v:layout-change'));
      } else {
        window.dispatchEvent(new Event('p2v:layout-change'));
      }
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply, { once: true });
  } else {
    apply();
  }
  window.addEventListener('load', apply, { once: true });
})();
`;
}

/**
 * 生成用于 SSR 场景的标题自适应 JavaScript
 * 该脚本会在浏览器加载时检测标题是否溢出并调整字号
 */
export function generateTitleFitScript(config: TitleLayoutConfig): string {
    const maxWidth = config.maxWidth || 1700;
    return `
(function() {
  function fitTitle() {
    var title =
      document.querySelector('.js-title-text') ||
      document.querySelector('.main-title') ||
      document.querySelector('.content-wrapper h1') ||
      document.querySelector('h1');
    if (!title) return;
    var size = ${config.initialFontSize};
    title.style.fontSize = size + 'px';
    var guard = 0;
    while (title.scrollWidth > ${maxWidth} && size > ${config.minFontSize} && guard < 100) {
      size -= 1;
      title.style.fontSize = size + 'px';
      guard++;
    }
  }

  fitTitle();

  // Re-run after fonts load to reduce layout drift between SSR and client rendering.
${generateFontWaitScript('fitTitle')}
})();
`;
}

/**
 * 生成通用的多元素文本自适应脚本
 * @param selector - 选择器
 * @param minFontSize - 最小字号
 */
export function generateFitTextScript(selector: string, minFontSize: number = 12): string {
    return `
(function() {
  function fitText() {
    var els = document.querySelectorAll('${selector}');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (!el) continue;
      
      // 重置为 CSS 定义的初始字号
      el.style.fontSize = '';
      
      var style = window.getComputedStyle(el);
      var fontSize = parseFloat(style.fontSize);
      if (!fontSize) continue;
      
      var guard = 0;
      // 循环减小字号直到不溢出
      while (el.scrollWidth > el.clientWidth && fontSize > ${minFontSize} && guard < 50) {
          fontSize--;
          el.style.fontSize = fontSize + 'px';
          guard++;
      }
    }
  }

  fitText();

${generateFontWaitScript('fitText')}
})();
`;
}

/**
 * 生成用于 SSR 场景的内容适配 JavaScript
 * 该脚本会在浏览器加载时检测内容是否溢出并进行缩放
 */
export function generateViewportFitScript(): string {
    return `
(function() {
  var rafId = 0;
  function fitViewport() {
    var wrapper = document.querySelector('.content-wrapper') || document.querySelector('.main-container');
    if (!wrapper) return;
    var reserve = 0;
    try { reserve = parseFloat(document.documentElement.dataset.p2vBottomReserved || '0') || 0; } catch (e) {}
    var maxH = Math.max(0, 1040 - reserve);
    var contentH = wrapper.scrollHeight;
    if (contentH > maxH) {
      var scaleVal = Math.max(0.6, maxH / contentH);
      wrapper.style.transform = 'scale(' + scaleVal + ')';
      return;
    }
    wrapper.style.transform = '';
  }

  function scheduleFit() {
    if (typeof requestAnimationFrame !== 'function') {
      fitViewport();
      return;
    }
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(function() {
      rafId = 0;
      fitViewport();
    });
  }

  fitViewport();
  window.addEventListener('resize', scheduleFit);
  window.addEventListener('p2v:layout-change', scheduleFit);

${generateFontWaitScript('scheduleFit')}
})();
`;
}
