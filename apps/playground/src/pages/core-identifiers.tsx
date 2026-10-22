import {
  UZ_REGIONS,
  formatBankAccount,
  formatCarPlate,
  formatDate,
  formatInn,
  formatPassport,
  formatPinfl,
  isValidBankAccount,
  isValidInn,
  isValidMfo,
  isValidPassport,
  isValidPinfl,
  parseCarPlate,
  parsePinfl,
} from '@akhatmirzo/core';
import { Badge, Field, Input, Switch } from '@akhatmirzo/ui';
import { useState } from 'react';
import { Code, DemoGrid, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'Identifikatorlar', group: 'Funksiyalar', order: 3.5 };

function Status({ ok, empty, label }: { ok: boolean; empty: boolean; label?: string }) {
  return (
    <Badge color={empty ? 'neutral' : ok ? 'success' : 'danger'} dot>
      {empty ? "Bo'sh" : ok ? (label ?? "To'g'ri") : "Noto'g'ri"}
    </Badge>
  );
}

function PinflDemo() {
  const [value, setValue] = useState('31503901234567');
  const [checksum, setChecksum] = useState(false);
  const info = parsePinfl(value, { checksum });
  return (
    <DemoSection
      title="JShShIR (PINFL)"
      description={
        <>
          <Code>parsePinfl</Code> → jins va tug'ilgan sana; <Code>formatPinfl</Code> — ko'rsatish
          uchun. Sinab ko'ring: 42512991234567 (ayol, 1999), 33102901234567 (31-fevral — xato),
          31503901234562 (nazorat raqami to'g'ri).
        </>
      }
    >
      <DemoGrid min={260}>
        <Field label="JShShIR" description={formatPinfl(value) || '—'}>
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            inputMode="numeric"
            clearable
            onClear={() => setValue('')}
          />
        </Field>
        <div className="flex flex-col gap-3 text-sm">
          <Switch
            checked={checksum}
            onCheckedChange={setChecksum}
            label="checksum (7-3-1, tasdiqlanmagan)"
          />
          <DemoRow label="Natija">
            <Status ok={isValidPinfl(value, { checksum })} empty={!value.trim()} />
            {info && <Badge color="info">{info.gender === 'male' ? 'Erkak' : 'Ayol'}</Badge>}
            {info && <Badge color="info">{formatDate(info.birthDate)}</Badge>}
          </DemoRow>
        </div>
      </DemoGrid>
    </DemoSection>
  );
}

function DocumentsDemo() {
  const [inn, setInn] = useState('123456789');
  const [passport, setPassport] = useState('aa1234567');
  const [account, setAccount] = useState('20208000900012345001');
  const [mfo, setMfo] = useState('00014');

  const rows = [
    {
      label: 'STIR (INN)',
      value: inn,
      set: setInn,
      ok: isValidInn(inn),
      formatted: formatInn(inn),
      hint: '9 raqam, 0 bilan boshlanmaydi',
    },
    {
      label: 'Pasport / ID karta',
      value: passport,
      set: setPassport,
      ok: isValidPassport(passport),
      formatted: formatPassport(passport),
      hint: '2 lotin harf + 7 raqam',
    },
    {
      label: 'Bank hisob raqami',
      value: account,
      set: setAccount,
      ok: isValidBankAccount(account),
      formatted: formatBankAccount(account),
      hint: '20 raqam',
    },
    { label: 'MFO', value: mfo, set: setMfo, ok: isValidMfo(mfo), formatted: mfo, hint: '5 raqam' },
  ];

  return (
    <DemoSection
      title="STIR, pasport, bank rekvizitlari"
      description={
        <>
          <Code>isValidX</Code> + <Code>formatX</Code>. Bo'shliq va chiziqchalar e'tiborsiz
          qoldiriladi.
        </>
      }
    >
      <DemoGrid min={260}>
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-2">
            <Field label={row.label} description={row.hint}>
              <Input value={row.value} onChange={(e) => row.set(e.target.value)} />
            </Field>
            <DemoRow>
              <Status ok={row.ok} empty={!row.value.trim()} />
              <Code>{row.formatted || '—'}</Code>
            </DemoRow>
          </div>
        ))}
      </DemoGrid>
    </DemoSection>
  );
}

function CarPlateDemo() {
  const [value, setValue] = useState('01a123bc');
  const info = parseCarPlate(value);
  return (
    <DemoSection
      title="Avtomobil raqami"
      description={
        <>
          <Code>parseCarPlate</Code> — jismoniy «01 A 123 BC» yoki yuridik «01 123 ABC»; hudud kodi{' '}
          <Code>UZ_REGIONS</Code> da bo'lishi shart.
        </>
      }
    >
      <DemoGrid min={260}>
        <Field label="Davlat raqami" description={formatCarPlate(value) || '—'}>
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            clearable
            onClear={() => setValue('')}
          />
        </Field>
        <DemoRow label="Natija">
          <Status ok={info !== null} empty={!value.trim()} />
          {info && (
            <Badge color="info">
              {info.type === 'personal' ? 'Jismoniy shaxs' : 'Yuridik shaxs'}
            </Badge>
          )}
          {info && <Badge color="info">{info.region.name}</Badge>}
        </DemoRow>
      </DemoGrid>
    </DemoSection>
  );
}

function RegionsDemo() {
  return (
    <DemoSection
      title="UZ_REGIONS"
      description={
        <>
          14 ta hudud: <Code>id</Code>, <Code>name</Code>, <Code>nameCyr</Code>, <Code>center</Code>
          , <Code>plateCodes</Code>.
        </>
      }
    >
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-muted text-xs text-text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">id</th>
              <th className="px-3 py-2 font-medium">name</th>
              <th className="px-3 py-2 font-medium">nameCyr</th>
              <th className="px-3 py-2 font-medium">center</th>
              <th className="px-3 py-2 font-medium">kod</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {UZ_REGIONS.map((r) => (
              <tr key={r.id}>
                <td className="px-3 py-2 font-mono text-xs">{r.id}</td>
                <td className="px-3 py-2">{r.name}</td>
                <td className="px-3 py-2">{r.nameCyr}</td>
                <td className="px-3 py-2">{r.center}</td>
                <td className="px-3 py-2 font-mono">
                  {r.plateCodes[0]}–{r.plateCodes.at(-1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DemoSection>
  );
}

export default function Page() {
  return (
    <DemoPage
      title="Identifikatorlar"
      description={
        <>
          <Code>@akhatmirzo/core</Code> dagi o'zbek hujjat identifikatorlari: JShShIR, STIR,
          pasport, avtomobil raqami, bank hisob raqami, MFO va hududlar ro'yxati.
        </>
      }
    >
      <PinflDemo />
      <CarPlateDemo />
      <DocumentsDemo />
      <RegionsDemo />
    </DemoPage>
  );
}
