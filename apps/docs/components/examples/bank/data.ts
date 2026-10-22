import type { UzOperatorCode } from '@akhatmirzo/core';

/*
 * Bank ilovasi uchun statik ma'lumotlar. Hammasi soxta, lekin real ko'rinadi: kartalar Luhn
 * tekshiruvidan o'tadi, operatsiyalar seed'li generator bilan yaratiladi (har safar bir xil).
 */

/* ---------- Turlar ---------- */

export type CardBrand = 'uzcard' | 'humo' | 'visa' | 'mastercard';
export type CardTheme = 'indigo' | 'emerald' | 'slate' | 'rose' | 'sky' | 'amber';

export interface BankCard {
  id: string;
  name: string;
  brand: CardBrand;
  /** 16 raqam, bo'shliqsiz */
  number: string;
  /** "MM/YY" */
  expiry: string;
  holder: string;
  balance: number;
  theme: CardTheme;
  blocked: boolean;
}

export type CategoryId =
  | 'food'
  | 'cafe'
  | 'transport'
  | 'shopping'
  | 'utilities'
  | 'mobile'
  | 'health'
  | 'entertainment'
  | 'transfers'
  | 'income';

export type TxKind = 'purchase' | 'payment' | 'transfer' | 'income';
export type TxStatus = 'success' | 'pending' | 'failed';

export interface Transaction {
  id: string;
  /** ISO sana */
  date: string;
  title: string;
  description: string;
  /** Manfiy — chiqim, musbat — kirim */
  amount: number;
  fee: number;
  category: CategoryId;
  kind: TxKind;
  status: TxStatus;
  cardId: string;
  /** Qabul qiluvchi / jo'natuvchi: karta yoki telefon (yashirilgan) */
  counterparty?: string;
  comment?: string;
}

export interface Contact {
  id: string;
  name: string;
  card: string;
  phone: string;
}

export interface Category {
  id: CategoryId;
  label: string;
}

export const categories: Record<CategoryId, Category> = {
  food: { id: 'food', label: 'Oziq-ovqat' },
  cafe: { id: 'cafe', label: 'Kafe va restoranlar' },
  transport: { id: 'transport', label: 'Transport' },
  shopping: { id: 'shopping', label: 'Xaridlar' },
  utilities: { id: 'utilities', label: 'Kommunal' },
  mobile: { id: 'mobile', label: 'Aloqa va internet' },
  health: { id: 'health', label: 'Salomatlik' },
  entertainment: { id: 'entertainment', label: "Ko'ngilochar" },
  transfers: { id: 'transfers', label: "O'tkazmalar" },
  income: { id: 'income', label: 'Kirim' },
};

export const brandLabels: Record<CardBrand, string> = {
  uzcard: 'Uzcard',
  humo: 'Humo',
  visa: 'Visa',
  mastercard: 'Mastercard',
};

/* ---------- Yordamchilar ---------- */

/** Seed'li tasodifiy sonlar (mulberry32) — har safar bir xil ketma-ketlik */
export function createRandom(seed: number) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min: number, max: number) => Math.floor(next() * (max - min + 1)) + min,
    pick: <T>(items: readonly T[]): T => items[Math.floor(next() * items.length)]!,
    chance: (p: number) => next() < p,
  };
}

