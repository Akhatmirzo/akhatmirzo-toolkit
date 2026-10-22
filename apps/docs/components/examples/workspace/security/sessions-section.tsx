'use client';

import { Badge, Button, confirm, toast } from '@akhatmirzo/ui';
import { LogOut, Monitor, Smartphone, Tablet } from 'lucide-react';
import type { ReactNode } from 'react';
import type { DeviceKind, Session } from '../data';
import { fakeRequest, useWorkspace } from '../store';
import { SettingsSection } from '../ui';

const deviceIcon: Record<DeviceKind, ReactNode> = {
  desktop: <Monitor />,
  mobile: <Smartphone />,
  tablet: <Tablet />,
};

/** "Hozir faol", "47 daqiqa oldin", "4 kun oldin" */
function lastActive(minutes: number) {
  if (minutes < 1) return 'Hozir faol';
  if (minutes < 60) return `${minutes} daqiqa oldin`;
  if (minutes < 60 * 24) return `${Math.floor(minutes / 60)} soat oldin`;
  const days = Math.floor(minutes / (60 * 24));
  return days === 1 ? 'Kecha' : `${days} kun oldin`;
}

export function SessionsSection() {
  const { security, setSecurity } = useWorkspace();
  const others = security.sessions.filter((s) => !s.current);

  const signOut = async (session: Session) => {
    const ok = await confirm({
      title: 'Qurilmadan chiqasizmi?',
      description: `${session.device} (${session.location}) qayta kirish uchun parol so'raydi.`,
      confirmText: 'Chiqish',
      variant: 'danger',
      onConfirm: () => fakeRequest(600),
    });
    if (!ok) return;
    setSecurity((prev) => ({
      ...prev,
      sessions: prev.sessions.filter((s) => s.id !== session.id),
    }));
    toast.success('Sessiya yakunlandi', { description: session.device });
  };

  const signOutOthers = async () => {
    const ok = await confirm({
      title: 'Boshqa barcha qurilmalardan chiqasizmi?',
      description: `${others.length} ta sessiya yakunlanadi. Shu qurilmada qolasiz.`,
      confirmText: 'Hammasidan chiqish',
      variant: 'danger',
      onConfirm: () => fakeRequest(800),
    });
    if (!ok) return;
    setSecurity((prev) => ({ ...prev, sessions: prev.sessions.filter((s) => s.current) }));
    toast.success(`${others.length} ta sessiya yakunlandi`);
  };

  return (
    <SettingsSection
      title="Faol sessiyalar"
      description="Hisobingizga kirilgan qurilmalar. Tanimagan qurilmani ko'rsangiz — darhol chiqing va parolni o'zgartiring."
      footer={
        <Button
          variant="outline"
          leftIcon={<LogOut aria-hidden="true" />}
          disabled={others.length === 0}
          onClick={signOutOthers}
        >
          Boshqa qurilmalardan chiqish
        </Button>
      }
    >
      <ul className="-my-3 divide-y divide-border">
        {security.sessions.map((s) => (
          <li key={s.id} className="flex items-center gap-4 py-3">
            <span
              aria-hidden="true"
              className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface-muted text-text-subtle [&_svg]:size-5"
            >
              {deviceIcon[s.kind]}
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                {s.device}
                {s.current && (
                  <Badge size="sm" color="success" dot>
                    Shu qurilma
                  </Badge>
                )}
              </p>
              <p className="truncate text-xs text-text-muted">
                {s.location} · {s.ip} · {lastActive(s.minutesAgo)}
              </p>
            </div>
            {!s.current && (
              <Button variant="ghost" size="sm" onClick={() => signOut(s)}>
                Chiqish
              </Button>
            )}
          </li>
        ))}
      </ul>
      {others.length === 0 && (
        <p className="mt-4 rounded-lg bg-surface-muted px-3 py-2 text-sm text-text-muted">
          Boshqa faol sessiyalar yo&apos;q — faqat shu qurilmada kirgansiz.
        </p>
      )}
    </SettingsSection>
  );
}
