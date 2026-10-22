import type { MaskSpec } from '../masked-input/mask-engine';

export interface GroupedSpecOptions {
  /** Toza qiymatning maksimal uzunligi */
  length: number;
  /** Guruhlar uzunligi (joriy toza qiymatga qarab o'zgarishi mumkin) */
  groups: (raw: string) => readonly number[];
  /** `index` o'ringa `ch` belgisini qabul qilish (`out` — shu paytgacha yig'ilgan qiymat) */
  accept: (ch: string, index: number, out: string) => boolean;
  /** Guruhlar orasidagi ajratuvchi. Default `' '` */
  gap?: (groupIndex: number) => string;
  /** Belgini qabul qilishdan oldin o'zgartirish (masalan katta harf) */
  normalize?: (ch: string) => string;
}

/** Guruhlangan niqob: toza qiymat bo'shliqsiz, ko'rinish — guruhlar orasida ajratuvchi */
export function createGroupedSpec({
  length,
  groups,
  accept,
  gap = () => ' ',
  normalize = (ch) => ch,
}: GroupedSpecOptions): MaskSpec {
  return {
    format(raw) {
      let text = '';
      const positions: number[] = [];
      let ri = 0;
      const sizes = groups(raw);
      for (let g = 0; g < sizes.length && ri < raw.length; g++) {
        if (g > 0) text += gap(g);
        for (let k = 0; k < sizes[g]! && ri < raw.length; k++) {
          positions.push(text.length);
          text += raw[ri++];
        }
      }
      return { text, positions };
    },
    conform(candidate) {
      let out = '';
      for (const ch of candidate) {
        if (out.length >= length) break;
        const c = normalize(ch);
        if (accept(c, out.length, out)) out += c;
      }
      return out;
    },
  };
}

const isDigit = (ch: string) => ch >= '0' && ch <= '9';
const isLatinUpper = (ch: string) => ch >= 'A' && ch <= 'Z';
const upper = (ch: string) => ch.toUpperCase();

/** JShShIR: 14 raqam, `00000 00000 0000` */
export const pinflSpec = createGroupedSpec({
  length: 14,
  groups: () => [5, 5, 4],
  accept: isDigit,
});

/** STIR: 9 raqam, `000 000 000` */
export const innSpec = createGroupedSpec({
  length: 9,
  groups: () => [3, 3, 3],
  accept: isDigit,
});

/** Bank hisob raqami: 20 raqam, 4 tadan */
export const bankAccountSpec = createGroupedSpec({
  length: 20,
  groups: () => [4, 4, 4, 4, 4],
  accept: isDigit,
});

/** Pasport / ID karta: 2 lotin bosh harf + 7 raqam, `AA 1234567` */
export const passportSpec = createGroupedSpec({
  length: 9,
  groups: () => [2, 7],
  accept: (ch, i) => (i < 2 ? isLatinUpper(ch) : isDigit(ch)),
  normalize: upper,
});

/** Avtomobil raqami turi 3-belgidan: harf — jismoniy, raqam — yuridik */
export const plateKind = (raw: string): 'personal' | 'legal' | null => {
  const ch = raw[2];
  if (ch === undefined) return null;
  return isDigit(ch) ? 'legal' : 'personal';
};

/**
 * Avtomobil raqami: jismoniy `01 A 123 BC` ([2,1,3,2]) yoki yuridik `01 123 ABC` ([2,3,3]).
 * Hudud kodidan keyin ikki bo'shliq — ajratuvchi chiziq uchun joy (haqiqiy raqamdagidek).
 */
export const carPlateSpec = createGroupedSpec({
  length: 8,
  groups: (raw) => (plateKind(raw) === 'legal' ? [2, 3, 3] : [2, 1, 3, 2]),
  gap: (g) => (g === 1 ? '  ' : ' '),
  normalize: upper,
  accept: (ch, i, out) => {
    if (i < 2) return isDigit(ch);
    if (i === 2) return isDigit(ch) || isLatinUpper(ch);
    // jismoniy: A 123 BC → 3..5 raqam, 6..7 harf; yuridik: 123 ABC → 3..4 raqam, 5..7 harf
    const lettersFrom = plateKind(out) === 'legal' ? 5 : 6;
    return i < lettersFrom ? isDigit(ch) : isLatinUpper(ch);
  },
});
