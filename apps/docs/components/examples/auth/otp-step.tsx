'use client';

import { Button, Field, OtpInput, ResendTimer, toast } from '@akhatmirzo/ui';
import { MessageSquareText } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { DEMO_CODE, RESEND_SECONDS, maskPhone, wait } from './data';
import { AuthHeader } from './ui';

const MAX_CODE_ATTEMPTS = 5;

/** Telefonga "SMS" keldi — demo'da toast sifatida */
function sendSms(phone: string) {
  toast('Yangi SMS · Kalit', {
    id: 'auth-sms',
    icon: <MessageSquareText aria-hidden="true" className="size-5 text-primary" />,
    description: `Tasdiqlash kodi: ${DEMO_CODE}. Uni hech kimga bermang. (${maskPhone(phone)})`,
    duration: 8000,
  });
}

export interface OtpStepProps {
  phone: string;
  title?: ReactNode;
  description?: ReactNode;
  /** To'g'ri kod kiritilganda */
  onVerified: () => void | Promise<void>;
  /** "Raqamni o'zgartirish" */
  onChangeNumber?: () => void;
  submitText?: string;
  /** Tugmalar qatoriga qo'shimcha (masalan "Orqaga") */
  secondaryAction?: ReactNode;
}

/**
 * SMS kodni tasdiqlash bosqichi: OtpInput (6 katak) + ResendTimer.
 * To'g'ri kod — 123456; noto'g'ri bo'lsa katakchalar silkinadi.
 */
export function OtpStep({
  phone,
  title = 'SMS kodni kiriting',
  description,
  onVerified,
  onChangeNumber,
  submitText = 'Tasdiqlash',
  secondaryAction,
}: OtpStepProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const exhausted = attempts >= MAX_CODE_ATTEMPTS;
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    sendSms(phone);
  }, [phone]);

  const verify = async (value: string) => {
    if (verifying || exhausted) return;
    if (value.length < 6) {
      setError("Kodni to'liq kiriting — 6 ta raqam");
      return;
    }
    setVerifying(true);
    setError(null);
    await wait(900);
    if (value !== DEMO_CODE) {
      const next = attempts + 1;
      setAttempts(next);
      setVerifying(false);
      setError(
        next >= MAX_CODE_ATTEMPTS
          ? "Urinishlar tugadi. Yangi kod so'rang."
          : `Kod noto'g'ri. Yana ${MAX_CODE_ATTEMPTS - next} ta urinish qoldi.`,
      );
      // Silkinishdan keyin katakchalar tozalanadi — yangi kodni darhol yozish mumkin
      setTimeout(() => {
        setCode('');
        formRef.current?.querySelector<HTMLInputElement>('[data-slot=otp-input] input')?.focus();
      }, 450);
      return;
    }
    toast.dismiss('auth-sms');
    await onVerified();
    setVerifying(false);
  };

  const resend = async () => {
    await wait(800);
    setCode('');
    setError(null);
    setAttempts(0);
    sendSms(phone);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void verify(code);
  };

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit}>
      <AuthHeader
        focusOnMount
        icon={<MessageSquareText />}
        title={title}
        description={
          description ?? (
            <>
              6 xonali kod{' '}
              <span className="font-semibold text-text tabular-nums">{maskPhone(phone)}</span>{' '}
              raqamiga yuborildi.{' '}
              {onChangeNumber && (
                <button
                  type="button"
                  onClick={onChangeNumber}
                  className="focus-ring cursor-pointer rounded-sm font-medium text-link hover:underline"
                >
                  Raqamni o&apos;zgartirish
                </button>
              )}
            </>
          )
        }
      />

      <Field label="Tasdiqlash kodi" error={error}>
        <OtpInput
          autoFocus
          groupSize={3}
          value={code}
          disabled={exhausted}
          aria-busy={verifying || undefined}
          onValueChange={(v) => {
            setCode(v);
            if (error && !exhausted) setError(null);
          }}
          onComplete={(v) => void verify(v)}
          className="[&_input]:h-12 [&_input]:w-11 sm:[&_input]:h-14 sm:[&_input]:w-12"
        />
      </Field>

      <div className="mt-4 flex items-center gap-2 text-xs text-text-muted">
        <span>Kod kelmadimi?</span>
        <ResendTimer seconds={RESEND_SECONDS} onResend={resend} />
      </div>

      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
        {secondaryAction}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={verifying}
          className="w-full sm:w-auto sm:flex-1"
          disabled={exhausted}
          labels={{ loading: 'Tekshirilmoqda' }}
        >
          {submitText}
        </Button>
      </div>
    </form>
  );
}
