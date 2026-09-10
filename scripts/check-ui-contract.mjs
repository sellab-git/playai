import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import postcss from 'postcss';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFile(resolve(root, path), 'utf8');
const inventory = JSON.parse(await read('docs/design/shadcn-components.json'));
const failures = [];
const names = new Set();
const packages = JSON.parse(await read('package.json'));
for (const item of inventory) {
  if (names.has(item.name)) failures.push(`Duplicate inventory entry: ${item.name}`);
  names.add(item.name);
  const baseline = await readFile(resolve(root, item.baseline));
  const hash = createHash('sha256').update(baseline).digest('hex');
  if (hash !== item.sha256) failures.push(`Imported baseline changed: ${item.baseline}`);
  if (!item.registry.startsWith('https://ui.shadcn.com/r/styles/base-vega/'))
    failures.push(`Unapproved registry: ${item.name}`);
  if (!item.adaptations?.length) failures.push(`Missing adaptation record: ${item.name}`);
  if (
    item.cli !== packages.devDependencies.shadcn ||
    item.base !== `@base-ui/react@${packages.dependencies['@base-ui/react']}`
  )
    failures.push(`Foundation version drift: ${item.name}`);
  await read(item.path);
}
for (const file of await readdir(resolve(root, 'src/components/ui'))) {
  if (file.endsWith('.tsx') && !names.has(file.slice(0, -4)))
    failures.push(`Primitive missing inventory: ${file}`);
}
async function walk(directory) {
  const result = [];
  for (const entry of await readdir(resolve(root, directory), { withFileTypes: true })) {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) result.push(...(await walk(path)));
    else result.push(path);
  }
  return result;
}
const files = await walk('src');
const messageKeys = new Set();
for (const path of files.filter(
  (path) => path === 'src/client/i18n.ts' || path.endsWith('/messages.ts'),
)) {
  const ast = ts.createSourceFile(path, await read(path), ts.ScriptTarget.Latest, true);
  function collect(node) {
    if (ts.isPropertyAssignment(node) && ts.isStringLiteral(node.name))
      messageKeys.add(node.name.text);
    ts.forEachChild(node, collect);
  }
  collect(ast);
}
for (const path of files.filter((path) => /\.[cm]?[jt]sx?$/.test(path))) {
  const source = await read(path);
  const ast = ts.createSourceFile(
    path,
    source,
    ts.ScriptTarget.Latest,
    true,
    path.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  function inspect(node) {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 't' &&
      node.arguments[0] &&
      ts.isStringLiteral(node.arguments[0]) &&
      !messageKeys.has(node.arguments[0].text)
    )
      failures.push(`Unknown literal translation key ${node.arguments[0].text}: ${path}`);
    if (
      (ts.isJsxAttribute(node) && node.name.getText(ast) === 'dangerouslySetInnerHTML') ||
      (ts.isPropertyAccessExpression(node) &&
        ['innerHTML', 'outerHTML', 'insertAdjacentHTML'].includes(node.name.text))
    )
      failures.push(`Imperative HTML rendering: ${path}`);
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const target = node.moduleSpecifier.text;
      if (/^(lucide-react|@radix-ui\/|@tabler\/icons)/.test(target))
        failures.push(`Unapproved icon or primitive foundation: ${path}`);
      if (!path.startsWith('src/components/ui/') && target.startsWith('@base-ui/'))
        failures.push(`Import the owned shadcn primitive: ${path}`);
    }
    if (
      (ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateHead(node)) &&
      /^\s*<(?:svg|div|main|button|form|section)\b/.test(node.text)
    )
      failures.push(`Legacy markup template: ${path}`);
    ts.forEachChild(node, inspect);
  }
  inspect(ast);
  if (/#[0-9a-f]{3,8}\b/i.test(source))
    failures.push(`Literal color outside tokens: ${path}`);
  if (/(?:shadow-(?:xs|sm|md|lg|xl)|(?:linear|radial)-gradient\()/.test(source))
    failures.push(`Unapproved shadow or gradient: ${path}`);
}
for (const path of files.filter((path) => path.endsWith('.css'))) {
  const ast = postcss.parse(await read(path), { from: path });
  ast.walkDecls((declaration) => {
    const { prop, value } = declaration;
    if (path !== 'src/tokens.css' && /#[0-9a-f]{3,8}\b|\b(?:rgb|hsl)a?\(/i.test(value))
      failures.push(`Color outside tokens: ${path}:${declaration.source.start.line}`);
    if (/gradient\(/i.test(value) || (prop === 'box-shadow' && value !== 'none'))
      failures.push(`Unapproved visual effect: ${path}:${declaration.source.start.line}`);
    if (
      (prop.includes('radius') || prop.startsWith('--r-')) &&
      [...value.matchAll(/([\d.]+)px/g)].some((match) => Number(match[1]) > 6)
    )
      failures.push(
        `Radius exceeds design contract: ${path}:${declaration.source.start.line}`,
      );
  });
}
const config = JSON.parse(await read('components.json'));
if (config.style !== 'base-vega' || !config.tsx || !config.rsc)
  failures.push('Unexpected shadcn foundation configuration');
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else
  console.log(
    `UI source contract passed: ${inventory.length} inventoried primitives; ${files.filter((path) => path.endsWith('.tsx')).length} React files. Baselines verified; no online currency or visual parity claim.`,
  );
