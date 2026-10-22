'use client';

import { formatPhone, parsePhone } from '@akhatmirzo/core';
import { useLocalStorage } from '@akhatmirzo/hooks';
import {
  Button,
  Checkbox,
  Combobox,
  DatePicker,
  Divider,
  Field,
  Input,
  PhoneInput,
  Radio,
  RadioGroup,
  toast,
} from '@akhatmirzo/ui';
import { ArrowLeft, ArrowRight, CheckCircle2, MapPin, Smartphone, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { regions, storageKeys, wait } from './data';
import { NewPasswordFields, validateNewPassword } from './new-password-fields';
import { OtpStep } from './otp-step';
import { SocialButtons } from './social-buttons';
import { Stepper } from './stepper';
import { useAccounts, useAuthHref, useHydrated } from './store';
import { AuthFooterLink, AuthHeader, FormSkeleton, Notice, SuccessMark } from './ui';

const STEPS = ['Telefon', "Ma'lumotlar", 'Parol'];

/** Bosqichlar orasida (va sahifa yangilanganda) saqlanadigan qoralama. Parol saqlanmaydi */
interface Draft {
  step: number;
  phone: string;
  phoneVerified: boolean;
  firstName: string;
  lastName: string;
  /** ISO sana */
  birthDate: string | null;
  gender: string;
  region: string | null;
}

const emptyDraft: Draft = {
  step: 0,
  phone: '',
  phoneVerified: false,
  firstName: '',
  lastName: '',
  birthDate: null,
  gender: '',
  region: null,
};

export function SignUpFlow() {
  return useHydrated() ? <SignUpWizard /> : <FormSkeleton fields={2} />;
}

function SignUpWizard() {
  const href = useAuthHref();
  const [draft, setDraft, clearDraft] = useLocalStorage<Draft>(storageKeys.signUp, emptyDraft);
  const [createdPhone, setCreatedPhone] = useState<string | null>(null);
  const update = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  if (createdPhone) return <SignUpSuccess phone={createdPhone} />;

  // Bosqich almashganda kontent yumshoq paydo bo'ladi
  const animate = 'motion-safe:animate-[auth-step_300ms_ease-out]';

  return (
    <>
      <Stepper steps={STEPS} current={draft.step} />
      <div key={draft.step} className={animate}>
        {draft.step === 0 && (
          <PhoneStep draft={draft} update={update} onNext={() => update({ step: 1 })} />
        )}
        {draft.step === 1 && (
          <PersonalStep
            draft={draft}
            update={update}
            onBack={() => update({ step: 0 })}
            onNext={() => update({ step: 2 })}
          />
        )}
        {draft.step === 2 && (
          <PasswordStep
            draft={draft}
            onBack={() => update({ step: 1 })}
            onCreated={() => {
              setCreatedPhone(draft.phone);
              clearDraft();
            }}
          />
        )}
      </div>
      {draft.step === 0 && (
        <AuthFooterLink text="Hisobingiz bormi?" href={href('sign-in')} label="Kirish" />
      )}
      <style>{`@keyframes auth-step{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:none}}`}</style>
    </>
  );
}

interface StepProps {
  draft: Draft;
  update: (patch: Partial<Draft>) => void;
}

/* ---------- 1. Telefon + SMS kod ---------- */

function PhoneStep({ draft, update, onNext }: StepProps & { onNext: () => void }) {
  const href = useAuthHref();
  const { findAccount } = useAccounts();
  const [stage, setStage] = useState<'phone' | 'code'>('phone');
  const [error, setError] = useState<ReactNode>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (stage === 'code') {
    return (
      <OtpStep
        phone={draft.phone}
        title="Raqamni tasdiqlang"
        submitText="Tasdiqlash va davom etish"
        onChangeNumber={() => setStage('phone')}
        onVerified={() => {
          update({ phoneVerified: true });
          toast.success('Telefon raqam tasdiqlandi');
          onNext();
        }}
      />
    );
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (draft.phoneVerified) return onNext();
    const parsed = parsePhone(draft.phone);
    if (parsed.digits.length < 9) {
      setError(draft.phone ? "Raqamni to'liq kiriting" : 'Telefon raqamini kiriting');
      return inputRef.current?.focus();
    }
    if (!parsed.valid) {
      setError("Operator kodi noto'g'ri");
      return inputRef.current?.focus();
    }
    setLoading(true);
    await wait(900);
    setLoading(false);
    if (findAccount(draft.phone)) {
      setError(
        <>
          Bu raqam allaqachon ro&apos;yxatdan o&apos;tgan.{' '}
          <Link href={href('sign-in')} className="font-semibold underline underline-offset-2">
            Kirish
          </Link>
        </>,
      );
      return inputRef.current?.focus();
    }
    setStage('code');
  };

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
      <AuthHeader
        icon={<Smartphone />}
        title="Hisob yaratish"
        description="Telefon raqamingizni kiriting — unga tasdiqlash kodi yuboramiz."
      />
      {draft.phoneVerified ? (
        <Notice
          tone="success"
          title={`${formatPhone(draft.phone)} tasdiqlangan`}
          action={
            <button
              type="button"
              className="focus-ring cursor-pointer rounded-sm text-sm font-semibold underline underline-offset-2"
              onClick={() => update({ phone: '', phoneVerified: false })}
            >
              Boshqa raqam kiritish
            </button>
          }
        />
      ) : (
        <Field label="Telefon raqam" error={error} description="Faqat O'zbekiston raqamlari">
          <PhoneInput
            ref={inputRef}
            size="lg"
            name="phone"
            autoComplete="tel-national"
            autoFocus
            value={draft.phone}
            onValueChange={(v) => {
              update({ phone: v });
              setError(null);
            }}
          />
        </Field>
      )}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={loading}
        rightIcon={<ArrowRight />}
        labels={{ loading: 'Kod yuborilmoqda' }}
      >
        {draft.phoneVerified ? 'Davom etish' : 'Kod olish'}
      </Button>
      {!draft.phoneVerified && (
        <>
          <Divider label="yoki" className="my-2" />
          <SocialButtons action="ro'yxatdan o'tish" />
        </>
      )}
    </form>
  );
}

