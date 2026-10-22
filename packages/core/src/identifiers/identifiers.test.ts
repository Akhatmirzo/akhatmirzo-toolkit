import { describe, expect, it } from 'vitest';
import { latToCyr } from '../text';
import {
  UZ_REGIONS,
  formatBankAccount,
  formatCarPlate,
  formatInn,
  formatPassport,
  formatPinfl,
  isValidBankAccount,
  isValidCarPlate,
  isValidInn,
  isValidMfo,
  isValidPassport,
  isValidPinfl,
  parseCarPlate,
  parsePinfl,
  regionByPlateCode,
} from './index';

describe('parsePinfl', () => {
  it('erkak, 1900-yillar (3)', () => {
    expect(parsePinfl('31503901234567')).toEqual({
      gender: 'male',
      birthDate: new Date(1990, 2, 15),
    });
  });

  it('ayol, 1900-yillar (4)', () => {
    expect(parsePinfl('42512991234567')).toEqual({
      gender: 'female',
      birthDate: new Date(1999, 11, 25),
    });
  });

  it('erkak, 2000-yillar (5)', () => {
    expect(parsePinfl('50101001234567')).toEqual({
      gender: 'male',
      birthDate: new Date(2000, 0, 1),
    });
  });

  it('ayol, 2000-yillar (6), bo‘shliq va chiziqcha bilan', () => {
    expect(parsePinfl('6 010120 123-45-67')).toEqual({
      gender: 'female',
      birthDate: new Date(2020, 0, 1),
    });
  });

  it('raqam (number) qabul qilinadi', () => {
    expect(parsePinfl(31503901234567)?.gender).toBe('male');
  });

  it('kabisa yili: 29-fevral', () => {
    expect(parsePinfl('32902961234567')?.birthDate).toEqual(new Date(1996, 1, 29));
    expect(parsePinfl('52902001234567')?.birthDate).toEqual(new Date(2000, 1, 29));
    expect(parsePinfl('32902001234567')).toBeNull(); // 1900 — kabisa emas
    expect(parsePinfl('52902011234567')).toBeNull(); // 2001 — kabisa emas
  });

  it.each([
    ['33102901234567', '31-fevral'],
    ['30001901234567', '0-kun'],
    ['30113901234567', '13-oy'],
    ['33104901234567', '31-aprel'],
    ['21503901234567', '1-raqam 2'],
    ['71503901234567', '1-raqam 7'],
    ['3150390123456', '13 raqam'],
    ['315039012345678', '15 raqam'],
    ['3150390123456a', 'harf'],
    ['', "bo'sh"],
  ])('%s → null (%s)', (input) => {
    expect(parsePinfl(input)).toBeNull();
    expect(isValidPinfl(input)).toBe(false);
  });

  it('null / undefined', () => {
    expect(parsePinfl(null)).toBeNull();
    expect(isValidPinfl(undefined)).toBe(false);
  });
});

describe('isValidPinfl', () => {
  it('standart: nazorat raqami tekshirilmaydi', () => {
    expect(isValidPinfl('31503901234567')).toBe(true);
    expect(isValidPinfl('31503901234562')).toBe(true);
  });

  it('checksum: true — 7-3-1 mod 10', () => {
    expect(isValidPinfl('31503901234562', { checksum: true })).toBe(true);
    expect(isValidPinfl('40101851234560', { checksum: true })).toBe(true);
    expect(isValidPinfl('60101201234563', { checksum: true })).toBe(true);
    expect(isValidPinfl('31503901234567', { checksum: true })).toBe(false);
    expect(parsePinfl('31503901234567', { checksum: true })).toBeNull();
  });

  it('checksum sana xatosini yashirmaydi', () => {
    expect(isValidPinfl('33102901234567', { checksum: true })).toBe(false);
  });
});

describe('formatPinfl', () => {
  it('5-5-4 guruhlar', () => {
    expect(formatPinfl('31503901234567')).toBe('31503 90123 4567');
    expect(formatPinfl('315 039 012 345 67')).toBe('31503 90123 4567');
  });
  it('bosqichma-bosqich', () => {
    expect(formatPinfl('315039')).toBe('31503 9');
    expect(formatPinfl('3150')).toBe('3150');
    expect(formatPinfl(null)).toBe('');
  });
  it('14 dan ortiq raqam tashlanadi', () => {
    expect(formatPinfl('3150390123456789')).toBe('31503 90123 4567');
  });
});

