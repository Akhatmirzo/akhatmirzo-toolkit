'use client';

import { Breadcrumb } from '@akhatmirzo/ui';
import { House } from 'lucide-react';

export default function BreadcrumbBasic() {
  return (
    <Breadcrumb
      items={[
        { label: 'Bosh sahifa', href: '#', icon: <House /> },
        { label: 'Mahsulotlar', href: '#mahsulotlar' },
        { label: 'Telefonlar', href: '#telefonlar' },
        { label: 'iPhone 17' },
      ]}
    />
  );
}
