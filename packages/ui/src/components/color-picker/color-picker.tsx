import { useControllableState } from '@akhatmirzo/hooks';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cva } from 'class-variance-authority';
import {
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import { cn } from '../../lib/cn';
import { useFloatingLayer } from '../../lib/modal-layer';
import { floatingContentPanel } from '../../lib/overlay-styles';
import { useFieldControl } from '../field/field';
import { IconButton } from '../icon-button';
import { Input } from '../input';
import { controlContainerBase } from '../input/control-styles';
import { Slider } from '../slider';
import { hexToHsva, hsvaToHex, normalizeHex, type Hsva } from './color-utils';

export type ColorPickerSize = 'sm' | 'md' | 'lg';

export interface ColorPickerLabels {
  /** Trigger nomi (Field bo'lmasa): `"Rang tanlash, #4F46E5"` */
  trigger?: string;
  /** 2D maydon nomi */
  saturation?: string;
  /** 2D maydon qiymati: `(s, v) => "to'yinganlik 80%, yorqinlik 60%"` */
  saturationValue?: (saturation: number, brightness: number) => string;
  /** Hue slayderi */
  hue?: string;
  /** Shaffoflik slayderi */
  alpha?: string;
  /** Hex input */
  hex?: string;
  /** Pipetka tugmasi */
  eyeDropper?: string;
  /** Swatch'lar guruhi */
  swatches?: string;
}

const defaultLabels: Required<ColorPickerLabels> = {
  trigger: 'Rang tanlash',
  saturation: "To'yinganlik va yorqinlik",
  saturationValue: (s, v) => `to'yinganlik ${s}%, yorqinlik ${v}%`,
  hue: 'Rang tusi',
  alpha: 'Shaffoflik',
  hex: 'HEX',
  eyeDropper: 'Ekrandan rang olish',
  swatches: 'Tayyor ranglar',
};

/** Kutubxona palitrasidan 10 ta rang (`@akhatmirzo/tokens`) */
export const defaultColorSwatches = [
  '#4f46e5',
  '#6366f1',
  '#0284c7',
  '#0ea5e9',
  '#059669',
  '#10b981',
  '#d97706',
  '#f59e0b',
  '#e11d48',
  '#475569',
];

export interface ColorPickerProps extends Omit<
  ComponentProps<'button'>,
  'value' | 'defaultValue' | 'onChange' | 'children' | 'type' | 'color'
> {
  /** Rang: `#rrggbb` (`alpha` bo'lsa `#rrggbbaa`) */
  value?: string;
  /** Boshlang'ich rang. Default `#4f46e5` */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Tayyor ranglar. Default — kutubxona palitrasidan 10 ta */
  swatches?: string[];
  /** Shaffoflik slayderi; qiymat `#rrggbbaa` ko'rinishida */
  alpha?: boolean;
  /** Brauzerda `EyeDropper` API bo'lsa — pipetka tugmasi. Default `true` */
  eyeDropper?: boolean;
  /** Trigger balandligi 32 / 40 / 48px */
  size?: ColorPickerSize;
  /** Xato holati (Field ichida `error` bo'lsa avtomatik) */
  invalid?: boolean;
  /** Forma uchun yashirin `<input>` nomi */
  name?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  labels?: ColorPickerLabels;
  /** Panel klassi */
  contentClassName?: string;
}

const triggerVariants = cva(
  [
    controlContainerBase,
    'cursor-pointer items-center gap-2 text-left outline-none [&_svg]:shrink-0',
    'data-[state=open]:border-primary! data-[state=open]:shadow-[0_0_0_3px_var(--ak-ring)]',
  ],
  {
    variants: {
      size: {
        sm: 'h-8 px-2.5 text-sm [&_svg]:size-4',
        md: 'h-10 px-3 text-sm [&_svg]:size-[18px]',
        lg: 'h-12 px-4 text-base [&_svg]:size-5',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

const swatchSize: Record<ColorPickerSize, string> = { sm: 'size-4', md: 'size-5', lg: 'size-6' };

/** Shaffof ranglar ostidagi shaxmat foni (token ranglarida) */
const checkerboard =
  'repeating-conic-gradient(var(--ak-border) 0 25%, var(--ak-surface) 0 50%) 0 0 / 8px 8px';

const HUE_GRADIENT =
  'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)';

/** Slider trekini gradient bilan almashtiradi (to'lgan qism ko'rinmaydi) */
const gradientSlider =
  '[&_[data-slot=slider-track]]:[background:var(--ak-cp-track)] [&_[data-slot=slider-range]]:bg-transparent';

const subscribeNoop = () => () => {};

/** `EyeDropper` API bormi — serverda doim `false`, gidratsiyadan keyin tekshiriladi */
function useEyeDropperSupported() {
  return useSyncExternalStore(
    subscribeNoop,
    () => typeof window !== 'undefined' && 'EyeDropper' in window,
    () => false,
  );
}

interface EyeDropperLike {
  open: () => Promise<{ sRGBHex: string }>;
}

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function PipetteIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m2 22 1-1h3l9-9" />
      <path d="M3 21v-3l9-9" />
      <path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z" />
    </svg>
  );
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/**
 * Rang tanlash: trigger — Input ko'rinishida (namuna + hex), Popover ichida 2D to'yinganlik
 * maydoni, hue (va `alpha`) slayderlari, hex input, pipetka va tayyor ranglar.
 * `Field` ichida label, izoh va xato avtomatik ulanadi.
 * @example
 * <ColorPicker value={color} onValueChange={setColor} />
 * <ColorPicker swatches={['#4f46e5', '#0ea5e9', '#10b981']} alpha />
 * <Field label="Brend rangi"><ColorPicker name="brand" /></Field>
 */
export function ColorPicker({
  value: valueProp,
  defaultValue = '#4f46e5',
  onValueChange,
  swatches = defaultColorSwatches,
  alpha = false,
  eyeDropper = true,
  size = 'md',
  invalid: invalidProp,
  name,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  labels,
  className,
  contentClassName,
  id,
  disabled: disabledProp,
  ref,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  ...props
}: ColorPickerProps) {
  const layer = useFloatingLayer();
  const field = useFieldControl({
    id,
    invalid: invalidProp,
    disabled: disabledProp,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
  });
  const { invalid, disabled } = field;
  const text = { ...defaultLabels, ...labels };
  const valueId = useId();
  const hexId = useId();

  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const [rawValue, setRawValue] = useControllableState<string>({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  });
  const hex = normalizeHex(rawValue, alpha) ?? normalizeHex(defaultValue, alpha) ?? '#000000';

  // HSV holati ichkarida: oq/qora/kulrangda ham hue va to'yinganlik yo'qolmasligi uchun
  const [hsva, setHsva] = useState<Hsva>(() => hexToHsva(hex) ?? { h: 0, s: 0, v: 0, a: 1 });
  const [syncedHex, setSyncedHex] = useState(hex);
  if (hex !== syncedHex) {
    // Tashqaridan kelgan qiymat (yoki swatch / hex input) — HSV ni qayta hisoblaymiz
    setSyncedHex(hex);
    if (hsvaToHex(hsva, alpha) !== hex) {
      const next = hexToHsva(hex);
      if (next) {
        // Akromatik ranglarda oldingi hue saqlanadi
        setHsva(next.s === 0 || next.v === 0 ? { ...next, h: hsva.h } : next);
      }
    }
  }

  const commitHsva = (next: Hsva) => {
    setHsva(next);
    const nextHex = hsvaToHex(next, alpha);
    setSyncedHex(nextHex);
    if (nextHex !== hex) setRawValue(nextHex);
  };

  const commitHex = (nextHex: string) => {
    const normalized = normalizeHex(nextHex, alpha);
    if (!normalized) return false;
    if (normalized !== hex) setRawValue(normalized);
    return true;
  };

  const eyeDropperSupported = useEyeDropperSupported();
  const pickFromScreen = async () => {
    const Ctor = (window as unknown as { EyeDropper?: new () => EyeDropperLike }).EyeDropper;
    if (!Ctor) return;
    try {
      const result = await new Ctor().open();
      const picked = normalizeHex(result.sRGBHex);
      // Pipetka shaffoflikni bermaydi — joriy alpha saqlanadi
      if (picked) commitHsva({ ...(hexToHsva(picked) ?? hsva), a: hsva.a });
    } catch {
      // Foydalanuvchi Esc bosdi — hech narsa qilinmaydi
    }
  };

  const display = hex.toUpperCase();
  const labelledBy =
    ariaLabelledBy ?? (!ariaLabel && field.labelId ? `${field.labelId} ${valueId}` : undefined);
  const ownLabel = labelledBy ? undefined : `${ariaLabel ?? text.trigger}, ${display}`;

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={(o) => setOpen(disabled ? false : o)}>
      <PopoverPrimitive.Trigger asChild>
        <button
          ref={ref}
          type="button"
          disabled={disabled}
          data-slot="color-picker"
          data-size={size}
          data-state={open ? 'open' : 'closed'}
          data-invalid={invalid ? '' : undefined}
          data-disabled={disabled ? '' : undefined}
          aria-label={ownLabel}
          aria-labelledby={labelledBy}
          className={cn(triggerVariants({ size }), className)}
          {...field.controlProps}
          {...props}
        >
          <span
            aria-hidden="true"
            data-slot="color-picker-swatch"
            className={cn(
              'relative shrink-0 overflow-hidden rounded-sm border border-border',
              swatchSize[size],
            )}
            style={{ background: checkerboard }}
          >
            <span className="absolute inset-0" style={{ backgroundColor: hex }} />
          </span>
          <span id={valueId} className="min-w-0 flex-1 truncate font-mono tabular-nums">
            {display}
          </span>
          <span aria-hidden="true" className="flex shrink-0 text-text-muted">
            <ChevronIcon />
          </span>
        </button>
      </PopoverPrimitive.Trigger>
      {name && <input type="hidden" name={name} value={hex} disabled={disabled} />}

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          data-slot="color-picker-content"
          align="start"
          sideOffset={6}
          collisionPadding={8}
          className={cn(
            floatingContentPanel,
            layer,
            'flex w-64 max-w-[calc(100vw-16px)] flex-col gap-3 p-3',
            contentClassName,
          )}
        >
          <SaturationArea hsva={hsva} onChange={commitHsva} text={text} />

          <div className="flex items-center gap-2">
            <div className="flex min-w-0 flex-1 flex-col gap-3 py-1">
              <Slider
                size="sm"
                min={0}
                max={360}
                value={[Math.round(hsva.h)]}
                onValueChange={([h]) => commitHsva({ ...hsva, h: h ?? 0 })}
                showValue="never"
                formatValue={(v) => `${v}°`}
                aria-label={text.hue}
                data-slot="color-picker-hue"
                className={gradientSlider}
                style={{ '--ak-cp-track': HUE_GRADIENT } as CSSProperties}
              />
              {alpha && (
                <Slider
                  size="sm"
                  min={0}
                  max={100}
                  value={[Math.round(hsva.a * 100)]}
                  onValueChange={([a]) => commitHsva({ ...hsva, a: (a ?? 100) / 100 })}
                  showValue="never"
                  formatValue={(v) => `${v}%`}
                  aria-label={text.alpha}
                  data-slot="color-picker-alpha"
                  className={gradientSlider}
                  style={
                    {
                      '--ak-cp-track': `linear-gradient(to right, transparent, ${hsvaToHex({ ...hsva, a: 1 })}), ${checkerboard}`,
                    } as CSSProperties
                  }
                />
              )}
            </div>
            {eyeDropper && eyeDropperSupported && (
              <IconButton
                size="sm"
                variant="ghost"
                aria-label={text.eyeDropper}
                data-slot="color-picker-eyedropper"
                onClick={pickFromScreen}
              >
                <PipetteIcon />
              </IconButton>
            )}
          </div>

          <HexInput id={hexId} hex={hex} alpha={alpha} label={text.hex} onCommit={commitHex} />

          {swatches.length > 0 && (
            <div
              role="group"
              aria-label={text.swatches}
              data-slot="color-picker-swatches"
              className="grid grid-cols-10 gap-1"
            >
              {swatches.map((swatch) => {
                const normalized = normalizeHex(swatch, alpha);
                if (!normalized) return null;
                const selected = normalized === hex;
                return (
                  <button
                    key={swatch}
                    type="button"
                    aria-label={normalized.toUpperCase()}
                    aria-pressed={selected}
                    data-state={selected ? 'on' : 'off'}
                    onClick={() => commitHex(normalized)}
                    className={cn(
                      'relative aspect-square w-full cursor-pointer overflow-hidden rounded-sm border border-border p-0 focus-ring',
                      'transition-transform duration-fast ease-out hover:scale-110 motion-reduce:transition-none',
                      'data-[state=on]:ring-2 data-[state=on]:ring-text data-[state=on]:ring-offset-1 data-[state=on]:ring-offset-surface-raised',
                    )}
                    style={{ background: checkerboard }}
                  >
                    <span className="absolute inset-0" style={{ backgroundColor: normalized }} />
                  </button>
                );
              })}
            </div>
          )}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

/* ---------- 2D maydon ---------- */

interface SaturationAreaProps {
  hsva: Hsva;
  onChange: (hsva: Hsva) => void;
  text: Required<ColorPickerLabels>;
}

function SaturationArea({ hsva, onChange, text }: SaturationAreaProps) {
  const areaRef = useRef<HTMLDivElement>(null);
  const s = Math.round(hsva.s);
  const v = Math.round(hsva.v);

  const fromPointer = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    onChange({
      ...hsva,
      s: clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100),
      v: clamp(100 - ((e.clientY - rect.top) / rect.height) * 100, 0, 100),
    });
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    areaRef.current?.focus();
    fromPointer(e);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) fromPointer(e);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 1;
    let ns = s;
    let nv = v;
    switch (e.key) {
      case 'ArrowRight':
        ns += step;
        break;
      case 'ArrowLeft':
        ns -= step;
        break;
      case 'ArrowUp':
        nv += step;
        break;
      case 'ArrowDown':
        nv -= step;
        break;
      case 'PageUp':
        nv += 10;
        break;
      case 'PageDown':
        nv -= 10;
        break;
      case 'Home':
        ns = 0;
        break;
      case 'End':
        ns = 100;
        break;
      default:
        return;
    }
    e.preventDefault();
    onChange({ ...hsva, s: clamp(ns, 0, 100), v: clamp(nv, 0, 100) });
  };

  return (
    <div
      ref={areaRef}
      role="slider"
      tabIndex={0}
      aria-label={text.saturation}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={s}
      aria-valuetext={text.saturationValue(s, v)}
      data-slot="color-picker-area"
      className="relative h-36 w-full cursor-crosshair touch-none rounded-md focus-ring"
      style={{
        backgroundColor: `hsl(${hsva.h} 100% 50%)`,
        backgroundImage:
          'linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onKeyDown={handleKeyDown}
    >
      <span
        aria-hidden="true"
        data-slot="color-picker-thumb"
        className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-(--ak-white) shadow-[0_0_0_1px_rgb(0_0_0/0.3),0_1px_3px_rgb(0_0_0/0.3)]"
        style={{
          left: `${hsva.s}%`,
          top: `${100 - hsva.v}%`,
          backgroundColor: hsvaToHex({ ...hsva, a: 1 }),
        }}
      />
    </div>
  );
}

/* ---------- Hex input ---------- */

interface HexInputProps {
  id: string;
  hex: string;
  alpha: boolean;
  label: string;
  onCommit: (hex: string) => boolean;
}

/** Yozish paytida noto'g'ri matn saqlanadi; to'liq hex bo'lishi bilan rang yangilanadi, blur'da tiklanadi */
function HexInput({ id, hex, alpha, label, onCommit }: HexInputProps) {
  const [draft, setDraft] = useState(hex.toUpperCase());
  const [syncedHex, setSyncedHex] = useState(hex);
  if (hex !== syncedHex) {
    // Rang boshqa joydan o'zgardi — yozilayotgan matn shu rangni bermasa, almashtiramiz
    setSyncedHex(hex);
    if (normalizeHex(draft, alpha) !== hex) setDraft(hex.toUpperCase());
  }
  const valid = normalizeHex(draft, alpha) !== null;

  const commitDraft = () => {
    const normalized = normalizeHex(draft, alpha);
    if (normalized) onCommit(normalized);
    setDraft((normalized ?? hex).toUpperCase());
  };

  return (
    <Input
      id={id}
      size="sm"
      aria-label={label}
      prefix={label}
      value={draft}
      maxLength={alpha ? 9 : 7}
      spellCheck={false}
      autoComplete="off"
      invalid={!valid}
      inputClassName="font-mono uppercase tabular-nums"
      onChange={(e) => {
        const next = e.target.value;
        setDraft(next);
        // To'liq 6/8 belgili hex — darhol qo'llanadi (qisqa #abc — Enter yoki blur'da)
        if (/^#?([0-9a-f]{6}|[0-9a-f]{8})$/i.test(next.trim())) onCommit(next);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          commitDraft();
        }
      }}
      onBlur={commitDraft}
    />
  );
}
