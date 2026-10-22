import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { useControllableState } from '@akhatmirzo/hooks';
import { cva } from 'class-variance-authority';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  type ComponentProps,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';
import { mergeRefs } from '../../lib/refs';
import { useFieldControl } from '../field/field';

export type SegmentedControlSize = 'sm' | 'md' | 'lg';

const ItemContext = createContext<{ size: SegmentedControlSize; fullWidth: boolean }>({
  size: 'md',
  fullWidth: false,
});

/* ---------- Root ---------- */

type RootPrimitiveProps = ComponentProps<typeof RadioGroupPrimitive.Root>;

export interface SegmentedControlProps extends Omit<
  RootPrimitiveProps,
  'value' | 'defaultValue' | 'onValueChange' | 'orientation'
> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Balandlik 32 / 40 / 48px — Button bilan bir qatorda tekis */
  size?: SegmentedControlSize;
  /** Konteyner kengligini egallaydi, elementlar teng bo'linadi */
  fullWidth?: boolean;
}

const rootVariants = cva(
  'relative isolate max-w-full items-stretch rounded-lg bg-surface-muted p-1 font-sans text-text data-disabled:cursor-not-allowed data-disabled:opacity-50',
  {
    variants: {
      size: { sm: 'h-8', md: 'h-10', lg: 'h-12' },
      fullWidth: { true: 'flex w-full', false: 'inline-flex w-fit' },
    },
    defaultVariants: { size: 'md', fullWidth: false },
  },
);

function SegmentedControlRoot({
  value: valueProp,
  defaultValue,
  onValueChange,
  size = 'md',
  fullWidth = false,
  disabled: disabledProp,
  id: idProp,
  className,
  children,
  ref,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  ...props
}: SegmentedControlProps) {
  const field = useFieldControl({
    id: idProp,
    disabled: disabledProp,
    'aria-describedby': ariaDescribedBy,
  });
  const { disabled } = field;
  const [value, setValue] = useControllableState<string>({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  });

  const rootRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);

  // Tanlangan element o'lchamini o'qib, indikatorni o'sha joyga siljitadi
  const measure = useCallback(() => {
    const root = rootRef.current;
    const indicator = indicatorRef.current;
    if (!root || !indicator) return;
    const checked = root.querySelector<HTMLElement>('[role="radio"][data-state="checked"]');
    if (!checked) {
      indicator.style.opacity = '0';
      return;
    }
    indicator.style.transform = `translateX(${checked.offsetLeft}px)`;
    indicator.style.width = `${checked.offsetWidth}px`;
    indicator.style.opacity = '1';
    // Birinchi o'lchovda animatsiyasiz joylashadi, keyingilari siljiydi
    if (!indicator.hasAttribute('data-animate')) {
      requestAnimationFrame(() => indicator.setAttribute('data-animate', ''));
    }
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [measure, value, size, fullWidth, children]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(root);
    root.querySelectorAll('[role="radio"]').forEach((item) => ro.observe(item));
    // Shrift yuklangach matn kengligi o'zgaradi
    let active = true;
    document.fonts?.ready.then(() => {
      if (active) measure();
    });
    return () => {
      active = false;
      ro.disconnect();
    };
  }, [measure, children]);

  return (
    <ItemContext.Provider value={{ size, fullWidth }}>
      <RadioGroupPrimitive.Root
        ref={mergeRefs(rootRef, ref)}
        id={field.id}
        value={value ?? null}
        onValueChange={setValue}
        orientation="horizontal"
        disabled={disabled}
        aria-label={ariaLabel}
        // Field ichida: nom label'dan olinadi (div uchun htmlFor ishlamaydi)
        aria-labelledby={ariaLabelledBy ?? (ariaLabel ? undefined : field.labelId)}
        aria-describedby={field.controlProps['aria-describedby']}
        data-size={size}
        data-full-width={fullWidth ? '' : undefined}
        data-disabled={disabled ? '' : undefined}
        className={cn(rootVariants({ size, fullWidth }), className)}
        {...props}
      >
        <span
          ref={indicatorRef}
          aria-hidden="true"
          data-slot="segmented-control-indicator"
          className={cn(
            'pointer-events-none absolute inset-y-1 left-0 -z-10 rounded-md bg-surface opacity-0 shadow-sm dark:bg-border-strong',
            'data-animate:transition-[transform,width] data-animate:duration-moderate data-animate:ease-out',
            'motion-reduce:data-animate:transition-none',
          )}
        />
        {children}
      </RadioGroupPrimitive.Root>
    </ItemContext.Provider>
  );
}

