'use client';

import { useCopyToClipboard } from '@akhatmirzo/hooks';
import {
  Badge,
  Button,
  Dialog,
  IconButton,
  OtpInput,
  Tooltip,
  confirm,
  toast,
} from '@akhatmirzo/ui';
import { Check, Copy, Download, KeyRound, ShieldCheck, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { company } from '../data';
import { fakeRequest, useWorkspace } from '../store';
import { SettingsSection } from '../ui';
import { downloadText } from '../utils';

const SECRET = 'JBSW Y3DP EHPK 3PXP K7QM';
const RECOVERY_CODES = [
  '4F7K-2M9Q',
  'X8PL-6TRA',
  'B3NW-Q1ZD',
  'H5YC-8VKE',
  'R2JT-4GSU',
  'M9DF-7LXB',
  'C6QA-3WNP',
  'T1EV-5HYR',
];

export function TwoFactorSection() {
  const { security, setSecurity } = useWorkspace();
  const [open, setOpen] = useState(false);

  const disable = async () => {
    const ok = await confirm({
      title: "Ikki bosqichli himoyani o'chirasizmi?",
      description:
        "Hisobingizga faqat parol bilan kirish mumkin bo'ladi. Bu xavfsizlikni pasaytiradi.",
      confirmText: "O'chirish",
      variant: 'danger',
      onConfirm: () => fakeRequest(600),
    });
    if (!ok) return;
    setSecurity((prev) => ({ ...prev, twoFactor: false }));
    toast.warning("Ikki bosqichli autentifikatsiya o'chirildi");
  };

  return (
    <SettingsSection
      title="Ikki bosqichli autentifikatsiya"
      description="Paroldan tashqari telefoningizdagi ilova yaratgan bir martalik kod so'raladi."
    >
      <div className="flex flex-wrap items-center gap-4">
        <span
          aria-hidden="true"
          className={
            'grid size-11 shrink-0 place-items-center rounded-xl [&_svg]:size-5 ' +
            (security.twoFactor
              ? 'bg-success-soft text-success-soft-foreground'
              : 'bg-surface-muted text-text-muted')
          }
        >
          <ShieldCheck />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-sm font-medium">
            Authenticator ilovasi
            {security.twoFactor ? (
              <Badge color="success" dot>
                Yoqilgan
              </Badge>
            ) : (
              <Badge color="warning" dot>
                O&apos;chiq
              </Badge>
            )}
          </p>
          <p className="text-sm text-text-muted">
            Google Authenticator, Microsoft Authenticator yoki 1Password.
          </p>
        </div>
        {security.twoFactor ? (
          <Button variant="outline" onClick={disable}>
            O&apos;chirish
          </Button>
        ) : (
          <Button variant="primary" onClick={() => setOpen(true)}>
            Yoqish
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        {open && (
          <Dialog.Content
            size="md"
            mobileSheet
            title="Ikki bosqichli himoyani yoqish"
            description="Uchta qisqa qadam: skanerlash, kodni tasdiqlash, zaxira kodlarni saqlash."
          >
            <SetupFlow
              onDone={() => {
                setSecurity((prev) => ({ ...prev, twoFactor: true }));
                setOpen(false);
                toast.success('Ikki bosqichli himoya yoqildi', {
                  description: "Keyingi kirishda ilovadagi kod so'raladi.",
                });
              }}
            />
          </Dialog.Content>
        )}
      </Dialog>
    </SettingsSection>
  );
}

type Step = 'scan' | 'verify' | 'codes';

function SetupFlow({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<Step>('scan');
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);
  const secret = useCopyToClipboard();
  const codes = useCopyToClipboard();

  const verify = async (value: string) => {
    setChecking(true);
    await fakeRequest(700);
    setChecking(false);
    // Namunada "000000" — noto'g'ri kod, qolganlari qabul qilinadi
    if (value === '000000') {
      setError(true);
      setCode('');
      return;
    }
    setStep('codes');
  };

  const steps: Step[] = ['scan', 'verify', 'codes'];
  const index = steps.indexOf(step);

  return (
    <div className="flex flex-col gap-5">
      <ol aria-label="Qadamlar" className="flex items-center gap-2 text-xs font-medium">
        {['Skanerlash', 'Tasdiqlash', 'Zaxira kodlar'].map((label, i) => (
          <li
            key={label}
            aria-current={i === index ? 'step' : undefined}
            className="flex flex-1 flex-col gap-1.5"
          >
            <span
              className={'h-1 rounded-full ' + (i <= index ? 'bg-primary' : 'bg-surface-muted')}
            />
            <span className={i === index ? 'text-text' : 'text-text-muted'}>
              {i + 1}. {label}
            </span>
          </li>
        ))}
      </ol>

      {step === 'scan' && (
        <>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <FakeQr />
            <div className="flex min-w-0 flex-col gap-3 text-sm">
              <p>
                <Smartphone aria-hidden="true" className="mr-1 inline size-4 align-[-3px]" />
                Authenticator ilovasini oching va QR kodni skanerlang.
              </p>
              <p className="text-text-muted">
                Skanerlab bo&apos;lmasa, kalitni qo&apos;lda kiriting:
              </p>
              <div className="flex items-center gap-2 rounded-lg bg-surface-muted py-1.5 pr-1.5 pl-3">
                <code className="min-w-0 flex-1 truncate font-mono text-sm">{SECRET}</code>
                <Tooltip content={secret.copied ? 'Nusxalandi' : 'Nusxa olish'}>
                  <IconButton
                    size="sm"
                    variant="ghost"
                    aria-label="Kalitdan nusxa olish"
                    onClick={() => secret.copy(SECRET.replace(/\s/g, ''))}
                  >
                    {secret.copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          </div>
          <Dialog.Footer>
            <Dialog.Close asChild>
              <Button variant="ghost">Bekor qilish</Button>
            </Dialog.Close>
            <Button variant="primary" onClick={() => setStep('verify')}>
              Keyingi
            </Button>
          </Dialog.Footer>
        </>
      )}

      {step === 'verify' && (
        <>
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-text-muted">
              Ilovada ko&apos;rsatilgan 6 xonali kodni kiriting.
              <br />
              <span className="text-xs">
                Namunada istalgan kod mos, faqat 000000 — noto&apos;g&apos;ri.
              </span>
            </p>
            <OtpInput
              length={6}
              autoFocus
              value={code}
              invalid={error}
              disabled={checking}
              onValueChange={(v) => {
                setCode(v);
                setError(false);
              }}
              onComplete={verify}
              labels={{ group: 'Tasdiqlash kodi' }}
            />
            <p role="alert" className="min-h-5 text-sm text-danger-soft-foreground">
              {error && "Kod noto'g'ri. Ilovadagi yangi kodni kiriting."}
            </p>
          </div>
          <Dialog.Footer>
            <Button variant="ghost" onClick={() => setStep('scan')} disabled={checking}>
              Orqaga
            </Button>
            <Button
              variant="primary"
              loading={checking}
              disabled={code.length < 6}
              onClick={() => verify(code)}
            >
              Tasdiqlash
            </Button>
          </Dialog.Footer>
        </>
      )}

      {step === 'codes' && (
        <>
          <div className="flex flex-col gap-3 text-sm">
            <p className="flex items-start gap-2 rounded-lg bg-warning-soft px-3 py-2 text-warning-soft-foreground">
              <KeyRound aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              Telefoningiz yo&apos;qolsa, shu kodlar bilan kirasiz. Har bir kod bir marta ishlaydi —
              ularni xavfsiz joyda saqlang.
            </p>
            <ul className="grid grid-cols-2 gap-2 rounded-xl border border-border p-3 font-mono text-sm">
              {RECOVERY_CODES.map((c) => (
                <li key={c} className="text-center tabular-nums">
                  {c}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="soft"
                leftIcon={codes.copied ? <Check /> : <Copy />}
                onClick={() => codes.copy(RECOVERY_CODES.join('\n'))}
              >
                {codes.copied ? 'Nusxalandi' : 'Nusxa olish'}
              </Button>
              <Button
                size="sm"
                variant="soft"
                leftIcon={<Download />}
                onClick={() =>
                  downloadText(
                    'zaxira-kodlar.txt',
                    `${company.name} — zaxira kodlar\n\n${RECOVERY_CODES.join('\n')}\n`,
                  )
                }
              >
                Yuklab olish
              </Button>
            </div>
          </div>
          <Dialog.Footer>
            <Button variant="primary" onClick={onDone}>
              Saqladim, tayyor
            </Button>
          </Dialog.Footer>
        </>
      )}
    </div>
  );
}

/** QR kod o'rnidagi bezak: deterministik naqsh + uchta burchak belgisi */
function FakeQr() {
  const size = 21;
  const cells: [number, number][] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const inFinder = (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12);
      if (!inFinder && (x * 7 + y * 13 + x * y) % 5 < 2) cells.push([x, y]);
    }
  }
  const finder = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={7} height={7} rx={1.2} fill="currentColor" />
      <rect x={x + 1} y={y + 1} width={5} height={5} rx={0.8} className="fill-surface" />
      <rect x={x + 2} y={y + 2} width={3} height={3} rx={0.6} fill="currentColor" />
    </g>
  );
  return (
    <div className="shrink-0 rounded-xl border border-border bg-surface p-3">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="size-36 text-text"
        role="img"
        aria-label="QR kod (namuna)"
      >
        {cells.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="currentColor" />
        ))}
        {finder(0, 0)}
        {finder(14, 0)}
        {finder(0, 14)}
      </svg>
    </div>
  );
}
