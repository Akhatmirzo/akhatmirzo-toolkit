import type { ReactNode, SVGProps } from 'react';

function Icon({ children, ...props }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function SearchIcon() {
  return (
    <Icon>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Icon>
  );
}

export function FilterIcon() {
  return (
    <Icon>
      <path d="M4 5h16l-6 7.5V19l-4 1v-7.5z" />
    </Icon>
  );
}

export function ColumnsIcon() {
  return (
    <Icon>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16M15 4v16" />
    </Icon>
  );
}

/** ↕ / ↑ / ↓ */
export function SortIcon({ dir }: { dir: false | 'asc' | 'desc' }) {
  if (dir === 'asc')
    return (
      <Icon>
        <path d="M12 19V5M6 11l6-6 6 6" />
      </Icon>
    );
  if (dir === 'desc')
    return (
      <Icon>
        <path d="M12 5v14M6 13l6 6 6-6" />
      </Icon>
    );
  return (
    <Icon>
      <path d="m7 9 5-5 5 5M7 15l5 5 5-5" />
    </Icon>
  );
}

export function ChevronIcon({ dir }: { dir: 'left' | 'right' }) {
  return (
    <Icon>
      <path d={dir === 'left' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} />
    </Icon>
  );
}

export function InboxIcon() {
  return (
    <Icon strokeWidth={1.5}>
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </Icon>
  );
}

export function SearchOffIcon() {
  return (
    <Icon strokeWidth={1.5}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5M8.5 8.5l5 5M13.5 8.5l-5 5" />
    </Icon>
  );
}

export function AlertIcon() {
  return (
    <Icon strokeWidth={1.5}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16h.01" />
    </Icon>
  );
}

export function RefreshIcon() {
  return (
    <Icon>
      <path d="M20 11a8 8 0 1 0-2.3 5.7" />
      <path d="M20 4v7h-7" />
    </Icon>
  );
}
