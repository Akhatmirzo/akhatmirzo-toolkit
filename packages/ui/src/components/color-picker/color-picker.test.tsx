import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Field } from '../field/field';
import { ColorPicker } from './index';

async function openPicker(props: Parameters<typeof ColorPicker>[0] = {}) {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  const utils = render(<ColorPicker onValueChange={onValueChange} {...props} />);
  await user.click(screen.getByRole('button', { name: /Rang tanlash/ }));
  return { user, onValueChange, ...utils };
}

describe('ColorPicker', () => {
  afterEach(() => {
    delete (window as { EyeDropper?: unknown }).EyeDropper;
  });

  it('trigger — standart rang va nom bilan', () => {
    render(<ColorPicker />);
    const trigger = screen.getByRole('button', { name: 'Rang tanlash, #4F46E5' });
    expect(trigger).toHaveTextContent('#4F46E5');
    expect(trigger).toHaveAttribute('data-size', 'md');
  });

  it('Field ichida: label + qiymat bilan nomlanadi, invalid', () => {
    render(
      <Field label="Brend rangi" error="Majburiy">
        <ColorPicker defaultValue="#10b981" />
      </Field>,
    );
    const trigger = screen.getByRole('button', { name: 'Brend rangi #10B981' });
    expect(trigger).toHaveAttribute('aria-invalid', 'true');
    expect(trigger).toHaveAttribute('data-invalid');
  });

  it('hex input: to‘liq hex darhol qo‘llanadi, noto‘g‘ri matn blur’da tiklanadi', async () => {
    const { user, onValueChange } = await openPicker();
    const hex = screen.getByRole('textbox', { name: 'HEX' });
    expect(hex).toHaveValue('#4F46E5');

    await user.clear(hex);
    await user.type(hex, '#0ea5e9');
    expect(onValueChange).toHaveBeenLastCalledWith('#0ea5e9');

    await user.clear(hex);
    await user.type(hex, 'zz');
    expect(hex).toHaveAttribute('aria-invalid', 'true');
    await user.tab();
    expect(hex).toHaveValue('#0EA5E9');
    expect(hex).not.toHaveAttribute('aria-invalid');
  });

  it('hex input: qisqa #abc Enter bilan qo‘llanadi', async () => {
    const { user, onValueChange } = await openPicker();
    const hex = screen.getByRole('textbox', { name: 'HEX' });
    await user.clear(hex);
    await user.type(hex, 'abc{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith('#aabbcc');
    expect(hex).toHaveValue('#AABBCC');
  });

  it('swatch bosilganda rang tanlanadi, aria-pressed', async () => {
    const { user, onValueChange } = await openPicker({
      swatches: ['#4f46e5', '#0ea5e9', '#10b981'],
    });
    const group = screen.getByRole('group', { name: 'Tayyor ranglar' });
    expect(group.querySelectorAll('button')).toHaveLength(3);
    expect(screen.getByRole('button', { name: '#4F46E5' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: '#10B981' }));
    expect(onValueChange).toHaveBeenLastCalledWith('#10b981');
    expect(screen.getByRole('button', { name: '#10B981' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Rang tanlash/ })).toHaveTextContent('#10B981');
  });

  it('2D maydon: strelkalar to‘yinganlik va yorqinlikni o‘zgartiradi', async () => {
    const { user, onValueChange } = await openPicker({ defaultValue: '#ff0000' });
    const area = screen.getByRole('slider', { name: "To'yinganlik va yorqinlik" });
    expect(area).toHaveAttribute('aria-valuetext', "to'yinganlik 100%, yorqinlik 100%");

    area.focus();
    await user.keyboard('{ArrowLeft}');
    expect(area).toHaveAttribute('aria-valuenow', '99');
    expect(area).toHaveAttribute('aria-valuetext', "to'yinganlik 99%, yorqinlik 100%");
    await user.keyboard('{Shift>}{ArrowDown}{/Shift}');
    expect(area).toHaveAttribute('aria-valuetext', "to'yinganlik 99%, yorqinlik 90%");
    await user.keyboard('{Home}');
    expect(area).toHaveAttribute('aria-valuenow', '0');
    // s = 0, v = 90% → kulrang
    expect(onValueChange).toHaveBeenLastCalledWith('#e6e6e6');
  });

  it('hue slayderi Slider komponenti orqali', async () => {
    const { user, onValueChange } = await openPicker({ defaultValue: '#ff0000' });
    const hue = screen.getByRole('slider', { name: 'Rang tusi' });
    expect(hue).toHaveAttribute('aria-valuenow', '0');
    hue.focus();
    await user.keyboard('{End}');
    expect(hue).toHaveAttribute('aria-valuetext', '360°');
    await user.keyboard('{Home}');
    await user.keyboard('{PageUp>12/}');
    expect(onValueChange).toHaveBeenLastCalledWith('#00ff00');
  });

  it('alpha rejimi: #rrggbbaa va shaffoflik slayderi', async () => {
    const { user, onValueChange } = await openPicker({ alpha: true, defaultValue: '#4f46e5' });
    expect(screen.getByRole('button', { name: /Rang tanlash/ })).toHaveTextContent('#4F46E5FF');
    const alphaSlider = screen.getByRole('slider', { name: 'Shaffoflik' });
    expect(alphaSlider).toHaveAttribute('aria-valuenow', '100');
    alphaSlider.focus();
    await user.keyboard('{Home}');
    expect(onValueChange).toHaveBeenLastCalledWith('#4f46e500');
    expect(screen.getByRole('textbox', { name: 'HEX' })).toHaveValue('#4F46E500');
  });

  it('alpha yo‘q bo‘lsa shaffoflik slayderi chiqmaydi', async () => {
    await openPicker();
    expect(screen.queryByRole('slider', { name: 'Shaffoflik' })).not.toBeInTheDocument();
  });

  it('EyeDropper API yo‘q — pipetka tugmasi yashirin', async () => {
    await openPicker();
    expect(screen.queryByRole('button', { name: 'Ekrandan rang olish' })).not.toBeInTheDocument();
  });

  it('EyeDropper API bor — tugma tanlangan rangni qo‘llaydi', async () => {
    const open = vi.fn().mockResolvedValue({ sRGBHex: '#123456' });
    (window as { EyeDropper?: unknown }).EyeDropper = class {
      open = open;
    };
    const { user, onValueChange } = await openPicker();
    await user.click(screen.getByRole('button', { name: 'Ekrandan rang olish' }));
    expect(open).toHaveBeenCalled();
    expect(onValueChange).toHaveBeenLastCalledWith('#123456');
  });

  it('eyeDropper={false} — API bo‘lsa ham tugma yo‘q', async () => {
    (window as { EyeDropper?: unknown }).EyeDropper = class {};
    await openPicker({ eyeDropper: false });
    expect(screen.queryByRole('button', { name: 'Ekrandan rang olish' })).not.toBeInTheDocument();
  });

  it('name — yashirin input, disabled — ochilmaydi', async () => {
    const user = userEvent.setup();
    const { container } = render(<ColorPicker name="brand" defaultValue="#0EA5E9" disabled />);
    expect(container.querySelector('input[type="hidden"]')).toHaveValue('#0ea5e9');
    const trigger = screen.getByRole('button', { name: /Rang tanlash/ });
    expect(trigger).toBeDisabled();
    await user.click(trigger);
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
  });
});
