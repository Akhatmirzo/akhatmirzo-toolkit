import {
  MONTHS_UZ,
  MONTHS_UZ_SHORT,
  WEEKDAYS_UZ,
  WEEKDAYS_UZ_SHORT,
  formatCardNumber,
  formatDate,
  formatFileSize,
  formatMoney,
  formatNumber,
  formatPhone,
  parseDate,
  timeAgo,
  type MoneyCurrency,
} from '@akhatmirzo/core';
import { Badge, Button, Field, Input } from '@akhatmirzo/ui';
import { useMemo, useState, type ChangeEvent, type ReactNode } from 'react';
import { Code, DemoGrid, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'Formatlash', group: 'Funksiyalar', order: 2 };

const digitsOf = (s: string) => s.replace(/\D/g, '');

/** Natija qatori: chapda chaqiruv, o'ngda qiymat */
function Result({ call, children }: { call: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border py-2 text-sm last:border-b-0">
      <span className="font-mono text-xs text-text-muted">{call}</span>
      <span className="font-mono font-medium text-text tabular-nums">
        {children === '' ? <span className="text-text-subtle">''</span> : children}
      </span>
    </div>
  );
}

/**
 * Yozish paytida formatlash uchun oddiy handler: ajratuvchi o'chirilganda (raqamlar o'zgarmasa)
 * oxirgi raqamni o'chiradi. To'liq kursor boshqaruvi — MaskedInput vazifasi.
 */
function maskedChange(prev: string, format: (digits: string) => string) {
  return (e: ChangeEvent<HTMLInputElement>) => {
    let digits = digitsOf(e.target.value);
    if (e.target.value.length < prev.length && digits === digitsOf(prev)) {
      digits = digits.slice(0, -1);
    }
    return format(digits);
  };
}

function NumberSection() {
  const [raw, setRaw] = useState('1250000.756');
  const [decimals, setDecimals] = useState('');
  const [currency, setCurrency] = useState<MoneyCurrency>("so'm");
  const n = Number(raw.replace(',', '.').replace(/\s/g, ''));
  const dec = decimals === '' ? undefined : Number(decimals);

  return (
    <DemoSection
      title="Son va pul"
      description={
        <>
          Minglik ajratuvchi — oddiy bo'sh joy (NBSP emas), locale'ga bog'liq emas.{' '}
          <Code>formatMoney</Code> default <Code>decimals: 0</Code>.
        </>
      }
    >
      <DemoGrid min={220}>
        <Field label="Son">
          <Input value={raw} onChange={(e) => setRaw(e.target.value)} inputMode="decimal" />
        </Field>
        <Field label="decimals" description="Bo'sh — o'zgartirmaydi">
          <Input
            value={decimals}
            onChange={(e) => setDecimals(digitsOf(e.target.value).slice(0, 2))}
            inputMode="numeric"
            placeholder="—"
          />
        </Field>
      </DemoGrid>
      <DemoRow label="Valyuta">
        {(["so'm", 'UZS', false] as const).map((c) => (
          <Button
            key={String(c)}
            size="sm"
            variant={currency === c ? 'primary' : 'outline'}
            onClick={() => setCurrency(c)}
          >
            {c === false ? 'false' : c}
          </Button>
        ))}
      </DemoRow>
      <div>
        <Result
          call={`formatNumber(${raw || "''"}${dec !== undefined ? `, { decimals: ${dec} }` : ''})`}
        >
          {formatNumber(n, { decimals: dec })}
        </Result>
        <Result call={`formatNumber(n, { separator: ',' })`}>
          {formatNumber(n, { separator: ',', decimals: dec })}
        </Result>
        <Result
          call={`formatMoney(n, { currency: ${currency === false ? 'false' : `'${currency}'`} })`}
        >
          {formatMoney(n, { currency, decimals: dec })}
        </Result>
        <Result call="formatMoney(-99.5, { decimals: 2 })">
          {formatMoney(-99.5, { decimals: 2 })}
        </Result>
        <Result call="formatNumber(NaN)">{formatNumber(NaN)}</Result>
      </div>
    </DemoSection>
  );
}

