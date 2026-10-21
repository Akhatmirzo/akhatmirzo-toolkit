import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Toaster, toast } from './index';
import { resetToasts } from './toast-store';

/** Toast elementi (Radix e'lon matnini emas, `<li>` ni topadi) */
const toastEl = (text: string) => screen.getByText(text).closest('li')!;
const queryToast = (text: string) =>
  screen.queryAllByText(text).find((el) => el.closest('li')) ?? null;

describe('Toast', () => {
  beforeEach(() => resetToasts());
  afterEach(() => {
    act(() => resetToasts());
    vi.useRealTimers();
  });

  it('toast() — hudud va status roli bilan chiqadi', () => {
    render(<Toaster />);
    act(() => {
      toast('Havola nusxalandi');
    });
    expect(screen.getByRole('region', { name: 'Bildirishnomalar (F8)' })).toBeInTheDocument();
    const el = toastEl('Havola nusxalandi');
    expect(el).toHaveAttribute('role', 'status');
    expect(el).toHaveAttribute('data-type', 'default');
    expect(el).toHaveAttribute('data-state', 'open');
  });

  it('error — role="alert", success — rangli ikonka', () => {
    render(<Toaster />);
    act(() => {
      toast.error('Ulanib bo‘lmadi');
      toast.success('Saqlandi');
    });
    expect(toastEl('Ulanib bo‘lmadi')).toHaveAttribute('role', 'alert');
    const success = toastEl('Saqlandi');
    expect(success).toHaveAttribute('role', 'status');
    expect(success.querySelector('svg')).toHaveClass('text-success');
  });

  it('description va action: bosilganda onClick chaqiriladi va toast yopiladi', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onDismiss = vi.fn();
    render(<Toaster />);
    act(() => {
      toast.success('Buyurtma yaratildi', {
        description: '#1042',
        action: { label: 'Ko‘rish', onClick },
        onDismiss,
      });
    });
    expect(toastEl('Buyurtma yaratildi')).toHaveTextContent('#1042');
    await user.click(screen.getByRole('button', { name: 'Ko‘rish' }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledWith(expect.any(String));
    expect(queryToast('Buyurtma yaratildi')).toBeNull();
  });

  it('action’da preventDefault — toast ochiq qoladi', async () => {
    const user = userEvent.setup();
    render(<Toaster />);
    act(() => {
      toast('Fayl o‘chirildi', {
        action: { label: 'Qaytarish', onClick: (e) => e.preventDefault() },
      });
    });
    await user.click(screen.getByRole('button', { name: 'Qaytarish' }));
    expect(queryToast('Fayl o‘chirildi')).not.toBeNull();
  });

  it('{ id } bilan o‘sha toast yangilanadi (loading → success)', () => {
    render(<Toaster />);
    let id: string | number = '';
    act(() => {
      id = toast.loading('Yuklanmoqda...');
    });
    const before = toastEl('Yuklanmoqda...');
    expect(before).toHaveAttribute('data-type', 'loading');
    act(() => {
      toast.success('Yuklandi', { id });
    });
    const after = toastEl('Yuklandi');
    expect(after).toBe(before);
    expect(after).toHaveAttribute('data-type', 'success');
    expect(queryToast('Yuklanmoqda...')).toBeNull();
    expect(after.parentElement!.children).toHaveLength(1);
  });

  it('toast.dismiss(id) bittasini, toast.dismiss() hammasini yopadi', () => {
    render(<Toaster />);
    let first: string | number = '';
    act(() => {
      first = toast('Birinchi');
      toast('Ikkinchi');
      toast('Uchinchi');
    });
    act(() => toast.dismiss(first));
    expect(queryToast('Birinchi')).toBeNull();
    expect(queryToast('Ikkinchi')).not.toBeNull();
    act(() => toast.dismiss());
    expect(queryToast('Ikkinchi')).toBeNull();
    expect(queryToast('Uchinchi')).toBeNull();
  });

  it('davomiylik: default 4000, error 6000, loading — cheksiz', () => {
    vi.useFakeTimers();
    render(<Toaster />);
    act(() => {
      toast('Oddiy');
      toast.error('Xato');
      toast.loading('Kutilmoqda');
    });
    act(() => vi.advanceTimersByTime(3900));
    expect(queryToast('Oddiy')).not.toBeNull();
    act(() => vi.advanceTimersByTime(200));
    expect(queryToast('Oddiy')).toBeNull();
    expect(queryToast('Xato')).not.toBeNull();
    act(() => vi.advanceTimersByTime(2000));
    expect(queryToast('Xato')).toBeNull();
    act(() => vi.advanceTimersByTime(60_000));
    expect(queryToast('Kutilmoqda')).not.toBeNull();
  });

  it('hover’da taymer to‘xtaydi va dasta yoyiladi', () => {
    vi.useFakeTimers();
    render(<Toaster />);
    act(() => {
      toast('Saqlandi');
    });
    const viewport = toastEl('Saqlandi').parentElement!;
    fireEvent.pointerEnter(viewport);
    expect(viewport).toHaveAttribute('data-expanded');
    fireEvent.pointerMove(screen.getByRole('region'));
    act(() => vi.advanceTimersByTime(10_000));
    expect(queryToast('Saqlandi')).not.toBeNull();

    fireEvent.pointerLeave(screen.getByRole('region'));
    fireEvent.pointerLeave(viewport);
    expect(viewport).not.toHaveAttribute('data-expanded');
    act(() => vi.advanceTimersByTime(4100));
    expect(queryToast('Saqlandi')).toBeNull();
  });

  it('ko‘pi bilan 3 tasi ko‘rinadi, eskisi yashiriladi', () => {
    render(<Toaster />);
    act(() => {
      ['1-xabar', '2-xabar', '3-xabar', '4-xabar'].forEach((t) => toast(t));
    });
    expect(toastEl('4-xabar')).toHaveAttribute('data-front');
    expect(toastEl('4-xabar')).toHaveAttribute('data-index', '0');
    expect(toastEl('2-xabar')).not.toHaveAttribute('data-hidden');
    const oldest = toastEl('1-xabar');
    expect(oldest).toHaveAttribute('data-hidden');
    expect(oldest).toHaveAttribute('inert');
  });

  it('toast.promise: loading → success / error', async () => {
    render(<Toaster />);
    let resolve!: (v: number) => void;
    const ok = new Promise<number>((r) => (resolve = r));
    act(() => {
      void toast.promise(ok, {
        loading: 'Saqlanmoqda',
        success: (n) => `${n} ta saqlandi`,
        error: 'Xatolik',
      });
    });
    expect(toastEl('Saqlanmoqda')).toHaveAttribute('data-type', 'loading');
    await act(async () => resolve(3));
    expect(toastEl('3 ta saqlandi')).toHaveAttribute('data-type', 'success');

    const failing = Promise.reject(new Error('tarmoq'));
    await act(async () => {
      await toast
        .promise(failing, {
          loading: 'Yuborilmoqda',
          success: 'Yuborildi',
          error: (e) => `Xatolik: ${(e as Error).message}`,
        })
        .catch(() => {});
    });
    expect(toastEl('Xatolik: tarmoq')).toHaveAttribute('role', 'alert');
  });

  it('closeButton va labels: ✕ bosilganda yopiladi', async () => {
    const user = userEvent.setup();
    render(<Toaster closeButton labels={{ close: 'Berkitish', region: 'Xabarlar ({hotkey})' }} />);
    act(() => {
      toast.info('Yangilanish mavjud');
    });
    expect(screen.getByRole('region', { name: 'Xabarlar (F8)' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Berkitish' }));
    expect(queryToast('Yangilanish mavjud')).toBeNull();
  });

  it('F8 hududga fokus beradi, Esc fokusdagi toastni yopadi', async () => {
    const user = userEvent.setup();
    render(<Toaster />);
    act(() => {
      toast.warning('Diqqat');
    });
    const viewport = toastEl('Diqqat').parentElement!;
    fireEvent.keyDown(document, { key: 'F8', code: 'F8' });
    expect(viewport).toHaveFocus();
    expect(viewport).toHaveAttribute('data-expanded');
    await user.tab();
    expect(toastEl('Diqqat')).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(queryToast('Diqqat')).toBeNull();
  });

  it('position va className viewport’ga qo‘llanadi', () => {
    render(<Toaster position="top-center" className="custom" />);
    act(() => {
      toast('Yuqorida');
    });
    const viewport = toastEl('Yuqorida').parentElement!;
    expect(viewport).toHaveAttribute('data-position', 'top-center');
    expect(viewport).toHaveClass('top-4', 'custom');
    expect(toastEl('Yuqorida')).toHaveClass('top-0');
  });
});
