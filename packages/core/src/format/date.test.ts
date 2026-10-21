import { describe, expect, it } from 'vitest';
import {
  MONTHS_UZ,
  MONTHS_UZ_SHORT,
  WEEKDAYS_UZ,
  WEEKDAYS_UZ_SHORT,
  formatDate,
  parseDate,
  timeAgo,
  weekdayIndex,
} from './date';

describe('konstantalar', () => {
  it('12 oy, 7 kun, hafta dushanbadan', () => {
    expect(MONTHS_UZ).toHaveLength(12);
    expect(MONTHS_UZ_SHORT).toHaveLength(12);
    expect(MONTHS_UZ[0]).toBe('Yanvar');
    expect(MONTHS_UZ[11]).toBe('Dekabr');
    expect(new Set(MONTHS_UZ_SHORT).size).toBe(12);
    expect(WEEKDAYS_UZ[0]).toBe('Dushanba');
    expect(WEEKDAYS_UZ[6]).toBe('Yakshanba');
    expect(WEEKDAYS_UZ_SHORT).toEqual(['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya']);
  });

  it('weekdayIndex: dushanba = 0, yakshanba = 6', () => {
    expect(weekdayIndex(new Date(2026, 9, 19))).toBe(0); // dushanba
    expect(weekdayIndex(new Date(2026, 9, 25))).toBe(6); // yakshanba
  });
});

describe('formatDate', () => {
  const date = new Date(2026, 9, 21, 9, 5, 7); // chorshanba

  it('default dd.MM.yyyy', () => {
    expect(formatDate(date)).toBe('21.10.2026');
    expect(formatDate(new Date(2026, 0, 3))).toBe('03.01.2026');
  });

  it('barcha tokenlar', () => {
    expect(formatDate(date, 'd M yy')).toBe('21 10 26');
    expect(formatDate(new Date(2026, 0, 3), 'd.M')).toBe('3.1');
    expect(formatDate(date, 'd MMMM yyyy')).toBe('21 Oktabr 2026');
    expect(formatDate(date, 'd MMM')).toBe('21 Okt');
    expect(formatDate(date, 'HH:mm:ss')).toBe('09:05:07');
    expect(formatDate(date, 'H:m:s')).toBe('9:5:7');
    expect(formatDate(date, 'EEEE')).toBe('Chorshanba');
    expect(formatDate(date, 'EEE')).toBe('Ch');
  });

  it('[...] ichidagi matn o`zgarmaydi', () => {
    expect(formatDate(date, '[Sana:] dd.MM, [soat] HH:mm')).toBe('Sana: 21.10, soat 09:05');
  });

  it('timestamp va ISO satr qabul qiladi', () => {
    expect(formatDate(date.getTime())).toBe('21.10.2026');
    expect(formatDate('2026-10-21T12:00:00')).toBe('21.10.2026');
  });

  it('noto`g`ri sana → bo`sh satr', () => {
    expect(formatDate(new Date('x'))).toBe('');
    expect(formatDate('sana emas')).toBe('');
    expect(formatDate('')).toBe('');
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
  });
});

describe('parseDate', () => {
  it('default dd.MM.yyyy', () => {
    expect(parseDate('21.10.2026')).toEqual(new Date(2026, 9, 21));
    expect(parseDate('  01.01.2000  ')).toEqual(new Date(2000, 0, 1));
  });

  it('mavjud bo`lmagan sanalar → null', () => {
    expect(parseDate('31.02.2026')).toBeNull();
    expect(parseDate('29.02.2026')).toBeNull();
    expect(parseDate('31.04.2026')).toBeNull();
    expect(parseDate('00.10.2026')).toBeNull();
    expect(parseDate('10.13.2026')).toBeNull();
  });

  it('kabisa yili', () => {
    expect(parseDate('29.02.2028')).toEqual(new Date(2028, 1, 29));
  });

  it('shablonga mos kelmasa → null', () => {
    expect(parseDate('21.10.26')).toBeNull();
    expect(parseDate('1.10.2026')).toBeNull();
    expect(parseDate('21/10/2026')).toBeNull();
    expect(parseDate('21.10.2026x')).toBeNull();
  });

  it('bo`sh / null', () => {
    expect(parseDate('')).toBeNull();
    expect(parseDate('   ')).toBeNull();
    expect(parseDate(null)).toBeNull();
    expect(parseDate(undefined)).toBeNull();
  });

  it('boshqa shablonlar', () => {
    expect(parseDate('2026-10-21 14:30', 'yyyy-MM-dd HH:mm')).toEqual(
      new Date(2026, 9, 21, 14, 30),
    );
    expect(parseDate('5/3/26', 'd/M/yy')).toEqual(new Date(2026, 2, 5));
    expect(parseDate('25:00', 'HH:mm')).toBeNull();
  });

  it('oy nomlari, katta-kichik harfga sezgir emas', () => {
    expect(parseDate('5 oktabr 2026', 'd MMMM yyyy')).toEqual(new Date(2026, 9, 5));
    expect(parseDate('5 IYL 2026', 'd MMM yyyy')).toEqual(new Date(2026, 6, 5));
    expect(parseDate('5 Oktyabr 2026', 'd MMMM yyyy')).toBeNull();
  });

  it('yil bo`lmasa → null', () => {
    expect(parseDate('21.10', 'dd.MM')).toBeNull();
  });

  it('formatDate bilan aylanma', () => {
    const pattern = 'EEEE, d MMMM yyyy [soat] HH:mm';
    const d = new Date(2026, 9, 21, 18, 45);
    expect(parseDate(formatDate(d, pattern), pattern)).toEqual(d);
  });

  it('0–99 yillar 1900-yillarga surilmaydi', () => {
    expect(parseDate('01.01.0050')?.getFullYear()).toBe(50);
  });
});

