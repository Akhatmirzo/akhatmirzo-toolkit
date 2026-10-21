import { normalizeUz, normalizeUzWithMap, type NormalizedText } from './normalize';

/** Asl matndagi oraliq `[start, end)` (UTF-16 indekslari, `slice` bilan mos). */
export type TextRange = [start: number, end: number];

export interface SearchMatchResult {
  match: boolean;
  ranges: TextRange[];
}

export interface FuzzyMatchResult {
  /** Kattaroq — yaxshiroq. Faqat natijalarni o'zaro solishtirish uchun. */
  score: number;
  ranges: TextRange[];
}

/** Normallashtirilgan indekslarni asl oraliqlarga aylantiradi; ustma-ust/yonma-yonlarini birlashtiradi */
function toRanges(map: NormalizedText, spans: Array<[number, number]>): TextRange[] {
  const ranges: TextRange[] = [];
  for (const [from, to] of spans) {
    const start = map.starts[from]!;
    const end = map.ends[to - 1]!;
    const last = ranges.at(-1);
    if (last && start <= last[1]) last[1] = Math.max(last[1], end);
    else ranges.push([start, end]);
  }
  return ranges;
}

/**
 * O'zbekcha qism satr qidiruvi: registr, apostrof varianti va yozuv (kirill/lotin) farqi hisobga olinmaydi.
 * `ranges` — asl `text` dagi barcha mosliklar (qalin qilib ajratish uchun). Bo'sh so'rov hammasiga mos.
 * @example searchMatch('Ғузор тумани', "g'uzor") // { match: true, ranges: [[0, 5]] }
 */
export function searchMatch(
  text: string | null | undefined,
  query: string | null | undefined,
): SearchMatchResult {
  const q = normalizeUz(query).trim();
  if (q === '') return { match: true, ranges: [] };
  const map = normalizeUzWithMap(text);
  const spans: Array<[number, number]> = [];
  for (let i = map.text.indexOf(q); i !== -1; i = map.text.indexOf(q, i + q.length)) {
    spans.push([i, i + q.length]);
  }
  return { match: spans.length > 0, ranges: toRanges(map, spans) };
}

const WORD_CHAR = /[\p{L}\p{N}]/u;

const SCORE = {
  match: 1,
  wordStart: 8,
  consecutive: 5,
  gap: 1,
  /** Birinchi moslik qanchalik uzoqda bo'lsa, shuncha jarima (chegaralangan) */
  leading: 0.2,
  leadingMax: 3,
} as const;

/**
 * Fuzzy qidiruv (Command Palette uchun): so'rov harflari matnda shu tartibda uchrashi kerak.
 * So'z boshidagi va ketma-ket mosliklar yuqori ball oladi. Mos kelmasa — `null`.
 * Normallashtirish {@link searchMatch} bilan bir xil; so'rovdagi bo'shliqlar e'tiborga olinmaydi.
 * @example fuzzyMatch('Yangi buyurtma', 'ybu') // { score: …, ranges: [[0, 1], [6, 8]] }
 */
export function fuzzyMatch(
  text: string | null | undefined,
  query: string | null | undefined,
): FuzzyMatchResult | null {
  const q = normalizeUz(query).replace(/\s+/g, '');
  if (q === '') return { score: 0, ranges: [] };
  const map = normalizeUzWithMap(text);
  const t = map.text;
  const n = t.length;
  const m = q.length;
  if (m > n) return null;

  const bonus = (i: number) =>
    SCORE.match + (i === 0 || !WORD_CHAR.test(t[i - 1]!) ? SCORE.wordStart : 0);

  // best[j*n + i] — q[0..j] mos kelgan va q[j] === t[i] bo'lgandagi eng yaxshi ball
  const best = new Float64Array(m * n).fill(-Infinity);
  const from = new Int32Array(m * n).fill(-1);

  for (let i = 0; i < n; i++) {
    if (t[i] === q[0]) {
      best[i] = bonus(i) - Math.min(i * SCORE.leading, SCORE.leadingMax);
    }
  }
  for (let j = 1; j < m; j++) {
    const row = j * n;
    const prevRow = row - n;
    let gapBest = -Infinity;
    let gapIdx = -1;
    for (let i = j; i < n; i++) {
      // i-2 gacha bo'lgan (uzilish bilan) eng yaxshi oldingi moslik
      const k = i - 2;
      if (k >= 0 && best[prevRow + k]! > gapBest) {
        gapBest = best[prevRow + k]!;
        gapIdx = k;
      }
      if (t[i] !== q[j]) continue;
      const consecutive = best[prevRow + i - 1]! + SCORE.consecutive;
      const gapped = gapBest - SCORE.gap;
      if (consecutive === -Infinity && gapped === -Infinity) continue;
      if (consecutive >= gapped) {
        best[row + i] = consecutive + bonus(i);
        from[row + i] = i - 1;
      } else {
        best[row + i] = gapped + bonus(i);
        from[row + i] = gapIdx;
      }
    }
  }

  const lastRow = (m - 1) * n;
  let end = -1;
  let score = -Infinity;
  for (let i = m - 1; i < n; i++) {
    if (best[lastRow + i]! > score) {
      score = best[lastRow + i]!;
      end = i;
    }
  }
  if (end === -1) return null;

  const positions: number[] = [];
  for (let j = m - 1, i = end; j >= 0; i = from[j * n + i]!, j--) positions.push(i);
  positions.reverse();

  return {
    score,
    ranges: toRanges(
      map,
      positions.map((p) => [p, p + 1]),
    ),
  };
}

/** Matn bo'lagi: ajratilgan (`match: true`) yoki oddiy. */
export interface TextSegment {
  text: string;
  match: boolean;
}

/**
 * Matnni `ranges` bo'yicha bo'laklarga ajratadi — ajratilganini `<mark>` bilan chizish uchun.
 * @example splitByRanges('Toshkent', [[0, 4]]) // [{ text: 'Tosh', match: true }, { text: 'kent', match: false }]
 */
export function splitByRanges(text: string, ranges: readonly TextRange[]): TextSegment[] {
  const out: TextSegment[] = [];
  let pos = 0;
  for (const [start, end] of ranges) {
    const s = Math.max(start, pos);
    const e = Math.min(end, text.length);
    if (e <= s) continue;
    if (s > pos) out.push({ text: text.slice(pos, s), match: false });
    out.push({ text: text.slice(s, e), match: true });
    pos = e;
  }
  if (pos < text.length) out.push({ text: text.slice(pos), match: false });
  return out;
}
