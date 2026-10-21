import * as ToastPrimitive from '@radix-ui/react-toast';
import { useMediaQuery } from '@akhatmirzo/hooks';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../button';
import { spinnerVariants } from '../spinner/spinner';
import {
  dismissToast,
  getSnapshot,
  subscribe,
  upsertToast,
  type ToastId,
  type ToastOptions,
  type ToastRecord,
  type ToastType,
} from './toast-store';
import { MOBILE_QUERY } from '../../lib/media';

export type { ToastAction, ToastId, ToastOptions, ToastType } from './toast-store';

/* ---------- Imperativ API ---------- */

export type ToastTypedOptions = Omit<ToastOptions, 'type'>;

export interface ToastPromiseMessages<T> {
  loading: ReactNode;
  success: ReactNode | ((data: T) => ReactNode);
  error: ReactNode | ((error: unknown) => ReactNode);
}

function resolveMessage<A>(message: ReactNode | ((arg: A) => ReactNode), arg: A): ReactNode {
  return typeof message === 'function' ? message(arg) : message;
}

const typed =
  (type: ToastType) =>
  (title: ReactNode, options?: ToastTypedOptions): ToastId =>
    upsertToast(title, { ...options, type });

/**
 * Promise holatini kuzatadi: loading → success / error (bitta toast yangilanadi).
 * Asl promise qaytariladi.
 */
function promiseToast<T>(
  promise: Promise<T> | (() => Promise<T>),
  messages: ToastPromiseMessages<T>,
  options?: Omit<ToastTypedOptions, 'duration'>,
): Promise<T> {
  const p = typeof promise === 'function' ? promise() : promise;
  const id = upsertToast(messages.loading, { ...options, type: 'loading' });
  p.then(
    (data) =>
      upsertToast(resolveMessage(messages.success, data), { ...options, id, type: 'success' }),
    (error: unknown) =>
      upsertToast(resolveMessage(messages.error, error), { ...options, id, type: 'error' }),
  );
  return p;
}

/**
 * Bildirishnoma ko'rsatadi; ilovada bitta `<Toaster />` bo'lishi kerak.
 * @example
 * toast('Saqlandi');
 * const id = toast.loading('Yuklanmoqda...');
 * toast.success('Yuklandi', { id });
 */
export const toast = Object.assign(
  (title: ReactNode, options?: ToastOptions): ToastId => upsertToast(title, options),
  {
    success: typed('success'),
    error: typed('error'),
    warning: typed('warning'),
    info: typed('info'),
    loading: typed('loading'),
    promise: promiseToast,
    /** id berilmasa — barchasi yopiladi */
    dismiss: (id?: ToastId) => dismissToast(id),
  },
);

/* ---------- Ikonkalar ---------- */

function StatusIcon({ type }: { type: ToastType }) {
  if (type === 'loading') {
    return (
      <span
        aria-hidden="true"
        className={cn(spinnerVariants({ size: 'md' }), 'm-px size-4.5 text-primary')}
      />
    );
  }
  if (type === 'default') return null;
  const color = {
    success: 'text-success',
    error: 'text-danger',
    warning: 'text-warning',
    info: 'text-info',
  }[type];
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('size-5', color)}
    >
      {type === 'warning' ? (
        <>
          <path d="M8.6 3.4 2.2 14.5A1.6 1.6 0 0 0 3.6 17h12.8a1.6 1.6 0 0 0 1.4-2.5L11.4 3.4a1.6 1.6 0 0 0-2.8 0Z" />
          <path d="M10 8v3.2M10 14h.01" />
        </>
      ) : (
        <>
          <circle cx="10" cy="10" r="7.5" />
          {type === 'success' && <path d="m7 10.2 2 2 4-4.2" />}
          {type === 'error' && <path d="M10 6.5v4M10 13.5h.01" />}
          {type === 'info' && <path d="M10 9.5v4M10 6.5h.01" />}
        </>
      )}
    </svg>
  );
}

/* ---------- Toaster ---------- */

export type ToastPosition =
  'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface ToasterLabels {
  /** Hudud nomi; `{hotkey}` tugma nomi bilan almashtiriladi */
  region?: string;
  /** Ekran o'quvchi e'loni oldidan qo'shiladigan so'z */
  toast?: string;
  /** ✕ tugmasi */
  close?: string;
}

export interface ToasterProps {
  /** Default `bottom-right`; telefonda (< 640px) doim pastda, to'liq kenglikda */
  position?: ToastPosition;
  /** Default davomiylik, ms (`error` — 6000, `loading` — cheksiz) */
  duration?: number;
  /** Bir vaqtda ko'rinadigan toastlar soni. Default 3 */
  visibleToasts?: number;
  /** Yoyilgan holatda toastlar orasidagi masofa, px */
  gap?: number;
  /** Har bir toastda ✕ tugmasi */
  closeButton?: boolean;
  /** Toast hududiga fokus tugmasi. Default `['F8']` */
  hotkey?: string[];
  labels?: ToasterLabels;
  className?: string;
}

