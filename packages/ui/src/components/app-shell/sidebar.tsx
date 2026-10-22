import * as AccordionPrimitive from '@radix-ui/react-accordion';
import {
  createContext,
  useContext,
  useId,
  useState,
  type ComponentProps,
  type CSSProperties,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';
import { Badge } from '../badge';
import { Drawer } from '../drawer';
import { Tooltip } from '../tooltip';
import { useOptionalAppShell } from './app-shell';

/* ---------- Ichki kontekst: qaysi nusxa (desktop panel yoki mobil Drawer) ---------- */

interface SidebarScope {
  /** Desktop panel yig'ilgan (faqat ikonkalar) */
  collapsed: boolean;
  /** Mobil Drawer ichidami */
  inDrawer: boolean;
  /** Mobil Drawer'ni yopish (sahifa o'tishida) */
  closeMobile: () => void;
}

const SidebarScopeContext = createContext<SidebarScope>({
  collapsed: false,
  inDrawer: false,
  closeMobile: () => {},
});

const SidebarNavLabelContext = createContext('Asosiy menyu');

/* ---------- Sidebar ---------- */

export interface SidebarLabels {
  /** `<nav>` nomi */
  nav?: string;
  /** Mobil Drawer sarlavhasi (ekran o'quvchi uchun) */
  drawerTitle?: string;
}

export interface SidebarProps extends ComponentProps<'aside'> {
  /** To'liq kenglik (desktop). Yig'ilganda — 64px */
  width?: number | string;
  labels?: SidebarLabels;
}

const toCssSize = (v: number | string) => (typeof v === 'number' ? `${v}px` : v);

function SidebarRoot({
  width = 256,
  labels,
  className,
  children,
  id,
  style,
  ...props
}: SidebarProps) {
  const shell = useOptionalAppShell();
  const collapsed = shell?.collapsed ?? false;
  const mobileOpen = shell?.mobileOpen ?? false;
  const navLabel = labels?.nav ?? 'Asosiy menyu';

  const desktopScope: SidebarScope = { collapsed, inDrawer: false, closeMobile: () => {} };
  const drawerScope: SidebarScope = {
    collapsed: false,
    inDrawer: true,
    closeMobile: () => shell?.setMobileOpen(false),
  };

  return (
    <SidebarNavLabelContext.Provider value={navLabel}>
      {/* Desktop (>= 1024px): grid ustuni kengligi grid-template-columns orqali animatsiya qilinadi */}
      <div
        data-slot="sidebar-rail"
        data-collapsed={collapsed ? '' : undefined}
        className={cn(
          'hidden lg:grid',
          'grid-cols-[var(--ak-sidebar-width)] data-collapsed:grid-cols-[4rem]',
          'group-data-ready/app-shell:transition-[grid-template-columns] group-data-ready/app-shell:duration-moderate group-data-ready/app-shell:ease-in-out',
          'motion-reduce:transition-none!',
        )}
        style={{ '--ak-sidebar-width': toCssSize(width) } as CSSProperties}
      >
        <aside
          data-slot="sidebar"
          data-collapsed={collapsed ? '' : undefined}
          id={id ?? shell?.ids.sidebar}
          className={cn(
            'group/sidebar sticky top-0 flex h-(--ak-app-shell-height) min-w-0 flex-col self-start overflow-hidden',
            'border-r border-border bg-surface text-text',
            className,
          )}
          style={style}
          {...props}
        >
          <SidebarScopeContext.Provider value={desktopScope}>
            {children}
          </SidebarScopeContext.Provider>
        </aside>
      </div>

      {/* Telefon / planshet (< 1024px): chapdan Drawer */}
      {shell && (
        <Drawer open={mobileOpen} onOpenChange={shell.setMobileOpen}>
          <Drawer.Content
            id={shell.ids.mobileSidebar}
            side="left"
            size="sm"
            title={labels?.drawerTitle ?? 'Menyu'}
            hideTitle
            data-slot="sidebar-mobile"
            className="group/sidebar p-0"
          >
            <SidebarScopeContext.Provider value={drawerScope}>
              <div className="flex min-h-full flex-col">{children}</div>
            </SidebarScopeContext.Provider>
          </Drawer.Content>
        </Drawer>
      )}
    </SidebarNavLabelContext.Provider>
  );
}

/* ---------- Header / Content / Footer ---------- */

export type SidebarHeaderProps = ComponentProps<'div'>;

/** Yuqori qism: logotip, ilova nomi */
export function SidebarHeader({ className, ...props }: SidebarHeaderProps) {
  return (
    <div
      data-slot="sidebar-header"
      className={cn(
        'flex min-h-14 shrink-0 items-center gap-2 overflow-hidden px-3 py-2 whitespace-nowrap',
        className,
      )}
      {...props}
    />
  );
}

export type SidebarContentProps = ComponentProps<'nav'>;

/** Menyu qismi — `<nav aria-label="Asosiy menyu">`, kerak bo'lsa aylantiriladi */
export function SidebarContent({ className, ...props }: SidebarContentProps) {
  const navLabel = useContext(SidebarNavLabelContext);
  return (
    <nav
      data-slot="sidebar-content"
      aria-label={navLabel}
      className={cn(
        'flex min-h-0 flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto px-3 py-2',
        className,
      )}
      {...props}
    />
  );
}

export type SidebarFooterProps = ComponentProps<'div'>;

/** Pastki qism: foydalanuvchi menyusi va h.k. */
export function SidebarFooter({ className, ...props }: SidebarFooterProps) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn(
        'shrink-0 overflow-hidden border-t border-border p-3 whitespace-nowrap',
        className,
      )}
      {...props}
    />
  );
}

