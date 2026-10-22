'use client';

import { Button, Skeleton } from '@akhatmirzo/ui';
import { AlertTriangle, CheckCircle2, Info, OctagonAlert, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { DEMO_CODE, DEMO_PASSWORD } from './data';

/** Sahifa sarlavhasi: ixtiyoriy ikonka, h1 va izoh. Sahifa ochilganda fokus sarlavhaga o'tadi */
export function AuthHeader({
  icon,
  title,
  description,
  focusOnMount = false,
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Bosqich almashganda ekran o'quvchi yangi sarlavhani o'qishi uchun */
  focusOnMount?: boolean;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (focusOnMount) ref.current?.focus({ preventScroll: true });
  }, [focusOnMount]);

  return (
    <div className="mb-7">
      {icon && (
        <span
          aria-hidden="true"
          className="mb-5 grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary-soft-foreground [&_svg]:size-6"
        >
          {icon}
        </span>
      )}
      <h1
        ref={ref}
        tabIndex={-1}
        className="text-2xl font-bold tracking-tight text-text outline-none sm:text-3xl"
      >
        {title}
      </h1>
      {description && <p className="mt-2 text-sm leading-relaxed text-text-muted">{description}</p>}
    </div>
  );
}

const noticeStyles = {
  info: { box: 'bg-info-soft text-info-soft-foreground', icon: Info },
  success: { box: 'bg-success-soft text-success-soft-foreground', icon: CheckCircle2 },
  warning: { box: 'bg-warning-soft text-warning-soft-foreground', icon: AlertTriangle },
  danger: { box: 'bg-danger-soft text-danger-soft-foreground', icon: OctagonAlert },
} as const;

/** Forma ichidagi xabar bloki (alert) */
export function Notice({
  tone = 'info',
  title,
  children,
  action,
  className,
}: {
  tone?: keyof typeof noticeStyles;
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const { box, icon: Icon } = noticeStyles[tone];
  return (
    <div
      role={tone === 'danger' || tone === 'warning' ? 'alert' : 'status'}
      className={cn('flex gap-3 rounded-xl px-4 py-3 text-sm', box, className)}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && 'mt-0.5', 'opacity-90')}>{children}</div>}
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  );
}

/** Demo uchun maslahat: to'g'ri parol va kod. `onFill` bo'lsa — "To'ldirish" tugmasi */
export function DemoHint({ onFill, children }: { onFill?: () => void; children?: ReactNode }) {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-dashed border-border-strong bg-surface px-4 py-3 text-xs text-text-muted">
      <Sparkles
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0 text-primary-soft-foreground"
      />
      <p className="min-w-0 flex-1 leading-relaxed">
        {children ?? (
          <>
            <span className="font-semibold text-text">Demo:</span> parol{' '}
            <code className="rounded bg-surface-muted px-1 font-mono text-text">
              {DEMO_PASSWORD}
            </code>
            , SMS kod{' '}
            <code className="rounded bg-surface-muted px-1 font-mono text-text">{DEMO_CODE}</code>
          </>
        )}
      </p>
      {onFill && (
        <Button size="sm" variant="soft" className="-my-1 shrink-0" onClick={onFill}>
          To&apos;ldirish
        </Button>
      )}
    </div>
  );
}

/** Formaning pastidagi "Hisobingiz yo'qmi? Ro'yxatdan o'ting" kabi qator */
export function AuthFooterLink({
  text,
  href,
  label,
}: {
  text: string;
  href: string;
  label: string;
}) {
  return (
    <p className="mt-8 text-center text-sm text-text-muted">
      {text}{' '}
      <Link href={href} className="focus-ring rounded-sm font-semibold text-link hover:underline">
        {label}
      </Link>
    </p>
  );
}

/** localStorage o'qilguncha ko'rsatiladigan forma skeleti */
export function FormSkeleton({ fields = 2 }: { fields?: number }) {
  return (
    <div aria-busy="true" aria-label="Yuklanmoqda" className="flex flex-col gap-5">
      <Skeleton className="size-12 rounded-2xl" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
      </div>
      {Array.from({ length: fields }, (_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
      ))}
      <Skeleton className="h-11 w-full rounded-lg" />
    </div>
  );
}

/** Muvaffaqiyat ekrani uchun animatsion belgi (CSS, rasm faylsiz) */
export function SuccessMark() {
  return (
    <div aria-hidden="true" className="relative mx-auto mb-6 grid size-24 place-items-center">
      <span className="absolute inset-0 rounded-full bg-success-soft motion-safe:animate-ping motion-safe:[animation-iteration-count:1]" />
      <span className="absolute inset-2 rounded-full bg-success-soft" />
      <svg viewBox="0 0 52 52" className="relative size-14 text-success">
        <circle cx="26" cy="26" r="24" fill="currentColor" />
        <path
          d="m15 27 7 7 15-16"
          fill="none"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-success-foreground [stroke-dasharray:40] [stroke-dashoffset:0] motion-safe:animate-[auth-check_500ms_ease-out_200ms_backwards]"
        />
      </svg>
      <style>{`@keyframes auth-check{from{stroke-dashoffset:40}to{stroke-dashoffset:0}}`}</style>
    </div>
  );
}
