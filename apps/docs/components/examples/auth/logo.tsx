/** Soxta brend "Kalit" logotipi (SVG). Server komponent — shuning uchun `cn` (mijoz moduli) yo'q */
export function Logo({ inverted = false, className }: { inverted?: boolean; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2.5 font-bold tracking-tight ${className ?? ''}`}
    >
      <span
        aria-hidden="true"
        className={`grid size-9 place-items-center rounded-xl shadow-sm ${
          inverted ? 'bg-primary-foreground text-primary' : 'bg-primary text-primary-foreground'
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="8" cy="15" r="4" />
          <path d="m10.85 12.15 8.65-8.65M17 6l2.5 2.5M14.5 8.5 16 10" />
        </svg>
      </span>
      <span className="text-lg">Kalit</span>
    </span>
  );
}
