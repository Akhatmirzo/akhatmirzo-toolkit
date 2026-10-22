import type { BadgeColor } from '@akhatmirzo/ui';

/*
 * "Xodimlar va sozlamalar" namunasining statik ma'lumotlari. Backend yo'q — hammasi shu yerda,
 * o'zgarishlar esa brauzerning localStorage'ida saqlanadi (store.tsx).
 * Sanalar ISO matn ko'rinishida: localStorage'ga JSON bo'lib yoziladi.
 */

export const company = { name: 'Bulut Tech', domain: 'bulut.uz' };

/* ---------- Bo'limlar, holatlar, rollar ---------- */

export type DepartmentId =
  'engineering' | 'design' | 'marketing' | 'sales' | 'finance' | 'hr' | 'support';

export const departments: { id: DepartmentId; label: string; color: BadgeColor }[] = [
  { id: 'engineering', label: 'Muhandislik', color: 'primary' },
  { id: 'design', label: 'Dizayn', color: 'info' },
  { id: 'marketing', label: 'Marketing', color: 'warning' },
  { id: 'sales', label: 'Sotuv', color: 'success' },
  { id: 'finance', label: 'Moliya', color: 'neutral' },
  { id: 'hr', label: 'Kadrlar', color: 'danger' },
  { id: 'support', label: "Qo'llab-quvvatlash", color: 'neutral' },
];

export const departmentById = Object.fromEntries(departments.map((d) => [d.id, d])) as Record<
  DepartmentId,
  (typeof departments)[number]
>;

export type EmployeeStatus = 'active' | 'vacation' | 'left';

export const statuses: { id: EmployeeStatus; label: string; color: BadgeColor }[] = [
  { id: 'active', label: 'Faol', color: 'success' },
  { id: 'vacation', label: "Ta'tilda", color: 'warning' },
  { id: 'left', label: 'Ishdan ketgan', color: 'neutral' },
];

export const statusById = Object.fromEntries(statuses.map((s) => [s.id, s])) as Record<
  EmployeeStatus,
  (typeof statuses)[number]
>;

export type Role = 'admin' | 'editor' | 'viewer';

export const roles: { id: Role; label: string; description: string }[] = [
  {
    id: 'admin',
    label: 'Admin',
    description: "Hamma narsaga kirish: xodimlar, to'lovlar va xavfsizlik sozlamalari.",
  },
  {
    id: 'editor',
    label: 'Muharrir',
    description: "Loyihalar va hujjatlarni yaratadi, tahrirlaydi. To'lovlarni ko'rmaydi.",
  },
  {
    id: 'viewer',
    label: 'Kuzatuvchi',
    description: "Faqat ko'rish va izoh qoldirish. Hech narsani o'zgartira olmaydi.",
  },
];

export const roleById = Object.fromEntries(roles.map((r) => [r.id, r])) as Record<
  Role,
  (typeof roles)[number]
>;

/* ---------- Xodimlar ---------- */

export interface Employee {
  id: string;
  name: string;
  email: string;
  /** +998 siz 9 raqam: "901234567" */
  phone: string;
  title: string;
  department: DepartmentId;
  status: EmployeeStatus;
  role: Role;
  managerId: string | null;
  /** ISO sana: "2023-04-12" */
  joinedAt: string;
  /** Kichraytirilgan rasm (data URL) */
  avatar?: string;
  /** Taklif yuborilgan, lekin hali qabul qilinmagan */
  invited?: boolean;
  location: string;
}

type Seed = [
  name: string,
  login: string,
  title: string,
  department: DepartmentId,
  status: EmployeeStatus,
  role: Role,
  manager: number | null,
  joinedAt: string,
  phone: string,
  location: string,
];

