/**
 * 文本排版工具函数
 * 用于自动在中英文之间添加空格，优化排版阅读体验
 */

/**
 * 自动在中英文之间添加空格
 * @param text 待处理的文本
 * @returns 处理后的文本
 */
export function autoAddSpace(text: string): string {
    if (!text) return text;
    
    // 匹配中文：范围包括基本汉字、扩展A区等，以及常见的中文标点符号不需要加空格，但这里主要关注汉字
    // 简单起见，使用 \p{Script=Han} 需要 ES2018，为了兼容性使用常见的 unicode 范围
    // \u4e00-\u9fa5 是最常用的汉字范围
    
    // 1. 中文在前，英文/数字在后
    // eg: "你好Hello" -> "你好 Hello"
    let result = text.replace(/([\u4e00-\u9fa5])([a-zA-Z0-9])/g, '$1 $2');
    
    // 2. 英文/数字在前，中文在后
    // eg: "Hello你好" -> "Hello 你好"
    result = result.replace(/([a-zA-Z0-9])([\u4e00-\u9fa5])/g, '$1 $2');
    
    return result;
}

/**
 * 处理包含 HTML 标签的文本，只在标签外的文本内容中添加空格
 * 避免破坏 HTML 标签属性或结构
 * @param html 待处理的 HTML 字符串
 * @returns 处理后的 HTML
 */
export function autoAddSpaceToHtml(html: string): string {
    if (!html) return html;
    
    // 简单的 HTML 解析策略：
    // 匹配 <tag...> 或 非 < 内容
    // 只有在非标签内容部分应用空格规则
    return html.replace(/(<[^>]+>)|([^<]+)/g, (match, tag, text) => {
        if (tag) {
            return tag; // 如果是标签，直接返回
        }
        if (text) {
            return autoAddSpace(text); // 如果是文本内容，处理空格
        }
        return match;
    });
}
