'use client';

import { cn } from '@akhatmirzo/ui';
import {
  BatteryCharging,
  BookOpen,
  Coffee,
  CookingPot,
  Footprints,
  Headphones,
  Lamp,
  NotebookPen,
  Shirt,
  Sparkles,
  Watch,
  type LucideIcon,
} from 'lucide-react';
import type { ProductIcon, Tone } from './data';

const icons: Record<ProductIcon, LucideIcon> = {
  headphones: Headphones,
  watch: Watch,
  battery: BatteryCharging,
  shirt: Shirt,
  scarf: Sparkles,
  shoes: Footprints,
  teaset: Coffee,
  kettle: CookingPot,
  lamp: Lamp,
  book: BookOpen,
  notebook: NotebookPen,
};

const tones: Record<Tone, string> = {
  primary: 'bg-primary-soft text-primary-soft-foreground',
  info: 'bg-info-soft text-info-soft-foreground',
  success: 'bg-success-soft text-success-soft-foreground',
  warning: 'bg-warning-soft text-warning-soft-foreground',
  danger: 'bg-danger-soft text-danger-soft-foreground',
};

/** Mahsulot rasmi o'rnida: rangli fon, yumshoq doiralar va ikonka */
export function ProductArt({
  icon,
  tone,
  size = 'md',
  className,
}: {
  icon: ProductIcon;
  tone: Tone;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const Icon = icons[icon];
  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative isolate flex shrink-0 items-center justify-center overflow-hidden',
        tones[tone],
        size === 'sm' && 'size-12 rounded-lg',
        size === 'md' && 'size-20 rounded-xl',
        size === 'lg' && 'aspect-[4/3] w-full rounded-xl',
        className,
      )}
    >
      {size === 'lg' && (
        <>
          <span className="absolute -top-8 -right-8 -z-10 size-32 rounded-full bg-current opacity-10" />
          <span className="absolute -bottom-10 -left-6 -z-10 size-28 rounded-full bg-current opacity-[0.07]" />
        </>
      )}
      <Icon
        strokeWidth={1.5}
        className={cn(
          size === 'sm' && 'size-6',
          size === 'md' && 'size-9',
          size === 'lg' &&
            'size-16 transition-transform duration-slow ease-out group-hover:scale-110 group-hover:-rotate-6',
        )}
      />
    </div>
  );
}
