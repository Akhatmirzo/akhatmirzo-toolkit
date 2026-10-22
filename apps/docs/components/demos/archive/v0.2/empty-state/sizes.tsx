'use client';

import { EmptyState } from '@akhatmirzo/ui';
import { FolderOpen } from 'lucide-react';

export default function EmptyStateSizes() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      <EmptyState bordered size="sm" icon={<FolderOpen />} title="Kichik" description="sm" />
      <EmptyState bordered size="md" icon={<FolderOpen />} title="O'rta" description="md" />
      <EmptyState bordered size="lg" icon={<FolderOpen />} title="Katta" description="lg" />
    </div>
  );
}
