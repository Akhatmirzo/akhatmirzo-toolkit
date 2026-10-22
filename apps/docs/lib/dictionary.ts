import type { Lang } from './i18n';

/** Saytning o'z matnlari (Fumadocs interfeysi matnlari — `translations.ts` da) */
const uz = {
  meta: {
    title: "@akhatmirzo/ui — o'zbek tiliga moslangan React komponentlar",
    description:
      "Tailwind CSS v4 va Radix asosidagi React komponentlar kutubxonasi: o'zbekcha matnlar, telefon, karta va so'm formatlari, to'liq a11y va dark mode.",
  },
  nav: {
    docs: 'Hujjatlar',
    components: 'Komponentlar',
    examples: 'Namunalar',
  },
  preview: {
    preview: "Ko'rinish",
    code: 'Kod',
    notFound: 'Demo topilmadi',
  },
  props: {
    prop: 'Prop',
    type: 'Tip',
    default: 'Standart',
    description: 'Tavsif',
    required: 'majburiy',
  },
  install: {
    label: "O'rnatish buyrug'i",
  },
  version: {
    latest: "eng so'nggi",
    outdatedTitle: 'Bu eski versiya hujjati',
    outdatedText: (current: string, latest: string) =>
      `Siz ${current} hujjatini o'qiyapsiz. Eng so'nggi versiya — ${latest}.`,
    goLatest: "Eng so'nggisiga o'tish",
  },
  home: {
    badge: "v0.3 — npm'da",
    titleTop: "O'zbek tiliga moslangan",
    titleAccent: 'React komponentlar',
    lead: "Tailwind CSS v4 va Radix ustiga qurilgan 43 ta komponent, formatlash va validatsiya funksiyalari, hooklar va dizayn tokenlari. Telefon, karta va so'm — qutidan tayyor.",
    start: 'Boshlash',
    components: "Komponentlarni ko'rish",
    copy: 'Nusxalash',
    copied: 'Nusxalandi',
    featuresTitle: 'Nega aynan shu kutubxona',
    featuresLead:
      "Har bir komponent bir xil qoidalarga bo'ysunadi: bittasini o'rgansangiz, qolganini taxmin qilasiz.",
    features: [
      {
        icon: 'languages',
        title: "O'zbek tili uchun",
        text: "Matnlar, lotin-kirill qidiruv, +998 telefon, Uzcard/Humo kartalar va so'm formati — sozlashsiz.",
      },
      {
        icon: 'accessibility',
        title: 'Hammaga qulay (a11y)',
        text: "Klaviatura bilan to'liq boshqaruv, ekran o'quvchilar uchun ARIA va ko'rinadigan fokus halqasi.",
      },
      {
        icon: 'moon',
        title: 'Dark mode',
        text: 'Bitta `data-theme="dark"` atributi — barcha komponentlar va tokenlar qorong\'i rejimga o\'tadi.',
      },
      {
        icon: 'layers',
        title: 'Tailwind v4 + Radix',
        text: 'Radix primitivlari ustida, semantik tokenlar bilan. `className` doim ustun turadi.',
      },
      {
        icon: 'boxes',
        title: '43 ta komponent',
        text: "Tugmadan tortib DataTable, DatePicker, CommandPalette va VirtualList'gacha.",
      },
      {
        icon: 'leaf',
        title: 'Tree-shakeable',
        text: 'ESM va `sideEffects: false` — ilovangizga faqat ishlatgan narsangiz kiradi.',
      },
    ],
    galleryTitle: "Jonli ko'rinish",
    galleryLead: "Bular rasm emas — haqiqiy komponentlar. Bosib, yozib, almashtirib ko'ring.",
    packagesTitle: 'Paketlar',
    packagesLead: "Kerakli qismini o'rnating — har bir paket mustaqil ishlaydi.",
    packages: [
      {
        name: '@akhatmirzo/ui',
        text: 'React komponentlar: formalar, overlaylar, jadvallar va boshqalar.',
        href: 'components/button',
      },
      {
        name: '@akhatmirzo/core',
        text: "Bog'liqliksiz funksiyalar: formatlash, validatsiya, matn, storage va API.",
        href: 'core/text',
      },
      {
        name: '@akhatmirzo/hooks',
        text: 'Qayta ishlatiladigan React hooklar: debounce, hotkeys, localStorage ...',
        href: 'hooks',
      },
      {
        name: '@akhatmirzo/tokens',
        text: "Dizayn tokenlari: CSS o'zgaruvchilari va Tailwind v4 @theme.",
        href: 'theming',
      },
    ],
    ctaTitle: 'Bir necha daqiqada ishga tushiring',
    ctaText: "O'rnating, CSS'ni ulang va birinchi komponentingizni chizing.",
    ctaButton: "O'rnatish yo'riqnomasi",
    footer: 'MIT litsenziyasi ostida. Akhatmirzo tomonidan yaratilgan.',
  },
};

