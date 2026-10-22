'use client';

import { useCopyToClipboard } from '@akhatmirzo/hooks';
import { Button } from '@akhatmirzo/ui';
import { Check, Copy } from 'lucide-react';

export default function HooksCopy() {
  const { copied, copy } = useCopyToClipboard();
  const command = 'pnpm add @akhatmirzo/hooks';

  return (
    <div className="flex flex-wrap items-center gap-3">
      <code className="rounded-lg border border-border bg-surface-muted px-3 py-2 font-mono text-sm text-text">
        {command}
      </code>
      <Button
        variant={copied ? 'soft' : 'outline'}
        leftIcon={copied ? <Check /> : <Copy />}
        onClick={() => void copy(command)}
      >
        {copied ? 'Nusxalandi' : 'Nusxa olish'}
      </Button>
    </div>
  );
}