function PhoneSection() {
  const [phone, setPhone] = useState('');
  const onChange = maskedChange(phone, (d) => formatPhone(d, 'national'));
  const digits = digitsOf(phone);

  return (
    <DemoSection
      title="Telefon"
      description={
        <>
          To'liq bo'lmagan kiritish ham bosqichma-bosqich formatlanadi. <Code>+998</Code> bilan
          joylashtirib ko'ring.
        </>
      }
    >
      <Field label="Telefon raqami" description={`Toza qiymat: ${digits || '—'}`}>
        <Input
          prefix="+998"
          value={phone}
          onChange={(e) => setPhone(onChange(e))}
          onPaste={(e) => {
            e.preventDefault();
            setPhone(formatPhone(e.clipboardData.getData('text'), 'national'));
          }}
          inputMode="tel"
          placeholder="(90) 123-45-67"
          clearable
          onClear={() => setPhone('')}
        />
      </Field>
      <div>
        <Result call="formatPhone(value, 'national')">{formatPhone(digits, 'national')}</Result>
        <Result call="formatPhone(value)">{formatPhone(digits)}</Result>
        <Result call="formatPhone('+998 (90) 123-45-67')">
          {formatPhone('+998 (90) 123-45-67')}
        </Result>
        <Result call="formatPhone('998123456')">{formatPhone('998123456')}</Result>
      </div>
    </DemoSection>
  );
}

const BRANDS: [prefix: string, name: string][] = [
  ['8600', 'Uzcard'],
  ['9860', 'Humo'],
  ['4', 'Visa'],
  ['5', 'Mastercard'],
];

function CardSection() {
  const [card, setCard] = useState('');
  const onChange = maskedChange(card, (d) => formatCardNumber(d.slice(0, 16)));
  const digits = digitsOf(card);
  const brand = BRANDS.find(([p]) => digits.startsWith(p))?.[1];

  return (
    <DemoSection title="Karta raqami" description="4 tadan guruhlanadi, yozish paytida.">
      <Field label="Karta raqami" description={`Toza qiymat: ${digits || '—'}`}>
        <Input
          value={card}
          onChange={(e) => setCard(onChange(e))}
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="0000 0000 0000 0000"
          suffix={brand ? <Badge size="sm">{brand}</Badge> : undefined}
        />
      </Field>
      <div>
        <Result call="formatCardNumber(value)">{formatCardNumber(digits)}</Result>
        <Result call="formatCardNumber('8600-1234-1234-1234')">
          {formatCardNumber('8600-1234-1234-1234')}
        </Result>
      </div>
    </DemoSection>
  );
}

const PATTERNS = [
  'dd.MM.yyyy',
  'd MMMM yyyy',
  'd MMM, EEE',
  'EEEE, d MMMM yyyy [soat] HH:mm',
  'yyyy-MM-dd HH:mm:ss',
  'd.M.yy H:m',
];

const DT_LOCAL = 'yyyy-MM-dd[T]HH:mm';
const toLocalInput = (d: Date) => formatDate(d, DT_LOCAL);

function DateSection() {
  const [value, setValue] = useState(() => toLocalInput(new Date()));
  const [pattern, setPattern] = useState('EEEE, d MMMM yyyy [soat] HH:mm');
  const [parseInput, setParseInput] = useState('31.02.2026');
  const date = parseDate(value, DT_LOCAL) ?? new Date(value);
  const parsed = parseDate(parseInput);

  return (
    <DemoSection
      title="Sana"
      description={
        <>
          Tokenlar: <Code>d dd M MM MMM MMMM yy yyyy H HH m mm ss EEE EEEE</Code>;{' '}
          <Code>[...]</Code> ichidagi matn o'zgarmaydi. Hafta dushanbadan.
        </>
      }
    >
      <DemoGrid min={240}>
        <Field label="Sana va vaqt">
          <Input type="datetime-local" value={value} onChange={(e) => setValue(e.target.value)} />
        </Field>
        <Field label="Shablon">
          <Input value={pattern} onChange={(e) => setPattern(e.target.value)} />
        </Field>
      </DemoGrid>
      <div>
        <Result call={`formatDate(date, '${pattern}')`}>{formatDate(date, pattern)}</Result>
        {PATTERNS.filter((p) => p !== pattern).map((p) => (
          <Result key={p} call={`'${p}'`}>
            {formatDate(date, p)}
          </Result>
        ))}
        <Result call="formatDate('sana emas')">{formatDate('sana emas')}</Result>
      </div>

      <Field label="parseDate (dd.MM.yyyy)">
        <Input
          value={parseInput}
          onChange={(e) => setParseInput(e.target.value)}
          invalid={parseInput !== '' && !parsed}
        />
      </Field>
      <Result call={`parseDate('${parseInput}')`}>
        {parsed ? formatDate(parsed, 'EEEE, d MMMM yyyy') : 'null'}
      </Result>

      <DemoRow label="MONTHS_UZ / MONTHS_UZ_SHORT">
        {MONTHS_UZ.map((m, i) => (
          <Badge key={m} variant="outline">
            {m} · {MONTHS_UZ_SHORT[i]}
          </Badge>
        ))}
      </DemoRow>
      <DemoRow label="WEEKDAYS_UZ / WEEKDAYS_UZ_SHORT">
        {WEEKDAYS_UZ.map((w, i) => (
          <Badge key={w} variant="outline">
            {w} · {WEEKDAYS_UZ_SHORT[i]}
          </Badge>
        ))}
      </DemoRow>
    </DemoSection>
  );
}

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const OFFSETS: [label: string, ms: number][] = [
  ['10 soniya', 10_000],
  ['5 daqiqa', 5 * MIN],
  ['2 soat', 2 * HOUR],
  ['1 kun', DAY],
  ['3 kun', 3 * DAY],
  ['2 hafta', 14 * DAY],
  ['3 oy', 95 * DAY],
  ['1 yil', 400 * DAY],
];

