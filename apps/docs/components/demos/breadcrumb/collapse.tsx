'use client';

import { Breadcrumb } from '@akhatmirzo/ui';
import { House } from 'lucide-react';

export default function BreadcrumbCollapse() {
  return (
    <Breadcrumb
      maxItems={4}
      items={[
        { label: 'Bosh sahifa', href: '#', icon: <House /> },
        { label: 'Katalog', href: '#katalog' },
        { label: 'Elektronika', href: '#elektronika' },
        { label: 'Telefonlar', href: '#telefonlar' },
        { label: 'Apple', href: '#apple' },
        { label: 'iPhone 17 Pro Max 256 GB' },
      ]}
    />
  );
}
