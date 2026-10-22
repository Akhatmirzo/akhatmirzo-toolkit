import { describe, expect, it } from 'vitest';
import { detectScript, fixApostrophes, toScript } from './index';

describe('detectScript', () => {
  it.each([
    ['Salom dunyo', 'latin'],
    ["O'zbekiston", 'latin'],
    ['Oʻzbekiston', 'latin'],
    ['Салом', 'cyrillic'],
    ['Ўзбекистон, Ғузор', 'cyrillic'],
    ['Salom Салом', 'mixed'],
    ['iPhone 15 — янги', 'mixed'],
    ['+998 90 123-45-67', 'none'],
    ['2026!? ʻʼ', 'none'],
    ['', 'none'],
    ['Γεια σου', 'none'],
    ['Γεια Salom', 'latin'],
  ] as const)('%s → %s', (input, expected) => {
    expect(detectScript(input)).toBe(expected);
  });

  it('null / undefined → none', () => {
    expect(detectScript(null)).toBe('none');
    expect(detectScript(undefined)).toBe('none');
  });
});

describe('toScript', () => {
  it('kirill → lotin', () => {
    expect(toScript('Салом, дунё', 'latin')).toBe('Salom, dunyo');
  });

  it('lotin natijada tipografik apostroflar', () => {
    expect(toScript('Ўзбекистон', 'latin')).toBe('Oʻzbekiston');
    expect(toScript('ҒУЗОР', 'latin')).toBe('GʻUZOR');
    expect(toScript('маъно, санъат', 'latin')).toBe('maʼno, sanʼat');
  });

  it("apostrophe: 'ascii'", () => {
    expect(toScript('Ўзбекистон маъноси', 'latin', { apostrophe: 'ascii' })).toBe(
      "O'zbekiston ma'nosi",
    );
  });

  it('lotin → kirill', () => {
    expect(toScript("Salom, O'zbekiston", 'cyrillic')).toBe('Салом, Ўзбекистон');
    expect(toScript('Gʻuzor', 'cyrillic')).toBe('Ғузор');
  });

  it("allaqachon to'g'ri yozuvda — o'zgarmaydi (apostroflar ham)", () => {
    expect(toScript("O'zbekiston", 'latin')).toBe("O'zbekiston");
    expect(toScript('Тошкент', 'cyrillic')).toBe('Тошкент');
    expect(toScript('123 — 456', 'latin')).toBe('123 — 456');
  });

  it("aralash matn: faqat boshqa yozuvdagi qism o'giriladi", () => {
    expect(toScript("Toshkent — Тошкент, O'zbekiston", 'latin')).toBe(
      "Toshkent — Toshkent, O'zbekiston",
    );
    expect(toScript('Toshkent — Тошкент', 'cyrillic')).toBe('Тошкент — Тошкент');
    expect(toScript('Ўзбекистон va Toshkent', 'latin')).toBe('Oʻzbekiston va Toshkent');
  });

  it('null → ""', () => {
    expect(toScript(null, 'latin')).toBe('');
    expect(toScript(undefined, 'cyrillic')).toBe('');
  });
});

describe('fixApostrophes', () => {
  it('spetsifikatsiya misoli', () => {
    expect(fixApostrophes("O'zbekiston g'alabasi, ma'no")).toBe('Oʻzbekiston gʻalabasi, maʼno');
  });

  it('o/g dan keyin barcha variantlar → ʻ', () => {
    for (const a of ["'", '‘', '’', '`', '´', 'ʼ', 'ʻ']) {
      expect(fixApostrophes(`O${a}zbekiston, g${a}isht`)).toBe('Oʻzbekiston, gʻisht');
    }
  });

  it("so'z boshidagi o' / g'", () => {
    expect(fixApostrophes("o'n, o'qish, g'oya, O'rta")).toBe('oʻn, oʻqish, gʻoya, Oʻrta');
  });

  it('tutuq belgisi → ʼ', () => {
    expect(fixApostrophes("ta'lim, san'at, mas'ul, Is'hoq")).toBe('taʼlim, sanʼat, masʼul, Isʼhoq');
    expect(fixApostrophes('maʻno')).toBe('maʼno');
  });

  it("so'z oxiridagi o'/g' (tog', bog')", () => {
    expect(fixApostrophes("tog' va bog'.")).toBe('togʻ va bogʻ.');
  });

  it("so'z oxiridagi tutuq (jam')", () => {
    expect(fixApostrophes("man' etildi")).toBe('manʼ etildi');
  });

  it('ketma-ket ikki apostrof: oʻ + tutuq', () => {
    expect(fixApostrophes("mo''tabar")).toBe('moʻʼtabar');
  });

  it("qo'shtirnoqlarga tegilmaydi", () => {
    expect(fixApostrophes("'Salom' dedi")).toBe("'Salom' dedi");
    expect(fixApostrophes("U 'Kino' dedi")).toBe("U 'Kino' dedi");
    expect(fixApostrophes("'O'zbekiston' kitobi")).toBe("'Oʻzbekiston' kitobi");
    expect(fixApostrophes('‘Salom’, dedi u')).toBe('‘Salom’, dedi u');
    expect(fixApostrophes("ko'p 'yangi' so'z")).toBe("koʻp 'yangi' soʻz");
  });

  it("so'z ichidagi qo'shimcha ajratuvchisi tutuq sifatida", () => {
    expect(fixApostrophes("O'zbekiston'dan")).toBe('Oʻzbekistonʼdan');
  });

  it('yolg‘iz yoki raqamdan keyingi apostrof o‘zgarmaydi', () => {
    expect(fixApostrophes("a ' b, 90'")).toBe("a ' b, 90'");
  });

  it('kirill matnga tegmaydi', () => {
    expect(fixApostrophes('Ўзбекистон')).toBe('Ўзбекистон');
  });

  it("style: 'ascii'", () => {
    expect(fixApostrophes('Oʻzbekiston', { style: 'ascii' })).toBe("O'zbekiston");
    expect(fixApostrophes('O‘zbekiston, maʼno, taʻlim', { style: 'ascii' })).toBe(
      "O'zbekiston, ma'no, ta'lim",
    );
    expect(fixApostrophes('‘Salom’ dedi', { style: 'ascii' })).toBe('‘Salom’ dedi');
  });

  it('idempotent', () => {
    const once = fixApostrophes("O'zbekiston g'alabasi, ma'no, 'Salom'");
    expect(fixApostrophes(once)).toBe(once);
  });

  it('null / undefined → ""', () => {
    expect(fixApostrophes(null)).toBe('');
    expect(fixApostrophes(undefined)).toBe('');
  });
});
