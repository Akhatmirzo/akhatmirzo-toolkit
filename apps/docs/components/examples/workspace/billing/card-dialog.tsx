'use client';

import { CardInput, Button, Dialog, Field, MaskedInput, toast } from '@akhatmirzo/ui';
import { useState, type FormEvent } from 'react';
import type { PaymentCard } from '../data';
import { fakeRequest, useWorkspace } from '../store';

const brandNames = { uzcard: 'Uzcard', humo: 'Humo', visa: 'Visa', mastercard: 'Mastercard' };

/** Amal qilish muddati: "MM/YY", o'tib ketmagan */
function expiryError(raw: string) {
  if (raw.length < 4) return "Muddatni to'liq kiriting: OO/YY";
  const month = Number(raw.slice(0, 2));
  const year = 2000 + Number(raw.slice(2, 4));
  if (month < 1 || month > 12) return "Oy 01–12 oralig'ida bo'lishi kerak";
  const now = new Date();
  if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1))
    return 'Karta muddati tugagan';
  return undefined;
}

export function CardDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <Dialog.Content
          size="sm"
          mobileSheet
          title="To'lov kartasini o'zgartirish"
          description="Obuna to'lovlari shu kartadan yechiladi. Uzcard, Humo, Visa va Mastercard."
        >
          <CardForm onDone={() => onOpenChange(false)} />
        </Dialog.Content>
      )}
    </Dialog>
  );
}

function CardForm({ onDone }: { onDone: () => void }) {
  const { setBilling } = useWorkspace();
  const [number, setNumber] = useState('');
  const [details, setDetails] = useState({
    brand: null as string | null,
    complete: false,
    valid: false,
  });
  const [expiry, setExpiry] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const numberError = !number
    ? 'Karta raqamini kiriting'
    : !details.complete
      ? "Raqam to'liq emas"
      : !details.valid
        ? "Karta raqami noto'g'ri"
        : undefined;
  const expiryErr = expiryError(expiry);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (numberError || expiryErr) return;
    setSaving(true);
    await fakeRequest(1000);
    const card: PaymentCard = {
      brand: details.brand ? brandNames[details.brand as keyof typeof brandNames] : 'Karta',
      last4: number.slice(-4),
      expires: `${expiry.slice(0, 2)}/${expiry.slice(2)}`,
    };
    setBilling((prev) => ({ ...prev, card }));
    toast.success('Karta saqlandi', { description: `${card.brand} •••• ${card.last4}` });
    onDone();
  };

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-5">
      <Field label="Karta raqami" required error={submitted ? numberError : undefined}>
        <CardInput
          value={number}
          onValueChange={(v, d) => {
            setNumber(v);
            setDetails({ brand: d.brand, complete: d.complete, valid: d.valid });
          }}
        />
      </Field>
      <Field label="Amal qilish muddati" required error={submitted ? expiryErr : undefined}>
        <MaskedInput
          mask="99/99"
          placeholder="OO/YY"
          inputMode="numeric"
          autoComplete="cc-exp"
          value={expiry}
          onValueChange={setExpiry}
          className="max-w-32"
        />
      </Field>
      <Dialog.Footer>
        <Dialog.Close asChild>
          <Button variant="ghost" disabled={saving}>
            Bekor qilish
          </Button>
        </Dialog.Close>
        <Button type="submit" variant="primary" loading={saving}>
          Saqlash
        </Button>
      </Dialog.Footer>
    </form>
  );
}
