export type PasswordScore = 0 | 1 | 2 | 3 | 4;
export type PasswordLabel = 'Juda zaif' | 'Zaif' | "O'rtacha" | 'Yaxshi' | 'Kuchli';

export interface PasswordStrength {
  score: PasswordScore;
  label: PasswordLabel;
  checks: {
    /** Kamida 8 belgi */
    length: boolean;
    lower: boolean;
    upper: boolean;
    digit: boolean;
    /** Harf, raqam yoki bo'shliq bo'lmagan belgi */
    symbol: boolean;
  };
}

const LABELS: readonly PasswordLabel[] = ['Juda zaif', 'Zaif', "O'rtacha", 'Yaxshi', 'Kuchli'];

/**
 * Parol kuchliligini baholaydi. Turlar (kichik, katta harf, raqam, belgi) soni − 1,
 * 12+ va 16+ belgi uchun +1 dan. 8 belgidan qisqa parol 1 dan oshmaydi. Kirill harflari ham hisoblanadi.
 * @example passwordStrength('Parol123!').label // 'Yaxshi'
 */
export function passwordStrength(pw: string | null | undefined): PasswordStrength {
  const s = pw ?? '';
  const len = [...s].length;
  const checks = {
    length: len >= 8,
    lower: /\p{Ll}/u.test(s),
    upper: /\p{Lu}/u.test(s),
    digit: /\p{Nd}/u.test(s),
    symbol: /[^\p{L}\p{N}\s]/u.test(s),
  };
  const variety = [checks.lower, checks.upper, checks.digit, checks.symbol].filter(Boolean).length;
  let score: number;
  if (!checks.length) {
    score = variety >= 3 ? 1 : 0;
  } else {
    score = Math.max(1, variety - 1 + (len >= 12 ? 1 : 0) + (len >= 16 ? 1 : 0));
  }
  const clamped = Math.min(score, 4) as PasswordScore;
  return { score: clamped, label: LABELS[clamped] as PasswordLabel, checks };
}
