import { Divider } from '@akhatmirzo/ui';
import { Code, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'Divider', group: "Ko'rsatish", order: 5 };

const linkClass = 'text-sm font-medium text-text-subtle';

export default function Page() {
  return (
    <DemoPage title="Divider" description="Bo'luvchi chiziq — border rangida, 1px.">
      <DemoSection title="Gorizontal" description="default">
        <div className="flex flex-col gap-3 text-sm">
          <p>Birinchi bo'lim</p>
          <Divider />
          <p>Ikkinchi bo'lim</p>
        </div>
      </DemoSection>

      <DemoSection title="Label bilan" description={<Code>label</Code>}>
        <div className="flex max-w-sm flex-col gap-4">
          <div className="h-10 rounded-lg bg-primary text-center text-sm leading-10 font-medium text-primary-foreground">
            Telefon orqali kirish
          </div>
          <Divider label="yoki" />
          <div className="h-10 rounded-lg border border-border bg-surface text-center text-sm leading-10 font-medium text-text">
            Google orqali kirish
          </div>
        </div>
      </DemoSection>

      <DemoSection title="Vertikal" description={<Code>orientation="vertical"</Code>}>
        <DemoRow label="Qatorda">
          <div className="flex h-5 items-center gap-3">
            <span className={linkClass}>Bosh sahifa</span>
            <Divider orientation="vertical" />
            <span className={linkClass}>Buyurtmalar</span>
            <Divider orientation="vertical" />
            <span className={linkClass}>Sozlamalar</span>
          </div>
        </DemoRow>
        <DemoRow label="Label bilan">
          <div className="flex h-28 items-stretch gap-4">
            <div className="flex w-32 items-center justify-center rounded-lg bg-surface-muted text-sm text-text-muted">
              Chap
            </div>
            <Divider orientation="vertical" label="yoki" />
            <div className="flex w-32 items-center justify-center rounded-lg bg-surface-muted text-sm text-text-muted">
              O'ng
            </div>
          </div>
        </DemoRow>
      </DemoSection>

      <DemoSection
        title="Bezak uchun"
        description={
          <>
            <Code>decorative</Code> — ekran o'quvchidan yashiriladi (<Code>role="none"</Code>)
          </>
        }
      >
        <Divider decorative className="bg-border-strong" />
      </DemoSection>
    </DemoPage>
  );
}
