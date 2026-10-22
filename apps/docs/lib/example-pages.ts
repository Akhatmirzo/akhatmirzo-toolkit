import type { Metadata } from 'next';
import { examples } from './examples';
import { toLang, type Lang } from './i18n';
import { languageAlternates, localePath, pageMetadata, siteImageUrl } from './seo';

/**
 * Namuna ilovalarning har bir sahifasi uchun sarlavha va tavsif (ikki tilda).
 * Kalit — `examples/` dan keyingi yo'l (`admin`, `admin/orders`). Namunaning bosh sahifasi
 * sarlavhasi — `lib/examples.ts` dagi namuna nomi, ichki sahifalarniki — "Sahifa · Namuna".
 */
interface ExamplePageText {
  /** Ichki sahifa nomi; bo'lmasa — namunaning bosh sahifasi */
  page?: string;
  description: string;
}

type ExamplePage = Record<Lang, ExamplePageText> & { noindex?: boolean };

const checkoutDescription = {
  uz: "Savatcha va to'lov namunasi: do'kon vitrinasi, savatcha, yetkazib berish, karta bilan to'lov va buyurtma tasdig'i.",
  en: 'Cart and checkout example: storefront, cart, delivery, card payment and order confirmation.',
};

const pages = {
  // --- Do'kon admin paneli
  admin: {
    uz: {
      description:
        "React va @akhatmirzo/ui'da do'kon admin paneli: savdo statistikasi, grafiklar, eng ko'p sotilgan mahsulotlar va so'nggi buyurtmalar.",
    },
    en: {
      description:
        'Store admin dashboard built with React and @akhatmirzo/ui: sales stats, charts, best-selling products and recent orders.',
    },
  },
  'admin/orders': {
    uz: {
      page: 'Buyurtmalar',
      description:
        'Buyurtmalar jadvali: qidiruv, filtrlar, ommaviy amallar, CSV eksport va buyurtma tafsilotlari.',
    },
    en: {
      page: 'Orders',
      description: 'Orders table: search, filters, bulk actions, CSV export and order details.',
    },
  },
  'admin/products': {
    uz: {
      page: 'Mahsulotlar',
      description: "Mahsulotlar katalogi: qidiruv, toifalar, qo'shish, tahrirlash va o'chirish.",
    },
    en: {
      page: 'Products',
      description: 'Product catalog: search, categories, create, edit and delete.',
    },
  },
  'admin/customers': {
    uz: { page: 'Mijozlar', description: "Mijozlar ro'yxati, xaridlar tarixi va mijoz kartasi." },
    en: { page: 'Customers', description: 'Customer list, purchase history and customer profile.' },
  },
  'admin/settings': {
    uz: {
      page: 'Sozlamalar',
      description:
        "Do'kon sozlamalari: umumiy ma'lumotlar, to'lov, yetkazib berish va bildirishnomalar.",
    },
    en: {
      page: 'Settings',
      description: 'Store settings: general info, payments, delivery and notifications.',
    },
  },

  // --- Bank ilovasi
  bank: {
    uz: {
      description:
        "React va @akhatmirzo/ui'da bank ilovasi: Uzcard va Humo kartalari, balans va so'nggi operatsiyalar.",
    },
    en: {
      description:
        'Banking app built with React and @akhatmirzo/ui: Uzcard and Humo cards, balance and recent transactions.',
    },
  },
  'bank/cards': {
    uz: { page: 'Kartalar', description: "Karta qo'shish, bloklash va boshqarish." },
    en: { page: 'Cards', description: 'Add, block and manage bank cards.' },
  },
  'bank/transfer': {
    uz: { page: "O'tkazma", description: "Karta yoki telefon raqami bo'yicha o'tkazma." },
    en: { page: 'Transfer', description: 'Send money by card number or phone number.' },
  },
  'bank/payments': {
    uz: { page: "To'lovlar", description: 'Mobil aloqa, internet, kommunal va davlat xizmatlari.' },
    en: {
      page: 'Payments',
      description: 'Mobile, internet, utility and government service payments.',
    },
  },
  'bank/history': {
    uz: {
      page: 'Tarix',
      description: "Operatsiyalar tarixi: qidiruv, filtrlar va sanalar oralig'i.",
    },
    en: { page: 'History', description: 'Transaction history: search, filters and date range.' },
  },
  'bank/analytics': {
    uz: { page: 'Tahlil', description: 'Xarajatlar toifalar va oylar kesimida.' },
    en: { page: 'Analytics', description: 'Spending broken down by category and month.' },
  },

  // --- Kirish va ro'yxatdan o'tish (bosh sahifa — `sign-in`)
  'auth/sign-in': {
    uz: {
      description:
        'Telefon raqam yoki email bilan kirish: validatsiya, bloklash taymeri, SMS tasdiqlash.',
    },
    en: {
      description:
        'Sign in with a phone number or email: validation, lockout timer, SMS verification.',
    },
  },
  'auth/sign-up': {
    uz: {
      page: "Ro'yxatdan o'tish",
      description:
        "Ko'p bosqichli ro'yxatdan o'tish: telefon va SMS kod, shaxsiy ma'lumotlar, parol.",
    },
    en: {
      page: 'Sign up',
      description: 'Multi-step sign-up: phone and SMS code, personal details, password.',
    },
  },
  'auth/verify': {
    uz: {
      page: 'SMS kodni tasdiqlash',
      description: 'OtpInput va ResendTimer bilan SMS kodni tasdiqlash.',
    },
    en: {
      page: 'Verify SMS code',
      description: 'SMS code verification with OtpInput and ResendTimer.',
    },
  },
  'auth/forgot-password': {
    uz: {
      page: 'Parolni tiklash',
      description: 'Telefon raqam, SMS kod va yangi parol orqali parolni tiklash.',
    },
    en: {
      page: 'Reset password',
      description: 'Password recovery with a phone number, SMS code and a new password.',
    },
  },

  // --- Savatcha va to'lov ("Bozorcha" do'koni). Soxta do'kon qidiruvda chiqmasin — noindex.
  checkout: {
    noindex: true,
    uz: { description: checkoutDescription.uz },
    en: { description: checkoutDescription.en },
  },
  'checkout/cart': {
    noindex: true,
    uz: { page: 'Savatcha', description: checkoutDescription.uz },
    en: { page: 'Cart', description: checkoutDescription.en },
  },
  'checkout/delivery': {
    noindex: true,
    uz: { page: 'Yetkazib berish', description: checkoutDescription.uz },
    en: { page: 'Delivery', description: checkoutDescription.en },
  },
  'checkout/payment': {
    noindex: true,
    uz: { page: "To'lov", description: checkoutDescription.uz },
    en: { page: 'Payment', description: checkoutDescription.en },
  },
  'checkout/success': {
    noindex: true,
    uz: { page: 'Buyurtma qabul qilindi', description: checkoutDescription.uz },
    en: { page: 'Order placed', description: checkoutDescription.en },
  },

  // --- Xodimlar va sozlamalar
  workspace: {
    uz: {
      description:
        "React va @akhatmirzo/ui'da jamoa boshqaruvi: xodimlar ro'yxati — qidiruv, filtrlar, qo'shish, tahrirlash va o'chirish.",
    },
    en: {
      description:
        'Team management built with React and @akhatmirzo/ui: member directory with search, filters, create, edit and delete.',
    },
  },
  'workspace/profile': {
    uz: {
      page: 'Profil',
      description: 'Profil sozlamalari: rasm, ism, bio, til va vaqt mintaqasi.',
    },
    en: {
      page: 'Profile',
      description: 'Profile settings: photo, name, bio, language and time zone.',
    },
  },
  'workspace/notifications': {
    uz: {
      page: 'Bildirishnomalar',
      description: 'Bildirishnoma kanallari, hodisalar va jim soatlar.',
    },
    en: { page: 'Notifications', description: 'Notification channels, events and quiet hours.' },
  },
  'workspace/security': {
    uz: {
      page: 'Xavfsizlik',
      description: "Parol, ikki bosqichli autentifikatsiya, faol sessiyalar va hisobni o'chirish.",
    },
    en: {
      page: 'Security',
      description: 'Password, two-factor authentication, active sessions and account deletion.',
    },
  },
  'workspace/billing': {
    uz: {
      page: "Tarif va to'lov",
      description: "Joriy tarif, foydalanish ko'rsatkichlari, tariflar va hisob-fakturalar.",
    },
    en: {
      page: 'Plan and billing',
      description: 'Current plan, usage, pricing plans and invoices.',
    },
  },
} satisfies Record<string, ExamplePage>;