const positionClass: Record<ToastPosition, string> = {
  'top-left': 'top-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'top-right': 'top-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-4 right-4',
};

export function Toaster({
  position: positionProp = 'bottom-right',
  duration = 4000,
  visibleToasts = 3,
  gap = 8,
  closeButton = false,
  hotkey = ['F8'],
  labels,
  className,
}: ToasterProps) {
  const toasts = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const mobile = useMediaQuery(MOBILE_QUERY);
  const position: ToastPosition = mobile ? 'bottom-center' : positionProp;
  const fromTop = position.startsWith('top');

  const [heights, setHeights] = useState<Record<string, number>>({});
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleHeight = useCallback((id: ToastId, height: number | undefined) => {
    const key = String(id);
    setHeights((prev) => {
      if (prev[key] === height) return prev;
      const next = { ...prev };
      if (height === undefined) delete next[key];
      else next[key] = height;
      return next;
    });
  }, []);

  // Eng yangisi oldinda
  const openToasts = toasts.filter((t) => t.open).reverse();
  const expanded = (hovered || focused) && openToasts.length > 0;
  const visible = openToasts.slice(0, visibleToasts);
  const heightOf = (t: ToastRecord) => heights[String(t.id)] ?? 0;

  const layout = new Map<ToastId, { index: number; offset: number }>();
  let offset = 0;
  openToasts.forEach((t, index) => {
    layout.set(t.id, { index, offset });
    offset += heightOf(t) + gap;
  });

  const frontHeight = visible[0] ? heightOf(visible[0]) : 0;
  const expandedHeight =
    visible.reduce((sum, t) => sum + heightOf(t), 0) + gap * (visible.length - 1);

  // Toastlar ol ichiga portal orqali chiziladi — React hodisalari React daraxti bo'ylab
  // tarqalgani uchun hover/fokus native (DOM) hodisalar bilan kuzatiladi
  const [viewport, setViewport] = useState<HTMLOListElement | null>(null);
  useEffect(() => {
    if (!viewport) return;
    const enter = () => setHovered(true);
    const leave = () => setHovered(false);
    const focusIn = () => setFocused(true);
    const focusOut = (e: FocusEvent) => {
      if (!viewport.contains(e.relatedTarget as Node | null)) setFocused(false);
    };
    viewport.addEventListener('pointerenter', enter);
    viewport.addEventListener('pointerleave', leave);
    viewport.addEventListener('focusin', focusIn);
    viewport.addEventListener('focusout', focusOut);
    return () => {
      viewport.removeEventListener('pointerenter', enter);
      viewport.removeEventListener('pointerleave', leave);
      viewport.removeEventListener('focusin', focusIn);
      viewport.removeEventListener('focusout', focusOut);
    };
  }, [viewport]);

  return (
    <ToastPrimitive.Provider
      swipeDirection={position.endsWith('left') ? 'left' : 'right'}
      duration={duration}
      label={labels?.toast ?? 'Bildirishnoma'}
    >
      {toasts.map((t) => {
        const place = layout.get(t.id);
        return (
          <ToastItem
            key={t.id}
            toast={t}
            index={place?.index ?? 0}
            offset={place?.offset ?? 0}
            hidden={(place?.index ?? 0) >= visibleToasts}
            frontHeight={frontHeight}
            expanded={expanded}
            fromTop={fromTop}
            defaultDuration={duration}
            closeButton={closeButton}
            closeLabel={labels?.close ?? 'Yopish'}
            onHeight={handleHeight}
          />
        );
      })}
      <ToastPrimitive.Viewport
        hotkey={hotkey}
        label={labels?.region ?? 'Bildirishnomalar ({hotkey})'}
        data-position={position}
        data-expanded={expanded ? '' : undefined}
        ref={setViewport}
        style={{ height: expanded ? expandedHeight : frontHeight }}
        className={cn(
          'fixed z-(--ak-z-toast) m-0 list-none p-0 outline-none',
          'w-[min(360px,calc(100vw-32px))]',
          mobile ? 'inset-x-4 bottom-4 w-auto' : positionClass[position],
          className,
        )}
      />
    </ToastPrimitive.Provider>
  );
}

/* ---------- Bitta toast ---------- */

interface ToastItemProps {
  toast: ToastRecord;
  index: number;
  offset: number;
  hidden: boolean;
  expanded: boolean;
  fromTop: boolean;
  defaultDuration: number;
  closeButton: boolean;
  closeLabel: string;
  /** Yig'iq dastada orqadagilar old toast balandligiga qisqaradi */
  frontHeight: number;
  onHeight: (id: ToastId, height: number | undefined) => void;
}

