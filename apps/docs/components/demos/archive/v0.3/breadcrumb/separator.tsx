'use client';

import { Breadcrumb } from '@akhatmirzo/ui';

const items = [
  { label: 'Sozlamalar', href: '#' },
  { label: 'Hisob', href: '#hisob' },
  { label: 'Xavfsizlik' },
];

export default function BreadcrumbSeparator() {
  return (
    <div className="flex flex-col items-start gap-4">
      <Breadcrumb items={items} separator="/" />
      <Breadcrumb items={items} size="sm" />
    </div>
  );
}