// manager — shu ro'yxatdagi tartib raqami (0 dan)
// prettier-ignore
const seed: Seed[] = [
  ['Akmal Karimov', 'akmal', 'Texnik direktor', 'engineering', 'active', 'admin', null, '2019-03-11', '901234567', 'Toshkent'],
  ['Dilnoza Rahimova', 'dilnoza', 'Dizayn rahbari', 'design', 'active', 'admin', 0, '2019-09-02', '935551203', 'Toshkent'],
  ['Javohir Tursunov', 'javohir', 'Backend dasturchi', 'engineering', 'active', 'editor', 0, '2020-02-17', '977104455', 'Samarqand'],
  ['Madina Yusupova', 'madina', 'Marketing menejeri', 'marketing', 'active', 'admin', null, '2020-05-04', '998801122', 'Toshkent'],
  ['Sardor Aliyev', 'sardor', 'Frontend dasturchi', 'engineering', 'vacation', 'editor', 0, '2020-11-23', '911237788', 'Toshkent'],
  ['Nilufar Qodirova', 'nilufar', 'HR menejer', 'hr', 'active', 'admin', null, '2021-01-12', '950012345', 'Toshkent'],
  ['Bekzod Ismoilov', 'bekzod', "Sotuv bo'limi boshlig'i", 'sales', 'active', 'admin', null, '2021-03-08', '881112233', 'Buxoro'],
  ['Shahnoza Ergasheva', 'shahnoza', 'UI/UX dizayner', 'design', 'active', 'editor', 1, '2021-06-21', '933334455', 'Toshkent'],
  ['Otabek Nurmatov', 'otabek', 'DevOps muhandis', 'engineering', 'active', 'editor', 0, '2021-08-30', '994447766', 'Namangan'],
  ['Gulnora Saidova', 'gulnora', 'Bosh hisobchi', 'finance', 'active', 'editor', null, '2021-10-04', '901110099', 'Toshkent'],
  ['Jasur Xolmatov', 'jasur', 'Mobil dasturchi', 'engineering', 'active', 'editor', 0, '2022-01-17', '975556677', "Farg'ona"],
  ['Malika Abdullayeva', 'malika', 'Kontent menejer', 'marketing', 'active', 'editor', 3, '2022-02-14', '338887766', 'Toshkent'],
  ['Rustam Hamidov', 'rustam', 'Sotuv menejeri', 'sales', 'active', 'viewer', 6, '2022-04-11', '914443322', 'Buxoro'],
  ['Kamola Mirzayeva', 'kamola', "Qo'llab-quvvatlash rahbari", 'support', 'active', 'editor', null, '2022-05-23', '907778899', 'Toshkent'],
  ["Ulug'bek Sobirov", 'ulugbek', 'QA muhandis', 'engineering', 'vacation', 'editor', 0, '2022-07-04', '931239876', 'Samarqand'],
  ['Feruza Nazarova', 'feruza', 'Grafik dizayner', 'design', 'active', 'viewer', 1, '2022-08-15', '998765432', 'Toshkent'],
  ['Aziz Rashidov', 'aziz', "Ma'lumotlar tahlilchisi", 'engineering', 'active', 'editor', 0, '2022-10-03', '771234560', 'Toshkent'],
  ['Zarina Toshpulatova', 'zarina', 'SMM mutaxassisi', 'marketing', 'left', 'viewer', 3, '2022-11-28', '950987654', 'Andijon'],
  ['Doniyor Usmonov', 'doniyor', 'Sotuv menejeri', 'sales', 'active', 'viewer', 6, '2023-01-09', '885554433', 'Qarshi'],
  ['Sevara Komilova', 'sevara', 'Rekruter', 'hr', 'active', 'editor', 5, '2023-02-20', '903332211', 'Toshkent'],
  ['Shoxrux Murodov', 'shoxrux', 'Backend dasturchi', 'engineering', 'active', 'editor', 2, '2023-03-13', '976665544', 'Toshkent'],
  ["Laylo Jo'rayeva", 'laylo', 'Operator', 'support', 'active', 'viewer', 13, '2023-04-17', '334445566', 'Toshkent'],
  ['Sanjar Qosimov', 'sanjar', 'Moliyaviy tahlilchi', 'finance', 'active', 'viewer', 9, '2023-05-29', '911118822', 'Toshkent'],
  ['Mohira Ahmedova', 'mohira', 'Mahsulot dizayneri', 'design', 'vacation', 'editor', 1, '2023-07-10', '939990011', 'Samarqand'],
  ['Eldor Bahodirov', 'eldor', 'Frontend dasturchi', 'engineering', 'active', 'editor', 4, '2023-08-21', '997773300', 'Toshkent'],
  ['Nodira Valiyeva', 'nodira', 'Operator', 'support', 'left', 'viewer', 13, '2023-09-04', '505556677', 'Xiva'],
  ['Behruz Olimov', 'behruz', 'Performance marketolog', 'marketing', 'active', 'editor', 3, '2023-10-16', '902221100', 'Toshkent'],
  ['Dildora Fayzullayeva', 'dildora', 'Hisobchi', 'finance', 'active', 'viewer', 9, '2024-01-15', '935550099', 'Toshkent'],
  ['Islom Karimjonov', 'islom', 'Mobil dasturchi', 'engineering', 'active', 'editor', 10, '2024-03-04', '948887766', 'Namangan'],
  ['Munisa Sharipova', 'munisa', 'Sotuv menejeri', 'sales', 'vacation', 'viewer', 6, '2024-04-22', '973331122', 'Buxoro'],
  ['Akbar Raxmonov', 'akbar', 'Xavfsizlik muhandisi', 'engineering', 'active', 'admin', 0, '2024-06-10', '991112244', 'Toshkent'],
  ['Kumush Tojiboyeva', 'kumush', 'Operator', 'support', 'active', 'viewer', 13, '2024-08-05', '887776655', 'Toshkent'],
  ['Timur Gafurov', 'timur', 'Junior dasturchi', 'engineering', 'active', 'viewer', 2, '2025-02-03', '905554411', 'Toshkent'],
  ["Robiya Yo'ldosheva", 'robiya', 'Dizayner (stajyor)', 'design', 'active', 'viewer', 7, '2025-09-15', '330001122', 'Toshkent'],
  ['Asadbek Zokirov', 'asadbek', 'Sotuv menejeri', 'sales', 'active', 'viewer', 6, '2026-06-01', '914440088', 'Samarqand'],
  ['Hulkar Ibragimova', 'hulkar', 'Kontent muallifi', 'marketing', 'active', 'viewer', 11, '2026-09-28', '977770011', 'Toshkent'],
];

