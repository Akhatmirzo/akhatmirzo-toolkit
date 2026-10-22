'use client';

import { formatPhone, timeAgo } from '@akhatmirzo/core';
import { Avatar, Badge, Button, toast } from '@akhatmirzo/ui';
import { ArrowRight, LogOut, MonitorSmartphone, SearchX, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { wait } from './data';
import { OtpStep } from './otp-step';
import { useAuthHref, useHydrated, usePendingSignIn, type PendingSignIn } from './store';
import { AuthHeader, FormSkeleton, SuccessMark } from './ui';

export function VerifyFlow() {
  const hydrated = useHydrated();
  const router = useRouter();
  const href = useAuthHref();
  const [pending, setPending, clearPending] = usePendingSignIn();

  if (!hydrated) return <FormSkeleton fields={1} />;

  // Kirish sahifasini chetlab o'tib to'g'ridan-to'g'ri kelingan
  if (!pending) {
    return (
      <div className="text-center">
        <span
          aria-hidden="true"
          className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-surface-muted text-text-muted"
        >
          <SearchX className="size-7" />
        </span>
        <h1 className="text-2xl font-bold tracking-tight">Tasdiqlash sessiyasi topilmadi</h1>
        <p className="mt-2 text-sm text-text-muted">
          SMS kod faqat telefon raqam va parol tekshirilgandan keyin yuboriladi. Avval hisobingizga
          kiring.
        </p>
        <Button asChild variant="primary" size="lg" fullWidth className="mt-7">
          <Link href={href('sign-in')}>Kirish sahifasiga</Link>
        </Button>
      </div>
    );
  }

  if (pending.verifiedAt) {
    return (
      <Welcome
        user={pending}
        onSignOut={() => {
          clearPending();
          toast.success('Hisobdan chiqdingiz');
          router.push(href('sign-in'));
        }}
      />
    );
  }

  return (
    <OtpStep
      phone={pending.phone}
      title="Kirishni tasdiqlang"
      onChangeNumber={() => {
        clearPending();
        router.push(href('sign-in'));
      }}
      onVerified={async () => {
        await wait(300);
        setPending({ ...pending, verifiedAt: new Date().toISOString() });
        toast.success('Kirish tasdiqlandi');
      }}
    />
  );
}

function Welcome({ user, onSignOut }: { user: PendingSignIn; onSignOut: () => void }) {
  const fullName = `${user.firstName} ${user.lastName}`;
  const lang = String(useParams().lang ?? 'uz');
  return (
    <div className="text-center">
      <SuccessMark />
      <AuthHeader
        focusOnMount
        title={`Xush kelibsiz, ${user.firstName}!`}
        description="Kirish muvaffaqiyatli tasdiqlandi. Hisobingiz xavfsiz — har bir kirish haqida SMS orqali xabar beramiz."
      />

      <div className="rounded-2xl border border-border bg-surface p-5 text-left shadow-sm">
        <div className="flex items-center gap-3">
          <Avatar name={fullName} size="lg" status="online" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{fullName}</p>
            <p className="text-sm text-text-muted tabular-nums">{formatPhone(user.phone)}</p>
          </div>
          <Badge color="success" variant="soft" dot>
            Faol
          </Badge>
        </div>
        <dl className="mt-5 grid grid-cols-1 gap-3 border-t border-border pt-4 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-2.5">
            <MonitorSmartphone aria-hidden="true" className="size-4 shrink-0 text-text-muted" />
            <div>
              <dt className="text-xs text-text-muted">Qurilma</dt>
              <dd className="font-medium">
                {user.remember ? 'Ishonchli qurilma' : 'Bir martalik sessiya'}
              </dd>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck aria-hidden="true" className="size-4 shrink-0 text-text-muted" />
            <div>
              <dt className="text-xs text-text-muted">Oxirgi kirish</dt>
              <dd className="font-medium">{user.verifiedAt ? timeAgo(user.verifiedAt) : '—'}</dd>
            </div>
          </div>
        </dl>
      </div>

      <div className="mt-7 flex flex-col gap-3">
        {/* Kabinet sifatida "Xodimlar va sozlamalar" namunasiga o'tamiz */}
        <Button asChild variant="primary" size="lg" fullWidth rightIcon={<ArrowRight />}>
          <Link href={`/${lang}/examples/workspace`}>Shaxsiy kabinetga o&apos;tish</Link>
        </Button>
        <Button variant="ghost" size="lg" fullWidth leftIcon={<LogOut />} onClick={onSignOut}>
          Chiqish
        </Button>
      </div>
    </div>
  );
}
