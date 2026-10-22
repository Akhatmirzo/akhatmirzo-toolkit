'use client';

import { useCopyToClipboard, useResizeObserver } from '@akhatmirzo/hooks';
import { SegmentedControl } from '@akhatmirzo/ui';
import { Check, Copy, Monitor, Smartphone, Tablet } from 'lucide-react';
import {
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/cn';

type Tab = 'preview' | 'code';
type Viewport = 'desktop' | 'tablet' | 'mobile';

const WIDTHS: Record<Viewport, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

export interface BlockFrameLabels {
  preview: string;
  code: string;
  viewport: string;
  desktop: string;
  tablet: string;
  mobile: string;
  cli: string;
  copy: string;
  copied: string;
  resizeHint: string;
}

interface BlockFrameProps {
  title: string;
  command: string;
  height?: number;
  resizable: boolean;
  labels: BlockFrameLabels;
  preview: ReactNode;
  code: ReactNode;
}

/**
 * Blok ramkasi: "Ko'rinish / Kod" tablari, kenglik almashtirgich (iframe'siz — konteyner
 * kengligi o'zgaradi, bloklar `@container` so'rovlari bilan moslashadi), CLI buyrug'i.
 */
export function BlockFrame({
  title,
  command,
  height,
  resizable,
  labels,
  preview,
  code,
}: BlockFrameProps) {
  const [tab, setTab] = useState<Tab>('preview');
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const id = useId();
  const boxRef = useRef<HTMLDivElement>(null);
  const size = useResizeObserver(boxRef, { box: 'border-box' });
  const { copied, copy } = useCopyToClipboard(1500);
  const tabs: Tab[] = ['preview', 'code'];

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const next = tab === 'preview' ? 'code' : 'preview';
    setTab(next);
    document.getElementById(`${id}-${next}-tab`)?.focus();
  };

  const changeViewport = (value: string) => {
    const next = value as Viewport;
    setViewport(next);
    // Qo'lda tortib o'zgartirilgan kenglikni ham bekor qiladi
    if (boxRef.current) boxRef.current.style.width = WIDTHS[next];
  };

  return (
    <div className="not-prose my-6">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div role="tablist" aria-label={title} className="flex gap-1">
          {tabs.map((value) => {
            const selected = tab === value;
            return (
              <button
                key={value}
                id={`${id}-${value}-tab`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`${id}-${value}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setTab(value)}
                onKeyDown={onTabKeyDown}
                className={cn(
                  'focus-ring rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-fast',
                  selected
                    ? 'bg-primary-soft text-primary-soft-foreground'
                    : 'text-text-muted hover:bg-surface-muted hover:text-text',
                )}
              >
                {labels[value]}
              </button>
            );
          })}
        </div>

        {tab === 'preview' && resizable && (
          <div className="hidden items-center gap-3 sm:flex">
            <span
              className="font-mono text-xs text-text-faint tabular-nums"
              title={labels.resizeHint}
            >
              {size ? `${Math.round(size.width)}px` : ''}
            </span>
            <SegmentedControl
              size="sm"
              value={viewport}
              onValueChange={changeViewport}
              aria-label={labels.viewport}
            >
              <SegmentedControl.Item
                value="desktop"
                icon={<Monitor />}
                aria-label={labels.desktop}
                title={labels.desktop}
              />
              <SegmentedControl.Item
                value="tablet"
                icon={<Tablet />}
                aria-label={labels.tablet}
                title={labels.tablet}
              />
              <SegmentedControl.Item
                value="mobile"
                icon={<Smartphone />}
                aria-label={labels.mobile}
                title={labels.mobile}
              />
            </SegmentedControl>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        {/* CLI buyrug'i — brauzer "manzil satri" uslubida */}
        <div className="flex items-center gap-3 border-b border-border bg-surface-muted px-3 py-2">
          <span aria-hidden="true" className="hidden gap-1.5 sm:flex">
            <span className="size-2.5 rounded-full bg-border-strong" />
            <span className="size-2.5 rounded-full bg-border-strong" />
            <span className="size-2.5 rounded-full bg-border-strong" />
          </span>
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-background py-1 pr-1 pl-3 font-mono text-xs">
            <span className="sr-only">{labels.cli}: </span>
            <span aria-hidden="true" className="text-text-faint select-none">
              $
            </span>
            <code className="min-w-0 flex-1 truncate text-text">{command}</code>
            <button
              type="button"
              onClick={() => void copy(command)}
              aria-label={copied ? labels.copied : `${labels.copy}: ${command}`}
              className="focus-ring inline-flex size-7 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors duration-fast hover:bg-surface-muted hover:text-text"
            >
              {copied ? (
                <Check className="size-3.5 text-success" aria-hidden="true" />
              ) : (
                <Copy className="size-3.5" aria-hidden="true" />
              )}
            </button>
            <span aria-live="polite" className="sr-only">
              {copied ? labels.copied : ''}
            </span>
          </div>
        </div>

        <div
          role="tabpanel"
          id={`${id}-preview-panel`}
          aria-labelledby={`${id}-preview-tab`}
          hidden={tab !== 'preview'}
          className={cn(
            'overflow-x-auto bg-background p-2 sm:p-4',
            'bg-[radial-gradient(var(--ak-border)_1px,transparent_1px)] [background-size:16px_16px]',
          )}
        >
          <div
            ref={boxRef}
            data-viewport={viewport}
            style={
              {
                width: WIDTHS[viewport],
                height: height ? `${height}px` : undefined,
                '--block-frame-height': height ? `${height}px` : undefined,
              } as CSSProperties
            }
            className={cn(
              'relative mx-auto max-w-full min-w-[320px] overflow-auto rounded-xl border border-border bg-background font-sans text-text shadow-sm',
              resizable && 'resize-x',
              // To'liq ekranli qoliplar (AppShell) ramka balandligini egallaydi
              height &&
                '[&_[data-slot=app-shell]]:[--ak-app-shell-height:var(--block-frame-height)]',
            )}
          >
            {preview}
          </div>
        </div>

        <div
          role="tabpanel"
          id={`${id}-code-panel`}
          aria-labelledby={`${id}-code-tab`}
          hidden={tab !== 'code'}
          className="[&_figure]:my-0 [&_figure]:rounded-none [&_figure]:border-0 [&_pre]:max-h-[640px]"
        >
          {code}
        </div>
      </div>
    </div>
  );
}
