/**
 * A类：产品级设计语言主题配置（中性命名版本）
 */

import type { ThemeConfig } from './types';

export const keynoteMinimalTheme: ThemeConfig = {
  id: 'keynoteMinimal',
  name: '极简发布会',
  bodyBg: '#f5f5f7',
  titleClass: 'keynote-title',
  googleFonts: '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet">',
  themeCss: `
    .main-container { font-family: 'Inter', system-ui, sans-serif; background-color: #f5f5f7; }
    .keynote-title { font-weight: 700; letter-spacing: -0.02em; background: linear-gradient(180deg, #1d1d1f 0%, #424245 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1.1; }
    .card-item { background: #ffffff; border-radius: 36px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04); border: 1px solid rgba(0, 0, 0, 0.02); }
  `,
  themeConfig: `const keynoteColors = ['#0071e3', '#862737', '#c93300', '#006621', '#52239a', '#1d1d1f']; const isKeynoteMinimal = true;`,
  extraHtml: '<div class="bg-glow"></div>',
  flagName: 'isKeynoteMinimal',
};

export const vibrantMaterialTheme: ThemeConfig = {
  id: 'vibrantMaterial',
  name: '灵动材质',
  bodyBg: '#f8f9fa',
  titleClass: 'vibrant-title',
  googleFonts: '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet">',
  themeCss: `
    .main-container { font-family: 'Inter', system-ui, sans-serif; background-color: #f8f9fa; }
    .vibrant-title { font-weight: 500; color: #1f1f1f; letter-spacing: -0.01em; line-height: 1.2; }
    .card-item { border-radius: 28px; border: none; }
  `,
  themeConfig: `const vibrantThemes = [{ bg: '#d3e3fd', onBg: '#041e49', icon: '#0b57d0' }, { bg: '#f9dada', onBg: '#3f0e0e', icon: '#b9382b' }, { bg: '#fef7e0', onBg: '#322900', icon: '#7d6400' }, { bg: '#c4eed0', onBg: '#072711', icon: '#146c2e' }]; const isVibrantMaterial = true;`,
  flagName: 'isVibrantMaterial',
};

export const fluentLayerTheme: ThemeConfig = {
  id: 'fluentLayer',
  name: '清透流体界面',
  bodyBg: '#f3f3f3',
  titleClass: 'fluent-title',
  themeCss: `
    .main-container { font-family: 'Inter', system-ui, sans-serif; background: linear-gradient(135deg, #f3f3f3 0%, #ffffff 100%); }
    .fluent-title { font-weight: 700; color: #242424; letter-spacing: -0.01em; line-height: 1.1; }
    .card-item { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-radius: 8px; border: 1px solid rgba(0, 0, 0, 0.06); box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04); }
  `,
  themeConfig: `const fluentAccents = ['#0078d4', '#107c10', '#d83b01', '#4b53bc', '#008272', '#c239b3']; const isFluentLayer = true;`,
  flagName: 'isFluentLayer',
};

export const productThemes: ThemeConfig[] = [
  keynoteMinimalTheme,
  vibrantMaterialTheme,
  fluentLayerTheme,
];
