import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Field } from '../field/field';
import { DateRangePicker } from './date-range-picker';

const TODAY = new Date(2026, 9, 21);

const trigger = () => screen.getByRole('button', { name: /Davr|Sanalar/ });
const dialog = () => screen.getByRole('dialog', { name: 'Kalendar' });
const day = (name: RegExp) => within(dialog()).getByRole('button', { name });

afterEach(() => vi.restoreAllMocks());

describe('DateRangePicker', () => {
  it("trigger: placeholder, ARIA; ochilganda ikki oy ko'rinadi", async () => {
    const user = userEvent.setup();
    render(<DateRangePicker today={TODAY} aria-label="Davr" />);
    const btn = trigger();
    expect(btn).toHaveAttribute('aria-haspopup', 'dialog');
    expect(btn).toHaveTextContent("Sanalar oralig'ini tanlang");
    expect(btn.closest('[data-slot="date-range-picker-control"]')).toHaveClass(
      'rounded-lg',
      'h-10',
      'focus-ring-within',
    );
    await user.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    expect(
      within(dialog())
        .getAllByRole('grid')
        .map((g) => g.getAttribute('aria-label')),
    ).toEqual(['Oktabr 2026', 'Noyabr 2026']);
  });

  it('telefonda bitta oy (MOBILE_QUERY)', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (query: string) =>
        ({
          matches: true,
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
        }) as unknown as MediaQueryList,
    );
    render(<DateRangePicker today={TODAY} aria-label="Davr" />);
    await user.click(trigger());
    expect(within(dialog()).getAllByRole('grid')).toHaveLength(1);
  });

  it("ikki kun bosilganda oraliq tasdiqlanadi; hover'da oldindan ko'rinadi", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<DateRangePicker today={TODAY} aria-label="Davr" onValueChange={onValueChange} />);
    await user.click(trigger());
    await user.click(day(/^10 Oktabr 2026/));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(within(dialog()).getByText(/10\.10\.2026 – … · Tugash sanasini tanlang/)).toBeVisible();

    fireEvent.mouseEnter(day(/^3 Noyabr 2026/));
    expect(day(/^31 Oktabr 2026/).closest('td')).toHaveAttribute('data-preview');
    expect(day(/^2 Noyabr 2026/).closest('td')).toHaveAttribute('data-preview');

    await user.click(day(/^3 Noyabr 2026/));
    expect(onValueChange).toHaveBeenCalledWith({
      from: new Date(2026, 9, 10),
      to: new Date(2026, 10, 3),
    });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger()).toHaveTextContent('10.10.2026 – 03.11.2026');
    expect(trigger()).toHaveFocus();
  });

  it("chala oraliq yopilganda bekor qilinadi; qayta ochilganda eski qiymat ko'rinadi", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DateRangePicker
        today={TODAY}
        aria-label="Davr"
        defaultValue={{ from: new Date(2026, 9, 1), to: new Date(2026, 9, 5) }}
        onValueChange={onValueChange}
      />,
    );
    await user.click(trigger());
    expect(day(/^3 Oktabr 2026/).closest('td')).toHaveAttribute('data-range-middle');
    await user.click(day(/^12 Oktabr 2026/));
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(onValueChange).not.toHaveBeenCalled();
    expect(trigger()).toHaveTextContent('01.10.2026 – 05.10.2026');
    await user.click(trigger());
    expect(day(/^1 Oktabr 2026/).closest('td')).toHaveAttribute('data-range-start');
  });

  it('tayyor variantlar: "Bugun", "Oxirgi 7 kun", "Shu oy", "O\'tgan oy"', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DateRangePicker today={TODAY} aria-label="Davr" presets onValueChange={onValueChange} />,
    );
    await user.click(trigger());
    const group = within(dialog()).getByRole('group', { name: 'Tezkor tanlash' });
    expect(
      within(group)
        .getAllByRole('button')
        .map((b) => b.textContent),
    ).toEqual(['Bugun', 'Oxirgi 7 kun', 'Shu oy', "O'tgan oy"]);
    await user.click(within(group).getByRole('button', { name: 'Oxirgi 7 kun' }));
    expect(onValueChange).toHaveBeenLastCalledWith({
      from: new Date(2026, 9, 15),
      to: new Date(2026, 9, 21),
    });
    expect(trigger()).toHaveTextContent('15.10.2026 – 21.10.2026');

    await user.click(trigger());
    expect(
      within(dialog()).getByRole('button', { name: 'Oxirgi 7 kun', pressed: true }),
    ).toHaveClass('bg-primary');
    await user.click(within(dialog()).getByRole('button', { name: "O'tgan oy" }));
    expect(onValueChange).toHaveBeenLastCalledWith({
      from: new Date(2026, 8, 1),
      to: new Date(2026, 8, 30),
    });
    await user.click(trigger());
    await user.click(within(dialog()).getByRole('button', { name: 'Bugun' }));
    expect(trigger()).toHaveTextContent(/^21\.10\.2026$/);
  });

  it("variantlar min/max chegarasiga qisqartiriladi; sig'maydigani yopiq", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { unmount } = render(
      <DateRangePicker
        today={TODAY}
        aria-label="Davr"
        presets
        minDate={TODAY}
        onValueChange={onValueChange}
      />,
    );
    await user.click(trigger());
    expect(within(dialog()).getByRole('button', { name: "O'tgan oy" })).toBeDisabled();
    await user.click(within(dialog()).getByRole('button', { name: 'Oxirgi 7 kun' }));
    expect(onValueChange).toHaveBeenLastCalledWith({ from: TODAY, to: TODAY });
    unmount();

    render(
      <DateRangePicker
        today={TODAY}
        aria-label="Davr"
        presets
        maxDate={TODAY}
        onValueChange={onValueChange}
      />,
    );
    await user.click(trigger());
    await user.click(within(dialog()).getByRole('button', { name: 'Shu oy' }));
    expect(onValueChange).toHaveBeenLastCalledWith({ from: new Date(2026, 9, 1), to: TODAY });
  });

  it('klaviatura: Enter ochadi va kalendarga fokus; strelka + Enter bilan oraliq', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<DateRangePicker today={TODAY} aria-label="Davr" onValueChange={onValueChange} />);
    trigger().focus();
    await user.keyboard('{Enter}');
    expect(day(/^Bugun, 21 Oktabr/)).toHaveFocus();
    await user.keyboard('{Enter}{ArrowRight}{ArrowRight}{Enter}');
    expect(onValueChange).toHaveBeenCalledWith({
      from: new Date(2026, 9, 21),
      to: new Date(2026, 9, 23),
    });
  });

  it('Field, clearable va name', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <Field label="Hisobot davri" error="Davrni tanlang">
        <DateRangePicker
          today={TODAY}
          clearable
          name="davr"
          defaultValue={{ from: new Date(2026, 9, 1), to: new Date(2026, 9, 31) }}
          onValueChange={onValueChange}
        />
      </Field>,
    );
    const btn = screen.getByRole('button', { name: 'Hisobot davri' });
    expect(btn).toHaveAttribute('aria-invalid', 'true');
    expect(btn).toHaveAccessibleDescription(/01\.10\.2026 – 31\.10\.2026/);
    expect(container.querySelector('input[name="davrFrom"]')).toHaveValue('2026-10-01');
    expect(container.querySelector('input[name="davrTo"]')).toHaveValue('2026-10-31');
    await user.click(screen.getByRole('button', { name: 'Tozalash' }));
    expect(onValueChange).toHaveBeenCalledWith(null);
    expect(btn).toHaveTextContent("Sanalar oralig'ini tanlang");
  });

  it('disabled: ochilmaydi', async () => {
    const user = userEvent.setup();
    render(<DateRangePicker today={TODAY} aria-label="Davr" disabled />);
    expect(trigger()).toBeDisabled();
    await user.click(trigger());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
