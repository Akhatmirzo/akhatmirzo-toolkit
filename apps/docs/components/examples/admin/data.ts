/**
 * Do'kon admin paneli uchun statik (soxta) ma'lumotlar.
 *
 * Hammasi seed'li tasodifiy sonlar generatori bilan yasaladi: server va brauzerda natija bir xil
 * (hydration xatosi yo'q), har safar sahifa ochilganda ham bir xil. "Hozirgi vaqt" ham qotirilgan —
 * `DEMO_NOW`, shuning uchun "3 kun oldin" kabi matnlar ham barqaror.
 */

/** Demo uchun "hozir" — barcha sanalar shunga nisbatan */
export const DEMO_NOW = new Date(2026, 9, 22, 15, 40);

const DAY = 86_400_000;

/* ---------- Seed'li tasodif ---------- */

/** mulberry32 — kichik va tez PRNG; bir xil seed → bir xil ketma-ketlik */
export function createRandom(seed: number) {
  let s = seed >>> 0;
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min: number, max: number) => Math.floor(next() * (max - min + 1)) + min,
    pick: <T>(items: readonly T[]): T => items[Math.floor(next() * items.length)] as T,
    chance: (p: number) => next() < p,
  };
}

/* ---------- Turlar ---------- */

export type CategoryId =
  'electronics' | 'appliances' | 'clothing' | 'shoes' | 'beauty' | 'home' | 'kids' | 'food';

export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'click' | 'payme' | 'uzcard' | 'humo' | 'cash';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: CategoryId;
  /** so'm */
  price: number;
  stock: number;
  description: string;
  active: boolean;
  /** data: URL (foydalanuvchi yuklagan rasm); bo'lmasa toifa ikonkasi chiziladi */
  image?: string;
  /** Jami sotilgan (dona) */
  sold: number;
  /** Ommabopligi — hisobotlarda ulushni hisoblash uchun */
  popularity: number;
  createdAt: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  region: string;
  city: string;
  createdAt: number;
  note?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  category: CategoryId;
  price: number;
  qty: number;
}

export interface OrderEvent {
  status: OrderStatus;
  at: number;
  note?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  region: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  delivery: number;
  total: number;
  payment: PaymentMethod;
  status: OrderStatus;
  createdAt: number;
  history: OrderEvent[];
  comment?: string;
}

export interface DailyStat {
  /** Kun boshi (ms) */
  date: number;
  revenue: number;
  orders: number;
  newCustomers: number;
  byCategory: Record<CategoryId, number>;
}

export interface AdminNotification {
  id: string;
  kind: 'order' | 'stock' | 'review' | 'customer';
  title: string;
  description: string;
  at: number;
  read: boolean;
  /** Bosilganda o'tiladigan sahifa (admin ichidagi yo'l) */
  href?: string;
}

export interface StoreSettings {
  name: string;
  email: string;
  phone: string;
  region: string;
  address: string;
  about: string;
  currency: 'UZS' | 'USD';
  language: 'uz' | 'ru';
  payments: Record<PaymentMethod, boolean>;
  minOrder: number | null;
  taxIncluded: boolean;
  deliveryFee: number | null;
  freeDeliveryFrom: number | null;
  deliveryTime: 'same-day' | 'next-day' | '2-3-days';
  deliveryRegions: string[];
  pickup: boolean;
  notifyNewOrderEmail: boolean;
  notifyNewOrderSms: boolean;
  notifyNewOrderTelegram: boolean;
  lowStockAlert: boolean;
  lowStockThreshold: number | null;
  dailyReport: boolean;
}

/* ---------- Ma'lumotnomalar ---------- */

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'electronics', label: 'Elektronika' },
  { id: 'appliances', label: 'Maishiy texnika' },
  { id: 'clothing', label: 'Kiyim-kechak' },
  { id: 'shoes', label: 'Poyabzal' },
  { id: 'beauty', label: "Go'zallik" },
  { id: 'home', label: "Uy va bog'" },
  { id: 'kids', label: 'Bolalar uchun' },
  { id: 'food', label: 'Oziq-ovqat' },
];

export const categoryLabel = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)?.label ?? id;

export const REGIONS = [
  'Toshkent sh.',
  'Toshkent vil.',
  'Samarqand',
  'Buxoro',
  "Farg'ona",
  'Andijon',
  'Namangan',
  'Qashqadaryo',
  'Surxondaryo',
  'Xorazm',
  'Navoiy',
  'Jizzax',
  'Sirdaryo',
  "Qoraqalpog'iston",
] as const;

