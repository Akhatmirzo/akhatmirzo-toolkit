import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { createContext, useContext, type ComponentProps, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type AccordionVariant = 'separated' | 'bordered' | 'ghost';

const AccordionContext = createContext<{ variant: AccordionVariant }>({ variant: 'separated' });

/* ---------- Root ---------- */

type RootDivProps = Omit<
  ComponentProps<'div'>,
  'defaultValue' | 'value' | 'onChange' | 'dir' | 'children'
>;

interface AccordionBaseProps extends RootDivProps {
  /** `separated` — har biri alohida karta (default), `bordered` — bitta karta, `ghost` — fonsiz */
  variant?: AccordionVariant;
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
  dir?: 'ltr' | 'rtl';
  children?: ReactNode;
}

export interface AccordionSingleProps extends AccordionBaseProps {
  type?: 'single';
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Ochiq bo'limni qayta bosib yopish mumkinmi. Default `true` */
  collapsible?: boolean;
}

export interface AccordionMultipleProps extends AccordionBaseProps {
  type: 'multiple';
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  collapsible?: never;
}

export type AccordionProps = AccordionSingleProps | AccordionMultipleProps;

const rootVariant: Record<AccordionVariant, string> = {
  separated: 'flex flex-col gap-2',
  bordered: 'flex flex-col rounded-xl border border-border bg-surface',
  ghost: 'flex flex-col',
};

function AccordionRoot({ variant = 'separated', className, ...props }: AccordionProps) {
  // Radix ikki xil tipli Root kutadi; `collapsible` faqat `single` uchun
  const radixProps = (
    props.type === 'multiple'
      ? props
      : { ...props, type: 'single', collapsible: props.collapsible ?? true }
  ) as ComponentProps<typeof AccordionPrimitive.Root>;

  return (
    <AccordionContext.Provider value={{ variant }}>
      <AccordionPrimitive.Root
        data-variant={variant}
        className={cn('w-full font-sans text-text', rootVariant[variant], className)}
        {...radixProps}
      />
    </AccordionContext.Provider>
  );
}

/* ---------- Item ---------- */

const itemVariant: Record<AccordionVariant, string> = {
  separated: 'rounded-xl border border-border bg-surface',
  bordered: 'border-b border-border last:border-b-0',
  ghost: 'border-b border-border',
};

export interface AccordionItemProps extends Omit<
  ComponentProps<typeof AccordionPrimitive.Item>,
  'title'
> {
  /** Berilsa — Trigger va Content avtomatik chiziladi, `children` kontentga tushadi */
  title?: ReactNode;
}

function AccordionItem({ title, className, children, ...props }: AccordionItemProps) {
  const { variant } = useContext(AccordionContext);
  return (
    <AccordionPrimitive.Item
      data-variant={variant}
      className={cn(itemVariant[variant], className)}
      {...props}
    >
      {title !== undefined ? (
        <>
          <AccordionTrigger>{title}</AccordionTrigger>
          <AccordionContent>{children}</AccordionContent>
        </>
      ) : (
        children
      )}
    </AccordionPrimitive.Item>
  );
}

/* ---------- Trigger ---------- */

const triggerVariant: Record<AccordionVariant, string> = {
  separated: 'rounded-xl px-4',
  bordered: 'px-4',
  ghost: 'rounded-md px-0',
};

export type AccordionTriggerProps = ComponentProps<typeof AccordionPrimitive.Trigger>;

function AccordionTrigger({ className, children, ...props }: AccordionTriggerProps) {
  const { variant } = useContext(AccordionContext);
  return (
    <AccordionPrimitive.Header className="m-0 flex">
      <AccordionPrimitive.Trigger
        className={cn(
          'group flex min-h-12 w-full flex-1 cursor-pointer items-center justify-between gap-3 border-0 bg-transparent text-left font-sans text-sm font-medium text-text outline-none select-none',
          'focus-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
          triggerVariant[variant],
          className,
        )}
        {...props}
      >
        <span className="min-w-0 py-3">{children}</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          data-accordion-chevron=""
          className="size-4 shrink-0 text-text-muted transition-transform duration-moderate ease-in-out group-data-[state=open]:rotate-180 motion-reduce:transition-none"
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

/* ---------- Content ---------- */

const contentPadding: Record<AccordionVariant, string> = {
  separated: 'px-4 pb-4',
  bordered: 'px-4 pb-4',
  ghost: 'pb-4',
};

export type AccordionContentProps = ComponentProps<typeof AccordionPrimitive.Content>;

function AccordionContent({ className, children, ...props }: AccordionContentProps) {
  const { variant } = useContext(AccordionContext);
  return (
    <AccordionPrimitive.Content
      className={cn(
        'overflow-hidden text-sm text-text-muted',
        'data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up',
        'motion-reduce:data-[state=open]:animate-overlay-in motion-reduce:data-[state=closed]:animate-overlay-out',
        className,
      )}
      {...props}
    >
      <div className={cn('leading-relaxed', contentPadding[variant])}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

/**
 * Yig'iladigan bo'limlar (FAQ, sozlamalar).
 * @example
 * <Accordion type="single" defaultValue="q1">
 *   <Accordion.Item value="q1" title="Yetkazib berish qancha vaqt oladi?">2–3 ish kuni.</Accordion.Item>
 * </Accordion>
 */
export const Accordion = Object.assign(AccordionRoot, {
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
});

export { AccordionItem, AccordionTrigger, AccordionContent };
