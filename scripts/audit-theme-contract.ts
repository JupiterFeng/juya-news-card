import fs from 'fs';
import path from 'path';

interface ThemeCheckResult {
  file: string;
  templateId: string;
  issues: string[];
  warnings: string[];
}

const REQUIRED_WIDTH_CLASSES = ['.card-width-2col', '.card-width-3col', '.card-width-4col'];

const TEMPLATES_DIR = path.join(process.cwd(), 'src', 'templates');

function extractTemplateId(fileContent: string, fallbackName: string): string {
  const exportMatch = fileContent.match(
    /export const\s+\w+\s*:\s*TemplateConfig\s*=\s*{[\s\S]*?\bid:\s*['"]([^'"]+)['"]/
  );
  if (exportMatch) return exportMatch[1];

  const fallbackMatch = fileContent.match(/TemplateConfig\s*=\s*{[\s\S]*?\bid:\s*['"]([^'"]+)['"]/);
  if (fallbackMatch) return fallbackMatch[1];

  return fallbackName.replace(/\.tsx$/, '');
}

function hasAll(content: string, fragments: string[]): boolean {
  return fragments.every((fragment) => content.includes(fragment));
}

const STRICT_LOCAL_CONTRACT = process.argv.includes('--strict-local');
const GLOBAL_FALLBACK_FILES = [
  path.join(process.cwd(), 'src', 'utils', 'template.ts'),
  path.join(process.cwd(), 'src', 'theme', 'md3-theme.ts'),
];
const HAS_GLOBAL_WIDTH_FALLBACK = GLOBAL_FALLBACK_FILES.every((filePath) => {
  if (!fs.existsSync(filePath)) return false;
  return hasAll(fs.readFileSync(filePath, 'utf-8'), REQUIRED_WIDTH_CLASSES);
});

function hasHighRiskDomRewrite(content: string): boolean {
  const inLayoutEffect = /useLayoutEffect\s*\(/.test(content);
  const hasQueryAll = /querySelectorAll\s*\(/.test(content);
  const hasCardLoop = /cards?\s*\.forEach\s*\(/.test(content);
  const hasCardMutation = /card\.className\s*=|card\.style\.|card\.classList\./.test(content);
  return inLayoutEffect && hasQueryAll && hasCardLoop && hasCardMutation;
}

function hasInlineFontSizeConflict(content: string): boolean {
  const titleConflict =
    /className=\{`[^`]*js-title[^`]*layout\.titleSizeClass[^`]*`\}[^>]*style=\{\{[^}]*fontSize\s*:/s.test(content) ||
    /style=\{\{[^}]*fontSize\s*:[^}]*\}\}[^>]*className=\{`[^`]*js-title[^`]*layout\.titleSizeClass[^`]*`\}/s.test(content);

  const descConflict =
    /className=\{`[^`]*js-desc[^`]*layout\.descSizeClass[^`]*`\}[^>]*style=\{\{[^}]*fontSize\s*:/s.test(content) ||
    /style=\{\{[^}]*fontSize\s*:[^}]*\}\}[^>]*className=\{`[^`]*js-desc[^`]*layout\.descSizeClass[^`]*`\}/s.test(content);

  return titleConflict || descConflict;
}

function hasBaseHorizontalGutter(content: string): boolean {
  const wrapperWithPxClass =
    /className="[^"]*content-wrapper[^"]*\spx-[^\s"]+/.test(content) ||
    /className=\{`[^`]*content-wrapper[^`]*\spx-[^`\s]+/.test(content);

  const wrapperWithNonUndefinedPaddingFallback =
    /paddingLeft:\s*layout\.wrapperPaddingX\s*\|\|\s*(?!undefined)[^,\n}]+/.test(content) ||
    /paddingRight:\s*layout\.wrapperPaddingX\s*\|\|\s*(?!undefined)[^,\n}]+/.test(content);

  const wrapperWithStaticPadding =
    /paddingLeft:\s*['"`]\d+px['"`]/.test(content) ||
    /paddingRight:\s*['"`]\d+px['"`]/.test(content);

  return wrapperWithPxClass || wrapperWithNonUndefinedPaddingFallback || wrapperWithStaticPadding;
}

function hasWrapperPaddingXPassthrough(content: string): boolean {
  const hasLeft = /paddingLeft:\s*layout\.wrapperPaddingX/.test(content);
  const hasRight = /paddingRight:\s*layout\.wrapperPaddingX/.test(content);
  return hasLeft && hasRight;
}

function hasAnyVarBasedCardWidthFormula(content: string): boolean {
  return (
    /\.card-width-2col\s*\{[^}]*--container-gap[^}]*\}/s.test(content) ||
    /\.card-width-3col\s*\{[^}]*--container-gap[^}]*\}/s.test(content) ||
    /\.card-width-4col\s*\{[^}]*--container-gap[^}]*\}/s.test(content)
  );
}

