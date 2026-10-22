'use client';

import { formatPhone, parsePhone } from '@akhatmirzo/core';
import { useLocalStorage } from '@akhatmirzo/hooks';
import { Button, Field, PhoneInput, toast } from '@akhatmirzo/ui';
import { ArrowLeft, ArrowRight, KeyRound, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import { storageKeys, wait } from './data';
import {
  NewPasswordFields,
  validateNewPassword,
  type NewPasswordErrors,
} from './new-password-fields';
import { OtpStep } from './otp-step';
import { Stepper } from './stepper';
import { useAccounts, useAuthHref, useHydrated, useLock } from './store';
import { AuthFooterLink, AuthHeader, FormSkeleton, SuccessMark } from './ui';

const STEPS = ['Telefon', 'SMS kod', 'Yangi parol'];

interface ForgotState {
  step: number;
  phone: string;
}

export function ForgotPasswordFlow() {
  return useHydrated() ? <ForgotWizard /> : <FormSkeleton fields={1} />;
}

function ForgotWizard() {
  const href = useAuthHref();
  const [state, setState, clearState] = useLocalStorage<ForgotState>(storageKeys.forgot, {
    step: 0,
    phone: '',
  });
  const [donePhone, setDonePhone] = useState<string | null>(null);

  if (donePhone) return <ResetSuccess phone={donePhone} />;

  return (
    <>
      <Stepper steps={STEPS} current={state.step} />
      <div key={state.step} className="motion-safe:animate-[auth-step_300ms_ease-out]">
        {state.step === 0 && (
          <PhoneStep
            phone={state.phone}
            onPhoneChange={(phone) => setState((s) => ({ ...s, phone }))}
            onNext={() => setState((s) => ({ ...s, step: 1 }))}
          />
        )}
        {state.step === 1 && (
          <OtpStep
            phone={state.phone}
            title="Kodni kiriting"
            submitText="Davom etish"
            onChangeNumber={() => setState((s) => ({ ...s, step: 0 }))}
            onVerified={() => setState((s) => ({ ...s, step: 2 }))}
          />
        )}
        {state.step === 2 && (
          <NewPasswordStep
            phone={state.phone}
            onBack={() => setState((s) => ({ ...s, step: 0 }))}
            onDone={() => {
              setDonePhone(state.phone);
              clearState();
            }}
          />
        )}
      </div>
      <p className="mt-8 text-center">
        <Link
          href={href('sign-in')}
          className="focus-ring inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-text-muted hover:text-text"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Kirish sahifasiga qaytish
        </Link>
      </p>
      <style>{`@keyframes auth-step{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:none}}`}</style>
    </>
  );
}

function PhoneStep({
  phone,
  onPhoneChange,
  onNext,
}: {
  phone: string;
  onPhoneChange: (phone: string) => void;
  onNext: () => void;
}) {
  const href = useAuthHref();
  const { findAccount } = useAccounts();
  const [error, setError] = useState<ReactNode>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = parsePhone(phone);
    if (parsed.digits.length < 9) {
      setError(phone ? "Raqamni to'liq kiriting" : 'Telefon raqamini kiriting');
      return inputRef.current?.focus();
    }
    if (!parsed.valid) {
      setError("Operator kodi noto'g'ri");
      return inputRef.current?.focus();
    }
    setLoading(true);
    await wait(900);
    setLoading(false);
    if (!findAccount(phone)) {
      setError(
        <>
          Bu raqam bilan hisob topilmadi.{' '}
          <Link href={href('sign-up')} className="font-semibold underline underline-offset-2">
            Ro&apos;yxatdan o&apos;ting
          </Link>
        </>,
      );
      return inputRef.current?.focus();
    }
    onNext();
  };

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
      <AuthHeader
        icon={<KeyRound />}
        title="Parolni tiklash"
        description="Hisobingizga bog'langan telefon raqamni kiriting — tiklash kodini yuboramiz."
      />
      <Field label="Telefon raqam" error={error}>
        <PhoneInput
          ref={inputRef}
          size="lg"
          name="phone"
          autoComplete="tel-national"
          autoFocus
          value={phone}
          onValueChange={(v) => {
            onPhoneChange(v);
            setError(null);
          }}
        />
      </Field>
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={loading}
        rightIcon={<ArrowRight />}
        labels={{ loading: 'Kod yuborilmoqda' }}
      >
        Kod yuborish
      </Button>
    </form>
  );
}

function NewPasswordStep({
  phone,
  onBack,
  onDone,
}: {
  phone: string;
  onBack: () => void;
  onDone: () => void;
}) {
  const { findAccount, updatePassword } = useAccounts();
  const [, setLock] = useLock();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);

  const validate = (): NewPasswordErrors => {
    const errors = validateNewPassword(password, confirm);
    if (!errors.password && findAccount(phone)?.password === password) {
      errors.password = 'Yangi parol avvalgisidan farq qilishi kerak';
    }
    return errors;
  };
  const errors = submitted ? validate() : {};

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const found = validate();
    if (found.password) return passwordRef.current?.focus();
    if (found.confirm) return confirmRef.current?.focus();
    setLoading(true);
    await wait(1200);
    updatePassword(phone, password);
    // Yangi parol bilan bloklash ham olib tashlanadi
    setLock({ failed: 0, until: null });
    toast.success('Parol yangilandi');
    onDone();
  };

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
      <AuthHeader
        focusOnMount
        icon={<ShieldCheck />}
        title="Yangi parol o'rnating"
        description="Boshqa saytlarda ishlatmagan, eslab qolish oson, lekin taxmin qilish qiyin parol tanlang."
      />
      <NewPasswordFields
        password={password}
        confirm={confirm}
        onPasswordChange={setPassword}
        onConfirmChange={setConfirm}
        errors={errors}
        passwordRef={passwordRef}
        confirmRef={confirmRef}
      />
      <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          leftIcon={<ArrowLeft />}
          onClick={onBack}
          disabled={loading}
        >
          Orqaga
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          labels={{ loading: 'Saqlanmoqda' }}
          className="w-full sm:w-auto sm:flex-1"
        >
          Parolni saqlash
        </Button>
      </div>
    </form>
  );
}

function ResetSuccess({ phone }: { phone: string }) {
  const router = useRouter();
  const href = useAuthHref();
  const [, setRemembered] = useLocalStorage<unknown>(storageKeys.remembered, null);

  return (
    <div className="text-center">
      <SuccessMark />
      <AuthHeader
        focusOnMount
        title="Parol yangilandi"
        description={
          <>
            <span className="font-semibold text-text tabular-nums">{formatPhone(phone)}</span>{' '}
            hisobining paroli o&apos;zgartirildi. Boshqa qurilmalardagi sessiyalar yopildi.
          </>
        }
      />
      <Button
        variant="primary"
        size="lg"
        fullWidth
        rightIcon={<ArrowRight />}
        onClick={() => {
          setRemembered({ method: 'phone', login: phone });
          router.push(href('sign-in'));
        }}
      >
        Yangi parol bilan kirish
      </Button>
      <AuthFooterLink text="Savollar bormi?" href="#yordam" label="Yordam markazi" />
    </div>
  );
}
