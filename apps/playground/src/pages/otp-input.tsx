import { Field, OtpInput, toast } from '@akhatmirzo/ui';
import { useState } from 'react';
import { Code, DemoGrid, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'OtpInput', group: 'Formalar', order: 8 };

const CORRECT = '123456';

function VerifyDemo() {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'error' | 'ok'>('idle');

  return (
    <div className="flex flex-col gap-2">
      <Field
        label="Tasdiqlash kodi"
        description={
          status === 'ok' ? (
            <span className="text-success-soft-foreground">Kod tasdiqlandi</span>
          ) : (
            <>
              +998 90 *** ** 67 raqamiga yuborilgan 6 xonali kodni kiriting. To'g'ri kod:{' '}
              <Code>{CORRECT}</Code>
            </>
          )
        }
        error={status === 'error' ? "Kod noto'g'ri. Qayta urinib ko'ring." : undefined}
      >
        <OtpInput
          groupSize={3}
          value={code}
          disabled={status === 'ok'}
          onValueChange={(v) => {
            setCode(v);
            if (status === 'error') setStatus('idle');
          }}
          onComplete={(v) => setStatus(v === CORRECT ? 'ok' : 'error')}
        />
      </Field>
      <OtpInput.ResendTimer
        onResend={() => {
          setCode('');
          setStatus('idle');
          toast('Yangi kod yuborildi');
        }}
      />
    </div>
  );
}

export default function Page() {
  const [alpha, setAlpha] = useState('');
  const [completed, setCompleted] = useState<string | null>(null);

  return (
    <DemoPage
      title="OtpInput"
      description={
        <>
          SMS kod uchun katakchalar. Butun kodni bitta katakka joylash mumkin, SMS'dan
          avtoto'ldirish — <Code>autocomplete="one-time-code"</Code>. <Code>Backspace</Code> —
          oldingi katakka, <Code>←</Code> <Code>→</Code> — katakchalar bo'ylab.
        </>
      }
    >
      <DemoSection
        title="Tasdiqlash oqimi"
        description={
          <>
            Noto'g'ri kod — qizil + silkinish (<Code>prefers-reduced-motion</Code> da yo'q). Ostida{' '}
            <Code>OtpInput.ResendTimer</Code>.
          </>
        }
      >
        <VerifyDemo />
      </DemoSection>

      <DemoSection title="Uzunlik va tur">
        <DemoGrid min={300}>
          <DemoRow label="length={4}">
            <OtpInput length={4} aria-label="4 xonali kod" />
          </DemoRow>
          <DemoRow label="length={6} (default), guruhsiz">
            <OtpInput aria-label="6 xonali kod" onComplete={setCompleted} />
          </DemoRow>
          <DemoRow label={`type="alphanumeric" · qiymat: ${alpha || '—'}`}>
            <OtpInput
              type="alphanumeric"
              length={6}
              groupSize={3}
              aria-label="Harfli kod"
              value={alpha}
              onValueChange={setAlpha}
            />
          </DemoRow>
          <DemoRow label="groupSize={2}">
            <OtpInput length={6} groupSize={2} aria-label="Juft guruh" />
          </DemoRow>
        </DemoGrid>
        <p className="text-xs text-text-muted">
          onComplete: <Code>{completed ?? '—'}</Code>
        </p>
      </DemoSection>

      <DemoSection title="Holatlar">
        <DemoGrid min={300}>
          <DemoRow label="invalid">
            <OtpInput invalid defaultValue="482913" groupSize={3} aria-label="Xato" />
          </DemoRow>
          <DemoRow label="disabled">
            <OtpInput disabled defaultValue="12" groupSize={3} aria-label="O'chirilgan" />
          </DemoRow>
        </DemoGrid>
      </DemoSection>

      <DemoSection
        title="ResendTimer"
        description={
          <>
            Taymer tugaguncha bosilmaydi; <Code>onResend</Code> Promise qaytarsa — tugaguncha
            kutadi, keyin taymer qayta boshlanadi.
          </>
        }
      >
        <DemoRow>
          <OtpInput.ResendTimer seconds={5} onResend={() => toast('Kod qayta yuborildi')} />
          <OtpInput.ResendTimer
            seconds={3}
            labels={{ resend: 'SMS ni qayta olish' }}
            onResend={() => new Promise((r) => setTimeout(r, 800))}
          />
        </DemoRow>
      </DemoSection>
    </DemoPage>
  );
}
