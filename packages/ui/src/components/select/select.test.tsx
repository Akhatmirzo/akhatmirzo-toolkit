import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Field } from '../field/field';
import { Select, type SelectProps } from './select';

function Regions(props: Omit<SelectProps, 'children'>) {
  return (
    <Select aria-label="Viloyat" {...props}>
      <Select.Item value="tsh">Toshkent</Select.Item>
      <Select.Item value="sam">Samarqand</Select.Item>
      <Select.Item value="bux" disabled>
        Buxoro
      </Select.Item>
      <Select.Group label="Vodiy">
        <Select.Item value="fer">Farg‘ona</Select.Item>
        <Select.Item value="nam">Namangan</Select.Item>
      </Select.Group>
    </Select>
  );
}

describe('Select', () => {
  it('combobox roli, default placeholder "Tanlang" va yopiq holat', () => {
    render(<Regions />);
    const trigger = screen.getByRole('combobox', { name: 'Viloyat' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('data-placeholder');
    expect(trigger).toHaveTextContent('Tanlang');
    expect(trigger).toHaveAttribute('data-size', 'md');
  });

  it('placeholder o‘zgartiriladi', () => {
    render(<Regions placeholder="Viloyatni tanlang" />);
    expect(screen.getByRole('combobox')).toHaveTextContent('Viloyatni tanlang');
  });

  it('bosilganda ochiladi: listbox, option’lar, guruh sarlavhasi', async () => {
    const user = userEvent.setup();
    render(<Regions />);
    const trigger = screen.getByRole('combobox');
    await user.click(trigger);
    const listbox = await screen.findByRole('listbox');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('data-state', 'open');
    expect(screen.getAllByRole('option')).toHaveLength(5);
    expect(screen.getByRole('group')).toHaveTextContent('Vodiy');
    expect(screen.getByRole('option', { name: 'Buxoro' })).toHaveAttribute('data-disabled');
    expect(listbox.closest('[data-slot="select-content"]')).toBeInTheDocument();
  });

  it('boshqarilmaydigan: sichqoncha bilan tanlash, ✓ tanlangan qatorda', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Regions onValueChange={onValueChange} />);
    const trigger = screen.getByRole('combobox');
    await user.click(trigger);
    await user.click(await screen.findByRole('option', { name: 'Samarqand' }));
    expect(onValueChange).toHaveBeenCalledWith('sam');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(trigger).toHaveTextContent('Samarqand');
    expect(trigger).not.toHaveAttribute('data-placeholder');

    await user.click(trigger);
    const selected = await screen.findByRole('option', { name: 'Samarqand' });
    expect(selected).toHaveAttribute('aria-selected', 'true');
    expect(selected).toHaveAttribute('data-state', 'checked');
    expect(selected.querySelector('svg')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Toshkent' }).querySelector('svg')).toBeNull();
  });

  it('klaviatura: ↓ ochadi, ↓ ↑ yuradi, disabled o‘tkaziladi, Enter tanlaydi', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Regions defaultValue="sam" onValueChange={onValueChange} />);
    const trigger = screen.getByRole('combobox');
    await user.tab();
    expect(trigger).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    // ochilganda tanlangan elementga fokus
    await waitFor(() => expect(screen.getByRole('option', { name: 'Samarqand' })).toHaveFocus());
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('option', { name: 'Farg‘ona' })).toHaveFocus();
    await user.keyboard('{End}');
    expect(screen.getByRole('option', { name: 'Namangan' })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('option', { name: 'Toshkent' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('tsh');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(trigger).toHaveTextContent('Toshkent');
    expect(trigger).toHaveFocus();
  });

  it('typeahead: harf bilan elementga sakraydi', async () => {
    const user = userEvent.setup();
    render(<Regions />);
    screen.getByRole('combobox').focus();
    await user.keyboard('{Enter}');
    await screen.findByRole('listbox');
    await user.keyboard('n');
    await waitFor(() => expect(screen.getByRole('option', { name: 'Namangan' })).toHaveFocus());
  });

  it('Esc yopadi, qiymat o‘zgarmaydi, fokus trigger’ga qaytadi', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Regions defaultValue="tsh" onValueChange={onValueChange} />);
    const trigger = screen.getByRole('combobox');
    await user.click(trigger);
    await screen.findByRole('listbox');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(onValueChange).not.toHaveBeenCalled();
    expect(trigger).toHaveTextContent('Toshkent');
    expect(trigger).toHaveFocus();
  });

  it('boshqariladigan rejim: faqat value bo‘yicha ko‘rsatadi', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(<Regions value="tsh" onValueChange={onValueChange} />);
    const trigger = screen.getByRole('combobox');
    await user.click(trigger);
    await user.click(await screen.findByRole('option', { name: 'Namangan' }));
    expect(onValueChange).toHaveBeenCalledWith('nam');
    expect(trigger).toHaveTextContent('Toshkent');
    rerender(<Regions value="nam" onValueChange={onValueChange} />);
    expect(trigger).toHaveTextContent('Namangan');
  });

  it('boshqariladigan rejim useState bilan', async () => {
    const user = userEvent.setup();
    function Demo() {
      const [v, setV] = useState('fer');
      return (
        <>
          <output>{v}</output>
          <Regions value={v} onValueChange={setV} />
        </>
      );
    }
    render(<Demo />);
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'Toshkent' }));
    expect(screen.getByRole('status')).toHaveTextContent('tsh');
    expect(screen.getByRole('combobox')).toHaveTextContent('Toshkent');
  });

  it('disabled: ochilmaydi', async () => {
    const user = userEvent.setup();
    render(<Regions disabled />);
    const trigger = screen.getByRole('combobox');
    expect(trigger).toBeDisabled();
    expect(trigger).toHaveAttribute('data-disabled');
    await user.click(trigger);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('invalid: aria-invalid va data-invalid; size', () => {
    render(<Regions invalid size="lg" />);
    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveAttribute('aria-invalid', 'true');
    expect(trigger).toHaveAttribute('data-invalid');
    expect(trigger).toHaveAttribute('data-size', 'lg');
    expect(trigger).toHaveClass('h-12');
  });

  it('Field ichida: label, description, error, required va disabled ulanadi', () => {
    render(
      <Field label="Viloyat" description="Yetkazib berish uchun" error="Viloyatni tanlang" required>
        <Select>
          <Select.Item value="tsh">Toshkent</Select.Item>
        </Select>
      </Field>,
    );
    const trigger = screen.getByRole('combobox', { name: 'Viloyat' });
    expect(trigger).toHaveAccessibleDescription('Yetkazib berish uchun Viloyatni tanlang');
    expect(trigger).toHaveAttribute('aria-invalid', 'true');
    expect(trigger).toHaveAttribute('aria-required', 'true');
    expect(trigger).toHaveAttribute('data-invalid');
  });

  it('Field disabled bo‘lsa trigger ham o‘chadi', () => {
    render(
      <Field label="Viloyat" disabled>
        <Select>
          <Select.Item value="tsh">Toshkent</Select.Item>
        </Select>
      </Field>,
    );
    expect(screen.getByRole('combobox', { name: 'Viloyat' })).toBeDisabled();
  });

  it('className trigger’ga, contentClassName panelga, ref va qo‘shimcha atributlar', async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLButtonElement>();
    render(<Regions ref={ref} className="w-60" contentClassName="panel-x" data-testid="sel" />);
    const trigger = screen.getByRole('combobox');
    expect(ref.current).toBe(trigger);
    expect(trigger).toHaveClass('w-60');
    expect(trigger).toHaveAttribute('data-testid', 'sel');
    await user.click(trigger);
    const listbox = await screen.findByRole('listbox');
    expect(listbox.closest('[data-slot="select-content"]')).toHaveClass('panel-x');
  });

  it('forma: name bilan yashirin native select qiymatni yuboradi', () => {
    const { container } = render(
      <form>
        <Regions name="region" defaultValue="sam" />
      </form>,
    );
    const native = container.querySelector('select[name="region"]') as HTMLSelectElement;
    expect(native).toBeInTheDocument();
    expect(native.value).toBe('sam');
  });
});