const CITIES: Record<string, string[]> = {
  'Toshkent sh.': [
    'Chilonzor',
    'Yunusobod',
    "Mirzo Ulug'bek",
    'Yakkasaroy',
    'Sergeli',
    'Shayxontohur',
  ],
  'Toshkent vil.': ['Chirchiq', 'Olmaliq', 'Angren', 'Nurafshon'],
  Samarqand: ['Samarqand', "Kattaqo'rg'on", 'Urgut'],
  Buxoro: ['Buxoro', "G'ijduvon", 'Kogon'],
  "Farg'ona": ["Farg'ona", "Marg'ilon", "Qo'qon", 'Rishton'],
  Andijon: ['Andijon', 'Asaka', 'Xonobod'],
  Namangan: ['Namangan', 'Chust', 'Kosonsoy'],
  Qashqadaryo: ['Qarshi', 'Shahrisabz', 'Kitob'],
  Surxondaryo: ['Termiz', 'Denov', 'Sherobod'],
  Xorazm: ['Urganch', 'Xiva'],
  Navoiy: ['Navoiy', 'Zarafshon'],
  Jizzax: ['Jizzax', 'Zomin'],
  Sirdaryo: ['Guliston', 'Yangiyer'],
  "Qoraqalpog'iston": ['Nukus', "Xo'jayli"],
};

const STREETS = [
  'Amir Temur',
  'Mustaqillik',
  'Navoiy',
  'Bobur',
  "Mirzo Ulug'bek",
  "Buyuk Ipak Yo'li",
  'Shota Rustaveli',
  'Islom Karimov',
  'Bunyodkor',
  'Labzak',
  'Afrosiyob',
  'Gulobod',
];

export const STATUS_ORDER: OrderStatus[] = [
  'new',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];
export const PAYMENT_METHODS: PaymentMethod[] = ['click', 'payme', 'uzcard', 'humo', 'cash'];

/* ---------- Mahsulotlar ---------- */