describe('timeAgo', () => {
  const now = new Date(2026, 9, 21, 15, 0, 0);
  const ago = (ms: number) => timeAgo(new Date(now.getTime() - ms), now);
  const MIN = 60_000;
  const HOUR = 60 * MIN;
  const DAY = 24 * HOUR;

  it('hozirgina (±1 daqiqa)', () => {
    expect(ago(0)).toBe('hozirgina');
    expect(ago(59_000)).toBe('hozirgina');
    expect(ago(-30_000)).toBe('hozirgina');
  });

  it('daqiqa va soat', () => {
    expect(ago(MIN)).toBe('1 daqiqa oldin');
    expect(ago(5 * MIN)).toBe('5 daqiqa oldin');
    expect(ago(59 * MIN)).toBe('59 daqiqa oldin');
    expect(ago(2 * HOUR)).toBe('2 soat oldin');
    expect(ago(23 * HOUR)).toBe('23 soat oldin');
  });

  it('kecha va kunlar (kalendar bo`yicha)', () => {
    expect(ago(DAY)).toBe('kecha');
    expect(timeAgo(new Date(2026, 9, 20, 0, 1), now)).toBe('kecha');
    expect(ago(3 * DAY)).toBe('3 kun oldin');
    expect(ago(6 * DAY)).toBe('6 kun oldin');
  });

  it('hafta, oy, yil', () => {
    expect(ago(7 * DAY)).toBe('1 hafta oldin');
    expect(ago(14 * DAY)).toBe('2 hafta oldin');
    expect(ago(29 * DAY)).toBe('4 hafta oldin');
    expect(ago(30 * DAY)).toBe('1 oy oldin');
    expect(ago(60 * DAY)).toBe('2 oy oldin');
    expect(ago(90 * DAY)).toBe('3 oy oldin');
    expect(ago(95 * DAY)).toBe('3 oy oldin');
    expect(ago(364 * DAY)).toBe('11 oy oldin');
    expect(ago(365 * DAY)).toBe('1 yil oldin');
    expect(ago(730 * DAY)).toBe('2 yil oldin');
    expect(ago(400 * DAY)).toBe('1 yil oldin');
    expect(ago(800 * DAY)).toBe('2 yil oldin');
  });

  it('kelajak', () => {
    expect(ago(-5 * MIN)).toBe('5 daqiqadan keyin');
    expect(ago(-3 * HOUR)).toBe('3 soatdan keyin');
    expect(ago(-DAY)).toBe('ertaga');
    expect(ago(-3 * DAY)).toBe('3 kundan keyin');
    expect(ago(-14 * DAY)).toBe('2 haftadan keyin');
    expect(ago(-60 * DAY)).toBe('2 oydan keyin');
    expect(ago(-365 * DAY)).toBe('1 yildan keyin');
    expect(ago(-366 * DAY)).toBe('1 yildan keyin');
  });

  it('noto`g`ri sana → bo`sh satr', () => {
    expect(timeAgo(null, now)).toBe('');
    expect(timeAgo('sana emas', now)).toBe('');
    expect(timeAgo(now, new Date('x'))).toBe('');
  });

  it('now berilmasa joriy vaqt olinadi', () => {
    expect(timeAgo(new Date())).toBe('hozirgina');
  });
});
