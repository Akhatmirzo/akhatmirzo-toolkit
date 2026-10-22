'use client';

import { formatDate, passwordStrength, timeAgo } from '@akhatmirzo/core';
import { Button, Field, Input, cn, toast } from '@akhatmirzo/ui';
import { Check, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { DEMO_PASSWORD } from '../data';
import { fakeRequest, useWorkspace } from '../store';
import { SettingsSection, useMounted } from '../ui';

type Fields = { current: string; next: string; repeat: string };
const empty: Fields = { current: '', next: '', repeat: '' };

const meterColor = ['bg-danger', 'bg-danger', 'bg-warning', 'bg-info', 'bg-success'] as const;

export function PasswordSection() {
  const { security, setSecurity } = useWorkspace();
  const [values, setValues] = useState(empty);
  const [submitted, setSubmitted] = useState(false);
  const [wrongCurrent, setWrongCurrent] = useState(false);
  const [saving, setSaving] = useState(false);

  const mounted = useMounted();
  const strength = passwordStrength(values.next);
  const errors: Partial<Fields> = {};
  if (!values.current) errors.current = 'Joriy parolni kiriting';
  else if (wrongCurrent) errors.current = "Joriy parol noto'g'ri";
  if (!values.next) errors.next = 'Yangi parolni kiriting';
  else if (strength.score < 2) errors.next = "Parol juda oddiy — harf, raqam va belgi qo'shing";
  else if (values.next === values.current) errors.next = 'Yangi parol eskisidan farq qilishi kerak';
  if (values.repeat !== values.next) errors.repeat = 'Parollar mos kelmadi';
  const shown = submitted ? errors : wrongCurrent ? { current: errors.current } : {};

  const set = (key: keyof Fields, value: string) => {
    if (key === 'current') setWrongCurrent(false);
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;
    setSaving(true);
    await fakeRequest(900);
    setSaving(false);
    if (values.current !== DEMO_PASSWORD) {
      setWrongCurrent(true);
      toast.error("Parol o'zgartirilmadi", { description: "Joriy parol noto'g'ri." });
      return;
    }
    setSecurity((prev) => ({ ...prev, passwordChangedAt: new Date().toISOString() }));
    setValues(empty);
    setSubmitted(false);
    toast.success("Parol o'zgartirildi", {
      description: 'Boshqa qurilmalarda qayta kirish talab qilinadi.',
    });
  };

  const changedAt = new Date(security.passwordChangedAt);
  const checks = [
    { ok: strength.checks.length, label: 'Kamida 8 belgi' },
    { ok: strength.checks.upper && strength.checks.lower, label: 'Katta va kichik harf' },
    { ok: strength.checks.digit, label: 'Raqam' },
    { ok: strength.checks.symbol, label: 'Maxsus belgi (!@#...)' },
  ];

  return (
    <form noValidate onSubmit={submit}>
      <SettingsSection
        title="Parol"
        description={`Oxirgi marta ${formatDate(changedAt, 'd MMMM yyyy')}${mounted ? ` (${timeAgo(changedAt)})` : ''} o'zgartirilgan.`}
        footer={
          <Button type="submit" variant="primary" loading={saving}>
            Parolni yangilash
          </Button>
        }
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Joriy parol"
            required
            error={shown.current}
            description={`Namunada joriy parol: ${DEMO_PASSWORD}`}
            className="sm:col-span-2"
          >
            <Input
              type="password"
              autoComplete="current-password"
              value={values.current}
              onChange={(e) => set('current', e.target.value)}
            />
          </Field>
          <Field label="Yangi parol" required error={shown.next}>
            <Input
              type="password"
              autoComplete="new-password"
              value={values.next}
              onChange={(e) => set('next', e.target.value)}
            />
          </Field>
          <Field label="Yangi parolni takrorlang" required error={shown.repeat}>
            <Input
              type="password"
              autoComplete="new-password"
              value={values.repeat}
              onChange={(e) => set('repeat', e.target.value)}
            />
          </Field>
        </div>

        <div className="mt-5" aria-live="polite">
          <div className="flex items-center gap-3">
            <div aria-hidden="true" className="grid flex-1 grid-cols-4 gap-1.5">
              {[1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className={cn(
                    'h-1.5 rounded-full transition-colors duration-base',
                    values.next && strength.score >= i
                      ? meterColor[strength.score]
                      : 'bg-surface-muted',
                  )}
                />
              ))}
            </div>
            <span className="w-20 text-right text-xs font-medium text-text-muted">
              {values.next ? strength.label : '—'}
            </span>
          </div>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            {checks.map((c) => (
              <li
                key={c.label}
                className={cn(
                  'flex items-center gap-1.5',
                  c.ok ? 'text-success-soft-foreground' : 'text-text-muted',
                )}
              >
                {c.ok ? (
                  <Check aria-hidden="true" className="size-3.5" />
                ) : (
                  <X aria-hidden="true" className="size-3.5" />
                )}
                {c.label}
                <span className="sr-only">{c.ok ? ' — bajarildi' : ' — bajarilmagan'}</span>
              </li>
            ))}
          </ul>
        </div>
      </SettingsSection>
    </form>
  );
}
