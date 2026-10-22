import { getPagination, useControllableState } from '@akhatmirzo/hooks';
import type { ComponentProps, MouseEvent, ReactNode, SVGProps } from 'react';
import { cn } from '../../lib/cn';
import { buttonVariants } from '../button';

/* Ichki ikonkalar */

function Icon({ children, ...props }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

const icons = {
  previous: (
    <Icon>
      <path d="m15 18-6-6 6-6" />
    </Icon>
  ),
  next: (
    <Icon>
      <path d="m9 18 6-6-6-6" />
    </Icon>
  ),
  first: (
    <Icon>
      <path d="m17 18-6-6 6-6M7 6v12" />
    </Icon>
  ),
  last: (
    <Icon>
      <path d="m7 18 6-6-6-6M17 6v12" />
    </Icon>
  ),
};

/* Turlar */

export type PaginationSize = 'sm' | 'md';

export interface PaginationLabels {
  /** `<nav>` nomi. Default `"Sahifalash"` */
  nav?: string;
  previous?: string;
  next?: string;
  first?: string;
  last?: string;
  /** Sahifa tugmasi nomi. Default `(n) => "${n}-sahifa"` */
  page?: (page: number) => string;
  /** Ko'p nuqta (…) uchun ekran o'quvchi matni */
  ellipsis?: string;
  /** Ixcham rejimdagi "3 / 24" uchun ekran o'quvchi matni */
  compact?: (page: number, pageCount: number) => string;
}

const defaultLabels: Required<PaginationLabels> = {
  nav: 'Sahifalash',
  previous: 'Oldingi sahifa',
  next: 'Keyingi sahifa',
  first: 'Birinchi sahifa',
  last: 'Oxirgi sahifa',
  page: (n) => `${n}-sahifa`,
  ellipsis: 'Boshqa sahifalar',
  compact: (page, count) => `${page}-sahifa, jami ${count} ta`,
};

/** `renderLink` ga beriladigan prop'lar — hammasini havola elementiga yoying */
export interface PaginationLinkProps {
  href: string;
  className: string;
  children: ReactNode;
  'aria-label': string;
  'aria-current'?: 'page';
  'data-size': PaginationSize;
  'data-active'?: '';
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  /** Havola qaysi sahifaga olib boradi (1 dan) */
  page: number;
}

export interface PaginationProps extends Omit<ComponentProps<'nav'>, 'children'> {
  /** Joriy sahifa (1 dan boshlanadi; boshqariladigan rejim) */
  page?: number;
  /** Boshlang'ich sahifa. Default `1` */
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  /** Jami yozuvlar soni (`pageSize` bilan) */
  total?: number;
  /** Bir sahifadagi yozuvlar soni. Default `10` */
  pageSize?: number;
  /** Sahifalar soni to'g'ridan-to'g'ri (`total` / `pageSize` o'rniga) */
  pageCount?: number;
  /** Joriy sahifaning har ikki tomonidagi sahifalar. Default `1` */
  siblings?: number;
  /** Berilsa — tugmalar haqiqiy `<a href>` havolalar bo'ladi (SEO) */
  getHref?: (page: number) => string;
  /** O'z havola komponentingiz (Next `Link`). `getHref` bilan ishlaydi */
  renderLink?: (props: PaginationLinkProps) => ReactNode;
  /** Tugma o'lchami: 32 / 40px. Default `md` */
  size?: PaginationSize;
  /** ⏮ ⏭ — birinchi / oxirgi sahifa tugmalari. Default `false` */
  showFirstLast?: boolean;
  /** `"‹ 3 / 24 ›"` ko'rinishi. `'auto'` — faqat 640px dan tor ekranda. Default `'auto'` */
  compact?: boolean | 'auto';
  labels?: PaginationLabels;
}

const itemSize: Record<PaginationSize, string> = {
  sm: 'min-w-8 px-1.5',
  md: 'min-w-10 px-2',
};

const itemBase = 'rounded-md text-sm text-text tabular-nums';
const itemCurrent = 'bg-primary text-primary-foreground not-data-disabled:hover:bg-primary-hover';

/**
 * Sahifalash: oldingi / keyingi, sahifa raqamlari va ko'p nuqta. Hisob — `getPagination`
 * (`@akhatmirzo/hooks`). `getHref` berilsa — haqiqiy havolalar (qidiruv tizimlari uchun).
 * @example
 * <Pagination page={page} onPageChange={setPage} total={230} pageSize={10} />
 * <Pagination page={page} total={230} pageSize={10} getHref={(p) => `/blog?page=${p}`} />
 */
export function Pagination({
  page: pageProp,
  defaultPage = 1,
  onPageChange,
  total,
  pageSize = 10,
  pageCount: pageCountProp,
  siblings = 1,
  getHref,
  renderLink,
  size = 'md',
  showFirstLast = false,
  compact = 'auto',
  labels: labelsProp,
  className,
  ...props
}: PaginationProps) {
  const labels = { ...defaultLabels, ...labelsProp };
  const [pageState, setPage] = useControllableState<number>({
    value: pageProp,
    defaultValue: defaultPage,
    onChange: onPageChange,
  });

  // pageCount berilsa — har bir "yozuv" bitta sahifa deb hisoblanadi
  const { pages, page, pageCount, hasPrev, hasNext } =
    pageCountProp !== undefined
      ? getPagination({ total: pageCountProp, pageSize: 1, page: pageState, siblings })
      : getPagination({ total: total ?? 0, pageSize, page: pageState, siblings });

  const item = (
    target: number,
    content: ReactNode,
    label: string,
    opts: { current?: boolean; disabled?: boolean; icon?: boolean } = {},
  ) => {
    const classes = cn(
      buttonVariants({ variant: 'ghost', size }),
      itemBase,
      itemSize[size],
      opts.icon && 'px-0 text-text-subtle [&_svg]:size-4',
      opts.current && itemCurrent,
    );
    const shared = {
      'aria-label': label,
      'aria-current': opts.current ? ('page' as const) : undefined,
      'data-size': size,
      'data-active': opts.current ? ('' as const) : undefined,
    };

    // Chekkadagi oldingi / keyingi — havola emas, o'chirilgan tugma
    if (opts.disabled || !getHref) {
      return (
        <button
          type="button"
          disabled={opts.disabled}
          data-disabled={opts.disabled ? '' : undefined}
          className={classes}
          onClick={() => setPage(target)}
          {...shared}
        >
          {content}
        </button>
      );
    }

    const href = getHref(target);
    // Yangi oynada ochish (Ctrl/⌘/Shift/o'rta tugma) — joriy sahifa holati o'zgarmaydi
    const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      setPage(target);
    };
    if (renderLink) {
      return renderLink({
        ...shared,
        href,
        className: classes,
        children: content,
        onClick,
        page: target,
      });
    }
    return (
      <a href={href} className={classes} onClick={onClick} {...shared}>
        {content}
      </a>
    );
  };

  const prev = item(page - 1, icons.previous, labels.previous, { disabled: !hasPrev, icon: true });
  const next = item(page + 1, icons.next, labels.next, { disabled: !hasNext, icon: true });
  const first =
    showFirstLast && item(1, icons.first, labels.first, { disabled: !hasPrev, icon: true });
  const last =
    showFirstLast && item(pageCount, icons.last, labels.last, { disabled: !hasNext, icon: true });

  const full = (
    <ul
      data-slot="pagination-list"
      className={cn(
        'm-0 flex list-none flex-wrap items-center gap-1 p-0',
        compact === 'auto' && 'max-sm:hidden',
      )}
    >
      {first && <li>{first}</li>}
      <li>{prev}</li>
      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <li
            key={`e${i}`}
            data-slot="pagination-ellipsis"
            className={cn(
              'inline-flex items-center justify-center text-sm text-text-muted select-none',
              itemSize[size],
            )}
          >
            <span aria-hidden="true">…</span>
            <span className="sr-only">{labels.ellipsis}</span>
          </li>
        ) : (
          <li key={p}>{item(p, p, labels.page(p), { current: p === page })}</li>
        ),
      )}
      <li>{next}</li>
      {last && <li>{last}</li>}
    </ul>
  );

  const short = (
    <ul
      data-slot="pagination-compact"
      className={cn('m-0 flex list-none items-center gap-1 p-0', compact === 'auto' && 'sm:hidden')}
    >
      {first && <li>{first}</li>}
      <li>{prev}</li>
      <li
        aria-current="page"
        className="inline-flex min-w-16 items-center justify-center px-2 text-sm text-text tabular-nums"
      >
        <span aria-hidden="true">
          {page} <span className="text-text-muted">/ {pageCount}</span>
        </span>
        <span className="sr-only">{labels.compact(page, pageCount)}</span>
      </li>
      <li>{next}</li>
      {last && <li>{last}</li>}
    </ul>
  );

  return (
    <nav
      aria-label={labels.nav}
      data-slot="pagination"
      data-size={size}
      data-compact={compact === true ? '' : compact === 'auto' ? 'auto' : undefined}
      className={cn('flex font-sans', className)}
      {...props}
    >
      {compact === true ? short : full}
      {compact === 'auto' && short}
    </nav>
  );
}

