import fs from 'fs';
import path from 'path';

interface RuntimeRiskResult {
  file: string;
  templateId: string;
  findings: string[];
}

const TEMPLATES_DIR = path.join(process.cwd(), 'src', 'templates');
const FAIL_ON_FINDINGS = process.argv.includes('--fail-on-findings');
const CRITICAL_ONLY = process.argv.includes('--critical-only');

function extractTemplateId(fileContent: string, fallbackName: string): string {
  const exportMatch = fileContent.match(
    /export const\s+\w+\s*:\s*TemplateConfig\s*=\s*{[\s\S]*?\bid:\s*['"]([^'"]+)['"]/
  );
  if (exportMatch) return exportMatch[1];

  const fallbackMatch = fileContent.match(/TemplateConfig\s*=\s*{[\s\S]*?\bid:\s*['"]([^'"]+)['"]/);
  if (fallbackMatch) return fallbackMatch[1];

  return fallbackName.replace(/\.tsx$/, '');
}

function hasRuntimeCardDomRewrite(content: string): boolean {
  const inLayoutEffect = /useLayoutEffect\s*\(/.test(content);
  const readsChildren = /Array\.from\(\s*cardContainerRef\.current\.children\s*\)/.test(content);
  const loopsCards = /cards?\s*\.forEach\s*\(/.test(content);
  const resetsCardClass = /card\.className\s*=/.test(content);
  const addsLayoutWidthClass = /card\.classList\.add\(\s*layout\.cardWidthClass\s*\)/.test(content);
  const editsInnerNodes =
    /card\.querySelector\('\.js-title'\)/.test(content) &&
    /card\.querySelector\('\.js-icon'\)/.test(content) &&
    /card\.querySelector\('\.js-desc'\)/.test(content);

  return inLayoutEffect && readsChildren && loopsCards && resetsCardClass && addsLayoutWidthClass && editsInnerNodes;
}

function hasEffectOnlyContainerGap(content: string): boolean {
  const assignsGapInEffect = /container\.style\.gap\s*=\s*layout\.containerGap/.test(content);
  const bindsGapInJsx = /style=\{\{[\s\S]*?\bgap:\s*layout\.containerGap[\s\S]*?\}\}/.test(content);
  return assignsGapInEffect && !bindsGapInJsx;
}

function hasHardcodedLocalCardWidthFormula(content: string): boolean {
  const usesLayoutWidthClass = /layout\.cardWidthClass/.test(content);
  if (!usesLayoutWidthClass) return false;

  const hasLocalWidthClasses =
    /\.card-width-2col\s*\{[^}]*\}/s.test(content) ||
    /\.card-width-3col\s*\{[^}]*\}/s.test(content) ||
    /\.card-width-4col\s*\{[^}]*\}/s.test(content);
  if (!hasLocalWidthClasses) return false;

  const hasGapCoupledFormula =
    /\.card-width-2col\s*\{[^}]*--container-gap[^}]*\}/s.test(content) ||
    /\.card-width-3col\s*\{[^}]*--container-gap[^}]*\}/s.test(content) ||
    /\.card-width-4col\s*\{[^}]*--container-gap[^}]*\}/s.test(content);

  return !hasGapCoupledFormula;
}

function auditThemeFile(filePath: string): RuntimeRiskResult {
  const fileName = path.basename(filePath);
  const content = fs.readFileSync(filePath, 'utf-8');
  const templateId = extractTemplateId(content, fileName);

  const findings: string[] = [];

  if (hasRuntimeCardDomRewrite(content)) {
    findings.push('runtime card DOM rewrite in useLayoutEffect (SSR/首帧一致性高风险)');
  }

  if (hasEffectOnlyContainerGap(content)) {
    findings.push('containerGap only applied in effect, not bound in JSX style');
  }

  if (!CRITICAL_ONLY && hasHardcodedLocalCardWidthFormula(content)) {
    findings.push('local .card-width-* formulas are not gap-coupled to --container-gap');
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
  const risky = results.filter((r) => r.findings.length > 0);

  console.log(`Scanned ${results.length} templates.`);
  console.log(`Mode: runtime-layout-risk${CRITICAL_ONLY ? '-critical' : ''}`);
  console.log(`Risk files: ${risky.length}`);

  if (risky.length > 0) {
    console.log('\n[Runtime Risks]');
    for (const result of risky) {
      for (const finding of result.findings) {
        console.log(`- ${result.templateId} (${result.file}): ${finding}`);
      }
    }
  } else {
    console.log('\nNo runtime layout risks found.');
  }

  if (FAIL_ON_FINDINGS && risky.length > 0) {
    process.exitCode = 1;
  }
}

run();
