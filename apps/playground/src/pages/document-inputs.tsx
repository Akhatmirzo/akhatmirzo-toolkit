import {
  BankAccountInput,
  CarPlateInput,
  Field,
  InnInput,
  PassportInput,
  PinflInput,
  type CarPlateInputDetails,
  type PinflInputDetails,
} from '@akhatmirzo/ui';
import { useState } from 'react';
import { Code, DemoGrid, DemoPage, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'Hujjat inputlari', group: 'Formalar', order: 7.5 };

function Raw({ value }: { value: string }) {
  return (
    <>
      Toza qiymat: <Code>{value === '' ? '—' : value}</Code>
    </>
  );
}

function pinflInfo(d: PinflInputDetails | null) {
  if (!d?.valid || !d.birthDate) return null;
  return `${d.gender === 'male' ? 'Erkak' : 'Ayol'}, ${d.birthDate.toLocaleDateString('uz-UZ')}`;
}

export default function Page() {
  const [pinfl, setPinfl] = useState('');
  const [pinflDetails, setPinflDetails] = useState<PinflInputDetails | null>(null);
  const [passport, setPassport] = useState('');
  const [inn, setInn] = useState('');
  const [account, setAccount] = useState('');
  const [plate, setPlate] = useState('');
  const [plateDetails, setPlateDetails] = useState<CarPlateInputDetails | null>(null);

  return (
    <DemoPage
      title="Hujjat inputlari"
      description={
        <>
          MaskedInput presetlari: ko'rinish formatlangan, qiymat toza. <Code>invalid</Code> —{' '}
          <Code>isValidX</Code> dan (to'liq kiritilganda).
        </>
      }
    >
      <DemoSection title="Barcha maydonlar" description="Field bilan label, izoh va xato ulanadi.">
        <DemoGrid min={260}>
          <Field
            label="JShShIR · PinflInput"
            description={pinflInfo(pinflDetails) ?? <Raw value={pinfl} />}
            error={pinflDetails && !pinflDetails.valid ? "JShShIR noto'g'ri" : undefined}
          >
            <PinflInput
              value={pinfl}
              onValueChange={(v, d) => {
                setPinfl(v);
                if (!d.complete) setPinflDetails(null);
              }}
              onDetails={setPinflDetails}
            />
          </Field>
          <Field label="Pasport · PassportInput" description={<Raw value={passport} />}>
            <PassportInput value={passport} onValueChange={setPassport} />
          </Field>
          <Field label="STIR · InnInput" description={<Raw value={inn} />}>
            <InnInput value={inn} onValueChange={setInn} />
          </Field>
          <Field label="Hisob raqami · BankAccountInput" description={<Raw value={account} />}>
            <BankAccountInput value={account} onValueChange={setAccount} />
          </Field>
        </DemoGrid>
      </DemoSection>

      <DemoSection
        title="CarPlateInput"
        description="Jismoniy (01 A 123 BC) yoki yuridik (01 123 ABC) — 3-belgidan aniqlanadi."
      >
        <DemoGrid min={260}>
          <Field
            label="Avtomobil raqami"
            description={
              <>
                <Raw value={plate} /> · {plateDetails?.region?.name ?? '—'} ·{' '}
                {plateDetails?.type ?? '—'}
              </>
            }
          >
            <CarPlateInput value={plate} onValueChange={setPlate} onDetails={setPlateDetails} />
          </Field>
          <Field label="Yuridik shaxs" description="defaultValue='30123ABC'">
            <CarPlateInput defaultValue="30123ABC" />
          </Field>
          <Field label="Noma'lum hudud" description="02 — ro'yxatda yo'q">
            <CarPlateInput defaultValue="02A123BC" />
          </Field>
        </DemoGrid>
        <DemoGrid min={200}>
          <CarPlateInput size="sm" aria-label="sm" defaultValue="40A777AA" />
          <CarPlateInput size="md" aria-label="md" defaultValue="40A777AA" />
          <CarPlateInput size="lg" aria-label="lg" defaultValue="40A777AA" />
        </DemoGrid>
      </DemoSection>

      <DemoSection title="Holatlar">
        <DemoGrid min={220}>
          <Field label="STIR 0 bilan" description="Darhol invalid">
            <InnInput defaultValue="012345678" />
          </Field>
          <Field label="validate={false}">
            <PinflInput defaultValue="33102901234567" validate={false} />
          </Field>
          <Field label="Disabled" disabled>
            <PassportInput defaultValue="AB1234567" />
          </Field>
          <Field label="Clearable">
            <BankAccountInput defaultValue="20208000900012345001" clearable />
          </Field>
        </DemoGrid>
      </DemoSection>
    </DemoPage>
  );
}
