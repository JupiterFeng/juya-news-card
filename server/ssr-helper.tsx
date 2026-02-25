/**
 * SSR 辅助工具（简化版）
 *
 * 统一复用 `utils/template.ts` 的 React SSR 导出逻辑，
 * 避免维护两套几乎相同的 HTML 拼装代码。
 */

import type { GeneratedContent } from '../src/types';
import { DEFAULT_TEMPLATE } from '../src/templates/catalog';
import { generateTemplateHtml } from '../src/templates/ssr-runtime';

/**
 * 从 React 组件生成完整 HTML 文档
 */
export const generateHtmlFromReactComponent = (
  data: GeneratedContent,
  templateId: string = DEFAULT_TEMPLATE
): string => {
  return generateTemplateHtml(data, templateId);
};
