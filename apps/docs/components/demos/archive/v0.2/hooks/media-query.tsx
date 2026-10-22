'use client';

import { useMediaQuery } from '@akhatmirzo/hooks';
import { Badge } from '@akhatmirzo/ui';

export default function HooksMediaQuery() {
  const queries = [
    { label: '≥ 640px', on: useMediaQuery('(min-width: 640px)') },
    { label: '≥ 1024px', on: useMediaQuery('(min-width: 1024px)') },
    { label: "Tizim: qorong'i mavzu", on: useMediaQuery('(prefers-color-scheme: dark)') },
    { label: 'Kam animatsiya', on: useMediaQuery('(prefers-reduced-motion: reduce)') },
    { label: 'Sichqoncha (hover)', on: useMediaQuery('(hover: hover)') },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {queries.map(({ label, on }) => (
        <Badge key={label} color={on ? 'success' : 'neutral'} variant={on ? 'soft' : 'outline'} dot>
          {label}
        </Badge>
      ))}
    </div>
  );
}
