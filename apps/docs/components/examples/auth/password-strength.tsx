import { passwordStrength } from '@akhatmirzo/core';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/cn';

const barColors = ['bg-danger', 'bg-danger', 'bg-warning', 'bg-info', 'bg-success'] as const;
const textColors = [
  'text-danger-soft-foreground',
  'text-danger-soft-foreground',
  'text-warning-soft-foreground',
  'text-info-soft-foreground',
  'text-success-soft-foreground',
] as const;

export const passwordRules = [
  { key: 'length', label: 'Kamida 8 ta belgi' },
  { key: 'upper', label: 'Katta harf (A–Z)' },
  { key: 'lower', label: 'Kichik harf (a–z)' },
  { key: 'digit', label: 'Raqam (0–9)' },
  { key: 'symbol', label: 'Maxsus belgi (!@#…)' },
] as const;

/** Parol talablarga javob beradimi: uzunlik + kamida "O'rtacha" (score ≥ 2) */
export function isPasswordAcceptable(password: string) {
  const s = passwordStrength(password);
  return s.checks.length && s.score >= 2;
}

/** 4 bo'lakli kuchlilik chizig'i va talablar ro'yxati (✓ / ✕) */
export function PasswordStrengthMeter({ password, id }: { password: string; id?: string }) {
  const { score, label, checks } = passwordStrength(password);
  const empty = password.length === 0;

  return (
    <div id={id} className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="grid flex-1 grid-cols-4 gap-1.5" aria-hidden="true">
          {[1, 2, 3, 4].map((step) => (
            <span key={step} className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
              <span
                className={cn(
                  'block h-full rounded-full transition-[width,background-color] duration-slow ease-out',
                  !empty && score >= step ? cn('w-full', barColors[score]) : 'w-0',
                )}
              />
            </span>
          ))}
        </div>
        <span
          aria-live="polite"
          className={cn(
            'w-20 text-right text-xs font-semibold',
            empty ? 'text-text-faint' : textColors[score],
          )}
        >
          <span className="sr-only">Parol kuchliligi: </span>
          {empty ? '—' : label}
        </span>
      </div>
      <ul className="grid grid-cols-1 gap-x-4 gap-y-1.5 text-xs sm:grid-cols-2">
        {passwordRules.map((rule) => {
          const ok = checks[rule.key];
          return (
            <li
              key={rule.key}
              className={cn(
                'flex items-center gap-1.5 transition-colors duration-base',
                ok ? 'text-success-soft-foreground' : 'text-text-muted',
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'grid size-4 place-items-center rounded-full transition-colors duration-base',
                  ok ? 'bg-success text-success-foreground' : 'bg-surface-muted',
                )}
              >
                {ok ? <Check className="size-3" strokeWidth={3} /> : <X className="size-2.5" />}
              </span>
              {rule.label}
              <span className="sr-only">{ok ? ' — bajarildi' : ' — bajarilmagan'}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
