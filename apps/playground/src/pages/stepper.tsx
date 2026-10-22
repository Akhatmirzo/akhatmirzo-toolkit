import { Button, Stepper, type StepperStep } from '@akhatmirzo/ui';
import { useState } from 'react';
import { Code, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'Stepper', group: 'Navigatsiya', order: 5 };

const steps: StepperStep[] = [
  { title: 'Savat' },
  { title: 'Yetkazib berish', description: 'Manzil va vaqt' },
  { title: 'To‘lov' },
  { title: 'Tasdiqlash', optional: true },
];

export default function Page() {
  const [step, setStep] = useState(1);
  const [wizard, setWizard] = useState(0);

  return (
    <DemoPage
      title="Stepper"
      description="Ko‘p qadamli jarayon. onValueChange berilsa — o‘tgan qadamlarga qaytish mumkin. 640px dan tor ekranda gorizontal stepper ixcham “2 / 4 · Yetkazib berish” + chiziqqa o‘tadi."
    >
      <DemoSection
        title="Boshqariladigan"
        description={
          <>
            <Code>value</Code> + <Code>onValueChange</Code>
          </>
        }
      >
        <Stepper steps={steps} value={step} onValueChange={setStep} aria-label="Buyurtma" />
        <DemoRow>
          <Button size="sm" disabled={step === 0} onClick={() => setStep(step - 1)}>
            Orqaga
          </Button>
          <Button
            size="sm"
            variant="primary"
            disabled={step === steps.length}
            onClick={() => setStep(step + 1)}
          >
            Davom etish
          </Button>
        </DemoRow>
      </DemoSection>

      <DemoSection title="Holatlar" description="complete · current · upcoming · error">
        <Stepper
          aria-label="Holatlar"
          value={2}
          steps={[
            { title: 'Ma’lumotlar' },
            { title: 'Hujjatlar', status: 'error', description: 'Pasport rasmi o‘qilmadi' },
            { title: 'Tekshiruv' },
            { title: 'Shartnoma' },
          ]}
        />
      </DemoSection>

      <DemoSection title="O‘lcham sm">
        <Stepper steps={steps} defaultValue={2} size="sm" aria-label="Kichik" />
      </DemoSection>

      <DemoSection
        title="Vertikal + allowFutureSteps"
        description="Har qanday qadamga o‘tish mumkin"
      >
        <Stepper
          orientation="vertical"
          aria-label="Sozlash ustasi"
          value={wizard}
          onValueChange={setWizard}
          allowFutureSteps
          steps={[
            { title: 'Do‘kon nomi', description: 'Mijozlar ko‘radigan nom' },
            { title: 'To‘lov usullari', description: 'Click, Payme, naqd' },
            { title: 'Yetkazib berish', description: 'Hududlar va narxlar' },
            { title: 'Ishga tushirish' },
          ]}
        />
      </DemoSection>

      <DemoSection title="Ixcham" description={<Code>compact</Code>}>
        <Stepper steps={steps} value={step} compact aria-label="Ixcham" />
      </DemoSection>
    </DemoPage>
  );
}
