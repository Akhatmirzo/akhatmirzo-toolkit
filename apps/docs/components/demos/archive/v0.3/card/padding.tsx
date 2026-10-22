'use client';

import { Card } from '@akhatmirzo/ui';

const paddings = [
  { padding: 'sm', px: 16 },
  { padding: 'md', px: 24 },
  { padding: 'lg', px: 32 },
] as const;

export default function CardPadding() {
  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
      {paddings.map(({ padding, px }) => (
        <Card key={padding} variant="outline" padding={padding}>
          <div className="rounded-md bg-primary-soft p-2 text-xs font-medium text-primary-soft-foreground">
            {padding} · {px}px
          </div>
        </Card>
      ))}
    </div>
  );
}
