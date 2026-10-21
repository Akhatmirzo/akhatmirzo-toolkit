import { formatCardNumber, formatNumber, formatPhone, parsePhone } from '@akhatmirzo/core';

/** Formatlangan matn va har bir toza belgining matndagi o'rni */
export interface MaskDisplay {
  text: string;
  /** `positions[i]` — `raw[i]` belgisining `text` dagi indeksi (o'sish tartibida) */
  positions: number[];
}

/** Niqob qoidasi: toza qiymat ↔ ko'rinish */
export interface MaskSpec {
  format: (raw: string) => MaskDisplay;
  /** Nomzod satrni to'g'ri toza qiymatga keltiradi; rad etilsa — `prev` */
  conform: (candidate: string, prev: string) => string;
  /** Kiritilgan (yozilgan yoki joylangan) matnni oldindan tozalash */
  prepareInsert?: (inserted: string) => string;
}

export interface MaskEditResult {
  raw: string;
  caret: number;
}

const isDigit = (ch: string) => ch >= '0' && ch <= '9';

/** Matndagi `test` ga mos belgilar o'rnini yig'adi */
export function withPositions(text: string, test: (ch: string) => boolean): MaskDisplay {
  const positions: number[] = [];
  for (let i = 0; i < text.length; i++) if (test(text[i]!)) positions.push(i);
  return { text, positions };
}

/** Ko'rinishdagi `pos` dan oldin nechta toza belgi bor */
export function rawIndexAt(positions: number[], pos: number): number {
  let n = 0;
  while (n < positions.length && positions[n]! < pos) n++;
  return n;
}

/** `rawIndex` ta toza belgidan keyingi kursor o'rni */
export function caretFor(display: MaskDisplay, rawIndex: number): number {
  if (rawIndex <= 0) return 0;
  const p = display.positions[Math.min(rawIndex, display.positions.length) - 1];
  return p === undefined ? display.text.length : p + 1;
}

/**
 * `input` hodisasini qayta ishlaydi: eski va yangi matn farqidan qaysi toza belgilar
 * o'chirilgani va nima qo'shilganini topadi. Kursor toza belgilar soni bo'yicha tiklanadi —
 * shuning uchun formatlash paytida "sakramaydi".
 */
export function applyInput(
  spec: MaskSpec,
  raw: string,
  nextText: string,
  caret: number,
): MaskEditResult {
  const prev = spec.format(raw);
  const prevText = prev.text;
  const suffixLen = Math.max(0, nextText.length - caret);
  const removedEnd = Math.max(0, prevText.length - suffixLen);
  const maxStart = Math.min(caret, removedEnd);
  let start = 0;
  while (start < maxStart && prevText[start] === nextText[start]) start++;

  const inserted = nextText.slice(start, caret);
  const ins = inserted && spec.prepareInsert ? spec.prepareInsert(inserted) : inserted;
  const a = rawIndexAt(prev.positions, start);
  const b = Math.max(a, rawIndexAt(prev.positions, removedEnd));
  const next = spec.conform(raw.slice(0, a) + ins + raw.slice(b), raw);

  // O'zgarish rad etildi (noto'g'ri belgi, chegaradan oshdi) — kursor tahrir boshida qoladi
  if (next === raw) return { raw, caret: Math.min(start, prevText.length) };
  const caretRaw = Math.min(spec.conform(raw.slice(0, a) + ins, '').length, next.length);
  return { raw: next, caret: caretFor(spec.format(next), caretRaw) };
}

/**
 * `Backspace`: kursordan oldin doimiy belgi (bo'sh joy, chiziqcha, qavs) bo'lsa — o'rniga
 * oldingi toza belgini o'chiradi. Oldingi belgi toza bo'lsa `null` (brauzer o'zi o'chiradi).
 */
export function deleteBackward(spec: MaskSpec, raw: string, caret: number): MaskEditResult | null {
  const d = spec.format(raw);
  if (caret <= 0 || d.positions.includes(caret - 1)) return null;
  let idx = -1;
  for (let i = d.positions.length - 1; i >= 0; i--) {
    if (d.positions[i]! < caret) {
      idx = i;
      break;
    }
  }
  if (idx < 0) return { raw, caret };
  const next = spec.conform(raw.slice(0, idx) + raw.slice(idx + 1), raw);
  return { raw: next, caret: caretFor(spec.format(next), idx) };
}

/** `Delete`: kursordan keyin doimiy belgi bo'lsa — keyingi toza belgini o'chiradi */
export function deleteForward(spec: MaskSpec, raw: string, caret: number): MaskEditResult | null {
  const d = spec.format(raw);
  if (caret >= d.text.length || d.positions.includes(caret)) return null;
  const idx = d.positions.findIndex((p) => p >= caret);
  if (idx < 0) return { raw, caret };
  const next = spec.conform(raw.slice(0, idx) + raw.slice(idx + 1), raw);
  return { raw: next, caret: caretFor(spec.format(next), idx) };
}

