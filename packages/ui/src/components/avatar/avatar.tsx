import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarShape = 'circle' | 'square';
export type AvatarStatus = 'online' | 'offline' | 'busy';

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'size-6 text-xs',
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-12 text-base',
  xl: 'size-16 text-xl',
};

const squareRadius: Record<AvatarSize, string> = {
  xs: 'rounded-sm',
  sm: 'rounded-md',
  md: 'rounded-lg',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
};

const statusSize: Record<AvatarSize, string> = {
  xs: 'size-1.5',
  sm: 'size-2',
  md: 'size-2.5',
  lg: 'size-3',
  xl: 'size-3.5',
};

const statusColor: Record<AvatarStatus, string> = {
  online: 'bg-success',
  offline: 'bg-text-faint',
  busy: 'bg-danger',
};

/** Bosh harflar foni — faqat tokenlardagi soft/foreground juftliklari (dark'da ham to'g'ri) */
const palette = [
  'bg-primary-soft text-primary-soft-foreground',
  'bg-success-soft text-success-soft-foreground',
  'bg-warning-soft text-warning-soft-foreground',
  'bg-danger-soft text-danger-soft-foreground',
  'bg-info-soft text-info-soft-foreground',
  'bg-surface-muted text-text-subtle',
] as const;

const LETTER = /[\p{L}\p{N}]/u;

function firstLetter(word: string) {
  return Array.from(word).find((ch) => LETTER.test(ch)) ?? '';
}

/** "Sarvar Abduxoliqov" → "SA", "Sarvar" → "S" */
export function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  const first = firstLetter(words[0] ?? '');
  const last = words.length > 1 ? firstLetter(words[words.length - 1] ?? '') : '';
  return (first + last).toLocaleUpperCase('uz');
}

/** Ismdan deterministik rang: bir ism — doim bir rang */
export function getAvatarColor(name: string): string {
  let hash = 0;
  for (const ch of name.trim().toLocaleLowerCase('uz')) {
    hash = (hash * 31 + (ch.codePointAt(0) ?? 0)) >>> 0;
  }
  return palette[hash % palette.length] ?? palette[0];
}

interface GroupContextValue {
  size: AvatarSize;
  shape: AvatarShape;
}

const AvatarGroupContext = createContext<GroupContextValue | null>(null);

export interface AvatarLabels {
  /** Holat nomlari (ekran o'quvchi uchun) */
  status?: Partial<Record<AvatarStatus, string>>;
}

const defaultStatusLabels: Record<AvatarStatus, string> = {
  online: 'onlayn',
  offline: 'oflayn',
  busy: 'band',
};

export interface AvatarProps extends Omit<ComponentProps<'span'>, 'children'> {
  src?: string;
  alt?: string;
  /** Rasm yo'q yoki yuklanmasa — bosh harflar va rang shu ismdan */
  name?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  /** Burchakdagi holat nuqtasi */
  status?: AvatarStatus;
  /** Ism ham, rasm ham bo'lmasa ko'rsatiladi (default — odam ikonkasi) */
  fallback?: ReactNode;
  labels?: AvatarLabels;
}

export function Avatar({
  src,
  alt,
  name,
  size: sizeProp,
  shape: shapeProp,
  status,
  fallback,
  labels,
  className,
  ...props
}: AvatarProps) {
  const group = useContext(AvatarGroupContext);
  const size = sizeProp ?? group?.size ?? 'md';
  const shape = shapeProp ?? group?.shape ?? 'circle';

  const [failedSrc, setFailedSrc] = useState<string>();
  const [loadedSrc, setLoadedSrc] = useState<string>();
  const showImage = Boolean(src) && failedSrc !== src;
  const loaded = showImage && loadedSrc === src;

  const initials = name ? getInitials(name) : '';
  const label = alt || name;
  const statusLabel = status ? (labels?.status?.[status] ?? defaultStatusLabels[status]) : '';
  const ariaLabel = label ? (status ? `${label} (${statusLabel})` : label) : undefined;

  return (
    <span
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      data-size={size}
      data-shape={shape}
      data-status={status}
      data-state={showImage ? (loaded ? 'loaded' : 'loading') : 'fallback'}
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center font-sans leading-none font-semibold select-none',
        sizeClasses[size],
        shape === 'circle' ? 'rounded-full' : squareRadius[size],
        initials ? getAvatarColor(name ?? '') : 'bg-surface-muted text-text-muted',
        group && 'ring-2 ring-surface',
        className,
      )}
      {...props}
    >
      <span aria-hidden="true" data-avatar-fallback="" className="contents">
        {initials || fallback || <UserIcon />}
      </span>
      {showImage && (
        <img
          key={src}
          src={src}
          alt=""
          draggable={false}
          onLoad={() => setLoadedSrc(src)}
          onError={() => setFailedSrc(src)}
          className={cn(
            'absolute inset-0 size-full rounded-[inherit] object-cover transition-opacity duration-base ease-out',
            loaded ? 'opacity-100' : 'opacity-0',
          )}
        />
      )}
      {status && (
        <span
          aria-hidden="true"
          data-avatar-status={status}
          className={cn(
            'absolute right-0 bottom-0 rounded-full ring-2 ring-surface',
            statusSize[size],
            statusColor[status],
            shape === 'square' && 'translate-x-1/4 translate-y-1/4',
          )}
        />
      )}
    </span>
  );
}

function UserIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3/5"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" />
    </svg>
  );
}

const overlap: Record<AvatarSize, string> = {
  xs: '-space-x-1',
  sm: '-space-x-1.5',
  md: '-space-x-2',
  lg: '-space-x-2.5',
  xl: '-space-x-3',
};

export interface AvatarGroupLabels {
  /** "+N" uchun ekran o'quvchi matni */
  more?: (count: number) => string;
}

export interface AvatarGroupProps extends ComponentProps<'div'> {
  /** Ko'pi bilan nechta avatar ko'rsatiladi; qolgani "+N" */
  max?: number;
  size?: AvatarSize;
  shape?: AvatarShape;
  labels?: AvatarGroupLabels;
}

export function AvatarGroup({
  max,
  size = 'md',
  shape = 'circle',
  labels,
  className,
  children,
  ...props
}: AvatarGroupProps) {
  const items = Children.toArray(children).filter(isValidElement);
  const limit = max !== undefined && max >= 0 && max < items.length ? max : items.length;
  const rest = items.length - limit;
  const moreLabel = labels?.more?.(rest) ?? `Yana ${rest} ta`;

  return (
    <AvatarGroupContext.Provider value={{ size, shape }}>
      <div
        role="group"
        data-size={size}
        className={cn('flex items-center', overlap[size], className)}
        {...props}
      >
        {items.slice(0, limit)}
        {rest > 0 && (
          <span
            role="img"
            aria-label={moreLabel}
            data-avatar-more=""
            className={cn(
              'relative inline-flex shrink-0 items-center justify-center bg-surface-muted font-sans text-xs leading-none font-semibold text-text-muted ring-2 ring-surface select-none',
              sizeClasses[size],
              size === 'xs' || size === 'sm' ? 'text-xs' : 'text-sm',
              shape === 'circle' ? 'rounded-full' : squareRadius[size],
            )}
          >
            +{rest}
          </span>
        )}
      </div>
    </AvatarGroupContext.Provider>
  );
}
