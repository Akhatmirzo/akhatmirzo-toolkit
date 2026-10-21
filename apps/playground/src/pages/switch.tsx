import { Field, Switch } from '@akhatmirzo/ui';
import { useState } from 'react';
import { Code, DemoGrid, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'Switch', group: 'Tanlov', order: 3 };

export default function Page() {
  const [wifi, setWifi] = useState(true);

  return (
    <DemoPage
      title="Switch"
      description='Darhol ta’sir qiladigan sozlamalar uchun. role="switch", Space bilan almashtiriladi, tugmacha spring bilan siljiydi.'
    >
      <DemoSection title="Holatlar">
        <DemoRow>
          <Switch label="Bildirishnomalar" defaultChecked />
          <Switch label="Avtosaqlash" />
        </DemoRow>
      </DemoSection>

      <DemoSection title="O‘lchamlar" description="sm — 32×18, md — 40×24 (default)">
        <DemoRow label="sm">
          <Switch size="sm" label="Kichik" defaultChecked />
          <Switch size="sm" label="O‘chiq" />
        </DemoRow>
        <DemoRow label="md">
          <Switch label="O‘rta" defaultChecked />
          <Switch label="O‘chiq" />
        </DemoRow>
        <DemoRow label="Labelsiz (aria-label bilan)">
          <Switch size="sm" aria-label="Kichik" />
          <Switch aria-label="O‘rta" defaultChecked />
        </DemoRow>
      </DemoSection>

      <DemoSection title="Izoh bilan">
        <DemoGrid min={260}>
          <Switch
            label="Qorong‘i mavzu"
            description="Tizim sozlamasidan qat’i nazar"
            defaultChecked
          />
          <Switch size="sm" label="Ovoz" description="Xabar kelganda signal" />
        </DemoGrid>
      </DemoSection>

      <DemoSection title="Disabled va invalid">
        <DemoRow>
          <Switch label="Disabled" disabled />
          <Switch label="Disabled, yoqilgan" disabled defaultChecked />
          <Switch label="Xato" invalid />
        </DemoRow>
      </DemoSection>

      <DemoSection title="Field bilan">
        <Field label="Ikki bosqichli tasdiqlash" description="Kirishda SMS kod so‘raladi">
          <Switch />
        </Field>
      </DemoSection>

      <DemoSection
        title="Boshqariladigan"
        description={
          <>
            <Code>checked</Code> + <Code>onCheckedChange</Code>
          </>
        }
      >
        <DemoRow>
          <Switch label="Wi-Fi" checked={wifi} onCheckedChange={setWifi} />
          <span className="text-sm text-text-muted">{wifi ? 'Yoqilgan' : 'O‘chirilgan'}</span>
        </DemoRow>
      </DemoSection>
    </DemoPage>
  );
}
