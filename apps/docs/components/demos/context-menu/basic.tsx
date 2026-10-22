'use client';

import { ContextMenu, toast } from '@akhatmirzo/ui';
import { Copy, Download, FileText, Pencil, Trash2 } from 'lucide-react';

export default function ContextMenuBasic() {
  return (
    <ContextMenu>
      <ContextMenu.Trigger asChild>
        <div className="flex w-72 items-center gap-3 rounded-xl border border-dashed border-border-strong bg-surface p-4 select-none">
          <span className="grid size-10 place-items-center rounded-lg bg-primary-soft text-primary-soft-foreground">
            <FileText className="size-5" aria-hidden="true" />
          </span>
          <span className="flex flex-col">
            <span className="text-sm font-medium">Hisobot-2026.pdf</span>
            <span className="text-xs text-text-muted">O'ng tugma bilan bosing</span>
          </span>
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item
          icon={<Pencil />}
          shortcut={['mod', 'E']}
          onSelect={() => toast('Tahrirlash')}
        >
          Tahrirlash
        </ContextMenu.Item>
        <ContextMenu.Item
          icon={<Copy />}
          shortcut={['mod', 'D']}
          onSelect={() => toast('Nusxa olindi')}
        >
          Nusxa olish
        </ContextMenu.Item>
        <ContextMenu.Item icon={<Download />} onSelect={() => toast('Yuklanmoqda')}>
          Yuklab olish
        </ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item icon={<Trash2 />} variant="danger" onSelect={() => toast("O'chirildi")}>
          O'chirish
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu>
  );
}
