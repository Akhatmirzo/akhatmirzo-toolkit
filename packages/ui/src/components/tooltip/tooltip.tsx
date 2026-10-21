import { useControllableState, useMediaQuery } from '@akhatmirzo/hooks';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import {
  createContext,
  useContext,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';
import { Kbd } from '../kbd/kbd';

const DEFAULT_DELAY = 300;
const DEFAULT_SKIP_DELAY = 300;

/** Sensorli (hover'siz) qurilma — tooltip chiqmaydi */
const TOUCH_QUERY = '(hover: none) and (pointer: coarse)';

const ProviderContext = createContext(false);

export interface TooltipProviderProps {
  /** Ochilish kechikishi, ms */
  delay?: number;
  /** Tooltip yopilgandan keyin shu vaqt ichida qo'shnisi kechikishsiz ochiladi, ms */
  skipDelay?: number;
  children: ReactNode;
}

/**
 * Ilova ildiziga bir marta qo'yiladi: barcha tooltiplar umumiy kechikishni bo'lishadi va
 * biridan ikkinchisiga o'tganda kechikishsiz ochiladi.
 */
export function TooltipProvider({
  delay = DEFAULT_DELAY,
  skipDelay = DEFAULT_SKIP_DELAY,
  children,
}: TooltipProviderProps) {
  return (
    <ProviderContext.Provider value>
      <TooltipPrimitive.Provider delayDuration={delay} skipDelayDuration={skipDelay}>
        {children}
      </TooltipPrimitive.Provider>
    </ProviderContext.Provider>
  );
}

export interface TooltipProps extends Omit<
  ComponentProps<typeof TooltipPrimitive.Content>,
  'content' | 'children' | 'asChild'
> {
  /** Qisqa matn. Bo'sh bo'lsa — tooltip chiqmaydi */
  content: ReactNode;
  /** Trigger — bitta element (ref va hodisalarni qabul qilishi kerak) */
  children: ReactElement;
  /** Ochilish kechikishi, ms (default — Provider'dan yoki 300) */
  delay?: number;
  /** Matn yonida `Kbd`: `['mod', 'C']` */
  shortcut?: string[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Vaqtincha o'chirish */
  disabled?: boolean;
}

export function Tooltip({
  content,
  children,
  side = 'top',
  align = 'center',
  sideOffset = 6,
  collisionPadding = 8,
  delay,
  shortcut,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  className,
  ...props
}: TooltipProps) {
  const hasProvider = useContext(ProviderContext);
  const touch = useMediaQuery(TOUCH_QUERY);
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const empty = content == null || content === false || content === '';
  if (empty || disabled) return children;

  const tooltip = (
    <TooltipPrimitive.Root open={open && !touch} onOpenChange={setOpen} delayDuration={delay}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          data-slot="tooltip"
          side={side}
          align={align}
          sideOffset={sideOffset}
          collisionPadding={collisionPadding}
          className={cn(
            'z-(--ak-z-tooltip) flex max-w-60 items-center gap-2 rounded-md bg-text px-2.5 py-1.5 font-sans text-xs font-medium break-words text-background select-none',
            'origin-(--radix-tooltip-content-transform-origin)',
            'data-[state=delayed-open]:animate-tooltip-in data-[state=instant-open]:animate-tooltip-in data-[state=closed]:animate-tooltip-out',
            'motion-reduce:data-[state=delayed-open]:animate-overlay-in motion-reduce:data-[state=instant-open]:animate-overlay-in motion-reduce:data-[state=closed]:animate-overlay-out',
            className,
          )}
          {...props}
        >
          <span className="min-w-0">{content}</span>
          {shortcut && shortcut.length > 0 && (
            <Kbd
              keys={shortcut}
              className="h-4 min-w-4 border-0 bg-background/15 px-1.5 leading-none text-current"
            />
          )}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );

  if (hasProvider) return tooltip;
  return (
    <TooltipPrimitive.Provider
      delayDuration={delay ?? DEFAULT_DELAY}
      skipDelayDuration={DEFAULT_SKIP_DELAY}
    >
      {tooltip}
    </TooltipPrimitive.Provider>
  );
}

Tooltip.Provider = TooltipProvider;
