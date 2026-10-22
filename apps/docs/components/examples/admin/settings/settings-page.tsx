'use client';

import { isValidEmail, isValidPhone } from '@akhatmirzo/core';
import {
  Button,
  Card,
  Checkbox,
  Divider,
  Field,
  Input,
  MoneyInput,
  PhoneInput,
  Select,
  SelectItem,
  Switch,
  Tabs,
  Textarea,
  toast,
} from '@akhatmirzo/ui';
import { CreditCard, RotateCcw, Store, Truck, BellRing } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
import { PAYMENT_METHODS, REGIONS, type StoreSettings } from '../data';
import { PAYMENT_LABEL } from '../meta';
import { useResetDemo } from '../shell/user-menu';
import { useAdmin } from '../store';
import { PageHeader, wait } from '../ui';

type Errors = Partial<Record<'name' | 'email' | 'phone' | 'address', string>>;

function validate(s: StoreSettings): Errors {
  const errors: Errors = {};
  if (!s.name.trim()) errors.name = "Do'kon nomini kiriting";
  if (!isValidEmail(s.email)) errors.email = "Email noto'g'ri";
  if (!isValidPhone(s.phone)) errors.phone = "Telefon raqam to'liq emas yoki noto'g'ri";
  if (!s.address.trim()) errors.address = 'Manzilni kiriting';
  return errors;
}

const PAYMENT_HINT: Record<string, string> = {
  click: 'Click ilovasi va USSD orqali',
  payme: 'Payme ilovasi va saytdagi karta formasi',
  uzcard: "Uzcard kartalari bilan to'g'ridan-to'g'ri",
  humo: "Humo kartalari bilan to'g'ridan-to'g'ri",
  cash: "Yetkazib berilganda kuryerga naqd to'lov",
};

/** Kartadagi sarlavha va ichki qism */
function Section({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card padding="none">
      <div className="flex items-start gap-3 border-b border-border p-5">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary-soft-foreground [&>svg]:size-[18px]">
          {icon}
        </span>
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="text-sm text-text-muted">{description}</p>
        </div>
      </div>
      <div className="flex flex-col gap-5 p-5">{children}</div>
    </Card>
  );
}

export function SettingsPage() {
  const { settings, saveSettings } = useAdmin();
  // Bo'lim tanlovi tashqarida — saqlangandan keyin forma qayta boshlansa ham joyida qoladi
  const [tab, setTab] = useState('general');
  return (
    <SettingsForm
      key={JSON.stringify(settings)}
      initial={settings}
      onSave={saveSettings}
      tab={tab}
      onTabChange={setTab}
    />
  );
}

