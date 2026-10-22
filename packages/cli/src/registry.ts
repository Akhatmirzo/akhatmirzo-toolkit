import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { Context } from './context';
import { CliError } from './errors';

export type Localized = string | { uz?: string; en?: string };

export interface RegistryFile {
  path: string;
  content: string;
}

export interface RegistryIndexItem {
  name: string;
  title: string;
  description: string;
  category: string | undefined;
  dependencies: string[];
}

export interface RegistryItem extends RegistryIndexItem {
  files: RegistryFile[];
}

const MAX_FILES = 50;
const MAX_FILE_BYTES = 1024 * 1024;
const MAX_RESPONSE_BYTES = 10 * 1024 * 1024;
const BLOCK_NAME = /^[a-z0-9][a-z0-9-]{0,63}$/;
/** Fayl yo'li segmenti: harf/raqam bilan boshlanadi, faqat `[A-Za-z0-9_.-]`. `.`/`..`/`.env` o'tmaydi. */
const SEGMENT = /^[A-Za-z0-9_][A-Za-z0-9_.-]*$/;
/** Windows qurilma nomlari (`CON`, `nul.tsx`, `COM1.ts` ...) — fayl sifatida yozib bo'lmaydi. */
const WIN_RESERVED = /^(?:con|prn|aux|nul|com[0-9]|lpt[0-9])(?:\..*)?$/i;
/** Terminalni boshqaruvchi belgilar (ANSI escape va h.k.) — registry matnidan olib tashlanadi. */
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u001f\u007f-\u009f]/g;

export function isValidBlockName(name: string): boolean {
  return BLOCK_NAME.test(name);
}

export function localize(value: unknown): string {
  let text = '';
  if (typeof value === 'string') text = value;
  else if (value && typeof value === 'object') {
    const v = value as { uz?: unknown; en?: unknown };
    if (typeof v.uz === 'string') text = v.uz;
    else if (typeof v.en === 'string') text = v.en;
  }
  return text.replace(CONTROL_CHARS, ' ').slice(0, 500);
}

/**
 * `--registry` qiymatini URL'ga aylantiradi: http(s) va file: — o'zgarishsiz,
 * qolgani lokal papka yo'li deb olinadi (oflayn ishlash uchun).
 */
export function normalizeRegistry(input: string, cwd: string): string {
  const trimmed = input.trim().replace(/\/+$/, '');
  if (/^https?:\/\//i.test(trimmed) || /^file:/i.test(trimmed)) return trimmed;
  return pathToFileURL(path.resolve(cwd, trimmed)).href;
}

export class NotFoundError extends CliError {}

export async function fetchJson(ctx: Context, url: string): Promise<unknown> {
  let text: string;
  if (url.startsWith('file:')) {
    try {
      text = await readFile(fileURLToPath(url), 'utf8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new NotFoundError(`Topilmadi: ${url}`);
      }
      throw new CliError(`O'qib bo'lmadi: ${url}`);
    }
  } else {
    let response: Awaited<ReturnType<Context['fetch']>>;
    try {
      response = await ctx.fetch(url, {
        headers: { accept: 'application/json' },
        signal: AbortSignal.timeout(30_000),
      });
    } catch (error) {
      const err = error as Error & { cause?: { code?: string; message?: string } };
      const reason =
        err.name === 'TimeoutError'
          ? 'vaqt tugadi — 30 soniya'
          : (err.cause?.code ?? err.cause?.message ?? err.message);
      throw new CliError(
        `Registry'ga ulanib bo'lmadi: ${url} (${reason})`,
        'Internetni tekshiring yoki `--registry <url|papka>` bilan boshqa manzil bering',
      );
    }
    if (response.status === 404) throw new NotFoundError(`Topilmadi: ${url}`);
    if (!response.ok) throw new CliError(`Registry javobi ${response.status}: ${url}`);
    text = await response.text();
  }
  if (text.length > MAX_RESPONSE_BYTES) {
    throw new CliError(`Registry javobi juda katta: ${url}`);
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new CliError(`Registry noto'g'ri JSON qaytardi: ${url}`);
  }
}

function asRecord(value: unknown, where: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new CliError(`Registry formati noto'g'ri (${where}): obyekt kutilgan`);
  }
  return value as Record<string, unknown>;
}

