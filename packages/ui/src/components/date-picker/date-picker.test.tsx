import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Field } from '../field/field';
import { DatePicker } from './date-picker';

const TODAY = new Date(2026, 9, 21);

const input = () => screen.getByRole('textbox');
const dialog = () => screen.getByRole('dialog', { name: 'Kalendar' });
const day = (name: RegExp) => within(dialog()).getByRole('button', { name });

describe('DatePicker', () => {
  it("Input ko'rinishi: ikonka, placeholder, ARIA; fokusda kalendar ochiladi", async () => {
    const user = userEvent.setup();
    render(<DatePicker today={TODAY} aria-label="Sana" />);
    const el = input();
    expect(el).toHaveAttribute('placeholder', 'kk.oo.yyyy');
    expect(el).toHaveAttribute('inputmode', 'numeric');
    expect(el).toHaveAttribute('aria-haspopup', 'dialog');
    expect(el).toHaveAttribute('aria-expanded', 'false');
    const box = el.closest('[data-slot="date-picker-control"]')!;
    expect(box).toHaveClass('rounded-lg', 'border-border', 'h-10', 'focus-ring-within');
    expect(box.querySelector('svg')).toBeInTheDocument();

    await user.click(el);
    expect(dialog()).toBeInTheDocument();
    expect(el).toHaveAttribute('aria-expanded', 'true');
    expect(el).toHaveAttribute('aria-controls', dialog().id);
    // Fokus input'da qoladi — yozishni davom ettirish mumkin
    expect(el).toHaveFocus();
    expect(within(dialog()).getByRole('grid', { name: 'Oktabr 2026' })).toBeInTheDocument();
  });

  it('kunni bosish tanlaydi, yopadi va matnni yozadi', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<DatePicker today={TODAY} aria-label="Sana" onValueChange={onValueChange} />);
    await user.click(input());
    await user.click(day(/^25 Oktabr 2026/));
    expect(onValueChange).toHaveBeenCalledWith(new Date(2026, 9, 25));
    expect(input()).toHaveValue('25.10.2026');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(input()).toHaveFocus();
  });

  it("qo'lda yozish: niqob, tahlil va kalendarni sanaga o'tkazish", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<DatePicker today={TODAY} aria-label="Sana" onValueChange={onValueChange} />);
    await user.click(input());
    await user.keyboard('2512');
    expect(input()).toHaveValue('25.12');
    const mask = document.querySelector('[data-slot="date-picker-mask"]');
    expect(mask).toHaveTextContent('25.12.____');
    expect(onValueChange).not.toHaveBeenCalled();

    await user.keyboard('2026');
    expect(input()).toHaveValue('25.12.2026');
    expect(onValueChange).toHaveBeenCalledWith(new Date(2026, 11, 25));
    expect(document.querySelector('[data-slot="date-picker-mask"]')).not.toBeInTheDocument();
    expect(within(dialog()).getByRole('grid', { name: 'Dekabr 2026' })).toBeInTheDocument();
    expect(day(/^25 Dekabr 2026.*tanlangan$/)).toBeInTheDocument();

    // Ortiqcha raqamlar va harflar kirmaydi
    await user.keyboard('9a');
    expect(input()).toHaveValue('25.12.2026');
  });

  it("noto'g'ri sana: invalid + \"Bunday sana yo'q\"; to'g'rilansa xato yo'qoladi", async () => {
    const user = userEvent.setup();
    const onErrorChange = vi.fn();
    const onValueChange = vi.fn();
    render(
      <DatePicker
        today={TODAY}
        aria-label="Sana"
        onErrorChange={onErrorChange}
        onValueChange={onValueChange}
      />,
    );
    await user.click(input());
    await user.keyboard('31022026');
    expect(screen.getByText("Bunday sana yo'q")).toBeInTheDocument();
    expect(input()).toHaveAttribute('aria-invalid', 'true');
    expect(input().getAttribute('aria-describedby')).toContain(
      screen.getByText("Bunday sana yo'q").closest('p')!.id,
    );
    expect(input().closest('[data-slot="date-picker-control"]')).toHaveAttribute('data-invalid');
    expect(onErrorChange).toHaveBeenLastCalledWith('invalid');
    expect(onValueChange).not.toHaveBeenCalled();

    // Yozish davomida (chala matn) xato ko'rsatilmaydi
    await user.keyboard('{Backspace>4/}');
    expect(input()).toHaveValue('31.02');
    expect(screen.queryByText("Bunday sana yo'q")).not.toBeInTheDocument();
    expect(onErrorChange).toHaveBeenLastCalledWith(null);

    await user.keyboard('{Backspace>2/}122026');
    expect(input()).toHaveValue('31.12.2026');
    expect(input()).not.toHaveAttribute('aria-invalid');
    expect(onValueChange).toHaveBeenCalledWith(new Date(2026, 11, 31));
  });

  it('ruxsat etilmagan sana: "Bu sanani tanlab bo\'lmaydi"', async () => {
    const user = userEvent.setup();
    render(
      <DatePicker
        today={TODAY}
        aria-label="Sana"
        minDate={TODAY}
        disabledDates={(d) => d.getDay() === 0}
      />,
    );
    await user.click(input());
    await user.keyboard('20102026');
    expect(screen.getByText("Bu sanani tanlab bo'lmaydi")).toBeInTheDocument();
    await user.clear(input());
    await user.keyboard('25102026'); // yakshanba
    expect(screen.getByText("Bu sanani tanlab bo'lmaydi")).toBeInTheDocument();
    await user.clear(input());
    await user.keyboard('26102026');
    expect(screen.queryByText(/tanlab bo'lmaydi/)).not.toBeInTheDocument();
  });

  it("chala yozilgan matn fokus yo'qolganda xato beradi", async () => {
    const user = userEvent.setup();
    render(
      <>
        <DatePicker today={TODAY} aria-label="Sana" />
        <button type="button">Keyingi</button>
      </>,
    );
    await user.click(input());
    await user.keyboard('2510');
    await user.click(screen.getByRole('button', { name: 'Keyingi' }));
    expect(screen.getByText("Bunday sana yo'q")).toBeInTheDocument();
  });

  it("Backspace nuqtani emas, undan oldingi raqamni o'chiradi", async () => {
    const user = userEvent.setup();
    render(<DatePicker today={TODAY} aria-label="Sana" />);
    await user.click(input());
    await user.keyboard('251');
    expect(input()).toHaveValue('25.1');
    // Kursorni nuqtadan keyinga qo'yamiz: "25.|1"
    (input() as HTMLInputElement).setSelectionRange(3, 3);
    await user.keyboard('{Backspace}');
    expect(input()).toHaveValue('21');
  });

  it("klaviatura: ↓ kalendarga o'tadi, strelkalar, Enter tanlaydi; Esc yopadi va fokus qaytadi", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<DatePicker today={TODAY} aria-label="Sana" onValueChange={onValueChange} />);
    await user.click(input());
    await user.keyboard('{ArrowDown}');
    expect(day(/^Bugun, 21 Oktabr/)).toHaveFocus();
    await user.keyboard('{ArrowRight}{ArrowDown}{Enter}');
    expect(onValueChange).toHaveBeenCalledWith(new Date(2026, 9, 29));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(input()).toHaveFocus();
    expect(input()).toHaveValue('29.10.2026');

    // Yopiq holatda ↓ — ochadi va tanlangan kunga fokus beradi
    await user.keyboard('{ArrowDown}');
    expect(day(/^29 Oktabr 2026/)).toHaveFocus();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(input()).toHaveFocus();
  });

  it("trigger tugmasi ochadi/yopadi; oy ko'rinishida Esc avval kunlarga qaytaradi", async () => {
    const user = userEvent.setup();
    render(<DatePicker today={TODAY} aria-label="Sana" />);
    const btn = screen.getByRole('button', { name: 'Kalendarni ochish' });
    await user.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    expect(day(/^Bugun, 21 Oktabr/)).toHaveFocus();

    await user.click(within(dialog()).getByRole('button', { name: /Oy va yilni tanlash/ }));
    expect(within(dialog()).getByRole('group', { name: 'Oylar' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(dialog()).toBeInTheDocument();
    expect(within(dialog()).getByRole('grid', { name: 'Oktabr 2026' })).toBeInTheDocument();

    await user.click(btn);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('tayyor variantlar: "Bugun", "Ertaga"; yopiq kun keyingi ochiq kunga suriladi', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DatePicker
        today={new Date(2026, 9, 24)} // shanba — ertaga yakshanba
        aria-label="Sana"
        presets
        disabledDates={(d) => d.getDay() === 0}
        onValueChange={onValueChange}
      />,
    );
    await user.click(input());
    const group = within(dialog()).getByRole('group', { name: 'Tezkor tanlash' });
    expect(
      within(group)
        .getAllByRole('button')
        .map((b) => b.textContent),
    ).toEqual(['Bugun', 'Ertaga', 'Bir haftadan keyin']);
    await user.click(within(group).getByRole('button', { name: 'Ertaga' }));
    expect(onValueChange).toHaveBeenCalledWith(new Date(2026, 9, 26));
    expect(input()).toHaveValue('26.10.2026');
  });

  it("maxsus variantlar ro'yxati", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DatePicker
        today={TODAY}
        aria-label="Sana"
        presets={[{ label: 'Yangi yil', date: new Date(2027, 0, 1) }]}
        onValueChange={onValueChange}
      />,
    );
    await user.click(input());
    await user.click(within(dialog()).getByRole('button', { name: 'Yangi yil' }));
    expect(onValueChange).toHaveBeenCalledWith(new Date(2027, 0, 1));
  });

  it('Field bilan: label, description, error va required ulanadi', async () => {
    const user = userEvent.setup();
    render(
      <Field label="Yetkazish sanasi" description="Ish kunlari" error="Sanani tanlang" required>
        <DatePicker today={TODAY} />
      </Field>,
    );
    const el = screen.getByRole('textbox', { name: 'Yetkazish sanasi' });
    expect(el).toHaveAttribute('aria-invalid', 'true');
    expect(el).toHaveAttribute('aria-required', 'true');
    expect(el).toHaveAccessibleDescription(/Ish kunlari/);
    await user.click(screen.getByText('Yetkazish sanasi'));
    expect(el).toHaveFocus();
  });

  it("Field xatosi bo'lsa ichki xato qatori yashiriladi; showError bilan majburlanadi", async () => {
    const user = userEvent.setup();
    const onErrorChange = vi.fn();
    const { rerender } = render(
      <Field label="Sana" error="Sanani tanlang">
        <DatePicker today={TODAY} onErrorChange={onErrorChange} />
      </Field>,
    );
    await user.click(input());
    await user.keyboard('31022026');
    expect(onErrorChange).toHaveBeenLastCalledWith('invalid');
    expect(screen.getByText('Sanani tanlang')).toBeInTheDocument();
    expect(screen.queryByText("Bunday sana yo'q")).not.toBeInTheDocument();
    expect(input()).toHaveAttribute('aria-invalid', 'true');

    rerender(
      <Field label="Sana" error="Sanani tanlang">
        <DatePicker today={TODAY} onErrorChange={onErrorChange} showError />
      </Field>,
    );
    expect(screen.getByText("Bunday sana yo'q")).toBeInTheDocument();

    // Field xatosiz: default ko'rsatiladi, showError={false} — yashiriladi
    rerender(
      <Field label="Sana">
        <DatePicker today={TODAY} onErrorChange={onErrorChange} />
      </Field>,
    );
    expect(screen.getByText("Bunday sana yo'q")).toBeInTheDocument();
    rerender(
      <Field label="Sana">
        <DatePicker today={TODAY} onErrorChange={onErrorChange} showError={false} />
      </Field>,
    );
    expect(screen.queryByText("Bunday sana yo'q")).not.toBeInTheDocument();
    expect(input()).toHaveAttribute('aria-invalid', 'true');
  });

  it("boshqariladigan qiymat: tashqi o'zgarish matnni yangilaydi; clearable va name", async () => {
    const user = userEvent.setup();
    function Demo() {
      const [date, setDate] = useState<Date | null>(new Date(2026, 0, 5));
      return (
        <>
          <DatePicker
            today={TODAY}
            aria-label="Sana"
            value={date}
            onValueChange={setDate}
            clearable
            name="sana"
          />
          <button type="button" onClick={() => setDate(new Date(2026, 5, 1))}>
            O'rnatish
          </button>
          <output data-testid="out">{date ? date.toDateString() : 'bo`sh'}</output>
        </>
      );
    }
    const { container } = render(<Demo />);
    expect(input()).toHaveValue('05.01.2026');
    expect(container.querySelector('input[type="hidden"][name="sana"]')).toHaveValue('2026-01-05');
    await user.click(screen.getByRole('button', { name: "O'rnatish" }));
    expect(input()).toHaveValue('01.06.2026');

    await user.click(input());
    await user.click(screen.getByRole('button', { name: 'Tozalash' }));
    expect(input()).toHaveValue('');
    expect(screen.getByTestId('out')).toHaveTextContent('bo`sh');
  });

  it('disabled va readOnly: ochilmaydi', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<DatePicker today={TODAY} aria-label="Sana" disabled />);
    expect(input()).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Kalendarni ochish' })).toBeDisabled();
    rerender(<DatePicker today={TODAY} aria-label="Sana" readOnly />);
    await user.click(input());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it("boshqa format: niqob yo'q, Enter bilan tahlil qilinadi", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DatePicker
        today={TODAY}
        aria-label="Sana"
        format="d MMMM yyyy"
        onValueChange={onValueChange}
      />,
    );
    expect(input()).not.toHaveAttribute('inputmode');
    await user.click(input());
    await user.keyboard('5 Noyabr 2026{Enter}');
    expect(onValueChange).toHaveBeenCalledWith(new Date(2026, 10, 5));
  });
});
