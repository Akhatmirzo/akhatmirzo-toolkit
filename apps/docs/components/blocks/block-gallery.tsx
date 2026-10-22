import Link from 'next/link';
import { blocks } from '@/components/blocks/registry.generated';
import type { Lang } from '@/lib/i18n';
import { BlockThumbnail } from './block-thumbnail';

/** Galereya tartibi (sidebar tartibi bilan bir xil); ro'yxatda yo'q bloklar oxiriga qo'shiladi */
const ORDER = [
  'login',
  'register',
  'otp-verify',
  'pricing',
  'dashboard-stats',
  'settings-profile',
  'data-table-page',
  'checkout-summary',
  'app-shell-layout',
];

const CATEGORIES: Record<string, Record<Lang, string>> = {
  auth: { uz: 'Kirish', en: 'Auth' },
  marketing: { uz: 'Marketing', en: 'Marketing' },
  dashboard: { uz: 'Dashboard', en: 'Dashboard' },
  settings: { uz: 'Sozlamalar', en: 'Settings' },
  data: { uz: "Ma'lumotlar", en: 'Data' },
  commerce: { uz: 'Savdo', en: 'Commerce' },
  layout: { uz: 'Qolip', en: 'Layout' },
};

export interface BlockGalleryProps {
  lang: Lang;
}

/** Bloklar bo'limi bosh sahifasi: har blok — jonli kichraytirilgan ko'rinish + nom + tavsif */
export function BlockGallery({ lang }: BlockGalleryProps) {
  const names = [
    ...ORDER.filter((name) => blocks[name]),
    ...Object.keys(blocks).filter((name) => !ORDER.includes(name)),
  ];

  return (
    <div className="not-prose my-6 grid gap-5 sm:grid-cols-2">
      {names.map((name) => {
        const { component: Block, meta } = blocks[name]!;
        return (
          // Kartochka <a> emas: blok ichidagi havola/tugmalar <a> ichida bo'lsa HTML noto'g'ri
          // (ichma-ich <a> → hydration xatosi). Butun kartochkani sarlavhadagi Link qoplaydi.
          <div
            key={name}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-[border-color,box-shadow] duration-base has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring hover:border-border-strong hover:shadow-md"
          >
            <div className="relative aspect-[16/10] overflow-hidden border-b border-border bg-background">
              <BlockThumbnail>
                <Block />
              </BlockThumbnail>
            </div>
            <div className="flex flex-col gap-1 p-4">
              <div className="flex items-center justify-between gap-3">
                <Link
                  // Sahifa: .../blocks → .../blocks/<name>
                  href={`./blocks/${name}`}
                  className="font-semibold text-text no-underline outline-none group-hover:text-primary after:absolute after:inset-0 after:content-['']"
                >
                  {meta.title[lang]}
                </Link>
                <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium text-text-muted">
                  {CATEGORIES[meta.category]?.[lang] ?? meta.category}
                </span>
              </div>
              <p className="m-0 text-sm text-text-muted">{meta.description[lang]}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
