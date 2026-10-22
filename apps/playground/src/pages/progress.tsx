import { Button, Progress, ProgressCircle, type ProgressColor } from '@akhatmirzo/ui';
import { useState } from 'react';
import { Code, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'Progress', group: "Ko'rsatish", order: 7 };

const colors: ProgressColor[] = ['primary', 'success', 'warning', 'danger'];
const sizes = ['sm', 'md', 'lg'] as const;

export default function Page() {
  const [value, setValue] = useState(40);

  return (
    <DemoPage
      title="Progress"
      description="Chiziq va doira. value={null} — noaniq holat; o'zgarish 300ms ease-out, reduced-motion'da noaniq holat pulsatsiyaga almashadi."
    >
      <DemoSection title="Boshqariladigan qiymat" description={<Code>value={value}</Code>}>
        <Progress value={value} label="Yuklanmoqda" showValue />
        <DemoRow>
          <ProgressCircle value={value} size="sm" label="Kichik" />
          <ProgressCircle value={value} showValue label="O'rta" />
          <ProgressCircle value={value} size="lg" showValue label="Katta" />
        </DemoRow>
        <DemoRow>
          <Button size="sm" onClick={() => setValue((v) => Math.max(v - 10, 0))}>
            −10
          </Button>
          <Button size="sm" onClick={() => setValue((v) => Math.min(v + 10, 100))}>
            +10
          </Button>
        </DemoRow>
      </DemoSection>

      <DemoSection title="Noaniq holat" description={<Code>value={'{null}'}</Code>}>
        <Progress value={null} label="Fayl tayyorlanmoqda" />
        <DemoRow>
          {sizes.map((size) => (
            <ProgressCircle key={size} size={size} label={`Yuklanmoqda ${size}`} />
          ))}
        </DemoRow>
      </DemoSection>

      <DemoSection title="Ranglar">
        {colors.map((color, i) => (
          <Progress key={color} value={25 + i * 20} color={color} label={color} showValue />
        ))}
        <DemoRow>
          {colors.map((color, i) => (
            <ProgressCircle key={color} value={25 + i * 20} color={color} showValue label={color} />
          ))}
        </DemoRow>
      </DemoSection>

      <DemoSection title="O'lchamlar" description="Chiziq 4 / 8 / 12px">
        {sizes.map((size) => (
          <Progress key={size} value={60} size={size} label={size} />
        ))}
      </DemoSection>

      <DemoSection title="formatValue">
        <Progress
          value={3}
          max={5}
          label="Profil to'ldirildi"
          showValue
          formatValue={(v, max) => `${v} / ${max}`}
        />
        <Progress value={100} color="success" label="Yakunlandi" showValue />
      </DemoSection>
    </DemoPage>
  );
}