const PRODUCT_SEED: [CategoryId, string, number, string][] = [
  [
    'electronics',
    'Samsung Galaxy A55, 8/256 GB',
    4_890_000,
    'AMOLED 6,6" ekran, 50 MP kamera, 5000 mAh batareya. Rasmiy kafolat — 1 yil.',
  ],
  [
    'electronics',
    'Xiaomi Redmi Note 13 Pro',
    3_650_000,
    '200 MP kamera, 67 W tez quvvatlash, 120 Hz ekran.',
  ],
  [
    'electronics',
    'Apple AirPods Pro 2',
    3_290_000,
    'Faol shovqin bostirish, USB-C quvvatlash qutisi, 6 soatgacha tinglash.',
  ],
  [
    'electronics',
    'JBL Flip 6 kolonka',
    1_450_000,
    'Suvga chidamli (IP67), 12 soat ishlash, chuqur bass.',
  ],
  [
    'electronics',
    'Xiaomi Smart Band 9',
    459_000,
    'AMOLED ekran, puls va uyqu monitoringi, 21 kungacha batareya.',
  ],
  [
    'appliances',
    'Artel muzlatkich HD 455 FWEN',
    6_790_000,
    "No Frost tizimi, 350 l hajm, A+ energiya sinfi. O'zbekistonda ishlab chiqarilgan.",
  ],
  [
    'appliances',
    'Samsung kir yuvish mashinasi, 7 kg',
    5_450_000,
    "Inverter motor, bug' bilan yuvish, 1400 ayl/daq.",
  ],
  [
    'appliances',
    'Philips dazmol GC4567',
    899_000,
    "Bug' zarbasi 220 g, keramik taglik, avtomatik o'chish.",
  ],
  [
    'appliances',
    'Tefal multivarka RK8121',
    1_290_000,
    '45 ta dastur, 5 l idish, kechiktirilgan start.',
  ],
  [
    'appliances',
    'Dyson V12 changyutgich',
    8_990_000,
    'Simsiz, lazer bilan chang aniqlash, 60 daqiqagacha ishlash.',
  ],
  [
    'clothing',
    "Erkaklar paxta ko'ylagi",
    289_000,
    "100% o'zbek paxtasi, klassik bichim. O'lchamlar: S–XXL.",
  ],
  [
    'clothing',
    "Ayollar atlas ko'ylagi",
    549_000,
    "Marg'ilon atlasi, qo'lda tikilgan, zamonaviy bichim.",
  ],
  [
    'clothing',
    'Qishki kurtka (unisex)',
    1_190_000,
    "Suv o'tkazmaydigan mato, -25°C gacha issiq saqlaydi.",
  ],
  ['clothing', 'Klassik jinsi shim', 379_000, "Elastik denim, to'g'ri bichim, ko'k rang."],
  ['clothing', "Ipak ro'mol, Marg'ilon", 320_000, "Tabiiy ipak, an'anaviy abr naqshi, 90×90 sm."],
  ['shoes', 'Nike Air Max 270', 1_650_000, 'Yengil, havo yostiqli taglik, kundalik kiyish uchun.'],
  [
    'shoes',
    'Adidas Ultraboost Light',
    1_890_000,
    "Yugurish uchun, Boost taglik, nafas oluvchi to'qima.",
  ],
  ['shoes', 'Charm tufli, erkaklar', 690_000, 'Tabiiy charm, klassik uslub, qora va jigarrang.'],
  ['shoes', 'Bolalar krossovkasi', 315_000, "Yopishqoq bog'ich, yumshoq taglik, 26–35 o'lchamlar."],
  ['shoes', 'Uy shippagi', 89_000, 'Yumshoq, sirpanmaydigan taglik, yuviladi.'],
  ['beauty', 'Chanel Coco Mademoiselle, 50 ml', 1_950_000, 'Original atir, sharqona-gulli hid.'],
  [
    'beauty',
    'La Roche-Posay Cicaplast krem',
    189_000,
    'Tiklovchi balzam, sezgir teri uchun, 40 ml.',
  ],
  ['beauty', 'Kerastase shampuni, 250 ml', 459_000, 'Quruq va shikastlangan sochlar uchun.'],
  ['beauty', 'Dyson Supersonic fen', 6_490_000, 'Aqlli harorat nazorati, 5 ta nasadka.'],
  ['beauty', "MAC Ruby Woo lab bo'yog'i", 299_000, 'Mat qizil, uzoq saqlanadi.'],
  ['home', "Rishton sopol laganlar to'plami", 420_000, "Qo'lda chizilgan, 6 dona, ishqor naqsh."],
  [
    'home',
    'Samarqand gilami, 2×3 m',
    2_750_000,
    "Ipak-jun aralash, qo'lda to'qilgan, an'anaviy naqsh.",
  ],
  ['home', "Choynak to'plami, paxta naqsh", 265_000, 'Choynak, 6 piyola, kosa — chinni.'],
  ['home', 'Divan yostiqlari (4 dona)', 199_000, "Suzani naqshli g'iloflar, 45×45 sm."],
  ['home', "Fiskars bog' qaychisi", 245_000, "Po'lat tig', ergonomik dasta, 1 yil kafolat."],
  ['kids', 'LEGO City politsiya uchastkasi', 1_120_000, '668 detal, 6 yoshdan, 5 ta minifigura.'],
  ['kids', 'Chicco bolalar aravachasi', 3_450_000, "Yengil, bir qo'l bilan yig'iladi, 0–4 yosh."],
  ['kids', "Pampers tagliklari, 4-o'lcham, 76 dona", 219_000, '9–14 kg, 12 soatgacha quruqlik.'],
  ['kids', 'Magnitli konstruktor, 64 detal', 349_000, 'Rang-barang, 3 yoshdan, xavfsiz plastik.'],
  ['kids', 'Bolalar velosipedi 16"', 1_090_000, "Yordamchi g'ildiraklar, 4–7 yosh."],
  ['food', "Quritilgan o'rik, 1 kg", 85_000, "Farg'ona o'rigi, shakarsiz, tabiiy quritilgan."],
  ['food', "Bodom (Farg'ona), 1 kg", 140_000, "Po'chog'i olingan, qovurilmagan."],
  ['food', "Tog' asali, 1 kg", 160_000, "Zomin tog'laridan, tabiiy, sertifikatlangan."],
  ['food', "Ko'k choy №95, 500 g", 39_000, "Klassik o'zbek ko'k choyi."],
  ['food', 'Mayiz (Samarqand), 1 kg', 70_000, "Kishmish, urug'siz, yuvilgan."],
];

