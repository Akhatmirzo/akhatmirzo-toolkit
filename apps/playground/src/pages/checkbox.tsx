import { Checkbox, Field, type CheckedState } from '@akhatmirzo/ui';
import { useState } from 'react';
import { Code, DemoGrid, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'Checkbox', group: 'Tanlov', order: 1 };

const items = ['Email', 'SMS', 'Telegram'];

function SelectAll() {
  const [selected, setSelected] = useState<string[]>(['Email']);
  const all: CheckedState =
    selected.length === items.length ? true : selected.length ? 'indeterminate' : false;

  return (
    <div className="flex flex-col gap-3">
      <Checkbox
        label="Hammasini tanlash"
        checked={all}
        onCheckedChange={(v) => setSelected(v ? items : [])}
      />
      <div className="flex flex-col gap-3 pl-7">
        {items.map((item) => (
          <Checkbox
            key={item}
            label={item}
            checked={selected.includes(item)}
            onCheckedChange={(v) =>
              setSelected((s) => (v ? [...s, item] : s.filter((x) => x !== item)))
            }
          />
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  const [agree, setAgree] = useState(false);

  return (
    <DemoPage
      title="Checkbox"
      description="Native checkbox ustida: label bosilganda ham belgilanadi, Space bilan almashtiriladi. Saqlash tugmasi bor formalar uchun."
    >
      <DemoSection title="Holatlar">
        <DemoRow>
          <Checkbox label="Belgilanmagan" />
          <Checkbox label="Belgilangan" defaultChecked />
          <Checkbox label="Qisman" checked="indeterminate" />
        </DemoRow>
      </DemoSection>

      <DemoSection title="O‘lchamlar" description="sm — 16px, md — 20px (default)">
        <DemoRow label="sm">
          <Checkbox size="sm" label="Kichik" defaultChecked />
          <Checkbox size="sm" label="Qisman" checked="indeterminate" />
          <Checkbox size="sm" label="Belgilanmagan" />
        </DemoRow>
        <DemoRow label="md">
          <Checkbox label="O‘rta" defaultChecked />
          <Checkbox label="Qisman" checked="indeterminate" />
          <Checkbox label="Belgilanmagan" />
        </DemoRow>
        <DemoRow label="Labelsiz (aria-label bilan)">
          <Checkbox size="sm" aria-label="Kichik" />
          <Checkbox aria-label="O‘rta" defaultChecked />
        </DemoRow>
      </DemoSection>

      <DemoSection title="Izoh bilan">
        <DemoGrid min={260}>
          <Checkbox
            label="Yangiliklar"
            description="Haftasiga bir marta yangi imkoniyatlar haqida xabar"
            defaultChecked
          />
          <Checkbox
            size="sm"
            label="Eslab qolish"
            description="30 kun davomida qayta kirish shart emas"
          />
        </DemoGrid>
      </DemoSection>

      <DemoSection title="Disabled va invalid">
        <DemoRow>
          <Checkbox label="Disabled" disabled />
          <Checkbox label="Disabled, belgilangan" disabled defaultChecked />
          <Checkbox label="Disabled, qisman" disabled checked="indeterminate" />
          <Checkbox label="Xato" invalid />
        </DemoRow>
      </DemoSection>

      <DemoSection
        title="Field bilan"
        description={
          <>
            <Code>Field</Code> label, izoh va xatoni ulaydi: <Code>aria-describedby</Code>,{' '}
            <Code>aria-invalid</Code>, <Code>required</Code>.
          </>
        }
      >
        <Field label="Foydalanish shartlari" error="Davom etish uchun rozilik kerak" required>
          <Checkbox label="Shartlarga roziman" />
        </Field>
      </DemoSection>

      <DemoSection
        title="Boshqariladigan va “hammasini tanlash”"
        description={
          <>
            <Code>checked</Code> + <Code>onCheckedChange</Code>; ota checkbox{' '}
            <Code>"indeterminate"</Code> holatini oladi.
          </>
        }
      >
        <DemoGrid min={240}>
          <SelectAll />
          <div className="flex flex-col gap-2">
            <Checkbox label="Shartlarga roziman" checked={agree} onCheckedChange={setAgree} />
            <p className="text-xs text-text-muted">Holat: {agree ? 'belgilangan' : 'yo‘q'}</p>
          </div>
        </DemoGrid>
      </DemoSection>
    </DemoPage>
  );
}
