import { Button, Field, IconButton, Input, Popover, Switch } from '@akhatmirzo/ui';
import { useState } from 'react';
import { Code, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'Popover', group: 'Overlay', order: 5 };

function FilterIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 5h16l-6 8v6l-4-2v-4z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
  );
}

const colors = ['bg-primary', 'bg-success', 'bg-warning', 'bg-danger', 'bg-info', 'bg-text'];

export default function Page() {
  const [range, setRange] = useState({ from: '', to: '' });
  const [applied, setApplied] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState('bg-primary');

  return (
    <DemoPage
      title="Popover"
      description={
        <>
          Ichida interaktiv kontent bo'ladigan suzuvchi panel (forma, filtr, rang tanlash). Bosish
          bilan ochiladi, fokus ichidagi birinchi elementga o'tadi; <Code>Esc</Code> yoki tashqariga
          bosish yopadi, fokus trigger'ga qaytadi.
        </>
      }
    >
      <DemoSection title="Filtr forma" description="Prototipdagi narx filtri.">
        <DemoRow>
          <Popover open={open} onOpenChange={setOpen}>
            <Popover.Trigger asChild>
              <Button variant="soft" leftIcon={<FilterIcon />}>
                Narx
              </Button>
            </Popover.Trigger>
            <Popover.Content align="start" aria-label="Narx filtri">
              <form
                className="flex flex-col gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  setApplied(`${range.from || '0'} — ${range.to || '∞'} so'm`);
                  setOpen(false);
                }}
              >
                <p className="text-sm font-semibold">Narx oralig'i</p>
                <Input
                  size="sm"
                  inputMode="numeric"
                  placeholder="dan"
                  suffix="so'm"
                  aria-label="Narx: dan"
                  value={range.from}
                  onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
                />
                <Input
                  size="sm"
                  inputMode="numeric"
                  placeholder="gacha"
                  suffix="so'm"
                  aria-label="Narx: gacha"
                  value={range.to}
                  onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
                />
                <div className="mt-1 flex justify-end gap-2">
                  <Popover.Close asChild>
                    <Button size="sm" variant="soft">
                      Bekor
                    </Button>
                  </Popover.Close>
                  <Button size="sm" variant="primary" type="submit">
                    Qo'llash
                  </Button>
                </div>
              </form>
            </Popover.Content>
          </Popover>
          <span className="text-sm text-text-muted">
            {applied ? `Tanlangan: ${applied}` : "Filtr qo'llanmagan"}
          </span>
        </DemoRow>
      </DemoSection>

      <DemoSection title="Tomonlar va strelka" description={<Code>side · align · arrow</Code>}>
        <DemoRow>
          {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
            <Popover key={side}>
              <Popover.Trigger asChild>
                <Button variant="outline">{side}</Button>
              </Popover.Trigger>
              <Popover.Content side={side} arrow className="w-56" aria-label={side}>
                <p className="text-sm text-text-muted">
                  Panel <b className="text-text">{side}</b> tomonda, trigger'dan 6px uzoqlikda.
                </p>
              </Popover.Content>
            </Popover>
          ))}
          <Popover>
            <Popover.Trigger asChild>
              <Button variant="outline">align=end</Button>
            </Popover.Trigger>
            <Popover.Content align="end" className="w-56" aria-label="align end">
              <p className="text-sm text-text-muted">O'ng chetga tekislangan.</p>
            </Popover.Content>
          </Popover>
        </DemoRow>
      </DemoSection>

      <DemoSection title="Real misollar">
        <DemoRow>
          <Popover>
            <Popover.Trigger asChild>
              <Button variant="outline">
                <span className={`inline-block size-3 rounded-full align-middle ${color}`} />
                Rang
              </Button>
            </Popover.Trigger>
            <Popover.Content className="w-auto" aria-label="Rang tanlash">
              <div className="grid grid-cols-6 gap-2">
                {colors.map((c) => (
                  <Popover.Close key={c} asChild>
                    <button
                      type="button"
                      aria-label={c.replace('bg-', '')}
                      aria-pressed={c === color}
                      onClick={() => setColor(c)}
                      className={`focus-ring size-7 cursor-pointer rounded-full border-2 ${c} ${
                        c === color ? 'border-surface ring-2 ring-primary' : 'border-transparent'
                      }`}
                    />
                  </Popover.Close>
                ))}
              </div>
            </Popover.Content>
          </Popover>

          <Popover>
            <Popover.Trigger asChild>
              <IconButton variant="ghost" aria-label="Batafsil">
                <InfoIcon />
              </IconButton>
            </Popover.Trigger>
            <Popover.Content side="right" align="start" arrow aria-label="Bildirishnomalar">
              <div className="flex flex-col gap-3">
                <p className="text-sm font-semibold">Bildirishnomalar</p>
                <Field label="Email orqali" orientation="horizontal">
                  <Switch defaultChecked />
                </Field>
                <Field label="SMS orqali" orientation="horizontal">
                  <Switch />
                </Field>
              </div>
            </Popover.Content>
          </Popover>
        </DemoRow>
      </DemoSection>
    </DemoPage>
  );
}