/* PaginationInfo */

export interface PaginationInfoLabels {
  /** Default `(from, to, total) => "${from}–${to} / ${total} ta"` */
  template?: (from: number, to: number, total: number) => ReactNode;
  /** Yozuvlar yo'q bo'lganda. Default `"Ma'lumot yo'q"` */
  empty?: ReactNode;
}

export interface PaginationInfoProps extends Omit<ComponentProps<'p'>, 'children'> {
  /** Joriy sahifa (1 dan) */
  page: number;
  pageSize: number;
  total: number;
  labels?: PaginationInfoLabels;
}

/**
 * `"21–30 / 230 ta"` — joriy sahifadagi yozuvlar oralig'i (`getPagination` hisobi).
 * @example
 * <PaginationInfo page={3} pageSize={10} total={230} />
 */
export function PaginationInfo({
  page,
  pageSize,
  total,
  labels,
  className,
  ...props
}: PaginationInfoProps) {
  const { from, to } = getPagination({ total, pageSize, page });
  const template = labels?.template ?? ((f, t, n) => `${f}–${t} / ${n} ta`);
  return (
    <p
      data-slot="pagination-info"
      aria-live="polite"
      className={cn('m-0 font-sans text-sm text-text-muted tabular-nums', className)}
      {...props}
    >
      {total > 0 ? template(from, to, total) : (labels?.empty ?? "Ma'lumot yo'q")}
    </p>
  );
}
