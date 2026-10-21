'use client';

import { IconButton } from '@akhatmirzo/ui';
import { Heart, Pencil, Plus, Share2, Trash2 } from 'lucide-react';

export default function IconButtonVariants() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <IconButton variant="primary" aria-label="Qo'shish">
        <Plus />
      </IconButton>
      <IconButton aria-label="Sevimlilarga qo'shish">
        <Heart />
      </IconButton>
      <IconButton variant="outline" aria-label="Tahrirlash">
        <Pencil />
      </IconButton>
      <IconButton variant="ghost" aria-label="Ulashish">
        <Share2 />
      </IconButton>
      <IconButton variant="danger" aria-label="O'chirish">
        <Trash2 />
      </IconButton>
    </div>
  );
}
