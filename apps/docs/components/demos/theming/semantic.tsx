'use client';

import { useSyncExternalStore } from 'react';

const TOKENS = [
  ['background', 'Sahifa foni'],
  ['surface', 'Karta, input, modal'],
  ['surface-muted', 'Hover, ikkilamchi fon'],
  ['surface-raised', 'Popover, toast'],
  ['border', 'Oddiy chegara'],
  ['border-strong', 'Hover chegara'],
  ['text', 'Asosiy matn'],
  ['text-subtle', 'Ghost tugma, ikonka'],
  ['text-muted', 'Yordamchi matn'],
  ['text-faint', 'Placeholder'],
  ['primary', 'Asosiy tugma'],
  ['primary-soft', 'Soft tugma, badge'],
  ['primary-soft-foreground', 'Soft ustidagi matn'],
  ['link', 'Havola'],
  ['danger', 'Xavfli tugma'],
  ['ring', 'Fokus halqasi'],
] as const;

// Mavzu almashganda (<html data-theme>) qiymatlar qayta o'qiladi
const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
};
const readValues = () => {
  const style = getComputedStyle(document.documentElement);
  return TOKENS.map(([token]) => style.getPropertyValue(`--ak-${token}`).trim()).join('|');
};

export default function ThemingSemantic() {
  const values = useSyncExternalStore(subscribe, readValues, () => '').split('|');

  return (
    <div className="grid w-full gap-3 sm:grid-cols-2">
      {TOKENS.map(([token, note], i) => (
        <div key={token} className="flex items-center gap-3">
          <div
            className="size-10 shrink-0 rounded-lg border border-border"
            style={{ background: `var(--ak-${token})` }}
          />
          <div className="flex min-w-0 flex-col text-xs">
            <span className="truncate font-mono font-medium text-text">{token}</span>
            <span className="truncate text-text-muted">{note}</span>
            <span className="truncate font-mono text-text-faint">{values[i] || '—'}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
