'use client';

const RADII = [
  ['rounded-sm', '6px'],
  ['rounded-md', '8px'],
  ['rounded-lg', '12px'],
  ['rounded-xl', '16px'],
  ['rounded-2xl', '20px'],
  ['rounded-full', '9999px'],
];

const SHADOWS = [
  ['shadow-xs', 'Input, tugma'],
  ['shadow-sm', 'Karta'],
  ['shadow-md', 'Dropdown'],
  ['shadow-lg', 'Popover, toast'],
  ['shadow-xl', 'Modal, drawer'],
];

export default function ThemingRadiusShadow() {
  return (
    <div className="flex w-full flex-col gap-8">
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
        {RADII.map(([className, value]) => (
          <div key={className} className="flex flex-col items-center gap-2 text-xs">
            <div className={`size-14 border-2 border-primary bg-primary-soft ${className}`} />
            <code className="font-mono text-text">{className}</code>
            <span className="text-text-muted">{value}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-5">
        {SHADOWS.map(([className, note]) => (
          <div
            key={className}
            className={`flex h-20 flex-col items-center justify-center rounded-xl bg-surface-raised text-xs ${className}`}
          >
            <code className="font-mono text-text">{className}</code>
            <span className="text-text-muted">{note}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
