import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ContextMenu } from './context-menu';

function Basic({ onEdit = () => {}, onDelete = () => {} }) {
  return (
    <ContextMenu>
      <ContextMenu.Trigger asChild>
        <div data-testid="area">Hisobot.pdf</div>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Label>Fayl</ContextMenu.Label>
        <ContextMenu.Item
          icon={<svg data-testid="edit-icon" />}
          shortcut={['mod', 'E']}
          onSelect={onEdit}
        >
          Tahrirlash
        </ContextMenu.Item>
        <ContextMenu.Item>Nusxa olish</ContextMenu.Item>
        <ContextMenu.Item disabled>Arxivlash</ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item variant="danger" onSelect={onDelete}>
          O‘chirish
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu>
  );
}

function openAt(el: Element) {
  fireEvent.contextMenu(el, { clientX: 40, clientY: 40 });
}

describe('ContextMenu', () => {
  it('o‘ng tugma bilan ochiladi, elementlar chiziladi', async () => {
    render(<Basic />);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    openAt(screen.getByTestId('area'));
    const menu = await screen.findByRole('menu');
    expect(menu).toHaveAttribute('data-state', 'open');
    expect(menu).toHaveAttribute('data-slot', 'context-menu-content');
    expect(screen.getAllByRole('menuitem')).toHaveLength(4);
    expect(screen.getByRole('separator')).toBeInTheDocument();
    expect(screen.getByText('Fayl')).toBeInTheDocument();
  });

  it('klaviatura: ↓ ↑ aylanma, disabled o‘tkaziladi, Enter tanlaydi va yopadi', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<Basic onEdit={onEdit} />);
    openAt(screen.getByTestId('area'));
    await screen.findByRole('menu');
    const items = screen.getAllByRole('menuitem');
    await user.keyboard('{ArrowDown}');
    expect(items[0]).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(items[1]).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(items[3]).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(items[0]).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(items[3]).toHaveFocus();
    await user.keyboard('{Home}');
    expect(items[0]).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onEdit).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });

  it('Esc yopadi', async () => {
    const user = userEvent.setup();
    render(<Basic />);
    openAt(screen.getByTestId('area'));
    await screen.findByRole('menu');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });

  it('sichqoncha bilan tanlash (danger)', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<Basic onDelete={onDelete} />);
    openAt(screen.getByTestId('area'));
    await user.click(await screen.findByRole('menuitem', { name: 'O‘chirish' }));
    expect(onDelete).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });

  it('Item: ikonka, Kbd, aria-keyshortcuts, danger va disabled — DropdownMenu bilan bir xil', async () => {
    render(<Basic />);
    openAt(screen.getByTestId('area'));
    const edit = await screen.findByRole('menuitem', { name: 'Tahrirlash' });
    expect(edit).toHaveAttribute('aria-keyshortcuts', 'Control+E');
    expect(edit.querySelector('kbd')).toHaveTextContent('CtrlE');
    expect(screen.getByTestId('edit-icon').parentElement).toHaveAttribute('aria-hidden', 'true');
    const del = screen.getByRole('menuitem', { name: 'O‘chirish' });
    expect(del).toHaveAttribute('data-variant', 'danger');
    expect(del.className).toContain('text-danger-soft-foreground');
    const archive = screen.getByRole('menuitem', { name: 'Arxivlash' });
    expect(archive).toHaveAttribute('aria-disabled', 'true');
    expect(archive).toHaveAttribute('data-disabled');
  });

  it('Trigger disabled — menyu ochilmaydi', () => {
    render(
      <ContextMenu>
        <ContextMenu.Trigger disabled data-testid="area">
          Hudud
        </ContextMenu.Trigger>
        <ContextMenu.Content>
          <ContextMenu.Item>Bir</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>,
    );
    openAt(screen.getByTestId('area'));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('CheckboxItem, RadioGroup va Sub', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ContextMenu>
        <ContextMenu.Trigger data-testid="area">Hudud</ContextMenu.Trigger>
        <ContextMenu.Content>
          <ContextMenu.CheckboxItem defaultChecked>Panjara</ContextMenu.CheckboxItem>
          <ContextMenu.RadioGroup defaultValue="name" onValueChange={onValueChange}>
            <ContextMenu.RadioItem value="name">Nomi</ContextMenu.RadioItem>
            <ContextMenu.RadioItem value="date">Sana</ContextMenu.RadioItem>
          </ContextMenu.RadioGroup>
          <ContextMenu.Sub>
            <ContextMenu.SubTrigger>Ulashish</ContextMenu.SubTrigger>
            <ContextMenu.SubContent>
              <ContextMenu.Item>Telegram</ContextMenu.Item>
            </ContextMenu.SubContent>
          </ContextMenu.Sub>
        </ContextMenu.Content>
      </ContextMenu>,
    );
    openAt(screen.getByTestId('area'));
    expect(await screen.findByRole('menuitemcheckbox', { name: 'Panjara' })).toBeInTheDocument();
    expect(screen.getByRole('menuitemradio', { name: 'Nomi' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    const sub = screen.getByRole('menuitem', { name: 'Ulashish' });
    expect(sub).toHaveAttribute('aria-haspopup', 'menu');
    sub.focus();
    await user.keyboard('{ArrowRight}');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Telegram' })).toHaveFocus());
    await user.keyboard('{ArrowLeft}');
    await waitFor(() => expect(screen.queryByRole('menuitem', { name: 'Telegram' })).toBeNull());
    await user.click(screen.getByRole('menuitemradio', { name: 'Sana' }));
    expect(onValueChange).toHaveBeenCalledWith('date');
  });

  it('ref va className Content’ga', async () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <ContextMenu>
        <ContextMenu.Trigger data-testid="area">Hudud</ContextMenu.Trigger>
        <ContextMenu.Content ref={ref} className="custom">
          <ContextMenu.Item>Bir</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>,
    );
    openAt(screen.getByTestId('area'));
    const menu = await screen.findByRole('menu');
    expect(ref.current).toBe(menu);
    expect(menu).toHaveClass('custom');
  });
});