type Dictionary = typeof uz;

const en: Dictionary = {
  meta: {
    title: '@akhatmirzo/ui — React components built for Uzbek',
    description:
      'A React component library on Tailwind CSS v4 and Radix: Uzbek copy, phone, card and currency formats, full accessibility and dark mode.',
  },
  nav: {
    docs: 'Docs',
    components: 'Components',
    examples: 'Examples',
  },
  preview: {
    preview: 'Preview',
    code: 'Code',
    notFound: 'Demo not found',
  },
  props: {
    prop: 'Prop',
    type: 'Type',
    default: 'Default',
    description: 'Description',
    required: 'required',
  },
  install: {
    label: 'Install command',
  },
  version: {
    latest: 'latest',
    outdatedTitle: 'You are viewing docs for an older version',
    outdatedText: (current: string, latest: string) =>
      `This page documents ${current}. The latest version is ${latest}.`,
    goLatest: 'Go to the latest docs',
  },
  home: {
    badge: 'v0.3 — on npm',
    titleTop: 'React components',
    titleAccent: 'built for Uzbek',
    lead: "Thirty-two components on Tailwind CSS v4 and Radix, plus formatting and validation helpers, hooks and design tokens. Phone numbers, cards and so'm amounts work out of the box.",
    start: 'Get started',
    components: 'Browse components',
    copy: 'Copy',
    copied: 'Copied',
    featuresTitle: 'Why this library',
    featuresLead:
      'Every component follows the same conventions — learn one and you can guess the rest.',
    features: [
      {
        icon: 'languages',
        title: 'Made for Uzbek',
        text: "Uzbek copy, Latin–Cyrillic search, +998 phones, Uzcard/Humo cards and so'm formatting — no setup.",
      },
      {
        icon: 'accessibility',
        title: 'Accessible by default',
        text: 'Full keyboard support, proper ARIA for screen readers and a visible focus ring.',
      },
      {
        icon: 'moon',
        title: 'Dark mode',
        text: 'One `data-theme="dark"` attribute switches every component and token to the dark palette.',
      },
      {
        icon: 'layers',
        title: 'Tailwind v4 + Radix',
        text: 'Built on Radix primitives with semantic tokens. Your `className` always wins.',
      },
      {
        icon: 'boxes',
        title: '43 components',
        text: 'From buttons all the way to DataTable, DatePicker, CommandPalette and VirtualList.',
      },
      {
        icon: 'leaf',
        title: 'Tree-shakeable',
        text: 'ESM with `sideEffects: false` — your bundle only gets what you import.',
      },
    ],
    galleryTitle: 'See it live',
    galleryLead:
      'These are not screenshots — they are the real components. Click, type and toggle.',
    packagesTitle: 'Packages',
    packagesLead: 'Install only what you need — each package works on its own.',
    packages: [
      {
        name: '@akhatmirzo/ui',
        text: 'React components: forms, overlays, tables and more.',
        href: 'components/button',
      },
      {
        name: '@akhatmirzo/core',
        text: 'Zero-dependency helpers: formatting, validation, text, storage and API.',
        href: 'core/text',
      },
      {
        name: '@akhatmirzo/hooks',
        text: 'Reusable React hooks: debounce, hotkeys, localStorage and more.',
        href: 'hooks',
      },
      {
        name: '@akhatmirzo/tokens',
        text: 'Design tokens: CSS variables and a Tailwind v4 @theme.',
        href: 'theming',
      },
    ],
    ctaTitle: 'Up and running in minutes',
    ctaText: 'Install the packages, wire up the CSS and render your first component.',
    ctaButton: 'Installation guide',
    footer: 'Released under the MIT License. Built by Akhatmirzo.',
  },
};

const dictionaries: Record<Lang, Dictionary> = { uz, en };

export function getDictionary(lang: Lang): Dictionary {
  return dictionaries[lang];
}

export type { Dictionary };
