import { Avatar, Card, Skeleton } from '@akhatmirzo/ui';
import { useState } from 'react';
import { Code, DemoGrid, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'Skeleton', group: "Ko'rsatish", order: 4 };

export default function Page() {
  const [loading, setLoading] = useState(true);

  return (
    <DemoPage
      title="Skeleton"
      description="Yuklanayotgan kontent o'rni. Fon surface-muted, shimmer 1.5s; reduced-motion yoqilgan bo'lsa — oddiy pulsatsiya."
    >
      <DemoSection title="Shakllar" description="O'lcham className orqali beriladi">
        <DemoRow label="rect (default)">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-10 w-40 rounded-lg" />
        </DemoRow>
        <DemoRow label='variant="circle"'>
          <Skeleton variant="circle" className="size-6" />
          <Skeleton variant="circle" className="size-8" />
          <Skeleton variant="circle" className="size-10" />
          <Skeleton variant="circle" className="size-12" />
          <Skeleton variant="circle" className="size-16" />
        </DemoRow>
      </DemoSection>

      <DemoSection title="Skeleton.Text" description={<Code>lines</Code>}>
        <DemoGrid min={200}>
          {[1, 2, 3, 5].map((n) => (
            <div key={n} className="flex flex-col gap-2">
              <span className="text-xs font-medium text-text-muted">lines={n}</span>
              <Skeleton.Text lines={n} />
            </div>
          ))}
        </DemoGrid>
      </DemoSection>

      <DemoSection
        title="Haqiqiy misol"
        description={
          <>
            Ota elementda <Code>aria-busy</Code>; skeletonlar <Code>aria-hidden</Code>
          </>
        }
      >
        <DemoRow>
          <button
            type="button"
            onClick={() => setLoading((l) => !l)}
            className="focus-ring inline-flex h-8 items-center rounded-lg bg-primary-soft px-3 text-sm font-medium text-primary-soft-foreground transition-colors duration-base hover:bg-primary-soft-hover"
          >
            {loading ? "Kontentni ko'rsatish" : 'Yuklanish holati'}
          </button>
        </DemoRow>
        <Card variant="outline" className="max-w-md" aria-busy={loading}>
          {loading ? (
            <>
              <div className="flex items-center gap-3">
                <Skeleton variant="circle" className="size-10" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-2/5" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
              <Skeleton.Text lines={3} />
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <Avatar name="Malika Rahimova" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Malika Rahimova</span>
                  <span className="text-xs text-text-muted">2 soat oldin</span>
                </div>
              </div>
              <p className="text-sm text-text">
                Yangi dizayn tizimi tayyor: ranglar, tipografiya va animatsiya tokenlari endi bitta
                joyda. Keyingi qadam — komponentlar.
              </p>
            </>
          )}
        </Card>
      </DemoSection>
    </DemoPage>
  );
}
