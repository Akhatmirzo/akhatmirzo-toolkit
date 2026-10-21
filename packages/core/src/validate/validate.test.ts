import { describe, expect, it } from 'vitest';
import {
  UZ_OPERATOR_CODES,
  detectCardBrand,
  isValidCardNumber,
  isValidEmail,
  isValidPhone,
  luhnCheck,
  parsePhone,
  passwordStrength,
} from './index';
import { formatPhone } from '../format';

describe('parsePhone', () => {
  it.each(['+998 90 123-45-67', '998901234567', '901234567', '(90) 123-45-67', ' +998901234567 '])(
    '%s → 901234567',
    (input) => {
      expect(parsePhone(input)).toEqual({ digits: '901234567', operator: '90', valid: true });
    },
  );

  it('barcha operator kodlarini qabul qiladi', () => {
    for (const code of UZ_OPERATOR_CODES) expect(isValidPhone(`${code}1234567`)).toBe(true);
  });

  it("noma'lum operator kodi", () => {
    expect(parsePhone('921234567')).toEqual({ digits: '921234567', operator: null, valid: false });
    expect(isValidPhone('+998 12 345 67 89')).toBe(false);
  });

  it('99 operatorli raqamni 998 prefiksi deb kesmaydi', () => {
    expect(parsePhone('998123456')).toMatchObject({ digits: '998123456', operator: '99' });
    expect(isValidPhone('998123456')).toBe(true);
  });

  it("to'liq bo'lmagan / ortiqcha raqamlar", () => {
    expect(parsePhone('90 12')).toEqual({ digits: '9012', operator: '90', valid: false });
    expect(parsePhone('+998 9')).toEqual({ digits: '9', operator: null, valid: false });
    expect(isValidPhone('9012345678')).toBe(false);
    expect(isValidPhone('+998 90 123 45 678')).toBe(false);
  });

  it('formatPhone bilan bir xil prefiks qoidasi (10–11 raqam ham)', () => {
    const cases: [string | number, string][] = [
      ['9989012345', '9012345'],
      ['99890123456', '90123456'],
      ['998123456', '998123456'],
      ['+99890', '90'],
      [998901234567, '901234567'],
    ];
    for (const [input, digits] of cases) {
      const parsed = parsePhone(input);
      expect(parsed.digits).toBe(digits);
      expect(formatPhone(input, 'national').replace(/\D/g, '')).toBe(digits);
    }
  });

  it('raqam, null va undefined kiritish', () => {
    expect(parsePhone(901234567)).toEqual({ digits: '901234567', operator: '90', valid: true });
    expect(parsePhone(null)).toEqual({ digits: '', operator: null, valid: false });
    expect(isValidPhone(undefined)).toBe(false);
  });

  it("bo'sh va null-ga yaqin kiritish", () => {
    const empty = { digits: '', operator: null, valid: false };
    expect(parsePhone('')).toEqual(empty);
    expect(parsePhone('   ')).toEqual(empty);
    expect(parsePhone(null)).toEqual(empty);
    expect(parsePhone(undefined)).toEqual(empty);
    expect(parsePhone('телефон')).toEqual(empty);
  });
});

describe('isValidEmail', () => {
  it.each([
    'sarvar@mail.uz',
    'a.b+tag@sub.domain.co.uk',
    '  user@example.com  ',
    'o_zbek-1@gmail.com',
    'пользователь@почта.рф',
  ])('to‘g‘ri: %s', (s) => expect(isValidEmail(s)).toBe(true));

  it.each([
    '',
    '   ',
    null,
    undefined,
    'sarvar',
    'sarvar@mail',
    'sarvar@mail.u',
    '@mail.uz',
    'sar var@mail.uz',
    'a@@mail.uz',
    'a@b@mail.uz',
    'a@mail..uz',
    'a@.mail.uz',
    'oʻzbek@mail uz',
  ])('noto‘g‘ri: %s', (s) => expect(isValidEmail(s)).toBe(false));

  it('254 belgidan uzun manzil', () => {
    expect(isValidEmail(`${'a'.repeat(250)}@mail.uz`)).toBe(false);
  });
});

