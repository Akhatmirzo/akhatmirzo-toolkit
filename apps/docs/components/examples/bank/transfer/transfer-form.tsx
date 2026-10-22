'use client';

import { formatMoney } from '@akhatmirzo/core';
import {
  Avatar,
  Button,
  Card,
  CardInput,
  cn,
  Field,
  MoneyInput,
  PhoneInput,
  Radio,
  RadioGroup,
  Spinner,
  Tabs,
  Textarea,
} from '@akhatmirzo/ui';
import { AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { BrandLogo } from '../bank-card';
import { useBank } from '../bank-store';
import {
  brandLabels,
  calcFee,
  contacts,
  shortCard,
  transferFeeRate,
  TRANSFER_MAX,
  TRANSFER_MIN,
  type BankCard,
} from '../data';
import { DetailList, Money } from '../ui';
import {
  recipientByCard,
  recipientByPhone,
  type LookupState,
  type Recipient,
} from './use-recipient-lookup';

export type TransferMethod = 'card' | 'phone';

export interface TransferDraft {
  method: TransferMethod;
  cardNumber: string;
  phone: string;
  fromCardId: string;
  amount: number | null;
  comment: string;
}

export interface TransferQuote {
  recipient: Recipient;
  from: BankCard;
  amount: number;
  fee: number;
  feeRate: number;
}

interface LookupApi {
  state: LookupState;
  run: (resolve: () => Recipient | string) => void;
  reset: (next?: LookupState) => void;
}

const QUICK_AMOUNTS = [50_000, 100_000, 500_000, 1_000_000];

/** Summa bo'yicha xato matni (yo'q bo'lsa — undefined) */
function amountError(amount: number | null, total: number, from?: BankCard) {
  if (amount === null) return 'Summani kiriting';
  if (amount < TRANSFER_MIN) return `Minimal summa — ${formatMoney(TRANSFER_MIN)}`;
  if (amount > TRANSFER_MAX) return `Bir martalik limit — ${formatMoney(TRANSFER_MAX)}`;
  if (from && total > from.balance)
    return `Kartada mablag' yetarli emas. Mavjud: ${formatMoney(from.balance)}`;
  return undefined;
}

function RecipientStatus({ lookup }: { lookup: LookupState }) {
  if (lookup.status === 'idle') return null;
  if (lookup.status === 'loading') {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-surface-muted px-3 py-3 text-sm text-text-muted">
        <Spinner size="sm" label="Qabul qiluvchi qidirilmoqda" />
        Qabul qiluvchi qidirilmoqda...
      </div>
    );
  }
  if (lookup.status === 'error') {
    return (
      <div
        role="alert"
        className="flex items-start gap-3 rounded-xl bg-danger-soft px-3 py-3 text-sm text-danger-soft-foreground"
      >
        <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        {lookup.message}
      </div>
    );
  }
  const r = lookup.recipient;
  return (
    <div
      aria-live="polite"
      className="flex items-center gap-3 rounded-xl border border-border bg-surface-muted/60 px-3 py-2.5"
    >
      <Avatar name={r.name} size="md" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-text">{r.name}</p>
        <p className="truncate text-xs tracking-wider text-text-muted tabular-nums">{r.masked}</p>
      </div>
      {r.brand && (
        <span className="text-xs text-text-muted">
          <BrandLogo brand={r.brand} className="text-xs" />
        </span>
      )}
      <CheckCircle2 aria-label="Topildi" className="size-5 shrink-0 text-success" />
    </div>
  );
}

