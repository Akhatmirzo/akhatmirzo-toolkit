import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Field } from '../field/field';
import { Combobox, type ComboboxOption } from './combobox';

const cities: ComboboxOption[] = [
  { value: 'tsh', label: 'Toshkent' },
  { value: 'sam', label: 'Samarqand' },
  { value: 'fer', label: "Farg'ona" },
  { value: 'guz', label: 'Gʻuzor' },
  { value: 'qoq', label: "Qo'qon", description: "Farg'ona viloyati" },
  { value: 'nuk', label: 'Nukus', disabled: true },
];

afterEach(() => vi.useRealTimers());

const trigger = () => screen.getByRole('combobox', { expanded: false });
const search = () => screen.getByPlaceholderText('Qidirish...');
const optionNames = () => screen.queryAllByRole('option').map((o) => o.textContent);

async function openWith(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getAllByRole('combobox')[0]!);
  await waitFor(() => expect(search()).toHaveFocus());
}

describe('Combobox', () => {
  it('trigger: role=combobox, placeholder, Input ko`rinishi; ochilganda ro`yxat va qidiruv', async () => {
    const user = userEvent.setup();
    render(<Combobox options={cities} placeholder="Shahar tanlang" aria-label="Shahar" />);
    const btn = screen.getByRole('combobox', { name: 'Shahar' });
    expect(btn).toHaveAttribute('aria-haspopup', 'listbox');
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    expect(btn).toHaveTextContent('Shahar tanlang');
    const box = btn.closest('[data-slot="combobox"]')!;
    expect(box).toHaveClass('rounded-lg', 'border-border', 'min-h-10', 'focus-ring-within');

    await openWith(user);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    expect(box).toHaveAttribute('data-state', 'open');
    expect(screen.getByRole('listbox', { name: 'Variantlar' })).toBeInTheDocument();
    expect(optionNames()).toHaveLength(cities.length);
    expect(screen.getByRole('option', { name: /Nukus/ })).toHaveAttribute('aria-disabled', 'true');
  });

  it('bitta tanlov: bosish tanlaydi, yopadi, fokus trigger`ga qaytadi (boshqarilmaydigan)', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Combobox options={cities} aria-label="Shahar" onValueChange={onValueChange} />);
    await openWith(user);
    await user.click(screen.getByRole('option', { name: 'Samarqand' }));
    expect(onValueChange).toHaveBeenCalledWith('sam');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(trigger()).toHaveTextContent('Samarqand');
    await waitFor(() => expect(trigger()).toHaveFocus());

    // Qayta ochilganda tanlangan belgilangan
    await openWith(user);
    expect(screen.getByRole('option', { name: 'Samarqand' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('o`zbekcha qidiruv: apostrof variantlari, kirill ↔ lotin; mos qism <mark>', async () => {
    const user = userEvent.setup();
    render(<Combobox options={cities} aria-label="Shahar" />);
    await openWith(user);

    await user.type(search(), 'farg‘');
    // Farg'ona (label) va Qo'qon (description: Farg'ona viloyati)
    expect(optionNames()).toEqual(["Farg'ona", "Qo'qonFarg'ona viloyati"]);
    const mark = screen.getByRole('option', { name: "Farg'ona" }).querySelector('mark')!;
    expect(mark.textContent).toMatch(/^Farg/);

    await user.clear(search());
    await user.type(search(), 'Тошкент');
    expect(optionNames()).toEqual(['Toshkent']);

    await user.clear(search());
    await user.type(search(), "g'uzor");
    expect(optionNames()).toEqual(['Gʻuzor']);
  });

  it('bo`sh natija: emptyText', async () => {
    const user = userEvent.setup();
    render(<Combobox options={cities} aria-label="Shahar" emptyText="Topilmadi" />);
    await openWith(user);
    await user.type(search(), 'zzz');
    expect(screen.getByText('Topilmadi')).toBeInTheDocument();
    expect(optionNames()).toHaveLength(0);
  });

  it('klaviatura: ↑ ↓ yurish, Enter tanlash; trigger`da ↓ ochadi', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Combobox options={cities} aria-label="Shahar" onValueChange={onValueChange} />);
    await user.tab();
    expect(trigger()).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(search()).toHaveFocus());

    const first = screen.getByRole('option', { name: 'Toshkent' });
    await waitFor(() => expect(first).toHaveAttribute('aria-selected', 'true'));
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('option', { name: 'Samarqand' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(search()).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'Samarqand' }).id,
    );
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('sam');
  });

  it('yopiq trigger`da harf yozish — ochib, qidiruvni boshlaydi', async () => {
    const user = userEvent.setup();
    render(<Combobox options={cities} aria-label="Shahar" />);
    await user.tab();
    await user.keyboard('s');
    await waitFor(() => expect(search()).toHaveValue('s'));
    expect(optionNames()).toContain('Samarqand');
  });

  it('Esc: avval qidiruvni tozalaydi, ikkinchi marta yopadi', async () => {
    const user = userEvent.setup();
    render(<Combobox options={cities} aria-label="Shahar" />);
    await openWith(user);
    await user.type(search(), 'tosh');
    await user.keyboard('{Escape}');
    expect(search()).toHaveValue('');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(trigger()).toHaveFocus();
  });

  it('boshqariladigan rejim', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [city, setCity] = useState<string | null>('fer');
      return (
        <>
          <span data-testid="v">{city ?? 'yo`q'}</span>
          <Combobox options={cities} value={city} onValueChange={setCity} aria-label="Shahar" />
          <button type="button" onClick={() => setCity(null)}>
            Reset
          </button>
        </>
      );
    }
    render(<Controlled />);
    expect(trigger()).toHaveTextContent("Farg'ona");
    await openWith(user);
    await user.click(screen.getByRole('option', { name: 'Toshkent' }));
    expect(screen.getByTestId('v')).toHaveTextContent('tsh');
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(trigger()).toHaveTextContent('Tanlang');
  });

  it('multiple: Badge`lar, qayta bosish olib tashlaydi, panel ochiq qoladi', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Combobox
        multiple
        options={cities}
        defaultValue={['tsh']}
        onValueChange={onValueChange}
        aria-label="Shaharlar"
      />,
    );
    expect(screen.getByText('Toshkent', { selector: '[data-variant] span' })).toBeInTheDocument();
    await openWith(user);
    await user.click(screen.getByRole('option', { name: 'Samarqand' }));
    expect(onValueChange).toHaveBeenLastCalledWith(['tsh', 'sam']);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await user.click(screen.getByRole('option', { name: 'Toshkent' }));
    expect(onValueChange).toHaveBeenLastCalledWith(['sam']);
  });

  it('multiple: Badge ✕ va bo`sh qidiruvda Backspace oxirgisini o`chiradi', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Combobox
        multiple
        options={cities}
        defaultValue={['tsh', 'sam', 'fer']}
        onValueChange={onValueChange}
        aria-label="Shaharlar"
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Olib tashlash: Samarqand' }));
    expect(onValueChange).toHaveBeenLastCalledWith(['tsh', 'fer']);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    await openWith(user);
    await user.type(search(), 'a');
    await user.keyboard('{Backspace}'); // qidiruvdagi harfni o'chiradi
    expect(onValueChange).toHaveBeenCalledTimes(1);
    await user.keyboard('{Backspace}'); // bo'sh — oxirgi tanlov
    expect(onValueChange).toHaveBeenLastCalledWith(['tsh']);
  });

  it('creatable: "+ «matn» yaratish" va onCreate', async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn((text: string) => ({ value: 'new-1', label: text }));
    const onValueChange = vi.fn();
    render(
      <Combobox
        options={cities}
        creatable
        onCreate={onCreate}
        onValueChange={onValueChange}
        aria-label="Shahar"
      />,
    );
    await openWith(user);
    await user.type(search(), 'Chirchiq');
    expect(screen.getByText('Hech narsa topilmadi')).toBeInTheDocument();
    const create = screen.getByRole('option', { name: '«Chirchiq» yaratish' });
    await user.click(create);
    expect(onCreate).toHaveBeenCalledWith('Chirchiq');
    expect(onValueChange).toHaveBeenCalledWith('new-1');
    await waitFor(() => expect(trigger()).toHaveTextContent('Chirchiq'));

    // Mavjud nom uchun yaratish taklifi chiqmaydi
    await openWith(user);
    await user.type(search(), 'toshkent');
    expect(screen.queryByRole('option', { name: /yaratish/ })).not.toBeInTheDocument();
  });

  it('onSearch: 300ms debounce, mahalliy filtr o`chadi; loading → Spinner', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onSearch = vi.fn();
    const { rerender } = render(
      <Combobox options={cities} onSearch={onSearch} aria-label="Shahar" />,
    );
    await openWith(user);
    await user.type(search(), 'xyz');
    expect(onSearch).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(300));
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('xyz');
    // Server natijalari filtrlanmaydi
    expect(optionNames()).toHaveLength(cities.length);

    rerender(<Combobox options={cities} onSearch={onSearch} loading aria-label="Shahar" />);
    const listbox = screen.getByRole('listbox');
    expect(within(listbox).getByRole('status')).toHaveTextContent('Yuklanmoqda');
    expect(optionNames()).toHaveLength(0);
  });

  it('Field bilan ulanadi: label, aria-describedby, invalid', async () => {
    render(
      <Field label="Shahar" description="Yetkazib berish manzili" error="Majburiy" required>
        <Combobox options={cities} />
      </Field>,
    );
    const btn = screen.getByRole('combobox', { name: /Shahar/ });
    expect(btn).toHaveAttribute('aria-invalid', 'true');
    expect(btn).toHaveAttribute('aria-required', 'true');
    expect(btn).toHaveAccessibleDescription(/Yetkazib berish manzili/);
    expect(btn.closest('[data-slot="combobox"]')).toHaveAttribute('data-invalid');
    // Qiymatsiz — nom faqat label'dan (placeholder qo'shilmaydi)
    expect(btn).toHaveAccessibleName('Shahar');
  });

  it('Field bilan: qiymat bo`lsa nomga qo`shiladi', () => {
    render(
      <Field label="Shahar">
        <Combobox options={cities} defaultValue="tsh" />
      </Field>,
    );
    expect(screen.getByRole('combobox')).toHaveAccessibleName('Shahar Toshkent');
  });

  it('aria-controls ro`yxatga ishora qiladi; multiple — aria-multiselectable', async () => {
    const user = userEvent.setup();
    render(<Combobox multiple options={cities} aria-label="Shaharlar" />);
    await openWith(user);
    const listbox = screen.getByRole('listbox');
    expect(listbox).toHaveAttribute('aria-multiselectable', 'true');
    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'Shaharlar' })).toHaveAttribute(
        'aria-controls',
        listbox.id,
      ),
    );
  });

  it('Tab qidiruvdan: panel yopiladi, fokus keyingi maydonga o`tadi', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Combobox options={cities} aria-label="Shahar" />
        <input aria-label="Keyingi" />
      </>,
    );
    await openWith(user);
    await user.tab();
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(screen.getByRole('textbox', { name: 'Keyingi' })).toHaveFocus();
  });

  it('disabled: ochilmaydi; clearable ✕ tozalaydi; name → yashirin input', async () => {
    const user = userEvent.setup();
    const { rerender, container } = render(
      <Combobox options={cities} disabled defaultValue="tsh" aria-label="Shahar" />,
    );
    expect(trigger()).toBeDisabled();
    await user.click(trigger().closest('[data-slot="combobox"]')!);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    rerender(
      <Combobox options={cities} clearable name="city" defaultValue="tsh" aria-label="Shahar" />,
    );
    expect(container.querySelector('input[type="hidden"]')).toHaveValue('tsh');
    await user.click(screen.getByRole('button', { name: 'Tozalash' }));
    expect(trigger()).toHaveTextContent('Tanlang');
    expect(container.querySelector('input[type="hidden"]')).toBeNull();
  });

  it('ref trigger tugmasiga, className konteynerga; o`lcham', () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<Combobox options={cities} ref={ref} size="lg" className="w-80" aria-label="Shahar" />);
    expect(ref.current).toBe(trigger());
    const box = trigger().closest('[data-slot="combobox"]')!;
    expect(box).toHaveClass('w-80', 'min-h-12');
    expect(box).toHaveAttribute('data-size', 'lg');
  });
});
