import { useControllableState } from '@akhatmirzo/hooks';
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { Button } from '../button';
import { Dialog, DialogContent, DialogFooter, type DialogContentProps } from './dialog';

export type ConfirmVariant = 'default' | 'danger';

export interface ConfirmLabels {
  /** Default "Tasdiqlash" */
  confirm?: string;
  /** Default "Bekor qilish" */
  cancel?: string;
}

export interface ConfirmOptions {
  title: ReactNode;
  description?: ReactNode;
  confirmText?: ReactNode;
  cancelText?: ReactNode;
  /** `danger` — qizil tugma, dastlabki fokus "Bekor qilish" da */
  variant?: ConfirmVariant;
  /** Async bo'lsa — tugma loading, dialog javob kelguncha yopilmaydi; xatoda ochiq qoladi */
  onConfirm?: () => unknown;
}

/** Panelga uzatiladigan qolgan prop'lar (ref, id, data-*, aria-*, container ...) */
type ConfirmContentProps = Omit<
  DialogContentProps,
  | keyof ConfirmOptions
  | 'children'
  | 'role'
  | 'size'
  | 'closeButton'
  | 'dismissible'
  | 'hideTitle'
  | 'labels'
>;

export interface ConfirmDialogProps extends ConfirmOptions, ConfirmContentProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Ochuvchi element (Dialog.Trigger asChild sifatida) */
  trigger?: ReactNode;
  /** Bekor qilinganda (tugma, Esc yoki tashqariga bosish) */
  onCancel?: () => void;
  labels?: ConfirmLabels;
}

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as PromiseLike<unknown>).then === 'function'
  );
}

/** Tez tasdiqlash oynasi. Imperativ variant — `confirm()` */
export function ConfirmDialog({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  trigger,
  title,
  description,
  confirmText,
  cancelText,
  variant = 'default',
  onConfirm,
  onCancel,
  labels,
  onEscapeKeyDown,
  onInteractOutside,
  ...props
}: ConfirmDialogProps) {
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const [loading, setLoading] = useState(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const danger = variant === 'danger';

  const handleOpenChange = (next: boolean) => {
    if (loading) return;
    if (!next) onCancel?.();
    setOpen(next);
  };

  const handleConfirm = async () => {
    let result: unknown;
    try {
      result = onConfirm?.();
    } catch {
      // Sinxron xato — dialog ochiq qoladi
      return;
    }
    if (!isPromiseLike(result)) {
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      await result;
      if (mounted.current) setOpen(false);
    } catch {
      // Xatoda dialog ochiq qoladi — foydalanuvchi qayta urinadi yoki bekor qiladi
    } finally {
      if (mounted.current) setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger != null && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <DialogContent
        {...props}
        role="alertdialog"
        size="sm"
        closeButton={false}
        title={title}
        description={description}
        onEscapeKeyDown={(event) => {
          onEscapeKeyDown?.(event);
          if (loading) event.preventDefault();
        }}
        onInteractOutside={(event) => {
          onInteractOutside?.(event);
          if (loading) event.preventDefault();
        }}
      >
        <DialogFooter className={description == null ? 'mt-1' : undefined}>
          <Button
            variant="soft"
            disabled={loading}
            data-autofocus={danger ? '' : undefined}
            onClick={() => handleOpenChange(false)}
          >
            {cancelText ?? labels?.cancel ?? 'Bekor qilish'}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            loading={loading}
            data-autofocus={danger ? undefined : ''}
            onClick={handleConfirm}
          >
            {confirmText ?? labels?.confirm ?? 'Tasdiqlash'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Imperativ API: confirm() ---------- */

interface ConfirmRequest {
  id: number;
  options: ConfirmOptions;
  resolve: (value: boolean) => void;
}

interface ConfirmSnapshot {
  requests: ConfirmRequest[];
  host: symbol | null;
}

let snapshot: ConfirmSnapshot = { requests: [], host: null };
let hosts: symbol[] = [];
let seq = 0;
const listeners = new Set<() => void>();

function update(next: Partial<ConfirmSnapshot>) {
  snapshot = { ...snapshot, ...next };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function removeRequest(id: number) {
  update({ requests: snapshot.requests.filter((r) => r.id !== id) });
}

/**
 * Tasdiqlash oynasini ochadi va javobni qaytaradi. Ilovada bir marta `<ConfirmProvider />`
 * qo'yilgan bo'lishi shart.
 * @example if (await confirm({ title: "O'chirilsinmi?", variant: 'danger' })) remove();
 */
export function confirm(options: ConfirmOptions): Promise<boolean> {
  if (!snapshot.host) {
    return Promise.reject(new Error('confirm(): ilovada <ConfirmProvider /> topilmadi'));
  }
  return new Promise<boolean>((resolve) => {
    update({ requests: [...snapshot.requests, { id: ++seq, options, resolve }] });
  });
}

/** Yopilish animatsiyasi tugashi uchun (slide-out 200ms) */
const EXIT_DELAY = 300;

function ConfirmHostItem({ request, labels }: { request: ConfirmRequest; labels?: ConfirmLabels }) {
  const [open, setOpen] = useState(true);
  const answered = useRef(false);

  const finish = (value: boolean) => {
    if (answered.current) return;
    answered.current = true;
    request.resolve(value);
    setOpen(false);
    setTimeout(() => removeRequest(request.id), EXIT_DELAY);
  };

  const { onConfirm, ...options } = request.options;
  return (
    <ConfirmDialog
      {...options}
      labels={labels}
      open={open}
      onCancel={() => finish(false)}
      onConfirm={() => {
        const result = onConfirm?.();
        // Async bo'lsa — muvaffaqiyatli tugagach javob beriladi; xato ConfirmDialog'ga qaytadi
        if (isPromiseLike(result)) return Promise.resolve(result).then(() => finish(true));
        finish(true);
      }}
    />
  );
}

export interface ConfirmProviderProps {
  /** Barcha `confirm()` oynalari uchun standart matnlar */
  labels?: ConfirmLabels;
  /** Ixtiyoriy: ilovani o'rab qo'yish mumkin */
  children?: ReactNode;
}

/** `confirm()` oynalarini chizadigan host — ilovada bir marta qo'yiladi */
export function ConfirmProvider({ labels, children }: ConfirmProviderProps) {
  const [id] = useState(() => Symbol('confirm-host'));
  const state = useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => snapshot,
  );

  useEffect(() => {
    hosts = [...hosts, id];
    update({ host: hosts[0] ?? null });
    return () => {
      hosts = hosts.filter((h) => h !== id);
      const host = hosts[0] ?? null;
      if (host) {
        update({ host });
        return;
      }
      // Oxirgi host yo'qoldi — kutilayotgan so'rovlar rad javobi bilan yopiladi
      snapshot.requests.forEach((r) => r.resolve(false));
      update({ host: null, requests: [] });
    };
  }, [id]);

  return (
    <>
      {children}
      {state.host === id &&
        state.requests.map((request) => (
          <ConfirmHostItem key={request.id} request={request} labels={labels} />
        ))}
    </>
  );
}
