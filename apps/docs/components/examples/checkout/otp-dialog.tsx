'use client';

import { formatMoney } from '@akhatmirzo/core';
import { Dialog, OtpInput, Spinner, toast } from '@akhatmirzo/ui';
import { MessageSquareText } from 'lucide-react';
import { useRef, useState } from 'react';
import { DEMO_OTP } from './data';

const MAX_ATTEMPTS = 3;

interface OtpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** "+998 90 *** ** 67" */
  phone: string;
  amount: number;
  /** Kod to'g'ri bo'lganda chaqiriladi; Promise tugaguncha dialog "kutish" holatida */
  onVerified: () => Promise<void>;
}

/**
 * To'lovni SMS kod bilan tasdiqlash. Har ochilishda yangi holat bilan boshlanishi uchun
 * ota komponent `key` beradi.
 */
export function OtpDialog({ open, onOpenChange, phone, amount, onVerified }: OtpDialogProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const cellsRef = useRef<HTMLDivElement>(null);

  const verify = (value: string) => {
    setBusy(true);
    setError(null);
    // Bank tomonida tekshirilayotgandek
    setTimeout(async () => {
      if (value !== DEMO_OTP) {
        const used = attempts + 1;
        setAttempts(used);
        setBusy(false);
        setCode('');
        if (used >= MAX_ATTEMPTS) {
          onOpenChange(false);
          toast.error('Urinishlar soni tugadi', {
            description: "Xavfsizlik uchun to'lov bekor qilindi. Qaytadan urinib ko'ring.",
          });
          return;
        }
        setError(`Kod noto'g'ri. Yana ${MAX_ATTEMPTS - used} ta urinish qoldi.`);
        // Katakchalar qayta yoqilgach — birinchisiga fokus
        requestAnimationFrame(() => cellsRef.current?.querySelector('input')?.focus());
        return;
      }
      await onVerified();
      setBusy(false);
    }, 900);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <Dialog.Content
        size="sm"
        title="To'lovni tasdiqlang"
        description={`${formatMoney(amount)} to'lovi uchun SMS kod yuborildi`}
        dismissible={!busy}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary-soft-foreground">
            <MessageSquareText aria-hidden="true" className="size-7" />
          </span>
          <p className="text-sm text-text-muted">
            Kod <span className="font-semibold text-text tabular-nums">{phone}</span> raqamiga
            yuborildi
          </p>
          <div ref={cellsRef}>
            <OtpInput
              value={code}
              onValueChange={(v) => {
                setCode(v);
                if (error) setError(null);
              }}
              onComplete={verify}
              invalid={Boolean(error)}
              disabled={busy}
              groupSize={3}
              autoFocus
              aria-describedby="otp-hint"
            />
          </div>
          <div id="otp-hint" aria-live="polite" className="min-h-5 text-sm">
            {busy ? (
              <span className="inline-flex items-center gap-2 text-text-muted">
                <Spinner size="sm" /> Tekshirilmoqda…
              </span>
            ) : error ? (
              <span className="text-danger-soft-foreground">{error}</span>
            ) : (
              <span className="text-text-muted">
                Demo kod: <span className="font-mono font-semibold text-text">{DEMO_OTP}</span>
              </span>
            )}
          </div>
          <OtpInput.ResendTimer
            seconds={30}
            onResend={() =>
              new Promise<void>((resolve) =>
                setTimeout(() => {
                  toast.info('Yangi kod yuborildi', { description: phone });
                  resolve();
                }, 600),
              )
            }
          />
        </div>
      </Dialog.Content>
    </Dialog>
  );
}
