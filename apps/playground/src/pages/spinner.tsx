import { Button, Spinner } from '@akhatmirzo/ui';
import { Code, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'Spinner', group: 'Asoslar', order: 4 };

export default function Page() {
  return (
    <DemoPage
      title="Spinner"
      description={
        <>
          Yuklanish belgisi: <Code>role="status"</Code>, rangi <Code>currentColor</Code>, 700ms
          linear. Reduced-motion'da sekinroq aylanadi.
        </>
      }
    >
      <DemoSection title="O'lchamlar" description="16 / 20 / 24px">
        <DemoRow>
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
        </DemoRow>
      </DemoSection>

      <DemoSection title="Rang" description="Ota elementning matn rangini oladi.">
        <DemoRow>
          <Spinner className="text-text" />
          <Spinner className="text-text-muted" />
          <Spinner className="text-primary" />
          <Spinner className="text-danger" />
          <span className="inline-flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Spinner size="sm" />
          </span>
        </DemoRow>
      </DemoSection>

      <DemoSection title="Kompozitsiya">
        <DemoRow>
          <span className="inline-flex items-center gap-2 text-sm text-text-muted">
            <Spinner size="sm" label="Ma'lumotlar yuklanmoqda" />
            Ma'lumotlar yuklanmoqda...
          </span>
          <Button variant="primary" loading>
            Saqlash
          </Button>
        </DemoRow>
      </DemoSection>
    </DemoPage>
  );
}