/* ---------- Item ---------- */

const itemVariants = cva(
  [
    'relative inline-flex min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-md border-0 bg-transparent font-sans font-medium whitespace-nowrap text-text-muted outline-none select-none',
    'transition-colors duration-base ease-out',
    'not-data-disabled:hover:text-text data-[state=checked]:text-text',
    'focus-ring',
    'data-disabled:cursor-not-allowed data-disabled:opacity-50',
    '[&_svg]:shrink-0',
  ],
  {
    variants: {
      size: {
        sm: 'px-3 text-sm [&_svg]:size-4',
        md: 'px-3.5 text-sm [&_svg]:size-[18px]',
        lg: 'px-4 text-base [&_svg]:size-5',
      },
      iconOnly: { true: '', false: '' },
    },
    compoundVariants: [
      { iconOnly: true, size: 'sm', className: 'px-1.5' },
      { iconOnly: true, size: 'md', className: 'px-2' },
      { iconOnly: true, size: 'lg', className: 'px-2.5' },
    ],
    defaultVariants: { size: 'md', iconOnly: false },
  },
);

type ItemPrimitiveProps = Omit<
  ComponentProps<typeof RadioGroupPrimitive.Item>,
  'children' | 'aria-label' | 'asChild'
>;

interface SegmentedControlItemBase extends ItemPrimitiveProps {
  value: string;
  /** Matn oldidagi ikonka */
  icon?: ReactNode;
  disabled?: boolean;
}

/** Faqat ikonkali element — ekran o'quvchi uchun `aria-label` majburiy */
export type SegmentedControlItemProps = SegmentedControlItemBase &
  (
    | { children: ReactNode; 'aria-label'?: string }
    | { children?: undefined; icon: ReactNode; 'aria-label': string }
  );

function SegmentedControlItem({ icon, children, className, ...props }: SegmentedControlItemProps) {
  const { size, fullWidth } = useContext(ItemContext);
  const iconOnly = children == null || children === false;
  return (
    <RadioGroupPrimitive.Item
      data-slot="segmented-control-item"
      className={cn(itemVariants({ size, iconOnly }), fullWidth && 'flex-1 basis-0', className)}
      {...props}
    >
      {icon}
      {!iconOnly && <span className="truncate">{children}</span>}
    </RadioGroupPrimitive.Item>
  );
}

/**
 * Bir nechta variantdan bittasini tanlash (filtr, ko'rinish rejimi). Radio semantikasi:
 * ←→ bilan yurish, tanlovni bekor qilib bo'lmaydi. Tanlangan fon — bitta suriluvchi indikator.
 * Tabs'dan farqi: Tabs kontent panellarini almashtiradi, SegmentedControl qiymat tanlaydi.
 * @example
 * <SegmentedControl defaultValue="month" aria-label="Davr">
 *   <SegmentedControl.Item value="day">Kun</SegmentedControl.Item>
 *   <SegmentedControl.Item value="week">Hafta</SegmentedControl.Item>
 *   <SegmentedControl.Item value="month">Oy</SegmentedControl.Item>
 * </SegmentedControl>
 */
export const SegmentedControl = Object.assign(SegmentedControlRoot, {
  Item: SegmentedControlItem,
});

export { SegmentedControlItem };
