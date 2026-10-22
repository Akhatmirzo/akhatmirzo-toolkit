'use client';

import { formatPhone } from '@akhatmirzo/core';
import { Button, Card, cn, Field, OtpInput, ResendTimer, Spinner, toast } from '@akhatmirzo/ui';
import { ArrowLeft, Check, Download, House, MessageSquareLock, Repeat, Share2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { BrandLogo } from '../bank-card';
import { DEMO_USER, brandLabels, shortCard, type Transaction } from '../data';
import { downloadReceipt, shareReceipt } from '../receipt';
import { DetailList, formatDateTime, Money, useBankHref } from '../ui';
import type { TransferQuote } from './transfer-form';

export const DEMO_OTP = '123456';
const MAX_ATTEMPTS = 3;

/* ---------- Qadamlar ko'rsatkichi ---------- */

const STEPS = ["Ma'lumotlar", 'Tasdiqlash', 'SMS kod', 'Tayyor'];

export function Stepper({ current }: { current: number }) {
  return (
    <ol aria-label="O'tkazma bosqichlari" className="flex items-center gap-2">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li
            key={label}
            aria-current={active ? 'step' : undefined}
            className="flex min-w-0 flex-1 items-center gap-2"
          >
            <span
              className={cn(
                'inline-flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-base',
                done && 'bg-primary text-primary-foreground',
                active && 'bg-primary-soft text-primary-soft-foreground ring-2 ring-primary',
                !done && !active && 'bg-surface-muted text-text-muted',
              )}
            >
              {done ? <Check aria-hidden="true" className="size-4" /> : i + 1}
            </span>
            <span
              className={cn(
                'hidden truncate text-sm sm:block',
                active ? 'font-semibold text-text' : 'text-text-muted',
              )}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <span
                aria-hidden="true"
                className={cn('h-px min-w-3 flex-1', done ? 'bg-primary' : 'bg-border')}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ---------- Tasdiqlash ---------- */

export function ConfirmStep({
  quote,
  comment,
  onBack,
  onConfirm,
}: {
  quote: TransferQuote;
  comment: string;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const { recipient, from, amount, fee } = quote;
  return (
    <Card className="mx-auto w-full max-w-lg gap-5">
      <div className="text-center">
        <p className="text-sm text-text-muted">Jami yechiladi</p>
        <Money value={amount + fee} className="mt-1 block text-3xl font-bold text-text" />
      </div>
      <DetailList
        items={[
          { label: 'Qabul qiluvchi', value: recipient.name },
          {
            label: 'Karta',
            value: (
              <span className="inline-flex items-center gap-2 text-xs tracking-wider tabular-nums">
                {recipient.masked}
                {recipient.brand && <BrandLogo brand={recipient.brand} className="text-[10px]" />}
              </span>
            ),
          },
          {
            label: 'Qaysi kartadan',
            value: `${from.name} · ${brandLabels[from.brand]} ${shortCard(from.number)}`,
          },
          { label: 'Summa', value: <Money value={amount} /> },
          {
            label: `Komissiya (${(quote.feeRate * 100).toLocaleString('en-US')}%)`,
            value: <Money value={fee} />,
          },
          ...(comment ? [{ label: 'Izoh', value: comment }] : []),
        ]}
      />
      <p className="rounded-xl bg-info-soft px-3 py-2.5 text-xs text-info-soft-foreground">
        Tasdiqlaganingizdan so&apos;ng {formatPhone(DEMO_USER.phone)} raqamiga SMS kod yuboriladi.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Button size="lg" variant="outline" leftIcon={<ArrowLeft />} onClick={onBack}>
          Orqaga
        </Button>
        <Button size="lg" variant="primary" onClick={onConfirm} data-autofocus>
          Tasdiqlash
        </Button>
      </div>
    </Card>
  );
}

/* ---------- SMS kod ---------- */

export function OtpStep({ onBack, onVerified }: { onBack: () => void; onVerified: () => void }) {
  const [code, setCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string>();
  const [attempts, setAttempts] = useState(0);
  const locked = attempts >= MAX_ATTEMPTS;

  const verify = (value: string) => {
    setChecking(true);
    setError(undefined);
    setTimeout(() => {
      setChecking(false);
      if (value === DEMO_OTP) {
        onVerified();
        return;
      }
      const used = attempts + 1;
      setAttempts(used);
      setCode('');
      setError(
        used >= MAX_ATTEMPTS
          ? "Urinishlar tugadi. Yangi kod so'rang."
          : `Kod noto'g'ri. Yana ${MAX_ATTEMPTS - used} ta urinish qoldi.`,
      );
    }, 900);
  };

  const resend = () =>
    new Promise<void>((resolve) =>
      setTimeout(() => {
        setAttempts(0);
        setError(undefined);
        setCode('');
        toast.info('Yangi kod yuborildi', { description: `Demo kod: ${DEMO_OTP}` });
        resolve();
      }, 800),
    );

  const masked = formatPhone(DEMO_USER.phone).replace(/\d{3} \d{2}(?= \d{2}$)/, '*** **');

  return (
    <Card className="mx-auto w-full max-w-md items-center gap-5 text-center">
      <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary-soft-foreground">
        <MessageSquareLock aria-hidden="true" className="size-7" />
      </span>
      <div>
        <h2 className="text-lg font-semibold text-text">SMS kodni kiriting</h2>
        <p className="mt-1 text-sm text-text-muted">
          Kod <span className="font-medium text-text tabular-nums">{masked}</span> raqamiga
          yuborildi
        </p>
      </div>
      <Field label="Tasdiqlash kodi" error={error} className="items-center [&_label]:sr-only">
        <OtpInput
          // Xatodan keyin qayta chiziladi — fokus birinchi katakchaga qaytadi
          key={attempts}
          value={code}
          onValueChange={(v) => {
            setCode(v);
            if (v && !locked) setError(undefined);
          }}
          onComplete={verify}
          groupSize={3}
          autoFocus
          disabled={checking || locked}
          className="mx-auto"
        />
      </Field>
      <div className="flex h-5 items-center justify-center">
        {checking ? (
          <span className="inline-flex items-center gap-2 text-sm text-text-muted">
            <Spinner size="sm" label="Tekshirilmoqda" /> Tekshirilmoqda...
          </span>
        ) : (
          <ResendTimer seconds={30} onResend={resend} />
        )}
      </div>
      <p className="rounded-lg bg-surface-muted px-3 py-1.5 text-xs text-text-muted">
        Demo kod:{' '}
        <span className="font-semibold tracking-widest text-text tabular-nums">{DEMO_OTP}</span>
      </p>
      <Button variant="ghost" leftIcon={<ArrowLeft />} onClick={onBack} disabled={checking}>
        Orqaga
      </Button>
    </Card>
  );
}

/* ---------- Muvaffaqiyat ---------- */

export function SuccessStep({
  tx,
  quote,
  onNew,
}: {
  tx: Transaction;
  quote: TransferQuote;
  onNew: () => void;
}) {
  const href = useBankHref();
  return (
    <Card className="mx-auto w-full max-w-lg gap-5">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="relative inline-flex size-16 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-success-soft motion-reduce:animate-none [animation-iteration-count:2]" />
          <span className="relative inline-flex size-16 items-center justify-center rounded-full bg-success text-success-foreground">
            <Check aria-hidden="true" className="size-8" strokeWidth={3} />
          </span>
        </span>
        <div role="status">
          <h2 className="text-lg font-semibold text-text">O&apos;tkazma bajarildi</h2>
          <p className="text-sm text-text-muted">{quote.recipient.name} hisobiga o&apos;tkazildi</p>
        </div>
        <Money value={quote.amount} className="text-3xl font-bold text-text" />
      </div>

      <div className="rounded-2xl border border-dashed border-border-strong px-4 py-1">
        <DetailList
          items={[
            { label: 'Sana va vaqt', value: formatDateTime(tx.date) },
            { label: 'Qabul qiluvchi', value: quote.recipient.masked },
            {
              label: 'Qaysi kartadan',
              value: `${brandLabels[quote.from.brand]} ${shortCard(quote.from.number)}`,
            },
            { label: 'Komissiya', value: <Money value={quote.fee} /> },
            {
              label: 'Tranzaksiya ID',
              value: <span className="text-xs tracking-wide tabular-nums">{tx.id}</span>,
            },
          ]}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button leftIcon={<Share2 />} onClick={() => shareReceipt(tx, quote.from)}>
          Chekni ulashish
        </Button>
        <Button leftIcon={<Download />} onClick={() => downloadReceipt(tx, quote.from)}>
          Yuklab olish
        </Button>
        <Button variant="outline" leftIcon={<Repeat />} onClick={onNew}>
          Yangi o&apos;tkazma
        </Button>
        <Button asChild variant="primary" leftIcon={<House />}>
          <Link href={href()}>Bosh sahifa</Link>
        </Button>
      </div>
    </Card>
  );
}
