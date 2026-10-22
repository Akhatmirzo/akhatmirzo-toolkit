import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Field } from '../field/field';
import { Rating } from './index';

const stars = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('[data-slot="rating-star"]')).map((s) =>
    s.getAttribute('data-state'),
  );

describe('Rating', () => {
  it('radiogroup + har yulduz radio, standart nom', () => {
    render(<Rating defaultValue={3} />);
    const group = screen.getByRole('radiogroup', { name: 'Baho' });
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(5);
    expect(screen.getByRole('radio', { name: '3 / 5' })).toHaveAttribute('aria-checked', 'true');
    expect(group).toHaveAttribute('data-size', 'md');
  });

  it('bosish qiymatni tanlaydi, qayta bosish 0 qiladi (allowClear)', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(<Rating onValueChange={onValueChange} />);
    await user.click(screen.getByRole('radio', { name: '4 / 5' }));
    expect(onValueChange).toHaveBeenLastCalledWith(4);
    await user.unhover(screen.getByRole('radiogroup'));
    expect(stars(container)).toEqual(['full', 'full', 'full', 'full', 'empty']);
    await user.click(screen.getByRole('radio', { name: '4 / 5' }));
    expect(onValueChange).toHaveBeenLastCalledWith(0);
  });

  it('allowClear={false} — qayta bosish o‘zgartirmaydi', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Rating defaultValue={2} allowClear={false} onValueChange={onValueChange} />);
    await user.click(screen.getByRole('radio', { name: '2 / 5' }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('klaviatura: strelkalar, Home/End, roving tabindex', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Rating defaultValue={2} onValueChange={onValueChange} />);
    await user.tab();
    expect(screen.getByRole('radio', { name: '2 / 5' })).toHaveFocus();
    expect(screen.getByRole('radio', { name: '1 / 5' })).toHaveAttribute('tabindex', '-1');

    await user.keyboard('{ArrowRight}');
    expect(onValueChange).toHaveBeenLastCalledWith(3);
    expect(screen.getByRole('radio', { name: '3 / 5' })).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(onValueChange).toHaveBeenLastCalledWith(4);
    await user.keyboard('{ArrowLeft}{ArrowDown}');
    expect(onValueChange).toHaveBeenLastCalledWith(2);
    await user.keyboard('{End}');
    expect(onValueChange).toHaveBeenLastCalledWith(5);
    await user.keyboard('{ArrowRight}');
    expect(onValueChange).toHaveBeenCalledTimes(5);
    await user.keyboard('{Home}');
    expect(onValueChange).toHaveBeenLastCalledWith(1);
  });

  it('qiymat yo‘q: birinchi yulduz fokuslanadi, Space tanlaydi', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Rating onValueChange={onValueChange} />);
    await user.tab();
    expect(screen.getByRole('radio', { name: '1 / 5' })).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(onValueChange).not.toHaveBeenCalled();
    await user.keyboard(' ');
    expect(onValueChange).toHaveBeenLastCalledWith(1);
  });

  it('allowHalf: yarim qiymatlar, 0.5 qadam', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [v, setV] = useState(3.5);
      return <Rating value={v} onValueChange={setV} allowHalf />;
    }
    const { container } = render(<Controlled />);
    expect(screen.getAllByRole('radio')).toHaveLength(10);
    expect(screen.getByRole('radio', { name: '3.5 / 5' })).toHaveAttribute('aria-checked', 'true');
    expect(stars(container)).toEqual(['full', 'full', 'full', 'partial', 'empty']);

    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: '4 / 5' })).toHaveAttribute('aria-checked', 'true');
    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(screen.getByRole('radio', { name: '3 / 5' })).toHaveFocus();

    await user.click(screen.getByRole('radio', { name: '1.5 / 5' }));
    expect(screen.getByRole('radio', { name: '1.5 / 5' })).toHaveAttribute('aria-checked', 'true');
  });

  it('hover — oldindan ko‘rish, chiqqanda tiklanadi', () => {
    const { container } = render(<Rating defaultValue={1} />);
    fireEvent.pointerEnter(screen.getByRole('radio', { name: '4 / 5' }));
    expect(stars(container)).toEqual(['full', 'full', 'full', 'full', 'empty']);
    expect(screen.getByRole('radiogroup')).toHaveAttribute('data-hover');
    fireEvent.pointerLeave(screen.getByRole('radiogroup'));
    expect(stars(container)).toEqual(['full', 'empty', 'empty', 'empty', 'empty']);
  });

  it('readOnly — role="img" va aria-label, kasr qiymat', () => {
    const { container } = render(<Rating value={4.5} readOnly />);
    const img = screen.getByRole('img', { name: '4.5 / 5' });
    expect(img).toHaveAttribute('data-readonly');
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    expect(stars(container)).toEqual(['full', 'full', 'full', 'full', 'partial']);
  });

  it('readOnly — labels.value bilan', () => {
    render(
      <Rating value={3} max={10} readOnly labels={{ value: (v, m) => `${v} ball, ${m} dan` }} />,
    );
    expect(screen.getByRole('img', { name: '3 ball, 10 dan' })).toBeInTheDocument();
  });

  it('disabled — tanlab bo‘lmaydi va fokus olmaydi', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Rating defaultValue={2} disabled onValueChange={onValueChange} />);
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-disabled', 'true');
    await user.click(screen.getByRole('radio', { name: '4 / 5' }));
    await user.tab();
    expect(onValueChange).not.toHaveBeenCalled();
    expect(document.body).toHaveFocus();
  });

  it('Field ichida label bilan nomlanadi', () => {
    render(
      <Field label="Xizmat sifati" description="1 dan 5 gacha">
        <Rating />
      </Field>,
    );
    const group = screen.getByRole('radiogroup', { name: 'Xizmat sifati' });
    expect(group).toHaveAccessibleDescription('1 dan 5 gacha');
  });

  it('color va size data atributlari / klasslari', () => {
    const { container } = render(<Rating defaultValue={2} color="danger" size="lg" />);
    expect(screen.getByRole('radiogroup')).toHaveAttribute('data-size', 'lg');
    expect(container.querySelector('.text-danger')).toBeInTheDocument();
  });
});
