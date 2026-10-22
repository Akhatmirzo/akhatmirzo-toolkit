'use client';

import { parsePhone, passwordStrength, type PasswordScore } from '@akhatmirzo/core';
import {
  Button,
  Card,
  Checkbox,
  Field,
  Input,
  PhoneInput,
  Progress,
  toast,
  type ProgressColor,
} from '@akhatmirzo/ui';
import { Check, Store, UserPlus, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';

interface Errors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  password?: string;
  terms?: string;
}

const SCORE_COLOR: Record<PasswordScore, ProgressColor> = {
  0: 'danger',
  1: 'danger',
  2: 'warning',
  3: 'success',
  4: 'success',
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function RegisterBlock() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [terms, setTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = passwordStrength(password);
  const rules = [
    { ok: strength.checks.length, text: 'Kamida 8 ta belgi' },
    { ok: strength.checks.upper && strength.checks.lower, text: 'Katta va kichik harf' },
    { ok: strength.checks.digit, text: 'Kamida bitta raqam' },
    { ok: strength.checks.symbol, text: 'Maxsus belgi (!, ?, #)' },
  ];

  const validate = (): Errors => {
    const next: Errors = {};
    if (!firstName.trim()) next.firstName = 'Ismingizni kiriting';
    if (!lastName.trim()) next.lastName = 'Familiyangizni kiriting';
    const parsed = parsePhone(phone);
    if (!phone) next.phone = 'Telefon raqamini kiriting';
    else if (!parsed.valid) next.phone = "Raqam to'liq yoki to'g'ri emas";
    if (strength.score < 2) next.password = 'Parol juda oddiy — yuqoridagi shartlarni bajaring';
    if (!terms) next.terms = 'Davom etish uchun shartlarga rozilik bering';
    return next;
  };

  // Birinchi yuborishdan keyin xatolar yozish paytida yangilanadi
  const errors = submitted ? validate() : {};

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (Object.keys(validate()).length > 0) return;
    setLoading(true);
    await wait(1000); // Haqiqiy ilovada — API so'rovi
    setLoading(false);
    toast.success('Hisob yaratildi', {
      description: `+998 ${phone.slice(0, 2)} *** ** ${phone.slice(-2)} raqamiga SMS kod yuborildi`,
    });
  };

  return (
    <div className="@container w-full bg-surface-muted font-sans text-text">
      <div className="flex min-h-[720px] flex-col items-center justify-center gap-6 px-4 py-10">
        <div className="flex items-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Store className="size-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-bold">Chorsu Market</span>
        </div>

        <Card className="w-full max-w-md @md:p-8">
          <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5 text-center">
              <h2 className="m-0 text-2xl font-bold tracking-tight">Hisob yaratish</h2>
              <p className="m-0 text-sm text-text-muted">
                Bir daqiqada ro&apos;yxatdan o&apos;ting — 14 kun bepul
              </p>
            </div>

            <div className="grid gap-4 @md:grid-cols-2">
              <Field label="Ism" error={errors.firstName} required>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Dilnoza"
                  autoComplete="given-name"
                />
              </Field>
              <Field label="Familiya" error={errors.lastName} required>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Yusupova"
                  autoComplete="family-name"
                />
              </Field>
            </div>

            <Field
              label="Telefon raqami"
              description="Tasdiqlash kodi SMS orqali keladi"
              error={errors.phone}
              required
            >
              <PhoneInput value={phone} onValueChange={setPhone} autoComplete="tel" />
            </Field>

            <Field label="Parol" error={errors.password} required>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </Field>

            {/* Parol kuchi: chiziq + shartlar ro'yxati */}
            <div className="-mt-2 flex flex-col gap-2">
              <Progress
                size="sm"
                value={password ? strength.score + 1 : 0}
                max={5}
                color={SCORE_COLOR[strength.score]}
                label={
                  <span className="text-xs text-text-muted">
                    Parol kuchi:{' '}
                    <span className="font-medium text-text">{password ? strength.label : '—'}</span>
                  </span>
                }
              />
              <ul className="m-0 grid list-none gap-1 p-0 @md:grid-cols-2">
                {rules.map((rule) => (
                  <li
                    key={rule.text}
                    className={
                      rule.ok
                        ? 'flex items-center gap-1.5 text-xs text-success'
                        : 'flex items-center gap-1.5 text-xs text-text-muted'
                    }
                  >
                    {rule.ok ? (
                      <Check className="size-3.5 shrink-0" aria-hidden="true" />
                    ) : (
                      <X className="size-3.5 shrink-0" aria-hidden="true" />
                    )}
                    {rule.text}
                    <span className="sr-only">{rule.ok ? ' — bajarildi' : ' — bajarilmagan'}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Field error={errors.terms}>
              <Checkbox
                checked={terms}
                onCheckedChange={setTerms}
                invalid={Boolean(errors.terms)}
                label={
                  <>
                    <a href="#terms" className="font-medium text-link hover:underline">
                      Foydalanish shartlari
                    </a>{' '}
                    va{' '}
                    <a href="#privacy" className="font-medium text-link hover:underline">
                      maxfiylik siyosati
                    </a>
                    ga roziman
                  </>
                }
              />
            </Field>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              leftIcon={<UserPlus />}
            >
              Ro&apos;yxatdan o&apos;tish
            </Button>

            <p className="m-0 text-center text-sm text-text-muted">
              Hisobingiz bormi?{' '}
              <a href="#login" className="font-medium text-link hover:underline">
                Kirish
              </a>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
