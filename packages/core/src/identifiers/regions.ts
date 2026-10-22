/** Hudud identifikatori (barqaror, lotin slug). */
export type UzRegionId =
  | 'karakalpakstan'
  | 'andijan'
  | 'bukhara'
  | 'jizzakh'
  | 'kashkadarya'
  | 'navoi'
  | 'namangan'
  | 'samarkand'
  | 'surkhandarya'
  | 'syrdarya'
  | 'tashkent'
  | 'fergana'
  | 'khorezm'
  | 'tashkent-city';

export interface UzRegion {
  /** Barqaror identifikator — saqlash va `value` uchun */
  id: UzRegionId;
  /** O'zbekcha nomi (lotin, tipografik `ʻ`) */
  name: string;
  /** O'zbekcha nomi (kirill) */
  nameCyr: string;
  /** Ma'muriy markazi (lotin) */
  center: string;
  /** Avtomobil raqamidagi hudud kodlari (hududga ajratilgan diapazon, masalan `01`–`09`) */
  plateCodes: readonly string[];
}

/** `from`–`to` oralig'idagi ikki xonali kodlar: plateRange(1, 3) → ['01', '02', '03'] */
function plateRange(from: number, to: number): string[] {
  const codes: string[] = [];
  for (let n = from; n <= to; n++) codes.push(String(n).padStart(2, '0'));
  return codes;
}

/**
 * O'zbekistonning 14 ta hududi: Qoraqalpogʻiston Respublikasi, 12 viloyat va Toshkent shahri
 * (rasmiy tartibda).
 * @example UZ_REGIONS.find((r) => r.id === 'fergana')?.name // 'Fargʻona viloyati'
 */
export const UZ_REGIONS: readonly UzRegion[] = [
  {
    id: 'karakalpakstan',
    name: 'Qoraqalpogʻiston Respublikasi',
    nameCyr: 'Қорақалпоғистон Республикаси',
    center: 'Nukus',
    plateCodes: plateRange(95, 99),
  },
  {
    id: 'andijan',
    name: 'Andijon viloyati',
    nameCyr: 'Андижон вилояти',
    center: 'Andijon',
    plateCodes: plateRange(60, 69),
  },
  {
    id: 'bukhara',
    name: 'Buxoro viloyati',
    nameCyr: 'Бухоро вилояти',
    center: 'Buxoro',
    plateCodes: plateRange(80, 84),
  },
  {
    id: 'jizzakh',
    name: 'Jizzax viloyati',
    nameCyr: 'Жиззах вилояти',
    center: 'Jizzax',
    plateCodes: plateRange(25, 29),
  },
  {
    id: 'kashkadarya',
    name: 'Qashqadaryo viloyati',
    nameCyr: 'Қашқадарё вилояти',
    center: 'Qarshi',
    plateCodes: plateRange(70, 74),
  },
  {
    id: 'navoi',
    name: 'Navoiy viloyati',
    nameCyr: 'Навоий вилояти',
    center: 'Navoiy',
    plateCodes: plateRange(85, 89),
  },
  {
    id: 'namangan',
    name: 'Namangan viloyati',
    nameCyr: 'Наманган вилояти',
    center: 'Namangan',
    plateCodes: plateRange(50, 59),
  },
  {
    id: 'samarkand',
    name: 'Samarqand viloyati',
    nameCyr: 'Самарқанд вилояти',
    center: 'Samarqand',
    plateCodes: plateRange(30, 39),
  },
  {
    id: 'surkhandarya',
    name: 'Surxondaryo viloyati',
    nameCyr: 'Сурхондарё вилояти',
    center: 'Termiz',
    plateCodes: plateRange(75, 79),
  },
  {
    id: 'syrdarya',
    name: 'Sirdaryo viloyati',
    nameCyr: 'Сирдарё вилояти',
    center: 'Guliston',
    plateCodes: plateRange(20, 24),
  },
  {
    id: 'tashkent',
    name: 'Toshkent viloyati',
    nameCyr: 'Тошкент вилояти',
    // 2017-yildan ma'muriy markaz — Nurafshon (avval Toshkent shahri)
    center: 'Nurafshon',
    plateCodes: plateRange(10, 19),
  },
  {
    id: 'fergana',
    name: 'Fargʻona viloyati',
    nameCyr: 'Фарғона вилояти',
    center: 'Fargʻona',
    plateCodes: plateRange(40, 49),
  },
  {
    id: 'khorezm',
    name: 'Xorazm viloyati',
    nameCyr: 'Хоразм вилояти',
    center: 'Urganch',
    plateCodes: plateRange(90, 94),
  },
  {
    id: 'tashkent-city',
    name: 'Toshkent shahri',
    nameCyr: 'Тошкент шаҳри',
    center: 'Toshkent',
    plateCodes: plateRange(1, 9),
  },
];

/**
 * Avtomobil raqamidagi hudud kodi bo'yicha hududni topadi. Raqam berilsa, 2 xonagacha `0` bilan
 * to'ldiriladi (`1` → `'01'`). Topilmasa — `null`.
 * @example regionByPlateCode('01')?.id // 'tashkent-city'
 * @example regionByPlateCode(95)?.name // 'Qoraqalpogʻiston Respublikasi'
 * @example regionByPlateCode('02')?.id // 'tashkent-city' (01–09 diapazoni)
 * @example regionByPlateCode('00') // null
 */
export function regionByPlateCode(code: string | number | null | undefined): UzRegion | null {
  if (code == null) return null;
  const key = String(code).trim().padStart(2, '0');
  return UZ_REGIONS.find((r) => r.plateCodes.includes(key)) ?? null;
}
