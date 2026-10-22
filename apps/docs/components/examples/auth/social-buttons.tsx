'use client';

import { Button, toast } from '@akhatmirzo/ui';
import { useState, type ReactNode } from 'react';
import { wait } from './data';

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.35 11.1H12v2.98h5.35c-.23 1.4-1.66 4.1-5.35 4.1-3.22 0-5.85-2.67-5.85-5.96S8.78 6.26 12 6.26c1.83 0 3.06.78 3.76 1.45l2.57-2.47C16.68 3.7 14.55 2.75 12 2.75 6.89 2.75 2.75 6.89 2.75 12s4.14 9.25 9.25 9.25c5.34 0 8.88-3.75 8.88-9.04 0-.6-.07-1.06-.15-1.51Z" />
    </svg>
  );
}

function TelegramMark() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.94 4.3 18.9 19.04c-.23 1.03-.84 1.29-1.7.8l-4.7-3.47-2.27 2.18c-.25.25-.46.46-.94.46l.34-4.8 8.73-7.9c.38-.34-.08-.53-.59-.19L6.97 12.9 2.32 11.45c-1.01-.32-1.03-1.01.21-1.5L20.7 2.95c.84-.31 1.58.2 1.24 1.35Z" />
    </svg>
  );
}

function OneIdMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M8 10v4M12 10v4h1.5a2 2 0 0 0 0-4H12" />
    </svg>
  );
}

const providers: { id: string; name: string; icon: ReactNode }[] = [
  { id: 'google', name: 'Google', icon: <GoogleMark /> },
  { id: 'telegram', name: 'Telegram', icon: <TelegramMark /> },
  { id: 'oneid', name: 'OneID', icon: <OneIdMark /> },
];

/** Ijtimoiy tarmoqlar orqali kirish — demo'da faqat yuklanish va xabar ko'rsatadi */
export function SocialButtons({ action = 'kirish' }: { action?: string }) {
  const [pending, setPending] = useState<string | null>(null);

  const start = async (name: string, id: string) => {
    setPending(id);
    await wait(1200);
    setPending(null);
    toast.info(`${name} orqali ${action}`, {
      description:
        "Demo rejimida tashqi xizmatlar ulanmagan. Telefon raqam yoki email'dan foydalaning.",
    });
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      {providers.map((p) => (
        <Button
          key={p.id}
          type="button"
          variant="outline"
          size="lg"
          leftIcon={p.icon}
          loading={pending === p.id}
          disabled={pending !== null && pending !== p.id}
          aria-label={`${p.name} orqali ${action}`}
          onClick={() => void start(p.name, p.id)}
          className="px-2 text-xs sm:text-sm"
        >
          {p.name}
        </Button>
      ))}
    </div>
  );
}