export const seedEmployees: Employee[] = seed.map(
  ([name, login, title, department, status, role, manager, joinedAt, phone, location], i) => ({
    id: `e${i + 1}`,
    name,
    email: `${login}@${company.domain}`,
    phone,
    title,
    department,
    status,
    role,
    managerId: manager === null ? null : `e${manager + 1}`,
    joinedAt,
    location,
    // Oxirgi ikki xodim taklifni hali qabul qilmagan
    invited: i >= seed.length - 2 ? true : undefined,
  }),
);

/* ---------- Profil ---------- */

export interface Profile {
  name: string;
  email: string;
  title: string;
  bio: string;
  language: string;
  timezone: string;
  avatar?: string;
}

export const seedProfile: Profile = {
  name: 'Akmal Karimov',
  email: `akmal@${company.domain}`,
  title: 'Texnik direktor',
  bio: "Bulut Tech'da muhandislik jamoasini boshqaraman. Bulutli infratuzilma, ishonchli tizimlar va yaxshi hujjatlangan kodni yaxshi ko'raman.",
  language: 'uz',
  timezone: 'Asia/Tashkent',
};

export const languages = [
  { value: 'uz', label: "O'zbekcha (lotin)" },
  { value: 'uz-Cyrl', label: 'Ўзбекча (кирилл)' },
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'English' },
];

export const timezones = [
  { value: 'Asia/Tashkent', label: 'Toshkent (UTC+5)' },
  { value: 'Asia/Almaty', label: 'Olmaota (UTC+5)' },
  { value: 'Asia/Dubai', label: 'Dubay (UTC+4)' },
  { value: 'Europe/Moscow', label: 'Moskva (UTC+3)' },
  { value: 'Europe/Istanbul', label: 'Istanbul (UTC+3)' },
  { value: 'Europe/London', label: 'London (UTC+0)' },
];

/* ---------- Bildirishnomalar ---------- */

export type Channel = 'email' | 'sms' | 'push' | 'telegram';

export const channels: { id: Channel; label: string; hint: string }[] = [
  { id: 'email', label: 'Email', hint: `akmal@${company.domain}` },
  { id: 'sms', label: 'SMS', hint: '+998 90 123 45 67' },
  { id: 'push', label: 'Push', hint: 'Brauzer va mobil ilova' },
  { id: 'telegram', label: 'Telegram', hint: '@bulut_tech_bot orqali' },
];

