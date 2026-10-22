import { describe, expect, it } from 'vitest';
import { MONTHS_UZ, formatDate } from './date';
import { formatDateRange, formatDateUz, formatDuration } from './date-uz';

// 22-oktabr 2026 — payshanba
const date = new Date(2026, 9, 22, 14, 30);

describe('formatDateUz', () => {
  it('barcha uslublar', () => {
    expect(formatDateUz(date)).toBe('22-oktabr, 2026-yil');
    expect(formatDateUz(date, { style: 'long' })).toBe('22-oktabr, 2026-yil');
    expect(formatDateUz(date, { style: 'full' })).toBe('2026-yil 22-oktabr, payshanba');
    expect(formatDateUz(date, { style: 'short' })).toBe('22-okt, 2026');
    expect(formatDateUz(date, { style: 'dayMonth' })).toBe('22-oktabr');
    expect(formatDateUz(date, { style: 'monthYear' })).toBe('oktabr, 2026-yil');
  });

  it('time: true', () => {
    expect(formatDateUz(date, { time: true })).toBe('22-oktabr, 2026-yil, 14:30');
    expect(formatDateUz(new Date(2026, 0, 5, 9, 5), { style: 'short', time: true })).toBe(
      '5-yan, 2026, 09:05',
    );
  });

  it('oy nomlari kichik harf; Iyun/Iyul qisqasi farqlanadi', () => {
    expect(formatDateUz(new Date(2026, 0, 1))).toBe('1-yanvar, 2026-yil');
    expect(formatDateUz(new Date(2026, 5, 1), { style: 'short' })).toBe('1-iyn, 2026');
    expect(formatDateUz(new Date(2026, 6, 1), { style: 'short' })).toBe('1-iyl, 2026');
    expect(formatDateUz(new Date(2026, 11, 31), { style: 'full' })).toBe(
      '2026-yil 31-dekabr, payshanba',
    );
    expect(formatDateUz(new Date(2026, 9, 25), { style: 'full' })).toBe(
      '2026-yil 25-oktabr, yakshanba',
    );
  });

  it('kirill', () => {
    const cyr = { script: 'cyrillic' } as const;
    expect(formatDateUz(date, cyr)).toBe('22-октябрь, 2026-йил');
    expect(formatDateUz(date, { ...cyr, style: 'full' })).toBe('2026-йил 22-октябрь, пайшанба');
    expect(formatDateUz(date, { ...cyr, style: 'short' })).toBe('22-окт, 2026');
    expect(formatDateUz(date, { ...cyr, style: 'monthYear', time: true })).toBe(
      'октябрь, 2026-йил, 14:30',
    );
    expect(formatDateUz(new Date(2026, 5, 9), { ...cyr, style: 'dayMonth' })).toBe('9-июнь');
    expect(formatDateUz(new Date(2026, 9, 19), { ...cyr, style: 'full' })).toBe(
      '2026-йил 19-октябрь, душанба',
    );
  });

  it('timestamp va ISO satr; noto`g`ri sana → ""', () => {
    expect(formatDateUz(date.getTime())).toBe('22-oktabr, 2026-yil');
    expect(formatDateUz('2026-10-22T12:00:00')).toBe('22-oktabr, 2026-yil');
    expect(formatDateUz(new Date('x'))).toBe('');
    expect(formatDateUz(null)).toBe('');
    expect(formatDateUz('')).toBe('');
  });

  it('mavjud formatDate / MONTHS_UZ o`zgarmaydi', () => {
    expect(MONTHS_UZ[9]).toBe('Oktabr');
    expect(formatDate(date, 'd MMMM yyyy')).toBe('22 Oktabr 2026');
  });
});

