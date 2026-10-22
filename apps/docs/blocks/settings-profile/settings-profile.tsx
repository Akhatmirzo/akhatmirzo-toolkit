'use client';

import { UZ_REGIONS, formatPhone } from '@akhatmirzo/core';
import { zUz } from '@akhatmirzo/core/zod';
import {
  Avatar,
  Button,
  Card,
  Input,
  PhoneInput,
  RegionSelect,
  Switch,
  Textarea,
  toast,
} from '@akhatmirzo/ui';
import { Form, FormField, FormRootError, FormSubmit } from '@akhatmirzo/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ImageUp, Trash2 } from 'lucide-react';
import { useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  avatar: z.string().nullable(),
  fullName: z
    .string()
    .trim()
    .min(3, "Ism va familiyani to'liq kiriting")
    .max(60, 'Juda uzun — 60 belgigacha'),
  email: zUz.email(),
  phone: zUz.phone(),
  region: zUz.region(),
  bio: z.string().max(160, "Ko'pi bilan 160 belgi").optional(),
  newsletter: z.boolean(),
});

type ProfileInput = z.input<typeof schema>;
type Profile = z.output<typeof schema>;

const DEFAULTS: ProfileInput = {
  avatar: null,
  fullName: 'Dilnoza Yusupova',
  email: 'dilnoza@chorsu.uz',
  phone: '901234567',
  region: 'tashkent-city',
  bio: "Chorsu Market'da mahsulot menejeri. Milliy hunarmandchilik mahsulotlari bo'yicha mas'ul.",
  newsletter: true,
};

/** Avatar uchun eng katta fayl hajmi */
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function SettingsProfileBlock() {
  const form = useForm<ProfileInput, unknown, Profile>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULTS,
  });
  const fullName = useWatch({ control: form.control, name: 'fullName' });
  const fileRef = useRef<HTMLInputElement>(null);

  const save = async (profile: Profile) => {
    // Haqiqiy ilovada — API so'rovi. Sinov: "band@misol.uz" — server xatosi
    await wait(1000);
    if (profile.email === 'band@misol.uz') {
      form.setError('root.server', {
        message: "Bu email boshqa hisobga bog'langan. Boshqa manzil kiriting.",
      });
      return;
    }
    // Saqlangan qiymatlar — yangi "boshlang'ich" holat (PhoneInput 998 siz 9 raqam kutadi)
    form.reset({ ...profile, phone: profile.phone.slice(3) });
    toast.success('Profil saqlandi', {
      description: `${formatPhone(`+${profile.phone}`)} · ${UZ_REGIONS.find((r) => r.id === profile.region)?.name ?? ''}`,
    });
  };

  return (
    <section className="@container w-full bg-background font-sans text-text">
      <Form form={form} onSubmit={save} className="flex flex-col gap-6 p-4 @3xl:p-8">
        <div className="flex flex-col gap-1">
          <h2 className="m-0 text-2xl font-bold tracking-tight">Profil</h2>
          <p className="m-0 text-sm text-text-muted">
            Bu ma&apos;lumotlar mijozlar va jamoa a&apos;zolariga ko&apos;rinadi.
          </p>
        </div>

        <div className="grid gap-6 @4xl:grid-cols-[240px_minmax(0,1fr)] @4xl:gap-10">
          <div className="flex flex-col gap-1">
            <h3 className="m-0 text-base font-semibold">Shaxsiy ma&apos;lumotlar</h3>
            <p className="m-0 text-sm text-text-muted">
              Rasm, ism va aloqa ma&apos;lumotlari. Telefon raqami SMS orqali tasdiqlanadi.
            </p>
          </div>

          <Card className="gap-6">
            {/* Maxsus boshqaruv — `render` bilan: rasm tanlash, ko'rish va o'chirish */}
            <FormField
              name="avatar"
              label="Profil rasmi"
              description="PNG yoki JPG, 2 MB gacha"
              render={({ value, onValueChange, id }) => {
                const src = typeof value === 'string' ? value : undefined;
                return (
                  <div className="flex flex-wrap items-center gap-4">
                    <Avatar name={fullName} src={src} size="xl" />
                    <input
                      ref={fileRef}
                      id={id}
                      type="file"
                      accept="image/png,image/jpeg"
                      className="sr-only"
                      tabIndex={-1}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = '';
                        if (!file) return;
                        if (file.size > MAX_AVATAR_BYTES) {
                          toast.error('Rasm juda katta', {
                            description: '2 MB gacha fayl tanlang',
                          });
                          return;
                        }
                        // Oldingi vaqtinchalik URL'ni bo'shatamiz (xotira oqmasligi uchun)
                        if (src?.startsWith('blob:')) URL.revokeObjectURL(src);
                        onValueChange(URL.createObjectURL(file));
                      }}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<ImageUp />}
                        onClick={() => fileRef.current?.click()}
                      >
                        Rasm yuklash
                      </Button>
                      {src && (
                        <Button
                          size="sm"
                          variant="ghost"
                          leftIcon={<Trash2 />}
                          onClick={() => {
                            if (src?.startsWith('blob:')) URL.revokeObjectURL(src);
                            onValueChange(null);
                          }}
                        >
                          O&apos;chirish
                        </Button>
                      )}
                    </div>
                  </div>
                );
              }}
            />

            <FormField name="fullName" label="Ism va familiya" required>
              <Input autoComplete="name" />
            </FormField>

            <div className="grid gap-6 @2xl:grid-cols-2">
              <FormField name="email" label="Email" required>
                <Input type="email" autoComplete="email" placeholder="ism@misol.uz" />
              </FormField>
              <FormField name="phone" label="Telefon" description="SMS kod yuboriladi" required>
                <PhoneInput autoComplete="tel" />
              </FormField>
            </div>

            <FormField
              name="region"
              label="Hudud"
              description="Buyurtmalar shu hududdan yetkaziladi"
              required
            >
              <RegionSelect />
            </FormField>

            <FormField name="bio" label="O'zingiz haqingizda" description="160 belgigacha">
              <Textarea minRows={3} maxLength={160} showCount />
            </FormField>

            <FormField name="newsletter">
              <Switch label="Haftalik hisobot va aksiyalarni emailga yuborish" />
            </FormField>

            <FormRootError />

            <div className="flex flex-col-reverse gap-2 border-t border-border pt-6 @md:flex-row @md:justify-end">
              {/* Oxirgi saqlangan (yoki boshlang'ich) qiymatlarga qaytaradi */}
              <Button variant="ghost" onClick={() => form.reset()}>
                Bekor qilish
              </Button>
              <FormSubmit>Saqlash</FormSubmit>
            </div>
          </Card>
        </div>
      </Form>
    </section>
  );
}
