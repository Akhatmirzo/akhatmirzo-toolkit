/* global console, process */
/**
 * CLI registry'sini yaratadi: blocks/<name>/{<name>.tsx, block.json} →
 *   public/r/index.json  — { version, items: [{ name, title, description, category, dependencies }] }
 *   public/r/<name>.json — { name, title, description, category, dependencies, files: [{ path, content }] }
 *
 * `title`/`description` — { uz, en }. `npx @akhatmirzo/cli add <name>` shu fayllarni o'qiydi
 * (standart manzil: https://toolkit.akhatmirzo.uz/r).
 *
 * `dev`, `build` skriptlaridan oldin avtomatik ishga tushadi; natija gitignore qilingan.
 * Qo'lda: pnpm --filter docs registry
 * Boshqa papkalar bilan (test uchun): node scripts/generate-registry.mjs <blocksDir> <outDir>
 *
 * Qoidalar (buzilsa — xato bilan to'xtaydi):
 * - papka nomi = block.json `name`, faqat [a-z0-9-];
 * - `<name>.tsx` mavjud;
 * - title/description: { uz, en } satrlar; dependencies: paket nomlari massivi.
 */
import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const blocksDir = path.resolve(process.argv[2] ?? path.join(root, 'blocks'));
const outDir = path.resolve(process.argv[3] ?? path.join(root, 'public', 'r'));

const NAME = /^[a-z0-9][a-z0-9-]{0,63}$/;
const PACKAGE = /^(?:@[a-z0-9][a-z0-9._~-]*\/)?[a-z0-9][a-z0-9._~-]*(?:@[A-Za-z0-9.^~*+-]+)?$/;

const isLocalized = (v) =>
  v && typeof v === 'object' && typeof v.uz === 'string' && typeof v.en === 'string';

const names = existsSync(blocksDir)
  ? (await readdir(blocksDir, { withFileTypes: true }))
      .filter((e) => e.isDirectory() && !e.name.startsWith('_') && !e.name.startsWith('.'))
      .map((e) => e.name)
      .sort()
  : [];

const errors = [];
const items = [];

for (const name of names) {
  const dir = path.join(blocksDir, name);
  const metaFile = path.join(dir, 'block.json');
  const sourceFile = path.join(dir, `${name}.tsx`);

  if (!NAME.test(name)) {
    errors.push(`${name}: papka nomi faqat [a-z0-9-] bo'lishi kerak`);
    continue;
  }
  if (!existsSync(metaFile) || !existsSync(sourceFile)) {
    errors.push(`${name}: block.json va ${name}.tsx bo'lishi shart`);
    continue;
  }

  let meta;
  try {
    meta = JSON.parse(await readFile(metaFile, 'utf8'));
  } catch (error) {
    errors.push(`${name}/block.json: noto'g'ri JSON (${error.message})`);
    continue;
  }

  const { title, description, category, dependencies = [] } = meta;
  if (meta.name !== name)
    errors.push(`${name}/block.json: name "${meta.name}" papka nomiga mos emas`);
  if (!isLocalized(title)) errors.push(`${name}/block.json: title { uz, en } bo'lishi kerak`);
  if (!isLocalized(description))
    errors.push(`${name}/block.json: description { uz, en } bo'lishi kerak`);
  if (category !== undefined && typeof category !== 'string') {
    errors.push(`${name}/block.json: category satr bo'lishi kerak`);
  }
  if (
    !Array.isArray(dependencies) ||
    dependencies.some((d) => typeof d !== 'string' || !PACKAGE.test(d))
  ) {
    errors.push(`${name}/block.json: dependencies — paket nomlari massivi bo'lishi kerak`);
  }

  const content = (await readFile(sourceFile, 'utf8')).replace(/\r\n/g, '\n').trimEnd() + '\n';
  const entry = { name, title, description, category, dependencies };
  items.push({ entry, item: { ...entry, files: [{ path: `${name}.tsx`, content }] } });
}

if (errors.length > 0) {
  console.error('Bloklar registry xatolari:\n- ' + errors.join('\n- '));
  process.exit(1);
}

// Eski (o'chirilgan bloklar) fayllari qolmasin
await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

await writeFile(
  path.join(outDir, 'index.json'),
  JSON.stringify({ version: 1, items: items.map((i) => i.entry) }, null, 2) + '\n',
);
for (const { entry, item } of items) {
  await writeFile(path.join(outDir, `${entry.name}.json`), JSON.stringify(item, null, 2) + '\n');
}

console.log(
  `Registry: ${items.length} ta blok → ${path.relative(process.cwd(), outDir) || '.'}` +
    (existsSync(blocksDir) ? '' : ` (${path.relative(process.cwd(), blocksDir)} papkasi yo'q)`),
);
