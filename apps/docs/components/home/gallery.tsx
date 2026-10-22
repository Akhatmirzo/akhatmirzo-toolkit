'use client';

import {
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Card,
  Checkbox,
  Field,
  IconButton,
  Kbd,
  MoneyInput,
  PhoneInput,
  Select,
  SelectItem,
  Switch,
  Tooltip,
  toast,
} from '@akhatmirzo/ui';
import { Bell, Copy, Plus } from 'lucide-react';
import { useState } from 'react';
import type { Lang } from '@/lib/i18n';

const text = {
  uz: {
    profile: 'Buyurtma',
    phone: 'Telefon',
    phoneHint: 'SMS kod shu raqamga yuboriladi',
    amount: 'Summa',
    region: 'Viloyat',
    regionPlaceholder: 'Tanlang',
    notify: 'Bildirishnomalar',
    notifyHint: 'Buyurtma holati haqida xabar berish',
    terms: 'Shartlarga roziman',
    submit: 'Buyurtma berish',
    submitted: 'Buyurtma qabul qilindi',
    team: 'Jamoa',
    statuses: ['Faol', 'Kutilmoqda', 'Bekor qilingan'],
    copy: 'Nusxalash',
    notifications: 'Bildirishnomalar',
    add: "Qo'shish",
    search: 'Qidirish',
  },
  en: {
    profile: 'Order',
    phone: 'Phone',
    phoneHint: "We'll text a code to this number",
    amount: 'Amount',
    region: 'Region',
    regionPlaceholder: 'Choose one',
    notify: 'Notifications',
    notifyHint: 'Tell me when the order status changes',
    terms: 'I accept the terms',
    submit: 'Place order',
    submitted: 'Order received',
    team: 'Team',
    statuses: ['Active', 'Pending', 'Cancelled'],
    copy: 'Copy',
    notifications: 'Notifications',
    add: 'Add',
    search: 'Search',
  },
} as const;

/** Bosh sahifadagi jonli mini-galereya — kutubxonaning haqiqiy komponentlari */
export function Gallery({ lang }: { lang: Lang }) {
  const t = text[lang];
  const [phone, setPhone] = useState('901234567');
  const [amount, setAmount] = useState<number | null>(1250000);
  const [notify, setNotify] = useState(true);
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="grid gap-4 font-sans text-text lg:grid-cols-[1.2fr_1fr]">
      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t.profile}</h3>
          <Badge color="success" dot>
            {t.statuses[0]}
          </Badge>
        </div>
        <Field label={t.phone} description={t.phoneHint}>
          <PhoneInput value={phone} onValueChange={setPhone} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.amount}>
            <MoneyInput value={amount} onValueChange={setAmount} />
          </Field>
          <Field label={t.region}>
            <Select defaultValue="tsh" placeholder={t.regionPlaceholder}>
              <SelectItem value="tsh">Toshkent</SelectItem>
              <SelectItem value="sam">Samarqand</SelectItem>
              <SelectItem value="bux">Buxoro</SelectItem>
              <SelectItem value="fer">Farg'ona</SelectItem>
            </Select>
          </Field>
        </div>
        <Switch
          checked={notify}
          onCheckedChange={setNotify}
          label={t.notify}
          description={t.notifyHint}
        />
        <Checkbox checked={agreed} onCheckedChange={setAgreed} label={t.terms} />
        <Button
          variant="primary"
          disabled={!agreed}
          onClick={() => toast.success(t.submitted)}
          fullWidth
        >
          {t.submit}
        </Button>
      </Card>

      <div className="flex flex-col gap-4">
        <Card className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-text-muted">{t.team}</h3>
          <AvatarGroup max={4}>
            <Avatar name="Akhatmirzo" />
            <Avatar name="Dilnoza Karimova" />
            <Avatar name="Sardor Aliyev" />
            <Avatar name="Madina Yusupova" />
            <Avatar name="Jasur Toshmatov" />
            <Avatar name="Nodira Rahimova" />
          </AvatarGroup>
          <div className="flex flex-wrap gap-2">
            <Badge color="success">{t.statuses[0]}</Badge>
            <Badge color="warning">{t.statuses[1]}</Badge>
            <Badge color="danger">{t.statuses[2]}</Badge>
            <Badge color="primary" variant="solid">
              v0.2
            </Badge>
          </div>
        </Card>
        <Card className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Tooltip content={t.copy} shortcut={['mod', 'C']}>
              <IconButton aria-label={t.copy} variant="outline">
                <Copy />
              </IconButton>
            </Tooltip>
            <Tooltip content={t.notifications}>
              <IconButton aria-label={t.notifications} variant="ghost">
                <Bell />
              </IconButton>
            </Tooltip>
            <Button size="sm" leftIcon={<Plus />}>
              {t.add}
            </Button>
          </div>
          <p className="flex items-center gap-2 text-sm text-text-muted">
            {t.search} <Kbd keys={['mod', 'K']} />
          </p>
        </Card>
      </div>
    </div>
  );
}