export const notificationGroups: {
  title: string;
  events: { id: string; label: string; description: string }[];
}[] = [
  {
    title: 'Jamoa',
    events: [
      {
        id: 'member-joined',
        label: "Yangi xodim qo'shildi",
        description: 'Taklif qabul qilinganda',
      },
      { id: 'role-changed', label: "Rol o'zgardi", description: "Xodimning huquqlari o'zgarganda" },
      { id: 'member-left', label: 'Xodim ishdan ketdi', description: 'Hisob faolsizlantirilganda' },
    ],
  },
  {
    title: "Hisob va to'lov",
    events: [
      { id: 'invoice-ready', label: 'Hisob-faktura tayyor', description: 'Har oy boshida' },
      { id: 'payment-failed', label: "To'lov o'tmadi", description: "Kartadan yechib bo'lmaganda" },
      {
        id: 'usage-limit',
        label: 'Limitga yaqinlashildi',
        description: 'Foydalanish 80% dan oshsa',
      },
    ],
  },
  {
    title: 'Xavfsizlik',
    events: [
      {
        id: 'new-device',
        label: 'Yangi qurilmadan kirish',
        description: 'Notanish brauzer yoki joy',
      },
      {
        id: 'password-changed',
        label: "Parol o'zgartirildi",
        description: 'Hisobingiz paroli yangilanganda',
      },
    ],
  },
  {
    title: 'Yangiliklar',
    events: [
      { id: 'weekly-digest', label: 'Haftalik hisobot', description: 'Har dushanba ertalab' },
      {
        id: 'product-news',
        label: 'Mahsulot yangiliklari',
        description: 'Yangi imkoniyatlar haqida',
      },
    ],
  },
];

export interface NotificationSettings {
  channels: Record<Channel, boolean>;
  /** hodisa id → yoqilgan kanallar */
  matrix: Record<string, Channel[]>;
  quiet: { enabled: boolean; from: string; to: string; weekends: boolean };
}

export const seedNotifications: NotificationSettings = {
  channels: { email: true, sms: false, push: true, telegram: true },
  matrix: {
    'member-joined': ['email', 'push'],
    'role-changed': ['email'],
    'member-left': ['email'],
    'invoice-ready': ['email', 'telegram'],
    'payment-failed': ['email', 'sms', 'push', 'telegram'],
    'usage-limit': ['email', 'push'],
    'new-device': ['email', 'sms', 'push'],
    'password-changed': ['email', 'sms'],
    'weekly-digest': ['email'],
    'product-news': [],
  },
  quiet: { enabled: true, from: '22:00', to: '08:00', weekends: false },
};

/** "00:00" ... "23:30" — yarim soat qadam bilan */
export const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, '0');
  return `${h}:${i % 2 ? '30' : '00'}`;
});

/* ---------- Xavfsizlik ---------- */

export type DeviceKind = 'desktop' | 'mobile' | 'tablet';

export interface Session {
  id: string;
  device: string;
  kind: DeviceKind;
  location: string;
  ip: string;
  /** Oxirgi faollik — necha daqiqa oldin (nisbiy, shunda vaqt doim "yangi" ko'rinadi) */
  minutesAgo: number;
  current?: boolean;
}

export interface SecuritySettings {
  twoFactor: boolean;
  /** Parol oxirgi o'zgartirilgan vaqt (ISO) */
  passwordChangedAt: string;
  sessions: Session[];
}

export const seedSecurity: SecuritySettings = {
  twoFactor: false,
  passwordChangedAt: '2026-04-18T10:24:00+05:00',
  sessions: [
    {
      id: 's1',
      device: 'Chrome · Windows 11',
      kind: 'desktop',
      location: "Toshkent, O'zbekiston",
      ip: '84.54.71.12',
      minutesAgo: 0,
      current: true,
    },
    {
      id: 's2',
      device: 'Bulut ilovasi · iPhone 15',
      kind: 'mobile',
      location: "Toshkent, O'zbekiston",
      ip: '213.230.88.4',
      minutesAgo: 47,
    },
    {
      id: 's3',
      device: 'Safari · iPad Air',
      kind: 'tablet',
      location: "Samarqand, O'zbekiston",
      ip: '195.158.9.120',
      minutesAgo: 60 * 26,
    },
    {
      id: 's4',
      device: 'Firefox · Ubuntu',
      kind: 'desktop',
      location: "Buxoro, O'zbekiston",
      ip: '91.213.31.77',
      minutesAgo: 60 * 24 * 4,
    },
    {
      id: 's5',
      device: 'Edge · Windows 10',
      kind: 'desktop',
      location: "Almati, Qozog'iston",
      ip: '37.150.44.201',
      minutesAgo: 60 * 24 * 12,
    },
  ],
};

/** Namunada parolni o'zgartirish uchun "joriy parol" */
export const DEMO_PASSWORD = 'demo1234';

/* ---------- Tarif va to'lov ---------- */

