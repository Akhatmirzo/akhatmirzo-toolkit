'use client';

const SCALE = [
  { className: 'text-4xl font-bold', name: 'text-4xl', spec: '36 / 40' },
  { className: 'text-3xl font-bold', name: 'text-3xl', spec: '30 / 36' },
  { className: 'text-2xl font-semibold', name: 'text-2xl', spec: '24 / 32' },
  { className: 'text-xl font-semibold', name: 'text-xl', spec: '20 / 28' },
  { className: 'text-lg font-medium', name: 'text-lg', spec: '18 / 28' },
  { className: 'text-base', name: 'text-base', spec: '16 / 24' },
  { className: 'text-sm', name: 'text-sm', spec: '14 / 20' },
  { className: 'text-xs font-medium', name: 'text-xs', spec: '12 / 16' },
];

export default function ThemingTypography() {
  return (
    <div className="flex w-full flex-col divide-y divide-border">
      {SCALE.map((item) => (
        <div key={item.name} className="flex items-baseline gap-4 py-2">
          <div className="flex w-24 shrink-0 flex-col">
            <code className="font-mono text-xs text-text">{item.name}</code>
            <span className="text-xs text-text-muted">{item.spec}</span>
          </div>
          <p className={`${item.className} truncate text-text`}>O'zbekiston — Ўзбекистон</p>
        </div>
      ))}
      <p className="pt-3 font-mono text-sm text-text-muted">font-mono: 1 250 000 so'm · +998 90</p>
    </div>
  );
}
