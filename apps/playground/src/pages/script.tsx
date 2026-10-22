import {
  Button,
  Field,
  MoneyInput,
  RegionSelect,
  ScriptProvider,
  ScriptToggle,
  Translit,
  useScript,
  type UzScript,
} from '@akhatmirzo/ui';
import { useState } from 'react';
import { Code, DemoGrid, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'Alifbo (Script)', group: 'Navigatsiya', order: 6 };

function HookDemo() {
  const { script, setScript, t } = useScript();
  return (
    <DemoRow label={<>useScript() → script: {script}</>}>
      <Button variant="primary">{t('Savatga qoʻshish')}</Button>
      <Button onClick={() => setScript(script === 'latin' ? 'cyrillic' : 'latin')}>
        {t('Alifboni almashtirish')}
      </Button>
      <input
        className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-text"
        placeholder={t('Mahsulot qidirish')}
        aria-label={t('Mahsulot qidirish')}
      />
    </DemoRow>
  );
}

export default function Page() {
  const [controlled, setControlled] = useState<UzScript>('cyrillic');

  return (
    <DemoPage
      title="ScriptProvider · Translit · ScriptToggle"
      description={
        <>
          Kontent bitta alifboda saqlanadi, foydalanuvchi tanlagan alifboda ko'rsatiladi.{' '}
          <Code>storageKey</Code> bilan tanlov <Code>localStorage</Code> da eslab qolinadi (SSR'da{' '}
          <Code>defaultScript</Code>, gidratatsiyadan keyin o'qiladi).
        </>
      }
    >
      <ScriptProvider defaultScript="latin" storageKey="playground-script">
        <DemoSection
          title="Provider + Translit"
          description="Sahifani yangilang — tanlov saqlanadi. Translit elementida lang=uz-Latn / uz-Cyrl."
        >
          <ScriptToggle />
          <Translit as="h3" className="text-xl font-semibold">
            Oʻzbekiston boʻylab yetkazib berish
          </Translit>
          <Translit as="p" className="text-sm text-text-muted">
            Салом! Бу матн кириллда сақланган, лекин лотинда ҳам тўғри кўринади.
          </Translit>
          <HookDemo />
        </DemoSection>

        <DemoSection
          title="Provider ichidagi boshqa komponentlar"
          description="RegionSelect va MoneyInput showWords joriy alifboni oladi."
        >
          <DemoGrid min={260}>
            <Field label="Hudud">
              <RegionSelect defaultValue="fergana" />
            </Field>
            <Field label="Summa">
              <MoneyInput defaultValue={1250000} showWords />
            </Field>
          </DemoGrid>
        </DemoSection>
      </ScriptProvider>

      <DemoSection title="ScriptToggle o'lchamlari va labels">
        <DemoRow>
          <ScriptToggle size="sm" />
          <ScriptToggle size="md" labels={{ latin: 'Lat', cyrillic: 'Кир' }} />
          <ScriptToggle size="lg" disabled />
        </DemoRow>
      </DemoSection>

      <DemoSection
        title="Boshqariladigan provider"
        description={
          <>
            <Code>script</Code> + <Code>onScriptChange</Code> — holat: <Code>{controlled}</Code>
          </>
        }
      >
        <ScriptProvider script={controlled} onScriptChange={setControlled}>
          <ScriptToggle fullWidth />
          <Translit>Toshkent — Oʻzbekiston poytaxti</Translit>
        </ScriptProvider>
      </DemoSection>

      <DemoSection title="Provider'siz" description="Translit matnni o'zgartirmaydi.">
        <Translit>Matn oʻzgarmaydi</Translit>
      </DemoSection>
    </DemoPage>
  );
}
