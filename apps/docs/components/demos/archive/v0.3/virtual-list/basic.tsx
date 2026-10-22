'use client';

import { Badge, Button, Input, VirtualList, type VirtualListHandle } from '@akhatmirzo/ui';
import { useMemo, useRef, useState } from 'react';

const LEVELS = [
  { label: 'Info', color: 'info', text: 'Foydalanuvchi tizimga kirdi' },
  { label: 'Tayyor', color: 'success', text: "To'lov qabul qilindi" },
  { label: 'Ogohlantirish', color: 'warning', text: 'Omborda mahsulot kam qoldi' },
  { label: 'Xato', color: 'danger', text: "SMS yuborib bo'lmadi" },
] as const;

export default function VirtualListBasic() {
  const logs = useMemo(
    () => Array.from({ length: 10_000 }, (_, i) => ({ id: i + 1, ...LEVELS[i % LEVELS.length]! })),
    [],
  );
  const ref = useRef<VirtualListHandle>(null);
  const [target, setTarget] = useState('5000');

  const go = () => ref.current?.scrollToIndex(Number(target) - 1, { align: 'start' });

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          aria-label="Qator raqami"
          inputMode="numeric"
          value={target}
          onChange={(e) => setTarget(e.target.value.replace(/\D/g, ''))}
          onKeyDown={(e) => e.key === 'Enter' && go()}
          className="w-28"
        />
        <Button variant="soft" onClick={go}>
          Qatorga o'tish
        </Button>
      </div>
      <VirtualList
        ref={ref}
        aria-label="Tizim jurnali"
        items={logs}
        estimateSize={48}
        height={400}
        overscan={8}
        getItemKey={(log) => log.id}
        className="rounded-xl border border-border bg-surface"
        renderItem={(log) => (
          <div className="flex h-12 items-center gap-3 border-b border-border px-4 text-sm">
            <span className="w-14 shrink-0 text-text-faint tabular-nums">#{log.id}</span>
            <Badge color={log.color}>{log.label}</Badge>
            <span className="min-w-0 flex-1 truncate">{log.text}</span>
          </div>
        )}
      />
    </div>
  );
}
