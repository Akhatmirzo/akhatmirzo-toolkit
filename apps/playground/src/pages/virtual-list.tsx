import { formatMoney, timeAgo } from '@akhatmirzo/core';
import { Avatar, Badge, Button, Input, VirtualList, type VirtualListHandle } from '@akhatmirzo/ui';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Code, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'VirtualList', group: "Ma'lumotlar", order: 2 };

type Level = 'info' | 'warning' | 'error' | 'success';

interface Log {
  id: number;
  level: Level;
  message: string;
  time: Date;
}

const levelColor = {
  info: 'info',
  warning: 'warning',
  error: 'danger',
  success: 'success',
} as const;

const levelText: Record<Level, string> = {
  info: 'Info',
  warning: 'Ogohlantirish',
  error: 'Xato',
  success: 'Tayyor',
};

const messages: Array<[Level, string]> = [
  ['info', 'Foydalanuvchi tizimga kirdi'],
  ['success', "To'lov qabul qilindi"],
  ['warning', 'Omborda mahsulot kam qoldi'],
  ['info', 'Buyurtma kuryerga topshirildi'],
  ['error', "SMS yuborib bo'lmadi: operator javob bermadi"],
  ['success', 'Hisobot eksport qilindi'],
  ['info', 'Narxlar yangilandi'],
];

const NOW = Date.now();

function makeLogs(count: number): Log[] {
  return Array.from({ length: count }, (_, i) => {
    const [level, message] = messages[i % messages.length]!;
    return { id: i + 1, level, message, time: new Date(NOW - i * 37_000) };
  });
}

const names = [
  'Aziza Karimova',
  'Bobur Toshmatov',
  'Dilnoza Rahimova',
  "G'ayrat Usmonov",
  'Jasur Qodirov',
  'Malika Yusupova',
];

const sentences = [
  'Assalomu alaykum!',
  "Buyurtmam qachon yetib keladi? Kecha to'lov qilgan edim.",
  "Rahmat, mahsulot juda yoqdi. Qadoqlash ham a'lo darajada edi, do'stlarimga ham tavsiya qilaman.",
  "Yetkazib berish manzilini o'zgartirsam bo'ladimi? Hozir Toshkentda emasman, Samarqanddagi manzilga jo'natib yuborsangiz. Iltimos, kuryer oldindan qo'ng'iroq qilsin.",
  'Ha, albatta.',
  'Kartadan pul yechildi, lekin buyurtma holati hali ham "To\'lanmagan" bo\'lib turibdi. Iltimos, tekshirib bering.',
];

interface Message {
  id: number;
  author: string;
  text: string;
}

const chat: Message[] = Array.from({ length: 2000 }, (_, i) => ({
  id: i,
  author: names[(i * 7) % names.length]!,
  text: sentences[(i * 5 + (i >> 2)) % sentences.length]!,
}));

interface Order {
  id: number;
  customer: string;
  total: number;
}

const PAGE = 40;
const TOTAL_ORDERS = 400;

function makeOrders(from: number, count: number): Order[] {
  return Array.from({ length: count }, (_, i) => {
    const id = from + i + 1;
    return {
      id,
      customer: names[id % names.length]!,
      total: (((id * 7919) % 90) + 10) * 15_000,
    };
  });
}

function LogRow({ log }: { log: Log }) {
  return (
    <div className="flex h-12 items-center gap-3 border-b border-border px-4 text-sm">
      <span className="w-14 shrink-0 font-mono text-xs text-text-faint tabular-nums">
        #{log.id}
      </span>
      <Badge color={levelColor[log.level]} className="w-28 shrink-0 justify-center">
        {levelText[log.level]}
      </Badge>
      <span className="min-w-0 flex-1 truncate">{log.message}</span>
      <span className="shrink-0 text-xs text-text-muted max-sm:hidden">
        {timeAgo(log.time, NOW)}
      </span>
    </div>
  );
}

function LogsDemo() {
  const logs = useMemo(() => makeLogs(10_000), []);
  const ref = useRef<VirtualListHandle>(null);
  const [target, setTarget] = useState('5000');

  const go = () => {
    const n = Number(target);
    if (Number.isFinite(n) && n >= 1) ref.current?.scrollToIndex(n - 1, { align: 'start' });
  };

  return (
    <>
      <DemoRow>
        <Input
          aria-label="Qator raqami"
          inputMode="numeric"
          value={target}
          onChange={(e) => setTarget(e.target.value.replace(/\D/g, ''))}
          onKeyDown={(e) => e.key === 'Enter' && go()}
          className="w-32"
        />
        <Button variant="soft" onClick={go}>
          Qatorga o'tish
        </Button>
        <Button variant="ghost" onClick={() => ref.current?.scrollToIndex(0)}>
          Boshiga
        </Button>
        <Button variant="ghost" onClick={() => ref.current?.scrollToIndex(logs.length - 1)}>
          Oxiriga
        </Button>
      </DemoRow>
      <VirtualList
        ref={ref}
        aria-label="Tizim jurnali"
        items={logs}
        estimateSize={48}
        height={480}
        overscan={8}
        getItemKey={(log) => log.id}
        renderItem={(log) => <LogRow log={log} />}
        className="rounded-xl border border-border bg-surface"
      />
    </>
  );
}