/* ---------- Group ---------- */

export interface SidebarGroupProps extends Omit<ComponentProps<'div'>, 'title'> {
  /** Guruh sarlavhasi */
  label?: ReactNode;
  /** Sarlavha bosilganda guruh yig'iladi (Accordion uslubida) */
  collapsible?: boolean;
  /** `collapsible` guruh boshida ochiqmi */
  defaultOpen?: boolean;
}

function ChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3.5 shrink-0 transition-transform duration-moderate ease-in-out group-data-[state=open]/trigger:rotate-180 motion-reduce:transition-none"
    >
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

const groupLabelClass =
  'flex h-8 items-center px-3 text-xs font-semibold tracking-wide text-text-muted uppercase';

/** Elementlar guruhi: sarlavha + ro'yxat (`Sidebar.Item` lar) */
export function SidebarGroup({
  label,
  collapsible = false,
  defaultOpen = true,
  className,
  children,
  ...props
}: SidebarGroupProps) {
  const { collapsed } = useContext(SidebarScopeContext);
  const labelId = useId();
  const [open, setOpen] = useState(defaultOpen);
  const hasLabel = label != null && label !== false;
  const list = <ul className="m-0 flex list-none flex-col gap-0.5 p-0">{children}</ul>;

  // Yig'ilgan panelda sarlavha ko'rinmaydi, guruh doim ochiq — o'rniga ajratuvchi chiziq
  if (collapsible && hasLabel && !collapsed) {
    return (
      <AccordionPrimitive.Root
        type="single"
        collapsible
        value={open ? 'group' : ''}
        onValueChange={(v) => setOpen(v === 'group')}
        asChild
      >
        <div
          data-slot="sidebar-group"
          data-collapsible=""
          className={cn('group/sidebar-group', className)}
          {...props}
        >
          <AccordionPrimitive.Item value="group">
            <AccordionPrimitive.Header className="m-0 flex">
              <AccordionPrimitive.Trigger
                className={cn(
                  groupLabelClass,
                  'group/trigger focus-ring w-full cursor-pointer justify-between gap-2 rounded-md border-0 bg-transparent text-left font-sans hover:text-text',
                )}
              >
                <span className="truncate">{label}</span>
                <ChevronIcon />
              </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>
            <AccordionPrimitive.Content
              className={cn(
                'overflow-hidden',
                'data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up',
                'motion-reduce:data-[state=open]:animate-overlay-in motion-reduce:data-[state=closed]:animate-overlay-out',
              )}
            >
              {list}
            </AccordionPrimitive.Content>
          </AccordionPrimitive.Item>
        </div>
      </AccordionPrimitive.Root>
    );
  }

  return (
    <div
      data-slot="sidebar-group"
      role="group"
      aria-labelledby={hasLabel ? labelId : undefined}
      className={cn('group/sidebar-group', className)}
      {...props}
    >
      {hasLabel && (
        <p id={labelId} className={cn('m-0', groupLabelClass, collapsed && 'sr-only')}>
          {label}
        </p>
      )}
      {hasLabel && collapsed && (
        <div
          aria-hidden="true"
          className="mx-2 mb-2 h-px bg-border group-first/sidebar-group:hidden"
        />
      )}
      {list}
    </div>
  );
}

/* ---------- Item ---------- */

/**
 * `renderLink` ga beriladigan prop'lar — o'z havola komponentingizga (Next `Link`) yoyib bering.
 * `Sidebar.Item` ga berilgan qolgan `<a>` atributlari (`id`, `target`, `data-*` ...) ham shu yerda.
 */
export interface SidebarItemLinkProps extends Omit<
  ComponentProps<'a'>,
  'href' | 'className' | 'children' | 'onClick' | 'aria-current' | 'aria-label'
> {
  href: string;
  className: string;
  children: ReactNode;
  onClick: (event: MouseEvent<HTMLElement>) => void;
  'aria-current'?: 'page';
  'aria-label'?: string;
  'data-slot': string;
  'data-active'?: '';
}

