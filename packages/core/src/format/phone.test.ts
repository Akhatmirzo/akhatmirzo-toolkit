import { describe, expect, it } from 'vitest';
import { formatCardNumber, formatPhone } from './phone';

describe('formatPhone', () => {
  it('9 raqamli raqam → xalqaro', () => {
    expect(formatPhone('901234567')).toBe('+998 90 123 45 67');
  });

  it('+998 bilan berilgan, turli ajratuvchilar bilan', () => {
    expect(formatPhone('+998901234567')).toBe('+998 90 123 45 67');
    expect(formatPhone('+998 (90) 123-45-67')).toBe('+998 90 123 45 67');
    expect(formatPhone('998901234567')).toBe('+998 90 123 45 67');
    expect(formatPhone(901234567)).toBe('+998 90 123 45 67');
  });

  it('milliy uslub', () => {
    expect(formatPhone('901234567', 'national')).toBe('(90) 123-45-67');
    expect(formatPhone('+998 90 123 45 67', 'national')).toBe('(90) 123-45-67');
  });

  it('yozish paytida bosqichma-bosqich (milliy)', () => {
    const steps = ['9', '90', '901', '90123', '901234', '9012345', '90123456', '901234567'];
    expect(steps.map((s) => formatPhone(s, 'national'))).toEqual([
      '(9',
      '(90',
      '(90) 1',
      '(90) 123',
      '(90) 123-4',
      '(90) 123-45',
      '(90) 123-45-6',
      '(90) 123-45-67',
    ]);
  });

  it('yozish paytida bosqichma-bosqich (xalqaro)', () => {
    expect(formatPhone('9')).toBe('+998 9');
    expect(formatPhone('9012')).toBe('+998 90 12');
    expect(formatPhone('+998')).toBe('+998');
    expect(formatPhone('+99890')).toBe('+998 90');
  });

  it('99 operatori bilan boshlangan milliy raqam +998 deb kesilmaydi', () => {
    expect(formatPhone('998123456')).toBe('+998 99 812 34 56');
    expect(formatPhone('99812', 'national')).toBe('(99) 812');
  });

  it('ortiqcha raqamlar tashlanadi', () => {
    expect(formatPhone('9012345678999')).toBe('+998 90 123 45 67');
  });

  it('bo`sh va null-ga yaqin kiritish', () => {
    expect(formatPhone('')).toBe('');
    expect(formatPhone('   ')).toBe('');
    expect(formatPhone(null)).toBe('');
    expect(formatPhone(undefined, 'national')).toBe('');
    expect(formatPhone('abc')).toBe('');
  });
});

describe('formatCardNumber', () => {
  it('4 tadan guruhlaydi', () => {
    expect(formatCardNumber('8600123412341234')).toBe('8600 1234 1234 1234');
    expect(formatCardNumber('8600-1234 1234_1234')).toBe('8600 1234 1234 1234');
  });

  it('bosqichma-bosqich, oxirida bo`sh joy qoldirmaydi', () => {
    expect(formatCardNumber('8')).toBe('8');
    expect(formatCardNumber('8600')).toBe('8600');
    expect(formatCardNumber('86001')).toBe('8600 1');
  });

  it('ko`pi bilan 19 raqam', () => {
    expect(formatCardNumber('1'.repeat(25))).toBe('1111 1111 1111 1111 111');
  });

  it('bo`sh / null', () => {
    expect(formatCardNumber('')).toBe('');
    expect(formatCardNumber(null)).toBe('');
    expect(formatCardNumber('kartam')).toBe('');
  });
});
