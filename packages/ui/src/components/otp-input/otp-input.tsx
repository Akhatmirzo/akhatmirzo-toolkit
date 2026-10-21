import { useControllableState } from '@akhatmirzo/hooks';
import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type ComponentProps,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { cn } from '../../lib/cn';
import { assignRef } from '../../lib/refs';
import { useFieldControl } from '../field/field';

export type OtpInputType = 'numeric' | 'alphanumeric';

export interface OtpInputLabels {
  /** Katakcha nomi ekran o'quvchi uchun: `(1, 6) => "1-raqam"` */
  cell?: (index: number, length: number) => string;
  /** Field tashqarisida guruh nomi. Default "Tasdiqlash kodi" */
  group?: string;
}

export interface OtpInputProps extends Omit<
  ComponentProps<'div'>,
  'defaultValue' | 'onChange' | 'children'
> {
  /** Katakchalar soni. Default `6` */
  length?: number;
  /** Default `numeric` */
  type?: OtpInputType;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Oxirgi belgi kiritilganda */
  onComplete?: (code: string) => void;
  /** Xato kod: katakchalar qizil + yengil silkinish (reduced-motion'da yo'q) */
  invalid?: boolean;
  disabled?: boolean;
  /** Guruhlash: `3` → `123 – 456` */
  groupSize?: number;
  /** Forma uchun yashirin maydon nomi */
  name?: string;
  autoFocus?: boolean;
  labels?: OtpInputLabels;
}

const sanitizers: Record<OtpInputType, (s: string) => string> = {
  numeric: (s) => s.replace(/\D/g, ''),
  alphanumeric: (s) => s.replace(/[^\p{L}\d]/gu, ''),
};

const SHAKE: Keyframe[] = [
  { transform: 'translateX(0)' },
  { transform: 'translateX(-6px)', offset: 0.2 },
  { transform: 'translateX(6px)', offset: 0.4 },
  { transform: 'translateX(-6px)', offset: 0.6 },
  { transform: 'translateX(6px)', offset: 0.8 },
  { transform: 'translateX(0)' },
];

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

const cellBase = [
  'h-14 w-12 shrink-0 appearance-none rounded-lg border bg-surface p-0 text-center',
  'font-sans text-xl font-semibold text-text tabular-nums caret-primary outline-none shadow-xs',
  'transition-[border-color,box-shadow] duration-base ease-out',
  'disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-50 disabled:shadow-none',
].join(' ');
const cellNormal =
  'border-border hover:not-focus:not-disabled:border-border-strong focus:border-primary focus:shadow-[0_0_0_3px_var(--ak-ring)]';
const cellInvalid = 'border-danger focus:shadow-[0_0_0_3px_var(--ak-danger-ring)]';

/**
 * Bir martalik kod (SMS) kiritish: har bir belgi alohida katakchada.
 * @example <OtpInput value={code} onValueChange={setCode} onComplete={verify} groupSize={3} />
 */