function ChatDemo() {
  return (
    <VirtualList
      dynamic
      aria-label="Mijozlar bilan yozishmalar"
      items={chat}
      estimateSize={72}
      height={420}
      getItemKey={(m) => m.id}
      className="rounded-xl border border-border bg-surface"
      renderItem={(m) => (
        <div className="flex gap-3 border-b border-border px-4 py-3">
          <Avatar name={m.author} size="sm" />
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-sm font-medium">
              {m.author} <span className="font-normal text-text-faint">· #{m.id + 1}</span>
            </span>
            <p className="m-0 text-sm text-text-muted">{m.text}</p>
          </div>
        </div>
      )}
    />
  );
}

function InfiniteDemo() {
  const [orders, setOrders] = useState<Order[]>(() => makeOrders(0, PAGE));
  const [loading, setLoading] = useState(false);
  const [calls, setCalls] = useState(0);
  const finished = orders.length >= TOTAL_ORDERS;

  const loadMore = useCallback(() => {
    if (finished) return;
    setLoading(true);
    setCalls((c) => c + 1);
    setTimeout(() => {
      setOrders((prev) => [...prev, ...makeOrders(prev.length, PAGE)]);
      setLoading(false);
    }, 900);
  }, [finished]);

  return (
    <>
      <p className="m-0 text-sm text-text-muted">
        Yuklangan: <b className="text-text tabular-nums">{orders.length}</b> / {TOTAL_ORDERS} ·
        onEndReached chaqiruvlari: <b className="text-text tabular-nums">{calls}</b>
        {finished && ' · Hammasi yuklandi'}
      </p>
      <VirtualList
        aria-label="Buyurtmalar"
        items={orders}
        estimateSize={52}
        height={360}
        loadingMore={loading}
        onEndReached={loadMore}
        getItemKey={(o) => o.id}
        labels={{ loadingMore: 'Buyurtmalar yuklanmoqda...' }}
        className="rounded-xl border border-border bg-surface"
        renderItem={(o) => (
          <div className="flex h-13 items-center gap-3 border-b border-border px-4 text-sm">
            <span className="w-14 shrink-0 text-text-faint tabular-nums">№{o.id}</span>
            <span className="min-w-0 flex-1 truncate">{o.customer}</span>
            <span className="shrink-0 font-medium tabular-nums">{formatMoney(o.total)}</span>
          </div>
        )}
      />
    </>
  );
}

export default function Page() {
  return (
    <DemoPage
      title="VirtualList"
      description={
        <>
          Katta ro'yxatlar uchun (TanStack Virtual): DOM'da faqat ko'rinadigan qatorlar va{' '}
          <Code>overscan</Code> bo'ladi. <Code>role="list"</Code>, har bir qatorda{' '}
          <Code>aria-setsize</Code> / <Code>aria-posinset</Code>. Konteyner klaviatura bilan
          fokuslanadi — <Code>↑ ↓ PageUp PageDown</Code> bilan aylantiriladi.
        </>
      }
    >
      <DemoSection
        title="10 000 qator"
        description="Belgilangan balandlik (48px). ref orqali scrollToIndex — istalgan qatorga o'tish."
      >
        <LogsDemo />
      </DemoSection>

      <DemoSection
        title="Dinamik balandlik"
        description="dynamic — har xil uzunlikdagi xabarlar o'lchab olinadi (2 000 ta). estimateSize faqat boshlang'ich taxmin."
      >
        <ChatDemo />
      </DemoSection>

      <DemoSection
        title="Cheksiz yuklash"
        description="onEndReached — oxiriga 5 qator qolganda chaqiriladi; loadingMore paytida pastda Spinner qatori va qayta chaqirilmaydi."
      >
        <InfiniteDemo />
      </DemoSection>

      <DemoSection title="Bo'sh holat" description="items bo'sh — emptyState yoki standart matn.">
        <VirtualList
          items={[]}
          estimateSize={48}
          height={160}
          renderItem={() => null}
          emptyState="Hali yozuvlar yo'q"
          className="rounded-xl border border-border bg-surface"
        />
      </DemoSection>
    </DemoPage>
  );
}
