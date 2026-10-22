import { Field, Rating } from '@akhatmirzo/ui';
import { useState } from 'react';
import { Code, DemoGrid, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'Rating', group: 'Tanlov', order: 6 };

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.6 4.5c2.1 0 3.6 1.2 5.4 3.1 1.8-1.9 3.3-3.1 5.4-3.1 3.6 0 5.7 3.9 4.2 7.3C19.5 16.4 12 21 12 21z" />
    </svg>
  );
}

export default function Page() {
  const [value, setValue] = useState(3.5);

  return (
    <DemoPage
      title="Rating"
      description="Yulduzli baho: radiogroup, strelkalar va Home/End, hover'da oldindan ko'rish, tanlanganni qayta bosish 0 qiladi. readOnly — role='img'."
    >
      <DemoSection title="Asosiy">
        <DemoRow>
          <Rating defaultValue={4} />
        </DemoRow>
      </DemoSection>

      <DemoSection title="allowHalf" description={<>Qiymat: {value}</>}>
        <DemoRow>
          <Rating value={value} onValueChange={setValue} allowHalf size="lg" />
        </DemoRow>
      </DemoSection>

      <DemoSection title="readOnly" description="Sharhlar ro'yxatida — kasr qiymatlar ham aniq">
        <DemoRow>
          <Rating value={4.5} readOnly size="sm" />
          <Rating value={3.7} readOnly />
          <Rating value={2} readOnly size="lg" />
        </DemoRow>
      </DemoSection>

      <DemoSection title="Ranglar, ikonka, max">
        <DemoGrid min={220}>
          <Rating defaultValue={3} color="primary" />
          <Rating defaultValue={2} color="danger" icon={<HeartIcon />} />
          <Rating defaultValue={7} max={10} size="sm" />
          <Rating defaultValue={3} disabled />
        </DemoGrid>
      </DemoSection>

      <DemoSection
        title="Field bilan"
        description={
          <>
            <Code>allowClear=false</Code> — qayta bosish tozalamaydi
          </>
        }
      >
        <Field label="Xizmat sifati" description="1 dan 5 gacha baholang">
          <Rating defaultValue={5} allowClear={false} />
        </Field>
      </DemoSection>
    </DemoPage>
  );
}
