import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DropdownMenu, DropdownMenuItem } from './dropdown-menu';

function Basic({ onEdit = () => {}, onDelete = () => {} }) {
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger>Amallar</DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        <DropdownMenu.Label>Buyurtma</DropdownMenu.Label>
        <DropdownMenu.Item
          icon={<svg data-testid="edit-icon" />}
          shortcut={['mod', 'E']}
          onSelect={onEdit}
        >
          Tahrirlash
        </DropdownMenu.Item>
        <DropdownMenu.Item>Nusxa olish</DropdownMenu.Item>
        <DropdownMenu.Item disabled>Arxivlash</DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item variant="danger" onSelect={onDelete}>
          O‘chirish
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}

describe('DropdownMenu', () => {
  it('trigger ARIA atributlari va bosilganda ochilishi', async () => {
    const user = userEvent.setup();
    render(<Basic />);
    const trigger = screen.getByRole('button', { name: 'Amallar' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    await user.click(trigger);
    const menu = screen.getByRole('menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(menu).toHaveAttribute('data-state', 'open');
    expect(screen.getAllByRole('menuitem')).toHaveLength(4);
    expect(screen.getByRole('separator')).toBeInTheDocument();
    expect(screen.getByText('Buyurtma')).toBeInTheDocument();
  });

  it('Enter bilan ochiladi, birinchi faol elementga fokus; ↓ ↑ aylanma yuradi', async () => {
    const user = userEvent.setup();
    render(<Basic />);
    await user.tab();
    await user.keyboard('{Enter}');
    const items = screen.getAllByRole('menuitem');
    await waitFor(() => expect(items[0]).toHaveFocus());

    await user.keyboard('{ArrowDown}');
    expect(items[1]).toHaveFocus();
    // disabled element o'tkazib yuboriladi
    await user.keyboard('{ArrowDown}');
    expect(items[3]).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(items[0]).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(items[3]).toHaveFocus();
    await user.keyboard('{Home}');
    expect(items[0]).toHaveFocus();
    await user.keyboard('{End}');
    expect(items[3]).toHaveFocus();
  });

  it('typeahead: harf bosilganda shu harfli elementga sakraydi', async () => {
    const user = userEvent.setup();
    render(<Basic />);
    await user.click(screen.getByRole('button', { name: 'Amallar' }));
    await user.keyboard('n');
    expect(screen.getByRole('menuitem', { name: 'Nusxa olish' })).toHaveFocus();
  });

  it('Enter bilan tanlaydi, onSelect chaqiriladi va menyu yopiladi; fokus trigger’ga qaytadi', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<Basic onEdit={onEdit} />);
    const trigger = screen.getByRole('button', { name: 'Amallar' });
    trigger.focus();
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Tahrirlash' })).toHaveFocus());
    await user.keyboard('{Enter}');
    expect(onEdit).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('sichqoncha bilan tanlash', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<Basic onDelete={onDelete} />);
    await user.click(screen.getByRole('button', { name: 'Amallar' }));
    await user.click(screen.getByRole('menuitem', { name: 'O‘chirish' }));
    expect(onDelete).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });

  it('Esc yopadi va fokusni trigger’ga qaytaradi', async () => {
    const user = userEvent.setup();
    render(<Basic />);
    const trigger = screen.getByRole('button', { name: 'Amallar' });
    await user.click(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('Item: ikonka, Kbd yorlig‘i, aria-keyshortcuts, danger va disabled', async () => {
    const user = userEvent.setup();
    render(<Basic />);
    await user.click(screen.getByRole('button', { name: 'Amallar' }));
    const edit = screen.getByRole('menuitem', { name: 'Tahrirlash' });
    expect(edit).toHaveAttribute('aria-keyshortcuts', 'Control+E');
    expect(edit.querySelector('kbd')).toHaveTextContent('CtrlE');
    expect(screen.getByTestId('edit-icon').parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('menuitem', { name: 'O‘chirish' })).toHaveAttribute(
      'data-variant',
      'danger',
    );
    const archive = screen.getByRole('menuitem', { name: 'Arxivlash' });
    expect(archive).toHaveAttribute('aria-disabled', 'true');
    expect(archive).toHaveAttribute('data-disabled');
  });

  it('boshqariladigan rejim: open + onOpenChange', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    function Demo() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <span data-testid="state">{open ? 'ochiq' : 'yopiq'}</span>
          <DropdownMenu
            open={open}
            onOpenChange={(o) => {
              onOpenChange(o);
              setOpen(o);
            }}
          >
            <DropdownMenu.Trigger>Menyu</DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item>Bir</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu>
        </>
      );
    }
    render(<Demo />);
    await user.click(screen.getByRole('button', { name: 'Menyu' }));
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(screen.getByTestId('state')).toHaveTextContent('ochiq');
    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByTestId('state')).toHaveTextContent('yopiq');
  });

  it('boshqariladigan rejimda open={true} — ochiq turadi', () => {
    render(
      <DropdownMenu open>
        <DropdownMenu.Trigger>Menyu</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item>Bir</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>,
    );
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('CheckboxItem: menuitemcheckbox, aria-checked almashadi', async () => {
    const user = userEvent.setup();
    function Demo() {
      const [shown, setShown] = useState(true);
      return (
        <DropdownMenu>
          <DropdownMenu.Trigger>Ustunlar</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.CheckboxItem checked={shown} onCheckedChange={setShown}>
              Narx
            </DropdownMenu.CheckboxItem>
          </DropdownMenu.Content>
        </DropdownMenu>
      );
    }
    render(<Demo />);
    await user.click(screen.getByRole('button', { name: 'Ustunlar' }));
    const item = screen.getByRole('menuitemcheckbox', { name: 'Narx' });
    expect(item).toHaveAttribute('aria-checked', 'true');
    await user.click(item);
    await user.click(screen.getByRole('button', { name: 'Ustunlar' }));
    expect(screen.getByRole('menuitemcheckbox', { name: 'Narx' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });

  it('RadioGroup + RadioItem: bittasi tanlanadi', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DropdownMenu>
        <DropdownMenu.Trigger>Saralash</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.RadioGroup defaultValue="new" onValueChange={onValueChange}>
            <DropdownMenu.RadioItem value="new">Yangilari</DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value="cheap">Arzonlari</DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu>,
    );
    await user.click(screen.getByRole('button', { name: 'Saralash' }));
    expect(screen.getByRole('menuitemradio', { name: 'Yangilari' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await user.click(screen.getByRole('menuitemradio', { name: 'Arzonlari' }));
    expect(onValueChange).toHaveBeenCalledWith('cheap');
  });

  it('Sub: → ochadi, ← yopadi', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenu.Trigger>Fayl</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item>Ochish</DropdownMenu.Item>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>Eksport</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              <DropdownMenu.Item>PDF</DropdownMenu.Item>
              <DropdownMenu.Item>Excel</DropdownMenu.Item>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
        </DropdownMenu.Content>
      </DropdownMenu>,
    );
    screen.getByRole('button', { name: 'Fayl' }).focus();
    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Ochish' })).toHaveFocus());
    await user.keyboard('{ArrowDown}');
    const subTrigger = screen.getByRole('menuitem', { name: 'Eksport' });
    expect(subTrigger).toHaveFocus();
    expect(subTrigger).toHaveAttribute('aria-haspopup', 'menu');

    await user.keyboard('{ArrowRight}');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'PDF' })).toHaveFocus());
    expect(screen.getAllByRole('menu')).toHaveLength(2);

    await user.keyboard('{ArrowLeft}');
    await waitFor(() => expect(screen.queryByRole('menuitem', { name: 'PDF' })).toBeNull());
    expect(subTrigger).toHaveFocus();
  });

  it('asChild trigger, asChild item (havola) va ref', async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLDivElement>();
    render(
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <button type="button" aria-label="Ko‘proq" className="mine" />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content ref={ref} className="custom">
          <DropdownMenuItem asChild icon={<svg />}>
            <a href="/profil">Profil</a>
          </DropdownMenuItem>
        </DropdownMenu.Content>
      </DropdownMenu>,
    );
    const trigger = screen.getByRole('button', { name: 'Ko‘proq' });
    expect(trigger).toHaveClass('mine');
    expect(trigger).not.toHaveClass('rounded-lg');
    await user.click(trigger);
    const link = screen.getByRole('menuitem', { name: 'Profil' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/profil');
    expect(link.querySelector('svg')).toBeInTheDocument();
    expect(ref.current).toBe(screen.getByRole('menu'));
    expect(ref.current).toHaveClass('custom');
  });
});
