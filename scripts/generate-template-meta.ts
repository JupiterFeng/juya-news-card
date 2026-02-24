/**
 * 模板元数据生成脚本
 *
 * 功能：扫描 src/templates 目录，获取所有模板文件的元数据（修改时间、文件大小等）
 * 输出：src/templates/meta.json
 *
 * 说明：
 * - meta.json 的 key 使用模板配置里的 `id`（而不是文件名），避免出现 `vector3d.tsx` vs `vector3D` 这类不一致导致前端查不到元数据。
 */

import fs from 'fs';
import path from 'path';

const TEMPLATES_DIR = path.join(process.cwd(), 'src', 'templates');
const OUTPUT_FILE = path.join(TEMPLATES_DIR, 'meta.json');

interface TemplateMeta {
  modifiedTime: number;
  filePath: string;
  fileSize: number;
  name: string;
  description?: string;
  icon?: string;
  downloadable: boolean;
  ssrReady: boolean;
}

interface MetaOutput {
  version: string;
  generatedAt: number;
  templates: Record<string, TemplateMeta>;
}

function extractTemplateId(fileContent: string): string | null {
  // 优先匹配 `export const xxxTemplate: TemplateConfig = { ... id: '...' }`
  const exportMatch = fileContent.match(
    /export const\s+\w+\s*:\s*TemplateConfig\s*=\s*{[\s\S]*?\bid:\s*['"]([^'"]+)['"]/
  );
  if (exportMatch) return exportMatch[1];

  // 兜底：匹配任意 `TemplateConfig = { ... id: '...' }`
  const fallbackMatch = fileContent.match(/TemplateConfig\s*=\s*{[\s\S]*?\bid:\s*['"]([^'"]+)['"]/);
  if (fallbackMatch) return fallbackMatch[1];

  return null;
}

function extractTemplateConfigTail(fileContent: string): string {
  const exportMatch = fileContent.match(/export const\s+\w+\s*:\s*TemplateConfig\s*=\s*{/);
  if (exportMatch && exportMatch.index !== undefined) {
    return fileContent.slice(exportMatch.index);
  }

  const fallbackMatch = fileContent.match(/TemplateConfig\s*=\s*{/);
  if (fallbackMatch && fallbackMatch.index !== undefined) {
    return fileContent.slice(fallbackMatch.index);
  }

  return fileContent;
}

function extractStringField(content: string, fieldName: string): string {
  const escaped = fieldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = content.match(new RegExp(`\\b${escaped}\\s*:\\s*['"]([^'"]+)['"]`));
  return match?.[1]?.trim() || '';
}

function extractBooleanField(content: string, fieldName: string, fallback: boolean): boolean {
  const escaped = fieldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = content.match(new RegExp(`\\b${escaped}\\s*:\\s*(true|false)\\b`));
  if (!match) return fallback;
  return match[1] === 'true';
}

function generateMeta(): void {
  // 读取目录中的所有文件
  const files = fs.readdirSync(TEMPLATES_DIR);

  // 过滤出模板文件（.tsx文件，排除 index.ts, types.ts 和其他非模板文件）
  const templateFiles = files
    .filter((file) => {
      return (
        file.endsWith('.tsx') &&
        file !== 'index.ts' &&
        file !== 'types.ts' &&
        !file.startsWith('_') &&
        !file.includes('.test.') &&
        !file.includes('.spec.')
      );
    })
    .sort((a, b) => a.localeCompare(b));

  const templateEntries: Array<[string, TemplateMeta]> = [];

  // 获取每个模板文件的元数据
  for (const file of templateFiles) {
    const filePath = path.join(TEMPLATES_DIR, file);
    const stats = fs.statSync(filePath);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const templateId = extractTemplateId(fileContent) ?? file.replace(/\.tsx$/, '');
    const configTail = extractTemplateConfigTail(fileContent);
    const name = extractStringField(configTail, 'name') || templateId;
    const description = extractStringField(configTail, 'description');
    const icon = extractStringField(configTail, 'icon');
    const downloadable = extractBooleanField(configTail, 'downloadable', true);
    const ssrReady = extractBooleanField(configTail, 'ssrReady', false);

    templateEntries.push([
      templateId,
      {
      modifiedTime: Math.floor(stats.mtimeMs / 1000), // 转换为秒级时间戳
        filePath: `src/templates/${file}`,
      fileSize: stats.size,
      name,
      ...(description ? { description } : {}),
      ...(icon ? { icon } : {}),
      downloadable,
      ssrReady,
      },
    ]);
  }

  // 按 templateId 排序，保证输出稳定
  templateEntries.sort(([idA], [idB]) => idA.localeCompare(idB));

  const templates: Record<string, TemplateMeta> = {};
  for (const [templateId, meta] of templateEntries) {
    if (templates[templateId]) {
      console.warn(`Duplicate template id detected: ${templateId} (from ${meta.filePath})`);
    }
    templates[templateId] = meta;
  }

  // 构建输出对象
  const output: MetaOutput = {
    version: '1.0.0',
    generatedAt: Math.floor(Date.now() / 1000),
    templates,
  };

  // 写入文件
  fs.writeFileSync(OUTPUT_FILE, `${JSON.stringify(output, null, 2)}\n`, 'utf-8');

  console.log(`Generated meta for ${templateFiles.length} templates`);
  console.log(`Output: ${OUTPUT_FILE}`);
}

// 执行生成
generateMeta();
