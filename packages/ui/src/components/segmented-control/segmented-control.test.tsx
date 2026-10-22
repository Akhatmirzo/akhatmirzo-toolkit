import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Field } from '../field/field';
import { SegmentedControl, SegmentedControlItem, type SegmentedControlProps } from './index';

function Demo(props: Partial<SegmentedControlProps>) {
  return (
    <SegmentedControl defaultValue="month" aria-label="Davr" {...props}>
      <SegmentedControl.Item value="day">Kun</SegmentedControl.Item>
      <SegmentedControl.Item value="week">Hafta</SegmentedControl.Item>
      <SegmentedControl.Item value="month">Oy</SegmentedControl.Item>
    </SegmentedControl>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" />
    </svg>
  );
}

describe('SegmentedControl', () => {
  afterEach(() => vi.restoreAllMocks());

  it('radiogroup va radio rollari bilan render qilinadi', () => {
    render(<Demo />);
    expect(screen.getByRole('radiogroup', { name: 'Davr' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    const month = screen.getByRole('radio', { name: 'Oy' });
    expect(month).toBeChecked();
    expect(month).toHaveAttribute('data-state', 'checked');
  });

  it('bosilganda tanlanadi', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Demo onValueChange={onValueChange} />);
    await user.click(screen.getByRole('radio', { name: 'Kun' }));
    expect(onValueChange).toHaveBeenCalledWith('day');
    expect(screen.getByRole('radio', { name: 'Kun' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Oy' })).not.toBeChecked();
  });

  it('←→ strelkalar bilan yuradi va tanlaydi; Tab guruhdan chiqadi', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Demo />
        <button type="button">Keyingi</button>
      </>,
    );
    await user.tab();
    expect(screen.getByRole('radio', { name: 'Oy' })).toHaveFocus();
    // Radix fokusni keyingi tick'da ko'chiradi va tugma bosilib turgan paytda tanlaydi
    await user.keyboard('{ArrowLeft>}');
    const week = await screen.findByRole('radio', { name: 'Hafta', checked: true });
    expect(week).toHaveFocus();
    await user.keyboard('{/ArrowLeft}{ArrowRight>}');
    await screen.findByRole('radio', { name: 'Oy', checked: true });
    await user.keyboard('{/ArrowRight}{ArrowRight>}');
    // Oxiridan boshiga aylanadi
    await screen.findByRole('radio', { name: 'Kun', checked: true });
    await user.keyboard('{/ArrowRight}');
    await user.tab();
    expect(screen.getByRole('button', { name: 'Keyingi' })).toHaveFocus();
  });

  it('boshqariladigan rejim', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(<Demo value="day" onValueChange={onValueChange} />);
    await user.click(screen.getByRole('radio', { name: 'Hafta' }));
    expect(onValueChange).toHaveBeenCalledWith('week');
    expect(screen.getByRole('radio', { name: 'Kun' })).toBeChecked();
    rerender(<Demo value="week" onValueChange={onValueChange} />);
    expect(screen.getByRole('radio', { name: 'Hafta' })).toBeChecked();
  });

  it('useState bilan boshqariladi', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [v, setV] = useState('day');
      return (
        <>
          <Demo value={v} onValueChange={setV} />
          <output>{v}</output>
        </>
      );
    }
    render(<Controlled />);
    await user.click(screen.getByRole('radio', { name: 'Oy' }));
    expect(screen.getByRole('status')).toHaveTextContent('month');
  });

  it('tanlangan elementni qayta bosish tanlovni bekor qilmaydi', async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.click(screen.getByRole('radio', { name: 'Oy' }));
    expect(screen.getByRole('radio', { name: 'Oy' })).toBeChecked();
  });

  it('disabled: butun guruh yoki bitta element', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(<Demo disabled onValueChange={onValueChange} />);
    screen.getAllByRole('radio').forEach((r) => expect(r).toBeDisabled());
    expect(screen.getByRole('radiogroup')).toHaveAttribute('data-disabled');

    rerender(
      <SegmentedControl defaultValue="a" aria-label="Rejim" onValueChange={onValueChange}>
        <SegmentedControlItem value="a">A</SegmentedControlItem>
        <SegmentedControlItem value="b" disabled>
          B
        </SegmentedControlItem>
        <SegmentedControlItem value="c">C</SegmentedControlItem>
      </SegmentedControl>,
    );
    await user.click(screen.getByRole('radio', { name: 'B' }));
    expect(onValueChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole('radio', { name: 'A' }));
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'C' })).toHaveFocus();
  });

  it('ikonka va faqat ikonkali element (aria-label bilan)', () => {
    render(
      <SegmentedControl defaultValue="grid" aria-label="Ko‘rinish">
        <SegmentedControl.Item value="grid" icon={<GridIcon />} aria-label="To‘r" />
        <SegmentedControl.Item value="list" icon={<GridIcon />}>
          Ro‘yxat
        </SegmentedControl.Item>
      </SegmentedControl>,
    );
    expect(screen.getByRole('radio', { name: 'To‘r' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Ro‘yxat' })).toBeInTheDocument();
  });

  it('faqat ikonkali elementda aria-label TypeScript bilan majburiy', () => {
    // @ts-expect-error — aria-label yo'q
    const bad = <SegmentedControl.Item value="x" icon={<GridIcon />} />;
    expect(bad).toBeTruthy();
  });

  it('size, fullWidth, className va ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Demo ref={ref} size="lg" fullWidth className="mt-2" />);
    const root = screen.getByRole('radiogroup');
    expect(ref.current).toBe(root);
    expect(root).toHaveAttribute('data-size', 'lg');
    expect(root).toHaveAttribute('data-full-width');
    expect(root).toHaveClass('h-12', 'w-full', 'mt-2');
    screen.getAllByRole('radio').forEach((r) => expect(r).toHaveClass('flex-1'));
  });

  it('indikator tanlangan element joyiga siljiydi', async () => {
    // jsdom layout hisoblamaydi — o'lchamlarni tartib raqamidan beramiz
    const indexOf = (el: HTMLElement) =>
      el.getAttribute('role') === 'radio' && el.parentElement
        ? Array.from(el.parentElement.querySelectorAll('[role="radio"]')).indexOf(el)
        : 0;
    vi.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(function (
      this: HTMLElement,
    ) {
      return 4 + indexOf(this) * 60;
    });
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (
      this: HTMLElement,
    ) {
      return 50 + indexOf(this) * 5;
    });

    const user = userEvent.setup();
    const { container } = render(<Demo />);
    const indicator = container.querySelector<HTMLElement>(
      '[data-slot="segmented-control-indicator"]',
    )!;
    expect(indicator).toHaveAttribute('aria-hidden', 'true');
    expect(indicator.style.transform).toBe('translateX(124px)');
    expect(indicator.style.width).toBe('60px');
    expect(indicator.style.opacity).toBe('1');
    expect(indicator).toHaveClass('motion-reduce:data-animate:transition-none');

    await user.click(screen.getByRole('radio', { name: 'Kun' }));
    expect(indicator.style.transform).toBe('translateX(4px)');
    expect(indicator.style.width).toBe('50px');
  });

  it('qiymat tanlanmagan bo‘lsa indikator ko‘rinmaydi', () => {
    const { container } = render(<Demo defaultValue={undefined} />);
    const indicator = container.querySelector<HTMLElement>(
      '[data-slot="segmented-control-indicator"]',
    )!;
    expect(indicator.style.opacity).toBe('0');
  });

  it('name: forma ichida tanlangan qiymat yuboriladi', () => {
    const { container } = render(
      <form>
        <Demo name="period" />
      </form>,
    );
    const data = new FormData(container.querySelector('form')!);
    expect(data.get('period')).toBe('month');
  });

  it('Field ichida label guruh nomiga aylanadi', () => {
    render(
      <Field label="Ko‘rinish" description="Ro‘yxat ko‘rinishi">
        <SegmentedControl defaultValue="a">
          <SegmentedControl.Item value="a">A</SegmentedControl.Item>
          <SegmentedControl.Item value="b">B</SegmentedControl.Item>
        </SegmentedControl>
      </Field>,
    );
    const group = screen.getByRole('radiogroup', { name: 'Ko‘rinish' });
    expect(group).toHaveAccessibleDescription('Ro‘yxat ko‘rinishi');
  });
});
