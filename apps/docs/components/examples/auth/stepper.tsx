import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Ko'p bosqichli forma ko'rsatkichi: progress chizig'i va bosqich nomlari.
 * Telefonda faqat "2 / 3 · Shaxsiy ma'lumotlar" va chiziq ko'rinadi.
 */
export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  const progress = ((current + 1) / steps.length) * 100;
  return (
    <nav aria-label="Bosqichlar" className="mb-8">
      <div className="mb-3 flex items-baseline justify-between text-xs font-medium sm:hidden">
        <span className="text-text">{steps[current]}</span>
        <span className="text-text-muted tabular-nums">
          {current + 1} / {steps.length}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Jarayon"
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuenow={current + 1}
        aria-valuetext={`${current + 1}-bosqich, jami ${steps.length}: ${steps[current]}`}
        className="h-1.5 overflow-hidden rounded-full bg-surface-muted sm:hidden"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-slow ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <ol className="hidden items-center sm:flex">
        {steps.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={label} className={cn('flex items-center', i < steps.length - 1 && 'flex-1')}>
              <div aria-current={active ? 'step' : undefined} className="flex items-center gap-2">
                <span
                  className={cn(
                    'grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold tabular-nums transition-colors duration-base',
                    done && 'bg-primary text-primary-foreground',
                    active && 'bg-primary-soft text-primary-soft-foreground ring-2 ring-primary',
                    !done && !active && 'bg-surface-muted text-text-muted',
                  )}
                >
                  {done ? <Check aria-hidden="true" className="size-4" /> : i + 1}
                </span>
                <span
                  className={cn(
                    'text-xs font-medium whitespace-nowrap',
                    active ? 'text-text' : 'text-text-muted',
                  )}
                >
                  {label}
                  {done && <span className="sr-only"> (bajarildi)</span>}
                </span>
              </div>
              {i < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="mx-3 h-0.5 flex-1 overflow-hidden rounded-full bg-surface-muted"
                >
                  <span
                    className={cn(
                      'block h-full bg-primary transition-[width] duration-slow ease-out',
                      done ? 'w-full' : 'w-0',
                    )}
                  />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
