import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Tooltip, TooltipProvider } from './tooltip';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('Tooltip', () => {
  it('klaviatura fokusida chiqadi: role=tooltip, aria-describedby, Esc yopadi', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Nusxa olish">
        <button type="button">Copy</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole('button', { name: 'Copy' });
    await user.tab();
    expect(trigger).toHaveFocus();
    const tip = await screen.findByRole('tooltip');
    expect(tip).toHaveTextContent('Nusxa olish');
    expect(trigger).toHaveAttribute('aria-describedby', tip.id);

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });

  it('dizayn: teskari rang, text-xs, max 240px, tooltip qatlami; default side=top', async () => {
    render(
      <Tooltip content="Matn" defaultOpen>
        <button type="button">T</button>
      </Tooltip>,
    );
    await screen.findByRole('tooltip');
    const content = document.querySelector('[data-slot="tooltip"]')!;
    expect(content).toHaveClass(
      'bg-text',
      'text-background',
      'text-xs',
      'max-w-60',
      'rounded-md',
      'z-(--ak-z-tooltip)',
    );
    expect(content).toHaveAttribute('data-side', 'top');
  });

  it('hover: 300ms kechikish bilan ochiladi', async () => {
    vi.useFakeTimers();
    render(
      <Tooltip content="Ulashish">
        <button type="button">Share</button>
      </Tooltip>,
    );
    fireEvent.pointerMove(screen.getByRole('button', { name: 'Share' }));
    act(() => vi.advanceTimersByTime(200));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(150));
    expect(screen.getByRole('tooltip')).toHaveTextContent('Ulashish');
  });

  it('Provider: qo`shni tooltipga kechikishsiz o`tadi (skip delay)', async () => {
    vi.useFakeTimers();
    render(
      <TooltipProvider>
        <Tooltip content="Birinchi">
          <button type="button">A</button>
        </Tooltip>
        <Tooltip content="Ikkinchi">
          <button type="button">B</button>
        </Tooltip>
      </TooltipProvider>,
    );
    const a = screen.getByRole('button', { name: 'A' });
    fireEvent.pointerMove(a);
    act(() => vi.advanceTimersByTime(350));
    expect(screen.getByRole('tooltip')).toHaveTextContent('Birinchi');

    // Ko'rsatkich trigger'dan chiqib, oraliq zonadan tashqariga ketadi
    fireEvent.pointerLeave(a, { clientX: 0, clientY: 0 });
    fireEvent.pointerMove(document, { clientX: 500, clientY: 500 });
    act(() => vi.advanceTimersByTime(50));
    fireEvent.pointerMove(screen.getByRole('button', { name: 'B' }));
    act(() => vi.advanceTimersByTime(10));
    const texts = screen.getAllByRole('tooltip').map((t) => t.textContent);
    expect(texts).toContain('Ikkinchi');
  });

  it('shortcut → Kbd', async () => {
    render(
      <Tooltip content="Saqlash" shortcut={['Ctrl', 'S']} defaultOpen>
        <button type="button">S</button>
      </Tooltip>,
    );
    await screen.findByRole('tooltip');
    const kbd = document.querySelector('[data-slot="tooltip"] kbd')!;
    expect(kbd).toHaveTextContent('CtrlS');
  });

  it('boshqariladigan rejim', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen((o) => !o)}>
            Almashtirish
          </button>
          <Tooltip content="Boshqariladi" open={open} onOpenChange={setOpen}>
            <span tabIndex={-1}>Nishon</span>
          </Tooltip>
        </>
      );
    }
    render(<Controlled />);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Almashtirish' }));
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Boshqariladi');
  });

  it('disabled yoki bo`sh content — faqat bola chiziladi', () => {
    const { rerender } = render(
      <Tooltip content="X" disabled defaultOpen>
        <button type="button">Bola</button>
      </Tooltip>,
    );
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    rerender(
      <Tooltip content="" defaultOpen>
        <button type="button">Bola</button>
      </Tooltip>,
    );
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bola' })).toBeInTheDocument();
  });

  it('touch qurilmada chiqmaydi', async () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('hover: none'),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }));
    const user = userEvent.setup();
    render(
      <Tooltip content="Yashirin">
        <button type="button">Touch</button>
      </Tooltip>,
    );
    await user.tab();
    expect(screen.getByRole('button', { name: 'Touch' })).toHaveFocus();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});
