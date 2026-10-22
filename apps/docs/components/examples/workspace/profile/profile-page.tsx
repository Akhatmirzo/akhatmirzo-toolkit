'use client';

import { Avatar, Button, Field, FileUpload, Input, Select, Textarea, toast } from '@akhatmirzo/ui';
import { Clock } from 'lucide-react';
import { useState, useSyncExternalStore } from 'react';
import { languages, timezones, type Profile } from '../data';
import { fakeRequest, useWorkspace } from '../store';
import { PageHeader, SettingsSection, UnsavedBar } from '../ui';
import { useUnsavedChanges } from '../unsaved';
import { uploadAvatar } from '../utils';

const BIO_MAX = 280;

export function ProfilePage() {
  const { profile, setProfile } = useWorkspace();
  // Faqat o'zgargan maydonlar saqlanadi — saqlangan profil localStorage'dan kech kelsa ham to'g'ri
  const [edits, setEdits] = useState<Partial<Profile>>({});
  const [saving, setSaving] = useState(false);
  const [uploadKey, setUploadKey] = useState(0);

  const values: Profile = { ...profile, ...edits };
  const dirty = (Object.keys(edits) as (keyof Profile)[]).some((k) => edits[k] !== profile[k]);
  const nameError =
    values.name.trim().length === 0
      ? 'Ismingizni kiriting'
      : values.name.trim().length < 3
        ? 'Kamida 3 ta harf'
        : undefined;

  useUnsavedChanges(dirty);

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    setEdits((prev) => ({ ...prev, [key]: value }));

  const discard = () => {
    setEdits({});
    setUploadKey((k) => k + 1);
  };

  const save = async () => {
    if (nameError) return;
    setSaving(true);
    await fakeRequest(800);
    setProfile({ ...values, name: values.name.trim(), bio: values.bio.trim() });
    setEdits({});
    setSaving(false);
    toast.success('Profil saqlandi');
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeader
        title="Profil"
        description="Jamoadoshlaringiz sizni shu ma'lumotlar bo'yicha taniydi."
        actions={
          <Button
            variant="primary"
            onClick={save}
            loading={saving}
            disabled={!dirty || !!nameError}
          >
            Saqlash
          </Button>
        }
      />

      <form
        className="flex flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <SettingsSection
          title="Profil rasmi"
          description="Kvadrat rasm yaxshi ko'rinadi, 5 MB gacha."
        >
          <div className="flex flex-wrap items-center gap-5">
            <Avatar
              size="xl"
              name={values.name || '?'}
              src={values.avatar}
              className="size-20 text-2xl"
            />
            <div className="flex flex-col items-start gap-2">
              <FileUpload
                key={uploadKey}
                variant="button"
                accept={['image/*']}
                maxSize={5 * 1024 * 1024}
                upload={uploadAvatar}
                aria-label="Profil rasmi"
                labels={{ button: 'Yangi rasm yuklash' }}
                onFilesChange={(items) => {
                  const done = items.findLast((it) => it.status === 'done');
                  if (typeof done?.result === 'string' && done.result !== values.avatar)
                    set('avatar', done.result);
                }}
              />
              {values.avatar && (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="text-danger-soft-foreground"
                  onClick={() => set('avatar', undefined)}
                >
                  Rasmni olib tashlash
                </Button>
              )}
            </div>
          </div>
        </SettingsSection>

        <SettingsSection title="Shaxsiy ma'lumotlar">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Ism-familiya" required error={nameError}>
              <Input value={values.name} onChange={(e) => set('name', e.target.value)} />
            </Field>
            <Field label="Lavozim">
              <Input value={values.title} onChange={(e) => set('title', e.target.value)} />
            </Field>
            <Field
              label="Email"
              description="Emailni faqat administrator o'zgartira oladi"
              className="sm:col-span-2"
              disabled
            >
              <Input value={values.email} readOnly />
            </Field>
            <Field
              label="O'zingiz haqingizda"
              description="Profil kartangizda ko'rinadi"
              className="sm:col-span-2"
            >
              <Textarea
                value={values.bio}
                onChange={(e) => set('bio', e.target.value)}
                maxLength={BIO_MAX}
                showCount
                autoResize
                minRows={3}
                maxRows={8}
                placeholder="Nima bilan shug'ullanasiz, qaysi loyihalarda ishlaysiz..."
              />
            </Field>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Til va vaqt"
          description="Interfeys tili hamda sana va vaqtlarni ko'rsatish uchun."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Interfeys tili">
              <Select value={values.language} onValueChange={(v) => set('language', v)}>
                {languages.map((l) => (
                  <Select.Item key={l.value} value={l.value}>
                    {l.label}
                  </Select.Item>
                ))}
              </Select>
            </Field>
            <Field label="Vaqt mintaqasi">
              <Select value={values.timezone} onValueChange={(v) => set('timezone', v)}>
                {timezones.map((t) => (
                  <Select.Item key={t.value} value={t.value}>
                    {t.label}
                  </Select.Item>
                ))}
              </Select>
            </Field>
          </div>
          <LocalTime timezone={values.timezone} />
        </SettingsSection>

        <UnsavedBar
          show={dirty}
          saving={saving}
          canSave={!nameError}
          onDiscard={discard}
          onSave={save}
        />
      </form>
    </div>
  );
}

/* Tanlangan mintaqadagi joriy vaqt — har 15 soniyada yangilanadi, serverda chizilmaydi */
const subscribeClock = (onChange: () => void) => {
  const timer = setInterval(onChange, 15_000);
  return () => clearInterval(timer);
};

function LocalTime({ timezone }: { timezone: string }) {
  const time = useSyncExternalStore(
    subscribeClock,
    () =>
      new Intl.DateTimeFormat('uz-UZ', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      }).format(Date.now()),
    () => '',
  );
  return (
    <p className="mt-4 flex items-center gap-2 text-sm text-text-muted">
      <Clock aria-hidden="true" className="size-4" />
      Shu mintaqada hozir: <span className="font-medium text-text tabular-nums">{time || '—'}</span>
    </p>
  );
}
