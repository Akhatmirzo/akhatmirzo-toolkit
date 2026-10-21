import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

function Demo(props: { arrow?: boolean; onOpenChange?: (o: boolean) => void }) {
  return (
    <Popover onOpenChange={props.onOpenChange}>
      <Popover.Trigger>Filtr</Popover.Trigger>
      <Popover.Content aria-label="Narx filtri" arrow={props.arrow} className="w-80">
        <input placeholder="dan" />
        <input placeholder="gacha" />
        <Popover.Close>Bekor</Popover.Close>
      </Popover.Content>
    </Popover>
  );
}

describe('Popover', () => {
  it('kompozitsiya qismlari alohida nom bilan ham eksport qilingan', () => {
    expect(Popover.Trigger).toBe(PopoverTrigger);
    expect(Popover.Content).toBe(PopoverContent);
  });

  it('bosish bilan ochiladi: role=dialog, fokus birinchi elementga', async () => {
    const user = userEvent.setup();
    render(<Demo />);
    const trigger = screen.getByRole('button', { name: 'Filtr' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Narx filtri' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(dialog).toHaveAttribute('data-state', 'open');
    expect(dialog).toHaveAttribute('data-side', 'bottom');
    expect(dialog).toHaveClass('rounded-xl', 'shadow-lg', 'p-4', 'w-80', 'z-(--ak-z-dropdown)');
    await waitFor(() => expect(screen.getByPlaceholderText('dan')).toHaveFocus());
  });

  it('Esc yopadi va fokus trigger`ga qaytadi', async () => {
    const user = userEvent.setup();
    render(<Demo />);
    const trigger = screen.getByRole('button', { name: 'Filtr' });
    await user.click(trigger);
    await waitFor(() => expect(screen.getByPlaceholderText('dan')).toHaveFocus());
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('Close tugmasi va tashqariga bosish yopadi', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <>
        <Demo onOpenChange={onOpenChange} />
        <p>Tashqarida</p>
      </>,
    );
    await user.click(screen.getByRole('button', { name: 'Filtr' }));
    await user.click(screen.getByRole('button', { name: 'Bekor' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(onOpenChange).toHaveBeenLastCalledWith(false);

    await user.click(screen.getByRole('button', { name: 'Filtr' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.click(screen.getByText('Tashqarida'));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('klaviatura: Enter bilan ochiladi', async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Filtr' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('boshqariladigan rejim', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [open, setOpen] = useState(true);
      return (
        <>
          <span data-testid="state">{String(open)}</span>
          <Popover open={open} onOpenChange={setOpen}>
            <Popover.Trigger>Ochish</Popover.Trigger>
            <Popover.Content aria-label="Panel">
              <button type="button" onClick={() => setOpen(false)}>
                Qo'llash
              </button>
            </Popover.Content>
          </Popover>
        </>
      );
    }
    render(<Controlled />);
    expect(screen.getByRole('dialog', { name: 'Panel' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: "Qo'llash" }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByTestId('state')).toHaveTextContent('false');
  });

  it('arrow: strelka chiziladi; side/align uzatiladi', async () => {
    render(
      <Popover defaultOpen>
        <Popover.Trigger>X</Popover.Trigger>
        <Popover.Content aria-label="P" side="top" align="start" arrow>
          Matn
        </Popover.Content>
      </Popover>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('data-side', 'top');
    expect(dialog).toHaveAttribute('data-align', 'start');
    expect(dialog.querySelector('svg')).toHaveClass('fill-surface-raised');
    // Strelka bilan scroll ichki elementga o'tadi, panel overflow-visible
    expect(dialog).toHaveClass('overflow-visible');
    expect(dialog).not.toHaveClass('overflow-y-auto');
    const scroller = dialog.querySelector('[data-slot="popover-scroll"]');
    expect(scroller).toHaveClass('overflow-y-auto');
    expect(scroller).toHaveTextContent('Matn');
  });

  it('asChild trigger va ref', async () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <Popover defaultOpen>
        <Popover.Trigger asChild>
          <a href="#f">Havola</a>
        </Popover.Trigger>
        <Popover.Content ref={ref} aria-label="P">
          Matn
        </Popover.Content>
      </Popover>,
    );
    expect(screen.getByText('Havola').tagName).toBe('A');
    expect(ref.current).toBe(screen.getByRole('dialog'));
  });
});
