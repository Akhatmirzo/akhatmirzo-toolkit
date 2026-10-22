import { ColorPicker, Field } from '@akhatmirzo/ui';
import { useState } from 'react';
import { Code, DemoGrid, DemoPage, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'ColorPicker', group: 'Formalar', order: 3.6 };

export default function Page() {
  const [color, setColor] = useState('#4f46e5');

  return (
    <DemoPage
      title="ColorPicker"
      description="Trigger — Input ko'rinishida, Popover ichida 2D to'yinganlik maydoni, hue slayderi, hex input, pipetka (EyeDropper API bo'lsa) va tayyor ranglar."
    >
      <DemoSection title="Asosiy" description={<>Qiymat: {color}</>}>
        <div className="flex max-w-xs items-center gap-3">
          <ColorPicker value={color} onValueChange={setColor} />
          <span
            aria-hidden="true"
            className="size-10 shrink-0 rounded-lg border border-border"
            style={{ backgroundColor: color }}
          />
        </div>
      </DemoSection>

      <DemoSection
        title="alpha"
        description={
          <>
            <Code>#rrggbbaa</Code> + shaffoflik slayderi
          </>
        }
      >
        <div className="max-w-xs">
          <ColorPicker alpha defaultValue="#0ea5e980" aria-label="Fon rangi" />
        </div>
      </DemoSection>

      <DemoSection title="O'z swatch'lari">
        <div className="max-w-xs">
          <ColorPicker
            swatches={['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#e11d48']}
            aria-label="Teg rangi"
          />
        </div>
      </DemoSection>

      <DemoSection title="O'lchamlar va holatlar">
        <DemoGrid min={200}>
          <ColorPicker size="sm" aria-label="sm" />
          <ColorPicker aria-label="md" />
          <ColorPicker size="lg" aria-label="lg" />
          <ColorPicker disabled aria-label="Disabled" />
          <Field label="Brend rangi" error="Kontrast yetarli emas">
            <ColorPicker defaultValue="#f59e0b" />
          </Field>
        </DemoGrid>
      </DemoSection>
    </DemoPage>
  );
}
