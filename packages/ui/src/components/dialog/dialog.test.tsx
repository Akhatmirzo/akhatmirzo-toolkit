import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button } from '../button';
import { ConfirmDialog, ConfirmProvider, confirm } from './confirm-dialog';
import { Dialog, DialogFooter, type DialogContentProps } from './dialog';
import { useInModalLayer } from '../../lib/modal-layer';

/** Modal qatlami kontekstini ko'rsatadi (suzuvchi panellar shundan foydalanadi) */
function LayerProbe() {
  return <span data-testid="layer">{String(useInModalLayer())}</span>;
}

function overlay() {
  return document.querySelector('[data-overlay]') as HTMLElement;
}

function EditDialog(props: Partial<DialogContentProps>) {
  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button>Ochish</Button>
      </Dialog.Trigger>
      <Dialog.Content
        title="Profilni tahrirlash"
        description="O'zgarishlar darhol saqlanadi"
        {...props}
      >
        <label>
          Ism
          <input defaultValue="Sarvar" />
        </label>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button>Bekor qilish</Button>
          </Dialog.Close>
          <Button variant="primary">Saqlash</Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}

const originalMatchMedia = window.matchMedia;
afterEach(() => {
  window.matchMedia = originalMatchMedia;
});

function mockMobile(matches: boolean) {
  window.matchMedia = vi.fn((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

describe('Dialog', () => {
  it('trigger bilan ochiladi: role, nom va izoh ulanadi', async () => {
    const user = userEvent.setup();
    render(<EditDialog />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Ochish' }));
    const dialog = screen.getByRole('dialog', { name: 'Profilni tahrirlash' });
    expect(dialog).toHaveAccessibleDescription("O'zgarishlar darhol saqlanadi");
    expect(dialog).toHaveAttribute('data-state', 'open');
    expect(dialog).toHaveAttribute('data-size', 'md');
    expect(dialog).toHaveClass('bg-surface', 'rounded-2xl', 'shadow-xl', 'max-w-130');
    expect(overlay()).toHaveClass('bg-overlay');
  });

  it('dastlabki fokus birinchi input’ga (✕ ga emas)', async () => {
    const user = userEvent.setup();
    render(<EditDialog />);
    await user.click(screen.getByRole('button', { name: 'Ochish' }));
    expect(screen.getByRole('textbox', { name: 'Ism' })).toHaveFocus();
  });

  it('input bo‘lmasa — birinchi tugmaga, ✕ ga emas', async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <Dialog.Trigger>Ochish</Dialog.Trigger>
        <Dialog.Content title="Ma'lumot">
          <DialogFooter>
            <Button>Tushunarli</Button>
          </DialogFooter>
        </Dialog.Content>
      </Dialog>,
    );
    await user.click(screen.getByRole('button', { name: 'Ochish' }));
    expect(screen.getByRole('button', { name: 'Tushunarli' })).toHaveFocus();
  });

  it('Esc yopadi va fokus trigger’ga qaytadi', async () => {
    const user = userEvent.setup();
    render(<EditDialog />);
    const trigger = screen.getByRole('button', { name: 'Ochish' });
    await user.click(trigger);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('✕ tugmasi "Yopish" nomi bilan yopadi; matnni o‘zgartirish mumkin', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<EditDialog />);
    await user.click(screen.getByRole('button', { name: 'Ochish' }));
    await user.click(screen.getByRole('button', { name: 'Yopish' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    unmount();

    render(<EditDialog labels={{ close: 'Close' }} />);
    await user.click(screen.getByRole('button', { name: 'Ochish' }));
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('closeButton={false} — ✕ yo‘q', async () => {
    const user = userEvent.setup();
    render(<EditDialog closeButton={false} />);
    await user.click(screen.getByRole('button', { name: 'Ochish' }));
    expect(screen.queryByRole('button', { name: 'Yopish' })).not.toBeInTheDocument();
  });

  it('Dialog.Close (asChild) yopadi', async () => {
    const user = userEvent.setup();
    render(<EditDialog />);
    await user.click(screen.getByRole('button', { name: 'Ochish' }));
    await user.click(screen.getByRole('button', { name: 'Bekor qilish' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('tashqariga bosish yopadi; dismissible={false} da yopmaydi (Esc ishlaydi)', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<EditDialog />);
    await user.click(screen.getByRole('button', { name: 'Ochish' }));
    await user.click(overlay());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    unmount();

    render(<EditDialog dismissible={false} />);
    await user.click(screen.getByRole('button', { name: 'Ochish' }));
    await user.click(overlay());
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Tab fokusni dialog ichida aylantiradi (focus trap)', async () => {
    const user = userEvent.setup();
    render(<EditDialog />);
    await user.click(screen.getByRole('button', { name: 'Ochish' }));
    const dialog = screen.getByRole('dialog');
    for (let i = 0; i < 6; i++) {
      await user.tab();
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    }
  });

  it('boshqariladigan rejim: open + onOpenChange', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Dialog open onOpenChange={onOpenChange}>
        <Dialog.Content title="Boshqariladigan">matn</Dialog.Content>
      </Dialog>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
    // Ota yopmaguncha ochiq qoladi
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    rerender(
      <Dialog open={false} onOpenChange={onOpenChange}>
        <Dialog.Content title="Boshqariladigan">matn</Dialog.Content>
      </Dialog>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Trigger’siz (boshqariladigan) — yopilgach fokus ochgan tugmaga qaytadi', async () => {
    const user = userEvent.setup();
    function Demo() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Tahrirlash</Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <Dialog.Content title="Tahrir">matn</Dialog.Content>
          </Dialog>
        </>
      );
    }
    render(<Demo />);
    const opener = screen.getByRole('button', { name: 'Tahrirlash' });
    await user.click(opener);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(opener).toHaveFocus());
  });

  it('boshqarilmaydigan: defaultOpen', () => {
    render(
      <Dialog defaultOpen>
        <Dialog.Content title="Darhol ochiq">matn</Dialog.Content>
      </Dialog>,
    );
    expect(screen.getByRole('dialog', { name: 'Darhol ochiq' })).toBeInTheDocument();
  });

  it('hideTitle: sarlavha ko‘rinmas, lekin nom sifatida qoladi; izohsiz aria-describedby yo‘q', () => {
    render(
      <Dialog defaultOpen>
        <Dialog.Content title="Yashirin sarlavha" hideTitle>
          matn
        </Dialog.Content>
      </Dialog>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Yashirin sarlavha' });
    expect(screen.getByText('Yashirin sarlavha')).toHaveClass('sr-only');
    expect(dialog).not.toHaveAttribute('aria-describedby');
  });

  it.each([
    ['sm', 'max-w-100'],
    ['lg', 'max-w-160'],
    ['xl', 'max-w-200'],
    ['full', 'max-w-none'],
  ] as const)('size=%s', (size, cls) => {
    render(
      <Dialog defaultOpen>
        <Dialog.Content title="O'lcham" size={size}>
          matn
        </Dialog.Content>
      </Dialog>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('data-size', size);
    expect(dialog).toHaveClass(cls, 'max-h-[calc(100dvh-32px)]', 'overflow-y-auto');
  });

  it('telefonda pastdan chiqadigan sheet; mobileSheet={false} da oddiy', () => {
    mockMobile(true);
    const { unmount } = render(
      <Dialog defaultOpen>
        <Dialog.Content title="Sheet">matn</Dialog.Content>
      </Dialog>,
    );
    const sheet = screen.getByRole('dialog');
    expect(sheet).toHaveAttribute('data-sheet');
    expect(sheet).toHaveClass(
      'bottom-0',
      'rounded-t-2xl',
      'data-[state=open]:animate-slide-in-bottom',
    );
    unmount();

    render(
      <Dialog defaultOpen>
        <Dialog.Content title="Oddiy" mobileSheet={false}>
          matn
        </Dialog.Content>
      </Dialog>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).not.toHaveAttribute('data-sheet');
    expect(dialog).toHaveClass('rounded-2xl', 'data-[state=open]:animate-dialog-in');
  });

  it('className, ref va qo‘shimcha atributlar Content’ga', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Dialog defaultOpen>
        <Dialog.Content title="Ref" ref={ref} className="custom" data-testid="panel">
          matn
        </Dialog.Content>
      </Dialog>,
    );
    expect(ref.current).toBe(screen.getByRole('dialog'));
    expect(screen.getByTestId('panel')).toHaveClass('custom');
  });
});

describe('Dialog: modal qatlami', () => {
  it('Content ichida modal qatlami konteksti yoqilgan, tashqarida — yo‘q', () => {
    render(
      <>
        <LayerProbe />
        <Dialog defaultOpen>
          <Dialog.Content title="Forma">
            <LayerProbe />
          </Dialog.Content>
        </Dialog>
      </>,
    );
    const [outside, inside] = screen.getAllByTestId('layer');
    expect(outside).toHaveTextContent('false');
    expect(inside).toHaveTextContent('true');
  });
});

describe('ConfirmDialog', () => {
  it('alertdialog; default variantda fokus tasdiqlash tugmasida', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        trigger={<Button>Saqlash</Button>}
        title="Saqlansinmi?"
        description="O'zgarishlar yoziladi."
        confirmText="Saqlash"
        onConfirm={onConfirm}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Saqlash' }));
    const dialog = screen.getByRole('alertdialog', { name: 'Saqlansinmi?' });
    expect(dialog).toHaveAccessibleDescription("O'zgarishlar yoziladi.");
    const ok = screen.getAllByRole('button', { name: 'Saqlash' }).at(-1)!;
    expect(ok).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('danger: fokus "Bekor qilish" da, onCancel chaqiriladi', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        defaultOpen
        variant="danger"
        title="Buyurtma o'chirilsinmi?"
        confirmText="O'chirish"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );
    await waitFor(() => expect(screen.getByRole('button', { name: 'Bekor qilish' })).toHaveFocus());
    expect(screen.getByRole('button', { name: "O'chirish" })).toHaveAttribute(
      'data-variant',
      'danger',
    );
    await user.keyboard('{Enter}');
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('async onConfirm: loading, javobgacha yopilmaydi (Esc ham)', async () => {
    const user = userEvent.setup();
    let resolve!: () => void;
    const onConfirm = vi.fn(() => new Promise<void>((r) => (resolve = r)));
    render(<ConfirmDialog defaultOpen title="Yuborilsinmi?" onConfirm={onConfirm} />);

    const ok = screen.getByRole('button', { name: /Tasdiqlash/ });
    await user.click(ok);
    expect(ok).toHaveAttribute('data-loading');
    expect(screen.getByRole('button', { name: 'Bekor qilish' })).toBeDisabled();
    await user.keyboard('{Escape}');
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();

    await act(async () => resolve());
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('sinxron onConfirm xato bersa — ochiq qoladi, xato tashqariga chiqmaydi', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn(() => {
      throw new Error('xato');
    });
    render(<ConfirmDialog defaultOpen title="Yuborilsinmi?" onConfirm={onConfirm} />);
    await user.click(screen.getByRole('button', { name: /Tasdiqlash/ }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('ref va qo‘shimcha prop’lar panelga uzatiladi', () => {
    const ref = createRef<HTMLDivElement>();
    const onEscapeKeyDown = vi.fn();
    render(
      <ConfirmDialog
        defaultOpen
        title="Yuborilsinmi?"
        ref={ref}
        className="custom"
        data-testid="confirm"
        aria-label="Tasdiqlash oynasi"
        onEscapeKeyDown={onEscapeKeyDown}
      />,
    );
    const panel = screen.getByRole('alertdialog');
    expect(ref.current).toBe(panel);
    expect(panel).toHaveClass('custom');
    expect(panel).toHaveAttribute('data-testid', 'confirm');
    expect(panel).toHaveAttribute('aria-label', 'Tasdiqlash oynasi');
  });

  it('async onConfirm xato bersa — ochiq qoladi', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn(() => Promise.reject(new Error('tarmoq')));
    render(<ConfirmDialog defaultOpen title="Yuborilsinmi?" onConfirm={onConfirm} />);
    const ok = screen.getByRole('button', { name: /Tasdiqlash/ });
    await user.click(ok);
    await waitFor(() => expect(ok).not.toHaveAttribute('data-loading'));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('boshqariladigan rejim', async () => {
    const user = userEvent.setup();
    function Demo() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Ochish</Button>
          <span data-testid="state">{String(open)}</span>
          <ConfirmDialog open={open} onOpenChange={setOpen} title="Davom etilsinmi?" />
        </>
      );
    }
    render(<Demo />);
    await user.click(screen.getByRole('button', { name: 'Ochish' }));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Bekor qilish' }));
    expect(screen.getByTestId('state')).toHaveTextContent('false');
  });
});

describe('confirm()', () => {
  it('ConfirmProvider bo‘lmasa — rad etadi', async () => {
    await expect(confirm({ title: 'Savol' })).rejects.toThrow(/ConfirmProvider/);
  });

  it('tasdiqlansa true, bekor qilinsa false', async () => {
    const user = userEvent.setup();
    render(<ConfirmProvider />);

    let answer!: Promise<boolean>;
    act(() => {
      answer = confirm({ title: 'Saqlansinmi?', confirmText: 'Ha' });
    });
    expect(await screen.findByRole('alertdialog', { name: 'Saqlansinmi?' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Ha' }));
    await expect(answer).resolves.toBe(true);

    act(() => {
      answer = confirm({
        title: "O'chirilsinmi?",
        variant: 'danger',
        cancelText: "Yo'q",
      });
    });
    const cancel = await screen.findByRole('button', { name: "Yo'q" });
    await waitFor(() => expect(cancel).toHaveFocus());
    await user.keyboard('{Escape}');
    await expect(answer).resolves.toBe(false);
  });

  it('yopilgach fokus confirm() ni chaqirgan tugmaga qaytadi', async () => {
    const user = userEvent.setup();
    render(
      <>
        <ConfirmProvider />
        <Button onClick={() => void confirm({ title: 'Davom etilsinmi?' })}>Davom</Button>
      </>,
    );
    const opener = screen.getByRole('button', { name: 'Davom' });
    await user.click(opener);
    await user.click(await screen.findByRole('button', { name: 'Bekor qilish' }));
    await waitFor(() => expect(opener).toHaveFocus());
  });

  it('labels provider orqali; async onConfirm tugagach true', async () => {
    const user = userEvent.setup();
    render(<ConfirmProvider labels={{ confirm: 'OK', cancel: 'Cancel' }} />);
    let resolve!: () => void;
    let answer!: Promise<boolean>;
    act(() => {
      answer = confirm({
        title: 'Yuborish',
        onConfirm: () => new Promise<void>((r) => (resolve = r)),
      });
    });
    const ok = await screen.findByRole('button', { name: /OK/ });
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    await user.click(ok);
    expect(ok).toHaveAttribute('data-loading');
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    await act(async () => resolve());
    await expect(answer).resolves.toBe(true);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('host olib tashlansa kutilayotgan so‘rovlar false bilan yopiladi', async () => {
    const { unmount } = render(<ConfirmProvider />);
    let answer!: Promise<boolean>;
    act(() => {
      answer = confirm({ title: 'Kutilmoqda' });
    });
    unmount();
    await expect(answer).resolves.toBe(false);
  });
});
