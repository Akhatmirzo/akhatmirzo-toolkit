'use client';

import { formatMoney, formatPhone, parsePhone } from '@akhatmirzo/core';
import {
  Badge,
  Button,
  Checkbox,
  Dialog,
  Field,
  Input,
  MaskedInput,
  MoneyInput,
  PhoneInput,
  Select,
  Spinner,
  toast,
} from '@akhatmirzo/ui';
import { AlertCircle, Check, CircleCheck } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useBank } from '../bank-store';
import {
  brandLabels,
  lookupBill,
  operators,
  shortCard,
  type Bill,
  type Favorite,
  type PaymentService,
  type Transaction,
} from '../data';
import { DetailList, formatDateTime, Money } from '../ui';
import { ServiceIcon } from './service-icon';

type BillState = { status: 'idle' | 'loading' } | { status: 'done'; bill: Bill };

/** To'lov oynasi uchun boshlang'ich qiymatlar (sevimli to'lovdan) */
export interface PaymentPreset {
  service: PaymentService;
  favorite?: Favorite;
}

/** Hisob raqamini ko'rsatish: telefon — formatlangan, qolgani — o'zi */
export function formatAccount(service: PaymentService, account: string) {
  return service.account.type === 'phone' ? formatPhone(account) : account;
}

function PaymentForm({
  service,
  favorite,
  onDone,
}: {
  service: PaymentService;
  favorite?: Favorite;
  onDone: (tx: Transaction) => void;
}) {
  const { cards, addTransaction, addFavorite } = useBank();
  const active = cards.filter((c) => !c.blocked);
  const [account, setAccount] = useState(favorite?.account ?? '');
  const [amount, setAmount] = useState<number | null>(favorite?.amount ?? null);
  const [cardId, setCardId] = useState(active[0]?.id ?? '');
  const [save, setSave] = useState(false);
  const [label, setLabel] = useState('');
  const [bill, setBill] = useState<BillState>({ status: 'idle' });
  const [submitted, setSubmitted] = useState(false);
  const [paying, setPaying] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const isPhone = service.account.type === 'phone';
  const mask = service.account.type === 'mask' ? service.account : null;
  const slots = mask ? mask.mask.replace(/[^9A*]/g, '').length : 9;
  const accountComplete = isPhone ? parsePhone(account).valid : account.length === slots;
  const operatorCode = isPhone ? parsePhone(account).operator : null;
  const operator = operatorCode ? operators[operatorCode] : undefined;
  const card = cards.find((c) => c.id === cardId);
  const noDebt = bill.status === 'done' && bill.bill.debt === 0 && service.group === 'government';

  /** Hisob to'liq kiritilganda qarzdorlikni "so'raymiz" */
  const checkBill = (value: string) => {
    clearTimeout(timer.current);
    if (!service.debtLookup) return;
    setBill({ status: 'loading' });
    timer.current = setTimeout(() => {
      const result = lookupBill(service, value);
      setBill({ status: 'done', bill: result });
      if (result.debt > 0) setAmount((prev) => prev ?? result.debt);
    }, 900);
  };

  // Sevimlidan ochilganda — qarzdorlik darhol tekshiriladi
  useEffect(() => {
    if (!favorite || !service.debtLookup) return;
    const t = setTimeout(() => {
      const result = lookupBill(service, favorite.account);
      setBill({ status: 'done', bill: result });
      if (result.debt > 0) setAmount((prev) => prev ?? result.debt);
    }, 900);
    return () => clearTimeout(t);
  }, [favorite, service]);

  const errors = {
    account:
      submitted && !accountComplete ? `${service.account.label}ni to'liq kiriting` : undefined,
    amount:
      amount === null
        ? submitted
          ? 'Summani kiriting'
          : undefined
        : amount < service.min
          ? `Minimal summa — ${formatMoney(service.min)}`
          : amount > service.max
            ? `Maksimal summa — ${formatMoney(service.max)}`
            : card && amount > card.balance
              ? `Kartada mablag' yetarli emas. Mavjud: ${formatMoney(card.balance)}`
              : undefined,
    card: submitted && !card ? 'Kartani tanlang' : undefined,
    label: submitted && save && !label.trim() ? 'Nom bering' : undefined,
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!accountComplete || amount === null || !card || noDebt) return;
    if (Object.values(errors).some(Boolean) || (save && !label.trim())) return;
    setPaying(true);
    timer.current = setTimeout(() => {
      const tx = addTransaction({
        title: isPhone ? (operator ?? 'Mobil aloqa') : service.title,
        description: `${service.provider}, ${formatAccount(service, account)}`,
        amount: -amount,
        fee: 0,
        category:
          service.group === 'mobile' || service.group === 'internet' ? 'mobile' : 'utilities',
        kind: 'payment',
        status: 'success',
        cardId: card.id,
        counterparty: formatAccount(service, account),
      });
      if (save) addFavorite({ serviceId: service.id, label: label.trim(), account, amount });
      setPaying(false);
      onDone(tx);
    }, 1200);
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label={service.account.label} error={errors.account} required>
        {isPhone ? (
          <PhoneInput
            value={account}
            autoFocus
            onValueChange={(v) => setAccount(v)}
            rightIcon={
              operator ? (
                <Badge color="primary" size="sm">
                  {operator}
                </Badge>
              ) : undefined
            }
          />
        ) : (
          <MaskedInput
            mask={mask!.mask}
            uppercase={mask!.uppercase}
            placeholder={mask!.placeholder}
            value={account}
            autoFocus
            onValueChange={(v, details) => {
              setAccount(v);
              if (details.complete) checkBill(v);
              else {
                clearTimeout(timer.current);
                setBill({ status: 'idle' });
              }
            }}
          />
        )}
      </Field>
      {isPhone && account.length >= 2 && !operator && (
        <p
          role="alert"
          className="-mt-2 flex items-center gap-1.5 text-xs text-danger-soft-foreground"
        >
          <AlertCircle aria-hidden="true" className="size-3.5" />
          Bunday operator kodi mavjud emas
        </p>
      )}

      {bill.status === 'loading' && (
        <div className="flex items-center gap-3 rounded-xl bg-surface-muted px-3 py-3 text-sm text-text-muted">
          <Spinner size="sm" label="Qarzdorlik tekshirilmoqda" />
          Qarzdorlik tekshirilmoqda...
        </div>
      )}
      {bill.status === 'done' && (
        <div className="rounded-xl border border-border bg-surface-muted/60 px-3">
          <DetailList
            items={[
              { label: 'Abonent', value: bill.bill.holder },
              { label: 'Manzil', value: bill.bill.address },
              {
                label: 'Qarzdorlik',
                value:
                  bill.bill.debt > 0 ? (
                    <Money value={bill.bill.debt} className="text-danger-soft-foreground" />
                  ) : (
                    <span className="text-success-soft-foreground">Qarzdorlik yo&apos;q</span>
                  ),
              },
            ]}
          />
        </div>
      )}
      {noDebt && (
        <p className="rounded-xl bg-success-soft px-3 py-2.5 text-sm text-success-soft-foreground">
          To&apos;lanmagan jarima yoki qarzdorlik topilmadi.
        </p>
      )}

      {!noDebt && (
        <>
          <Field label="Summa" error={errors.amount} required>
            <MoneyInput value={amount} onValueChange={setAmount} max={99_999_999} />
          </Field>
          {service.presets.length > 0 && (
            <div className="-mt-1 flex flex-wrap gap-2">
              {service.presets.map((p) => (
                <Button
                  key={p}
                  type="button"
                  size="sm"
                  variant={amount === p ? 'primary' : 'outline'}
                  onClick={() => setAmount(p)}
                >
                  {formatMoney(p, { currency: false })}
                </Button>
              ))}
            </div>
          )}
          <Field label="Kartadan" error={errors.card} required>
            <Select value={cardId} onValueChange={setCardId} placeholder="Kartani tanlang">
              {active.map((c) => (
                <Select.Item key={c.id} value={c.id}>
                  {c.name} · {brandLabels[c.brand]} {shortCard(c.number)} — {formatMoney(c.balance)}
                </Select.Item>
              ))}
            </Select>
          </Field>
          {!favorite && (
            <div className="flex flex-col gap-3">
              <Checkbox
                checked={save}
                onCheckedChange={setSave}
                label="Sevimlilarga saqlash"
                description="Keyingi safar bir bosishda to'lash uchun"
              />
              {save && (
                <Field label="Nomi" error={errors.label}>
                  <Input
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Masalan: Uy — gaz"
                    maxLength={30}
                  />
                </Field>
              )}
            </div>
          )}
        </>
      )}

      <Dialog.Footer>
        <Dialog.Close asChild>
          <Button variant="ghost" type="button">
            Bekor qilish
          </Button>
        </Dialog.Close>
        <Button type="submit" variant="primary" loading={paying} disabled={noDebt}>
          {amount ? `${formatMoney(amount)} to'lash` : "To'lash"}
        </Button>
      </Dialog.Footer>
    </form>
  );
}

