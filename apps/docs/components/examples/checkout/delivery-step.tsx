'use client';

import { formatMoney } from '@akhatmirzo/core';
import {
  Button,
  Combobox,
  DatePicker,
  Field,
  Input,
  PhoneInput,
  Radio,
  RadioGroup,
  Select,
  Textarea,
  toast,
} from '@akhatmirzo/ui';
import { ArrowRight, Info, MapPin, Package, Store, Truck, type LucideIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { CheckoutShell, StepActions } from './checkout-shell';
import {
  deliveryMethods,
  pickupPoints,
  regionById,
  regions,
  timeSlots,
  type DeliveryMethod,
} from './data';
import {
  MAX_DELIVERY_DAYS,
  addDays,
  fromIsoDate,
  hasErrors,
  isSlotAvailable,
  isSunday,
  startOfDay,
  toIsoDate,
  validateDelivery,
  type DeliveryForm,
} from './forms';
import { deliveryFee } from './pricing';
import { useCheckout } from './store';
import { useCheckoutPath } from './use-checkout-path';

const methodIcons: Record<DeliveryMethod, LucideIcon> = {
  courier: Truck,
  post: Package,
  pickup: Store,
};

/** Xato bo'lgan birinchi maydonga fokus (forma yuborilganda) */
export function focusFirstInvalid() {
  requestAnimationFrame(() => {
    const el = document.querySelector<HTMLElement>(
      'main input[aria-invalid="true"], main button[aria-invalid="true"], main textarea[aria-invalid="true"]',
    );
    el?.focus();
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  });
}

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-xs sm:p-6">
      <h2 className="text-base font-semibold">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-text-muted">{description}</p>}
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </section>
  );
}

