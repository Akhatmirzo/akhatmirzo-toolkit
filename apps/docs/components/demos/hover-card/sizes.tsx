'use client';

import { HoverCard } from '@akhatmirzo/ui';

export default function HoverCardSizes() {
  return (
    <div className="flex flex-wrap items-center gap-6 text-sm">
      {(['sm', 'md'] as const).map((size) => (
        <HoverCard key={size}>
          <HoverCard.Trigger asChild>
            <a
              href="#chorsu"
              className="focus-ring rounded-sm font-medium text-primary underline underline-offset-4"
            >
              size=&quot;{size}&quot;
            </a>
          </HoverCard.Trigger>
          <HoverCard.Content size={size}>
            <p className="m-0 font-semibold">Chorsu Market</p>
            <p className="m-0 mt-1 text-text-muted">
              Toshkentdagi onlayn do'kon: 12 000+ mahsulot, 1 kunda yetkazib berish.
            </p>
          </HoverCard.Content>
        </HoverCard>
      ))}
    </div>
  );
}
