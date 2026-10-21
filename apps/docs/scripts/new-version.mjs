/* global console, process */
/**
 * Yangi hujjat versiyasini yaratadi: eski versiya papkasini nusxalaydi va meta'larni yangilaydi.
 *
 *   pnpm --filter docs docs:version v0.1 v0.2
 *
 * Nima qiladi:
 * 1. content/docs/<eski> → content/docs/<yangi> (barcha tillar bilan);
 * 2. <yangi>/meta*.json: title = <yangi>, tavsif = "Eng so'nggi versiya" / "Latest version";
 * 3. <eski>/meta*.json: tavsif = "Eski versiya" / "Older version";
 * 4. content/docs/meta.json: <yangi> ro'yxat boshiga (sidebar tanlagichida birinchi);
 * 5. lib/versions.json: latest = <yangi>, versions ga qo'shiladi.
 * 6. <yangi> sahifalaridagi `/docs/<eski>/` mutlaq havolalari `/docs/<yangi>/` ga almashtiriladi.
 * 7. Demolar muzlatiladi: components/demos/** → components/demos/archive/<eski>/**, <eski>
 *    sahifalaridagi `<ComponentPreview name="x/y">` → `name="archive/<eski>/x/y"`. Shunda keyingi
 *    versiyada demo o'zgarsa yoki o'chirilsa ham, eski versiya o'z demolari va kodini ko'rsatadi.
 */
import { cp, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = path.join(root, 'content', 'docs');
const versionsFile = path.join(root, 'lib', 'versions.json');

const [from, to] = process.argv.slice(2);
const pattern = /^v\d+\.\d+$/;

function fail(message) {
  console.error(`Xato: ${message}`);
  console.error('Foydalanish: pnpm --filter docs docs:version <eski> <yangi>  (masalan v0.1 v0.2)');
  process.exit(1);
}

async function exists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

/** JSON.stringify + Prettier uslubi: 100 belgiga sig'adigan satrlar massivi bir qatorda */
function formatJson(data) {
  return JSON.stringify(data, null, 2).replace(
    /^( *)("[^"]+": )\[\n((?: *"(?:[^"\\]|\\.)*",?\n)+) *\]/gm,
    (match, indent, key, body) => {
      const items = body
        .split('\n')
        .map((line) => line.trim().replace(/,$/, ''))
        .filter(Boolean);
      const line = `${indent}${key}[${items.join(', ')}]`;
      return line.length + 1 <= 100 ? line : match;
    },
  );
}

async function writeJson(file, data) {
  await writeFile(file, formatJson(data) + '\n');
}

if (!from || !to) fail('ikkita versiya kerak');
if (!pattern.test(from) || !pattern.test(to))
  fail('versiya formati: v<major>.<minor>, masalan v0.2');
if (from === to) fail('versiyalar bir xil');

const fromDir = path.join(contentDir, from);
const toDir = path.join(contentDir, to);
const demosDir = path.join(root, 'components', 'demos');
const archiveRoot = path.join(demosDir, 'archive');
const archiveDir = path.join(archiveRoot, from);
if (!(await exists(fromDir))) fail(`${path.relative(root, fromDir)} topilmadi`);
if (await exists(toDir)) fail(`${path.relative(root, toDir)} allaqachon mavjud`);
if (await exists(archiveDir)) fail(`${path.relative(root, archiveDir)} allaqachon mavjud`);

// 1. Nusxalash
await cp(fromDir, toDir, { recursive: true });

// 2-3. Versiya meta'lari (meta.json — uz, meta.en.json — en)
const descriptions = {
  'meta.json': { latest: "Eng so'nggi versiya", old: 'Eski versiya' },
  'meta.en.json': { latest: 'Latest version', old: 'Older version' },
};
for (const [file, text] of Object.entries(descriptions)) {
  const newMeta = path.join(toDir, file);
  if (await exists(newMeta)) {
    const data = await readJson(newMeta);
    await writeJson(newMeta, { ...data, title: to, description: text.latest });
  }
  const oldMeta = path.join(fromDir, file);
  if (await exists(oldMeta)) {
    const data = await readJson(oldMeta);
    await writeJson(oldMeta, { ...data, description: text.old });
  }
}

// 4. Ildiz meta: yangi versiya birinchi
const rootMetaFile = path.join(contentDir, 'meta.json');
const rootMeta = (await exists(rootMetaFile)) ? await readJson(rootMetaFile) : { pages: [] };
rootMeta.pages = [to, ...(rootMeta.pages ?? []).filter((p) => p !== to)];
await writeJson(rootMetaFile, rootMeta);

// 5. lib/versions.json
const versions = await readJson(versionsFile);
versions.latest = to;
versions.versions = [to, ...versions.versions.filter((v) => v !== to)];
await writeJson(versionsFile, versions);

// 6. Mutlaq havolalar
async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (entry.name.endsWith('.mdx')) out.push(full);
  }
  return out;
}
let changed = 0;
for (const file of await walk(toDir)) {
  const source = await readFile(file, 'utf8');
  const next = source.replaceAll(`/docs/${from}/`, `/docs/${to}/`);
  if (next !== source) {
    await writeFile(file, next);
    changed++;
  }
}

// 7. Eski versiya demolarini muzlatish (registry.generated.ts va archive/ dan tashqari hammasi)
// (cp papkani o'zining ichiga nusxalay olmaydi — shuning uchun yuqori darajadagi har bir element alohida)
for (const entry of await readdir(demosDir, { withFileTypes: true })) {
  if (entry.name === 'archive' || entry.name === 'registry.generated.ts') continue;
  await cp(path.join(demosDir, entry.name), path.join(archiveDir, entry.name), {
    recursive: true,
  });
}

const previewName = /(<ComponentPreview\b[^>]*?\bname=)(["'])(?!archive\/)([^"']+)\2/g;
let archivedPages = 0;
for (const file of await walk(fromDir)) {
  const source = await readFile(file, 'utf8');
  const next = source.replace(previewName, (_, start, quote, name) => {
    return `${start}${quote}archive/${from}/${name}${quote}`;
  });
  if (next !== source) {
    await writeFile(file, next);
    archivedPages++;
  }
}

console.log(`Tayyor: ${from} → ${to}`);
console.log(`- content/docs/${to}/ yaratildi (${changed} ta faylda havola yangilandi)`);
console.log(
  `- components/demos/archive/${from}/ — ${from} demolari muzlatildi (${archivedPages} ta sahifa)`,
);
console.log(`- lib/versions.json: latest = ${to}`);
console.log(
  'Endi yangi versiyada o\'zgargan sahifalarni tahrirlang va "versions" sahifasini yangilang.',
);
