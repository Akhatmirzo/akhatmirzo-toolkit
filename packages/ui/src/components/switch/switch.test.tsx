import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Field } from '../field/field';
import { Switch } from './switch';

describe('Switch', () => {
  it('role="switch" bilan render qilinadi', () => {
    render(<Switch label="Bildirishnomalar" />);
    const sw = screen.getByRole('switch', { name: 'Bildirishnomalar' });
    expect(sw).not.toBeChecked();
  });

  it('label bosilganda almashtiriladi', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { container } = render(<Switch label="Avtosaqlash" onCheckedChange={onCheckedChange} />);
    await user.click(screen.getByText('Avtosaqlash'));
    expect(screen.getByRole('switch')).toBeChecked();
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
    expect(container.firstChild).toHaveAttribute('data-state', 'checked');
  });

  it('Tab + Space bilan ishlaydi', async () => {
    const user = userEvent.setup();
    render(<Switch label="Wi-Fi" defaultChecked />);
    await user.tab();
    const sw = screen.getByRole('switch');
    expect(sw).toHaveFocus();
    expect(sw).toBeChecked();
    await user.keyboard(' ');
    expect(sw).not.toBeChecked();
  });

  it('boshqariladigan rejimda prop o‘zgarmaguncha holat saqlanadi', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { rerender } = render(
      <Switch aria-label="Rejim" checked onCheckedChange={onCheckedChange} />,
    );
    await user.click(screen.getByRole('switch'));
    expect(onCheckedChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole('switch')).toBeChecked();
    rerender(<Switch aria-label="Rejim" checked={false} onCheckedChange={onCheckedChange} />);
    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  it('disabled bo‘lsa bosilmaydi', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Switch label="O‘chiq" disabled onCheckedChange={onCheckedChange} />);
    await user.click(screen.getByText('O‘chiq'));
    expect(screen.getByRole('switch')).toBeDisabled();
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('description, size, className, ref va atributlar', () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = render(
      <Switch
        ref={ref}
        label="Qorong‘i mavzu"
        description="Tizim sozlamasiga bog‘liq emas"
        size="sm"
        className="custom"
        name="dark"
      />,
    );
    const sw = screen.getByRole('switch', { name: 'Qorong‘i mavzu' });
    expect(sw).toHaveAccessibleDescription('Tizim sozlamasiga bog‘liq emas');
    expect(ref.current).toBe(sw);
    expect(sw).toHaveAttribute('name', 'dark');
    expect(container.firstChild).toHaveClass('custom');
    expect(container.firstChild).toHaveAttribute('data-size', 'sm');
  });

  it('Field bilan: label ulanadi, xato aria-describedby va aria-invalid ga tushadi', async () => {
    const user = userEvent.setup();
    render(
      <Field label="Bildirishnomalar" error="Xato">
        <Switch />
      </Field>,
    );
    const sw = screen.getByRole('switch', { name: 'Bildirishnomalar' });
    await user.click(screen.getByText('Bildirishnomalar'));
    expect(sw).toBeChecked();
    expect(sw).toHaveAttribute('aria-invalid', 'true');
    expect(sw).toHaveAccessibleDescription('Xato');
  });

  it('invalid prop: aria-invalid va data-invalid', () => {
    const { container } = render(<Switch aria-label="A" invalid />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-invalid', 'true');
    expect(container.firstChild).toHaveAttribute('data-invalid');
  });
});
