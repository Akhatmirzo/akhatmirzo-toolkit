'use client';

import { detectCardBrand, formatCardNumber, isValidCardNumber } from '@akhatmirzo/core';
import { Button, CardInput, cn, Dialog, Field, Input, MaskedInput, toast } from '@akhatmirzo/ui';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { BankCardVisual, cardThemes, themeLabels } from '../bank-card';
import { useBank } from '../bank-store';
import {
  brandLabels,
  DEMO_USER,
  hashString,
  testCardNumbers,
  type BankCard,
  type CardTheme,
} from '../data';

const THEMES = Object.keys(cardThemes) as CardTheme[];

/** "MM/YY" muddatini tekshiradi; xato bo'lsa — matn */
function expiryError(raw: string, now: Date) {
  if (raw.length < 4) return "Amal qilish muddatini to'liq kiriting (OO/YY)";
  const month = Number(raw.slice(0, 2));
  const year = 2000 + Number(raw.slice(2));
  if (month < 1 || month > 12) return "Oy 01 dan 12 gacha bo'lishi kerak";
  const end = new Date(year, month, 0, 23, 59);
  if (end < now) return 'Karta muddati tugagan';
  if (year > now.getFullYear() + 10) return "Muddat noto'g'ri";
  return undefined;
}

function AddCardForm({ onDone }: { onDone: () => void }) {
  const { cards, addCard } = useBank();
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [name, setName] = useState('');
  const [theme, setTheme] = useState<CardTheme>('sky');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const brand = detectCardBrand(number);
  const duplicate = !saving && cards.some((c) => c.number === number);
  const errors = {
    number:
      number.length < 16
        ? submitted
          ? "Karta raqamini to'liq kiriting"
          : undefined
        : !isValidCardNumber(number)
          ? "Karta raqami noto'g'ri (nazorat raqami mos emas)"
          : !brand
            ? "Bu to'lov tizimi qo'llab-quvvatlanmaydi"
            : duplicate
              ? "Bu karta allaqachon qo'shilgan"
              : undefined,
    expiry: expiry.length === 4 || submitted ? expiryError(expiry, new Date()) : undefined,
  };

  const preview: BankCard = {
    id: 'preview',
    name: name.trim() || (brand ? `${brandLabels[brand]} karta` : 'Yangi karta'),
    brand: brand ?? 'uzcard',
    number: number.padEnd(16, '0'),
    expiry: expiry.length === 4 ? `${expiry.slice(0, 2)}/${expiry.slice(2)}` : 'OO/YY',
    holder: DEMO_USER.name.toUpperCase(),
    balance: 0,
    theme,
    blocked: false,
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (number.length < 16 || errors.number || expiryError(expiry, new Date()) || !brand) return;
    setSaving(true);
    timer.current = setTimeout(() => {
      // Demo: karta balansi raqamdan "bankdan olinadi"
      const balance = Math.round(((hashString(number) % 9_000) + 500) * 1000);
      // `saving` qaytarilmaydi: oyna yopilish animatsiyasida "allaqachon qo'shilgan" xatosi chiqmasin
      addCard({ ...preview, id: `card-${Date.now()}`, number, balance });
      toast.success("Karta qo'shildi", {
        description: `${preview.name}: ${formatCardNumber(number).slice(0, 4)} •••• ${number.slice(-4)}`,
      });
      onDone();
    }, 1200);
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
      <BankCardVisual card={preview} className="mx-auto max-w-[320px]" />

      <Field label="Karta raqami" error={errors.number} required>
        <CardInput value={number} onValueChange={setNumber} autoFocus />
      </Field>
      <div className="-mt-2 flex flex-wrap items-center gap-1.5 text-xs text-text-muted">
        Sinov uchun:
        {testCardNumbers.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setNumber(n)}
            className="focus-ring rounded-md bg-surface-muted px-1.5 py-0.5 tabular-nums text-text-subtle hover:text-text"
          >
            {n.slice(0, 4)}…{n.slice(-4)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[140px_1fr] items-start gap-3">
        <Field label="Muddati" error={errors.expiry} required>
          <MaskedInput
            mask="99/99"
            placeholder="OO/YY"
            value={expiry}
            onValueChange={setExpiry}
            inputMode="numeric"
            autoComplete="cc-exp"
          />
        </Field>
        <Field label="Karta nomi (ixtiyoriy)">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={24}
            placeholder="Masalan: Oilaviy"
          />
        </Field>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-text">Karta rangi</legend>
        <div className="flex flex-wrap gap-2.5">
          {THEMES.map((t) => (
            <label key={t} className="cursor-pointer">
              <input
                type="radio"
                name="card-theme"
                value={t}
                checked={theme === t}
                onChange={() => setTheme(t)}
                aria-label={themeLabels[t]}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className={cn(
                  'block size-9 rounded-full ring-offset-2 ring-offset-surface transition-shadow duration-base',
                  'peer-checked:ring-2 peer-checked:ring-primary',
                  'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-ring',
                  cardThemes[t],
                )}
              />
            </label>
          ))}
        </div>
      </fieldset>

      <Dialog.Footer>
        <Dialog.Close asChild>
          <Button type="button" variant="ghost">
            Bekor qilish
          </Button>
        </Dialog.Close>
        <Button type="submit" variant="primary" loading={saving}>
          Kartani qo&apos;shish
        </Button>
      </Dialog.Footer>
    </form>
  );
}

export function AddCardDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        mobileSheet
        size="sm"
        title="Karta qo'shish"
        description="Uzcard, Humo, Visa yoki Mastercard kartangizni ulang"
      >
        <AddCardForm onDone={() => onOpenChange(false)} />
      </Dialog.Content>
    </Dialog>
  );
}
