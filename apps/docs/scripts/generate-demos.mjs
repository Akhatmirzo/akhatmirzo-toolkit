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
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
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

/* ---------- Bloklar ---------- */
/**
 * blocks/<name>/<name>.tsx + blocks/<name>/block.json → components/blocks/registry.generated.ts
 * ({ login: { component, source, file, meta } }). `<BlockPreview name="login" />` shu yerdan oladi.
 *
 * Qoidalar (buzilsa — xato bilan to'xtaydi):
 * - har blok — bitta fayl, birinchi qatori 'use client';, `export default` komponent;
 * - import faqat ruxsat etilgan paketlardan (docs ichki fayllari `@/...` — taqiqlangan);
 * - block.json: { name, title: {uz,en}, description: {uz,en}, dependencies: string[], category };
 * - `dependencies` — importlardan kelib chiqadigan qo'shimcha paketlar bilan aynan mos
 *   (`@akhatmirzo/ui` va `react` dan tashqari; `ui/charts` → `recharts`, `ui/form` →
 *   `react-hook-form`, `core/zod` → `zod`).
 */
const blocksDir = path.join(root, 'blocks');
const blocksOutDir = path.join(root, 'components', 'blocks');
const blocksOutFile = path.join(blocksOutDir, 'registry.generated.ts');

/** Import → kerakli npm paketlari (`null` — ruxsat etilmagan) */
const ALLOWED_IMPORTS = {
  react: [],
  'lucide-react': ['lucide-react'],
  '@akhatmirzo/ui': [],
  '@akhatmirzo/ui/charts': ['recharts'],
  '@akhatmirzo/ui/form': ['react-hook-form'],
  '@akhatmirzo/core': ['@akhatmirzo/core'],
  '@akhatmirzo/core/zod': ['@akhatmirzo/core', 'zod'],
  '@akhatmirzo/hooks': ['@akhatmirzo/hooks'],
  'react-hook-form': ['react-hook-form'],
  '@hookform/resolvers/zod': ['@hookform/resolvers'],
  zod: ['zod'],
};

const isLocalized = (v) =>
  v && typeof v === 'object' && typeof v.uz === 'string' && typeof v.en === 'string';

let blockNames = [];
try {
  blockNames = (await readdir(blocksDir, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
} catch {
  // bloklar papkasi hali yo'q
}

const blockErrors = [];
const blockItems = [];

for (const [i, name] of blockNames.entries()) {
  const rel = `${name}/${name}.tsx`;
  let source;
  let meta;
  try {
    source = (await readFile(path.join(blocksDir, rel), 'utf8')).replace(/\r\n/g, '\n');
  } catch {
    blockErrors.push(`blocks/${rel}: fayl topilmadi`);
    continue;
  }
  try {
    meta = JSON.parse(await readFile(path.join(blocksDir, name, 'block.json'), 'utf8'));
  } catch (error) {
    blockErrors.push(`blocks/${name}/block.json: o'qib bo'lmadi (${error.message})`);
    continue;
  }

  if (!/^\s*['"]use client['"];?/.test(source)) {
    blockErrors.push(`blocks/${rel}: birinchi qator 'use client'; bo'lishi kerak`);
  }
  if (!/export\s+default\s+/.test(source)) {
    blockErrors.push(`blocks/${rel}: export default komponent topilmadi`);
  }

  const needed = new Set();
  for (const match of source.matchAll(/^\s*import\s[^'"]*?['"]([^'"]+)['"]/gm)) {
    const spec = match[1];
    const deps = ALLOWED_IMPORTS[spec];
    if (!deps) blockErrors.push(`blocks/${rel}: ruxsat etilmagan import "${spec}"`);
    else deps.forEach((d) => needed.add(d));
  }

  if (meta.name !== name)
    blockErrors.push(`blocks/${name}/block.json: name "${name}" bo'lishi kerak`);
  if (!isLocalized(meta.title)) blockErrors.push(`blocks/${name}/block.json: title {uz,en} kerak`);
  if (!isLocalized(meta.description)) {
    blockErrors.push(`blocks/${name}/block.json: description {uz,en} kerak`);
  }
  if (typeof meta.category !== 'string') {
    blockErrors.push(`blocks/${name}/block.json: category (matn) kerak`);
  }
  if (!Array.isArray(meta.dependencies)) {
    blockErrors.push(`blocks/${name}/block.json: dependencies (massiv) kerak`);
  } else {
    const declared = [...meta.dependencies].sort().join(', ');
    const expected = [...needed].sort().join(', ');
    if (declared !== expected) {
      blockErrors.push(
        `blocks/${name}/block.json: dependencies [${declared}] — importlarga ko'ra [${expected}] bo'lishi kerak`,
      );
    }
  }

  blockItems.push({
    id: `Block${i}`,
    name,
    rel,
    source: source.trimEnd() + '\n',
    meta: {
      title: meta.title,
      description: meta.description,
      dependencies: meta.dependencies,
      category: meta.category,
    },
  });
}

if (blockErrors.length > 0) {
  console.error('Blok registry xatolari:\n- ' + blockErrors.join('\n- '));
  process.exit(1);
}

const blockLines = [
  "// AVTOMATIK YARATILGAN FAYL — qo'lda tahrirlamang.",
  '// Manba: scripts/generate-demos.mjs (pnpm --filter docs demos), bloklar — blocks/<name>/',
  "import type { ComponentType } from 'react';",
  ...blockItems.map((item) => `import ${item.id} from '../../blocks/${item.name}/${item.name}';`),
  '',
  'export interface BlockMeta {',
  '  title: { uz: string; en: string };',
  '  description: { uz: string; en: string };',
  '  /** `@akhatmirzo/ui` + `@akhatmirzo/tokens` dan tashqari kerakli paketlar */',
  '  dependencies: string[];',
  '  category: string;',
  '}',
  '',
  'export interface BlockEntry {',
  '  component: ComponentType;',
  '  /** Blok faylining haqiqiy manba kodi */',
  '  source: string;',
  "  /** blocks/ ga nisbatan yo'l */",
  '  file: string;',
  '  meta: BlockMeta;',
  '}',
  '',
  'export const blocks: Record<string, BlockEntry> = {',
  ...blockItems.map(
    (item) =>
      `  ${JSON.stringify(item.name)}: { component: ${item.id}, file: ${JSON.stringify(item.rel)}, meta: ${JSON.stringify(item.meta)}, source: ${JSON.stringify(item.source)} },`,
  ),
  '};',
  '',
];

const nextBlocks = blockLines.join('\n');
let prevBlocks = '';
try {
  prevBlocks = await readFile(blocksOutFile, 'utf8');
} catch {
  // birinchi marta
}
if (prevBlocks !== nextBlocks) {
  await mkdir(blocksOutDir, { recursive: true });
  await writeFile(blocksOutFile, nextBlocks);
  console.log(`Blok registry yangilandi: ${blockItems.length} ta blok`);
} else {
  console.log(`Blok registry o'zgarmadi: ${blockItems.length} ta blok`);
}
