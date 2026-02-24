import fs from 'fs';
import path from 'path';

interface VisualRiskResult {
  file: string;
  templateId: string;
  findings: string[];
}

const TEMPLATES_DIR = path.join(process.cwd(), 'src', 'templates');

const TEXT_SIZE_PX: Record<string, number> = {
  'text-xs': 12,
  'text-sm': 14,
  'text-base': 16,
  'text-lg': 18,
  'text-xl': 20,
  'text-2xl': 24,
  'text-2-5xl': 29,
  'text-3xl': 30,
  'text-3-5xl': 33,
  'text-4xl': 36,
  'text-4-5xl': 42,
  'text-5xl': 48,
  'text-5-5xl': 54,
  'text-6xl': 60,
  'text-7xl': 72,
  'text-8xl': 96,
  'text-9xl': 128,
};

function extractTemplateId(fileContent: string, fallbackName: string): string {
  const exportMatch = fileContent.match(
    /export const\s+\w+\s*:\s*TemplateConfig\s*=\s*{[\s\S]*?\bid:\s*['"]([^'"]+)['"]/
  );
  if (exportMatch) return exportMatch[1];

  const fallbackMatch = fileContent.match(/TemplateConfig\s*=\s*{[\s\S]*?\bid:\s*['"]([^'"]+)['"]/);
  if (fallbackMatch) return fallbackMatch[1];

  return fallbackName.replace(/\.tsx$/, '');
}

function getCardZoneStyleBlock(content: string): string {
  const withCast = content.match(
    /data-card-zone\s*=\s*["']true["'][\s\S]*?style=\{\{([\s\S]*?)\}\s*as React\.CSSProperties\}/
  );
  if (withCast?.[1]) return withCast[1];

  const withoutCast = content.match(
    /data-card-zone\s*=\s*["']true["'][\s\S]*?style=\{\{([\s\S]*?)\}\}/
  );
  return withoutCast?.[1] ?? '';
}

function hasEdgeInsetStrategy(content: string, zoneStyle: string): boolean {
  if (/cardZoneInsetX/.test(content)) return true;
  if (/paddingLeft\s*:/.test(zoneStyle) && /paddingRight\s*:/.test(zoneStyle)) return true;
  if (/paddingLeft:\s*layout\.wrapperPaddingX\s*\?\s*`max\(/.test(content)) return true;
  if (/paddingRight:\s*layout\.wrapperPaddingX\s*\?\s*`max\(/.test(content)) return true;
  return false;
}

function hasLowDensityMaxWidthStrategy(content: string, zoneStyle: string): boolean {
  if (/cardZoneMaxWidth/.test(content)) return true;
  if (/maxWidth\s*:/.test(zoneStyle)) return true;
  if (
    /maxWidth:\s*(N|cardCount|count|data\.cards\.length)\s*===\s*2/.test(content) ||
    /maxWidth:\s*(N|cardCount|count|data\.cards\.length)\s*===\s*3/.test(content)
  ) {
    return true;
  }
  return false;
}

function collectTypographyPairs(content: string): Array<{ title: string; desc: string }> {
  const pairs: Array<{ title: string; desc: string }> = [];
  const patterns = [
    /title\s*:\s*'([^']+)'\s*,\s*desc\s*:\s*'([^']+)'/g,
    /titleClass\s*:\s*'([^']+)'\s*,\s*descClass\s*:\s*'([^']+)'/g,
    /title\s*:\s*"([^"]+)"\s*,\s*desc\s*:\s*"([^"]+)"/g,
    /titleClass\s*:\s*"([^"]+)"\s*,\s*descClass\s*:\s*"([^"]+)"/g,
  ];

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(content)) !== null) {
      pairs.push({ title: match[1].trim(), desc: match[2].trim() });
    }
  }

  return pairs;
}

function hasTypographyImbalanceRisk(content: string): boolean {
  const pairs = collectTypographyPairs(content);
  if (pairs.length === 0) return false;

  for (const pair of pairs) {
    const titlePx = TEXT_SIZE_PX[pair.title];
    const descPx = TEXT_SIZE_PX[pair.desc];
    if (!titlePx || !descPx) continue;
    const ratio = titlePx / descPx;
    if (ratio > 1.8 || ratio < 1.05) {
      return true;
    }
  }

  return false;
}

function auditThemeFile(filePath: string): VisualRiskResult {
  const fileName = path.basename(filePath);
  const content = fs.readFileSync(filePath, 'utf-8');
  const templateId = extractTemplateId(content, fileName);
  const findings: string[] = [];

  const usesStandardLayout = /calculateStandardLayout\s*\(/.test(content);
  const usesLayoutWidthClass = /layout\.cardWidthClass/.test(content);
  const hasCardZone = /data-card-zone\s*=\s*["']true["']/.test(content);

  if (usesStandardLayout && usesLayoutWidthClass && hasCardZone) {
    const zoneStyle = getCardZoneStyleBlock(content);

    if (!hasEdgeInsetStrategy(content, zoneStyle)) {
      findings.push('missing edge-inset strategy (3/5/6/7/8 cards may stick to viewport edges)');
    }

    if (!hasLowDensityMaxWidthStrategy(content, zoneStyle)) {
      findings.push('missing low-density max-width strategy (2/3 cards may stretch too wide)');
    }
  }

  if (hasTypographyImbalanceRisk(content)) {
    findings.push('custom title/desc typography ratio may be imbalanced');
  }

  return {
    file: `src/templates/${fileName}`,
    templateId,
    findings,
  };
}

function run(): void {
  const files = fs
    .readdirSync(TEMPLATES_DIR)
    .filter((file) => file.endsWith('.tsx') && file !== 'index.ts' && file !== 'types.ts')
    .sort((a, b) => a.localeCompare(b));

  const results = files.map((file) => auditThemeFile(path.join(TEMPLATES_DIR, file)));
  const risky = results.filter((result) => result.findings.length > 0);

  console.log(`Scanned ${results.length} templates.`);
  console.log(`Mode: visual-consistency`);
  console.log(`Risk files: ${risky.length}`);

  if (risky.length > 0) {
    console.log('\n[Visual Risks]');
    for (const result of risky) {
      for (const finding of result.findings) {
        console.log(`- ${result.templateId} (${result.file}): ${finding}`);
      }
    }
  } else {
    console.log('\nNo visual consistency risks found.');
  }
}

run();
