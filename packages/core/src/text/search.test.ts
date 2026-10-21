import { describe, expect, it } from 'vitest';
import { normalizeUz } from './normalize';
import { fuzzyMatch, searchMatch, splitByRanges, type TextRange } from './search';

const marked = (text: string, ranges: TextRange[]) =>
  splitByRanges(text, ranges)
    .map((s) => (s.match ? `[${s.text}]` : s.text))
    .join('');

describe('normalizeUz', () => {
  it('apostrof variantlari va kirill bir xil kalitga keladi', () => {
    const keys = [
      'Gʻuzor',
      'Gʼuzor',
      'G‘uzor',
      'G’uzor',
      'G`uzor',
      'G´uzor',
      "G'uzor",
      'Ғузор',
      'ГУЗОР',
    ];
    for (const k of keys) expect(normalizeUz(k)).toBe('guzor');
  });

  it("bo'sh va null-ga yaqin kiritish", () => {
    expect(normalizeUz('')).toBe('');
    expect(normalizeUz(null)).toBe('');
    expect(normalizeUz(undefined)).toBe('');
  });

  it('kirill ↔ lotin', () => {
    expect(normalizeUz('Тошкент')).toBe(normalizeUz('Toshkent'));
    expect(normalizeUz('Ўзбекистон')).toBe(normalizeUz("O'zbekiston"));
  });

  it("kirill `е` qidiruv kalitida doim `e` (so'z boshida ham)", () => {
    expect(normalizeUz('Ер')).toBe('er');
    expect(normalizeUz('е')).toBe('e');
    expect(normalizeUz('Келди')).toBe('keldi');
    expect(normalizeUz('Оила ва ер')).toBe('oila va er');
  });

  it('ajratilgan (NFD) harflar birlashtiriladi', () => {
    const decomposed = 'У\u0306збекистон'; // У + U+0306
    expect(decomposed).not.toBe('Ўзбекистон');
    expect(normalizeUz(decomposed)).toBe('ozbekiston');
    expect(normalizeUz('и\u0306ул')).toBe('yul');
    expect(normalizeUz('е\u0308лка')).toBe('yolka');
  });
});

describe('searchMatch', () => {
  it('kirill matnda lotin so‘rov', () => {
    const r = searchMatch('Тошкент', 'Toshkent');
    expect(r.match).toBe(true);
    expect(r.ranges).toEqual([[0, 7]]);
  });

  it('lotin matnda kirill so‘rov', () => {
    expect(searchMatch('Toshkent shahri', 'шаҳ')).toEqual({ match: true, ranges: [[9, 13]] });
  });

  it('ranges asl matndagi indekslar (apostrof oralig‘ga kiradi)', () => {
    const text = "Farg'ona";
    expect(marked(text, searchMatch(text, 'rgo').ranges)).toBe("Fa[rg'o]na");
    expect(marked('Ғузор', searchMatch('Ғузор', "g'u").ranges)).toBe('[Ғу]зор');
  });

  it("ko'p harfli o'girish to'g'ri xaritalanadi", () => {
    // ш → sh: "sh" bitta asl belgiga mos keladi
    expect(searchMatch('Шаҳар', 'sha').ranges).toEqual([[0, 2]]);
    // so'rov digrafning yarmidan boshlansa — butun asl belgi ajratiladi; yonma-yonlar birlashadi
    expect(searchMatch('Шаҳар', 'ha').ranges).toEqual([[0, 4]]);
    expect(searchMatch('Шаҳар', 'h').ranges).toEqual([
      [0, 1],
      [2, 3],
    ]);
  });

  it('barcha mosliklarni topadi', () => {
    expect(marked('ana bana', searchMatch('ana bana', 'an').ranges)).toBe('[an]a b[an]a');
  });

  it("katta-kichik harf farqi yo'q", () => {
    expect(searchMatch('TOSHKENT', 'kent').match).toBe(true);
  });

  it("mos kelmasa match: false; bo'sh so'rov — hammasiga mos", () => {
    expect(searchMatch('Samarqand', 'buxoro')).toEqual({ match: false, ranges: [] });
    expect(searchMatch('Samarqand', '')).toEqual({ match: true, ranges: [] });
    expect(searchMatch('Samarqand', '   ')).toEqual({ match: true, ranges: [] });
    expect(searchMatch(null, 'a')).toEqual({ match: false, ranges: [] });
    expect(searchMatch('', '')).toEqual({ match: true, ranges: [] });
  });

  it('emoji (surrogate juftlik) indekslarni buzmaydi', () => {
    const text = '😀 Toshkent';
    expect(marked(text, searchMatch(text, 'tosh').ranges)).toBe('😀 [Tosh]kent');
  });
});

