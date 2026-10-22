import {
  useDocumentVisibility,
  useEventListener,
  useFocusTrap,
  useIsClient,
  useLongPress,
  useResizeObserver,
  useScrollLock,
  useToggle,
} from '@akhatmirzo/hooks';
import { Badge, Button, Field, Input, Kbd } from '@akhatmirzo/ui';
import { useRef, useState } from 'react';
import { Code, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'Hooklar: DOM', group: 'Funksiyalar', order: 4.1 };

function EventListenerDemo() {
  const [width, setWidth] = useState(() => window.innerWidth);
  const [lastKey, setLastKey] = useState<string | null>(null);
  const [clicks, setClicks] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  useEventListener('resize', () => setWidth(window.innerWidth));
  useEventListener(document, 'keydown', (event) => setLastKey(event.key));
  useEventListener(boxRef, 'dblclick', () => setClicks((n) => n + 1));

  return (
    <DemoRow>
      <Badge variant="outline">window: {width}px</Badge>
      <span className="flex items-center gap-1 text-sm">
        document keydown: {lastKey ? <Kbd>{lastKey === ' ' ? 'Space' : lastKey}</Kbd> : '—'}
      </span>
      <div
        ref={boxRef}
        className="rounded-lg border border-border px-3 py-2 text-sm select-none text-text-muted"
      >
        Ikki marta bosing (ref): <Code>{clicks}</Code>
      </div>
    </DemoRow>
  );
}

function ResizeObserverDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const content = useResizeObserver(ref);
  const border = useResizeObserver(ref, { box: 'border-box' });
  return (
    <div
      ref={ref}
      className="flex h-36 w-80 min-w-40 max-w-full resize flex-col justify-center gap-1 overflow-auto rounded-xl border-4 border-border p-4 text-sm"
    >
      <span>
        content-box:{' '}
        <Code>
          {content ? `${Math.round(content.width)} × ${Math.round(content.height)}` : '…'}
        </Code>
      </span>
      <span>
        border-box:{' '}
        <Code>{border ? `${Math.round(border.width)} × ${Math.round(border.height)}` : '…'}</Code>
      </span>
      <span className="text-xs text-text-muted">O'ng pastki burchakdan torting</span>
    </div>
  );
}

function ScrollLockDemo() {
  const [a, toggleA] = useToggle(false);
  const [b, toggleB] = useToggle(false);
  const [inner, toggleInner] = useToggle(false);
  const innerRef = useRef<HTMLDivElement>(null);
  useScrollLock(a);
  useScrollLock(b);
  useScrollLock(inner, { target: innerRef });

  return (
    <div className="flex flex-col gap-4">
      <DemoRow label="Ikki mustaqil qulf (hisoblagich): ikkalasi ochilgandagina scroll qaytadi">
        <Button variant={a ? 'primary' : 'outline'} onClick={toggleA}>
          Qulf A: {a ? 'yoniq' : "o'chiq"}
        </Button>
        <Button variant={b ? 'primary' : 'outline'} onClick={toggleB}>
          Qulf B: {b ? 'yoniq' : "o'chiq"}
        </Button>
      </DemoRow>
      <DemoRow label="target — ichki konteyner">
        <Button variant={inner ? 'primary' : 'outline'} onClick={toggleInner}>
          Ro'yxat: {inner ? 'qulflangan' : 'erkin'}
        </Button>
        <div ref={innerRef} className="h-28 w-56 overflow-auto rounded-lg border border-border">
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="px-3 py-1 text-sm">
              Buyurtma #{1000 + i}
            </div>
          ))}
        </div>
      </DemoRow>
    </div>
  );
}