function ToastItem({
  toast: t,
  index,
  offset,
  hidden,
  expanded,
  fromTop,
  defaultDuration,
  closeButton,
  closeLabel,
  frontHeight,
  onHeight,
}: ToastItemProps) {
  const [node, setNode] = useState<HTMLLIElement | null>(null);
  const { id, open } = t;

  useLayoutEffect(() => {
    if (!node) return;
    // scrollHeight — qisqartirilgan (height berilgan) holatda ham tabiiy balandlik
    const report = () => onHeight(id, node.scrollHeight);
    report();
    const ro = new ResizeObserver(report);
    ro.observe(node);
    return () => ro.disconnect();
  }, [node, id, onHeight, t.version]);

  useEffect(() => () => onHeight(id, undefined), [id, onHeight]);

  // Dasta: yig'iq holatda orqadagilar 10px yuqorida va kichikroq, yoyilganda — ustma-ust
  const dir = fromTop ? 1 : -1;
  const liveTransform = expanded
    ? `translateY(${dir * offset}px)`
    : `translateY(${dir * index * 10}px) scale(${1 - index * 0.05})`;
  const clipTo = !expanded && index > 0 && frontHeight > 0 ? frontHeight : 0;
  const liveKey = `${liveTransform}|${100 - index}|${hidden ? 1 : 0}|${clipTo}`;
  // Yopilayotgan toast oxirgi joyida qoladi (boshqalar siljiganda u sakramaydi)
  const [frozenKey, setFrozenKey] = useState(liveKey);
  if (open && frozenKey !== liveKey) setFrozenKey(liveKey);
  const [transform, zIndex, hiddenFlag, clip] = (open ? liveKey : frozenKey).split('|');
  const isHidden = hiddenFlag === '1';

  const baseDuration =
    t.duration ?? (t.type === 'error' ? 6000 : t.type === 'loading' ? Infinity : defaultDuration);
  // Ko'rinmaydiganlar kutadi; yangilanganda (version) taymer qaytadan boshlanadi
  const duration = isHidden
    ? Infinity
    : baseDuration === Infinity
      ? Infinity
      : baseDuration + (t.version % 2) * 0.01;

  const icon = t.icon !== undefined ? t.icon : <StatusIcon type={t.type} />;
  const actionAlt =
    t.action?.altText ?? (typeof t.action?.label === 'string' ? t.action.label : 'Amal');

  return (
    <ToastPrimitive.Root
      ref={setNode}
      open={open}
      onOpenChange={(next) => {
        if (!next) dismissToast(id);
      }}
      duration={duration}
      type={t.type === 'error' ? 'foreground' : 'background'}
      role={t.type === 'error' ? 'alert' : 'status'}
      data-type={t.type}
      data-index={index}
      data-front={index === 0 ? '' : undefined}
      data-hidden={isHidden ? '' : undefined}
      data-expanded={expanded ? '' : undefined}
      inert={isHidden || undefined}
      style={{
        transform,
        height: Number(clip) || undefined,
        overflow: Number(clip) ? 'hidden' : undefined,
        zIndex: Number(zIndex),
        opacity: isHidden ? 0 : undefined,
        pointerEvents: isHidden ? 'none' : undefined,
      }}
      className={cn(
        'absolute inset-x-0 flex w-full items-start gap-2.5 rounded-xl bg-surface-raised px-4 py-3.5 font-sans text-sm text-text shadow-lg outline-none focus-ring',
        // Tepadagi toast yuqoridan tushadi, pastdagisi pastdan ko'tariladi
        fromTop ? 'top-0 origin-top [--ak-toast-shift:-16px]' : 'bottom-0 origin-bottom',
        '[transition:transform_var(--ak-duration-slow)_var(--ak-ease-spring),opacity_var(--ak-duration-moderate)_var(--ak-ease-out)]',
        'data-[state=open]:animate-toast-in data-[state=closed]:animate-toast-out',
        'motion-reduce:transition-none motion-reduce:data-[state=open]:animate-overlay-in motion-reduce:data-[state=closed]:animate-overlay-out',
        // Surish (swipe) — Radix CSS o'zgaruvchilari; `translate` transform bilan qo'shiladi
        'data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x) data-[swipe=move]:transition-none',
        'data-[swipe=cancel]:translate-x-0',
        'data-[swipe=end]:translate-x-(--radix-toast-swipe-end-x)',
      )}
    >
      {icon != null && icon !== false && (
        <span className="flex shrink-0 items-center [&_svg]:size-5">{icon}</span>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 pt-px">
        <ToastPrimitive.Title className="font-medium text-text">{t.title}</ToastPrimitive.Title>
        {t.description != null && (
          <ToastPrimitive.Description className="text-[13px] leading-5 text-text-muted">
            {t.description}
          </ToastPrimitive.Description>
        )}
      </div>
      {t.action && (
        <ToastPrimitive.Action altText={actionAlt} asChild>
          <Button size="sm" variant="soft" className="self-center" onClick={t.action.onClick}>
            {t.action.label}
          </Button>
        </ToastPrimitive.Action>
      )}
      {closeButton && (
        <ToastPrimitive.Close
          aria-label={closeLabel}
          className="focus-ring -mr-1 inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-0 text-text-muted transition-colors duration-base hover:bg-surface-muted hover:text-text"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            className="size-4"
          >
            <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" />
          </svg>
        </ToastPrimitive.Close>
      )}
    </ToastPrimitive.Root>
  );
}