function generateProducts(): Product[] {
  const r = createRandom(2026);
  return PRODUCT_SEED.map(([category, name, price, description], i) => {
    // Bir nechta mahsulot ataylab kam yoki tugagan
    const stock = i % 9 === 4 ? 0 : i % 7 === 3 ? r.int(2, 8) : r.int(12, 140);
    const cheap = price < 500_000;
    return {
      id: `p${String(i + 1).padStart(3, '0')}`,
      sku: `CM-${category.slice(0, 3).toUpperCase()}-${String(1001 + i * 7)}`,
      name,
      category,
      price,
      stock,
      description,
      active: i !== 19 && i !== 33,
      sold: cheap ? r.int(180, 900) : r.int(20, 260),
      popularity: Number((0.5 + r.next() * 1.5).toFixed(2)),
      createdAt: DEMO_NOW.getTime() - r.int(20, 400) * DAY,
    };
  });
}

/* ---------- Mijozlar ---------- */

const MALE = [
  'Aziz',
  'Jasur',
  'Sardor',
  'Bekzod',
  'Otabek',
  'Sherzod',
  'Rustam',
  'Doniyor',
  'Jamshid',
  "Ulug'bek",
  'Farrux',
  'Akmal',
  'Bobur',
  'Islom',
  'Timur',
  'Sanjar',
];
const FEMALE = [
  'Dilnoza',
  'Malika',
  'Nilufar',
  'Gulnora',
  'Shahnoza',
  'Madina',
  'Zarina',
  'Kamola',
  'Sevara',
  'Mohira',
  'Feruza',
  'Nodira',
  'Laylo',
  'Durdona',
  'Charos',
  'Munisa',
];
const LAST = [
  'Karimov',
  'Rahimov',
  'Tursunov',
  'Yusupov',
  'Abdullayev',
  'Ismoilov',
  'Xolmatov',
  'Nazarov',
  'Saidov',
  'Qodirov',
  'Mirzayev',
  'Ergashev',
  'Hasanov',
  'Sobirov',
  'Aliyev',
  'Usmonov',
  "Jo'rayev",
  'Toshmatov',
];
const OPERATORS = ['90', '91', '93', '94', '95', '97', '98', '99', '33', '88', '77', '50'];

