import * as TabsPrimitive from '@radix-ui/react-tabs';
import { useControllableState } from '@akhatmirzo/hooks';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';
import { mergeRefs } from '../../lib/refs';

export type TabsVariant = 'underline' | 'pills' | 'segmented';
export type TabsSize = 'sm' | 'md';
export type TabsOrientation = 'horizontal' | 'vertical';

interface TabsContextValue {
  variant: TabsVariant;
  size: TabsSize;
  orientation: TabsOrientation;
  value: string | undefined;
}

const TabsContext = createContext<TabsContextValue>({
  variant: 'underline',
  size: 'md',
  orientation: 'horizontal',
  value: undefined,
});

/* ---------- Root ---------- */

export interface TabsProps extends Omit<
  ComponentProps<typeof TabsPrimitive.Root>,
  'value' | 'defaultValue' | 'onValueChange' | 'orientation'
> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  variant?: TabsVariant;
  size?: TabsSize;
  orientation?: TabsOrientation;
}

function TabsRoot({
  value: valueProp,
  defaultValue,
  onValueChange,
  variant = 'underline',
  size = 'md',
  orientation = 'horizontal',
  className,
  ...props
}: TabsProps) {
  const [value, setValue] = useControllableState<string>({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  });

  return (
    <TabsContext.Provider value={{ variant, size, orientation, value }}>
      <TabsPrimitive.Root
        value={value ?? ''}
        onValueChange={setValue}
        orientation={orientation}
        data-variant={variant}
        data-size={size}
        className={cn(
          'flex min-w-0 font-sans text-text',
          orientation === 'vertical' ? 'flex-row items-start gap-6' : 'flex-col',
          className,
        )}
        {...props}
      />
    </TabsContext.Provider>
  );
}

/* ---------- List ---------- */

const listBase: Record<TabsVariant, string> = {
  underline: 'gap-2 data-[orientation=horizontal]:shadow-[inset_0_-1px_0_var(--ak-border)]',
  pills: 'gap-1',
  segmented: 'rounded-lg bg-surface-muted p-1',
};

const listVertical: Record<TabsVariant, string> = {
  underline: 'gap-1 shadow-[inset_1px_0_0_var(--ak-border)]',
  pills: 'gap-1',
  segmented: 'gap-0',
};

const indicatorStyles: Record<TabsVariant, string> = {
  underline: 'rounded-full bg-primary',
  pills: 'rounded-full bg-primary-soft',
  segmented: 'rounded-md bg-surface shadow-xs dark:bg-border-strong',
};

export interface TabsListProps extends ComponentProps<typeof TabsPrimitive.List> {
  /** Ko'p tab sig'masa — gorizontal scroll (chetlarida yumshoq fade). Default `true` */
  scrollable?: boolean;
}

const FADE = '24px';

