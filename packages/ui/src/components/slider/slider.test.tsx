import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Field } from '../field/field';
import { Slider } from './index';

describe('Slider', () => {
  it('role="slider", aria-value* va standart nom bilan render qilinadi', () => {
    render(<Slider defaultValue={[40]} />);
    const thumb = screen.getByRole('slider', { name: 'Qiymat' });
    expect(thumb).toHaveAttribute('aria-valuemin', '0');
    expect(thumb).toHaveAttribute('aria-valuemax', '100');
    expect(thumb).toHaveAttribute('aria-valuenow', '40');
    expect(thumb).toHaveAttribute('aria-valuetext', '40');
  });

  it('defaultValue berilmasa min dan boshlanadi', () => {
    render(<Slider min={10} aria-label="Hajm" />);
    expect(screen.getByRole('slider', { name: 'Hajm' })).toHaveAttribute('aria-valuenow', '10');
  });

  it('strelkalar ±step, PageUp/PageDown ±10×step, Home/End', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Slider defaultValue={[50]} step={2} onValueChange={onValueChange} />);
    const thumb = screen.getByRole('slider');
    await user.tab();
    expect(thumb).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(thumb).toHaveAttribute('aria-valuenow', '52');
    expect(onValueChange).toHaveBeenLastCalledWith([52]);
    await user.keyboard('{ArrowUp}');
    expect(thumb).toHaveAttribute('aria-valuenow', '54');
    await user.keyboard('{ArrowLeft}{ArrowDown}');
    expect(thumb).toHaveAttribute('aria-valuenow', '50');
    await user.keyboard('{PageUp}');
    expect(thumb).toHaveAttribute('aria-valuenow', '70');
    await user.keyboard('{PageDown}');
    expect(thumb).toHaveAttribute('aria-valuenow', '50');
    await user.keyboard('{End}');
    expect(thumb).toHaveAttribute('aria-valuenow', '100');
    await user.keyboard('{Home}');
    expect(thumb).toHaveAttribute('aria-valuenow', '0');
  });

  it('onValueCommit klaviatura bilan o‘zgarganda chaqiriladi', async () => {
    const user = userEvent.setup();
    const onValueCommit = vi.fn();
    render(<Slider defaultValue={[10]} onValueCommit={onValueCommit} />);
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(onValueCommit).toHaveBeenCalledWith([11]);
  });

  it('boshqariladigan rejim: prop o‘zgarmaguncha qiymat saqlanadi', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(<Slider value={[30]} onValueChange={onValueChange} />);
    const thumb = screen.getByRole('slider');
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(onValueChange).toHaveBeenCalledWith([31]);
    expect(thumb).toHaveAttribute('aria-valuenow', '30');
    rerender(<Slider value={[31]} onValueChange={onValueChange} />);
    expect(thumb).toHaveAttribute('aria-valuenow', '31');
  });

  it('useState bilan boshqariladi', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [v, setV] = useState([5]);
      return (
        <>
          <Slider value={v} onValueChange={setV} />
          <output>{v.join(',')}</output>
        </>
      );
    }
    render(<Controlled />);
    await user.tab();
    await user.keyboard('{End}');
    expect(screen.getByRole('status')).toHaveTextContent('100');
  });

  it('oraliq: ikki tutqich, har biriga o‘z nomi, formatValue → aria-valuetext', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Slider
        defaultValue={[1_000_000, 3_000_000]}
        min={0}
        max={5_000_000}
        step={50_000}
        formatValue={(v) => `${v / 1_000_000} mln so‘m`}
        onValueChange={onValueChange}
      />,
    );
    const [lo, hi] = screen.getAllByRole('slider');
    expect(lo).toHaveAccessibleName('Minimal qiymat');
    expect(hi).toHaveAccessibleName('Maksimal qiymat');
    expect(lo).toHaveAttribute('aria-valuetext', '1 mln so‘m');
    expect(hi).toHaveAttribute('aria-valuetext', '3 mln so‘m');

    await user.tab();
    await user.tab();
    expect(hi).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(onValueChange).toHaveBeenLastCalledWith([1_000_000, 3_050_000]);
    expect(hi).toHaveAttribute('aria-valuetext', '3.05 mln so‘m');
  });

  it('labels.thumb va aria-label tutqich nomlarini o‘zgartiradi', () => {
    const { rerender } = render(
      <Slider defaultValue={[10, 20]} labels={{ thumb: (i) => (i === 0 ? 'Dan' : 'Gacha') }} />,
    );
    expect(screen.getAllByRole('slider').map((t) => t.getAttribute('aria-label'))).toEqual([
      'Dan',
      'Gacha',
    ]);
    rerender(<Slider defaultValue={[10, 20]} aria-label="Narx" />);
    expect(screen.getByRole('slider', { name: 'Narx, Minimal qiymat' })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'Narx, Maksimal qiymat' })).toBeInTheDocument();
  });

  it('pufakcha: showValue bo‘yicha', () => {
    const { container, rerender } = render(<Slider defaultValue={[42]} />);
    const bubble = container.querySelector('[data-slot="slider-value"]');
    expect(bubble).toHaveTextContent('42');
    expect(bubble).toHaveAttribute('aria-hidden', 'true');
    expect(bubble).toHaveClass('opacity-0');
    rerender(<Slider defaultValue={[42]} showValue="always" />);
    expect(container.querySelector('[data-slot="slider-value"]')).toHaveClass('opacity-100');
    rerender(<Slider defaultValue={[42]} showValue="never" />);
    expect(container.querySelector('[data-slot="slider-value"]')).toBeNull();
  });

  it('marks trek ostida chiziladi', () => {
    const { container } = render(
      <Slider
        defaultValue={[0]}
        marks={[{ value: 0, label: '0' }, { value: 50, label: '50' }, { value: 100 }]}
      />,
    );
    const marks = container.querySelectorAll<HTMLElement>('[data-slot="slider-mark"]');
    expect(marks).toHaveLength(3);
    expect(marks[1]).toHaveTextContent('50');
    expect(marks[1]!.style.left).toBe('calc(50% + 0px)');
    expect(marks[0]!.style.left).toBe('calc(0% + 10px)');
    expect(container.querySelector('[data-slot="slider-marks"]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('disabled: fokuslanmaydi, qiymat o‘zgarmaydi', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <Slider defaultValue={[20]} disabled onValueChange={onValueChange} />,
    );
    const thumb = screen.getByRole('slider');
    expect(thumb).not.toHaveAttribute('tabindex');
    expect(container.firstChild).toHaveAttribute('data-disabled');
    await user.tab();
    expect(thumb).not.toHaveFocus();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('name: forma ichida har tutqich uchun yashirin input', () => {
    const { container } = render(
      <form>
        <Slider name="price" defaultValue={[10, 90]} />
      </form>,
    );
    const inputs = container.querySelectorAll<HTMLInputElement>('input[name="price[]"]');
    expect(inputs).toHaveLength(2);
    const data = new FormData(container.querySelector('form')!);
    expect(data.getAll('price[]')).toEqual(['10', '90']);
  });

  it('Field bilan: label nomga, izoh va xato aria-describedby ga, invalid ulanadi', () => {
    const { container } = render(
      <Field label="Ovoz balandligi" description="0 dan 100 gacha" error="Juda baland">
        <Slider defaultValue={[70]} />
      </Field>,
    );
    const thumb = screen.getByRole('slider', { name: 'Ovoz balandligi' });
    expect(thumb).toHaveAccessibleDescription('0 dan 100 gacha Juda baland');
    expect(thumb).toHaveAttribute('aria-invalid', 'true');
    expect(container.querySelector('[data-size]')).toHaveAttribute('data-invalid');
  });

  it('Field ichida oraliq: "label + tutqich nomi"', () => {
    render(
      <Field label="Narx">
        <Slider defaultValue={[10, 20]} />
      </Field>,
    );
    expect(screen.getByRole('slider', { name: 'Narx Minimal qiymat' })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'Narx Maksimal qiymat' })).toBeInTheDocument();
  });

  it('Field disabled sliderni ham o‘chiradi', () => {
    render(
      <Field label="Hajm" disabled>
        <Slider defaultValue={[5]} />
      </Field>,
    );
    expect(screen.getByRole('slider')).toHaveAttribute('data-disabled');
  });

  it('vertikal yo‘nalish, size, className va ref', () => {
    const ref = createRef<HTMLSpanElement>();
    const { container } = render(
      <Slider ref={ref} defaultValue={[5]} orientation="vertical" size="sm" className="h-60" />,
    );
    const root = container.firstChild as HTMLElement;
    expect(ref.current).toBe(root);
    expect(root).toHaveAttribute('data-orientation', 'vertical');
    expect(root).toHaveAttribute('data-size', 'sm');
    expect(root).toHaveClass('h-60');
    expect(screen.getByRole('slider')).toHaveAttribute('aria-orientation', 'vertical');
  });
});
