'use client';

import { isValidEmail, parsePhone } from '@akhatmirzo/core';
import { useLocalStorage } from '@akhatmirzo/hooks';
import { Button, Checkbox, Divider, Field, Input, PhoneInput, Tabs, toast } from '@akhatmirzo/ui';
import { Lock, LogIn, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState, useSyncExternalStore, type FormEvent, type ReactNode } from 'react';
import { DEMO_PASSWORD, LOCK_SECONDS, MAX_ATTEMPTS, demoAccount, storageKeys, wait } from './data';
import { SocialButtons } from './social-buttons';
import { useAccounts, useAuthHref, useHydrated, useLock, usePendingSignIn } from './store';
import { AuthFooterLink, AuthHeader, DemoHint, FormSkeleton, Notice } from './ui';

type Method = 'phone' | 'email';

interface Remembered {
  method: Method;
  login: string;
}

interface Errors {
  login?: ReactNode;
  password?: string;
}

// Soniyalik soat: faqat kerak bo'lganda (bloklash paytida) obuna bo'linadi
const subscribeClock = (onTick: () => void) => {
  const t = setInterval(onTick, 1000);
  return () => clearInterval(t);
};
const noopSubscribe = () => () => {};

/** Bloklash tugashiga qolgan soniyalar (har soniyada yangilanadi) */
function useSecondsLeft(until: number | null) {
  const nowSec = useSyncExternalStore(
    until ? subscribeClock : noopSubscribe,
    () => Math.floor(Date.now() / 1000),
    () => 0,
  );
  return until ? Math.max(0, Math.ceil(until / 1000) - nowSec) : 0;
}

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export function SignIn() {
  // localStorage faqat mijozda — undan oldin skelet
  return useHydrated() ? <SignInForm /> : <FormSkeleton fields={3} />;
}

