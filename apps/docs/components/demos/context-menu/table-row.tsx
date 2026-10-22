'use client';

import { ContextMenu, DropdownMenu, IconButton, toast } from '@akhatmirzo/ui';
import { Ellipsis, Pencil, Send, Trash2 } from 'lucide-react';

const orders = [
  { id: '#1042', customer: 'Dilnoza Karimova', total: "1 250 000 so'm" },
  { id: '#1043', customer: 'Javohir Toshmatov', total: "480 000 so'm" },
];

/** ContextMenu va DropdownMenu qismlari bir xil — amallar bir marta yoziladi */
function Actions({ id, Menu }: { id: string; Menu: typeof ContextMenu | typeof DropdownMenu }) {
  return (
    <>
      <Menu.Item icon={<Pencil />} onSelect={() => toast(`${id} tahrirlanmoqda`)}>
        Tahrirlash
      </Menu.Item>
      <Menu.Sub>
        <Menu.SubTrigger icon={<Send />}>Yuborish</Menu.SubTrigger>
        <Menu.SubContent>
          <Menu.Item onSelect={() => toast('Telegram')}>Telegram</Menu.Item>
          <Menu.Item onSelect={() => toast('Email')}>Email</Menu.Item>
        </Menu.SubContent>
      </Menu.Sub>
      <Menu.Separator />
      <Menu.Item icon={<Trash2 />} variant="danger" onSelect={() => toast(`${id} o'chirildi`)}>
        O'chirish
      </Menu.Item>
    </>
  );
}

export default function ContextMenuTableRow() {
  return (
    <ul className="m-0 w-full max-w-lg list-none rounded-xl border border-border bg-surface p-0">
      {orders.map((o) => (
        <ContextMenu key={o.id}>
          <ContextMenu.Trigger asChild>
            <li className="flex items-center gap-3 border-b border-border px-4 py-2 text-sm last:border-b-0">
              <span className="font-medium">{o.id}</span>
              <span className="truncate text-text-muted">{o.customer}</span>
              <span className="ml-auto tabular-nums">{o.total}</span>
              {/* Xuddi shu amallar tugma orqali ham mavjud */}
              <DropdownMenu>
                <DropdownMenu.Trigger asChild>
                  <IconButton size="sm" variant="ghost" aria-label={`${o.id} amallari`}>
                    <Ellipsis />
                  </IconButton>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content align="end">
                  <Actions id={o.id} Menu={DropdownMenu} />
                </DropdownMenu.Content>
              </DropdownMenu>
            </li>
          </ContextMenu.Trigger>
          <ContextMenu.Content>
            <Actions id={o.id} Menu={ContextMenu} />
          </ContextMenu.Content>
        </ContextMenu>
      ))}
    </ul>
  );
}
