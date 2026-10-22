import { describe, expect, it } from 'vitest';
import { moneyToWords, numberToWords, ordinal, ordinalWords } from './words';

describe('numberToWords', () => {
  it.each([
    [0, 'nol'],
    [1, 'bir'],
    [10, 'oʻn'],
    [11, 'oʻn bir'],
    [19, 'oʻn toʻqqiz'],
    [20, 'yigirma'],
    [21, 'yigirma bir'],
    [99, 'toʻqson toʻqqiz'],
    [100, 'yuz'],
    [101, 'yuz bir'],
    [110, 'yuz oʻn'],
    [999, 'toʻqqiz yuz toʻqson toʻqqiz'],
    [1000, 'ming'],
    [1001, 'ming bir'],
    [10_000, 'oʻn ming'],
    [100_000, 'yuz ming'],
    [1_000_000, 'bir million'],
    [1_000_001, 'bir million bir'],
    [1_001_000, 'bir million bir ming'],
    [1_250_000, 'bir million ikki yuz ellik ming'],
    [2_300_000_000, 'ikki milliard uch yuz million'],
    [1e12, 'bir trillion'],
    [34_567, 'oʻttiz toʻrt ming besh yuz oltmish yetti'],
    [48_000, 'qirq sakkiz ming'],
    [70_080, 'yetmish ming sakson'],
  ])('%d → %s', (n, words) => {
    expect(numberToWords(n)).toBe(words);
  });

  it('chegaralar: ±999 999 999 999 999, undan katta → ""', () => {
    expect(numberToWords(999_999_999_999_999)).toBe(
      'toʻqqiz yuz toʻqson toʻqqiz trillion toʻqqiz yuz toʻqson toʻqqiz milliard ' +
        'toʻqqiz yuz toʻqson toʻqqiz million toʻqqiz yuz toʻqson toʻqqiz ming ' +
        'toʻqqiz yuz toʻqson toʻqqiz',
    );
    expect(numberToWords(1e15)).toBe('');
    expect(numberToWords(-1e15)).toBe('');
  });

  it('manfiy → "minus …"', () => {
    expect(numberToWords(-15)).toBe('minus oʻn besh');
    expect(numberToWords(-1000)).toBe('minus ming');
    expect(numberToWords(-0)).toBe('nol');
  });

  it('kasr qismi tashlanadi', () => {
    expect(numberToWords(3.99)).toBe('uch');
    expect(numberToWords(-2.5)).toBe('minus ikki');
    expect(numberToWords(0.7)).toBe('nol');
  });

  it('NaN / Infinity / son emas → ""', () => {
    expect(numberToWords(NaN)).toBe('');
    expect(numberToWords(Infinity)).toBe('');
    expect(numberToWords(-Infinity)).toBe('');
    expect(numberToWords('5' as unknown as number)).toBe('');
  });

  it('formal: "bir yuz", "bir ming"', () => {
    expect(numberToWords(100, { formal: true })).toBe('bir yuz');
    expect(numberToWords(1000, { formal: true })).toBe('bir ming');
    expect(numberToWords(1100, { formal: true })).toBe('bir ming bir yuz');
    expect(numberToWords(101_000, { formal: true })).toBe('bir yuz bir ming');
    expect(numberToWords(1_000_000, { formal: true })).toBe('bir million');
    expect(numberToWords(1100)).toBe('ming yuz');
  });

  it("apostrophe: 'ascii'", () => {
    expect(numberToWords(14, { apostrophe: 'ascii' })).toBe("o'n to'rt");
    expect(numberToWords(90, { apostrophe: 'ascii' })).toBe("to'qson");
  });

  it('kirill', () => {
    const cyr = (n: number) => numberToWords(n, { script: 'cyrillic' });
    expect(cyr(0)).toBe('нол');
    expect(cyr(4)).toBe('тўрт');
    expect(cyr(10)).toBe('ўн');
    expect(cyr(19)).toBe('ўн тўққиз');
    expect(cyr(37)).toBe('ўттиз етти');
    expect(cyr(55)).toBe('эллик беш');
    expect(cyr(68)).toBe('олтмиш саккиз');
    expect(cyr(1000)).toBe('минг');
    expect(cyr(1_250_000)).toBe('бир миллион икки юз эллик минг');
    expect(cyr(2_300_000_000)).toBe('икки миллиард уч юз миллион');
    expect(cyr(1e12)).toBe('бир триллион');
    expect(cyr(-40)).toBe('минус қирқ');
    // kirillga apostrophe ta'sir qilmaydi
    expect(numberToWords(4, { script: 'cyrillic', apostrophe: 'ascii' })).toBe('тўрт');
  });
});