describe('formatDateRange', () => {
  it('bir oy ichida', () => {
    expect(formatDateRange(new Date(2026, 9, 20), new Date(2026, 9, 22))).toBe(
      '20–22-oktabr, 2026-yil',
    );
    expect(formatDateRange(new Date(2026, 9, 20), new Date(2026, 9, 22), { style: 'short' })).toBe(
      '20–22-okt, 2026',
    );
  });

  it('oylar farq qiladi', () => {
    expect(formatDateRange(new Date(2026, 8, 30), new Date(2026, 9, 2))).toBe(
      '30-sentabr – 2-oktabr, 2026-yil',
    );
    expect(formatDateRange(new Date(2026, 8, 30), new Date(2026, 9, 2), { style: 'short' })).toBe(
      '30-sen – 2-okt, 2026',
    );
  });

  it('yillar farq qiladi — ikkalasi to`liq', () => {
    expect(formatDateRange(new Date(2026, 11, 30), new Date(2027, 0, 2))).toBe(
      '30-dekabr, 2026-yil – 2-yanvar, 2027-yil',
    );
    expect(formatDateRange(new Date(2026, 11, 30), new Date(2027, 0, 2), { style: 'short' })).toBe(
      '30-dek, 2026 – 2-yan, 2027',
    );
  });

  it('bir kun — bitta sana (vaqt farq qilsa ham)', () => {
    expect(formatDateRange(new Date(2026, 9, 22, 9), new Date(2026, 9, 22, 18))).toBe(
      '22-oktabr, 2026-yil',
    );
    expect(formatDateRange(date, date, { style: 'short' })).toBe('22-okt, 2026');
  });

  it('teskari tartib almashtiriladi', () => {
    expect(formatDateRange(new Date(2026, 9, 22), new Date(2026, 9, 20))).toBe(
      '20–22-oktabr, 2026-yil',
    );
  });

  it('kirill', () => {
    const cyr = { script: 'cyrillic' } as const;
    expect(formatDateRange(new Date(2026, 9, 20), new Date(2026, 9, 22), cyr)).toBe(
      '20–22-октябрь, 2026-йил',
    );
    expect(formatDateRange(new Date(2026, 8, 30), new Date(2026, 9, 2), cyr)).toBe(
      '30-сентябрь – 2-октябрь, 2026-йил',
    );
    expect(formatDateRange(new Date(2026, 11, 30), new Date(2027, 0, 2), cyr)).toBe(
      '30-декабрь, 2026-йил – 2-январь, 2027-йил',
    );
  });

  it('noto`g`ri sana → ""', () => {
    expect(formatDateRange(new Date('x'), date)).toBe('');
    expect(formatDateRange(date, null)).toBe('');
  });
});

describe('formatDuration', () => {
  const S = 1000;
  const M = 60 * S;
  const H = 60 * M;
  const D = 24 * H;

  it('default: eng katta 2 birlik', () => {
    expect(formatDuration(8_100_000)).toBe('2 soat 15 daqiqa');
    expect(formatDuration(90_061_000)).toBe('1 kun 1 soat');
    expect(formatDuration(45 * S)).toBe('45 soniya');
    expect(formatDuration(3 * M + 20 * S)).toBe('3 daqiqa 20 soniya');
    expect(formatDuration(2 * H)).toBe('2 soat');
  });

  it('units', () => {
    expect(formatDuration(90_061_000, { units: 3 })).toBe('1 kun 1 soat 1 daqiqa');
    expect(formatDuration(90_061_000, { units: 4 })).toBe('1 kun 1 soat 1 daqiqa 1 soniya');
    expect(formatDuration(90_061_000, { units: 1 })).toBe('1 kun');
    expect(formatDuration(90_061_000, { units: 10 })).toBe('1 kun 1 soat 1 daqiqa 1 soniya');
    expect(formatDuration(90_061_000, { units: 0 })).toBe('1 kun');
  });

  it('nol birliklar tashlanadi, oyna eng katta birlikdan', () => {
    expect(formatDuration(D + 5 * M)).toBe('1 kun');
    expect(formatDuration(D + 5 * M, { units: 3 })).toBe('1 kun 5 daqiqa');
    expect(formatDuration(H + 30 * S, { units: 3 })).toBe('1 soat 30 soniya');
  });

  it('qoldiq kesiladi (yaxlitlanmaydi)', () => {
    expect(formatDuration(59_999)).toBe('59 soniya');
    expect(formatDuration(2 * H + 59 * M + 59 * S)).toBe('2 soat 59 daqiqa');
  });

  it('short', () => {
    expect(formatDuration(45 * S, { style: 'short' })).toBe('45 s');
    expect(formatDuration(8_100_000, { style: 'short' })).toBe('2 soat 15 daq');
    expect(formatDuration(3 * D + 4 * H, { style: 'short' })).toBe('3 kun 4 soat');
    expect(formatDuration(500, { style: 'short' })).toBe('0 s');
  });

  it('< 1 s → "0 soniya"', () => {
    expect(formatDuration(0)).toBe('0 soniya');
    expect(formatDuration(999)).toBe('0 soniya');
  });

  it('kirill', () => {
    expect(formatDuration(8_100_000, { script: 'cyrillic' })).toBe('2 соат 15 дақиқа');
    expect(formatDuration(90_061_000, { units: 4, script: 'cyrillic' })).toBe(
      '1 кун 1 соат 1 дақиқа 1 сония',
    );
    expect(formatDuration(8_100_000, { script: 'cyrillic', style: 'short' })).toBe('2 соат 15 дақ');
    expect(formatDuration(0, { script: 'cyrillic' })).toBe('0 сония');
  });

  it('manfiy / NaN / Infinity → ""', () => {
    expect(formatDuration(-1)).toBe('');
    expect(formatDuration(NaN)).toBe('');
    expect(formatDuration(Infinity)).toBe('');
  });
});
