import { Field, Textarea } from '@akhatmirzo/ui';
import { useState } from 'react';
import { Code, DemoGrid, DemoPage, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'Textarea', group: 'Formalar', order: 3 };

export default function Page() {
  const [bio, setBio] = useState('Frontend dasturchi, Toshkent.');

  return (
    <DemoPage
      title="Textarea"
      description="Ko'p qatorli matn maydoni: Input'ning barcha holatlari + autoResize va belgilar hisoblagichi."
    >
      <DemoSection title="O'lchamlar">
        <DemoGrid min={220}>
          <Textarea size="sm" placeholder="sm" aria-label="sm" />
          <Textarea size="md" placeholder="md (default)" aria-label="md" />
          <Textarea size="lg" placeholder="lg" aria-label="lg" />
        </DemoGrid>
      </DemoSection>

      <DemoSection
        title="autoResize"
        description={
          <>
            Matnga qarab o'sadi: <Code>minRows=2</Code>, <Code>maxRows=6</Code> — undan keyin ichki
            scroll.
          </>
        }
      >
        <DemoGrid min={280}>
          <Textarea
            autoResize
            minRows={2}
            maxRows={6}
            placeholder="Yozib ko'ring..."
            aria-label="Auto"
          />
          <Textarea
            autoResize
            minRows={1}
            placeholder="minRows=1, cheklovsiz"
            aria-label="Auto 1"
          />
        </DemoGrid>
      </DemoSection>

      <DemoSection title="showCount" description={<Code>maxLength</Code>}>
        <DemoGrid min={280}>
          <Textarea
            showCount
            maxLength={120}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            aria-label="Bio"
          />
          <Textarea showCount defaultValue="maxLength siz — faqat son" aria-label="Count" />
        </DemoGrid>
      </DemoSection>

      <DemoSection title="Holatlar">
        <DemoGrid min={220}>
          <Textarea placeholder="Default" aria-label="Default" />
          <Textarea invalid defaultValue="Xato matn" aria-label="Invalid" />
          <Textarea disabled defaultValue="Disabled" aria-label="Disabled" />
          <Textarea readOnly defaultValue="Faqat o'qish" aria-label="ReadOnly" />
        </DemoGrid>
      </DemoSection>

      <DemoSection title="Field bilan">
        <DemoGrid min={280}>
          <Field label="Izoh" required description="Buyurtma haqida qo'shimcha ma'lumot">
            <Textarea autoResize showCount maxLength={500} placeholder="Yozing..." />
          </Field>
          <Field label="Manzil" error="Manzil kiritilmagan">
            <Textarea minRows={2} />
          </Field>
        </DemoGrid>
      </DemoSection>
    </DemoPage>
  );
}
