import {
  useCountdown,
  useIdle,
  useInfiniteScroll,
  useInterval,
  useOnline,
  usePrevious,
  useStep,
  useTimeout,
} from '@akhatmirzo/hooks';
import { Badge, Button, OtpInput, Progress, Spinner, Stepper } from '@akhatmirzo/ui';
import { useState } from 'react';
import { Code, DemoGrid, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'Hooklar: vaqt', group: 'Funksiyalar', order: 4.2 };

function IntervalDemo() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);
  const [fast, setFast] = useState(false);
  useInterval(() => setSeconds((s) => s + 1), running ? (fast ? 250 : 1000) : null);
  return (
    <DemoRow>
      <span className="min-w-16 text-2xl font-semibold tabular-nums">{seconds}</span>
      <Button size="sm" variant="primary" onClick={() => setRunning((r) => !r)}>
        {running ? "To'xtatish (delay=null)" : 'Davom ettirish'}
      </Button>
      <Button size="sm" variant="outline" onClick={() => setFast((f) => !f)}>
        delay: {fast ? 250 : 1000}ms
      </Button>
    </DemoRow>
  );
}

function TimeoutDemo() {
  const [visible, setVisible] = useState(true);
  const { reset, clear } = useTimeout(() => setVisible(false), visible ? 3000 : null);
  return (
    <DemoRow>
      {visible ? (
        <div
          className="rounded-lg border border-border bg-success-soft px-4 py-2 text-sm text-success-soft-foreground"
          onMouseEnter={clear}
          onMouseLeave={reset}
        >
          Saqlandi — 3 soniyada yopiladi (ustiga olib boring — to'xtaydi)
        </div>
      ) : (
        <Button size="sm" onClick={() => setVisible(true)}>
          Yana ko'rsatish
        </Button>
      )}
    </DemoRow>
  );
}

function CountdownDemo() {
  const [ended, setEnded] = useState(0);
  const { remaining, formatted, isRunning, start, pause, reset, restart } = useCountdown(65, {
    onEnd: () => setEnded((n) => n + 1),
  });
  const resend = useCountdown(10);
  return (
    <DemoGrid min={260}>
      <div className="flex flex-col gap-3">
        <span className="text-3xl font-semibold tabular-nums">{formatted}</span>
        <p className="text-xs text-text-muted">
          remaining: <Code>{remaining}</Code> · isRunning: <Code>{String(isRunning)}</Code> · onEnd:{' '}
          <Code>{ended}</Code>
        </p>
        <DemoRow>
          <Button size="sm" variant="primary" onClick={isRunning ? pause : start}>
            {isRunning ? 'Pauza' : 'Start'}
          </Button>
          <Button size="sm" variant="outline" onClick={reset}>
            Reset
          </Button>
          <Button size="sm" variant="outline" onClick={restart}>
            Restart
          </Button>
        </DemoRow>
      </div>
      <div className="flex flex-col items-start gap-3">
        <OtpInput groupSize={3} />
        <Button size="sm" variant="ghost" disabled={resend.isRunning} onClick={resend.restart}>
          {resend.isRunning ? `Kodni qayta yuborish (${resend.formatted})` : 'Kodni qayta yuborish'}
        </Button>
      </div>
    </DemoGrid>
  );
}

function IdleOnlineDemo() {
  const idle = useIdle(3000);
  const online = useOnline();
  return (
    <DemoRow>
      <Badge color={idle ? 'warning' : 'success'} dot>
        useIdle(3000): {idle ? 'nofaol' : 'faol'}
      </Badge>
      <Badge color={online ? 'success' : 'danger'} dot>
        useOnline: {online ? 'online' : 'offline'}
      </Badge>
    </DemoRow>
  );
}

const STEPS = [{ title: 'Savat' }, { title: 'Yetkazib berish' }, { title: "To'lov" }];

function StepDemo() {
  const { step, next, prev, goTo, reset, isFirst, isLast, progress } = useStep(STEPS.length);
  const prevStep = usePrevious(step);
  return (
    <div className="flex flex-col gap-4">
      <Stepper steps={STEPS} value={step} onValueChange={goTo} aria-label="Buyurtma" />
      <Progress value={progress * 100} aria-label="Jarayon" />
      <p className="text-xs text-text-muted">
        step: <Code>{step}</Code> · usePrevious: <Code>{String(prevStep)}</Code> · progress:{' '}
        <Code>{progress}</Code>
      </p>
      <DemoRow>
        <Button size="sm" disabled={isFirst} onClick={prev}>
          Orqaga
        </Button>
        <Button size="sm" variant="primary" disabled={isLast} onClick={next}>
          Davom etish
        </Button>
        <Button size="sm" variant="ghost" onClick={reset}>
          Reset
        </Button>
      </DemoRow>
    </div>
  );
}

function InfiniteScrollDemo() {
  const [items, setItems] = useState(12);
  const [loading, setLoading] = useState(false);
  const [calls, setCalls] = useState(0);
  const hasMore = items < 60;
  const { sentinelRef } = useInfiniteScroll({
    hasMore,
    loading,
    rootMargin: '40px',
    onLoadMore: () => {
      setCalls((n) => n + 1);
      setLoading(true);
      setTimeout(() => {
        setItems((n) => Math.min(60, n + 12));
        setLoading(false);
      }, 500);
    },
  });
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-text-muted">
        onLoadMore chaqiruvlari: <Code>{calls}</Code>
      </p>
      <div className="h-64 overflow-auto rounded-lg border border-border">
        <ul className="divide-y divide-border">
          {Array.from({ length: items }, (_, i) => (
            <li key={i} className="px-4 py-2 text-sm">
              Yozuv #{i + 1}
            </li>
          ))}
        </ul>
        <div
          ref={sentinelRef}
          className="flex items-center justify-center gap-2 p-3 text-sm text-text-muted"
        >
          {hasMore ? (
            <>
              <Spinner size="sm" /> Yuklanmoqda…
            </>
          ) : (
            'Hammasi yuklandi'
          )}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <DemoPage
      title="Hooklar: vaqt va jarayon"
      description={
        <>
          <Code>@akhatmirzo/hooks</Code> — taymerlar, teskari sanoq, faollik, bosqichlar va cheksiz
          scroll.
        </>
      }
    >
      <DemoSection title="useInterval" description="delay=null — to'xtaydi, callback eng so'nggisi">
        <IntervalDemo />
      </DemoSection>

      <DemoSection title="useTimeout" description="reset / clear">
        <TimeoutDemo />
      </DemoSection>

      <DemoSection
        title="useCountdown"
        description="Date.now() farqi bilan — fon tabda ham to'g'ri; formatted: m:ss"
      >
        <CountdownDemo />
      </DemoSection>

      <DemoSection title="useIdle + useOnline" description="3 soniya tegmang / tarmoqni o'chiring">
        <IdleOnlineDemo />
      </DemoSection>

      <DemoSection title="useStep + usePrevious" description="Stepper bilan juft">
        <StepDemo />
      </DemoSection>

      <DemoSection title="useInfiniteScroll" description="Yuklanayotganda qayta chaqirilmaydi">
        <InfiniteScrollDemo />
      </DemoSection>
    </DemoPage>
  );
}
