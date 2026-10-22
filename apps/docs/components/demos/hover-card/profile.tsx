'use client';

import { Avatar, Badge, HoverCard } from '@akhatmirzo/ui';
import { CalendarDays } from 'lucide-react';

export default function HoverCardProfile() {
  return (
    <p className="m-0 text-sm">
      Kutubxona muallifi —{' '}
      <HoverCard>
        <HoverCard.Trigger asChild>
          <a
            href="https://github.com/Akhatmirzo"
            className="focus-ring rounded-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            @akhatmirzo
          </a>
        </HoverCard.Trigger>
        <HoverCard.Content align="start">
          <div className="flex gap-3">
            <Avatar name="Akhatmirzo Umarov" />
            <div className="flex min-w-0 flex-col gap-1">
              <span className="font-semibold">Akhatmirzo Umarov</span>
              <span className="text-text-muted">
                Frontend dasturchi. React, TypeScript va o'zbekcha UI.
              </span>
              <span className="mt-1 flex items-center gap-2 text-xs text-text-muted">
                <CalendarDays className="size-3.5" aria-hidden="true" />
                2021-yildan beri
                <Badge size="sm" color="success">
                  Ochiq
                </Badge>
              </span>
            </div>
          </div>
        </HoverCard.Content>
      </HoverCard>
      .
    </p>
  );
}
