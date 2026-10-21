'use client';

import { useId, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tab = 'preview' | 'code';

interface PreviewTabsProps {
  labels: { preview: string; code: string };
  align: 'center' | 'start';
  preview: ReactNode;
  code: ReactNode;
}

/** "Ko'rinish / Kod" — ARIA tabs (strelka tugmalari bilan almashadi) */
export function PreviewTabs({ labels, align, preview, code }: PreviewTabsProps) {
  const [tab, setTab] = useState<Tab>('preview');
  const id = useId();
  const tabs: Tab[] = ['preview', 'code'];

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const next = tab === 'preview' ? 'code' : 'preview';
    setTab(next);
    document.getElementById(`${id}-${next}-tab`)?.focus();
  };

  return (
    <div className="not-prose my-6">
      <div role="tablist" aria-label={labels.preview} className="mb-2 flex gap-1">
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
              onKeyDown={onKeyDown}
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

      <div
        role="tabpanel"
        id={`${id}-preview-panel`}
        aria-labelledby={`${id}-preview-tab`}
        hidden={tab !== 'preview'}
        className={cn(
          'flex min-h-48 w-full flex-wrap gap-4 overflow-x-auto rounded-2xl border border-border bg-background p-6 font-sans text-text sm:p-10',
          // Nuqtali fon — demo "kanvas"da turgani sezilsin
          'bg-[radial-gradient(var(--ak-border)_1px,transparent_1px)] [background-size:16px_16px]',
          align === 'center' ? 'items-center justify-center' : 'items-start justify-start',
        )}
      >
        {preview}
      </div>

      <div
        role="tabpanel"
        id={`${id}-code-panel`}
        aria-labelledby={`${id}-code-tab`}
        hidden={tab !== 'code'}
        className="[&_figure]:my-0 [&_pre]:max-h-[480px]"
      >
        {code}
      </div>
    </div>
  );
}