function hasGapCoupledCardWidthFormulas(content: string): boolean {
  return (
    /\.card-width-2col\s*\{[^}]*var\(--container-gap[^}]*\}/s.test(content) &&
    /\.card-width-3col\s*\{[^}]*var\(--container-gap[^}]*\}/s.test(content) &&
    /\.card-width-4col\s*\{[^}]*var\(--container-gap[^}]*\}/s.test(content)
  );
}

function hasContainerGapVarBinding(content: string): boolean {
  return /['"]--container-gap['"]\s*:\s*layout\.containerGap/.test(content);
}

function auditThemeFile(filePath: string): ThemeCheckResult {
  const fileName = path.basename(filePath);
  const content = fs.readFileSync(filePath, 'utf-8');
  const templateId = extractTemplateId(content, fileName);

  const result: ThemeCheckResult = {
    file: `src/templates/${fileName}`,
    templateId,
    issues: [],
    warnings: [],
  };

  const usesLayoutWidthClass = /layout\.cardWidthClass/.test(content);
  const usesStandardLayout = /calculateStandardLayout\s*\(/.test(content);

  if (usesLayoutWidthClass && !hasAll(content, REQUIRED_WIDTH_CLASSES)) {
    if (STRICT_LOCAL_CONTRACT || !HAS_GLOBAL_WIDTH_FALLBACK) {
      result.issues.push('uses layout.cardWidthClass but missing one or more .card-width-* CSS definitions');
    } else {
      result.warnings.push('missing local .card-width-* definitions (covered by global fallback)');
    }
  }

  if (hasHighRiskDomRewrite(content)) {
    result.warnings.push('contains high-risk DOM rewrite pattern in useLayoutEffect');
  }

  if (/layout\.(titleSizeClass|descSizeClass)/.test(content) && hasInlineFontSizeConflict(content)) {
    result.warnings.push('mixes layout size classes with inline fontSize on title/desc');
  }

  if (usesLayoutWidthClass && !hasBaseHorizontalGutter(content)) {
    result.warnings.push('content-wrapper lacks base horizontal gutter; 3/5/6/7/8 cards may stick to viewport edges');
  }

  if (usesStandardLayout && usesLayoutWidthClass && !hasWrapperPaddingXPassthrough(content)) {
    result.warnings.push('missing layout.wrapperPaddingX passthrough on content-wrapper; 2/4-card spacing strategy may not work');
  }

  if (usesLayoutWidthClass && hasAll(content, REQUIRED_WIDTH_CLASSES) && !hasGapCoupledCardWidthFormulas(content)) {
    result.warnings.push('card-width formulas are not fully gap-coupled; all .card-width-* should be based on var(--container-gap)');
  }

  if (usesLayoutWidthClass && hasAnyVarBasedCardWidthFormula(content) && !hasContainerGapVarBinding(content)) {
    result.warnings.push('card-width formulas use --container-gap but container does not bind --container-gap: layout.containerGap');
  }

  return result;
}

function run(): void {
  const files = fs
    .readdirSync(TEMPLATES_DIR)
    .filter((file) => file.endsWith('.tsx') && file !== 'index.ts' && file !== 'types.ts')
    .sort((a, b) => a.localeCompare(b));

  const results = files.map((file) => auditThemeFile(path.join(TEMPLATES_DIR, file)));
  const issueFiles = results.filter((result) => result.issues.length > 0);
  const warningFiles = results.filter((result) => result.warnings.length > 0);

  console.log(`Scanned ${results.length} templates.`);
  console.log(`Mode: ${STRICT_LOCAL_CONTRACT ? 'strict-local' : 'global-fallback-aware'}`);
  console.log(`Issue files: ${issueFiles.length}`);
  console.log(`Warning files: ${warningFiles.length}`);

  if (issueFiles.length > 0) {
    console.log('\n[Issues]');
    for (const result of issueFiles) {
      for (const issue of result.issues) {
        console.log(`- ${result.templateId} (${result.file}): ${issue}`);
      }
    }
  }

  if (warningFiles.length > 0) {
    console.log('\n[Warnings]');
    for (const result of warningFiles) {
      for (const warning of result.warnings) {
        console.log(`- ${result.templateId} (${result.file}): ${warning}`);
      }
    }
  }

  if (issueFiles.length === 0 && warningFiles.length === 0) {
    console.log('\nNo contract problems found.');
  }

  if (issueFiles.length > 0) {
    process.exitCode = 1;
  }
}

run();