describe('karta', () => {
  it('luhnCheck', () => {
    expect(luhnCheck('4111111111111111')).toBe(true);
    expect(luhnCheck('4111111111111112')).toBe(false);
    expect(luhnCheck('0')).toBe(true);
    expect(luhnCheck('')).toBe(false);
    expect(luhnCheck('4111 1111')).toBe(false);
  });

  it('isValidCardNumber', () => {
    expect(isValidCardNumber('4111 1111 1111 1111')).toBe(true);
    expect(isValidCardNumber('5555-5555-5555-4444')).toBe(true);
    expect(isValidCardNumber('8600000000000007')).toBe(true);
    expect(isValidCardNumber('4111 1111 1111 1112')).toBe(false);
    // Luhn to'g'ri, lekin 16 raqam emas
    expect(isValidCardNumber('4222222222222')).toBe(false);
    expect(isValidCardNumber('41111111111111111')).toBe(false);
    expect(isValidCardNumber('')).toBe(false);
    expect(isValidCardNumber(null)).toBe(false);
  });

  it.each([
    ['8600 1234', 'uzcard'],
    ['9860', 'humo'],
    ['4', 'visa'],
    ['4111 1111 1111 1111', 'visa'],
    ['51', 'mastercard'],
    ['5555 5555', 'mastercard'],
    ['2221', 'mastercard'],
    ['2720 99', 'mastercard'],
  ] as const)('detectCardBrand(%s) → %s', (input, brand) => {
    expect(detectCardBrand(input)).toBe(brand);
  });

  it.each(['', null, undefined, '8', '860', '5', '50', '56', '2220', '2721', '6011', '986'])(
    'detectCardBrand(%s) → null',
    (input) => expect(detectCardBrand(input)).toBeNull(),
  );
});

describe('passwordStrength', () => {
  it.each([
    ['', 0, 'Juda zaif'],
    ['a', 0, 'Juda zaif'],
    ['abcdefgh', 1, 'Zaif'],
    ['12345678', 1, 'Zaif'],
    ['aA1!', 1, 'Zaif'],
    ['Abcdefg1', 2, "O'rtacha"],
    ['Parol123!', 3, 'Yaxshi'],
    ['Parol123!xyz', 4, 'Kuchli'],
    ['Abcdefg1xyzab', 3, 'Yaxshi'],
    ['abcdefghijkl', 1, 'Zaif'],
    ['1234567', 0, 'Juda zaif'],
    ['Kuchli-Parol-2026', 4, 'Kuchli'],
    ['juda uzun maxfiy ibora', 2, "O'rtacha"],
  ] as const)('%s → %i %s', (pw, score, label) => {
    expect(passwordStrength(pw)).toMatchObject({ score, label });
  });

  it('checks', () => {
    expect(passwordStrength('Ab1!').checks).toEqual({
      length: false,
      lower: true,
      upper: true,
      digit: true,
      symbol: true,
    });
    expect(passwordStrength(null).checks).toEqual({
      length: false,
      lower: false,
      upper: false,
      digit: false,
      symbol: false,
    });
  });

  it('kirill harflari katta/kichik harf sifatida hisoblanadi', () => {
    expect(passwordStrength('Пароль').checks).toMatchObject({ lower: true, upper: true });
  });

  it("o'zbek apostroflari", () => {
    // ASCII ' va ` — belgi; ʻ ʼ (U+02BB/U+02BC) — harf modifikatori, belgi emas; ‘ ’ — tinish belgisi
    expect(passwordStrength("o'zbek").checks.symbol).toBe(true);
    expect(passwordStrength('o`zbek').checks.symbol).toBe(true);
    expect(passwordStrength('oʻzbek').checks.symbol).toBe(false);
    expect(passwordStrength('oʼzbek').checks.symbol).toBe(false);
    expect(passwordStrength('o‘zbek').checks.symbol).toBe(true);
    expect(passwordStrength('o’zbek').checks.symbol).toBe(true);
  });

  it("bo'shliq belgi hisoblanmaydi, uzunlik kod nuqtalarda", () => {
    expect(passwordStrength('a b').checks.symbol).toBe(false);
    expect(passwordStrength('😀😀😀😀').checks.length).toBe(false);
  });
});
