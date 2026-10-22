import type { Metadata } from 'next';

/** Namuna sahifalari sarlavhasi: "Savatcha · Bozorcha" (ildiz shablonga " — sayt nomi" qo'shiladi) */
export function checkoutMetadata(page?: string): Metadata {
  return {
    title: page ? `${page} · Bozorcha` : "Bozorcha — onlayn do'kon",
    description:
      "Savatcha va to'lov namunasi: do'kon vitrinasi, savatcha, yetkazib berish, karta bilan to'lov va buyurtma tasdig'i.",
    robots: { index: false },
  };
}
