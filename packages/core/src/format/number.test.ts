import { describe, expect, it } from 'vitest';
import { formatFileSize, formatMoney, formatNumber } from './number';

describe('formatNumber', () => {
  it('minglarni oddiy bo`sh joy bilan ajratadi (NBSP emas)', () => {
    const out = formatNumber(1250000);
    expect(out).toBe('1 250 000');
    expect(out).not.toContain(' ');
  });

  it('kichik sonlar va nol', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(999)).toBe('999');
    expect(formatNumber(1000)).toBe('1 000');
  });

  it('manfiy sonlar', () => {
    expect(formatNumber(-1234567)).toBe('-1 234 567');
    expect(formatNumber(-0)).toBe('0');
    expect(formatNumber(-0.001, { decimals: 2 })).toBe('0.00');
  });

  it('kasr: decimals berilmasa saqlanadi, berilsa yaxlitlanadi va to`ldiriladi', () => {
    expect(formatNumber(1234.5)).toBe('1 234.5');
    expect(formatNumber(1234.5, { decimals: 2 })).toBe('1 234.50');
    expect(formatNumber(1234.567, { decimals: 1 })).toBe('1 234.6');
    expect(formatNumber(1234.567, { decimals: 0 })).toBe('1 235');
    expect(formatNumber(0.000001)).toBe('0.000001');
  });

  it('juda katta son eksponentaga o`tmaydi', () => {
    expect(formatNumber(1e21)).toBe('1 000 000 000 000 000 000 000');
  });

  it('separator va decimalMark', () => {
    expect(formatNumber(1234567.8, { separator: ',' })).toBe('1,234,567.8');
    expect(formatNumber(1234.5, { separator: '', decimalMark: ',' })).toBe('1234,5');
  });

  it('noto`g`ri qiymat → bo`sh satr', () => {
    expect(formatNumber(NaN)).toBe('');
    expect(formatNumber(Infinity)).toBe('');
    expect(formatNumber(null as unknown as number)).toBe('');
    expect(formatNumber(undefined as unknown as number)).toBe('');
  });
});

describe('formatMoney', () => {
  it("default — so'm, kasrsiz", () => {
    expect(formatMoney(1250000)).toBe("1 250 000 so'm");
    expect(formatMoney(1250000.7)).toBe("1 250 001 so'm");
  });

  it('UZS va belgisiz', () => {
    expect(formatMoney(5000, { currency: 'UZS' })).toBe('5 000 UZS');
    expect(formatMoney(5000, { currency: false })).toBe('5 000');
  });

  it('decimals va manfiy', () => {
    expect(formatMoney(-99.5, { decimals: 2 })).toBe("-99.50 so'm");
  });

  it('noto`g`ri qiymatda valyuta qo`shilmaydi', () => {
    expect(formatMoney(NaN)).toBe('');
  });
});

describe('formatFileSize', () => {
  it('baytlar', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(512)).toBe('512 B');
    expect(formatFileSize(1023)).toBe('1023 B');
  });

  it('KB / MB / GB, ortiqcha nollarsiz', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(12 * 1024)).toBe('12 KB');
    expect(formatFileSize(3.4 * 1024 ** 2)).toBe('3.4 MB');
    expect(formatFileSize(1.2 * 1024 ** 3)).toBe('1.2 GB');
    expect(formatFileSize(5 * 1024 ** 4)).toBe('5 TB');
  });

  it('decimals', () => {
    expect(formatFileSize(1.234 * 1024 ** 2, 2)).toBe('1.23 MB');
    expect(formatFileSize(1.5 * 1024, 0)).toBe('2 KB');
  });

  it('yaxlitlashda 1024 bo`lib qolsa keyingi birlikka o`tadi', () => {
    expect(formatFileSize(1024 * 1024 - 10)).toBe('1 MB');
  });

  it('manfiy / noto`g`ri → bo`sh satr', () => {
    expect(formatFileSize(-1)).toBe('');
    expect(formatFileSize(NaN)).toBe('');
  });
});
