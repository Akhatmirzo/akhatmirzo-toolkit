import { Kbd } from '@akhatmirzo/ui';
import { Code, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'Kbd', group: 'Asoslar', order: 3 };

export default function Page() {
  return (
    <DemoPage
      title="Kbd"
      description={
        <>
          Klaviatura tugmasini ko'rsatish. <Code>mod</Code> — macOS'da ⌘, boshqalarida Ctrl.
        </>
      }
    >
      <DemoSection title="Oddiy">
        <DemoRow>
          <Kbd>Esc</Kbd>
          <Kbd>↵</Kbd>
          <Kbd>Tab</Kbd>
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd>
        </DemoRow>
      </DemoSection>

      <DemoSection title="keys massivi" description={<Code>{`keys={['mod', 'K']}`}</Code>}>
        <DemoRow>
          <Kbd keys={['mod', 'K']} />
          <Kbd keys={['mod', 'Shift', 'P']} />
          <Kbd keys={['Alt', 'F4']} />
        </DemoRow>
      </DemoSection>

      <DemoSection title="O'lchamlar">
        <DemoRow label="sm (default)">
          <Kbd keys={['mod', 'C']} />
          <Kbd>Esc</Kbd>
        </DemoRow>
        <DemoRow label="md">
          <Kbd size="md" keys={['mod', 'C']} />
          <Kbd size="md">Esc</Kbd>
        </DemoRow>
      </DemoSection>

      <DemoSection title="Matn ichida">
        <p className="text-sm text-text">
          Qidiruvni ochish uchun <Kbd keys={['mod', 'K']} /> ni bosing, yopish uchun <Kbd>Esc</Kbd>.
        </p>
        <div className="flex w-64 items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text">
          Tahrirlash
          <Kbd keys={['mod', 'E']} />
        </div>
      </DemoSection>
    </DemoPage>
  );
}