describe('searchMatch: kirill е so‘z o‘rtasida', () => {
  it('kirill so‘rov kirill matnda', () => {
    expect(searchMatch('Келди', 'ел')).toEqual({ match: true, ranges: [[1, 3]] });
    expect(searchMatch('Келди', 'е').match).toBe(true);
    expect(searchMatch('Келди', 'Е').match).toBe(true);
  });

  it('kirill so‘rov lotin matnda va aksincha', () => {
    expect(searchMatch('Keldi', 'ел')).toEqual({ match: true, ranges: [[1, 3]] });
    expect(searchMatch('Ерга', 'er')).toEqual({ match: true, ranges: [[0, 2]] });
    expect(searchMatch('Ерга', 'ер')).toEqual({ match: true, ranges: [[0, 2]] });
    expect(searchMatch('Yerga', 'yer').match).toBe(true);
  });

  it('fuzzyMatch ham kirill е ni so‘z o‘rtasida topadi', () => {
    expect(fuzzyMatch('Келди', 'ел')).not.toBeNull();
    expect(fuzzyMatch('Keldi', 'ел')).not.toBeNull();
  });

  it('ajratilgan ў bilan matn topiladi, oraliq asl matnga tegishli', () => {
    const text = 'Мен У\u0306збекман';
    // У + U+0306 + збек — asl matnda [4, 10)
    expect(searchMatch(text, "o'zbek")).toEqual({ match: true, ranges: [[4, 10]] });
    expect(searchMatch(text, 'Ўзбек').match).toBe(true);
  });
});

describe('fuzzyMatch', () => {
  it('harflar ketma-ketligi bo‘yicha topadi', () => {
    const r = fuzzyMatch('Yangi buyurtma', 'ybu');
    expect(r).not.toBeNull();
    expect(marked('Yangi buyurtma', r!.ranges)).toBe('[Y]angi [bu]yurtma');
  });

  it('tartib buzilsa yoki harf yetmasa — null', () => {
    expect(fuzzyMatch('Sozlamalar', 'zs')).toBeNull();
    expect(fuzzyMatch('abc', 'abcd')).toBeNull();
    expect(fuzzyMatch('', 'a')).toBeNull();
    expect(fuzzyMatch(null, 'a')).toBeNull();
  });

  it("bo'sh so'rov — score 0", () => {
    expect(fuzzyMatch('Sozlamalar', '')).toEqual({ score: 0, ranges: [] });
  });

  it("so'z boshidagi va ketma-ket mosliklar yuqori ball oladi", () => {
    const wordStart = fuzzyMatch('Mijoz qo‘shish', 'mq')!.score;
    const middle = fuzzyMatch('Ommaviy qo‘shish', 'mq')!.score;
    expect(wordStart).toBeGreaterThan(middle);

    const consecutive = fuzzyMatch('Hisobotlar', 'hiso')!.score;
    const spread = fuzzyMatch('Hamkorlik shartnoma', 'hiso')!.score;
    expect(consecutive).toBeGreaterThan(spread);
  });

  it('ochko‘z (greedy) emas — eng yaxshi joylashuvni tanlaydi', () => {
    // greedy "s" ni 2-o'rinda olardi; yaxshisi — "Sozlamalar" so'z boshi
    const text = 'Asos Sozlamalar';
    expect(marked(text, fuzzyMatch(text, 'soz')!.ranges)).toBe('Asos [Soz]lamalar');
  });

  it("kirill matn, lotin so'rov va apostroflar", () => {
    const text = 'Ғалаба кўчаси';
    expect(marked(text, fuzzyMatch(text, "g'ko")!.ranges)).toBe('[Ғ]алаба [кў]часи');
    expect(fuzzyMatch("G'uzor", 'Гу')).not.toBeNull();
  });

  it("so'rovdagi bo'shliqlar e'tiborga olinmaydi", () => {
    expect(fuzzyMatch('Yangi buyurtma', 'yangi bu')).not.toBeNull();
  });
});

describe('splitByRanges', () => {
  it("bo'laklarga ajratadi va chegaradan chiqqanini kesadi", () => {
    expect(splitByRanges('Toshkent', [[0, 4]])).toEqual([
      { text: 'Tosh', match: true },
      { text: 'kent', match: false },
    ]);
    expect(splitByRanges('abc', [])).toEqual([{ text: 'abc', match: false }]);
    expect(splitByRanges('abc', [[2, 10]])).toEqual([
      { text: 'ab', match: false },
      { text: 'c', match: true },
    ]);
    expect(splitByRanges('', [[0, 1]])).toEqual([]);
  });
});
