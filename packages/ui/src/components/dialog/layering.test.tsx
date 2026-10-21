import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { DropdownMenu } from '../dropdown-menu';
import { Popover } from '../popover';
import { Select } from '../select';
import { Dialog } from './dialog';

// Modal ichidagi suzuvchi panellar modal ortida qolmasligi kerak (z-modal), tashqarida — z-dropdown
describe('Overlay qatlamlari', () => {
  it('Dialog ichidagi Select paneli modal qatlamida ochiladi', async () => {
    const user = userEvent.setup();
    render(
      <Dialog defaultOpen>
        <Dialog.Content title="Manzil">
          <Select aria-label="Viloyat" placeholder="Tanlang">
            <Select.Item value="tsh">Toshkent</Select.Item>
          </Select>
        </Dialog.Content>
      </Dialog>,
    );
    await user.click(screen.getByRole('combobox', { name: 'Viloyat' }));
    expect(await screen.findByRole('listbox')).toHaveClass('z-(--ak-z-modal)');
  });

  it('Dialog ichidagi DropdownMenu va Popover ham modal qatlamida', async () => {
    const user = userEvent.setup();
    render(
      <Dialog defaultOpen>
        <Dialog.Content title="Amallar">
          <DropdownMenu>
            <DropdownMenu.Trigger>Menyu</DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item>Tahrirlash</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu>
          <Popover>
            <Popover.Trigger>Filtr</Popover.Trigger>
            <Popover.Content aria-label="Filtr">Narx</Popover.Content>
          </Popover>
        </Dialog.Content>
      </Dialog>,
    );
    await user.click(screen.getByRole('button', { name: 'Menyu' }));
    expect(await screen.findByRole('menu')).toHaveClass('z-(--ak-z-modal)');
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Filtr' }));
    expect(await screen.findByText('Narx')).toHaveClass('z-(--ak-z-modal)');
  });

  it("Dialog'dan tashqarida panel oddiy dropdown qatlamida qoladi", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenu.Trigger>Menyu</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item>Tahrirlash</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>,
    );
    await user.click(screen.getByRole('button', { name: 'Menyu' }));
    const menu = await screen.findByRole('menu');
    expect(menu).toHaveClass('z-(--ak-z-dropdown)');
    expect(menu).not.toHaveClass('z-(--ak-z-modal)');
  });
});