export interface SidebarItemProps extends Omit<ComponentProps<'a'>, 'onClick' | 'children'> {
  /** Chapdagi ikonka (18px). Yig'ilgan panelda faqat shu ko'rinadi */
  icon?: ReactNode;
  children?: ReactNode;
  /** Havola manzili. Berilmasa — `<button>` */
  href?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  /** Joriy sahifa — `aria-current="page"` */
  active?: boolean;
  /** O'ngdagi hisoblagich (`12`) yoki istalgan element */
  badge?: ReactNode;
  disabled?: boolean;
  /**
   * Yig'ilgan paneldagi Tooltip va `aria-label` uchun matn.
   * Default — `children` matn bo'lsa, o'zi.
   */
  label?: string;
  /** O'z havola komponentingiz: `renderLink={(p) => <Link {...p} />}` */
  renderLink?: (props: SidebarItemLinkProps) => ReactElement;
}

function renderBadge(badge: ReactNode, collapsed: boolean) {
  if (badge == null || badge === false) return null;
  const isValue = typeof badge === 'number' || typeof badge === 'string';
  if (collapsed) {
    return (
      <>
        <span
          aria-hidden="true"
          data-slot="sidebar-item-badge-dot"
          className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary ring-2 ring-surface"
        />
        {isValue && <span className="sr-only">({badge})</span>}
      </>
    );
  }
  return isValue ? (
    <Badge data-slot="sidebar-item-badge" size="sm" color="primary" variant="soft">
      {badge}
    </Badge>
  ) : (
    badge
  );
}

/** Menyu elementi: havola (`href`), tugma (`onClick`) yoki `renderLink` orqali Next `Link` */
export function SidebarItem({
  icon,
  children,
  href,
  onClick,
  active = false,
  badge,
  disabled = false,
  label,
  renderLink,
  className,
  ...props
}: SidebarItemProps) {
  const { collapsed, inDrawer, closeMobile } = useContext(SidebarScopeContext);
  const text = label ?? (typeof children === 'string' ? children : undefined);

  const itemClass = cn(
    'focus-ring group/item relative flex h-10 w-full min-w-0 cursor-pointer items-center gap-3 rounded-lg border-0 px-3 text-left font-sans text-sm font-medium whitespace-nowrap no-underline transition-colors duration-fast',
    active
      ? 'bg-primary-soft text-primary-soft-foreground'
      : 'bg-transparent text-text-subtle hover:bg-surface-muted hover:text-text',
    disabled && 'pointer-events-none cursor-not-allowed opacity-50',
    collapsed && 'justify-center px-0',
    className,
  );

  const inner = (
    <>
      {icon != null && (
        <span
          aria-hidden="true"
          className={cn(
            'flex size-[18px] shrink-0 items-center justify-center [&_svg]:size-[18px]',
            active ? 'text-primary-soft-foreground' : 'text-text-muted group-hover/item:text-text',
          )}
        >
          {icon}
        </span>
      )}
      <span className={cn('min-w-0 flex-1 truncate', collapsed && 'sr-only')}>{children}</span>
      {renderBadge(badge, collapsed)}
    </>
  );

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
    // Mobil Drawer ichida — sahifa o'tishida yopiladi
    if (inDrawer) closeMobile();
  };

  const common = {
    'data-slot': 'sidebar-item',
    'data-active': active ? ('' as const) : undefined,
    'aria-current': active ? ('page' as const) : undefined,
    'aria-label': collapsed ? text : undefined,
    className: itemClass,
    onClick: handleClick,
  };

  let element: ReactElement;
  if (href != null && !disabled) {
    element = renderLink ? (
      renderLink({ ...props, ...common, href, children: inner })
    ) : (
      <a {...props} {...common} href={href}>
        {inner}
      </a>
    );
  } else if (href != null) {
    // O'chirilgan havola: href'siz, fokuslanmaydi
    element = (
      <a {...props} {...common} aria-disabled="true" data-disabled="">
        {inner}
      </a>
    );
  } else {
    element = (
      <button
        type="button"
        {...(props as ComponentProps<'button'>)}
        {...common}
        disabled={disabled}
        data-disabled={disabled ? '' : undefined}
      >
        {inner}
      </button>
    );
  }

  return (
    <li data-slot="sidebar-item-wrapper" className="list-none">
      <Tooltip content={text} side="right" disabled={!collapsed || !text}>
        {element}
      </Tooltip>
    </li>
  );
}

/**
 * Yon menyu. `AppShell` ichida: desktop'da yig'iladi (64px, ikonkalar + Tooltip),
 * `< 1024px` da chapdan chiqadigan `Drawer` bo'ladi.
 */
export const Sidebar = Object.assign(SidebarRoot, {
  Header: SidebarHeader,
  Content: SidebarContent,
  Footer: SidebarFooter,
  Group: SidebarGroup,
  Item: SidebarItem,
});
