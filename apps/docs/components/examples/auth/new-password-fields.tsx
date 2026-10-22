'use client';

import { Field, Input } from '@akhatmirzo/ui';
import { CircleCheck, KeyRound, Lock } from 'lucide-react';
import { useId, type Ref } from 'react';
import { PasswordStrengthMeter, isPasswordAcceptable } from './password-strength';

export interface NewPasswordErrors {
  password?: string;
  confirm?: string;
}

/** Yangi parol va uning takrorini tekshiradi */
export function validateNewPassword(password: string, confirm: string): NewPasswordErrors {
  const errors: NewPasswordErrors = {};
  if (!password) errors.password = "Parol o'ylab toping";
  else if (!isPasswordAcceptable(password))
    errors.password = "Parol juda oddiy — quyidagi talablardan ko'prog'ini bajaring";
  if (!confirm) errors.confirm = 'Parolni takrorlang';
  else if (confirm !== password) errors.confirm = 'Parollar mos kelmadi';
  return errors;
}

/** Yangi parol + kuchlilik ko'rsatkichi + takrorlash maydoni (sign-up va parolni tiklashda) */
export function NewPasswordFields({
  password,
  confirm,
  onPasswordChange,
  onConfirmChange,
  errors,
  passwordRef,
  confirmRef,
}: {
  password: string;
  confirm: string;
  onPasswordChange: (value: string) => void;
  onConfirmChange: (value: string) => void;
  errors: NewPasswordErrors;
  passwordRef?: Ref<HTMLInputElement>;
  confirmRef?: Ref<HTMLInputElement>;
}) {
  const meterId = useId();
  const matches = confirm.length > 0 && confirm === password;

  return (
    <>
      <Field label="Yangi parol" error={errors.password}>
        <Input
          ref={passwordRef}
          size="lg"
          type="password"
          name="new-password"
          autoComplete="new-password"
          placeholder="Kamida 8 ta belgi"
          leftIcon={<Lock />}
          aria-describedby={meterId}
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
        />
      </Field>
      <PasswordStrengthMeter id={meterId} password={password} />
      <Field label="Parolni takrorlang" error={errors.confirm}>
        <Input
          ref={confirmRef}
          size="lg"
          type="password"
          name="confirm-password"
          autoComplete="new-password"
          placeholder="Parolni qayta kiriting"
          leftIcon={<KeyRound />}
          rightIcon={matches ? <CircleCheck className="text-success" /> : undefined}
          value={confirm}
          onChange={(e) => onConfirmChange(e.target.value)}
        />
      </Field>
    </>
  );
}
