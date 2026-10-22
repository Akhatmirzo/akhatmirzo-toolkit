'use client';

import { IconButton } from '@akhatmirzo/ui';
import { Bold, Italic, Plus, Underline } from 'lucide-react';

export default function IconButtonToolbar() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div
        role="toolbar"
        aria-label="Matn formati"
        className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1"
      >
        <IconButton variant="ghost" size="sm" aria-label="Qalin">
          <Bold />
        </IconButton>
        <IconButton variant="ghost" size="sm" aria-label="Kursiv">
          <Italic />
        </IconButton>
        <IconButton variant="ghost" size="sm" aria-label="Tagiga chizilgan">
          <Underline />
        </IconButton>
      </div>
      <IconButton variant="primary" size="lg" className="rounded-full" aria-label="Yangi buyurtma">
        <Plus />
      </IconButton>
    </div>
  );
}