function SignInForm() {
  const router = useRouter();
  const href = useAuthHref();
  const { findAccount } = useAccounts();
  const [lock, setLock] = useLock();
  const [, setPending] = usePendingSignIn();
  const [remembered, setRemembered, forget] = useLocalStorage<Remembered | null>(
    storageKeys.remembered,
    null,
  );

  const [method, setMethod] = useState<Method>(remembered?.method ?? 'phone');
  const [phone, setPhone] = useState(remembered?.method === 'phone' ? remembered.login : '');
  const [email, setEmail] = useState(remembered?.method === 'email' ? remembered.login : '');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(Boolean(remembered));
  // "Server" xatolari (hisob topilmadi, parol noto'g'ri) — maydon o'zgarganda tozalanadi
  const [serverErrors, setServerErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const loginRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const secondsLeft = useSecondsLeft(lock.until);
  const locked = secondsLeft > 0;

  const validate = (): Errors => {
    const next: Errors = {};
    if (method === 'phone') {
      const parsed = parsePhone(phone);
      if (!phone) next.login = 'Telefon raqamini kiriting';
      else if (parsed.digits.length < 9) next.login = "Raqamni to'liq kiriting";
      else if (!parsed.valid) next.login = "Operator kodi noto'g'ri";
    } else if (!email.trim()) next.login = 'Email manzilini kiriting';
    else if (!isValidEmail(email.trim()))
      next.login = "Email manzili noto'g'ri, masalan: ism@misol.uz";
    if (!password) next.password = 'Parolni kiriting';
    return next;
  };

  // Birinchi yuborishdan keyin xatolar yozish paytida yangilanadi
  const fieldErrors = submitted ? validate() : {};
  const errors: Errors = {
    login: fieldErrors.login ?? serverErrors.login,
    password: fieldErrors.password ?? serverErrors.password,
  };

  const fillDemo = () => {
    setMethod('phone');
    setPhone(demoAccount.phone);
    setPassword(DEMO_PASSWORD);
    setServerErrors({});
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (locked || loading) return;
    setSubmitted(true);
    const found = validate();
    setServerErrors({});
    if (found.login) return loginRef.current?.focus();
    if (found.password) return passwordRef.current?.focus();

    setLoading(true);
    await wait(1000);
    const login = method === 'phone' ? phone : email;
    const account = findAccount(login);

    if (!account) {
      setLoading(false);
      setSubmitted(false);
      setServerErrors({
        login: (
          <>
            {method === 'phone' ? 'Bu raqam' : 'Bu email'} bilan hisob topilmadi.{' '}
            <Link href={href('sign-up')} className="font-semibold underline underline-offset-2">
              Ro&apos;yxatdan o&apos;ting
            </Link>
          </>
        ),
      });
      loginRef.current?.focus();
      return;
    }

    if (account.password !== password) {
      setLoading(false);
      setSubmitted(false);
      const failed = lock.failed + 1;
      setPassword('');
      if (failed >= MAX_ATTEMPTS) {
        setLock({ failed: 0, until: Date.now() + LOCK_SECONDS * 1000 });
        toast.error('Hisob vaqtincha bloklandi', {
          description: `${MAX_ATTEMPTS} marta noto'g'ri parol kiritildi.`,
        });
        return;
      }
      setLock({ failed, until: null });
      setServerErrors({
        password: `Parol noto'g'ri. Yana ${MAX_ATTEMPTS - failed} ta urinish qoldi.`,
      });
      passwordRef.current?.focus();
      return;
    }

    setLock({ failed: 0, until: null });
    if (remember)
      setRemembered({ method, login: method === 'phone' ? account.phone : account.email });
    else forget();
    setPending({
      phone: account.phone,
      firstName: account.firstName,
      lastName: account.lastName,
      remember,
    });
    router.push(href('verify'));
  };

  return (
    <>
      <AuthHeader
        title="Xush kelibsiz!"
        description="Davom etish uchun hisobingizga kiring. Kirish SMS kod bilan tasdiqlanadi."
      />
      <DemoHint onFill={fillDemo}>
        <span className="font-semibold text-text">Demo hisob:</span> +998 90 123 45 67 yoki{' '}
        {demoAccount.email}, parol{' '}
        <code className="rounded bg-surface-muted px-1 font-mono text-text">{DEMO_PASSWORD}</code>
      </DemoHint>

      {locked && (
        <Notice tone="danger" title="Hisob vaqtincha bloklandi" className="mb-6">
          Juda ko&apos;p noto&apos;g&apos;ri urinish. Qayta urinib ko&apos;rish mumkin:{' '}
          <span className="font-semibold tabular-nums">{clock(secondsLeft)}</span>.{' '}
          <Link
            href={href('forgot-password')}
            className="font-semibold underline underline-offset-2"
          >
            Parolni tiklash
          </Link>
        </Notice>
      )}

      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
        <Tabs
          value={method}
          onValueChange={(v) => {
            setMethod(v as Method);
            setServerErrors({});
            setSubmitted(false);
          }}
          variant="segmented"
        >
          <Tabs.List aria-label="Kirish usuli" className="grid w-full grid-cols-2">
            <Tabs.Trigger value="phone">Telefon raqam</Tabs.Trigger>
            <Tabs.Trigger value="email">Email</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="phone" className="pt-5">
            <Field label="Telefon raqam" error={errors.login}>
              <PhoneInput
                ref={loginRef}
                size="lg"
                name="phone"
                autoComplete="tel-national"
                value={phone}
                onValueChange={(v) => {
                  setPhone(v);
                  setServerErrors({});
                }}
                disabled={locked}
              />
            </Field>
          </Tabs.Content>
          <Tabs.Content value="email" className="pt-5">
            <Field label="Email" error={errors.login}>
              <Input
                ref={loginRef}
                size="lg"
                type="email"
                name="email"
                inputMode="email"
                autoComplete="username"
                placeholder="ism@misol.uz"
                leftIcon={<Mail />}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setServerErrors({});
                }}
                disabled={locked}
              />
            </Field>
          </Tabs.Content>
        </Tabs>

        <div className="relative">
          <Field label="Parol" error={errors.password}>
            <Input
              ref={passwordRef}
              size="lg"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Parolingiz"
              leftIcon={<Lock />}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setServerErrors((prev) => ({ login: prev.login }));
              }}
              disabled={locked}
            />
          </Field>
          <Link
            href={href('forgot-password')}
            className="focus-ring absolute top-0 right-0 rounded-sm text-sm font-medium text-link hover:underline"
          >
            Parolni unutdingizmi?
          </Link>
        </div>

        <Checkbox
          label="Meni eslab qol"
          description="Keyingi safar raqamingiz avtomatik to'ldiriladi"
          checked={remember}
          onCheckedChange={setRemember}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          disabled={locked}
          rightIcon={<LogIn />}
          labels={{ loading: 'Kirilmoqda' }}
        >
          {locked ? `Kuting · ${clock(secondsLeft)}` : 'Kirish'}
        </Button>
      </form>

      <Divider label="yoki" className="my-7" />
      <SocialButtons />

      <AuthFooterLink text="Hisobingiz yo'qmi?" href={href('sign-up')} label="Ro'yxatdan o'ting" />
    </>
  );
}
