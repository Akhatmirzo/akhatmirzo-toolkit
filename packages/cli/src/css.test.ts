import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { TOKENS_IMPORT, findCssFile, patchCss, sourcePathFor } from './css';

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(path.join(tmpdir(), 'akh-css-'));
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

describe('sourcePathFor', () => {
  it.each([
    ['app/globals.css', '../node_modules/@akhatmirzo/ui/dist'],
    ['src/app/globals.css', '../../node_modules/@akhatmirzo/ui/dist'],
    ['src/styles/globals.css', '../../node_modules/@akhatmirzo/ui/dist'],
    ['index.css', './node_modules/@akhatmirzo/ui/dist'],
  ])('%s → %s', (rel, expected) => {
    expect(sourcePathFor(path.join(dir, rel), dir)).toBe(expected);
  });
});

describe('patchCss', () => {
  const src = '../node_modules/@akhatmirzo/ui/dist';

  it("tokenlarni tailwind importidan keyin, @source ni oxirgi importdan keyin qo'shadi", () => {
    const input =
      "@import 'tailwindcss';\n@import '@fontsource-variable/manrope';\n\nbody { margin: 0; }\n";
    const r = patchCss(input, src);
    expect(r).toMatchObject({
      changed: true,
      addedImport: true,
      addedSource: true,
      hasTailwindImport: true,
    });
    expect(r.content).toBe(
      "@import 'tailwindcss';\n" +
        `${TOKENS_IMPORT}\n` +
        "@import '@fontsource-variable/manrope';\n" +
        `@source '${src}';\n` +
        '\nbody { margin: 0; }\n',
    );
  });

  it("idempotent: ikkinchi marta hech narsa o'zgarmaydi", () => {
    const once = patchCss('@import "tailwindcss";\n', src).content;
    const twice = patchCss(once, src);
    expect(twice.changed).toBe(false);
    expect(twice.content).toBe(once);
  });

  it("qo'shtirnoq turi va mavjud qatorlarni taniydi", () => {
    const input =
      '@import "tailwindcss";\n@import "@akhatmirzo/tokens/theme.css";\n@source "../../node_modules/@akhatmirzo/ui/dist";\n';
    expect(patchCss(input, src).changed).toBe(false);
  });

  it("faqat yetishmayotgan qatorni qo'shadi", () => {
    const input = `@import 'tailwindcss';\n${TOKENS_IMPORT}\n`;
    const r = patchCss(input, src);
    expect(r).toMatchObject({ addedImport: false, addedSource: true });
  });

  it('CRLF saqlanadi', () => {
    const r = patchCss("@import 'tailwindcss';\r\nbody{}\r\n", src);
    expect(r.content).toBe(
      `@import 'tailwindcss';\r\n${TOKENS_IMPORT}\r\n@source '${src}';\r\nbody{}\r\n`,
    );
  });

  it("tailwind importi bo'lmasa — boshiga qo'shadi (@charset dan keyin) va xabar beradi", () => {
    const r = patchCss('@charset "utf-8";\nbody{}\n', src);
    expect(r.hasTailwindImport).toBe(false);
    expect(r.content.split('\n').slice(0, 3)).toEqual([
      '@charset "utf-8";',
      TOKENS_IMPORT,
      `@source '${src}';`,
    ]);
  });
});

describe('findCssFile', () => {
  it('topilmasa undefined', () => {
    expect(findCssFile(dir)).toBeUndefined();
  });

  it("tailwind import qilingan nomzodni afzal ko'radi", () => {
    mkdirSync(path.join(dir, 'app'));
    mkdirSync(path.join(dir, 'src'));
    writeFileSync(path.join(dir, 'app', 'globals.css'), 'body{}\n');
    writeFileSync(path.join(dir, 'src', 'index.css'), "@import 'tailwindcss';\n");
    expect(findCssFile(dir)).toBe(path.join(dir, 'src', 'index.css'));
  });

  it('aks holda birinchi mavjud nomzod', () => {
    mkdirSync(path.join(dir, 'styles'));
    writeFileSync(path.join(dir, 'styles', 'globals.css'), 'body{}\n');
    expect(findCssFile(dir)).toBe(path.join(dir, 'styles', 'globals.css'));
  });
});