export type PlanId = 'starter' | 'business' | 'enterprise';
export type BillingCycle = 'monthly' | 'yearly';

export interface Plan {
  id: PlanId;
  name: string;
  description: string;
  /** Oylik narx (so'm); yillik to'lovda 20% chegirma */
  monthly: number;
  seats: number;
  storageGb: number;
  features: string[];
  popular?: boolean;
}

export const plans: Plan[] = [
  {
    id: 'starter',
    name: "Boshlang'ich",
    description: "Kichik jamoalar va sinab ko'rish uchun",
    monthly: 0,
    seats: 5,
    storageGb: 10,
    features: ['5 tagacha xodim', '10 GB xotira', 'Asosiy hisobotlar', 'Email orqali yordam'],
  },
  {
    id: 'business',
    name: 'Biznes',
    description: "O'sib borayotgan kompaniyalar uchun",
    monthly: 490_000,
    seats: 50,
    storageGb: 100,
    popular: true,
    features: [
      '50 tagacha xodim',
      '100 GB xotira',
      'Rollar va huquqlar',
      'Telegram bildirishnomalar',
      'Ustuvor yordam 24/7',
    ],
  },
  {
    id: 'enterprise',
    name: 'Korporativ',
    description: 'Katta tashkilotlar va maxsus talablar uchun',
    monthly: 1_490_000,
    seats: 500,
    storageGb: 1024,
    features: [
      'Cheksiz loyihalar, 500 xodim',
      '1 TB xotira',
      'SSO va audit jurnali',
      'Shaxsiy menejer',
      'SLA 99,9%',
    ],
  },
];

export const YEARLY_DISCOUNT = 0.2;

export function planPrice(plan: Plan, cycle: BillingCycle) {
  return cycle === 'yearly' ? Math.round(plan.monthly * (1 - YEARLY_DISCOUNT)) : plan.monthly;
}

export interface PaymentCard {
  brand: string;
  last4: string;
  expires: string;
}

export interface BillingSettings {
  plan: PlanId;
  cycle: BillingCycle;
  card: PaymentCard;
  /** Namunada to'langan deb belgilangan hisob-fakturalar */
  paid: string[];
}

export const seedBilling: BillingSettings = {
  plan: 'business',
  cycle: 'monthly',
  card: { brand: 'Uzcard', last4: '4421', expires: '08/28' },
  paid: [],
};

export type InvoiceStatus = 'paid' | 'pending' | 'failed';

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: InvoiceStatus;
  description: string;
}

export const invoiceStatus: Record<InvoiceStatus, { label: string; color: BadgeColor }> = {
  paid: { label: "To'langan", color: 'success' },
  pending: { label: 'Kutilmoqda', color: 'warning' },
  failed: { label: "O'tmadi", color: 'danger' },
};

// 2025-noyabr — 2026-oktabr; avgustda to'lov o'tmagan va qayta to'langan
export const invoices: Invoice[] = [
  ['2026-10-01', 490_000, 'pending'],
  ['2026-09-01', 490_000, 'paid'],
  ['2026-08-03', 490_000, 'paid'],
  ['2026-08-01', 490_000, 'failed'],
  ['2026-07-01', 490_000, 'paid'],
  ['2026-06-01', 490_000, 'paid'],
  ['2026-05-01', 390_000, 'paid'],
  ['2026-04-01', 390_000, 'paid'],
  ['2026-03-01', 390_000, 'paid'],
  ['2026-02-01', 390_000, 'paid'],
  ['2026-01-01', 390_000, 'paid'],
  ['2025-12-01', 290_000, 'paid'],
  ['2025-11-01', 290_000, 'paid'],
].map(([date, amount, status], i, all) => ({
  id: `INV-${String(date).slice(0, 4)}-${String(all.length - i).padStart(3, '0')}`,
  date: String(date),
  amount: Number(amount),
  status: status as InvoiceStatus,
  description: 'Biznes tarifi · oylik obuna',
}));

/** Xotira ishlatilishi grafigi uchun (oxirgi 6 oy, GB) */
export const storageHistory = [
  { month: 'May', gb: 21.2 },
  { month: 'Iyun', gb: 24.6 },
  { month: 'Iyul', gb: 27.9 },
  { month: 'Avg', gb: 31.4 },
  { month: 'Sen', gb: 35.1 },
  { month: 'Okt', gb: 38.4 },
];

export const usage = { storageBytes: 38.4 * 1024 ** 3, apiCalls: 182_340, apiLimit: 250_000 };