describe('STIR / INN', () => {
  it.each(['123456789', '123 456 789', '123-456-789', 987654321])('%s — to‘g‘ri', (input) => {
    expect(isValidInn(input)).toBe(true);
  });

  it.each(['012345678', '12345678', '1234567890', '12345678a', '', null, undefined])(
    '%s — noto‘g‘ri',
    (input) => {
      expect(isValidInn(input)).toBe(false);
    },
  );

  it('formatInn', () => {
    expect(formatInn('123456789')).toBe('123 456 789');
    expect(formatInn(123456789)).toBe('123 456 789');
    expect(formatInn('1234')).toBe('123 4');
    expect(formatInn('123')).toBe('123');
    expect(formatInn('')).toBe('');
    expect(formatInn('1234567890')).toBe('123 456 789');
  });
});

describe('pasport / ID karta', () => {
  it.each(['AA1234567', 'AB 1234567', 'ad1234567', ' aa 123-45-67 '])('%s — to‘g‘ri', (input) => {
    expect(isValidPassport(input)).toBe(true);
  });

  it.each([
    'A1234567',
    'AAA1234567',
    'AA123456',
    'AA12345678',
    'АА1234567', // kirill А
    '1234567AA',
    'AA 123456O',
    '',
    null,
  ])('%s — noto‘g‘ri', (input) => {
    expect(isValidPassport(input)).toBe(false);
  });

  it('formatPassport', () => {
    expect(formatPassport('aa1234567')).toBe('AA 1234567');
    expect(formatPassport('AA 1234567')).toBe('AA 1234567');
    expect(formatPassport('ad 12')).toBe('AD 12');
    expect(formatPassport('a')).toBe('A');
    expect(formatPassport('aa')).toBe('AA');
    expect(formatPassport('AA123456789')).toBe('AA 1234567');
    expect(formatPassport(undefined)).toBe('');
  });
});

describe('avtomobil raqami', () => {
  it('jismoniy shaxs', () => {
    const info = parseCarPlate('01 A 123 BC');
    expect(info?.type).toBe('personal');
    expect(info?.regionCode).toBe('01');
    expect(info?.region.id).toBe('tashkent-city');
  });

  it('yuridik shaxs', () => {
    const info = parseCarPlate('30 123 ABC');
    expect(info?.type).toBe('legal');
    expect(info?.region.id).toBe('samarkand');
  });

  it('kichik harf, bo‘shliqsiz, chiziqcha', () => {
    expect(parseCarPlate('95a123bc')?.region.id).toBe('karakalpakstan');
    expect(parseCarPlate('40-123-abc')?.type).toBe('legal');
  });

  it('har bir hudud kodi qabul qilinadi', () => {
    for (const r of UZ_REGIONS) {
      for (const code of r.plateCodes) {
        expect(isValidCarPlate(`${code} A 123 BC`)).toBe(true);
        expect(isValidCarPlate(`${code} 123 ABC`)).toBe(true);
      }
    }
  });

  it.each([
    ['00 A 123 BC', "hudud kodi ro'yxatda yo'q"],
    ['00 123 ABC', "hudud kodi ro'yxatda yo'q"],
    ['01 A 1234 BC', "raqam ko'p"],
    ['01 AB 123 C', 'jismoniy format buzilgan'],
    ['01 123 AB', 'yuridik: 2 harf'],
    ['01 12 ABC', 'yuridik: 2 raqam'],
    ['01 А 123 ВС', 'kirill harflar'],
    ['1 A 123 BC', 'hudud kodi 1 raqam'],
    ['', "bo'sh"],
  ])('%s — noto‘g‘ri (%s)', (input) => {
    expect(isValidCarPlate(input)).toBe(false);
    expect(parseCarPlate(input)).toBeNull();
  });

  it('null', () => {
    expect(isValidCarPlate(null)).toBe(false);
  });

  it('formatCarPlate', () => {
    expect(formatCarPlate('01a123bc')).toBe('01 A 123 BC');
    expect(formatCarPlate('01 A 123 BC')).toBe('01 A 123 BC');
    expect(formatCarPlate('01123abc')).toBe('01 123 ABC');
    expect(formatCarPlate('01A1')).toBe('01 A 1');
    expect(formatCarPlate('0112')).toBe('01 12');
    expect(formatCarPlate('0')).toBe('0');
    expect(formatCarPlate('01A123BCD')).toBe('01 A 123 BC');
    expect(formatCarPlate(null)).toBe('');
  });
});

