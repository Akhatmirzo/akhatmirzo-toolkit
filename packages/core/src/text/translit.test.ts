import { describe, expect, it } from 'vitest';
import { cyrToLat, latToCyr } from './translit';

describe('cyrToLat', () => {
  it("asosiy harflar va ko'p harfli o'girishlar", () => {
    expect(cyrToLat('шаҳар')).toBe('shahar');
    expect(cyrToLat('чой')).toBe('choy');
    expect(cyrToLat('ўзбек')).toBe("o'zbek");
    expect(cyrToLat('ғалаба')).toBe("g'alaba");
    expect(cyrToLat('қовун')).toBe('qovun');
    expect(cyrToLat('хат')).toBe('xat');
    expect(cyrToLat('ёз юлдуз ярим')).toBe('yoz yulduz yarim');
    expect(cyrToLat('цирк')).toBe('tsirk');
  });

  it('ajratilgan (NFD) harflar: ў, й, ё', () => {
    expect(cyrToLat('Ўзбек')).toBe("O'zbek");
    expect(cyrToLat('йул')).toBe('yul');
    expect(cyrToLat('ёз')).toBe('yoz');
    // Kirill bo'lmagan birikuvchi belgilar o'zgarmaydi
    expect(cyrToLat('é')).toBe('é');
  });

  it("е: so'z boshida va unlidan keyin → ye, aks holda → e", () => {
    expect(cyrToLat('ер')).toBe('yer');
    expect(cyrToLat('поезд')).toBe('poyezd');
    expect(cyrToLat('келди')).toBe('keldi');
    expect(cyrToLat('мен, ер')).toBe('men, yer');
    expect(cyrToLat('объект')).toBe("ob'yekt");
  });

  it("ъ → ', ь → (bo'sh)", () => {
    expect(cyrToLat('маъно')).toBe("ma'no");
    expect(cyrToLat('апрель')).toBe('aprel');
  });

  it('katta harflarni saqlaydi', () => {
    expect(cyrToLat('Шаҳар')).toBe('Shahar');
    expect(cyrToLat('ШАҲАР')).toBe('SHAHAR');
    expect(cyrToLat('ДАШ')).toBe('DASH');
    expect(cyrToLat('Ш')).toBe('Sh');
    expect(cyrToLat('Ёқуб')).toBe('Yoqub');
    expect(cyrToLat('Ўзбекистон')).toBe("O'zbekiston");
    expect(cyrToLat('ЎЗБЕКИСТОН')).toBe("O'ZBEKISTON");
    expect(cyrToLat('Ер')).toBe('Yer');
    expect(cyrToLat('ЕР')).toBe('YER');
  });

  it("lotin, raqam va belgilarga tegmaydi; bo'sh satr", () => {
    expect(cyrToLat('Toshkent 2026!')).toBe('Toshkent 2026!');
    expect(cyrToLat('Тошкент-2026')).toBe('Toshkent-2026');
    expect(cyrToLat('')).toBe('');
  });

  it('apostrof belgisini tanlash mumkin', () => {
    expect(cyrToLat('Ғузор', { apostrophe: 'ʻ' })).toBe('Gʻuzor');
    expect(cyrToLat('маъно', { apostrophe: 'ʼ' })).toBe('maʼno');
  });
});

describe('latToCyr', () => {
  it('asosiy harflar va digraflar', () => {
    expect(latToCyr('shahar')).toBe('шаҳар');
    expect(latToCyr('choy')).toBe('чой');
    expect(latToCyr('yoz yulduz yarim')).toBe('ёз юлдуз ярим');
    expect(latToCyr('qovun xat')).toBe('қовун хат');
  });

  it("o' va g' — barcha apostrof variantlari", () => {
    for (const a of ['ʻ', 'ʼ', '‘', '’', '`', '´', "'"]) {
      expect(latToCyr(`G${a}uzor`)).toBe('Ғузор');
      expect(latToCyr(`o${a}zbek`)).toBe('ўзбек');
    }
  });

  it("yo'l → йўл (y + o'), yo → ё", () => {
    expect(latToCyr("yo'l")).toBe('йўл');
    expect(latToCyr('yomg‘ir')).toBe('ёмғир');
  });

  it("tutuq belgisi → ъ, s'h → сҳ", () => {
    expect(latToCyr("ma'no")).toBe('маъно');
    expect(latToCyr("Is'hoq")).toBe('Исҳоқ');
  });

  it("so'z boshidagi e → э, ye → е", () => {
    expect(latToCyr('ekin')).toBe('экин');
    expect(latToCyr('keldi')).toBe('келди');
    expect(latToCyr('yer')).toBe('ер');
  });

  it('katta harflarni saqlaydi', () => {
    expect(latToCyr('Shahar')).toBe('Шаҳар');
    expect(latToCyr('SHAHAR')).toBe('ШАҲАР');
    expect(latToCyr("O'ZBEKISTON")).toBe('ЎЗБЕКИСТОН');
    expect(latToCyr('Toshkent')).toBe('Тошкент');
  });

  it("kirill, raqam va belgilarga tegmaydi; bo'sh satr", () => {
    expect(latToCyr('Тошкент 2026!')).toBe('Тошкент 2026!');
    expect(latToCyr('')).toBe('');
    expect(latToCyr("'salom'")).toBe("'салом'");
  });

  it("aylanma o'girish (lotin → kirill → lotin)", () => {
    for (const s of ["O'zbekiston", 'Shahar', "G'uzor", 'Toshkent', 'yangi yil']) {
      expect(cyrToLat(latToCyr(s))).toBe(s);
    }
  });
});
