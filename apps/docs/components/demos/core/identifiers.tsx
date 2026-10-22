'use client';

import {
  formatCarPlate,
  formatDate,
  formatPinfl,
  parseCarPlate,
  parsePinfl,
} from '@akhatmirzo/core';
import { Badge, Field, Input } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function CoreIdentifiers() {
  const [pinfl, setPinfl] = useState('31503901234567');
  const [plate, setPlate] = useState('01a123bc');
  const person = parsePinfl(pinfl);
  const car = parseCarPlate(plate);

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Field label="JShShIR" description={formatPinfl(pinfl) || '—'}>
        <Input value={pinfl} onChange={(e) => setPinfl(e.target.value)} inputMode="numeric" />
      </Field>
      <div className="flex flex-wrap gap-2">
        <Badge color={person ? 'success' : 'neutral'} dot>
          {person ? "To'g'ri" : "Noto'g'ri yoki to'liq emas"}
        </Badge>
        {person && <Badge color="info">{person.gender === 'male' ? 'Erkak' : 'Ayol'}</Badge>}
        {person && <Badge color="info">{formatDate(person.birthDate)}</Badge>}
      </div>
      <Field label="Avtomobil raqami" description={formatCarPlate(plate) || '—'}>
        <Input value={plate} onChange={(e) => setPlate(e.target.value)} />
      </Field>
      <div className="flex flex-wrap gap-2">
        <Badge color={car ? 'success' : 'neutral'} dot>
          {car ? (car.type === 'personal' ? 'Jismoniy shaxs' : 'Yuridik shaxs') : "Noto'g'ri"}
        </Badge>
        {car && <Badge color="info">{car.region.name}</Badge>}
      </div>
    </div>
  );
}