describe('bank hisob raqami va MFO', () => {
  it('isValidBankAccount', () => {
    expect(isValidBankAccount('20208000900012345001')).toBe(true);
    expect(isValidBankAccount('2020 8000 9000 1234 5001')).toBe(true);
    expect(isValidBankAccount('2020-8000-9000-1234-5001')).toBe(true);
    expect(isValidBankAccount('2020800090001234500')).toBe(false);
    expect(isValidBankAccount('202080009000123450011')).toBe(false);
    expect(isValidBankAccount('2020800090001234500a')).toBe(false);
    expect(isValidBankAccount(null)).toBe(false);
  });

  it('formatBankAccount', () => {
    expect(formatBankAccount('20208000900012345001')).toBe('2020 8000 9000 1234 5001');
    expect(formatBankAccount('202080')).toBe('2020 80');
    expect(formatBankAccount('2020800090001234500199')).toBe('2020 8000 9000 1234 5001');
    expect(formatBankAccount(undefined)).toBe('');
  });

  it('isValidMfo', () => {
    expect(isValidMfo('00014')).toBe(true);
    expect(isValidMfo('01095')).toBe(true);
    expect(isValidMfo(' 00 014 ')).toBe(true);
    expect(isValidMfo('1234')).toBe(false);
    expect(isValidMfo('123456')).toBe(false);
    expect(isValidMfo('0001a')).toBe(false);
    expect(isValidMfo(null)).toBe(false);
  });
});

describe('UZ_REGIONS', () => {
  it('14 ta hudud, id lar takrorlanmaydi', () => {
    expect(UZ_REGIONS).toHaveLength(14);
    expect(new Set(UZ_REGIONS.map((r) => r.id)).size).toBe(14);
  });

  it('avto-raqam kodlari takrorlanmaydi va hududga qaytadi', () => {
    const codes = UZ_REGIONS.flatMap((r) => r.plateCodes);
    expect(new Set(codes).size).toBe(codes.length);
    for (const r of UZ_REGIONS) {
      for (const code of r.plateCodes) expect(regionByPlateCode(code)).toBe(r);
    }
  });

  it("kod diapazonlari: 01–99 to'liq qoplanadi, har hudud o'z oralig'ida", () => {
    const range = (r: (typeof UZ_REGIONS)[number]) => `${r.plateCodes[0]}-${r.plateCodes.at(-1)}`;
    expect(Object.fromEntries(UZ_REGIONS.map((r) => [r.id, range(r)]))).toEqual({
      'tashkent-city': '01-09',
      tashkent: '10-19',
      syrdarya: '20-24',
      jizzakh: '25-29',
      samarkand: '30-39',
      fergana: '40-49',
      namangan: '50-59',
      andijan: '60-69',
      kashkadarya: '70-74',
      surkhandarya: '75-79',
      bukhara: '80-84',
      navoi: '85-89',
      khorezm: '90-94',
      karakalpakstan: '95-99',
    });
    expect(UZ_REGIONS.flatMap((r) => r.plateCodes)).toHaveLength(99);
  });

  it('nameCyr — name ning kirilldagi shakli', () => {
    for (const r of UZ_REGIONS) expect(r.nameCyr).toBe(latToCyr(r.name));
  });

  it('nomlarda tipografik apostrof (ʻ)', () => {
    for (const r of UZ_REGIONS) {
      expect(r.name).not.toMatch(/['‘’`]/);
      expect(r.center).not.toMatch(/['‘’`]/);
    }
    expect(regionByPlateCode('40')?.name).toBe('Fargʻona viloyati');
  });

  it('regionByPlateCode', () => {
    expect(regionByPlateCode('01')?.id).toBe('tashkent-city');
    expect(regionByPlateCode(1)?.id).toBe('tashkent-city');
    expect(regionByPlateCode(95)?.center).toBe('Nukus');
    expect(regionByPlateCode('02')?.id).toBe('tashkent-city');
    expect(regionByPlateCode('17')?.id).toBe('tashkent');
    expect(regionByPlateCode('74')?.id).toBe('kashkadarya');
    expect(regionByPlateCode('00')).toBeNull();
    expect(regionByPlateCode('')).toBeNull();
    expect(regionByPlateCode(null)).toBeNull();
  });
});
