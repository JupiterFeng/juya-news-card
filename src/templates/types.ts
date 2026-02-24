import { GeneratedContent } from '../types';
import type { ReactElement } from 'react';

/**
 * 模板配置接口
 */
export interface TemplateConfig {
  /** 模板唯一标识 */
  id: string;
  /** 模板显示名称 */
  name: string;
  /** 模板描述 */
  description?: string;
  /** 模板图标 */
  icon?: string;
  /** 是否支持下载为 HTML */
  downloadable?: boolean;

  /**
   * 是否已完成 SSR 改造（默认 false）
   * 设为 true 后，CLI 和下载会走 React SSR 路径
   */
  ssrReady?: boolean;

  /**
   * 是否自带完整 CSS（不需要 Tailwind CDN）
   * 设为 true 的主题在 SSR 输出中不会包含 Tailwind CDN
   */
  selfContainedCss?: boolean;

  /**
   * 渲染函数：将数据渲染为 JSX
   * @param data - AI 生成的内容数据
   * @param scale - 预览缩放比例
   */
  render: (data: GeneratedContent, scale: number) => ReactElement;

  /**
   * 生成下载 HTML 的函数（可选）
   * @param data - AI 生成的内容数据
   */
  generateHtml?: (data: GeneratedContent) => string;
}

/** 模板映射表类型 */
export type TemplateMap = Record<string, TemplateConfig>;
