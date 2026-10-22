import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { CliError } from './errors';
import { localize, normalizeRegistry, parseIndex, parseItem, resolveInside } from './registry';

const base = path.resolve('/project/components/blocks');

describe('resolveInside', () => {
  it("oddiy nisbiy yo'llar", () => {
    expect(resolveInside(base, 'login.tsx')).toBe(path.join(base, 'login.tsx'));
    expect(resolveInside(base, 'login/form.tsx')).toBe(path.join(base, 'login', 'form.tsx'));
  });

  it.each([
    '../evil.tsx',
    'a/../../evil.tsx',
    'a/../b.tsx',
    '..\\evil.tsx',
    '/etc/passwd',
    '\\\\server\\share\\x.tsx',
    'C:\\Windows\\x.tsx',
    'C:x.tsx',
    './x.tsx',
    '.env',
    'a//b.tsx',
    '',
    'a\0b.tsx',
    'a b.tsx',
    '..',
    'CON',
    'nul.tsx',
    'a/com1.ts',
  ])('rad etiladi: %j', (rel) => {
    expect(() => resolveInside(base, rel)).toThrow(CliError);
  });
});

describe('parseItem', () => {
  const valid = {
    name: 'login',
    title: { uz: 'Kirish', en: 'Login' },
    description: { uz: 'Kirish formasi', en: 'Login form' },
    dependencies: ['react-hook-form'],
    category: 'auth',
    files: [{ path: 'login.tsx', content: 'export {}' }],
  };

  it("to'g'ri obyekt; lokalizatsiya uz → en", () => {
    const item = parseItem(valid, 'login');
    expect(item).toMatchObject({
      name: 'login',
      title: 'Kirish',
      description: 'Kirish formasi',
      category: 'auth',
    });
    expect(localize({ en: 'Only en' })).toBe('Only en');
    // terminal boshqaruv belgilari (ANSI escape) olib tashlanadi
    expect(localize('a\u001b[2Jb\nc')).toBe('a [2Jb c');
  });

  it("noto'g'ri shakllar rad etiladi", () => {
    expect(() => parseItem(null, 'login')).toThrow(CliError);
    expect(() => parseItem({ ...valid, name: 'other' }, 'login')).toThrow(/mos emas/);
    expect(() => parseItem({ ...valid, files: [] }, 'login')).toThrow(/files/);
    expect(() => parseItem({ ...valid, files: [{ path: 1, content: '' }] }, 'login')).toThrow(
      CliError,
    );
    expect(() => parseItem({ ...valid, dependencies: [1] }, 'login')).toThrow(/dependencies/);
    expect(() => parseItem({ ...valid, name: '../x' }, '../x')).toThrow(/name/);
  });

  it('parseIndex items massivini talab qiladi', () => {
    expect(() => parseIndex([])).toThrow(CliError);
    expect(parseIndex({ items: [{ name: 'a', title: 'A' }] })[0]).toMatchObject({
      name: 'a',
      dependencies: [],
    });
  });
});

describe('normalizeRegistry', () => {
  it('url va lokal papka', () => {
    expect(normalizeRegistry('https://x.uz/r/', '/')).toBe('https://x.uz/r');
    expect(normalizeRegistry('file:///tmp/r', '/')).toBe('file:///tmp/r');
    expect(normalizeRegistry('./r', process.cwd())).toMatch(/^file:\/\//);
  });
});
