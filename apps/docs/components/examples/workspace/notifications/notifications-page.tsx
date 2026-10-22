'use client';

import { Button, Checkbox, Field, Select, Switch, cn, toast } from '@akhatmirzo/ui';
import { Bell, Mail, MessageSquare, Moon, Send } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import {
  channels,
  notificationGroups,
  timeOptions,
  type Channel,
  type NotificationSettings,
} from '../data';
import { fakeRequest, useWorkspace } from '../store';
import { PageHeader, SettingsSection, UnsavedBar } from '../ui';
import { useUnsavedChanges } from '../unsaved';

const channelIcons: Record<Channel, ReactNode> = {
  email: <Mail />,
  sms: <MessageSquare />,
  push: <Bell />,
  telegram: <Send />,
};

/** Matritsa ustunlari: hodisa nomi + 4 ta kanal */
const gridCols = 'sm:grid sm:grid-cols-[minmax(0,1fr)_repeat(4,72px)] sm:items-center';

export function NotificationsPage() {
  const { notifications, setNotifications } = useWorkspace();
  const [draft, setDraft] = useState<NotificationSettings | null>(null);
  const [saving, setSaving] = useState(false);

  const value = draft ?? notifications;
  const dirty = draft !== null && JSON.stringify(draft) !== JSON.stringify(notifications);
  const quietError =
    value.quiet.enabled && value.quiet.from === value.quiet.to
      ? "Boshlanish va tugash vaqti bir xil bo'lmasligi kerak"
      : undefined;

  useUnsavedChanges(dirty);

  const update = (fn: (prev: NotificationSettings) => NotificationSettings) =>
    setDraft((prev) => fn(prev ?? notifications));

  const toggleChannel = (channel: Channel, on: boolean) =>
    update((prev) => ({ ...prev, channels: { ...prev.channels, [channel]: on } }));

  const toggleEvent = (eventId: string, channel: Channel, on: boolean) =>
    update((prev) => {
      const current = prev.matrix[eventId] ?? [];
      const next = on ? [...current, channel] : current.filter((c) => c !== channel);
      return { ...prev, matrix: { ...prev.matrix, [eventId]: next } };
    });

  const setQuiet = (patch: Partial<NotificationSettings['quiet']>) =>
    update((prev) => ({ ...prev, quiet: { ...prev.quiet, ...patch } }));

  const save = async () => {
    if (!draft || quietError) return;
    setSaving(true);
    await fakeRequest(700);
    setNotifications(draft);
    setDraft(null);
    setSaving(false);
    toast.success('Bildirishnoma sozlamalari saqlandi');
  };

  const enabledCount = Object.values(value.channels).filter(Boolean).length;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeader
        title="Bildirishnomalar"
        description="Qaysi hodisalar haqida va qayerga xabar olishingizni tanlang."
        actions={
          <Button
            variant="primary"
            onClick={save}
            loading={saving}
            disabled={!dirty || !!quietError}
          >
            Saqlash
          </Button>
        }
      />

      <div className="flex flex-col gap-6">
        <SettingsSection
          title="Kanallar"
          description={`${enabledCount} ta kanal yoqilgan. O'chirilgan kanalga hech qanday xabar yuborilmaydi.`}
        >
          <ul className="grid gap-3 sm:grid-cols-2">
            {channels.map((c) => (
              <li
                key={c.id}
                className={cn(
                  'flex items-center gap-3 rounded-xl border p-3 transition-colors duration-fast',
                  value.channels[c.id] ? 'border-primary/40 bg-primary-soft/40' : 'border-border',
                )}
              >
                <span
                  aria-hidden="true"
                  className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-muted text-text-subtle [&_svg]:size-4.5"
                >
                  {channelIcons[c.id]}
                </span>
                <Switch
                  className="min-w-0 flex-1 flex-row-reverse justify-between"
                  label={c.label}
                  description={c.hint}
                  checked={value.channels[c.id]}
                  onCheckedChange={(on) => toggleChannel(c.id, on)}
                />
              </li>
            ))}
          </ul>
        </SettingsSection>

        <SettingsSection
          title="Hodisalar"
          description="Har bir hodisa uchun kanallarni belgilang. Xavfsizlik xabarlarini o'chirmaslikni maslahat beramiz."
        >
          <div role="group" aria-label="Hodisalar va kanallar">
            <div
              aria-hidden="true"
              className={cn(
                'hidden border-b border-border pb-2 text-xs font-medium text-text-muted',
                gridCols,
              )}
            >
              <span>Hodisa</span>
              {channels.map((c) => (
                <span key={c.id} className="text-center">
                  {c.label}
                </span>
              ))}
            </div>

            {notificationGroups.map((group) => (
              <div key={group.title} className="pt-4">
                <h3 className="pb-1 text-xs font-semibold tracking-wide text-text-faint uppercase">
                  {group.title}
                </h3>
                <ul className="divide-y divide-border">
                  {group.events.map((event) => (
                    <li key={event.id} className={cn('py-3', gridCols)}>
                      <div className="min-w-0 pb-2 sm:pb-0">
                        <p className="text-sm font-medium">{event.label}</p>
                        <p className="text-xs text-text-muted">{event.description}</p>
                      </div>
                      <div className="flex flex-wrap gap-x-5 gap-y-2 sm:contents">
                        {channels.map((c) => {
                          const on = value.matrix[event.id]?.includes(c.id) ?? false;
                          const off = !value.channels[c.id];
                          return (
                            <div key={c.id} className="flex items-center gap-2 sm:justify-center">
                              <Checkbox
                                aria-label={`${event.label}: ${c.label}`}
                                checked={on && !off}
                                disabled={off}
                                onCheckedChange={(v) => toggleEvent(event.id, c.id, v)}
                              />
                              <span
                                aria-hidden="true"
                                className="text-xs text-text-muted sm:hidden"
                              >
                                {c.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </SettingsSection>

        <SettingsSection
          title="Jim soatlar"
          description="Bu vaqtda faqat xavfsizlik va to'lov xatolari haqida xabar keladi."
        >
          <Switch
            label="Jim soatlarni yoqish"
            description={
              value.quiet.enabled
                ? `Har kuni ${value.quiet.from} dan ${value.quiet.to} gacha`
                : 'Xabarlar istalgan vaqtda keladi'
            }
            checked={value.quiet.enabled}
            onCheckedChange={(enabled) => setQuiet({ enabled })}
          />
          <div
            className={cn(
              'mt-5 grid gap-5 transition-opacity duration-base sm:grid-cols-2',
              !value.quiet.enabled && 'opacity-60',
            )}
          >
            <Field label="Boshlanish" disabled={!value.quiet.enabled} error={quietError}>
              <Select value={value.quiet.from} onValueChange={(from) => setQuiet({ from })}>
                {timeOptions.map((t) => (
                  <Select.Item key={t} value={t}>
                    {t}
                  </Select.Item>
                ))}
              </Select>
            </Field>
            <Field label="Tugash" disabled={!value.quiet.enabled}>
              <Select value={value.quiet.to} onValueChange={(to) => setQuiet({ to })}>
                {timeOptions.map((t) => (
                  <Select.Item key={t} value={t}>
                    {t}
                  </Select.Item>
                ))}
              </Select>
            </Field>
            <Checkbox
              className="sm:col-span-2"
              label="Dam olish kunlari butun kun jim"
              description="Shanba va yakshanba kunlari xabarlar kelmaydi"
              checked={value.quiet.weekends}
              disabled={!value.quiet.enabled}
              onCheckedChange={(weekends) => setQuiet({ weekends })}
            />
          </div>
          {value.quiet.enabled && (
            <p className="mt-4 flex items-center gap-2 rounded-lg bg-surface-muted px-3 py-2 text-sm text-text-muted">
              <Moon aria-hidden="true" className="size-4 shrink-0" />
              {value.quiet.from} — {value.quiet.to}
              {value.quiet.weekends && ', dam olish kunlari butun kun'}
            </p>
          )}
        </SettingsSection>

        <UnsavedBar
          show={dirty}
          saving={saving}
          canSave={!quietError}
          onDiscard={() => setDraft(null)}
          onSave={save}
        />
      </div>
    </div>
  );
}
