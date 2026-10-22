import { useControllableState, useHotkeys, useMediaQuery } from '@akhatmirzo/hooks';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from 'react';
import { cn } from '../../lib/cn';
import { mergeRefs } from '../../lib/refs';
import { IconButton, type IconButtonProps } from '../icon-button';
import { Tooltip } from '../tooltip';

/** Desktop rejimi chegarasi (Tailwind `lg`) — undan kichikda sidebar Drawer'ga o'tadi */
export const APP_SHELL_DESKTOP_QUERY = '(min-width: 1024px)';

function isDesktopViewport() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return true;
  return window.matchMedia(APP_SHELL_DESKTOP_QUERY).matches;
}

/* ---------- Kontekst ---------- */

export interface AppShellContextValue {
  /** Desktop: sidebar to'liq ochiqmi (`false` — 64px ikonka qatori) */
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  /** Ekran o'lchamiga qarab: desktop'da yig'adi/yoyadi, telefonda Drawer'ni ochadi/yopadi */
  toggleSidebar: () => void;
  /** Telefon / planshet (`< 1024px`): Drawer ochiqmi */
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  /** Desktop sidebar yig'ilganmi (`!sidebarOpen`) */
  collapsed: boolean;
  /** @internal aria-controls uchun id'lar */
  ids: { sidebar: string; mobileSidebar: string; main: string };
  /** @internal klaviatura yorlig'i (Tooltip uchun) */
  shortcut: string | false;
}

const AppShellContext = createContext<AppShellContextValue | null>(null);

/**
 * `AppShell` holati: `{ sidebarOpen, setSidebarOpen, toggleSidebar, mobileOpen, setMobileOpen, collapsed }`.
 * Faqat `AppShell` ichida ishlaydi.
 */
export function useAppShell(): AppShellContextValue {
  const ctx = useContext(AppShellContext);
  if (!ctx) throw new Error('useAppShell() faqat <AppShell> ichida ishlatiladi');
  return ctx;
}

/** @internal Sidebar'ni AppShell'siz ham ishlatish uchun (null bo'lishi mumkin) */
export function useOptionalAppShell() {
  return useContext(AppShellContext);
}

/* ---------- AppShell ---------- */

export interface AppShellLabels {
  /** Skip link matni */
  skipToContent?: string;
}

export interface AppShellProps extends ComponentProps<'div'> {
  /** Desktop sidebar ochiqmi (boshqariladigan rejim). `false` — yig'ilgan (64px) */
  sidebarOpen?: boolean;
  /** Boshlang'ich holat (boshqarilmaydigan rejim) */
  defaultSidebarOpen?: boolean;
  onSidebarOpenChange?: (open: boolean) => void;
  /**
   * Berilsa — desktop holati `localStorage` ga shu kalit bilan yoziladi va keyingi tashrifda
   * tiklanadi. SSR-xavfsiz: serverda va birinchi renderda `defaultSidebarOpen` chiziladi,
   * saqlangan qiymat mount'dan keyin o'qiladi.
   */
  sidebarStorageKey?: string;
  /** Yig'ish/yoyish yorlig'i (`useHotkeys` formati). `false` — o'chirilgan */
  shortcut?: string | false;
  labels?: AppShellLabels;
}

/** Desktop sidebar elementlari (`Sidebar.Item`) DOM tartibida */
function sidebarItems(root: HTMLElement | null): HTMLElement[] {
  return Array.from(
    root?.querySelectorAll<HTMLElement>('[data-slot="sidebar"] [data-slot="sidebar-item"]') ?? [],
  );
}

function readStoredOpen(key: string): boolean | undefined {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === 'true') return true;
    if (raw === 'false') return false;
  } catch {
    // storage taqiqlangan — e'tiborsiz
  }
  return undefined;
}

function writeStoredOpen(key: string, open: boolean) {
  try {
    window.localStorage.setItem(key, String(open));
  } catch {
    // storage taqiqlangan yoki to'la — holat baribir ishlaydi
  }
}

