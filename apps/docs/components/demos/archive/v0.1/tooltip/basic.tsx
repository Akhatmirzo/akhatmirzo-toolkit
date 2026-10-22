'use client';

import { IconButton, Tooltip } from '@akhatmirzo/ui';
import { Copy, Heart, Share2, Trash2 } from 'lucide-react';

export default function TooltipBasic() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Tooltip content="Nusxa olish" shortcut={['mod', 'C']}>
        <IconButton variant="outline" aria-label="Nusxa olish">
          <Copy />
        </IconButton>
      </Tooltip>
      <Tooltip content="Ulashish">
        <IconButton variant="outline" aria-label="Ulashish">
          <Share2 />
        </IconButton>
      </Tooltip>
      <Tooltip content="Sevimlilarga qo'shish">
        <IconButton variant="outline" aria-label="Sevimlilarga qo'shish">
          <Heart />
        </IconButton>
      </Tooltip>
      <Tooltip content="O'chirish" shortcut={['Del']}>
        <IconButton variant="ghost" aria-label="O'chirish">
          <Trash2 />
        </IconButton>
      </Tooltip>
    </div>
  );
}