/* ---------- Tayyor qoidalar ---------- */

const PATTERN: Record<string, (ch: string) => boolean> = {
  '9': isDigit,
  A: (ch) => /\p{L}/u.test(ch),
  '*': (ch) => /\S/u.test(ch),
};

type MaskToken = { test: (ch: string) => boolean } | { literal: string };

export function parseMask(mask: string): MaskToken[] {
  return [...mask].map((ch) => {
    const test = PATTERN[ch];
    return test ? { test } : { literal: ch };
  });
}

/** Umumiy niqob: `9` — raqam, `A` — harf, `*` — istalgan; qolgani — doimiy belgi */
export function createPatternSpec(mask: string, uppercase = false): MaskSpec {
  const tokens = parseMask(mask);
  const slots = tokens.flatMap((t) => ('test' in t ? [t.test] : []));
  return {
    format(raw) {
      let text = '';
      const positions: number[] = [];
      let ri = 0;
      for (const t of tokens) {
        if (ri >= raw.length) break;
        if ('literal' in t) text += t.literal;
        else {
          positions.push(text.length);
          text += raw[ri++];
        }
      }
      return { text, positions };
    },
    conform(candidate) {
      let out = '';
      for (const ch of candidate) {
        const slot = slots[out.length];
        if (!slot) break;
        const c = uppercase ? ch.toUpperCase() : ch;
        if (slot(c)) out += c;
      }
      return out;
    },
  };
}

export function patternSlotCount(mask: string): number {
  return parseMask(mask).filter((t) => 'test' in t).length;
}

const digitsOnly = (s: string) => s.replace(/\D/g, '');

/** Telefon: toza qiymat — 9 raqam, ko'rinish — "(90) 123-45-67" (`+998` prefiks alohida) */
export const phoneSpec: MaskSpec = {
  format: (raw) => withPositions(formatPhone(raw, 'national'), isDigit),
  conform: (candidate) => digitsOnly(candidate).slice(0, 9),
  // "+998 90 123 45 67" joylansa ham to'g'ri tushadi
  prepareInsert: (inserted) => (inserted.length > 1 ? parsePhone(inserted).digits : inserted),
};

/** Karta: toza qiymat — 16 raqam, ko'rinish — 4 tadan guruh */
export const cardSpec: MaskSpec = {
  format: (raw) => withPositions(formatCardNumber(raw), isDigit),
  conform: (candidate) => digitsOnly(candidate).slice(0, 16),
};

/** Butun qismdagi raqamlar chegarasi (Number aniqligi saqlanishi uchun) */
const MAX_INT_DIGITS = 15;

/** Pul: toza qiymat — "1250000" yoki "1250000.5", ko'rinish — "1 250 000.5" */
export function createMoneySpec(decimals: number, max?: number): MaskSpec {
  return {
    format(raw) {
      if (!raw) return { text: '', positions: [] };
      const dot = raw.indexOf('.');
      const int = dot < 0 ? raw : raw.slice(0, dot);
      const text =
        formatNumber(Number(int || '0'), { decimals: 0 }) + (dot < 0 ? '' : raw.slice(dot));
      return withPositions(text, (ch) => isDigit(ch) || ch === '.');
    },
    conform(candidate, prev) {
      const clean = candidate.replace(/[^\d.]/g, '');
      const dot = decimals > 0 ? clean.indexOf('.') : -1;
      let int = (dot < 0 ? clean : clean.slice(0, dot)).replace(/\./g, '');
      const frac =
        dot < 0
          ? null
          : clean
              .slice(dot + 1)
              .replace(/\./g, '')
              .slice(0, decimals);
      int = int.replace(/^0+(?=\d)/, '');
      if (frac !== null && int === '') int = '0';
      if (int.length > MAX_INT_DIGITS) return prev;
      const out = frac === null ? int : `${int}.${frac}`;
      if (max !== undefined && out && Number(out) > max) return prev;
      return out;
    },
    prepareInsert(inserted) {
      let text = inserted.replace(/,/g, '.');
      // Joylangan "1 250 000.00" — kasr kerak bo'lmasa kasr qismi tashlanadi
      if (decimals === 0 && inserted.length > 1) text = text.replace(/\..*$/, '');
      return text;
    },
  };
}

export function moneyToRaw(value: number | null | undefined, decimals: number): string {
  if (value == null || !Number.isFinite(value)) return '';
  const plain = formatNumber(Math.abs(value), { separator: '' });
  return createMoneySpec(decimals).conform(plain, '');
}

export function rawToMoney(raw: string): number | null {
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}
