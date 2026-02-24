/**
 * 主题配置类型定义
 * 用于统一所有主题的配置结构
 */

export interface ThemeColorsConfig {
  // 颜色配置（根据主题类型可能不同）
  [key: string]: string | number | boolean;
}

export interface ThemeStyleConfig {
  // 样式配置
  title?: {
    color?: string;
    fontWeight?: string | number;
    letterSpacing?: string;
    textShadow?: string;
    transform?: string;
    lineHeight?: string;
  };
  icon?: {
    color?: string;
    outline?: string;
    outlineOffset?: string;
    filter?: string;
  };
  desc?: {
    color?: string;
    lineHeight?: string;
    fontWeight?: string;
    maxWidth?: string;
    fontFamily?: string;
  };
  card?: {
    background?: string;
    border?: string;
    borderRadius?: string;
    boxShadow?: string;
    backdropFilter?: string;
    transform?: string;
  };
}

export interface ThemeConfig {
  // 基础配置
  id: string;
  name: string;
  bodyBg: string;
  titleClass?: string;

  // Google Fonts（可选）
  googleFonts?: string;

  // 主题 CSS
  themeCss: string;

  // JavaScript 配置（颜色数组等）
  themeConfig: string;

  // 额外 HTML（可选）
  extraHtml?: string;

  // 动态样式配置（用于 JS 生成）
  styleConfig?: ThemeStyleConfig;

  // 标志变量名称（如 'isMinimal', 'isModern' 等）
  flagName?: string;
}

// 主题分类
export type ThemeCategory =
  | 'product'      // A类：产品级设计语言
  | 'materials'    // B类：UI材质与界面审美
  | 'trends'       // C类：流行趋势类
  | 'futuristic'   // D类：科技未来类
  | 'nostalgic'    // E类：复古怀旧类
  | 'misc'         // F类：其他风格
  | 'visual'       // G类：视觉设计风格
  | 'os-history'   // H类：操作系统UI历史
  | 'art';         // O-T类：艺术风格