describe('moneyToWords', () => {
  it('default: katta harf, soʻm, tiyin raqam bilan', () => {
    expect(moneyToWords(1_250_000.5)).toBe('Bir million ikki yuz ellik ming soʻm 50 tiyin');
    expect(moneyToWords(1_250_000)).toBe('Bir million ikki yuz ellik ming soʻm');
    expect(moneyToWords(0)).toBe('Nol soʻm');
    expect(moneyToWords(12.05)).toBe('Oʻn ikki soʻm 5 tiyin');
  });

  it('0 tiyin yozilmaydi; tiyin 2 raqamga yaxlitlanadi', () => {
    expect(moneyToWords(100.001)).toBe('Yuz soʻm');
    expect(moneyToWords(0.999)).toBe('Bir soʻm');
    // suzuvchi nuqta: 1.005 - 1 = 0.00499…, 2.675 * 100 = 267.49…
    expect(moneyToWords(1.005)).toBe('Bir soʻm 1 tiyin');
    expect(moneyToWords(2.675)).toBe('Ikki soʻm 68 tiyin');
  });

  it("tiyin: 'words' | false", () => {
    expect(moneyToWords(10.25, { tiyin: 'words' })).toBe('Oʻn soʻm yigirma besh tiyin');
    expect(moneyToWords(10.25, { tiyin: false })).toBe('Oʻn soʻm');
  });

  it('capitalize: false', () => {
    expect(moneyToWords(2500, { capitalize: false })).toBe('ikki ming besh yuz soʻm');
  });

  it('currency', () => {
    expect(moneyToWords(2500, { currency: 'UZS' })).toBe('Ikki ming besh yuz UZS');
    expect(moneyToWords(3, { currency: 'USD', tiyin: false })).toBe('Uch USD');
    expect(moneyToWords(5, { currency: 'soʻm' })).toBe('Besh soʻm');
    expect(moneyToWords(5, { apostrophe: 'ascii' })).toBe("Besh so'm");
  });

  it('formal', () => {
    expect(moneyToWords(100_000, { formal: true })).toBe('Bir yuz ming soʻm');
  });

  it('kirill', () => {
    expect(moneyToWords(1000, { script: 'cyrillic' })).toBe('Минг сўм');
    expect(moneyToWords(1_250_000.5, { script: 'cyrillic' })).toBe(
      'Бир миллион икки юз эллик минг сўм 50 тийин',
    );
    expect(moneyToWords(70.4, { script: 'cyrillic', tiyin: 'words' })).toBe('Етмиш сўм қирқ тийин');
  });

  it('manfiy va noto`g`ri', () => {
    expect(moneyToWords(-15.5)).toBe('Minus oʻn besh soʻm 50 tiyin');
    expect(moneyToWords(-0.5)).toBe('Minus nol soʻm 50 tiyin');
    expect(moneyToWords(NaN)).toBe('');
    expect(moneyToWords(Infinity)).toBe('');
    expect(moneyToWords(1e15)).toBe('');
  });
});

describe('ordinal', () => {
  it('raqam + defis', () => {
    expect(ordinal(3)).toBe('3-');
    expect(ordinal(22)).toBe('22-');
    expect(ordinal(0)).toBe('0-');
    expect(ordinal(3.7)).toBe('3-');
    expect(ordinal(-1)).toBe('');
    expect(ordinal(NaN)).toBe('');
  });
});

describe('ordinalWords', () => {
  it.each([
    [0, 'nolinchi'],
    [1, 'birinchi'],
    [2, 'ikkinchi'],
    [3, 'uchinchi'],
    [4, 'toʻrtinchi'],
    [5, 'beshinchi'],
    [6, 'oltinchi'],
    [7, 'yettinchi'],
    [8, 'sakkizinchi'],
    [9, 'toʻqqizinchi'],
    [10, 'oʻninchi'],
    [20, 'yigirmanchi'],
    [30, 'oʻttizinchi'],
    [40, 'qirqinchi'],
    [50, 'ellikinchi'],
    [60, 'oltmishinchi'],
    [100, 'yuzinchi'],
    [1000, 'minginchi'],
    [1_000_000, 'bir millioninchi'],
    [21, 'yigirma birinchi'],
    [22, 'yigirma ikkinchi'],
    [101, 'yuz birinchi'],
    [2026, 'ikki ming yigirma oltinchi'],
  ])('%d → %s', (n, words) => {
    expect(ordinalWords(n)).toBe(words);
  });

  it('script / apostrophe', () => {
    expect(ordinalWords(4, { apostrophe: 'ascii' })).toBe("to'rtinchi");
    expect(ordinalWords(2, { script: 'cyrillic' })).toBe('иккинчи');
    expect(ordinalWords(4, { script: 'cyrillic' })).toBe('тўртинчи');
    expect(ordinalWords(21, { script: 'cyrillic' })).toBe('йигирма биринчи');
  });

  it('manfiy / NaN → ""', () => {
    expect(ordinalWords(-1)).toBe('');
    expect(ordinalWords(NaN)).toBe('');
  });
});