function PaymentDone({ tx, onClose }: { tx: Transaction; onClose: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <span className="inline-flex size-14 items-center justify-center rounded-full bg-success text-success-foreground">
        <Check aria-hidden="true" className="size-7" strokeWidth={3} />
      </span>
      <div role="status">
        <p className="text-lg font-semibold text-text">To&apos;lov qabul qilindi</p>
        <Money value={-tx.amount} className="text-2xl font-bold text-text" />
      </div>
      <div className="w-full rounded-xl border border-dashed border-border-strong px-3 text-left">
        <DetailList
          items={[
            { label: 'Xizmat', value: tx.title },
            { label: 'Hisob', value: tx.counterparty ?? '—' },
            { label: 'Vaqt', value: formatDateTime(tx.date) },
            {
              label: 'ID',
              value: <span className="text-xs tracking-wide tabular-nums">{tx.id}</span>,
            },
          ]}
        />
      </div>
      <Button variant="primary" fullWidth leftIcon={<CircleCheck />} onClick={onClose}>
        Tayyor
      </Button>
    </div>
  );
}

/** Xizmat to'lovi: telefonda pastdan chiqadigan oyna */
export function PaymentDialog({
  preset,
  onClose,
}: {
  preset: PaymentPreset | null;
  onClose: () => void;
}) {
  const [done, setDone] = useState<Transaction | null>(null);
  // Yopilish animatsiyasida kontent yo'qolmasligi uchun oxirgi xizmat saqlanadi
  const [shown, setShown] = useState(preset);
  if (preset && preset !== shown) {
    setShown(preset);
    setDone(null);
  }

  const service = shown?.service;
  return (
    <Dialog open={preset !== null} onOpenChange={(open) => !open && onClose()}>
      {service && (
        <Dialog.Content
          mobileSheet
          size="sm"
          title={done ? "To'lov" : service.title}
          description={done ? undefined : service.provider}
        >
          {!done && (
            <div className="-mt-1 mb-4 flex items-center gap-3">
              <ServiceIcon service={service} />
              {shown?.favorite && (
                <Badge color="primary" size="sm">
                  {shown.favorite.label}
                </Badge>
              )}
            </div>
          )}
          {done ? (
            <PaymentDone tx={done} onClose={onClose} />
          ) : (
            <PaymentForm
              key={`${service.id}-${shown?.favorite?.id ?? ''}`}
              service={service}
              favorite={shown?.favorite}
              onDone={(tx) => {
                setDone(tx);
                toast.success("To'lov bajarildi", {
                  description: `${tx.title}: ${formatMoney(-tx.amount)}`,
                });
              }}
            />
          )}
        </Dialog.Content>
      )}
    </Dialog>
  );
}
