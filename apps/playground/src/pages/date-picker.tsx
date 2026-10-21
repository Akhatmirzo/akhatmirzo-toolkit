import { formatDate } from '@akhatmirzo/core';
import {
  Button,
  Calendar,
  DatePicker,
  DateRangePicker,
  Dialog,
  Field,
  type DatePickerError,
  type DateRangeValue,
} from '@akhatmirzo/ui';
import { useState } from 'react';
import { Code, DemoGrid, DemoPage, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'DatePicker', group: 'Formalar', order: 6 };

const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const today = addDays(new Date(), 0);
const isSunday = (d: Date) => d.getDay() === 0;

const describe = (d: Date | null) => (d ? formatDate(d, 'd MMMM yyyy, EEEE') : '—');
const describeRange = (r: DateRangeValue | null) =>
  r?.from && r.to ? `${formatDate(r.from, 'd MMM')} – ${formatDate(r.to, 'd MMM yyyy')}` : '—';

const errorText: Record<DatePickerError, string> = {
  invalid: "noto'g'ri sana",
  unavailable: 'tanlab bo‘lmaydigan sana',
};

export default function Page() {
  const [delivery, setDelivery] = useState<Date | null>(null);
  const [birthday, setBirthday] = useState<Date | null>(new Date(1995, 4, 17));
  const [typed, setTyped] = useState<Date | null>(null);
  const [typedError, setTypedError] = useState<DatePickerError | null>(null);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [deadlineError, setDeadlineError] = useState<DatePickerError | null>(null);
  const [report, setReport] = useState<DateRangeValue | null>({
    from: addDays(today, -6),
    to: today,
  });
  const [vacation, setVacation] = useState<DateRangeValue | null>(null);
  const [inline, setInline] = useState<Date | null>(today);
  const [inlineRange, setInlineRange] = useState<DateRangeValue>({
    from: addDays(today, -3),
    to: addDays(today, 4),
  });
  const [dialogDate, setDialogDate] = useState<Date | null>(null);

  return (
    <DemoPage
      title="DatePicker"
      description={
        <>
          Sana va sanalar oralig'ini tanlash (<Code>react-day-picker</Code> ustida, o'z
          stillarimiz). Hafta dushanbadan, oylar o'zbekcha. Sanani qo'lda yozish mumkin —{' '}
          <Code>__.__.____</Code> niqobi bilan. Klaviatura: <Code>↓</Code> — kalendarga o'tish,{' '}
          <Code>← → ↑ ↓</Code> — kun/hafta, <Code>PageUp/PageDown</Code> — oy (<Code>Shift</Code> —
          yil), <Code>Home/End</Code>, <Code>Enter</Code>, <Code>Esc</Code>.
        </>
      }
    >
      <DemoSection
        title="Asosiy"
        description="O'tgan sanalar va yakshanbalar yopiq; pastda tayyor variantlar."
      >
        <DemoGrid min={260}>
          <Field
            label="Yetkazish sanasi"
            description={delivery ? describe(delivery) : 'Yozing yoki tanlang'}
          >
            <DatePicker
              value={delivery}
              onValueChange={setDelivery}
              minDate={today}
              disabledDates={isSunday}
              presets
              clearable
            />
          </Field>
          <Field label="Tug'ilgan sana" description="Sarlavhani bosing — oy va yilni tanlash">
            <DatePicker
              value={birthday}
              onValueChange={setBirthday}
              minDate={new Date(1920, 0, 1)}
              maxDate={today}
            />
          </Field>
        </DemoGrid>
      </DemoSection>

      <DemoSection
        title="Qo'lda yozish va xatolar"
        description={"Sinang: \"31022026\" — bunday sana yo'q; o'tgan sana — tanlab bo'lmaydi."}
      >
        <DemoGrid min={260}>
          <Field label="Uchrashuv sanasi">
            <DatePicker
              value={typed}
              onValueChange={setTyped}
              onErrorChange={setTypedError}
              minDate={today}
            />
          </Field>
          <div className="flex flex-col gap-1 text-sm text-text-muted">
            <span>
              Qiymat: <Code>{typed ? formatDate(typed, 'yyyy-MM-dd') : 'null'}</Code>
            </span>
            <span>
              Matn xatosi: <Code>{typedError ? errorText[typedError] : 'yo‘q'}</Code>
            </span>
          </div>
          <Field
            label="Muddat (Field xatosi bilan)"
            required
            error={
              deadlineError
                ? `Sana ${errorText[deadlineError]}`
                : deadline
                  ? undefined
                  : 'Sanani tanlang'
            }
          >
            {/* Field'da xato bo'lsa ichki xato qatori yashiriladi — xato bitta qatorda */}
            <DatePicker
              value={deadline}
              onValueChange={setDeadline}
              onErrorChange={setDeadlineError}
              minDate={today}
            />
          </Field>
        </DemoGrid>
      </DemoSection>

      <DemoSection title="O'lchamlar">
        <DemoGrid min={220}>
          <DatePicker size="sm" aria-label="Kichik" defaultValue={today} />
          <DatePicker size="md" aria-label="O'rta" defaultValue={today} />
          <DatePicker size="lg" aria-label="Katta" defaultValue={today} />
        </DemoGrid>
      </DemoSection>

      <DemoSection title="Holatlar">
        <DemoGrid min={220}>
          <Field label="O'chirilgan" disabled>
            <DatePicker defaultValue={today} />
          </Field>
          <Field label="Faqat o'qish">
            <DatePicker defaultValue={today} readOnly />
          </Field>
          <Field label="Xato" error="Sanani tanlang" required>
            <DatePicker />
          </Field>
          <Field label="Boshqa format" description={<Code>d MMMM yyyy</Code>}>
            <DatePicker format="d MMMM yyyy" defaultValue={today} placeholder="5 Noyabr 2026" />
          </Field>
        </DemoGrid>
      </DemoSection>

      <DemoSection
        title="DateRangePicker"
        description="Ikki oy (telefonda bitta); birinchi kundan keyin kursor bilan oraliq oldindan ko'rinadi."
      >
        <DemoGrid min={300}>
          <Field label="Hisobot davri" description={describeRange(report)}>
            <DateRangePicker value={report} onValueChange={setReport} presets maxDate={today} />
          </Field>
          <Field label="Ta'til" description="Yakshanbalar yopiq, tozalash mumkin">
            <DateRangePicker
              value={vacation}
              onValueChange={setVacation}
              minDate={today}
              disabledDates={isSunday}
              clearable
              presets={[
                {
                  label: 'Bir hafta',
                  range: (t) => ({ from: addDays(t, 1), to: addDays(t, 7) }),
                },
                {
                  label: 'Ikki hafta',
                  range: (t) => ({ from: addDays(t, 1), to: addDays(t, 14) }),
                },
              ]}
            />
          </Field>
          <Field label="O'chirilgan" disabled>
            <DateRangePicker value={report} />
          </Field>
          <Field label="Kichik" description='size="sm", xato holati' error="Davrni tanlang">
            <DateRangePicker size="sm" />
          </Field>
        </DemoGrid>
      </DemoSection>

      <DemoSection
        title="Calendar (alohida)"
        description="Popover'siz — sahifaga joylashtiriladigan kalendar."
      >
        <div className="flex flex-wrap items-start gap-8">
          <div className="flex flex-col gap-2">
            <Calendar value={inline} onValueChange={setInline} disabledDates={isSunday} />
            <span className="text-xs text-text-muted">{describe(inline)}</span>
          </div>
          <div className="flex flex-col gap-2">
            <Calendar
              mode="range"
              numberOfMonths={2}
              value={inlineRange}
              onValueChange={setInlineRange}
            />
            <span className="text-xs text-text-muted">
              {inlineRange.from && !inlineRange.to
                ? 'Tugash sanasini tanlang'
                : describeRange(inlineRange)}
            </span>
          </div>
        </div>
      </DemoSection>

      <DemoSection title="Dialog ichida" description="Kalendar modal qatlamidan yuqorida ochiladi.">
        <Dialog>
          <Dialog.Trigger asChild>
            <Button variant="outline">Buyurtmani rejalashtirish</Button>
          </Dialog.Trigger>
          <Dialog.Content title="Yetkazish sanasi" description="Ish kunlaridan birini tanlang.">
            <Field label="Sana">
              <DatePicker
                value={dialogDate}
                onValueChange={setDialogDate}
                minDate={today}
                disabledDates={isSunday}
                presets
              />
            </Field>
            <Dialog.Footer>
              <Dialog.Close asChild>
                <Button>Bekor qilish</Button>
              </Dialog.Close>
              <Dialog.Close asChild>
                <Button variant="primary" disabled={!dialogDate}>
                  Saqlash
                </Button>
              </Dialog.Close>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      </DemoSection>
    </DemoPage>
  );
}
