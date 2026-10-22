import type { ComponentProps, MouseEvent, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { DropdownMenu } from '../dropdown-menu';

/* Ichki ikonkalar */

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
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

/* Turlar */

export type BreadcrumbSize = 'sm' | 'md';

export interface BreadcrumbItem {
  label: ReactNode;
  /** Havola manzili. Oxirgi element (joriy sahifa) havola bo'lmaydi */
  href?: string;
  icon?: ReactNode;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
}

export interface BreadcrumbLabels {
  /** `<nav>` nomi. Default `"Sahifa yo'li"` */
  nav?: string;
  /** `…` tugmasi nomi. Default `"Yashirilgan sahifalar"` */
  more?: string;
}

/** `renderLink` ga beriladigan prop'lar — hammasini havola elementiga yoying */
export interface BreadcrumbLinkProps {
  href: string;
  className: string;
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
}

export interface BreadcrumbProps extends Omit<ComponentProps<'nav'>, 'children'> {
  /** Yo'l elementlari; oxirgisi — joriy sahifa */
  items: BreadcrumbItem[];
  /** Ajratuvchi. Default — ichki chevron `›` */
  separator?: ReactNode;
  /**
   * Shundan ko'p bo'lsa: birinchi + `…` + oxirgilari (`maxItems - 2` ta, kamida 1).
   * Yashiringanlar `…` bosilganda menyuda. Tor ekranda (`< 640px`) har doim: `…` + ota + joriy
   */
  maxItems?: number;
  /** O'z havola komponentingiz (Next `Link`). Default — `<a>` */
  renderLink?: (props: BreadcrumbLinkProps) => ReactNode;
  /** `md` — `text-sm`, `sm` — `text-xs`. Default `md` */
  size?: BreadcrumbSize;
  labels?: BreadcrumbLabels;
}

const MOBILE_VISIBLE = 2;

const linkBase =
  'inline-flex max-w-[20ch] min-w-0 items-center gap-1.5 rounded-sm text-text-muted no-underline transition-colors duration-base ease-out focus-ring';

/**
 * Sahifa yo'li (non ushoqlari). Oxirgi element — joriy sahifa (`aria-current="page"`).
 * @example
 * <Breadcrumb
 *   items={[
 *     { label: 'Bosh sahifa', href: '/' },
 *     { label: 'Mahsulotlar', href: '/products' },
 *     { label: 'iPhone 17' },
 *   ]}
 *   maxItems={4}
 * />
 */
export function Breadcrumb({
  items,
  separator,
  maxItems,
  renderLink,
  size = 'md',
  labels,
  className,
  ...props
}: BreadcrumbProps) {
  const count = items.length;
  const moreLabel = labels?.more ?? 'Yashirilgan sahifalar';

  // Keng ekran: birinchi + … + oxirgi (maxItems - 2) ta
  const desktopTail = maxItems !== undefined ? Math.max(1, maxItems - 2) : count;
  // Kamida bitta element yashirilsagina yig'iladi (bo'sh "…" menyusi chiqmasin)
  const desktopCollapsed =
    maxItems !== undefined && maxItems > 0 && count > maxItems && count - desktopTail > 1;
  const hiddenDesktop = (i: number) => desktopCollapsed && i > 0 && i < count - desktopTail;

  // Tor ekran: … + ota + joriy
  const mobileCollapsed = count > MOBILE_VISIBLE;
  const hiddenMobile = (i: number) => mobileCollapsed && i < count - MOBILE_VISIBLE;

  const sep = (
    <span
      aria-hidden="true"
      data-slot="breadcrumb-separator"
      className="inline-flex shrink-0 items-center text-text-faint [&_svg]:size-3.5"
    >
      {separator ?? <ChevronIcon />}
    </span>
  );

  const content = (item: BreadcrumbItem) => (
    <>
      {item.icon != null && (
        <span aria-hidden="true" className="inline-flex shrink-0 [&_svg]:size-4">
          {item.icon}
        </span>
      )}
      <span className="truncate">{item.label}</span>
    </>
  );

  const link = (item: BreadcrumbItem) => {
    if (item.href !== undefined) {
      const className = cn(linkBase, 'hover:text-text');
      if (renderLink) {
        return renderLink({
          href: item.href,
          className,
          children: content(item),
          onClick: item.onClick,
        });
      }
      return (
        <a href={item.href} className={className} onClick={item.onClick}>
          {content(item)}
        </a>
      );
    }
    if (item.onClick) {
      return (
        <button
          type="button"
          onClick={item.onClick}
          className={cn(
            linkBase,
            'cursor-pointer border-0 bg-transparent p-0 font-sans text-[length:inherit] hover:text-text',
          )}
        >
          {content(item)}
        </button>
      );
    }
    return <span className={cn(linkBase, 'rounded-none')}>{content(item)}</span>;
  };

  const ellipsis = (hidden: number[], viewport: 'desktop' | 'mobile', withSeparator: boolean) => (
    <li
      key={`more-${viewport}`}
      data-slot="breadcrumb-ellipsis"
      data-viewport={viewport}
      className={cn(
        'inline-flex min-w-0 items-center gap-1.5',
        viewport === 'desktop' ? 'max-sm:hidden' : 'sm:hidden',
      )}
    >
      {withSeparator && sep}
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            aria-label={moreLabel}
            className={cn(
              'inline-flex h-6 min-w-6 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent px-1 font-sans text-text-muted',
              'transition-colors duration-base ease-out hover:bg-surface-muted hover:text-text focus-ring',
              'data-[state=open]:bg-surface-muted data-[state=open]:text-text',
            )}
          >
            <span aria-hidden="true">…</span>
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          {hidden.map((i) => {
            const item = items[i]!;
            if (item.href !== undefined) {
              return (
                <DropdownMenu.Item key={i} asChild icon={item.icon}>
                  {renderLink ? (
                    renderLink({
                      href: item.href,
                      className: 'no-underline',
                      children: item.label,
                      onClick: item.onClick,
                    })
                  ) : (
                    <a href={item.href} className="no-underline" onClick={item.onClick}>
                      {item.label}
                    </a>
                  )}
                </DropdownMenu.Item>
              );
            }
            return (
              <DropdownMenu.Item
                key={i}
                icon={item.icon}
                disabled={!item.onClick}
                onClick={item.onClick}
              >
                {item.label}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu>
    </li>
  );

  const range = (filter: (i: number) => boolean) => items.map((_, i) => i).filter((i) => filter(i));

  const nodes: ReactNode[] = [];
  items.forEach((item, i) => {
    const hideD = hiddenDesktop(i);
    const hideM = hiddenMobile(i);
    const current = i === count - 1;

    if (!(hideD && hideM)) {
      nodes.push(
        <li
          key={i}
          data-slot="breadcrumb-item"
          className={cn(
            'inline-flex min-w-0 items-center gap-1.5',
            hideD && 'sm:hidden',
            hideM && 'max-sm:hidden',
          )}
        >
          {i > 0 && sep}
          {current ? (
            <span
              aria-current="page"
              className="inline-flex max-w-[32ch] min-w-0 items-center gap-1.5 font-medium text-text"
            >
              {content(item)}
            </span>
          ) : (
            link(item)
          )}
        </li>,
      );
    }

    // Ko'p nuqtalar birinchi elementdan keyin turadi
    if (i === 0) {
      if (mobileCollapsed) nodes.push(ellipsis(range(hiddenMobile), 'mobile', false));
      if (desktopCollapsed) nodes.push(ellipsis(range(hiddenDesktop), 'desktop', true));
    }
  });

  return (
    <nav
      aria-label={labels?.nav ?? "Sahifa yo'li"}
      data-slot="breadcrumb"
      data-size={size}
      className={cn('min-w-0 font-sans', className)}
      {...props}
    >
      <ol
        className={cn(
          'm-0 flex list-none flex-wrap items-center gap-x-1.5 gap-y-1 p-0 max-sm:flex-nowrap',
          size === 'sm' ? 'text-xs' : 'text-sm',
        )}
      >
        {nodes}
      </ol>
    </nav>
  );
}