export function DeliveryStep() {
  const { delivery, updateDelivery, updatePayment, payment, lines, totals, hydrated } =
    useCheckout();
  const router = useRouter();
  const path = useCheckoutPath();
  const [now] = useState(() => new Date());
  const [showErrors, setShowErrors] = useState(false);

  // Savatcha bo'sh bo'lsa — rasmiylashtirishga hojat yo'q
  useEffect(() => {
    if (hydrated && lines.length === 0) router.replace(path('/cart'));
  }, [hydrated, lines.length, router, path]);

  const errors = validateDelivery(delivery, now);
  const err = (key: keyof DeliveryForm) => (showErrors ? errors[key] : undefined);
  const set = (patch: Partial<DeliveryForm>) => updateDelivery(patch);

  const region = regionById.get(delivery.region);
  const date = fromIsoDate(delivery.date);
  const today = startOfDay(now);
  const afterDiscount = totals.subtotal - totals.discount;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (hasErrors(errors)) {
      setShowErrors(true);
      toast.error('Formada xatolar bor', { description: "Belgilangan maydonlarni to'ldiring." });
      focusFirstInvalid();
      return;
    }
    // Hamyon raqami uchun yetkazib berish telefoni taklif qilinadi
    if (!payment.walletPhone) updatePayment({ walletPhone: delivery.phone });
    router.push(path('/payment'));
  };

  return (
    <CheckoutShell
      step={2}
      title="Yetkazib berish"
      description="Buyurtmani qayerga va qachon olib borishimizni ayting"
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        <FormSection title="Qabul qiluvchi">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ism va familiya" required error={err('name')}>
              <Input
                value={delivery.name}
                onChange={(e) => set({ name: e.target.value })}
                placeholder="Aziz Karimov"
                autoComplete="name"
              />
            </Field>
            <Field
              label="Telefon raqami"
              required
              error={err('phone')}
              description={err('phone') ? undefined : "Kuryer shu raqamga qo'ng'iroq qiladi"}
            >
              <PhoneInput value={delivery.phone} onValueChange={(v) => set({ phone: v })} />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Yetkazib berish usuli">
          <RadioGroup
            aria-label="Yetkazib berish usuli"
            variant="card"
            value={delivery.method}
            onValueChange={(v) => set({ method: v as DeliveryMethod })}
            className="grid sm:grid-cols-3"
          >
            {deliveryMethods.map((m) => {
              const Icon = methodIcons[m.id];
              const fee = deliveryFee(m.id, afterDiscount);
              return (
                <Radio
                  key={m.id}
                  value={m.id}
                  label={
                    <span className="flex items-center gap-2">
                      <Icon aria-hidden="true" className="size-4 text-primary" />
                      {m.label}
                    </span>
                  }
                  description={
                    <>
                      <span className="block">{m.description}</span>
                      <span className="mt-1.5 block font-semibold text-text tabular-nums">
                        {fee === 0 ? 'Bepul' : formatMoney(fee)}
                      </span>
                    </>
                  }
                />
              );
            })}
          </RadioGroup>
        </FormSection>

        {delivery.method === 'pickup' ? (
          <FormSection title="Topshirish punkti" description="Toshkent shahridagi punktlarimiz">
            <Field error={err('pickupPoint')}>
              <RadioGroup
                aria-label="Topshirish punkti"
                variant="card"
                value={delivery.pickupPoint}
                onValueChange={(v) => set({ pickupPoint: v })}
              >
                {pickupPoints.map((p) => (
                  <Radio
                    key={p.id}
                    value={p.id}
                    label={p.name}
                    description={
                      <>
                        <span className="flex items-center gap-1.5">
                          <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
                          {p.address}
                        </span>
                        <span className="mt-0.5 block text-xs">{p.hours}</span>
                      </>
                    }
                  />
                ))}
              </RadioGroup>
            </Field>
          </FormSection>
        ) : (
          <FormSection title="Manzil">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Viloyat" required error={err('region')}>
                <Select
                  value={delivery.region}
                  onValueChange={(v) => set({ region: v, district: null })}
                  placeholder="Viloyatni tanlang"
                >
                  {regions.map((r) => (
                    <Select.Item key={r.id} value={r.id}>
                      {r.name}
                    </Select.Item>
                  ))}
                </Select>
              </Field>
              <Field label="Shahar / tuman" required error={err('district')}>
                <Combobox
                  options={(region?.districts ?? []).map((d) => ({ value: d, label: d }))}
                  value={delivery.district}
                  onValueChange={(v) => set({ district: v })}
                  disabled={!region}
                  placeholder={region ? 'Tanlang yoki qidiring' : 'Avval viloyatni tanlang'}
                  searchPlaceholder="Tuman nomi…"
                  emptyText="Bunday tuman topilmadi"
                />
              </Field>
            </div>
            <Field label="Ko'cha, uy, xonadon" required error={err('address')}>
              <Input
                value={delivery.address}
                onChange={(e) => set({ address: e.target.value })}
                placeholder="Bunyodkor ko'chasi, 12-uy, 45-xonadon"
                autoComplete="street-address"
                leftIcon={<MapPin aria-hidden="true" />}
              />
            </Field>
            <Field
              label="Kuryer uchun izoh"
              description="Mo'ljal, podyezd, domofon kodi — ixtiyoriy"
            >
              <Textarea
                value={delivery.note}
                onChange={(e) => set({ note: e.target.value })}
                autoResize
                minRows={2}
                maxRows={4}
                showCount
                maxLength={200}
                placeholder="Masalan: 3-podyezd, domofon 45K"
              />
            </Field>
          </FormSection>
        )}

        {delivery.method === 'post' ? (
          <div className="flex gap-3 rounded-xl border border-info-soft bg-info-soft/60 p-4 text-sm text-info-soft-foreground">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <p>
              Pochta orqali jo'natma 3–5 ish kunida yetib boradi. Kelganda pochta bo'limidan SMS
              xabar olasiz.
            </p>
          </div>
        ) : (
          <FormSection
            title={delivery.method === 'pickup' ? 'Olib ketish sanasi' : 'Yetkazib berish vaqti'}
            description={`Yakshanba — dam olish kuni. ${MAX_DELIVERY_DAYS} kun ichidagi sanani tanlang.`}
          >
            <Field label="Sana" required error={err('date')} className="sm:max-w-xs">
              <DatePicker
                value={date}
                onValueChange={(d) => set({ date: d ? toIsoDate(d) : null })}
                minDate={today}
                maxDate={addDays(today, MAX_DELIVERY_DAYS)}
                disabledDates={isSunday}
                today={now}
                presets
              />
            </Field>
            {delivery.method === 'courier' && (
              <Field label="Vaqt oralig'i" required error={err('slot')}>
                <RadioGroup
                  variant="card"
                  size="sm"
                  value={delivery.slot}
                  onValueChange={(v) => set({ slot: v })}
                  className="grid grid-cols-2 sm:grid-cols-4"
                >
                  {timeSlots.map((s) => {
                    const available = isSlotAvailable(s.id, date, now);
                    return (
                      <Radio
                        key={s.id}
                        value={s.id}
                        disabled={!available}
                        label={<span className="tabular-nums">{s.label}</span>}
                        description={available ? undefined : "O'tib ketgan"}
                        className="p-3"
                      />
                    );
                  })}
                </RadioGroup>
              </Field>
            )}
          </FormSection>
        )}

        <StepActions backHref={path('/cart')} backLabel="Savatcha">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            rightIcon={<ArrowRight aria-hidden="true" />}
          >
            To'lovga o'tish
          </Button>
        </StepActions>
      </form>
    </CheckoutShell>
  );
}
