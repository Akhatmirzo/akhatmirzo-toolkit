import {
  useAsync,
  useClickOutside,
  useControllableState,
  useCopyToClipboard,
  useDebounce,
  useHotkeys,
  useIntersection,
  useLocalStorage,
  useMediaQuery,
  usePagination,
  useToggle,
} from '@akhatmirzo/hooks';
import { Badge, Button, Field, Input, Kbd, Spinner } from '@akhatmirzo/ui';
import { useEffect, useRef, useState } from 'react';
import { Code, DemoGrid, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'Hooklar', group: 'Funksiyalar', order: 4 };

const CITIES = [
  'Toshkent',
  'Samarqand',
  'Buxoro',
  'Xiva',
  'Namangan',
  'Andijon',
  "Farg'ona",
  "Qo'qon",
  'Nukus',
  'Termiz',
  'Qarshi',
  'Jizzax',
  'Guliston',
  'Navoiy',
  'Urganch',
];

function DebounceDemo() {
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 400);
  const q = debounced.trim().toLowerCase();
  const results = CITIES.filter((c) => c.toLowerCase().includes(q));
  return (
    <div className="flex flex-col gap-3">
      <Field label="Shahar qidirish" description="Natija yozishni to'xtatganingizdan 400ms keyin">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          clearable
          onClear={() => setQuery('')}
        />
      </Field>
      <DemoRow>
        <Badge color={query === debounced ? 'success' : 'warning'} dot>
          {query === debounced ? 'Yangilangan' : 'Kutilmoqda…'}
        </Badge>
        <span className="text-sm text-text-muted">
          debounced: <Code>{JSON.stringify(debounced)}</Code>
        </span>
      </DemoRow>
      <DemoRow>
        {results.length ? (
          results.map((c) => <Badge key={c}>{c}</Badge>)
        ) : (
          <span className="text-sm text-text-muted">Hech narsa topilmadi</span>
        )}
      </DemoRow>
    </div>
  );
}

function CounterView({ label }: { label: string }) {
  const [count] = useLocalStorage('playground:counter', 0);
  return (
    <span className="text-sm text-text-muted">
      {label}: <strong className="text-text">{count}</strong>
    </span>
  );
}

function LocalStorageDemo() {
  const [count, setCount, remove] = useLocalStorage('playground:counter', 0);
  return (
    <div className="flex flex-col gap-3">
      <DemoRow>
        <Button variant="outline" onClick={() => setCount((n) => n - 1)}>
          −
        </Button>
        <span className="min-w-10 text-center text-2xl font-semibold tabular-nums">{count}</span>
        <Button variant="outline" onClick={() => setCount((n) => n + 1)}>
          +
        </Button>
        <Button variant="ghost" onClick={remove}>
          O'chirish
        </Button>
      </DemoRow>
      <DemoRow>
        <CounterView label="Boshqa komponent" />
      </DemoRow>
      <p className="text-sm text-text-muted">
        Sahifani boshqa tabda oching — qiymat ikkala tabda sinxron o'zgaradi.
      </p>
    </div>
  );
}

function MediaQueryDemo() {
  const sm = useMediaQuery('(min-width: 640px)');
  const md = useMediaQuery('(min-width: 768px)');
  const lg = useMediaQuery('(min-width: 1024px)');
  const dark = useMediaQuery('(prefers-color-scheme: dark)');
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const item = (label: string, on: boolean) => (
    <Badge key={label} color={on ? 'success' : 'neutral'} variant={on ? 'soft' : 'outline'} dot>
      {label}
    </Badge>
  );
  return (
    <div className="flex flex-col gap-3">
      <DemoRow label="Ekran kengligi (oynani o'zgartirib ko'ring)">
        {item('≥ 640px', sm)}
        {item('≥ 768px', md)}
        {item('≥ 1024px', lg)}
      </DemoRow>
      <DemoRow label="Tizim sozlamalari">
        {item("Qorong'i mavzu", dark)}
        {item('Kam animatsiya', reduced)}
      </DemoRow>
    </div>
  );
}