function TabsList({
  className,
  children,
  ref,
  scrollable = true,
  onScroll,
  style,
  ...props
}: TabsListProps) {
  const { variant, size, orientation, value } = useContext(TabsContext);
  const listRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const [fade, setFade] = useState({ start: false, end: false });
  const horizontal = orientation === 'horizontal';

  // Faol tab o'lchamini o'qib, indikatorni o'sha joyga siljitadi
  const measure = useCallback(() => {
    const list = listRef.current;
    const indicator = indicatorRef.current;
    if (!list || !indicator) return;
    const active = list.querySelector<HTMLElement>('[role="tab"][data-state="active"]');
    if (!active) {
      indicator.style.opacity = '0';
      return;
    }
    const { offsetLeft: x, offsetTop: y, offsetWidth: w, offsetHeight: h } = active;
    if (variant === 'underline') {
      if (horizontal) {
        indicator.style.transform = `translateX(${x}px)`;
        indicator.style.width = `${w}px`;
        indicator.style.height = '';
      } else {
        indicator.style.transform = `translateY(${y}px)`;
        indicator.style.height = `${h}px`;
        indicator.style.width = '';
      }
    } else {
      indicator.style.transform = `translate(${x}px, ${y}px)`;
      indicator.style.width = `${w}px`;
      indicator.style.height = `${h}px`;
    }
    indicator.style.opacity = '1';
    // Birinchi o'lchovda animatsiyasiz joylashadi, keyingilari siljiydi
    if (!indicator.hasAttribute('data-animate')) {
      requestAnimationFrame(() => indicator.setAttribute('data-animate', ''));
    }
  }, [variant, horizontal]);

  const updateFade = useCallback(() => {
    const list = listRef.current;
    if (!list || !scrollable || !horizontal) return;
    const start = list.scrollLeft > 1;
    const end = list.scrollLeft + list.clientWidth < list.scrollWidth - 1;
    setFade((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
  }, [scrollable, horizontal]);

  useLayoutEffect(() => {
    measure();
  }, [measure, value, size, children]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const ro = new ResizeObserver(() => {
      measure();
      updateFade();
    });
    ro.observe(list);
    list.querySelectorAll('[role="tab"]').forEach((tab) => ro.observe(tab));
    return () => ro.disconnect();
  }, [measure, updateFade, children]);

  const mask =
    fade.start || fade.end
      ? `linear-gradient(to right, ${fade.start ? 'transparent' : 'black'}, black ${FADE}, black calc(100% - ${FADE}), ${fade.end ? 'transparent' : 'black'})`
      : undefined;

  return (
    <TabsPrimitive.List
      ref={mergeRefs(listRef, ref)}
      data-variant={variant}
      data-size={size}
      onScroll={(e) => {
        onScroll?.(e);
        updateFade();
      }}
      style={{ maskImage: mask, WebkitMaskImage: mask, ...style }}
      className={cn(
        'relative isolate flex shrink-0',
        horizontal ? 'max-w-full' : 'flex-col items-stretch',
        horizontal && variant === 'segmented' ? 'w-fit' : '',
        horizontal &&
          scrollable &&
          'overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        horizontal ? listBase[variant] : cn(listBase[variant], listVertical[variant]),
        className,
      )}
      {...props}
    >
      {children}
      <span
        ref={indicatorRef}
        aria-hidden="true"
        data-tabs-indicator=""
        className={cn(
          'pointer-events-none absolute top-0 left-0 -z-10 opacity-0',
          'data-animate:transition-[transform,width,height] data-animate:duration-moderate data-animate:ease-in-out',
          'motion-reduce:data-animate:transition-none',
          indicatorStyles[variant],
          variant === 'underline' &&
            (horizontal ? 'top-auto bottom-0 h-0.5' : 'left-0 w-0.5 rounded-full'),
        )}
      />
    </TabsPrimitive.List>
  );
}

/* ---------- Trigger ---------- */

const triggerSize: Record<TabsVariant, Record<TabsSize, string>> = {
  underline: { sm: 'h-8 px-1', md: 'h-10 px-1' },
  pills: { sm: 'h-8 px-3', md: 'h-10 px-3.5' },
  segmented: { sm: 'h-7 px-3', md: 'h-8 px-3.5' },
};

const triggerVariant: Record<TabsVariant, string> = {
  underline: 'rounded-sm data-[orientation=vertical]:px-3',
  pills: 'rounded-full data-[state=active]:text-primary-soft-foreground',
  segmented: 'justify-center rounded-md data-[orientation=vertical]:justify-start',
};

export interface TabsTriggerProps extends ComponentProps<typeof TabsPrimitive.Trigger> {
  /** Yon tomonda hisoblagich (masalan `12`) */
  badge?: ReactNode;
}

function TabsTrigger({ className, children, badge, ...props }: TabsTriggerProps) {
  const { variant, size } = useContext(TabsContext);
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'relative inline-flex shrink-0 cursor-pointer items-center gap-1.5 border-0 bg-transparent font-sans text-sm font-medium whitespace-nowrap text-text-muted outline-none select-none',
        'transition-colors duration-base ease-out hover:text-text data-[state=active]:text-text',
        // Scroll konteyneri halqani kesmasligi uchun — ichkariga chiziladi
        'focus-ring focus-visible:-outline-offset-2!',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:text-text-muted',
        '[&_svg]:size-4 [&_svg]:shrink-0',
        triggerSize[variant][size],
        triggerVariant[variant],
        className,
      )}
      {...props}
    >
      {children}
      {badge != null && badge !== false && (
        <span
          data-tabs-badge=""
          className="inline-flex min-w-5 items-center justify-center rounded-full bg-surface-muted px-1.5 text-xs leading-4.5 font-medium text-text-muted"
        >
          {badge}
        </span>
      )}
    </TabsPrimitive.Trigger>
  );
}

/* ---------- Content ---------- */

export type TabsContentProps = ComponentProps<typeof TabsPrimitive.Content>;

function TabsContent({ className, ...props }: TabsContentProps) {
  return (
    <TabsPrimitive.Content
      className={cn(
        'min-w-0 rounded-md font-sans text-sm text-text outline-none focus-ring',
        'data-[orientation=horizontal]:mt-4 data-[orientation=vertical]:flex-1',
        className,
      )}
      {...props}
    />
  );
}

/**
 * Tablar: `underline` (siljuvchi chiziq), `pills`, `segmented`.
 * @example
 * <Tabs defaultValue="info">
 *   <Tabs.List>
 *     <Tabs.Trigger value="info">Ma'lumot</Tabs.Trigger>
 *     <Tabs.Trigger value="orders" badge={12}>Buyurtmalar</Tabs.Trigger>
 *   </Tabs.List>
 *   <Tabs.Content value="info">...</Tabs.Content>
 * </Tabs>
 */
export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
});

export { TabsList, TabsTrigger, TabsContent };