function OtpInputRoot({
  length = 6,
  type = 'numeric',
  value: valueProp,
  defaultValue,
  onValueChange,
  onComplete,
  invalid: invalidProp,
  disabled: disabledProp,
  groupSize,
  name,
  autoFocus,
  labels,
  className,
  id,
  ref,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  ...props
}: OtpInputProps) {
  const field = useFieldControl({
    id,
    invalid: invalidProp,
    disabled: disabledProp,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
  });
  const { invalid, disabled } = field;
  const sanitize = sanitizers[type];
  const [rawValue, setValue] = useControllableState({
    value: valueProp,
    defaultValue: defaultValue ?? '',
    onChange: onValueChange,
  });
  const value = sanitize(rawValue).slice(0, length);

  const cells = useRef<(HTMLInputElement | null)[]>([]);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const cellLabel =
    labels?.cell ?? ((i: number) => `${i + 1}-${type === 'numeric' ? 'raqam' : 'belgi'}`);

  const focusCell = (i: number) => {
    const el = cells.current[Math.max(0, Math.min(length - 1, i))];
    if (!el) return;
    el.focus();
    el.select();
  };

  // Qiymat o'zgarganda fokus yangi holat chizilgandan keyin ko'chiriladi
  const pendingFocus = useRef<number | null>(null);
  useLayoutEffect(() => {
    if (pendingFocus.current === null) return;
    const i = pendingFocus.current;
    pendingFocus.current = null;
    focusCell(i);
  });

  const update = (next: string, focusIndex: number) => {
    const clean = sanitize(next).slice(0, length);
    if (clean !== value) {
      pendingFocus.current = focusIndex;
      setValue(clean);
      if (clean.length === length) onComplete?.(clean);
    } else focusCell(focusIndex);
  };

  /** `i` katakchadan boshlab matn bilan to'ldiradi (yozish, joylash, SMS avtoto'ldirish) */
  const fill = (i: number, text: string) => {
    const chars = sanitize(text);
    if (!chars) return;
    const at = Math.min(i, value.length);
    const next = (value.slice(0, at) + chars + value.slice(at + chars.length)).slice(0, length);
    update(next, Math.min(at + chars.length, length - 1));
  };

  const handleInput = (i: number) => (e: FormEvent<HTMLInputElement>) => {
    const el = e.currentTarget;
    const current = value[i] ?? '';
    let text = sanitize(el.value);
    // Katakchada belgi bo'lib, kursor uning yonida turgan bo'lsa — faqat yangisini olamiz
    if (current && text.length === 2 && text.includes(current)) {
      text = text[0] === current ? text.slice(1) : text.slice(0, 1);
    }
    el.value = current; // DOM'ni React holatiga qaytaramiz
    fill(i, text);
  };

  const handlePaste = (i: number) => (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    fill(i, e.clipboardData.getData('text'));
  };

  const handleKeyDown = (i: number) => (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Backspace':
        e.preventDefault();
        if (value[i]) update(value.slice(0, i) + value.slice(i + 1), i);
        else if (i > 0) update(value.slice(0, i - 1) + value.slice(i), i - 1);
        break;
      case 'Delete':
        e.preventDefault();
        if (value[i]) update(value.slice(0, i) + value.slice(i + 1), i);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        focusCell(i - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (i < value.length) focusCell(i + 1);
        break;
      case 'Home':
        e.preventDefault();
        focusCell(0);
        break;
      case 'End':
        e.preventDefault();
        focusCell(value.length);
        break;
    }
  };

  // Bo'sh joydan keyingi katakchaga sakrab bo'lmaydi — birinchi bo'sh katakchaga o'tadi
  const handleFocus = (i: number) => () => {
    if (i > value.length) focusCell(value.length);
    else cells.current[i]?.select();
  };

  // Xato holatiga o'tganda — silkinish
  const [prevInvalid, setPrevInvalid] = useState(invalid);
  const [shakeKey, setShakeKey] = useState(0);
  if (invalid !== prevInvalid) {
    setPrevInvalid(invalid);
    if (invalid) setShakeKey((k) => k + 1);
  }
  useEffect(() => {
    const el = rootRef.current;
    if (!shakeKey || !el || typeof el.animate !== 'function' || prefersReducedMotion()) return;
    el.animate(SHAKE, { duration: 360, easing: 'ease-in-out' });
  }, [shakeKey]);

  useEffect(() => {
    if (autoFocus) cells.current[0]?.focus();
    // faqat birinchi chizishda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setRootRef = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    assignRef(ref, node);
  };

  return (
    <div
      ref={setRootRef}
      role="group"
      aria-labelledby={field.labelId}
      aria-label={field.labelId ? undefined : (labels?.group ?? 'Tasdiqlash kodi')}
      data-slot="otp-input"
      data-invalid={invalid ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
      data-complete={value.length === length ? '' : undefined}
      className={cn('flex w-fit items-center gap-2 font-sans text-text', className)}
      {...props}
    >
      {Array.from({ length }, (_, i) => (
        <Fragment key={i}>
          {groupSize && i > 0 && i % groupSize === 0 ? (
            <span aria-hidden="true" className="text-text-faint select-none">
              –
            </span>
          ) : null}
          <input
            ref={(node) => {
              cells.current[i] = node;
            }}
            id={i === 0 ? field.id : undefined}
            type="text"
            inputMode={type === 'numeric' ? 'numeric' : 'text'}
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label={cellLabel(i, length)}
            aria-describedby={field.controlProps['aria-describedby']}
            aria-invalid={field.controlProps['aria-invalid']}
            aria-required={field.controlProps['aria-required']}
            disabled={disabled}
            value={value[i] ?? ''}
            onChange={handleInput(i)}
            onPaste={handlePaste(i)}
            onKeyDown={handleKeyDown(i)}
            onFocus={handleFocus(i)}
            className={cn(cellBase, invalid ? cellInvalid : cellNormal)}
          />
        </Fragment>
      ))}
      {name && <input type="hidden" name={name} value={value} disabled={disabled} />}
    </div>
  );
}

/* ---------- ResendTimer ---------- */

export interface ResendTimerLabels {
  /** Default "Kodni qayta yuborish" */
  resend?: string;
}

export interface ResendTimerProps extends Omit<ComponentProps<'button'>, 'onClick' | 'children'> {
  /** Kutish vaqti, soniya. Default `60` */
  seconds?: number;
  /** Bosilganda; Promise qaytarsa — tugaguncha bosib bo'lmaydi. Keyin taymer qayta boshlanadi */
  onResend?: () => unknown;
  labels?: ResendTimerLabels;
}

const formatClock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/**
 * "Kodni qayta yuborish (0:59)" — taymer tugaguncha bosilmaydi.
 * @example <OtpInput.ResendTimer seconds={60} onResend={sendCode} />
 */
export function ResendTimer({
  seconds = 60,
  onResend,
  labels,
  className,
  disabled,
  ...props
}: ResendTimerProps) {
  const [deadline, setDeadline] = useState(() => Date.now() + seconds * 1000);
  const [now, setNow] = useState(() => Date.now());
  const [pending, setPending] = useState(false);
  const left = Math.max(0, Math.ceil((deadline - now) / 1000));
  const waiting = left > 0 || pending || Boolean(disabled);

  useEffect(() => {
    if (left <= 0) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [left]);

  const handleClick = async () => {
    if (waiting) return;
    try {
      setPending(true);
      await onResend?.();
    } finally {
      setPending(false);
      const t = Date.now();
      setNow(t);
      setDeadline(t + seconds * 1000);
    }
  };

  const text = labels?.resend ?? 'Kodni qayta yuborish';
  return (
    <button
      type="button"
      aria-disabled={waiting || undefined}
      data-state={left > 0 ? 'waiting' : 'ready'}
      className={cn(
        'inline-flex cursor-pointer items-center rounded-sm border-0 bg-transparent p-0 font-sans text-xs font-medium text-link tabular-nums',
        'hover:underline underline-offset-4 focus-ring',
        'aria-disabled:cursor-default aria-disabled:text-text-muted aria-disabled:no-underline',
        className,
      )}
      onClick={handleClick}
      {...props}
    >
      {left > 0 ? `${text} (${formatClock(left)})` : text}
    </button>
  );
}

export const OtpInput = Object.assign(OtpInputRoot, { ResendTimer });