export function TransferForm({
  draft,
  onChange,
  lookup,
  onSubmit,
}: {
  draft: TransferDraft;
  onChange: (patch: Partial<TransferDraft>) => void;
  lookup: LookupApi;
  onSubmit: (quote: TransferQuote) => void;
}) {
  const { cards } = useBank();
  const [submitted, setSubmitted] = useState(false);

  const from = cards.find((c) => c.id === draft.fromCardId);
  const recipient = lookup.state.status === 'found' ? lookup.state.recipient : null;
  const feeRate = from ? transferFeeRate(from.brand, recipient?.brand ?? null) : 0;
  const fee = draft.amount ? calcFee(draft.amount, feeRate) : 0;
  const total = (draft.amount ?? 0) + fee;

  const errors = {
    recipient:
      lookup.state.status === 'found'
        ? recipient?.ownCardId === draft.fromCardId
          ? "Bir xil kartaga o'tkazib bo'lmaydi — boshqa kartani tanlang"
          : undefined
        : submitted && lookup.state.status !== 'loading' && lookup.state.status !== 'error'
          ? draft.method === 'card'
            ? "Qabul qiluvchi karta raqamini to'liq kiriting"
            : "Telefon raqamini to'liq kiriting"
          : undefined,
    from: submitted && !from ? "Qaysi kartadan o'tkazishni tanlang" : undefined,
    amount: draft.amount !== null || submitted ? amountError(draft.amount, total, from) : undefined,
  };
  const valid =
    recipient !== null &&
    from !== undefined &&
    !errors.recipient &&
    !amountError(draft.amount, total, from);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!valid || !recipient || !from || draft.amount === null) return;
    onSubmit({ recipient, from, amount: draft.amount, fee, feeRate });
  };

  const switchMethod = (method: string) => {
    onChange({ method: method as TransferMethod });
    lookup.reset();
    const value = method === 'card' ? draft.cardNumber : draft.phone;
    // Avval kiritilgan raqam bo'lsa — qayta qidiramiz
    if (method === 'card' && value.length === 16) lookup.run(() => recipientByCard(value, cards));
    if (method === 'phone' && value.length === 9) lookup.run(() => recipientByPhone(value));
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="grid items-start gap-5 lg:grid-cols-[1fr_320px]"
    >
      <div className="flex flex-col gap-5">
        <Card padding="sm" className="gap-4">
          <h2 className="text-base font-semibold text-text">Kimga</h2>
          <Tabs value={draft.method} onValueChange={switchMethod} variant="segmented">
            <Tabs.List aria-label="O'tkazma usuli" className="w-full *:flex-1">
              <Tabs.Trigger value="card">Karta raqami</Tabs.Trigger>
              <Tabs.Trigger value="phone">Telefon raqami</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="card" className="flex flex-col gap-3 pt-4">
              <Field
                label="Qabul qiluvchi kartasi"
                description="Uzcard, Humo yoki Visa — tizim avtomatik aniqlanadi"
                error={errors.recipient}
              >
                <CardInput
                  value={draft.cardNumber}
                  autoFocus
                  onValueChange={(value, details) => {
                    onChange({ cardNumber: value });
                    if (details.valid) lookup.run(() => recipientByCard(value, cards));
                    else if (details.complete)
                      lookup.reset({
                        status: 'error',
                        message: "Karta raqami noto'g'ri kiritilgan",
                      });
                    else lookup.reset();
                  }}
                />
              </Field>
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-text-muted">Saqlanganlar</p>
                <ul className="flex flex-wrap gap-2">
                  {contacts.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => {
                          onChange({ cardNumber: c.card });
                          lookup.run(() => recipientByCard(c.card, cards));
                        }}
                        className={cn(
                          'focus-ring inline-flex items-center gap-2 rounded-full border border-border bg-surface py-1 pr-3 pl-1 text-xs font-medium text-text transition-colors hover:border-border-strong',
                          draft.cardNumber === c.card &&
                            'border-primary bg-primary-soft text-primary-soft-foreground',
                        )}
                      >
                        <Avatar name={c.name} size="xs" />
                        {c.name.split(' ')[0]} {shortCard(c.card)}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </Tabs.Content>
            <Tabs.Content value="phone" className="flex flex-col gap-3 pt-4">
              <Field
                label="Telefon raqami"
                description="Raqamga ulangan asosiy kartaga o'tkaziladi"
                error={errors.recipient}
              >
                <PhoneInput
                  value={draft.phone}
                  onValueChange={(value, details) => {
                    onChange({ phone: value });
                    if (details.valid) lookup.run(() => recipientByPhone(value));
                    else lookup.reset();
                  }}
                />
              </Field>
              <p className="text-xs text-text-muted">
                Demo: &quot;00&quot; bilan tugagan raqamga karta ulanmagan bo&apos;ladi.
              </p>
            </Tabs.Content>
          </Tabs>
          <RecipientStatus lookup={lookup.state} />
        </Card>

        <Card padding="sm" className="gap-4">
          <h2 id="from-title" className="text-base font-semibold text-text">
            Qaysi kartadan
          </h2>
          <RadioGroup
            aria-labelledby="from-title"
            variant="card"
            value={draft.fromCardId}
            onValueChange={(fromCardId) => onChange({ fromCardId })}
            invalid={Boolean(errors.from)}
            className="sm:grid sm:grid-cols-2"
          >
            {cards.map((c) => (
              <Radio
                key={c.id}
                value={c.id}
                disabled={c.blocked}
                label={c.name}
                description={
                  <span className="flex flex-col">
                    <span>
                      {brandLabels[c.brand]} {shortCard(c.number)}
                    </span>
                    {c.blocked ? (
                      <span className="text-danger-soft-foreground">Karta bloklangan</span>
                    ) : (
                      <Money value={c.balance} className="font-medium text-text" />
                    )}
                  </span>
                }
              />
            ))}
          </RadioGroup>
          {errors.from && <p className="text-xs text-danger-soft-foreground">{errors.from}</p>}
        </Card>

        <Card padding="sm" className="gap-4">
          <h2 className="text-base font-semibold text-text">Summa</h2>
          <Field
            label="O'tkazma summasi"
            error={errors.amount}
            description={
              feeRate
                ? `Komissiya ${(feeRate * 100).toLocaleString('en-US')}%`
                : "Komissiyasiz o'tkazma"
            }
          >
            <MoneyInput
              value={draft.amount}
              onValueChange={(amount) => onChange({ amount })}
              max={99_999_999}
              size="lg"
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            {QUICK_AMOUNTS.map((a) => (
              <Button
                key={a}
                type="button"
                size="sm"
                variant={draft.amount === a ? 'primary' : 'outline'}
                onClick={() => onChange({ amount: a })}
              >
                {formatMoney(a, { currency: false })}
              </Button>
            ))}
          </div>
          <Field label="Izoh" description="Ixtiyoriy, qabul qiluvchi ko'radi">
            <Textarea
              value={draft.comment}
              onChange={(e) => onChange({ comment: e.target.value })}
              maxLength={100}
              minRows={2}
              showCount
              placeholder="Masalan: tug'ilgan kun uchun"
            />
          </Field>
        </Card>
      </div>

      <Card padding="sm" className="gap-3 lg:sticky lg:top-[4.75rem]">
        <h2 className="text-base font-semibold text-text">Xulosa</h2>
        <DetailList
          items={[
            { label: 'Qabul qiluvchi', value: recipient?.name ?? '—' },
            { label: 'Summa', value: draft.amount ? <Money value={draft.amount} /> : '—' },
            { label: 'Komissiya', value: <Money value={fee} /> },
          ]}
        />
        <div className="flex items-baseline justify-between gap-3 border-t border-border pt-3">
          <span className="text-sm text-text-muted">Jami yechiladi</span>
          <Money value={total} className="text-lg font-bold text-text" />
        </div>
        <Button type="submit" variant="primary" size="lg" fullWidth rightIcon={<ArrowRight />}>
          Davom etish
        </Button>
        <p className="text-center text-xs text-text-muted">
          Limit: {formatMoney(TRANSFER_MIN)} — {formatMoney(TRANSFER_MAX)}
        </p>
      </Card>
    </form>
  );
}