/** Satrdan barqaror son (soxta "qidiruv" natijalari uchun) */
export function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** 15 raqamga Luhn nazorat raqamini qo'shadi */
export function withLuhn(first15: string) {
  let sum = 0;
  for (let i = 0; i < 15; i++) {
    let d = Number(first15[14 - i]);
    if (i % 2 === 0) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return first15 + String((10 - (sum % 10)) % 10);
}

/** "8600 •••• •••• 1234" */
export const maskCard = (n: string) => `${n.slice(0, 4)} •••• •••• ${n.slice(-4)}`;
/** "•• 1234" */
export const shortCard = (n: string) => `•• ${n.slice(-4)}`;

/** Summani butun so'mga yaxlitlaydi (100 ga karrali — real cheklardagidek) */
const round100 = (n: number) => Math.round(n / 100) * 100;

/* ---------- Kartalar ---------- */

export const DEMO_USER = { name: 'Sardor Karimov', phone: '901234567' };

export const initialCards: BankCard[] = [
  {
    id: 'card-uzcard',
    name: 'Asosiy karta',
    brand: 'uzcard',
    number: withLuhn('860004921387452'),
    expiry: '09/28',
    holder: 'SARDOR KARIMOV',
    balance: 4_850_000,
    theme: 'indigo',
    blocked: false,
  },
  {
    id: 'card-humo',
    name: 'Ish haqi kartasi',
    brand: 'humo',
    number: withLuhn('986012573390418'),
    expiry: '03/27',
    holder: 'SARDOR KARIMOV',
    balance: 12_340_500,
    theme: 'emerald',
    blocked: false,
  },
  {
    id: 'card-visa',
    name: 'Sayohat uchun',
    brand: 'visa',
    number: withLuhn('427816004421937'),
    expiry: '11/29',
    holder: 'SARDOR KARIMOV',
    balance: 2_150_000,
    theme: 'slate',
    blocked: false,
  },
];

/** Karta qo'shish formasida sinash uchun to'g'ri raqamlar */
export const testCardNumbers = [
  withLuhn('860031045521778'),
  withLuhn('986035500142296'),
  withLuhn('400012345678901'),
];

/* ---------- Kontaktlar (saqlangan qabul qiluvchilar) ---------- */

export const contacts: Contact[] = [
  { id: 'c1', name: 'Aziz Rahimov', card: withLuhn('860012457788310'), phone: '911234567' },
  { id: 'c2', name: 'Dilnoza Yusupova', card: withLuhn('986014203367729'), phone: '935557711' },
  { id: 'c3', name: 'Jasur Toshmatov', card: withLuhn('860049912034568'), phone: '977001122' },
  { id: 'c4', name: 'Malika Saidova', card: withLuhn('986026671100453'), phone: '998887766' },
  { id: 'c5', name: 'Bekzod Ergashev', card: withLuhn('860077314209931'), phone: '330204455' },
];

const FIRST_NAMES = [
  'Akmal',
  'Nodira',
  'Sherzod',
  'Gulnora',
  'Otabek',
  'Shahnoza',
  'Rustam',
  'Kamola',
  "Ulug'bek",
  'Feruza',
  'Javohir',
  'Madina',
];
const LAST_INITIALS = [
  'A.',
  'B.',
  'E.',
  'K.',
  'M.',
  'N.',
  'Q.',
  'R.',
  'S.',
  'T.',
  'U.',
  'X.',
  'Y.',
];

/** Qabul qiluvchi ismi: bank odatda familiyani qisqartirib ko'rsatadi */
export function recipientName(key: string) {
  const known = contacts.find((c) => c.card === key || c.phone === key);
  if (known) {
    const [first, last = ''] = known.name.split(' ');
    return `${first} ${last.charAt(0)}.`;
  }
  const h = hashString(key);
  return `${FIRST_NAMES[h % FIRST_NAMES.length]} ${LAST_INITIALS[(h >>> 8) % LAST_INITIALS.length]}`;
}

/* ---------- To'lov xizmatlari ---------- */

export type ServiceGroup = 'mobile' | 'internet' | 'utilities' | 'government';

export type ServiceAccount =
  | { type: 'phone'; label: string }
  | { type: 'mask'; label: string; mask: string; placeholder: string; uppercase?: boolean };

export interface PaymentService {
  id: string;
  group: ServiceGroup;
  title: string;
  provider: string;
  account: ServiceAccount;
  /** Hisob raqami bo'yicha qarzdorlik tekshiriladi */
  debtLookup?: boolean;
  presets: number[];
  min: number;
  max: number;
}

export const serviceGroups: { id: ServiceGroup; title: string; description: string }[] = [
  { id: 'mobile', title: 'Mobil aloqa', description: 'Beeline, Ucell, Mobiuz, Uzmobile' },
  { id: 'internet', title: 'Internet', description: 'Uzonline, Sarkor, TPS, Comnet' },
  { id: 'utilities', title: 'Kommunal', description: 'Elektr, gaz, suv, chiqindi' },
  { id: 'government', title: 'Davlat xizmatlari', description: 'Jarimalar, soliqlar, boj' },
];

export const services: PaymentService[] = [
  {
    id: 'mobile',
    group: 'mobile',
    title: 'Mobil aloqa',
    provider: 'Operator raqamdan aniqlanadi',
    account: { type: 'phone', label: 'Telefon raqami' },
    presets: [10_000, 30_000, 50_000, 100_000],
    min: 1_000,
    max: 2_000_000,
  },
  ...(
    [
      ['uzonline', 'Uzonline', 'Uztelekom AK'],
      ['sarkor', 'Sarkor Telecom', 'Sarkor Telecom MChJ'],
      ['tps', 'TPS', 'TPS MChJ'],
      ['comnet', 'Comnet', 'Comnet MChJ'],
    ] as const
  ).map(([id, title, provider]): PaymentService => ({
    id,
    group: 'internet',
    title,
    provider,
    account: {
      type: 'mask',
      label: 'Login yoki shartnoma raqami',
      mask: '9999999',
      placeholder: '4410293',
    },
    presets: [99_000, 149_000, 199_000],
    min: 5_000,
    max: 5_000_000,
  })),
  {
    id: 'electricity',
    group: 'utilities',
    title: 'Elektr energiya',
    provider: 'Hududiy elektr tarmoqlari',
    account: {
      type: 'mask',
      label: 'Shaxsiy hisob raqami',
      mask: '9999999999',
      placeholder: '4021783310',
    },
    debtLookup: true,
    presets: [],
    min: 1_000,
    max: 10_000_000,
  },
  {
    id: 'gas',
    group: 'utilities',
    title: 'Tabiiy gaz',
    provider: 'Hududgaztaminot',
    account: {
      type: 'mask',
      label: 'Shaxsiy hisob raqami',
      mask: '99999999',
      placeholder: '17204455',
    },
    debtLookup: true,
    presets: [],
    min: 1_000,
    max: 10_000_000,
  },
  {
    id: 'water',
    group: 'utilities',
    title: 'Ichimlik suvi',
    provider: 'Suvsoz',
    account: { type: 'mask', label: 'Abonent raqami', mask: '999999-99', placeholder: '310245-07' },
    debtLookup: true,
    presets: [],
    min: 1_000,
    max: 5_000_000,
  },
  {
    id: 'waste',
    group: 'utilities',
    title: 'Chiqindi olib ketish',
    provider: 'Toza hudud',
    account: { type: 'mask', label: 'Abonent raqami', mask: '9999999', placeholder: '7701234' },
    debtLookup: true,
    presets: [],
    min: 1_000,
    max: 2_000_000,
  },
  {
    id: 'fines',
    group: 'government',
    title: 'YHXBB jarimalari',
    provider: "Yo'l harakati xavfsizligi xizmati",
    account: {
      type: 'mask',
      label: 'Qaror raqami',
      mask: 'AA 9999999',
      placeholder: 'TN 1234567',
      uppercase: true,
    },
    debtLookup: true,
    presets: [],
    min: 1_000,
    max: 50_000_000,
  },
  {
    id: 'tax',
    group: 'government',
    title: "Mol-mulk solig'i",
    provider: "Soliq qo'mitasi",
    account: { type: 'mask', label: 'STIR (INN)', mask: '999 999 999', placeholder: '512 345 678' },
    debtLookup: true,
    presets: [],
    min: 1_000,
    max: 50_000_000,
  },
  {
    id: 'duty',
    group: 'government',
    title: 'Davlat boji',
    provider: 'Davlat xizmatlari markazi',
    account: {
      type: 'mask',
      label: 'Hisob-faktura raqami',
      mask: '9999-999999',
      placeholder: '2026-104512',
    },
    presets: [102_000, 204_000, 340_000],
    min: 1_000,
    max: 20_000_000,
  },
];

export const findService = (id: string) => services.find((s) => s.id === id);

export const operators: Record<UzOperatorCode, string> = {
  '90': 'Beeline',
  '91': 'Beeline',
  '93': 'Ucell',
  '94': 'Ucell',
  '50': 'Ucell',
  '97': 'Mobiuz',
  '88': 'Mobiuz',
  '95': 'Uzmobile',
  '99': 'Uzmobile',
  '77': 'Uzmobile',
  '55': 'Uzmobile',
  '33': 'Humans',
  '98': 'Perfectum',
};

export interface Bill {
  holder: string;
  address: string;
  debt: number;
}

const STREETS = [
  'Chilonzor 9-kv, 14-uy',
  'Yunusobod 4-mavze, 22-uy',
  "Mirzo Ulug'bek, Buyuk Ipak yo'li 58",
  'Sergeli 6-kv, 3-uy',
  "Olmazor, Qorasaroy ko'chasi 112",
];

/** Soxta billing: hisob raqami bo'yicha abonent va qarzdorlik */
export function lookupBill(service: PaymentService, account: string): Bill {
  const h = hashString(service.id + account);
  return {
    holder: `${FIRST_NAMES[h % FIRST_NAMES.length]} ${LAST_INITIALS[(h >>> 4) % LAST_INITIALS.length]}`,
    address: `Toshkent sh., ${STREETS[(h >>> 8) % STREETS.length]}`,
    debt: h % 6 === 0 ? 0 : round100(20_000 + ((h >>> 12) % 400) * 900),
  };
}

export interface Favorite {
  id: string;
  serviceId: string;
  label: string;
  account: string;
  amount?: number;
}

export const initialFavorites: Favorite[] = [
  { id: 'f1', serviceId: 'electricity', label: 'Uy — elektr', account: '4021783310' },
  { id: 'f2', serviceId: 'mobile', label: 'Onamning raqami', account: '935557711', amount: 50_000 },
  { id: 'f3', serviceId: 'uzonline', label: 'Uy interneti', account: '4410293', amount: 149_000 },
];

/* ---------- Komissiya va limitlar ---------- */

export const TRANSFER_MIN = 1_000;
export const TRANSFER_MAX = 30_000_000;

/** Komissiya: bir xil tizim ichida bepul, Uzcard ↔ Humo 0.5%, xalqaro kartadan 1% */
export function transferFeeRate(from: CardBrand, to: CardBrand | null) {
  if (from === 'visa' || from === 'mastercard') return 0.01;
  if (!to || to === from) return 0;
  return 0.005;
}

export const calcFee = (amount: number, rate: number) => round100(amount * rate);

/* ---------- Operatsiyalar generatori ---------- */

interface Merchant {
  title: string;
  description: string;
  min: number;
  max: number;
}

const merchants: Partial<Record<CategoryId, Merchant[]>> = {
  food: [
    { title: 'Korzinka', description: 'Supermarket, Toshkent', min: 25_000, max: 450_000 },
    { title: 'Makro', description: 'Supermarket', min: 30_000, max: 380_000 },
    { title: 'Havas', description: "Oziq-ovqat do'koni", min: 15_000, max: 220_000 },
    { title: 'Baraka Market', description: 'Supermarket', min: 20_000, max: 300_000 },
  ],
  cafe: [
    { title: 'Evos', description: 'Fast food', min: 35_000, max: 160_000 },
    { title: 'Les Ailes', description: 'Fast food', min: 40_000, max: 180_000 },
    { title: 'Safia', description: 'Qandolatxona', min: 25_000, max: 140_000 },
    { title: 'Oqtepa Lavash', description: 'Fast food', min: 30_000, max: 120_000 },
    { title: 'Caravan', description: 'Restoran', min: 120_000, max: 480_000 },
  ],
  transport: [
    { title: 'Yandex Go', description: 'Taksi', min: 12_000, max: 65_000 },
    {
      title: 'Toshkent metropoliteni',
      description: "ATTO karta to'ldirish",
      min: 20_000,
      max: 50_000,
    },
    { title: 'Mustang AYOQSH', description: "Yoqilg'i", min: 90_000, max: 400_000 },
  ],
  shopping: [
    { title: 'Uzum Market', description: 'Onlayn xarid', min: 60_000, max: 1_200_000 },
    { title: 'Texnomart', description: 'Maishiy texnika', min: 250_000, max: 2_400_000 },
    { title: 'Mediapark', description: 'Elektronika', min: 150_000, max: 1_900_000 },
    { title: 'Samarqand Darvoza', description: 'Savdo markazi', min: 120_000, max: 900_000 },
  ],
  utilities: [
    { title: 'Hududgaztaminot', description: "Tabiiy gaz to'lovi", min: 40_000, max: 260_000 },
    {
      title: 'Elektr energiya',
      description: 'Hududiy elektr tarmoqlari',
      min: 60_000,
      max: 320_000,
    },
    { title: 'Suvsoz', description: "Ichimlik suvi to'lovi", min: 20_000, max: 90_000 },
  ],
  mobile: [
    { title: 'Beeline', description: 'Mobil aloqa, +998 90 123 45 67', min: 30_000, max: 100_000 },
    { title: 'Uzonline', description: 'Uy interneti', min: 149_000, max: 149_000 },
    { title: 'Ucell', description: 'Mobil aloqa, +998 93 555 77 11', min: 20_000, max: 60_000 },
  ],
  health: [
    { title: 'Dori-Darmon', description: 'Dorixona', min: 15_000, max: 280_000 },
    { title: 'Akfa Medline', description: 'Klinika', min: 150_000, max: 900_000 },
  ],
  entertainment: [
    { title: 'Magic City', description: "Ko'ngilochar park", min: 60_000, max: 350_000 },
    { title: 'Cinematica', description: 'Kinoteatr', min: 45_000, max: 160_000 },
    { title: 'Yandex Plus', description: 'Obuna', min: 29_000, max: 29_000 },
  ],
};

/** Har bir xarajat toifasining ehtimollik og'irligi */
const spendWeights: [CategoryId, number][] = [
  ['food', 26],
  ['cafe', 18],
  ['transport', 20],
  ['shopping', 5],
  ['utilities', 5],
  ['mobile', 6],
  ['health', 5],
  ['entertainment', 5],
  ['transfers', 6],
];

const DAY = 86_400_000;
const HISTORY_DAYS = 200;

/**
 * Oxirgi ~200 kun uchun 550+ operatsiya. `now` — hozirgi vaqt: sanalar unga nisbatan, shuning
 * uchun "Bugun", "Kecha" guruhlari doim bor. Seed o'zgarmas — tarix har safar bir xil.
 */
export function generateTransactions(now: Date): Transaction[] {
  const rnd = createRandom(20261022);
  const totalWeight = spendWeights.reduce((s, [, w]) => s + w, 0);
  const pickCategory = () => {
    let r = rnd.next() * totalWeight;
    for (const [id, w] of spendWeights) {
      r -= w;
      if (r <= 0) return id;
    }
    return 'food' as CategoryId;
  };
  const spendCards = initialCards;
  const txs: Transaction[] = [];
  let seq = 0;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  for (let day = 0; day < HISTORY_DAYS; day++) {
    const dayStart = today - day * DAY;
    const date = new Date(dayStart);
    const at = (hour: number, minute: number) => new Date(dayStart + (hour * 60 + minute) * 60_000);
    const push = (tx: Omit<Transaction, 'id' | 'date'>, when: Date) => {
      if (when.getTime() > now.getTime()) return;
      seq++;
      txs.push({ ...tx, id: `TX${String(48_210_000 + seq * 37)}`, date: when.toISOString() });
    };

    // Ish haqi va avans — oyning 5 va 20-kunlari
    if (date.getDate() === 5 || date.getDate() === 20) {
      push(
        {
          title: 'Artel Electronics MChJ',
          description: date.getDate() === 5 ? 'Ish haqi' : 'Avans',
          amount: date.getDate() === 5 ? 9_400_000 : 5_200_000,
          fee: 0,
          category: 'income',
          kind: 'income',
          status: 'success',
          cardId: 'card-humo',
        },
        at(10, rnd.int(0, 59)),
      );
    }

    const count = rnd.int(1, 4);
    for (let i = 0; i < count; i++) {
      const when = at(rnd.int(7, 22), rnd.int(0, 59));
      const card = rnd.chance(0.55) ? spendCards[0]! : rnd.pick(spendCards);
      const category = pickCategory();
      const failed = rnd.chance(0.02);

      if (category === 'transfers') {
        const contact = rnd.pick(contacts);
        const amount = round100(rnd.int(30, 800) * 1000);
        push(
          {
            title: contact.name,
            description: "Kartadan kartaga o'tkazma",
            amount: -amount,
            fee: calcFee(amount, transferFeeRate(card.brand, 'humo')),
            category,
            kind: 'transfer',
            status: failed ? 'failed' : 'success',
            cardId: card.id,
            counterparty: maskCard(contact.card),
          },
          when,
        );
        continue;
      }

      const merchant = rnd.pick(merchants[category]!);
      push(
        {
          title: merchant.title,
          description: merchant.description,
          amount: -round100(merchant.min + rnd.next() * (merchant.max - merchant.min)),
          fee: 0,
          category,
          kind: category === 'utilities' || category === 'mobile' ? 'payment' : 'purchase',
          // Bugungi oxirgi xarid hali "kutilmoqda" bo'lishi mumkin
          status: failed ? 'failed' : day === 0 && i === 0 ? 'pending' : 'success',
          cardId: card.id,
        },
        when,
      );
    }

    // Do'stlardan kelgan o'tkazmalar va keshbek
    if (rnd.chance(0.12)) {
      const contact = rnd.pick(contacts);
      push(
        {
          title: contact.name,
          description: "Kiruvchi o'tkazma",
          amount: round100(rnd.int(50, 900) * 1000),
          fee: 0,
          category: 'income',
          kind: 'transfer',
          status: 'success',
          cardId: rnd.pick(spendCards).id,
          counterparty: maskCard(contact.card),
        },
        at(rnd.int(9, 21), rnd.int(0, 59)),
      );
    }
    if (date.getDate() === 1) {
      push(
        {
          title: 'Keshbek',
          description: "O'tgan oy xaridlari uchun 1%",
          amount: round100(rnd.int(25, 90) * 1000),
          fee: 0,
          category: 'income',
          kind: 'income',
          status: 'success',
          cardId: 'card-uzcard',
        },
        at(9, 0),
      );
    }
  }

  return txs.sort((a, b) => b.date.localeCompare(a.date));
}

/** Yangi tranzaksiya ID'si (foydalanuvchi amallari uchun) */
export const newTxId = () => `TX${Date.now().toString().slice(-9)}`;