function SettingsForm({
  initial,
  onSave,
  tab,
  onTabChange: setTab,
}: {
  initial: StoreSettings;
  onSave: (s: StoreSettings) => void;
  tab: string;
  onTabChange: (tab: string) => void;
}) {
  const [values, setValues] = useState(initial);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const reset = useResetDemo();
  const dirty = JSON.stringify(values) !== JSON.stringify(initial);
  const errors = submitted ? validate(values) : {};

  const set = <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const toggleRegion = (region: string, on: boolean) =>
    set(
      'deliveryRegions',
      on
        ? REGIONS.filter((r) => r === region || values.deliveryRegions.includes(r))
        : values.deliveryRegions.filter((r) => r !== region),
    );

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(validate(values)).length) {
      setTab('general');
      toast.error("Ba'zi maydonlar noto'g'ri", { description: "«Umumiy» bo'limini tekshiring." });
      return;
    }
    if (!Object.values(values.payments).some(Boolean)) {
      setTab('payment');
      toast.error("Kamida bitta to'lov usulini yoqing");
      return;
    }
    setSaving(true);
    await wait(700); // soxta server
    setSaving(false);
    onSave(values);
    toast.success('Sozlamalar saqlandi');
  };

  const allRegions = values.deliveryRegions.length === REGIONS.length;

  return (
    <form noValidate onSubmit={submit} className="pb-24">
      <PageHeader
        title="Sozlamalar"
        description="Do'kon ma'lumotlari, to'lov va yetkazib berish qoidalari."
      />

      <Tabs value={tab} onValueChange={setTab}>
        <Tabs.List aria-label="Sozlamalar bo'limlari">
          <Tabs.Trigger value="general">Umumiy</Tabs.Trigger>
          <Tabs.Trigger value="payment">To&apos;lov</Tabs.Trigger>
          <Tabs.Trigger value="delivery">Yetkazib berish</Tabs.Trigger>
          <Tabs.Trigger value="notifications">Bildirishnomalar</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="general" className="flex flex-col gap-4">
          <Section
            icon={<Store />}
            title="Do'kon ma'lumotlari"
            description="Mijozlar chekda va saytda ko'radigan ma'lumotlar."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Do'kon nomi" required error={errors.name}>
                <Input value={values.name} onChange={(e) => set('name', e.target.value)} />
              </Field>
              <Field label="Email" required error={errors.email}>
                <Input
                  type="email"
                  value={values.email}
                  onChange={(e) => set('email', e.target.value)}
                />
              </Field>
              <Field label="Telefon" required error={errors.phone}>
                <PhoneInput value={values.phone} onValueChange={(v) => set('phone', v)} />
              </Field>
              <Field label="Viloyat">
                <Select value={values.region} onValueChange={(v) => set('region', v)}>
                  {REGIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Manzil" required error={errors.address}>
              <Input value={values.address} onChange={(e) => set('address', e.target.value)} />
            </Field>
            <Field label="Do'kon haqida" description="Saytning «Biz haqimizda» bo'limida ko'rinadi">
              <Textarea
                value={values.about}
                onChange={(e) => set('about', e.target.value)}
                autoResize
                minRows={3}
                maxLength={400}
                showCount
              />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Valyuta">
                <Select
                  value={values.currency}
                  onValueChange={(v) => set('currency', v as StoreSettings['currency'])}
                >
                  <SelectItem value="UZS">O&apos;zbek so&apos;mi (UZS)</SelectItem>
                  <SelectItem value="USD">AQSh dollari (USD)</SelectItem>
                </Select>
              </Field>
              <Field label="Sayt tili">
                <Select
                  value={values.language}
                  onValueChange={(v) => set('language', v as StoreSettings['language'])}
                >
                  <SelectItem value="uz">O&apos;zbekcha</SelectItem>
                  <SelectItem value="ru">Ruscha</SelectItem>
                </Select>
              </Field>
            </div>
          </Section>

          <Card padding="none" className="border-danger-soft">
            <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold">Demo ma&apos;lumotlari</h2>
                <p className="text-sm text-text-muted">
                  Barcha o&apos;zgarishlarni bekor qilib, boshlang&apos;ich ma&apos;lumotlarni
                  tiklash.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="text-danger"
                leftIcon={<RotateCcw aria-hidden="true" />}
                onClick={() => void reset()}
              >
                Ma&apos;lumotlarni tiklash
              </Button>
            </div>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="payment">
          <Section
            icon={<CreditCard />}
            title="To'lov usullari"
            description="Mijozlar buyurtma berishda qaysi usullarni ko'radi."
          >
            <div className="flex flex-col gap-4">
              {PAYMENT_METHODS.map((m, i) => (
                <div key={m}>
                  {i > 0 && <Divider className="mb-4" />}
                  <Switch
                    checked={values.payments[m]}
                    onCheckedChange={(on) => set('payments', { ...values.payments, [m]: on })}
                    label={PAYMENT_LABEL[m]}
                    description={PAYMENT_HINT[m]}
                  />
                </div>
              ))}
            </div>
            <Divider />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Minimal buyurtma summasi"
                description="Bundan kam summada buyurtma qabul qilinmaydi"
              >
                <MoneyInput value={values.minOrder} onValueChange={(v) => set('minOrder', v)} />
              </Field>
            </div>
            <Switch
              checked={values.taxIncluded}
              onCheckedChange={(v) => set('taxIncluded', v)}
              label="Narxlarga QQS kiritilgan"
              description="Chekda QQS (12%) alohida qator sifatida ko'rsatiladi"
            />
          </Section>
        </Tabs.Content>

        <Tabs.Content value="delivery">
          <Section icon={<Truck />} title="Yetkazib berish" description="Narx, muddat va hududlar.">
            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Yetkazib berish narxi">
                <MoneyInput
                  value={values.deliveryFee}
                  onValueChange={(v) => set('deliveryFee', v)}
                />
              </Field>
              <Field label="Bepul yetkazish" description="Shu summadan boshlab">
                <MoneyInput
                  value={values.freeDeliveryFrom}
                  onValueChange={(v) => set('freeDeliveryFrom', v)}
                />
              </Field>
              <Field label="Muddat">
                <Select
                  value={values.deliveryTime}
                  onValueChange={(v) => set('deliveryTime', v as StoreSettings['deliveryTime'])}
                >
                  <SelectItem value="same-day">Shu kuni</SelectItem>
                  <SelectItem value="next-day">Ertasi kuni</SelectItem>
                  <SelectItem value="2-3-days">2–3 kun</SelectItem>
                </Select>
              </Field>
            </div>
            <Switch
              checked={values.pickup}
              onCheckedChange={(v) => set('pickup', v)}
              label="Do'kondan olib ketish"
              description="Mijoz buyurtmani do'kondan o'zi olib ketishi mumkin"
            />
            <Divider />
            <fieldset>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <legend className="text-sm font-medium">
                  Yetkazib beriladigan hududlar ({values.deliveryRegions.length}/{REGIONS.length})
                </legend>
                <Checkbox
                  checked={
                    allRegions ? true : values.deliveryRegions.length ? 'indeterminate' : false
                  }
                  onCheckedChange={(on) => set('deliveryRegions', on ? [...REGIONS] : [])}
                  label="Hammasi"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {REGIONS.map((r) => (
                  <Checkbox
                    key={r}
                    checked={values.deliveryRegions.includes(r)}
                    onCheckedChange={(on) => toggleRegion(r, on)}
                    label={r}
                  />
                ))}
              </div>
            </fieldset>
          </Section>
        </Tabs.Content>

        <Tabs.Content value="notifications">
          <Section
            icon={<BellRing />}
            title="Bildirishnomalar"
            description="Qachon va qayerga xabar yuborilsin."
          >
            <p className="text-sm font-medium">Yangi buyurtma kelganda</p>
            <Switch
              checked={values.notifyNewOrderEmail}
              onCheckedChange={(v) => set('notifyNewOrderEmail', v)}
              label="Email"
              description={values.email}
            />
            <Switch
              checked={values.notifyNewOrderSms}
              onCheckedChange={(v) => set('notifyNewOrderSms', v)}
              label="SMS"
              description="Har bir SMS uchun 50 so'm"
            />
            <Switch
              checked={values.notifyNewOrderTelegram}
              onCheckedChange={(v) => set('notifyNewOrderTelegram', v)}
              label="Telegram bot"
              description="@chorsumarket_admin_bot orqali"
            />
            <Divider />
            <Switch
              checked={values.lowStockAlert}
              onCheckedChange={(v) => set('lowStockAlert', v)}
              label="Omborda kam qolganda ogohlantirish"
            />
            <Field
              label="Chegara"
              description="Shundan kam qolsa — «Kam qoldi» belgisi"
              className="sm:max-w-xs"
            >
              <Input
                inputMode="numeric"
                suffix="dona"
                disabled={!values.lowStockAlert}
                value={values.lowStockThreshold ?? ''}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                  set('lowStockThreshold', digits ? Number(digits) : null);
                }}
              />
            </Field>
            <Divider />
            <Switch
              checked={values.dailyReport}
              onCheckedChange={(v) => set('dailyReport', v)}
              label="Kunlik hisobot"
              description="Har kuni 21:00 da savdo yakunlari emailga yuboriladi"
            />
          </Section>
        </Tabs.Content>
      </Tabs>

      {/* Saqlanmagan o'zgarishlar paneli */}
      <div
        aria-hidden={!dirty}
        className={`fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 px-4 py-3 shadow-lg backdrop-blur transition-[translate,opacity] duration-slow ease-out lg:left-64 ${
          dirty ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 sm:px-2 lg:px-4">
          <p className="text-sm font-medium" role="status">
            {dirty ? "Saqlanmagan o'zgarishlar bor" : ''}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              tabIndex={dirty ? 0 : -1}
              disabled={saving}
              onClick={() => {
                setValues(initial);
                setSubmitted(false);
              }}
            >
              Bekor qilish
            </Button>
            <Button type="submit" variant="primary" loading={saving} tabIndex={dirty ? 0 : -1}>
              Saqlash
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
