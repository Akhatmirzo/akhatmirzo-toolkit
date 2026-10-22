'use client';

import { useCountdown } from '@akhatmirzo/hooks';
import { Button, Card, Field, OtpInput, toast } from '@akhatmirzo/ui';
import { ArrowLeft, CircleCheck, MessageSquareText, RotateCw } from 'lucide-react';
import { useState } from 'react';

const PHONE_MASKED = '+998 90 *** ** 67';
/** Sinov uchun to'g'ri kod — haqiqiy ilovada kod serverda tekshiriladi */
const DEMO_CODE = '246810';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function OtpVerifyBlock() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [verified, setVerified] = useState(false);
  const [attempts, setAttempts] = useState(3);
  const { formatted, isRunning, restart } = useCountdown(59);

  const verify = async (value: string) => {
    setChecking(true);
    setError('');
    await wait(800);
    setChecking(false);
    if (value === DEMO_CODE) {
      setVerified(true);
      return;
    }
    const left = attempts - 1;
    setAttempts(left);
    setCode('');
    setError(
      left > 0
        ? `Kod noto'g'ri. Yana ${left} ta urinish qoldi.`
        : 'Urinishlar tugadi. Yangi kod oling.',
    );
  };

  const resend = () => {
    // Haqiqiy ilovada — SMS yuborish so'rovi
    setCode('');
    setError('');
    setAttempts(3);
    restart();
    toast(`Yangi kod ${PHONE_MASKED} raqamiga yuborildi`);
  };

  return (
    <div className="@container w-full bg-surface-muted font-sans text-text">
      <div className="flex min-h-[600px] items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md items-center text-center @md:p-8">
          {verified ? (
            <div className="flex flex-col items-center gap-4 py-6" role="status">
              <span className="grid size-16 place-items-center rounded-full bg-success-soft text-success">
                <CircleCheck className="size-8" aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-1.5">
                <h2 className="m-0 text-2xl font-bold tracking-tight">Raqam tasdiqlandi</h2>
                <p className="m-0 text-sm text-text-muted">
                  {PHONE_MASKED} hisobingizga bog&apos;landi.
                </p>
              </div>
              <Button variant="primary" fullWidth>
                Davom etish
              </Button>
            </div>
          ) : (
            <div className="flex w-full flex-col items-center gap-6">
              <span className="grid size-14 place-items-center rounded-2xl bg-primary-soft text-primary-soft-foreground">
                <MessageSquareText className="size-7" aria-hidden="true" />
              </span>

              <div className="flex flex-col gap-1.5">
                <h2 className="m-0 text-2xl font-bold tracking-tight">Telefonni tasdiqlang</h2>
                <p className="m-0 text-sm text-text-muted">
                  <span className="font-medium whitespace-nowrap text-text">{PHONE_MASKED}</span>{' '}
                  raqamiga 6 xonali kod yubordik.
                </p>
              </div>

              <form
                noValidate
                onSubmit={(event) => {
                  event.preventDefault();
                  if (code.length === 6 && !checking) void verify(code);
                }}
                className="flex w-full flex-col items-center gap-6"
              >
                <Field
                  label="Tasdiqlash kodi"
                  description={`Sinov kodi: ${DEMO_CODE}`}
                  error={error}
                  className="items-center"
                >
                  <OtpInput
                    length={6}
                    groupSize={3}
                    value={code}
                    onValueChange={(value) => {
                      setCode(value);
                      if (error) setError('');
                    }}
                    onComplete={verify}
                    invalid={Boolean(error)}
                    disabled={checking || attempts === 0}
                  />
                </Field>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={checking}
                  disabled={code.length < 6 || attempts === 0}
                >
                  Tasdiqlash
                </Button>
              </form>

              <div className="flex w-full flex-col items-center gap-1 border-t border-border pt-4 text-sm">
                <span className="text-text-muted">Kod kelmadimi?</span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isRunning}
                  onClick={resend}
                  leftIcon={<RotateCw />}
                >
                  {isRunning ? (
                    <>
                      Qayta yuborish <span className="tabular-nums">({formatted})</span>
                    </>
                  ) : (
                    'Kodni qayta yuborish'
                  )}
                </Button>
              </div>

              <a
                href="#change-phone"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-link hover:underline"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                Raqamni o&apos;zgartirish
              </a>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
