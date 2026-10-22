'use client';

const STATUSES = ['success', 'warning', 'danger', 'info'] as const;

const SOFT = {
  success: 'bg-success-soft text-success-soft-foreground',
  warning: 'bg-warning-soft text-warning-soft-foreground',
  danger: 'bg-danger-soft text-danger-soft-foreground',
  info: 'bg-info-soft text-info-soft-foreground',
};
const SOLID = {
  success: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
  danger: 'bg-danger text-danger-foreground',
  info: 'bg-info text-info-foreground',
};

export default function ThemingStatus() {
  return (
    <div className="flex flex-col gap-3">
      {[SOFT, SOLID].map((styles, row) => (
        <div key={row} className="flex flex-wrap items-center gap-2">
          <code className="w-12 font-mono text-xs text-text-muted">
            {row === 0 ? 'soft' : 'solid'}
          </code>
          {STATUSES.map((status) => (
            <span
              key={status}
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
            >
              {status}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
