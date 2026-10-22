import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Stepper, type StepperStep } from './index';

const steps: StepperStep[] = [
  { title: 'Savat' },
  { title: 'Yetkazib berish', description: 'Manzil va vaqt' },
  { title: "To'lov" },
  { title: 'Tasdiqlash', optional: true },
];

const items = (container: HTMLElement) =>
  Array.from(
    container.querySelectorAll<HTMLElement>(
      '[data-slot="stepper-list"] > [data-slot="stepper-step"]',
    ),
  );

describe('Stepper', () => {
  it('ol tuzilishi va holatlar (complete / current / upcoming)', () => {
    const { container } = render(<Stepper steps={steps} defaultValue={1} compact={false} />);
    const list = screen.getByRole('list');
    expect(list.tagName).toBe('OL');
    expect(items(container).map((li) => li.dataset.status)).toEqual([
      'complete',
      'current',
      'upcoming',
      'upcoming',
    ]);
    expect(items(container)[1]).toHaveAttribute('aria-current', 'step');
    expect(items(container)[0]).not.toHaveAttribute('aria-current');
  });

  it('error holati, ixtiyoriy va ko‘rinmas holat matnlari', () => {
    const { container } = render(
      <Stepper
        steps={[{ title: 'Savat' }, { title: "To'lov", status: 'error' }, ...steps.slice(3)]}
        value={2}
        compact={false}
      />,
    );
    const [first, second, third] = items(container);
    expect(second).toHaveAttribute('data-status', 'error');
    expect(within(first!).getByText(', bajarildi')).toHaveClass('sr-only');
    expect(within(second!).getByText(', xato')).toHaveClass('sr-only');
    expect(within(first!).getByText('1-qadam, 3 tadan:', { exact: false })).toHaveClass('sr-only');
    expect(within(third!).getByText('ixtiyoriy')).toBeInTheDocument();
  });

  it('onValueChange berilmasa — hech narsa bosilmaydi', () => {
    render(<Stepper steps={steps} value={2} compact={false} />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('onValueChange bilan faqat o‘tgan qadamlar bosiladi', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Stepper steps={steps} value={2} onValueChange={onValueChange} compact={false} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    await user.click(screen.getByRole('button', { name: /Savat/ }));
    expect(onValueChange).toHaveBeenCalledWith(0);
  });

  it('allowFutureSteps — kelgusi qadamlar ham bosiladi (joriydan tashqari)', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <Stepper
        steps={steps}
        defaultValue={1}
        onValueChange={onValueChange}
        allowFutureSteps
        compact={false}
      />,
    );
    expect(screen.getAllByRole('button')).toHaveLength(3);
    await user.click(screen.getByRole('button', { name: /Tasdiqlash/ }));
    expect(onValueChange).toHaveBeenCalledWith(3);
    // boshqarilmaydigan rejim — holat yangilanadi
    expect(items(container)[3]).toHaveAttribute('aria-current', 'step');
  });

  it('klaviatura: Tab va Enter / Space', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Stepper steps={steps} value={3} onValueChange={onValueChange} compact={false} />);
    await user.tab();
    expect(screen.getByRole('button', { name: /Savat/ })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith(0);
    await user.tab();
    await user.keyboard(' ');
    expect(onValueChange).toHaveBeenLastCalledWith(1);
  });

  it('ulovchi chiziq: o‘tgan qism to‘ladi', () => {
    const { container } = render(<Stepper steps={steps} value={2} compact={false} />);
    const fills = Array.from(container.querySelectorAll('[data-slot="stepper-connector"] > span'));
    expect(fills).toHaveLength(3);
    expect(fills[0]).toHaveClass('scale-100');
    expect(fills[1]).toHaveClass('scale-100');
    expect(fills[2]).toHaveClass('scale-x-0');
    container
      .querySelectorAll('[data-slot="stepper-connector"]')
      .forEach((c) => expect(c).toHaveAttribute('aria-hidden', 'true'));
  });

  it('compact — "2 / 4 · Yetkazib berish" va chiziq', () => {
    const { container } = render(<Stepper steps={steps} value={1} compact />);
    expect(container.querySelector('[data-slot="stepper-list"]')).toBeNull();
    const compact = container.querySelector<HTMLElement>('[data-slot="stepper-compact"]')!;
    expect(compact).toHaveTextContent('2 / 4 ·');
    expect(compact).toHaveTextContent('Yetkazib berish');
    const fill = compact.querySelector<HTMLElement>('[aria-hidden="true"] > span')!;
    expect(fill.style.transform).toBe('scaleX(0.5)');
  });

  it("compact='auto' — gorizontalda ikkala ko'rinish, vertikalda faqat ro'yxat", () => {
    const { container, rerender } = render(<Stepper steps={steps} />);
    expect(container.querySelector('[data-slot="stepper-list"]')).toHaveClass('max-sm:hidden');
    expect(container.querySelector('[data-slot="stepper-compact"]')).toHaveClass('sm:hidden');
    rerender(<Stepper steps={steps} orientation="vertical" />);
    expect(container.querySelector('[data-slot="stepper-compact"]')).toBeNull();
    expect(container.querySelector('[data-slot="stepper-list"]')).not.toHaveClass('max-sm:hidden');
  });

  it('value = steps.length — hammasi bajarilgan', () => {
    const { container } = render(<Stepper steps={steps} value={4} compact={false} />);
    expect(items(container).every((li) => li.dataset.status === 'complete')).toBe(true);
  });

  it('labels, aria-label, className, ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Stepper
        ref={ref}
        steps={steps}
        aria-label="Buyurtma bosqichlari"
        className="mt-6"
        size="sm"
        orientation="vertical"
        labels={{ step: (i, n) => `Step ${i} of ${n}`, optional: 'optional' }}
      />,
    );
    const list = screen.getByRole('list', { name: 'Buyurtma bosqichlari' });
    expect(ref.current).toHaveClass('mt-6');
    expect(ref.current).toHaveAttribute('data-size', 'sm');
    expect(ref.current).toHaveAttribute('data-orientation', 'vertical');
    expect(ref.current).not.toHaveAttribute('aria-label');
    expect(within(list).getByText('Step 1 of 4:', { exact: false })).toBeInTheDocument();
    expect(within(list).getByText('optional')).toBeInTheDocument();
  });

  it('a11y: tugmalar nomga ega, indikator yashirin', () => {
    const { container } = render(<Stepper steps={steps} value={3} onValueChange={() => {}} />);
    container.querySelectorAll('button').forEach((b) => expect(b).toHaveAccessibleName());
    container
      .querySelectorAll('[data-slot="stepper-indicator"]')
      .forEach((el) => expect(el).toHaveAttribute('aria-hidden', 'true'));
  });
});
