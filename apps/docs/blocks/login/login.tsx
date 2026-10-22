'use client';

import { isValidEmail, parsePhone } from '@akhatmirzo/core';
import {
  Alert,
  Button,
  Checkbox,
  Divider,
  Field,
  Input,
  PhoneInput,
  SegmentedControl,
  toast,
} from '@akhatmirzo/ui';
import { LogIn, Mail, Phone, ShieldCheck, Store } from 'lucide-react';
import { useState, type FormEvent } from 'react';

type Method = 'phone' | 'email';

interface Errors {
  login?: string;
  password?: string;
}

/** Google belgisi (bir rangli — tugma matni rangini oladi) */
function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M21.35 11.1H12v2.98h5.35c-.23 1.43-1.66 4.2-5.35 4.2-3.22 0-5.85-2.67-5.85-5.96S8.78 6.36 12 6.36c1.83 0 3.06.78 3.76 1.45l2.57-2.47C16.68 3.8 14.55 2.86 12 2.86 6.98 2.86 2.92 6.92 2.92 12S6.98 21.14 12 21.14c5.27 0 8.77-3.7 8.77-8.92 0-.6-.07-1.06-.15-1.52Z" />
    </svg>
  );
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function LoginBlock() {
  const [method, setMethod] = useState<Method>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = (): Errors => {
    const next: Errors = {};
    if (method === 'phone') {
      const parsed = parsePhone(phone);
      if (!phone) next.login = 'Telefon raqamini kiriting';
      else if (parsed.digits.length < 9) next.login = "Raqamni to'liq kiriting";
      else if (!parsed.valid) next.login = "Operator kodi noto'g'ri";
    } else if (!email.trim()) next.login = 'Email manzilini kiriting';
    else if (!isValidEmail(email.trim())) next.login = "Email noto'g'ri, masalan: ism@misol.uz";
    if (!password) next.password = 'Parolni kiriting';
    return next;
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    setServerError('');
    if (found.login || found.password) return;

    setLoading(true);
    // Haqiqiy ilovada — API so'rovi. Bu yerda: 8 belgidan qisqa parol "noto'g'ri" hisoblanadi
    await wait(900);
    setLoading(false);
    if (password.length < 8) {
      setServerError("Login yoki parol noto'g'ri. Qayta urinib ko'ring yoki parolni tiklang.");
      setPassword('');
      return;
    }
    toast.success('Xush kelibsiz!', { description: 'Hisobingizga muvaffaqiyatli kirdingiz.' });
  };

  return (
    <div className="@container w-full bg-background font-sans text-text">
      <div className="grid min-h-[640px] @3xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        {/* Brend paneli — faqat keng ekranda */}
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground @3xl:flex">
          <span
            aria-hidden="true"
            className="absolute -top-24 -right-24 size-72 rounded-full bg-primary-foreground/10"
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-32 -left-16 size-80 rounded-full bg-primary-foreground/5"
          />
          <div className="relative flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-xl bg-primary-foreground/15">
              <Store className="size-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold">Chorsu Market</span>
          </div>
          <div className="relative flex flex-col gap-4">
            <p className="m-0 text-3xl leading-tight font-bold">
              Do&apos;koningizni bitta oynadan boshqaring
            </p>
            <p className="m-0 max-w-sm text-primary-foreground/80">
              Buyurtmalar, ombor va to&apos;lovlar — Toshkentdan Nukusgacha 12 000 dan ortiq
              sotuvchi ishonadi.
            </p>
          </div>
          <div className="relative flex items-center gap-2 text-sm text-primary-foreground/80">
            <ShieldCheck className="size-4" aria-hidden="true" />
            Ma&apos;lumotlaringiz shifrlangan holda saqlanadi
          </div>
        </aside>

        <div className="flex items-center justify-center px-4 py-10 @md:px-8">
          <form noValidate onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <h2 className="m-0 text-2xl font-bold tracking-tight">Hisobga kirish</h2>
              <p className="m-0 text-sm text-text-muted">
                Hisobingiz yo&apos;qmi?{' '}
                <a href="#register" className="font-medium text-link hover:underline">
                  Ro&apos;yxatdan o&apos;ting
                </a>
              </p>
            </div>

            <SegmentedControl
              fullWidth
              value={method}
              onValueChange={(value) => {
                setMethod(value as Method);
                setErrors({});
              }}
              aria-label="Kirish usuli"
            >
              <SegmentedControl.Item value="phone" icon={<Phone />}>
                Telefon
              </SegmentedControl.Item>
              <SegmentedControl.Item value="email" icon={<Mail />}>
                Email
              </SegmentedControl.Item>
            </SegmentedControl>

            {serverError && (
              <Alert color="danger" title="Kirib bo'lmadi">
                {serverError}
              </Alert>
            )}

            {method === 'phone' ? (
              <Field label="Telefon raqami" error={errors.login} required>
                <PhoneInput value={phone} onValueChange={setPhone} autoComplete="tel" />
              </Field>
            ) : (
              <Field label="Email" error={errors.login} required>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ism@misol.uz"
                  autoComplete="email"
                />
              </Field>
            )}

            <Field label="Parol" error={errors.password} required>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </Field>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <Checkbox
                label="Esda qolsin"
                checked={remember}
                onCheckedChange={setRemember}
                size="sm"
              />
              <a href="#forgot" className="text-sm font-medium text-link hover:underline">
                Parolni unutdingizmi?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              leftIcon={<LogIn />}
            >
              Kirish
            </Button>

            <Divider label="yoki" />

            <Button
              type="button"
              variant="outline"
              fullWidth
              leftIcon={<GoogleMark />}
              onClick={() =>
                toast('Google orqali kirish', { description: 'OAuth oynasi ochiladi' })
              }
            >
              Google bilan kirish
            </Button>

            <p className="m-0 text-center text-xs text-text-muted">
              Kirish orqali siz{' '}
              <a href="#terms" className="underline underline-offset-2 hover:text-text">
                foydalanish shartlari
              </a>
              ga rozilik bildirasiz.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
