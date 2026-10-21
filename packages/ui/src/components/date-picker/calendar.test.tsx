import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Calendar } from './calendar';

const TODAY = new Date(2026, 9, 21); // Chorshanba

const day = (name: RegExp | string) => screen.getByRole('button', { name });

describe('Calendar', () => {
  it("o'zbekcha: sarlavha, hafta dushanbadan, kun yorlig'i va bugungi kun", () => {
    render(<Calendar today={TODAY} />);
    expect(screen.getByRole('grid', { name: 'Oktabr 2026' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /^Oktabr 2026\. Oy va yilni tanlash/ }),
    ).toBeVisible();

    const headers = screen.getAllByRole('columnheader', { hidden: true }).map((h) => h.textContent);
    expect(headers).toEqual(['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya']);
    expect(screen.getAllByRole('columnheader', { hidden: true })[0]).toHaveAttribute(
      'aria-label',
      'Dushanba',
    );

    const today = day('Bugun, 21 Oktabr 2026, Chorshanba');
    expect(today).toHaveAttribute('data-slot', 'calendar-day');
    expect(today).toHaveClass('size-9', 'rounded-md', "after:content-['']", 'after:bg-primary');
    // 1-oktabr 2026 — payshanba: birinchi qatorda 3 ta qo'shni (sentabr) kun
    const firstRow = screen.getAllByRole('row')[0]!;
    const cells = within(firstRow).getAllByRole('gridcell');
    expect(cells[3]).toHaveTextContent('1');
    expect(cells[0]).toHaveAttribute('data-outside');
    expect(within(cells[0]!).getByRole('button')).toHaveClass('text-text-faint');
  });

  it('bosish tanlaydi: onValueChange, aria-selected va primary fon', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Calendar today={TODAY} onValueChange={onValueChange} />);
    await user.click(day(/^25 Oktabr 2026/));
    expect(onValueChange).toHaveBeenCalledWith(new Date(2026, 9, 25));
    const selected = day('25 Oktabr 2026, Yakshanba, tanlangan');
    expect(selected).toHaveClass('bg-primary', 'text-primary-foreground');
    expect(selected.closest('td')).toHaveAttribute('aria-selected', 'true');
  });

  it('klaviatura: strelkalar, PageUp/PageDown (Shift — yil), Home/End, Enter', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Calendar today={TODAY} autoFocus onValueChange={onValueChange} />);
    expect(day(/^Bugun, 21 Oktabr/)).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(day(/^22 Oktabr 2026/)).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(day(/^29 Oktabr 2026/)).toHaveFocus();
    await user.keyboard('{ArrowUp}{ArrowLeft}');
    expect(day(/21 Oktabr 2026/)).toHaveFocus();
    await user.keyboard('{Home}');
    expect(day(/^19 Oktabr 2026, Dushanba/)).toHaveFocus();
    await user.keyboard('{End}');
    expect(day(/^25 Oktabr 2026, Yakshanba/)).toHaveFocus();
    await user.keyboard('{PageDown}');
    expect(screen.getByRole('grid', { name: 'Noyabr 2026' })).toBeInTheDocument();
    expect(day(/^25 Noyabr 2026/)).toHaveFocus();
    await user.keyboard('{Shift>}{PageUp}{/Shift}');
    expect(screen.getByRole('grid', { name: 'Noyabr 2025' })).toBeInTheDocument();
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2025, 10, 25));
    await user.keyboard('{ArrowRight}{ }');
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2025, 10, 26));
  });

  it('minDate / maxDate / disabledDates: kunlar yopiq, navigatsiya cheklangan', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Calendar
        today={TODAY}
        minDate={TODAY}
        maxDate={new Date(2026, 10, 30)}
        disabledDates={(d) => d.getDay() === 0}
        onValueChange={onValueChange}
      />,
    );
    const past = day(/^20 Oktabr 2026/);
    expect(past).toBeDisabled();
    expect(past).toHaveClass('line-through', 'text-text-faint', 'cursor-not-allowed');
    expect(day(/^25 Oktabr 2026, Yakshanba/)).toBeDisabled();
    await user.click(past);
    expect(onValueChange).not.toHaveBeenCalled();

    expect(screen.getByRole('button', { name: 'Oldingi oy' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    await user.click(screen.getByRole('button', { name: 'Keyingi oy' }));
    expect(screen.getByRole('grid', { name: 'Noyabr 2026' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Keyingi oy' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it("sarlavha: oy va yil tanlash ko'rinishi, Esc — kunlarga qaytadi", async () => {
    const user = userEvent.setup();
    const onMonthChange = vi.fn();
    render(<Calendar today={TODAY} onMonthChange={onMonthChange} />);

    await user.click(screen.getByRole('button', { name: /Oy va yilni tanlash/ }));
    const months = screen.getByRole('group', { name: 'Oylar' });
    expect(within(months).getAllByRole('button')).toHaveLength(12);
    const current = within(months).getByRole('button', { name: 'Oktabr 2026' });
    expect(current).toHaveAttribute('aria-current', 'true');
    expect(current).toHaveFocus();
    expect(within(months).getByRole('button', { name: 'Iyun 2026' })).toHaveTextContent('Iyn');

    // Strelkalar bilan yurish: ← → ±1, ↑ ↓ ±3
    await user.keyboard('{ArrowUp}');
    expect(within(months).getByRole('button', { name: 'Iyul 2026' })).toHaveFocus();

    await user.click(screen.getByRole('button', { name: '2026. Yilni tanlash' }));
    const years = screen.getByRole('group', { name: 'Yillar' });
    expect(within(years).getByRole('button', { name: '2026' })).toHaveAttribute('aria-current');
    await user.click(screen.getByRole('button', { name: 'Oldingi yillar' }));
    await user.click(screen.getByRole('button', { name: /^Oldingi yillar/ }));
    await user.click(within(screen.getByRole('group', { name: 'Yillar' })).getByText('1995'));

    expect(screen.getByRole('button', { name: '1995. Yilni tanlash' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Mart 1995' }));
    expect(screen.getByRole('grid', { name: 'Mart 1995' })).toBeInTheDocument();
    expect(onMonthChange).toHaveBeenLastCalledWith(new Date(1995, 2, 1));
    // Kunlarga qaytganda fokus kalendar ichida
    expect(document.activeElement).toHaveAttribute('data-slot', 'calendar-day');

    await user.click(screen.getByRole('button', { name: /Oy va yilni tanlash/ }));
    expect(screen.getByRole('group', { name: 'Oylar' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.getByRole('grid', { name: 'Mart 1995' })).toBeInTheDocument();
  });

  it("oy/yil ko'rinishida ruxsat etilmagan oylar yopiq", async () => {
    const user = userEvent.setup();
    render(
      <Calendar today={TODAY} minDate={new Date(2026, 3, 10)} maxDate={new Date(2026, 11, 1)} />,
    );
    await user.click(screen.getByRole('button', { name: /Oy va yilni tanlash/ }));
    expect(screen.getByRole('button', { name: 'Mart 2026' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Aprel 2026' })).not.toHaveAttribute('aria-disabled');
    expect(screen.getByRole('button', { name: 'Oldingi yil' })).toHaveAttribute('aria-disabled');
    await user.click(screen.getByRole('button', { name: 'Mart 2026' }));
    expect(screen.getByRole('group', { name: 'Oylar' })).toBeInTheDocument();
  });

  it("oraliq: hover'da oldindan ko'rinish, ikkinchi bosishda tugallanadi", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Calendar mode="range" today={TODAY} onValueChange={onValueChange} />);

    await user.click(day(/^10 Oktabr 2026/));
    expect(onValueChange).toHaveBeenLastCalledWith({ from: new Date(2026, 9, 10), to: null });

    fireEvent.mouseEnter(day(/^14 Oktabr 2026/));
    expect(day(/^12 Oktabr 2026/).closest('td')).toHaveAttribute('data-preview');
    expect(day(/^14 Oktabr 2026/).closest('td')).toHaveAttribute('data-preview');
    expect(day(/^14 Oktabr 2026/)).toHaveClass('ring-primary');
    expect(day(/^16 Oktabr 2026/).closest('td')).not.toHaveAttribute('data-preview');

    // Boshlanishdan oldingi kun bosilsa — oraliq teskari tartiblanadi
    await user.click(day(/^5 Oktabr 2026/));
    expect(onValueChange).toHaveBeenLastCalledWith({
      from: new Date(2026, 9, 5),
      to: new Date(2026, 9, 10),
    });
    expect(day(/^5 Oktabr 2026/).closest('td')).toHaveAttribute('data-range-start');
    expect(day(/^7 Oktabr 2026/).closest('td')).toHaveAttribute('data-range-middle');
    expect(day(/^7 Oktabr 2026/)).toHaveClass('text-primary-soft-foreground');
    expect(day(/^10 Oktabr 2026/).closest('td')).toHaveAttribute('data-range-end');
    expect(day(/^10 Oktabr 2026/)).toHaveClass('bg-primary');

    // Tugallangan oraliqdan keyin bosish — yangi oraliq
    await user.click(day(/^20 Oktabr 2026/));
    expect(onValueChange).toHaveBeenLastCalledWith({ from: new Date(2026, 9, 20), to: null });
  });

  it('bir nechta oy: navigatsiya chetlarda, qo`shni kunlar yashirin', () => {
    render(<Calendar mode="range" numberOfMonths={2} today={TODAY} />);
    expect(screen.getAllByRole('grid').map((g) => g.getAttribute('aria-label'))).toEqual([
      'Oktabr 2026',
      'Noyabr 2026',
    ]);
    expect(screen.queryByRole('button', { name: /^30 Sentabr/ })).not.toBeInTheDocument();
  });

  it('boshqariladigan qiymat, className, ref, labels va footer', () => {
    const ref = { current: null as HTMLDivElement | null };
    const { rerender } = render(
      <Calendar
        ref={ref}
        today={TODAY}
        value={new Date(2026, 9, 3)}
        className="custom"
        labels={{ nextMonth: 'Next' }}
        footer={<p>Pastki qism</p>}
        data-testid="cal"
      />,
    );
    expect(ref.current).toBe(screen.getByTestId('cal'));
    expect(screen.getByTestId('cal')).toHaveClass('custom', 'font-sans', 'text-text');
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
    expect(screen.getByText('Pastki qism')).toBeInTheDocument();
    expect(day(/^3 Oktabr 2026.*tanlangan$/)).toBeInTheDocument();
    rerender(<Calendar today={TODAY} value={null} />);
    expect(screen.queryByRole('button', { name: /tanlangan$/ })).not.toBeInTheDocument();
  });

  it('defaultMonth va bugungi oy', () => {
    act(() => {
      render(<Calendar today={TODAY} defaultMonth={new Date(2027, 0, 15)} />);
    });
    expect(screen.getByRole('grid', { name: 'Yanvar 2027' })).toBeInTheDocument();
  });
});