function FocusTrapDemo() {
  const [open, toggle, setOpen] = useToggle(false);
  const [nested, toggleNested] = useToggle(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const nestedRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useFocusTrap(panelRef, open, { initialFocus: inputRef });
  useFocusTrap(nestedRef, nested);

  return (
    <div className="flex flex-col gap-3">
      <DemoRow>
        <Button variant="outline" onClick={toggle} aria-expanded={open}>
          {open ? 'Yopish' : 'Panelni ochish'}
        </Button>
        <span className="text-sm text-text-muted">
          <Kbd>Tab</Kbd> / <Kbd>Shift+Tab</Kbd> panel ichida aylanadi
        </span>
      </DemoRow>
      {open && (
        <div
          ref={panelRef}
          className="flex max-w-sm flex-col gap-3 rounded-xl border border-border p-4"
        >
          <Field label="Shahar">
            <Input ref={inputRef} placeholder="Toshkent" />
          </Field>
          <DemoRow>
            <Button variant="soft" onClick={toggleNested}>
              Ichki tuzoq {nested ? '✓' : ''}
            </Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Saqlash
            </Button>
          </DemoRow>
          {nested && (
            <div ref={nestedRef} className="flex gap-2 rounded-lg border border-border p-3">
              <Button size="sm">Bir</Button>
              <Button size="sm">Ikki</Button>
              <Button size="sm" variant="ghost" onClick={toggleNested}>
                Chiqish
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LongPressDemo() {
  const [log, setLog] = useState<string[]>([]);
  const push = (line: string) => setLog((l) => [line, ...l].slice(0, 5));
  const handlers = useLongPress<HTMLButtonElement>(() => push('✔ uzoq bosildi'), {
    delay: 600,
    onStart: () => push('… boshlandi'),
    onCancel: () => push('✖ bekor qilindi'),
  });
  return (
    <DemoRow>
      <button
        type="button"
        {...handlers}
        className="h-24 w-48 touch-none select-none rounded-xl border border-border bg-surface-muted text-sm"
      >
        0,6 s bosib turing
      </button>
      <ul className="flex flex-col gap-1 font-mono text-xs text-text-muted">
        {log.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
    </DemoRow>
  );
}

function VisibilityDemo() {
  const visibility = useDocumentVisibility();
  const isClient = useIsClient();
  const [hiddenCount, setHiddenCount] = useState(0);
  useEventListener(document, 'visibilitychange', () => {
    if (document.visibilityState === 'hidden') setHiddenCount((n) => n + 1);
  });
  return (
    <DemoRow>
      <Badge color={visibility === 'visible' ? 'success' : 'neutral'} dot>
        {visibility}
      </Badge>
      <span className="text-sm">
        Yashirilgan: <Code>{hiddenCount}</Code> marta
      </span>
      <Badge variant="outline">useIsClient: {String(isClient)}</Badge>
    </DemoRow>
  );
}

export default function Page() {
  return (
    <DemoPage
      title="Hooklar: DOM va hodisalar"
      description="useEventListener, useResizeObserver, useScrollLock, useFocusTrap, useLongPress, useDocumentVisibility, useIsClient"
    >
      <DemoSection title="useEventListener" description="window (qisqa shakl), document va ref">
        <EventListenerDemo />
      </DemoSection>
      <DemoSection title="useResizeObserver" description="rAF bilan birlashtirilgan o'lchov">
        <ResizeObserverDemo />
      </DemoSection>
      <DemoSection title="useScrollLock" description="Scrollbar kengligi padding bilan qoplanadi">
        <ScrollLockDemo />
      </DemoSection>
      <DemoSection title="useFocusTrap" description="initialFocus, returnFocus, ichma-ich tuzoq">
        <FocusTrapDemo />
      </DemoSection>
      <DemoSection title="useLongPress" description="10px dan ko'p siljisa bekor qilinadi">
        <LongPressDemo />
      </DemoSection>
      <DemoSection
        title="useDocumentVisibility · useIsClient"
        description="Boshqa tabga o'tib qayting"
      >
        <VisibilityDemo />
      </DemoSection>
    </DemoPage>
  );
}
