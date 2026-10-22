'use client';

import {
  BankAccountInput,
  CarPlateInput,
  Field,
  InnInput,
  PassportInput,
  PinflInput,
} from '@akhatmirzo/ui';
import { useState } from 'react';

export default function DocumentInputsOverview() {
  const [pinfl, setPinfl] = useState('');
  const [passport, setPassport] = useState('');
  const [inn, setInn] = useState('');
  const [plate, setPlate] = useState('');
  const [account, setAccount] = useState('');

  return (
    <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      <Field label="JShShIR" description={`Qiymat: "${pinfl}"`}>
        <PinflInput value={pinfl} onValueChange={setPinfl} />
      </Field>
      <Field label="Pasport yoki ID karta" description={`Qiymat: "${passport}"`}>
        <PassportInput value={passport} onValueChange={setPassport} />
      </Field>
      <Field label="STIR" description={`Qiymat: "${inn}"`}>
        <InnInput value={inn} onValueChange={setInn} />
      </Field>
      <Field label="Avtomobil raqami" description={`Qiymat: "${plate}"`}>
        <CarPlateInput value={plate} onValueChange={setPlate} />
      </Field>
      <Field label="Hisob raqami" description={`Qiymat: "${account}"`} className="sm:col-span-2">
        <BankAccountInput value={account} onValueChange={setAccount} />
      </Field>
    </div>
  );
}