function HotkeysDemo() {
  const [open, toggleOpen, setOpen] = useToggle(false);
  const [count, setCount] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useHotkeys('mod+k', () => {
    setCount((n) => n + 1);
    toggleOpen();
  });
  useHotkeys('esc', () => setOpen(false), { enabled: open, enableOnInputs: true });
  useClickOutside([panelRef, triggerRef], () => setOpen(false), open);

  return (
    <div className="flex flex-col gap-3">
      <DemoRow>
        <Button ref={triggerRef} variant="outline" onClick={toggleOpen}>
          Panelni ochish <Kbd keys={['mod', 'K']} />
        </Button>
        <span className="text-sm text-text-muted">
          Yorliq bosildi: <strong className="text-text">{count}</strong> marta
        </span>
      </DemoRow>
      {open && (
        <div
          ref={panelRef}
          className="flex flex-col gap-2 rounded-lg border border-border bg-surface-muted p-4 text-sm"
        >
          <Input autoFocus placeholder="Buyruq yozing…" />
          <span className="text-text-muted">
            <Kbd>Esc</Kbd> yoki tashqariga bosish (<Code>useClickOutside</Code>) — yopadi.
          </span>
        </div>
      )}
    </div>
  );
}

function CopyDemo() {
  const { copied, copy } = useCopyToClipboard();
  const text = 'pnpm add @akhatmirzo/hooks';
  return (
    <DemoRow>
      <Code>{text}</Code>
      <Button variant={copied ? 'soft' : 'outline'} size="sm" onClick={() => void copy(text)}>
        {copied ? 'Nusxalandi ✓' : 'Nusxa olish'}
      </Button>
    </DemoRow>
  );
}

function PaginationDemo() {
  const [page, setPage] = useState(5);
  const [siblings, setSiblings] = useState(1);
  const { pages, pageCount, hasPrev, hasNext, from, to } = usePagination({
    total: 200,
    pageSize: 10,
    page,
    siblings,
  });
  return (
    <div className="flex flex-col gap-3">
      <nav aria-label="Sahifalar" className="flex flex-wrap items-center gap-1">
        <Button size="sm" variant="ghost" disabled={!hasPrev} onClick={() => setPage(page - 1)}>
          ‹ Oldingi
        </Button>
        {pages.map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`e${i}`} className="px-2 text-text-muted">
              …
            </span>
          ) : (
            <Button
              key={p}
              size="sm"
              variant={p === page ? 'primary' : 'ghost'}
              aria-current={p === page ? 'page' : undefined}
              onClick={() => setPage(p)}
            >
              {p}
            </Button>
          ),
        )}
        <Button size="sm" variant="ghost" disabled={!hasNext} onClick={() => setPage(page + 1)}>
          Keyingi ›
        </Button>
      </nav>
      <DemoRow>
        <span className="text-sm text-text-muted">
          {from}–{to} / 200 yozuv · {pageCount} sahifa
        </span>
        <span className="text-sm text-text-muted">siblings:</span>
        {[0, 1, 2].map((s) => (
          <Button
            key={s}
            size="sm"
            variant={s === siblings ? 'soft' : 'ghost'}
            onClick={() => setSiblings(s)}
          >
            {s}
          </Button>
        ))}
      </DemoRow>
    </div>
  );
}

function fakeFetch(fail: boolean): Promise<string[]> {
  const delay = 600 + Math.random() * 900;
  return new Promise((resolve, reject) =>
    setTimeout(
      () =>
        fail
          ? reject(new Error('Server javob bermadi'))
          : resolve(CITIES.slice(0, 3 + Math.floor(Math.random() * 5))),
      delay,
    ),
  );
}

function AsyncDemo() {
  const [fail, toggleFail] = useToggle(false);
  const { status, data, error, run } = useAsync(
    (shouldFail: boolean) => fakeFetch(shouldFail),
    [],
    {
      immediate: false,
    },
  );
  const color = { idle: 'neutral', loading: 'info', success: 'success', error: 'danger' } as const;
  return (
    <div className="flex flex-col gap-3">
      <DemoRow>
        <Button onClick={() => void run(fail)} loading={status === 'loading'}>
          Yuklash
        </Button>
        <Button variant="ghost" onClick={toggleFail}>
          Xato rejimi: {fail ? 'yoqilgan' : "o'chirilgan"}
        </Button>
        <Badge color={color[status]} dot>
          {status}
        </Badge>
      </DemoRow>
      <p className="text-sm text-text-muted">
        Tez-tez bosing — faqat oxirgi so'rov natijasi ko'rsatiladi (race himoyasi).
      </p>
      <div className="min-h-8 text-sm">
        {status === 'error' && (
          <span className="text-danger">{error instanceof Error ? error.message : 'Xato'}</span>
        )}
        {data && (
          <DemoRow>
            {data.map((c) => (
              <Badge key={c} variant="outline">
                {c}
              </Badge>
            ))}
          </DemoRow>
        )}
      </div>
    </div>
  );
}