/** Lotin ismdan email uchun oddiy login */
const toLogin = (s: string) =>
  s
    .toLowerCase()
    .replace(/[ʻʼ'''`]/g, '')
    .replace(/\s+/g, '.');

function pickRegion(r: ReturnType<typeof createRandom>) {
  // Toshkent shahri ulushi kattaroq — real do'kondagidek
  return r.chance(0.38) ? 'Toshkent sh.' : r.pick(REGIONS);
}

function generateCustomers(): Customer[] {
  const r = createRandom(77);
  const used = new Set<string>();
  const list: Customer[] = [];
  while (list.length < 60) {
    const female = r.chance(0.5);
    const first = r.pick(female ? FEMALE : MALE);
    const last = r.pick(LAST) + (female ? 'a' : '');
    const name = `${first} ${last}`;
    if (used.has(name)) continue;
    used.add(name);
    const region = pickRegion(r);
    const domain = r.pick(['gmail.com', 'mail.ru', 'gmail.com', 'yandex.ru']);
    // Har 6-mijoz — so'nggi oyda ro'yxatdan o'tgan
    const days = list.length % 6 === 0 ? r.int(0, 28) : r.int(30, 500);
    list.push({
      id: `c${String(list.length + 1).padStart(3, '0')}`,
      name,
      phone: `${r.pick(OPERATORS)}${String(r.int(1_000_000, 9_999_999))}`,
      email: `${toLogin(first)}.${toLogin(last)}${r.chance(0.5) ? r.int(1, 99) : ''}@${domain}`,
      region,
      city: r.pick(CITIES[region] ?? [region]),
      createdAt: DEMO_NOW.getTime() - days * DAY - r.int(0, 20) * 3_600_000,
    });
  }
  return list;
}

/* ---------- Buyurtmalar ---------- */

const FREE_DELIVERY_FROM = 500_000;
const DELIVERY_FEE = 25_000;

function statusFor(ageHours: number, r: ReturnType<typeof createRandom>): OrderStatus {
  if (r.chance(0.06)) return 'cancelled';
  if (ageHours < 10) return 'new';
  if (ageHours < 30) return r.chance(0.5) ? 'new' : 'processing';
  if (ageHours < 72) return r.pick(['processing', 'shipped', 'shipped'] as const);
  if (ageHours < 120) return r.chance(0.4) ? 'shipped' : 'delivered';
  return 'delivered';
}

/** Holatgacha bo'lgan tarix: yangi → yig'ilmoqda → yo'lda → yetkazildi */
function buildHistory(status: OrderStatus, createdAt: number, r: ReturnType<typeof createRandom>) {
  const history: OrderEvent[] = [
    { status: 'new', at: createdAt, note: 'Buyurtma saytdan qabul qilindi' },
  ];
  if (status === 'cancelled') {
    history.push({
      status: 'cancelled',
      at: createdAt + r.int(1, 6) * 3_600_000,
      note: 'Mijoz bekor qildi',
    });
    return history;
  }
  const steps: [OrderStatus, string][] = [
    ['processing', "Ombordan yig'ilmoqda"],
    ['shipped', 'Kuryerga topshirildi'],
    ['delivered', 'Mijozga yetkazildi'],
  ];
  let at = createdAt;
  for (const [step, note] of steps) {
    if (STATUS_ORDER.indexOf(step) > STATUS_ORDER.indexOf(status)) break;
    at += r.int(2, 16) * 3_600_000;
    history.push({ status: step, at: Math.min(at, DEMO_NOW.getTime() - 60_000), note });
  }
  return history;
}

function generateOrders(products: Product[], customers: Customer[]): Order[] {
  const r = createRandom(10421);
  const orders: Order[] = [];
  let time = DEMO_NOW.getTime() - r.int(4, 25) * 60_000;
  for (let i = 0; i < 120; i++) {
    const customer = r.pick(customers);
    const count = r.chance(0.55) ? 1 : r.int(2, 3);
    const items: OrderItem[] = [];
    for (let k = 0; k < count; k++) {
      const p = r.pick(products);
      if (items.some((it) => it.productId === p.id)) continue;
      const qty = p.price < 200_000 ? r.int(1, 3) : r.chance(0.85) ? 1 : 2;
      items.push({ productId: p.id, name: p.name, category: p.category, price: p.price, qty });
    }
    const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);
    const delivery = subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE;
    const ageHours = (DEMO_NOW.getTime() - time) / 3_600_000;
    const status = statusFor(ageHours, r);
    orders.push({
      id: String(10421 - i),
      customerId: customer.id,
      customerName: customer.name,
      phone: customer.phone,
      region: customer.region,
      address: `${customer.city}, ${r.pick(STREETS)} ko'chasi, ${r.int(1, 120)}-uy${r.chance(0.5) ? `, ${r.int(1, 80)}-xonadon` : ''}`,
      items,
      subtotal,
      delivery,
      total: subtotal + delivery,
      payment: r.pick(['click', 'payme', 'payme', 'uzcard', 'humo', 'cash', 'click'] as const),
      status,
      createdAt: time,
      history: buildHistory(status, time, r),
      comment: r.chance(0.15)
        ? r.pick([
            "Eshik oldida qo'ng'iroq qiling",
            'Kechqurun 18:00 dan keyin',
            "Sovg'a sifatida o'rab bering",
          ])
        : undefined,
    });
    // Buyurtmalar orasidagi vaqt: 30 kun ichida taxminan 120 ta
    time -= r.int(40, 680) * 60_000;
  }
  return orders;
}

/* ---------- Kunlik statistika (do'kon bo'yicha jami) ---------- */

/** Kun boshi */
export const startOfDay = (t: number | Date) => {
  const d = new Date(t);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};

/** Mavjud tarix chuqurligi: grafikda 90 kun, solishtirish uchun yana 90 kun */
export const HISTORY_DAYS = 90;

function generateDailyStats(): DailyStat[] {
  const r = createRandom(90);
  const weights: Record<CategoryId, number> = {
    electronics: 0.27,
    appliances: 0.19,
    clothing: 0.13,
    shoes: 0.1,
    beauty: 0.1,
    home: 0.08,
    kids: 0.08,
    food: 0.05,
  };
  const today = startOfDay(DEMO_NOW);
  const stats: DailyStat[] = [];
  for (let i = HISTORY_DAYS * 2 - 1; i >= 0; i--) {
    const date = today - i * DAY;
    const d = new Date(date);
    const weekend = d.getDay() === 0 || d.getDay() === 6;
    // O'sish trendi + dam olish kunlari ko'proq + shovqin + noyabr aksiyasi oldidan ko'tarilish
    const trend = 1 + (HISTORY_DAYS * 2 - i) * 0.0025;
    const orders = Math.round((26 + r.int(-6, 8)) * trend * (weekend ? 1.25 : 1));
    const avgCheck = 340_000 + r.int(-40_000, 70_000);
    const revenue = Math.round((orders * avgCheck) / 1000) * 1000;
    const byCategory = {} as Record<CategoryId, number>;
    let rest = revenue;
    CATEGORIES.forEach((c, idx) => {
      const share =
        idx === CATEGORIES.length - 1
          ? rest
          : Math.round(revenue * weights[c.id] * (0.8 + r.next() * 0.4));
      const value = Math.max(0, Math.min(rest, share));
      byCategory[c.id] = value;
      rest -= value;
    });
    stats.push({
      date,
      revenue,
      orders,
      newCustomers: Math.max(1, Math.round(orders * (0.2 + r.next() * 0.15))),
      byCategory,
    });
  }
  return stats;
}

/* ---------- Bildirishnomalar va sozlamalar ---------- */

function generateNotifications(orders: Order[], products: Product[]): AdminNotification[] {
  const now = DEMO_NOW.getTime();
  const fresh = orders.filter((o) => o.status === 'new').slice(0, 3);
  const low = products.filter((p) => p.stock > 0 && p.stock < 10).slice(0, 1);
  const out = products.filter((p) => p.stock === 0).slice(0, 1);
  return [
    ...fresh.map((o, i) => ({
      id: `n-order-${o.id}`,
      kind: 'order' as const,
      title: `Yangi buyurtma #${o.id}`,
      description: `${o.customerName} · ${o.items.length} ta mahsulot`,
      at: o.createdAt,
      read: i > 1,
      href: `orders?order=${o.id}`,
    })),
    ...low.map((p) => ({
      id: `n-stock-${p.id}`,
      kind: 'stock' as const,
      title: 'Omborda kam qoldi',
      description: `${p.name} — ${p.stock} dona`,
      at: now - 3 * 3_600_000,
      read: false,
      href: `products?q=${encodeURIComponent(p.name)}`,
    })),
    ...out.map((p) => ({
      id: `n-out-${p.id}`,
      kind: 'stock' as const,
      title: 'Mahsulot tugadi',
      description: p.name,
      at: now - 26 * 3_600_000,
      read: true,
      href: `products?q=${encodeURIComponent(p.name)}`,
    })),
    {
      id: 'n-review-1',
      kind: 'review' as const,
      title: 'Yangi sharh: ★★★★★',
      description: '«Yetkazib berish juda tez, rahmat!» — Malika S.',
      at: now - 5 * 3_600_000,
      read: false,
    },
    {
      id: 'n-customer-1',
      kind: 'customer' as const,
      title: "Yangi mijoz ro'yxatdan o'tdi",
      description: 'Sardor Nazarov, Samarqand',
      at: now - 30 * 3_600_000,
      read: true,
      href: 'customers',
    },
  ].sort((a, b) => b.at - a.at);
}

export const initialSettings: StoreSettings = {
  name: 'Chorsu Market',
  email: 'info@chorsumarket.uz',
  phone: '555001020',
  region: 'Toshkent sh.',
  address: "Toshkent sh., Shayxontohur tumani, Navoiy ko'chasi, 30",
  about:
    "Chorsu Market — elektronika, maishiy texnika, kiyim va uy-ro'zg'or buyumlari onlayn do'koni. O'zbekiston bo'ylab yetkazib beramiz.",
  currency: 'UZS',
  language: 'uz',
  payments: { click: true, payme: true, uzcard: true, humo: true, cash: true },
  minOrder: 50_000,
  taxIncluded: true,
  deliveryFee: DELIVERY_FEE,
  freeDeliveryFrom: FREE_DELIVERY_FROM,
  deliveryTime: 'next-day',
  deliveryRegions: [...REGIONS],
  pickup: true,
  notifyNewOrderEmail: true,
  notifyNewOrderSms: false,
  notifyNewOrderTelegram: true,
  lowStockAlert: true,
  lowStockThreshold: 10,
  dailyReport: false,
};

/* ---------- Tayyor to'plam ---------- */

const products = generateProducts();
const customers = generateCustomers();
const orders = generateOrders(products, customers);

export const seed = {
  products,
  customers,
  orders,
  notifications: generateNotifications(orders, products),
  settings: initialSettings,
};

/** Kunlik statistika o'zgarmaydi (faqat o'qiladi) — store'ga kirmaydi */
export const dailyStats = generateDailyStats();

/** Omborda "kam qoldi" chegarasi (sozlamalarda o'zgartiriladi) */
export const DEFAULT_LOW_STOCK = 10;
