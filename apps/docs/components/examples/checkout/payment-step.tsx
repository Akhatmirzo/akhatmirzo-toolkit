'use client';

import { formatMoney, formatPhone, type CardBrand } from '@akhatmirzo/core';
import {
  Button,
  CardBrandMark,
  CardInput,
  Checkbox,
  Field,
  Input,
  MaskedInput,
  PhoneInput,
  Radio,
  RadioGroup,
  cn,
  confirm,
  getCardDetails,
  toast,
} from '@akhatmirzo/ui';
import {
  Banknote,
  CircleAlert,
  CreditCard,
  FlaskConical,
  Lock,
  Smartphone,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { CheckoutShell, StepActions } from './checkout-shell';
import { TEST_CARDS, paymentMethods, type PaymentMethod } from './data';
import { FormSection, focusFirstInvalid } from './delivery-step';
import { hasErrors, validateDelivery, validatePayment, type PaymentForm } from './forms';
import { OtpDialog } from './otp-dialog';
import { useCheckout, type Order } from './store';
import { useCheckoutPath } from './use-checkout-path';

const methodIcons: Record<PaymentMethod, { icon: LucideIcon; className: string }> = {
  card: { icon: CreditCard, className: 'bg-primary-soft text-primary-soft-foreground' },
  click: { icon: Smartphone, className: 'bg-info-soft text-info-soft-foreground' },
  payme: { icon: Wallet, className: 'bg-success-soft text-success-soft-foreground' },
  cash: { icon: Banknote, className: 'bg-warning-soft text-warning-soft-foreground' },
};

const brandNames: Record<CardBrand, string> = {
  uzcard: 'Uzcard',
  humo: 'Humo',
  visa: 'Visa',
  mastercard: 'Mastercard',
};

/** "+998 90 123 45 67" → "+998 90 *** ** 67" */
const maskPhone = (phone: string) =>
  formatPhone(phone).replace(/(\d{3}) (\d{2}) (\d{2})$/, '*** ** $3');

export function PaymentStep() {
  const ctx = useCheckout();
  const { payment, updatePayment, delivery, lines, totals, hydrated, savedCard } = ctx;
  const router = useRouter();
  const path = useCheckoutPath();
  const [now] = useState(() => new Date());
  const [showErrors, setShowErrors] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [otpSession, setOtpSession] = useState(0);
  const [otpOpen, setOtpOpen] = useState(false);
  const [placing, setPlacing] = useState(false);

  const deliveryValid = !hasErrors(validateDelivery(delivery, now));
  // Oldingi bosqichlar to'ldirilmagan bo'lsa — o'sha yerga qaytaramiz
  useEffect(() => {
    if (!hydrated || placing) return;
    if (lines.length === 0) router.replace(path('/cart'));
    else if (!deliveryValid) router.replace(path('/delivery'));
  }, [hydrated, placing, lines.length, deliveryValid, router, path]);

  const usingSaved = payment.method === 'card' && payment.useSaved && Boolean(savedCard);
  const errors = validatePayment(payment, {
    now,
    delivery: delivery.method,
    hasSavedCard: Boolean(savedCard),
  });
  const err = (key: keyof PaymentForm) => (showErrors ? errors[key] : undefined);
  const set = (patch: Partial<PaymentForm>) => {
    updatePayment(patch);
    if (declined) setDeclined(false);
  };

  const smsPhone =
    payment.method === 'click' || payment.method === 'payme' ? payment.walletPhone : delivery.phone;

  const paymentLabel = (): Order['payment'] => {
    if (payment.method !== 'card') return { method: payment.method };
    if (usingSaved && savedCard)
      return {
        method: 'card',
        card: `${savedCard.brand ? brandNames[savedCard.brand] : 'Karta'} •••• ${savedCard.last4}`,
      };
    const brand = getCardDetails(payment.cardNumber).brand;
    return {
      method: 'card',
      card: `${brand ? brandNames[brand] : 'Karta'} •••• ${payment.cardNumber.slice(-4)}`,
    };
  };

  const finish = () => {
    if (payment.method === 'card' && !usingSaved && payment.saveCard) {
      ctx.setSavedCard({
        brand: getCardDetails(payment.cardNumber).brand,
        last4: payment.cardNumber.slice(-4),
        holder: payment.holder.trim().toUpperCase(),
      });
    }
    setPlacing(true);
    const order = ctx.placeOrder(paymentLabel());
    toast.success('Buyurtma qabul qilindi', { description: `Raqami: ${order.number}` });
    router.push(path('/success'));
  };

  // OTP tasdiqlangandan keyin bank javobi (demo: maxsus karta rad etiladi)
  const onVerified = async () => {
    await new Promise((r) => setTimeout(r, 700));
    if (
      payment.method === 'card' &&
      !usingSaved &&
      payment.cardNumber === TEST_CARDS.declined.number
    ) {
      setOtpOpen(false);
      setDeclined(true);
      toast.error("To'lov rad etildi", { description: "Kartada mablag' yetarli emas." });
      return;
    }
    setOtpOpen(false);
    finish();
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (hasErrors(errors)) {
      setShowErrors(true);
      focusFirstInvalid();
      return;
    }
    if (payment.method === 'cash') {
      const ok = await confirm({
        title: 'Buyurtmani tasdiqlaysizmi?',
        description: `${formatMoney(totals.total)} buyurtmani qabul qilganingizda naqd yoki terminal orqali to'lanadi.`,
        confirmText: 'Tasdiqlash',
        onConfirm: () => new Promise((r) => setTimeout(r, 800)),
      });
      if (ok) finish();
      return;
    }
    setOtpSession((n) => n + 1);
    setOtpOpen(true);
  };

  const fillTestCard = (kind: keyof typeof TEST_CARDS) => {
    const card = TEST_CARDS[kind];
    set({ cardNumber: card.number, expiry: card.expiry, holder: card.holder, useSaved: false });
  };

  const removeSavedCard = async () => {
    const ok = await confirm({
      title: "Saqlangan kartani o'chirasizmi?",
      description: "Keyingi xaridlarda karta ma'lumotlarini qayta kiritishingiz kerak bo'ladi.",
      confirmText: "O'chirish",
      variant: 'danger',
    });
    if (!ok) return;
    ctx.setSavedCard(null);
    set({ useSaved: false });
    toast.success("Karta o'chirildi");
  };

  return (
    <CheckoutShell
      step={3}
      title="To'lov"
      description="To'lov usulini tanlang va buyurtmani tasdiqlang"
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        {declined && (
          <div
            role="alert"
            className="flex gap-3 rounded-xl border border-danger-soft bg-danger-soft/60 p-4 text-sm text-danger-soft-foreground"
          >
            <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-semibold">To'lov rad etildi</p>
              <p className="mt-0.5">
                Bank kartada mablag' yetarli emasligini bildirdi. Boshqa karta yoki to'lov usulini
                tanlang.
              </p>
            </div>
          </div>
        )}

        <FormSection title="To'lov usuli">
          <Field error={err('method')}>
            <RadioGroup
              aria-label="To'lov usuli"
              variant="card"
              value={payment.method}
              onValueChange={(v) => set({ method: v as PaymentMethod })}
              className="grid sm:grid-cols-2"
            >
              {paymentMethods.map((m) => {
                const { icon: Icon, className } = methodIcons[m.id];
                const unavailable = m.id === 'cash' && delivery.method === 'post';
                return (
                  <Radio
                    key={m.id}
                    value={m.id}
                    disabled={unavailable}
                    label={
                      <span className="flex items-center gap-2.5">
                        <span
                          className={cn(
                            'flex size-8 items-center justify-center rounded-lg',
                            className,
                          )}
                        >
                          <Icon aria-hidden="true" className="size-4" />
                        </span>
                        {m.label}
                      </span>
                    }
                    description={
                      unavailable ? 'Pochta orqali yuborishda mavjud emas' : m.description
                    }
                  />
                );
              })}
            </RadioGroup>
          </Field>
        </FormSection>

        {payment.method === 'card' && (
          <FormSection title="Karta ma'lumotlari" description="Karta raqami brauzerda saqlanmaydi">
            {savedCard && (
              <RadioGroup
                aria-label="Qaysi karta bilan to'lash"
                variant="card"
                value={usingSaved ? 'saved' : 'new'}
                onValueChange={(v) => set({ useSaved: v === 'saved' })}
                className="grid sm:grid-cols-2"
              >
                <Radio
                  value="saved"
                  label={
                    <span className="flex items-center gap-2 tabular-nums">
                      {savedCard.brand && <CardBrandMark brand={savedCard.brand} />}
                      •••• {savedCard.last4}
                    </span>
                  }
                  description={savedCard.holder}
                />
                <Radio
                  value="new"
                  label="Yangi karta"
                  description="Boshqa karta raqamini kiritish"
                />
              </RadioGroup>
            )}

            {usingSaved ? (
              <button
                type="button"
                onClick={removeSavedCard}
                className="focus-ring self-start rounded-sm text-sm font-medium text-danger-soft-foreground hover:underline"
              >
                Saqlangan kartani o'chirish
              </button>
            ) : (
              <>
                <Field label="Karta raqami" required error={err('cardNumber')}>
                  <CardInput
                    value={payment.cardNumber}
                    onValueChange={(v) => set({ cardNumber: v })}
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
                  <Field label="Amal qilish muddati" required error={err('expiry')}>
                    <MaskedInput
                      mask="99/99"
                      value={payment.expiry}
                      onValueChange={(v) => set({ expiry: v })}
                      placeholder="OO/YY"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      inputClassName="tabular-nums"
                    />
                  </Field>
                  <Field label="Karta egasi" required error={err('holder')}>
                    <Input
                      value={payment.holder}
                      onChange={(e) => set({ holder: e.target.value.toUpperCase() })}
                      placeholder="AZIZ KARIMOV"
                      autoComplete="cc-name"
                      inputClassName="uppercase"
                    />
                  </Field>
                </div>
                <Checkbox
                  checked={payment.saveCard}
                  onCheckedChange={(c) => set({ saveCard: c })}
                  label="Kartani keyingi xaridlar uchun saqlash"
                  description="Faqat oxirgi 4 raqam saqlanadi"
                />
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg bg-surface-muted px-3 py-2.5 text-xs text-text-muted">
                  <FlaskConical aria-hidden="true" className="size-4 shrink-0" />
                  <span>Sinov uchun:</span>
                  <button
                    type="button"
                    onClick={() => fillTestCard('success')}
                    className="focus-ring rounded-sm font-medium text-link hover:underline"
                  >
                    muvaffaqiyatli karta
                  </button>
                  <button
                    type="button"
                    onClick={() => fillTestCard('declined')}
                    className="focus-ring rounded-sm font-medium text-link hover:underline"
                  >
                    rad etiladigan karta
                  </button>
                </div>
              </>
            )}
          </FormSection>
        )}

        {(payment.method === 'click' || payment.method === 'payme') && (
          <FormSection
            title={payment.method === 'click' ? 'Click hamyoni' : 'Payme hamyoni'}
            description="Tasdiqlash kodi shu raqamga SMS orqali keladi"
          >
            <Field
              label="Hamyonga ulangan raqam"
              required
              error={err('walletPhone')}
              className="sm:max-w-xs"
            >
              <PhoneInput
                value={payment.walletPhone}
                onValueChange={(v) => set({ walletPhone: v })}
              />
            </Field>
          </FormSection>
        )}

        {payment.method === 'cash' && (
          <div className="flex gap-3 rounded-xl border border-warning-soft bg-warning-soft/60 p-4 text-sm text-warning-soft-foreground">
            <Banknote aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <p>
              Iltimos, {formatMoney(totals.total)} ni tayyorlab qo'ying. Kuryerda to'lov terminali
              ham bor.
            </p>
          </div>
        )}

        <div>
          <Checkbox
            checked={payment.agree}
            onCheckedChange={(c) => set({ agree: c })}
            invalid={Boolean(err('agree'))}
            label="Ommaviy oferta va qaytarish shartlariga roziman"
            description="14 kun ichida mahsulotni bepul qaytarish mumkin"
          />
          {err('agree') && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-danger-soft-foreground">
              <CircleAlert aria-hidden="true" className="size-3.5" />
              {err('agree')}
            </p>
          )}
        </div>

        <StepActions backHref={path('/delivery')} backLabel="Yetkazish">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            leftIcon={<Lock aria-hidden="true" />}
            className="tabular-nums"
          >
            {payment.method === 'cash' ? 'Buyurtma berish' : `${formatMoney(totals.total)} to'lash`}
          </Button>
        </StepActions>
      </form>

      <OtpDialog
        key={otpSession}
        open={otpOpen}
        onOpenChange={setOtpOpen}
        phone={maskPhone(smsPhone)}
        amount={totals.total}
        onVerified={onVerified}
      />
    </CheckoutShell>
  );
}
