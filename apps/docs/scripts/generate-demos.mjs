/* global console, process */
/**
 * components/demos/** ichidagi demo fayllardan registry yaratadi:
 * components/demos/registry.generated.ts — { 'button/variants': { component, source } }.
 *
 * `dev`, `build` va `typecheck` skriptlaridan oldin avtomatik ishga tushadi.
 * Qo'lda: pnpm --filter docs demos
 *
 * Qoidalar (buzilsa — xato bilan to'xtaydi):
 * - fayl birinchi qatori: 'use client';
 * - `export default function ...` bo'lishi shart;
 * - `_` bilan boshlangan fayllar (yordamchi) registry'ga kirmaydi.
 * - `archive/<versiya>/` — eski versiyalar demolari (scripts/new-version.mjs), ular ham registry'da:
 *   `archive/v0.1/button/loading`.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const demosDir = path.join(root, 'components', 'demos');
const outFile = path.join(demosDir, 'registry.generated.ts');

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (entry.name.endsWith('.tsx') && !entry.name.startsWith('_') && full !== outFile) {
      files.push(full);
    }
  }
  return files;
}

const files = (await walk(demosDir)).sort();
const errors = [];
const items = [];

for (const [i, file] of files.entries()) {
  const rel = path.relative(demosDir, file).split(path.sep).join('/');
  const name = rel.replace(/\.tsx$/, '');
  const source = (await readFile(file, 'utf8')).replace(/\r\n/g, '\n');

  if (!/^\s*['"]use client['"];?/.test(source)) {
    errors.push(`${rel}: birinchi qator 'use client'; bo'lishi kerak`);
  }
  if (!/export\s+default\s+/.test(source)) {
    errors.push(`${rel}: export default komponent topilmadi`);
  }
  items.push({ id: `Demo${i}`, name, rel, source: source.trimEnd() + '\n' });
}

if (errors.length > 0) {
  console.error('Demo registry xatolari:\n- ' + errors.join('\n- '));
  process.exit(1);
}

const lines = [
  "// AVTOMATIK YARATILGAN FAYL — qo'lda tahrirlamang.",
  '// Manba: scripts/generate-demos.mjs (pnpm --filter docs demos)',
  "import type { ComponentType } from 'react';",
  ...items.map((item) => `import ${item.id} from './${item.name}';`),
  '',
  'export interface DemoEntry {',
  '  component: ComponentType;',
  '  /** Demo faylining haqiqiy manba kodi */',
  '  source: string;',
  "  /** components/demos ga nisbatan yo'l */",
  '  file: string;',
  '}',
  '',
  'export const demos: Record<string, DemoEntry> = {',
  ...items.map(
    (item) =>
      `  ${JSON.stringify(item.name)}: { component: ${item.id}, file: ${JSON.stringify(item.rel)}, source: ${JSON.stringify(item.source)} },`,
  ),
  '};',
  '',
];

const next = lines.join('\n');
let prev = '';
try {
  prev = await readFile(outFile, 'utf8');
} catch {
  // birinchi marta
}
if (prev !== next) {
  await writeFile(outFile, next);
  console.log(`Demo registry yangilandi: ${items.length} ta demo`);
} else {
  console.log(`Demo registry o'zgarmadi: ${items.length} ta demo`);
}