export type ExamplePageKey = keyof typeof pages;

export const examplePages: Record<ExamplePageKey, ExamplePage> = pages;

export const examplePageKeys = Object.keys(pages) as ExamplePageKey[];

export function isExamplePageIndexed(key: ExamplePageKey) {
  return !examplePages[key].noindex;
}

/** Namuna sahifasining manba papkalari (sitemap `lastmod` uchun) */
export function exampleSourceDirs(key: ExamplePageKey) {
  const slug = key.split('/')[0];
  return [`app/[lang]/(apps)/examples/${key}`, `components/examples/${slug}`];
}

function exampleTitle(key: ExamplePageKey, lang: Lang) {
  const slug = key.split('/')[0] ?? key;
  const name = examples.find((e) => e.slug === slug)?.title[lang] ?? slug;
  const page = examplePages[key][lang].page;
  return page ? `${page} · ${name}` : name;
}

/** Namuna sahifasi `generateMetadata` i: sarlavha, tavsif, kanonik + hreflang, OG */
export async function exampleMetadata(
  params: Promise<{ lang: string }>,
  key: ExamplePageKey,
): Promise<Metadata> {
  const lang = toLang((await params).lang);
  const path = `/examples/${key}`;
  const slug = key.split('/')[0] ?? key;

  return pageMetadata({
    lang,
    title: exampleTitle(key, lang),
    description: examplePages[key][lang].description,
    canonical: localePath(lang, path),
    languages: languageAlternates(path),
    image: siteImageUrl(lang, ['examples', slug]),
    noindex: !isExamplePageIndexed(key),
  });
}

/** OG rasm uchun: har bir namuna (slug) — nom va tavsif */
export function exampleOgText(slug: string, lang: Lang) {
  const ex = examples.find((e) => e.slug === slug);
  return ex ? { title: ex.title[lang], description: ex.description[lang] } : undefined;
}

export const exampleSlugs = examples.map((e) => e.slug);
