import { describe, expect, it } from 'vitest';
import { capitalize, slugify, truncate, truncateMiddle } from './string';

describe('slugify', () => {
  it("o'zbekcha matn → slug", () => {
    expect(slugify("Farg'ona viloyati")).toBe('fargona-viloyati');
    expect(slugify('Gʻuzor tumani')).toBe('guzor-tumani');
    expect(slugify('Тошкент шаҳри')).toBe('toshkent-shahri');
    expect(slugify('Ер юзи')).toBe('yer-yuzi');
    expect(slugify('Ўзбекистон')).toBe('ozbekiston');
    expect(slugify('  Yangi   yil — 2026!  ')).toBe('yangi-yil-2026');
  });

  it("diakritikalar olib tashlanadi; bo'sh kiritish", () => {
    expect(slugify('Café Ürgut')).toBe('cafe-urgut');
    expect(slugify('')).toBe('');
    expect(slugify(null)).toBe('');
    expect(slugify('!!!')).toBe('');
  });
});

describe('truncate', () => {
  it('qisqa matnga tegmaydi', () => {
    expect(truncate('Salom', 5)).toBe('Salom');
    expect(truncate('', 3)).toBe('');
  });

  it('max dan oshmaydi va oxiridagi bo‘shliqni olib tashlaydi', () => {
    expect(truncate('Salom dunyo', 7)).toBe('Salom…');
    expect(truncate('Salom dunyo', 8)).toBe('Salom d…');
    expect(truncate('Salom dunyo', 8, '...')).toBe('Salom...');
  });

  it('chekka holatlar', () => {
    expect(truncate('Salom', 0)).toBe('');
    expect(truncate('Salom', 1)).toBe('…');
    expect(truncate('Salom', 2, '...')).toBe('..');
    expect(truncate('😀😀😀😀', 3)).toBe('😀😀…');
  });
});

describe('truncateMiddle', () => {
  it('fayl kengaytmasini saqlaydi', () => {
    expect(truncateMiddle('hisobot-oktabr-2026.pdf', 22)).toBe('hisobot-oktab…2026.pdf');
    const r = truncateMiddle('juda-uzun-fayl-nomi-bilan-hujjat.docx', 20);
    expect([...r]).toHaveLength(20);
    expect(r.endsWith('.docx')).toBe(true);
    expect(r).toContain('…');
  });

  it("kengaytmasiz — o'rtadan", () => {
    expect(truncateMiddle('abcdefghij', 7)).toBe('abc…hij');
    expect(truncateMiddle('abcdefghij', 6)).toBe('abc…ij');
  });

  it('chekka holatlar', () => {
    expect(truncateMiddle('qisqa.txt', 20)).toBe('qisqa.txt');
    expect(truncateMiddle('', 5)).toBe('');
    expect(truncateMiddle('abcdef', 1)).toBe('…');
    // kengaytma sig'masa — oddiy o'rtadan qisqartirish
    expect(truncateMiddle('fayl.markdown', 6)).toBe('fay…wn');
    // nuqta boshida (.env) — kengaytma emas
    expect(truncateMiddle('.environment', 7)).toBe('.en…ent');
  });
});

describe('capitalize', () => {
  it('birinchi harfni katta qiladi', () => {
    expect(capitalize("o'zbekiston")).toBe("O'zbekiston");
    expect(capitalize('шаҳар')).toBe('Шаҳар');
    expect(capitalize('sALOM')).toBe('SALOM');
    expect(capitalize('')).toBe('');
    expect(capitalize('1-son')).toBe('1-son');
  });
});
