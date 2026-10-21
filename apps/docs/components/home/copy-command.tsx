'use client';

import { useCopyToClipboard } from '@akhatmirzo/hooks';
import { Check, Copy } from 'lucide-react';

/** npm o'rnatish buyrug'i — nusxalash tugmasi bilan */
export function CopyCommand({
  command,
  labels,
}: {
  command: string;
  labels: { copy: string; copied: string };
}) {
  const { copied, copy } = useCopyToClipboard(1500);

  return (
    <div className="flex w-full max-w-xl items-center gap-2 rounded-xl border border-border bg-surface py-1.5 pr-1.5 pl-4 font-mono text-sm shadow-xs">
      <span aria-hidden="true" className="text-text-faint select-none">
        $
      </span>
      <code className="min-w-0 flex-1 truncate text-left text-text">{command}</code>
      <button
        type="button"
        onClick={() => void copy(command)}
        aria-label={copied ? labels.copied : labels.copy}
        className="focus-ring inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors duration-fast hover:bg-surface-muted hover:text-text"
      >
        {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? labels.copied : ''}
      </span>
    </div>
  );
}