function parseBase(raw: Record<string, unknown>, where: string): RegistryIndexItem {
  const { name, title, description, category, dependencies = [] } = raw;
  if (typeof name !== 'string' || !isValidBlockName(name)) {
    throw new CliError(`Registry formati noto'g'ri (${where}): name`);
  }
  if (!Array.isArray(dependencies) || dependencies.some((d) => typeof d !== 'string')) {
    throw new CliError(`Registry formati noto'g'ri (${where}): dependencies`);
  }
  return {
    name,
    title: localize(title) || name,
    description: localize(description),
    category: typeof category === 'string' ? localize(category) : undefined,
    dependencies: dependencies as string[],
  };
}

export function parseIndex(data: unknown): RegistryIndexItem[] {
  const root = asRecord(data, 'index.json');
  if (!Array.isArray(root.items)) {
    throw new CliError("Registry formati noto'g'ri (index.json): items massivi yo'q");
  }
  return root.items.map((item, i) => parseBase(asRecord(item, `items[${i}]`), `items[${i}]`));
}

export function parseItem(data: unknown, expectedName: string): RegistryItem {
  const where = `${expectedName}.json`;
  const raw = asRecord(data, where);
  const base = parseBase(raw, where);
  if (base.name !== expectedName) {
    throw new CliError(`Registry formati noto'g'ri (${where}): nom mos emas (${base.name})`);
  }
  const files = raw.files;
  if (!Array.isArray(files) || files.length === 0 || files.length > MAX_FILES) {
    throw new CliError(`Registry formati noto'g'ri (${where}): files`);
  }
  return {
    ...base,
    files: files.map((file, i) => {
      const f = asRecord(file, `${where} files[${i}]`);
      if (typeof f.path !== 'string' || typeof f.content !== 'string') {
        throw new CliError(`Registry formati noto'g'ri (${where} files[${i}]): path/content`);
      }
      if (Buffer.byteLength(f.content, 'utf8') > MAX_FILE_BYTES) {
        throw new CliError(`Registry fayli juda katta (${where} files[${i}])`);
      }
      return { path: f.path, content: f.content };
    }),
  };
}

/**
 * Registry'dan kelgan nisbiy yo'lni `baseDir` ichidagi absolyut yo'lga aylantiradi.
 * Rad etiladi: absolyut yo'l (`/x`, `C:\x`, `\\server`), `..`/`.` segmentlari, nuqta bilan
 * boshlangan nomlar, ruxsat etilmagan belgilar va natijasi `baseDir` dan tashqariga chiqadigan
 * har qanday yo'l.
 */
export function resolveInside(baseDir: string, relPath: string): string {
  const reject = (): never => {
    throw new CliError(`Xavfli fayl yo'li rad etildi: ${JSON.stringify(relPath)}`);
  };
  if (!relPath || relPath.length > 255 || relPath.includes('\0')) reject();
  if (
    path.posix.isAbsolute(relPath) ||
    path.win32.isAbsolute(relPath) ||
    /^[A-Za-z]:/.test(relPath)
  ) {
    reject();
  }
  const segments = relPath.split(/[\\/]/);
  if (segments.some((s) => !SEGMENT.test(s) || WIN_RESERVED.test(s))) reject();

  const base = path.resolve(baseDir);
  const resolved = path.resolve(base, ...segments);
  const rel = path.relative(base, resolved);
  if (rel === '' || rel.startsWith('..') || path.isAbsolute(rel)) reject();
  return resolved;
}