function TimeAgoSection() {
  const now = useMemo(() => new Date(), []);
  const [minutes, setMinutes] = useState('90');
  const custom = new Date(now.getTime() - Number(minutes || 0) * MIN);

  return (
    <DemoSection
      title="timeAgo"
      description="Nisbiy vaqt; sutkadan ko'p farqda kunlar kalendar bo'yicha sanaladi."
    >
      <Field label="Necha daqiqa oldin" description="Manfiy — kelajak">
        <Input
          value={minutes}
          onChange={(e) => setMinutes(e.target.value.replace(/[^\d-]/g, ''))}
          inputMode="numeric"
          suffix="daqiqa"
        />
      </Field>
      <Result call={`timeAgo(now - ${minutes || 0} daqiqa)`}>{timeAgo(custom, now)}</Result>
      <DemoGrid min={260}>
        <div>
          {OFFSETS.map(([label, ms]) => (
            <Result key={label} call={`${label} oldin`}>
              {timeAgo(new Date(now.getTime() - ms), now)}
            </Result>
          ))}
        </div>
        <div>
          {OFFSETS.map(([label, ms]) => (
            <Result key={label} call={`${label} keyin`}>
              {timeAgo(new Date(now.getTime() + ms), now)}
            </Result>
          ))}
        </div>
      </DemoGrid>
    </DemoSection>
  );
}

const SIZES = [0, 512, 12 * 1024, 3.4 * 1024 ** 2, 1.2 * 1024 ** 3, 5 * 1024 ** 4];

function FileSizeSection() {
  const [bytes, setBytes] = useState('3565158');
  const [decimals, setDecimals] = useState(1);
  const n = Number(bytes || 0);

  return (
    <DemoSection title="Fayl hajmi" description="1 KB = 1024 B; ortiqcha nollar tashlanadi.">
      <Field label="Baytlar">
        <Input
          value={bytes}
          onChange={(e) => setBytes(digitsOf(e.target.value).slice(0, 18))}
          inputMode="numeric"
          suffix="B"
        />
      </Field>
      <DemoRow label="decimals">
        {[0, 1, 2].map((d) => (
          <Button
            key={d}
            size="sm"
            variant={decimals === d ? 'primary' : 'outline'}
            onClick={() => setDecimals(d)}
          >
            {d}
          </Button>
        ))}
      </DemoRow>
      <div>
        <Result call={`formatFileSize(${n}, ${decimals})`}>{formatFileSize(n, decimals)}</Result>
        {SIZES.map((s) => (
          <Result
            key={s}
            call={`formatFileSize(${formatNumber(Math.round(s), { separator: '_' })})`}
          >
            {formatFileSize(s)}
          </Result>
        ))}
      </div>
    </DemoSection>
  );
}

export default function Page() {
  return (
    <DemoPage
      title="Formatlash"
      description={
        <>
          <Code>@akhatmirzo/core</Code> — son, pul, telefon, karta, sana, nisbiy vaqt va fayl
          hajmini o'zbekcha formatlash. Sof funksiyalar, SSR-xavfsiz.
        </>
      }
    >
      <NumberSection />
      <PhoneSection />
      <CardSection />
      <DateSection />
      <TimeAgoSection />
      <FileSizeSection />
    </DemoPage>
  );
}