/* ---------- 2. Shaxsiy ma'lumotlar ---------- */

type PersonalErrors = Partial<
  Record<'firstName' | 'lastName' | 'birthDate' | 'gender' | 'region', string>
>;

const NAME_RE = /^[\p{L}ʻʼ''' -]+$/u;

function yearsAgo(years: number) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d;
}

function validatePersonal(draft: Draft, dateError: string | null): PersonalErrors {
  const errors: PersonalErrors = {};
  const name = (value: string, empty: string) => {
    const v = value.trim();
    if (!v) return empty;
    if (v.length < 2) return 'Kamida 2 ta harf';
    if (!NAME_RE.test(v)) return 'Faqat harflar, apostrof va chiziqcha';
    return undefined;
  };
  errors.firstName = name(draft.firstName, 'Ismingizni kiriting');
  errors.lastName = name(draft.lastName, 'Familiyangizni kiriting');
  if (dateError) errors.birthDate = dateError;
  else if (!draft.birthDate) errors.birthDate = "Tug'ilgan sanangizni kiriting";
  if (!draft.gender) errors.gender = 'Jinsingizni tanlang';
  if (!draft.region) errors.region = 'Yashash hududingizni tanlang';
  return Object.fromEntries(Object.entries(errors).filter(([, v]) => v)) as PersonalErrors;
}

function PersonalStep({
  draft,
  update,
  onBack,
  onNext,
}: StepProps & { onBack: () => void; onNext: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const errors = submitted ? validatePersonal(draft, dateError) : {};
  // Sana obyektlari har chizishda yangilanmasligi uchun
  const maxDate = useMemo(() => yearsAgo(16), []);
  const minDate = useMemo(() => new Date(1920, 0, 1), []);
  const birthDate = useMemo(
    () => (draft.birthDate ? new Date(draft.birthDate) : null),
    [draft.birthDate],
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(validatePersonal(draft, dateError)).length > 0) {
      // Birinchi xatoli maydonga fokus (chizilgandan keyin)
      requestAnimationFrame(() =>
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      );
      return;
    }
    onNext();
  };

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
      <AuthHeader
        focusOnMount
        icon={<UserRound />}
        title="O'zingiz haqingizda"
        description="Ma'lumotlar pasportingizdagidek bo'lishi kerak — ular xizmatlardan foydalanishda kerak bo'ladi."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Ism" required error={errors.firstName}>
          <Input
            size="lg"
            name="given-name"
            autoComplete="given-name"
            placeholder="Aziza"
            value={draft.firstName}
            onChange={(e) => update({ firstName: e.target.value })}
          />
        </Field>
        <Field label="Familiya" required error={errors.lastName}>
          <Input
            size="lg"
            name="family-name"
            autoComplete="family-name"
            placeholder="Karimova"
            value={draft.lastName}
            onChange={(e) => update({ lastName: e.target.value })}
          />
        </Field>
      </div>
      <Field
        label="Tug'ilgan sana"
        required
        error={errors.birthDate}
        description="Xizmatdan 16 yoshdan foydalanish mumkin"
      >
        <DatePicker
          size="lg"
          name="bday"
          autoComplete="bday"
          minDate={minDate}
          maxDate={maxDate}
          value={birthDate}
          onValueChange={(d) => update({ birthDate: d ? d.toISOString() : null })}
          onErrorChange={(err) =>
            setDateError(
              err === 'invalid'
                ? "Bunday sana yo'q — kk.oo.yyyy shaklida yozing"
                : err === 'unavailable'
                  ? "Yoshingiz kamida 16 bo'lishi kerak"
                  : null,
            )
          }
        />
      </Field>
      <Field label="Jins" required error={errors.gender}>
        <RadioGroup
          variant="card"
          orientation="horizontal"
          value={draft.gender}
          onValueChange={(v) => update({ gender: v })}
          className="grid grid-cols-2 gap-3 *:min-w-0"
        >
          <Radio value="erkak" label="Erkak" />
          <Radio value="ayol" label="Ayol" />
        </RadioGroup>
      </Field>
      <Field label="Viloyat" required error={errors.region}>
        <Combobox
          size="lg"
          options={regions}
          leftIcon={<MapPin />}
          placeholder="Hududni tanlang"
          searchPlaceholder="Viloyat nomi..."
          emptyText="Hech narsa topilmadi"
          value={draft.region}
          onValueChange={(v) => update({ region: v })}
        />
      </Field>
      <StepActions onBack={onBack} nextText="Davom etish" />
    </form>
  );
}

/* ---------- 3. Parol ---------- */

function PasswordStep({
  draft,
  onBack,
  onCreated,
}: {
  draft: Draft;
  onBack: () => void;
  onCreated: () => void;
}) {
  const { addAccount } = useAccounts();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agree, setAgree] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const agreeRef = useRef<HTMLInputElement>(null);

  const errors = submitted ? validateNewPassword(password, confirm) : {};
  const agreeError = submitted && !agree;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const found = validateNewPassword(password, confirm);
    if (found.password) return passwordRef.current?.focus();
    if (found.confirm) return confirmRef.current?.focus();
    if (!agree) return agreeRef.current?.focus();

    setLoading(true);
    await wait(1400);
    addAccount({
      phone: draft.phone,
      email: '',
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
      password,
      region: draft.region ?? undefined,
      createdAt: new Date().toISOString(),
    });
    toast.success('Hisob yaratildi', { description: `Xush kelibsiz, ${draft.firstName.trim()}!` });
    onCreated();
  };

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
      <AuthHeader
        focusOnMount
        icon={<CheckCircle2 />}
        title="Parol o'rnating"
        description="Kuchli parol hisobingizni begona kishilardan himoya qiladi."
      />
      <NewPasswordFields
        password={password}
        confirm={confirm}
        onPasswordChange={setPassword}
        onConfirmChange={setConfirm}
        errors={errors}
        passwordRef={passwordRef}
        confirmRef={confirmRef}
      />
      <Checkbox
        ref={agreeRef}
        checked={agree}
        onCheckedChange={setAgree}
        invalid={agreeError}
        label={
          <>
            <a
              href="#shartlar"
              className="focus-ring rounded-sm font-medium text-link hover:underline"
            >
              Foydalanish shartlari
            </a>{' '}
            va{' '}
            <a
              href="#maxfiylik"
              className="focus-ring rounded-sm font-medium text-link hover:underline"
            >
              maxfiylik siyosati
            </a>
            ga roziman
          </>
        }
        description={
          agreeError ? (
            <span role="alert" className="text-danger-soft-foreground">
              Davom etish uchun shartlarga rozilik bildiring
            </span>
          ) : undefined
        }
      />
      <StepActions onBack={onBack} nextText="Hisob yaratish" loading={loading} />
    </form>
  );
}

function StepActions({
  onBack,
  nextText,
  loading = false,
}: {
  onBack: () => void;
  nextText: string;
  loading?: boolean;
}) {
  return (
    <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row">
      <Button
        type="button"
        variant="ghost"
        size="lg"
        leftIcon={<ArrowLeft />}
        onClick={onBack}
        disabled={loading}
        className="sm:w-auto"
      >
        Orqaga
      </Button>
      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        rightIcon={<ArrowRight />}
        labels={{ loading: 'Yaratilmoqda' }}
        className="w-full sm:w-auto sm:flex-1"
      >
        {nextText}
      </Button>
    </div>
  );
}

/* ---------- Muvaffaqiyat ---------- */

function SignUpSuccess({ phone }: { phone: string }) {
  const router = useRouter();
  const href = useAuthHref();
  const [, setRemembered] = useLocalStorage<unknown>(storageKeys.remembered, null);

  return (
    <div className="text-center">
      <SuccessMark />
      <AuthHeader
        focusOnMount
        title="Hisob yaratildi!"
        description={
          <>
            Endi <span className="font-semibold text-text tabular-nums">{formatPhone(phone)}</span>{' '}
            raqami va parolingiz bilan istalgan qurilmadan kirishingiz mumkin.
          </>
        }
      />
      <Button
        variant="primary"
        size="lg"
        fullWidth
        rightIcon={<ArrowRight />}
        onClick={() => {
          // Kirish formasida raqam tayyor turadi
          setRemembered({ method: 'phone', login: phone });
          router.push(href('sign-in'));
        }}
      >
        Hisobga kirish
      </Button>
    </div>
  );
}
