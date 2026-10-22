import { isValidEmail } from '@akhatmirzo/core';
import { Button, Field, TagInput } from '@akhatmirzo/ui';
import { useState } from 'react';
import { Code, DemoGrid, DemoPage, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'TagInput', group: 'Formalar', order: 3.5 };

const cities = ['Toshkent', 'Samarqand', 'Buxoro', "Farg'ona", 'Namangan', 'Andijon', 'Xiva'];

export default function Page() {
  const [tags, setTags] = useState(['React', 'TypeScript']);

  return (
    <DemoPage
      title="TagInput"
      description="Teglar, kalit so'zlar, email ro'yxati. Enter yoki vergul bilan qo'shiladi, paste bo'linadi, Backspace ikki marta — o'chirish, ←/→ teglar orasida, ikki bosish — tahrirlash."
    >
      <DemoSection title="Asosiy (boshqariladigan)">
        <Field label="Teglar" description="Enter yoki vergul bilan qo'shing" className="max-w-md">
          <TagInput value={tags} onValueChange={setTags} placeholder="Teg qo'shing" />
        </Field>
        <span className="text-sm text-text-muted">Qiymat: {JSON.stringify(tags)}</span>
      </DemoSection>

      <DemoSection
        title="Takliflar"
        description={
          <>
            <Code>suggestions</Code> — kirill/lotin farqsiz (<Code>тош</Code> → Toshkent),{' '}
            <Code>maxTags=4</Code>
          </>
        }
      >
        <Field label="Shaharlar" className="max-w-md">
          <TagInput suggestions={cities} maxTags={4} placeholder="Shahar yozing" />
        </Field>
      </DemoSection>

      <DemoSection title="validate" description="false — standart xato, matn — o'sha xato">
        <Field label="Qabul qiluvchilar" className="max-w-md">
          <TagInput
            validate={(v) => isValidEmail(v) || "Email noto'g'ri"}
            delimiters={['Enter', ',', ' ', 'Tab']}
            placeholder="Email qo'shing"
          />
        </Field>
      </DemoSection>

      <DemoSection title="O'lchamlar va holatlar">
        <DemoGrid min={280}>
          <TagInput size="sm" defaultValue={['sm']} aria-label="sm" />
          <TagInput defaultValue={['md']} aria-label="md" />
          <TagInput size="lg" defaultValue={['lg']} aria-label="lg" />
          <TagInput disabled defaultValue={['Disabled']} aria-label="Disabled" />
          <TagInput invalid defaultValue={['Invalid']} aria-label="Invalid" />
          <TagInput readOnly defaultValue={['Faqat', "o'qish"]} aria-label="ReadOnly" />
        </DemoGrid>
      </DemoSection>

      <DemoSection title="Forma (name)">
        <form
          className="flex max-w-md flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            alert(JSON.stringify(new FormData(e.currentTarget).getAll('tags')));
          }}
        >
          <TagInput name="tags" defaultValue={['a', 'b']} aria-label="Teglar" />
          <Button type="submit" size="sm" className="self-start">
            Yuborish
          </Button>
        </form>
      </DemoSection>
    </DemoPage>
  );
}
