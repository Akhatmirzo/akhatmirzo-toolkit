import { isApostrophe, walkCyrToLat } from './translit';

/**
 * Normallashtirilgan matn va uning har bir belgisi asl matnning qaysi qismidan kelgani.
 * `starts[k]`/`ends[k]` — `text[k]` hosil bo'lgan asl belgining UTF-16 chegaralari `[start, end)`.
 * @internal
 */
export interface NormalizedText {
  text: string;
  starts: number[];
  ends: number[];
}

/** {@link normalizeUz} + asl matnga indekslar xaritasi. */
export function normalizeUzWithMap(s: string | null | undefined): NormalizedText {
  let text = '';
  const starts: number[] = [];
  const ends: number[] = [];
  walkCyrToLat(
    s ?? '',
    "'",
    (out, index, length) => {
      for (const ch of out.toLowerCase()) {
        if (isApostrophe(ch)) continue;
        // Kod birligi bo'yicha (indexOf bilan mos bo'lishi uchun)
        for (let u = 0; u < ch.length; u++) {
          text += ch[u];
          starts.push(index);
          ends.push(index + length);
        }
      }
    },
    false,
  );
  return { text, starts, ends };
}

/**
 * Qidiruv kaliti: kichik harf, kirill → lotin, barcha apostrof variantlari olib tashlanadi.
 * Kirill `е` doim `e` ga o'tadi (so'z boshida ham), shunda so'rov bo'lagi so'z o'rtasini topadi.
 * @example normalizeUz('Gʻuzor') === normalizeUz("G'uzor") === normalizeUz('Ғузор') // 'guzor'
 */
export function normalizeUz(s: string | null | undefined): string {
  return normalizeUzWithMap(s).text;
}
