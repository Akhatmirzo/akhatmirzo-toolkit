import type { Lang } from './i18n';

/**
 * Namuna ilovalar ro'yxati: `/[lang]/examples` sahifasi va har bir namunaning yuqori paneli
 * shu yerdan oladi. Har bir namuna — `app/[lang]/(apps)/examples/<slug>/`, uning komponentlari
 * va statik ma'lumotlari — `components/examples/<slug>/`.
 */
export interface ExampleInfo {
  slug: string;
  /** Namunaning bosh sahifasi (slug ichidagi yo'l) */
  entry: string;
  title: Record<Lang, string>;
  description: Record<Lang, string>;
  /** Asosiy ishlatilgan komponentlar */
  components: string[];
}

export const examples: ExampleInfo[] = [
  {
    slug: 'admin',
    entry: '',
    title: { uz: "Do'kon admin paneli", en: 'Store admin dashboard' },
    description: {
      uz: "Onlayn do'kon boshqaruvi: savdo statistikasi va grafiklar, buyurtmalar, mahsulotlar katalogi, mijozlar va sozlamalar.",
      en: 'Online store back office: sales stats and charts, orders, product catalog, customers and settings.',
    },
    components: [
      'DataTable',
      'Drawer',
      'Dialog',
      'FileUpload',
      'DateRangePicker',
      'CommandPalette',
    ],
  },
  {
    slug: 'bank',
    entry: '',
    title: { uz: 'Bank ilovasi', en: 'Banking app' },
    description: {
      uz: "Uzcard va Humo kartalari, o'tkazmalar, kommunal to'lovlar, operatsiyalar tarixi va xarajatlar tahlili.",
      en: 'Uzcard and Humo cards, transfers, utility payments, transaction history and spending analytics.',
    },
    components: ['CardInput', 'PhoneInput', 'MoneyInput', 'OtpInput', 'VirtualList', 'Tabs'],
  },
  {
    slug: 'auth',
    entry: 'sign-in',
    title: { uz: "Kirish va ro'yxatdan o'tish", en: 'Sign in and sign up' },
    description: {
      uz: "Telefon raqam bilan kirish, SMS kod (OTP), ro'yxatdan o'tish bosqichlari va parolni tiklash.",
      en: 'Phone sign-in, SMS code (OTP), multi-step sign-up and password recovery.',
    },
    components: ['PhoneInput', 'OtpInput', 'Field', 'Input', 'Checkbox', 'Button'],
  },
  {
    slug: 'checkout',
    entry: '',
    title: { uz: "Savatcha va to'lov", en: 'Cart and checkout' },
    description: {
      uz: "Savatcha, yetkazib berish manzili va vaqti, karta bilan to'lov va buyurtma tasdig'i.",
      en: 'Cart, delivery address and time slot, card payment and order confirmation.',
    },
    components: ['RadioGroup', 'Select', 'Combobox', 'DatePicker', 'CardInput', 'Accordion'],
  },
  {
    slug: 'workspace',
    entry: '',
    title: { uz: 'Xodimlar va sozlamalar', en: 'Team and settings' },
    description: {
      uz: "Xodimlar ro'yxati (to'liq CRUD), profil, bildirishnomalar, xavfsizlik va tarif sozlamalari.",
      en: 'Team directory (full CRUD), profile, notifications, security and billing settings.',
    },
    components: ['DataTable', 'Drawer', 'Tabs', 'Switch', 'Avatar', 'ConfirmDialog'],
  },
];

export function exampleHref(lang: Lang, ex: ExampleInfo) {
  return `/${lang}/examples/${ex.slug}${ex.entry ? `/${ex.entry}` : ''}`;
}

export const examplesSourceUrl =
  'https://github.com/Akhatmirzo/akhatmirzo-toolkit/tree/main/apps/docs/components/examples';
