import { cn } from '@akhatmirzo/ui';
import { Lock, Nfc } from 'lucide-react';
import { brandLabels, maskCard, type BankCard, type CardBrand, type CardTheme } from './data';
import { Money } from './ui';

/** Karta fonlari — faqat token o'zgaruvchilari (dark rejimda ham bir xil yorqin) */
export const cardThemes: Record<CardTheme, string> = {
  indigo:
    'bg-[linear-gradient(135deg,var(--ak-indigo-500),var(--ak-indigo-700)_55%,var(--ak-indigo-950))]',
  emerald:
    'bg-[linear-gradient(135deg,var(--ak-emerald-500),var(--ak-emerald-700)_55%,var(--ak-sky-950))]',
  slate:
    'bg-[linear-gradient(135deg,var(--ak-slate-600),var(--ak-slate-800)_55%,var(--ak-slate-950))]',
  rose: 'bg-[linear-gradient(135deg,var(--ak-rose-400),var(--ak-rose-600)_55%,var(--ak-indigo-900))]',
  sky: 'bg-[linear-gradient(135deg,var(--ak-sky-400),var(--ak-sky-600)_55%,var(--ak-indigo-800))]',
  amber:
    'bg-[linear-gradient(135deg,var(--ak-amber-400),var(--ak-amber-600)_55%,var(--ak-rose-700))]',
};

export const themeLabels: Record<CardTheme, string> = {
  indigo: 'Indigo',
  emerald: 'Zumrad',
  slate: 'Grafit',
  rose: 'Atirgul',
  sky: 'Osmon',
  amber: 'Qahrabo',
};

/** Brend belgisi (rasmiy logo o'rniga matnli belgi) */
export function BrandLogo({ brand, className }: { brand: CardBrand; className?: string }) {
  if (brand === 'mastercard') {
    return (
      <span aria-label="Mastercard" role="img" className={cn('flex items-center', className)}>
        <span className="size-6 rounded-full bg-[var(--ak-rose-500)] opacity-90" />
        <span className="-ml-2.5 size-6 rounded-full bg-[var(--ak-amber-400)] opacity-90" />
      </span>
    );
  }
  return (
    <span
      className={cn(
        'text-base leading-none font-extrabold tracking-wider',
        brand === 'visa' && 'text-xl tracking-tight italic',
        brand === 'humo' && 'tracking-[0.2em]',
        className,
      )}
    >
      {brandLabels[brand].toUpperCase()}
    </span>
  );
}

function Chip() {
  return (
    <span
      aria-hidden="true"
      className="relative block h-7 w-9 overflow-hidden rounded-md bg-[linear-gradient(135deg,var(--ak-amber-300),var(--ak-amber-500))] shadow-xs"
    >
      <span className="absolute inset-x-0 top-1/2 h-px bg-[var(--ak-amber-700)]/40" />
      <span className="absolute inset-y-0 left-1/3 w-px bg-[var(--ak-amber-700)]/40" />
      <span className="absolute inset-y-0 right-1/3 w-px bg-[var(--ak-amber-700)]/40" />
    </span>
  );
}

/**
 * Gradientli bank kartasi. Raqam yashirilgan, balans `hideBalance` bilan yashiriladi.
 * Bloklangan karta kulrang va qulf belgisi bilan.
 */
export function BankCardVisual({
  card,
  hideBalance = false,
  className,
}: {
  card: BankCard;
  hideBalance?: boolean;
  className?: string;
}) {
  // Konteyner o'lchamiga qarab shrift va bo'shliqlar moslashadi (cqw)
  return (
    <div className={cn('@container w-full', className)}>
      <div
        className={cn(
          'relative isolate flex aspect-[1.586] w-full flex-col justify-between overflow-hidden rounded-2xl p-[6.5cqw] text-primary-foreground shadow-lg select-none',
          cardThemes[card.theme],
          card.blocked && 'grayscale-[0.85]',
        )}
      >
        {/* Bezak doiralar */}
        <span
          aria-hidden="true"
          className="absolute -top-16 -right-10 -z-10 size-48 rounded-full bg-primary-foreground/10"
        />
        <span
          aria-hidden="true"
          className="absolute -bottom-24 -left-12 -z-10 size-56 rounded-full bg-primary-foreground/5"
        />

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[clamp(11px,4.4cqw,14px)] font-medium opacity-80">
              {card.name}
            </p>
            <Money
              value={card.balance}
              hidden={hideBalance}
              className="mt-0.5 block text-[clamp(15px,6.6cqw,21px)] font-bold tracking-tight"
            />
          </div>
          <BrandLogo brand={card.brand} className="shrink-0" />
        </div>

        <div className="flex items-center gap-3">
          <Chip />
          <Nfc aria-hidden="true" className="size-5 opacity-70" />
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[clamp(11px,4.8cqw,15px)] font-semibold tracking-[0.12em] whitespace-nowrap tabular-nums">
              {maskCard(card.number)}
            </p>
            <p className="mt-1 truncate text-xs font-medium tracking-wide opacity-80">
              {card.holder}
            </p>
          </div>
          <p className="shrink-0 text-xs font-medium tabular-nums opacity-80">
            <span className="sr-only">Amal qilish muddati: </span>
            {card.expiry}
          </p>
        </div>

        {card.blocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--ak-slate-950)]/45">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--ak-slate-950)]/70 px-3 py-1.5 text-xs font-semibold">
              <Lock aria-hidden="true" className="size-3.5" />
              Bloklangan
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