function IntersectionDemo() {
  const [items, setItems] = useState(12);
  const done = items >= 60;
  const [sentinelRef, entry] = useIntersection<HTMLDivElement>({
    rootMargin: '40px',
    enabled: !done,
  });
  const visible = entry?.isIntersecting ?? false;

  useEffect(() => {
    if (!visible || done) return;
    const t = setTimeout(() => setItems((n) => Math.min(60, n + 12)), 400);
    return () => clearTimeout(t);
  }, [visible, done, items]);

  return (
    <div className="h-64 overflow-auto rounded-lg border border-border">
      <ul className="divide-y divide-border">
        {Array.from({ length: items }, (_, i) => (
          <li key={i} className="px-4 py-2 text-sm">
            Yozuv #{i + 1}
          </li>
        ))}
      </ul>
      <div
        ref={sentinelRef}
        className="flex items-center justify-center gap-2 p-3 text-sm text-text-muted"
      >
        {done ? (
          'Hammasi yuklandi'
        ) : (
          <>
            <Spinner size="sm" /> Yuklanmoqda…
          </>
        )}
      </div>
    </div>
  );
}

function Stepper({
  value,
  defaultValue = 0,
  onChange,
}: {
  value?: number;
  defaultValue?: number;
  onChange?: (v: number) => void;
}) {
  const [n, setN] = useControllableState({ value, defaultValue, onChange });
  return (
    <DemoRow>
      <Button size="sm" variant="outline" onClick={() => setN((x) => x - 1)}>
        −
      </Button>
      <span className="min-w-8 text-center font-semibold tabular-nums">{n}</span>
      <Button size="sm" variant="outline" onClick={() => setN((x) => x + 1)}>
        +
      </Button>
    </DemoRow>
  );
}

function ControllableDemo() {
  const [value, setValue] = useState(10);
  return (
    <DemoGrid min={220}>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-text-muted">Boshqarilmaydigan (defaultValue=3)</p>
        <Stepper defaultValue={3} />
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-text-muted">
          Boshqariladigan (0..20 oralig'ida cheklangan)
        </p>
        <Stepper value={value} onChange={(v) => setValue(Math.max(0, Math.min(20, v)))} />
      </div>
    </DemoGrid>
  );
}

export default function Page() {
  return (
    <DemoPage
      title="Hooklar"
      description={
        <>
          <Code>@akhatmirzo/hooks</Code> — bog'liqliksiz, SSR-xavfsiz React hooklar. Keyingi bosqich
          komponentlari (Combobox, DataTable, Command Palette) shular ustiga quriladi.
        </>
      }
    >
      <DemoSection title="useDebounce" description="Qidiruvda har bir harfga so'rov yubormaslik">
        <DebounceDemo />
      </DemoSection>

      <DemoSection
        title="useLocalStorage"
        description="JSON saqlash, bir sahifadagi hooklar va boshqa tablar bilan sinxron"
      >
        <LocalStorageDemo />
      </DemoSection>

      <DemoSection title="useMediaQuery" description={<Code>useSyncExternalStore</Code>}>
        <MediaQueryDemo />
      </DemoSection>

      <DemoSection
        title="useHotkeys + useClickOutside"
        description={
          <>
            <Code>mod</Code> — macOS'da ⌘, boshqalarida Ctrl. Bir nechta kombinatsiya vergul bilan.
          </>
        }
      >
        <HotkeysDemo />
      </DemoSection>

      <DemoSection title="useCopyToClipboard" description="2 soniyadan so'ng holat qaytadi">
        <CopyDemo />
      </DemoSection>

      <DemoSection title="usePagination" description='DataTable uchun: "1 … 4 5 6 … 20"'>
        <PaginationDemo />
      </DemoSection>

      <DemoSection title="useAsync" description="idle → loading → success | error">
        <AsyncDemo />
      </DemoSection>

      <DemoSection title="useIntersection" description="Cheksiz scroll: pastga aylantiring">
        <IntersectionDemo />
      </DemoSection>

      <DemoSection
        title="useControllableState"
        description="Bitta komponent — ham boshqariladigan, ham boshqarilmaydigan"
      >
        <ControllableDemo />
      </DemoSection>
    </DemoPage>
  );
}