function AppShellRoot({
  sidebarOpen: sidebarOpenProp,
  defaultSidebarOpen = true,
  onSidebarOpenChange,
  sidebarStorageKey,
  shortcut = 'mod+b',
  labels,
  className,
  children,
  ref,
  ...props
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpenState] = useControllableState({
    value: sidebarOpenProp,
    defaultValue: defaultSidebarOpen,
    onChange: onSidebarOpenChange,
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  // Birinchi bo'yashdan keyin animatsiya yoqiladi — saqlangan holat tiklanganda "sakrash" ko'rinmasin
  const [ready, setReady] = useState(false);

  const baseId = useId();
  const ids = useMemo(
    () => ({
      sidebar: `${baseId}-sidebar`,
      mobileSidebar: `${baseId}-sidebar-mobile`,
      main: `${baseId}-main`,
    }),
    [baseId],
  );

  useEffect(() => {
    if (sidebarStorageKey) {
      const stored = readStoredOpen(sidebarStorageKey);
      if (stored !== undefined) setSidebarOpenState(stored);
    }
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, [sidebarStorageKey, setSidebarOpenState]);

  // Yig'ish/yoyishda sidebar ichidagi elementlar qayta chiziladi (Tooltip o'rami, collapsible
  // guruh sarlavhasi) — fokus `body` ga tushib qolmasa, o'sha Item'ga (yoki birinchisiga) qaytaramiz
  const rootRef = useRef<HTMLDivElement | null>(null);
  /** `null` — fokus sidebar'da emas edi; `-1` — Item bo'lmagan elementda edi */
  const focusRestore = useRef<number | null>(null);
  useLayoutEffect(() => {
    const index = focusRestore.current;
    focusRestore.current = null;
    if (index === null) return;
    const active = document.activeElement;
    if (active && active !== document.body && active.isConnected) return;
    const items = sidebarItems(rootRef.current);
    (items[index] ?? items[0])?.focus();
  }, [sidebarOpen]);

  const setSidebarOpen = useCallback(
    (open: boolean) => {
      const active = typeof document === 'undefined' ? null : document.activeElement;
      const sidebar = rootRef.current?.querySelector('[data-slot="sidebar"]');
      focusRestore.current =
        active && sidebar?.contains(active)
          ? sidebarItems(rootRef.current).indexOf(active as HTMLElement)
          : null;
      setSidebarOpenState(open);
      if (sidebarStorageKey) writeStoredOpen(sidebarStorageKey, open);
    },
    [setSidebarOpenState, sidebarStorageKey],
  );

  const toggleSidebar = useCallback(() => {
    if (isDesktopViewport()) setSidebarOpen(!sidebarOpen);
    else setMobileOpen((o) => !o);
  }, [setSidebarOpen, sidebarOpen]);

  useHotkeys(shortcut || '', toggleSidebar, { enabled: Boolean(shortcut) });

  // Ekran desktop'gacha kengaysa — ochiq qolgan mobil Drawer yopiladi
  const desktop = useMediaQuery(APP_SHELL_DESKTOP_QUERY, true);
  if (desktop && mobileOpen) setMobileOpen(false);

  const collapsed = !sidebarOpen;
  const value = useMemo<AppShellContextValue>(
    () => ({
      sidebarOpen,
      setSidebarOpen,
      toggleSidebar,
      mobileOpen,
      setMobileOpen,
      collapsed,
      ids,
      shortcut,
    }),
    [sidebarOpen, setSidebarOpen, toggleSidebar, mobileOpen, collapsed, ids, shortcut],
  );

  return (
    <AppShellContext.Provider value={value}>
      <div
        ref={mergeRefs(rootRef, ref)}
        data-slot="app-shell"
        data-sidebar-state={collapsed ? 'collapsed' : 'expanded'}
        data-ready={ready ? '' : undefined}
        className={cn(
          'group/app-shell min-h-(--ak-app-shell-height) bg-background font-sans text-text [--ak-app-shell-height:100dvh]',
          'lg:grid lg:grid-cols-[auto_minmax(0,1fr)]',
          className,
        )}
        {...props}
      >
        <a
          href={`#${ids.main}`}
          data-slot="app-shell-skip-link"
          className="focus-ring sr-only z-(--ak-z-tooltip) rounded-lg bg-surface px-3 py-2 text-sm font-medium text-text shadow-md focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        >
          {labels?.skipToContent ?? "Asosiy kontentga o'tish"}
        </a>
        {children}
      </div>
    </AppShellContext.Provider>
  );
}

/* ---------- Main ---------- */

export type AppShellMainProps = ComponentProps<'main'>;

/** Asosiy kontent (`<main>`): skip link shu yerga olib keladi. Ichiga `AppShell.Header` va sahifa */
export function AppShellMain({ className, id, ...props }: AppShellMainProps) {
  const shell = useOptionalAppShell();
  return (
    <main
      data-slot="app-shell-main"
      id={id ?? shell?.ids.main}
      tabIndex={-1}
      className={cn('flex min-w-0 flex-col outline-none', className)}
      {...props}
    />
  );
}

/* ---------- Header ---------- */

export type AppShellHeaderProps = ComponentProps<'header'>;

/** Yopishqoq yuqori panel: 56px, pastki chegara */
export function AppShellHeader({ className, ...props }: AppShellHeaderProps) {
  return (
    <header
      data-slot="app-shell-header"
      className={cn(
        'sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/85 px-4 backdrop-blur sm:px-6',
        className,
      )}
      {...props}
    />
  );
}

/* ---------- SidebarToggle ---------- */

function MenuIcon() {
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
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
    </svg>
  );
}

/** `"mod+b"` → `["mod", "B"]` (Tooltip'dagi Kbd uchun; bir nechta kombinatsiya bo'lsa — birinchisi) */
function shortcutKeys(shortcut: string | false): string[] | undefined {
  if (!shortcut) return undefined;
  const first = shortcut.split(',')[0]?.trim();
  if (!first) return undefined;
  return first
    .split('+')
    .map((k) => (k.length === 1 ? k.toUpperCase() : k.toLowerCase() === 'mod' ? 'mod' : k));
}

export interface AppShellSidebarToggleProps extends Omit<IconButtonProps, 'aria-label'> {
  /** Default — `"Yon menyu"` */
  'aria-label'?: string;
}

/**
 * Sidebar tugmasi: desktop'da yig'adi/yoyadi, telefonda Drawer'ni ochadi.
 * `aria-expanded` va `aria-controls` joriy rejimga qarab qo'yiladi.
 */
export function AppShellSidebarToggle({
  'aria-label': ariaLabel = 'Yon menyu',
  variant = 'ghost',
  onClick,
  children,
  className,
  ...props
}: AppShellSidebarToggleProps) {
  const shell = useAppShell();
  const desktop = useMediaQuery(APP_SHELL_DESKTOP_QUERY, true);
  return (
    <Tooltip content={ariaLabel} shortcut={shortcutKeys(shell.shortcut)}>
      <IconButton
        data-slot="app-shell-sidebar-toggle"
        variant={variant}
        aria-label={ariaLabel}
        aria-expanded={desktop ? shell.sidebarOpen : shell.mobileOpen}
        aria-controls={desktop ? shell.ids.sidebar : shell.ids.mobileSidebar}
        className={cn('-ml-2', className)}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) shell.toggleSidebar();
        }}
        {...props}
      >
        {children ?? <MenuIcon />}
      </IconButton>
    </Tooltip>
  );
}

/**
 * Admin panel / dashboard qolipi: chapda `Sidebar` (desktop'da yig'iladi, `< 1024px` da Drawer),
 * o'ngda `AppShell.Main` (`AppShell.Header` + sahifa). Skip link o'zi qo'yiladi.
 * @example
 * <AppShell sidebarStorageKey="sidebar">
 *   <Sidebar>…</Sidebar>
 *   <AppShell.Main>
 *     <AppShell.Header><AppShell.SidebarToggle /></AppShell.Header>
 *     {children}
 *   </AppShell.Main>
 * </AppShell>
 */
export const AppShell = Object.assign(AppShellRoot, {
  Main: AppShellMain,
  Header: AppShellHeader,
  SidebarToggle: AppShellSidebarToggle,
});
