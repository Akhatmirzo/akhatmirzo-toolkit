'use client';

import { Avatar, VirtualList } from '@akhatmirzo/ui';

const NAMES = ['Aziza Karimova', 'Bobur Toshmatov', "G'ayrat Usmonov", 'Malika Yusupova'];
const TEXTS = [
  'Assalomu alaykum!',
  "Buyurtmam qachon yetib keladi? Kecha to'lov qilgan edim.",
  "Yetkazish manzilini o'zgartirsam bo'ladimi? Hozir Samarqanddaman, kuryer oldindan qo'ng'iroq qilsin.",
  'Ha, albatta.',
  "Rahmat, mahsulot juda yoqdi. Qadoqlash ham a'lo darajada edi, do'stlarimga ham tavsiya qilaman.",
];

const messages = Array.from({ length: 2000 }, (_, i) => ({
  id: i,
  author: NAMES[(i * 3) % NAMES.length]!,
  text: TEXTS[(i * 2 + (i >> 2)) % TEXTS.length]!,
}));

export default function VirtualListDynamic() {
  return (
    <VirtualList
      dynamic
      aria-label="Mijozlar bilan yozishmalar"
      items={messages}
      estimateSize={72}
      height={400}
      getItemKey={(m) => m.id}
      className="w-full rounded-xl border border-border bg-surface"
      renderItem={(m) => (
        <div className="flex gap-3 border-b border-border px-4 py-3">
          <Avatar name={m.author} size="sm" />
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-sm font-medium">{m.author}</span>
            <p className="m-0 text-sm text-text-muted">{m.text}</p>
          </div>
        </div>
      )}
    />
  );
}
