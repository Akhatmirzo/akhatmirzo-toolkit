import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../button';
import { useInModalLayer } from '../../lib/modal-layer';
import { Drawer, type DrawerContentProps } from './drawer';

function overlay() {
  return document.querySelector('[data-overlay]') as HTMLElement;
}

function FilterDrawer(props: Partial<DrawerContentProps>) {
  return (
    <Drawer>
      <Drawer.Trigger asChild>
        <Button>Filtrlar</Button>
      </Drawer.Trigger>
      <Drawer.Content title="Filtrlar" description="Natijalarni toraytiring" {...props}>
        <label>
          Narxdan
          <input placeholder="0 so'm" />
        </label>
        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button>Tozalash</Button>
          </Drawer.Close>
          <Button variant="primary">Qo'llash</Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
}

describe('Drawer', () => {
  it('trigger bilan ochiladi: dialog roli, nom, izoh; default right / md', async () => {
    const user = userEvent.setup();
    render(<FilterDrawer />);
    await user.click(screen.getByRole('button', { name: 'Filtrlar' }));
    const drawer = screen.getByRole('dialog', { name: 'Filtrlar' });
    expect(drawer).toHaveAccessibleDescription('Natijalarni toraytiring');
    expect(drawer).toHaveAttribute('data-side', 'right');
    expect(drawer).toHaveAttribute('data-size', 'md');
    expect(drawer).toHaveClass(
      'right-0',
      'h-dvh',
      'w-[min(420px,100vw)]',
      'bg-surface',
      'shadow-xl',
      'data-[state=open]:animate-slide-in-right',
    );
    expect(overlay()).toHaveClass('bg-overlay');
  });

  it('dastlabki fokus birinchi input’ga; Esc yopadi va fokus trigger’ga qaytadi', async () => {
    const user = userEvent.setup();
    render(<FilterDrawer />);
    const trigger = screen.getByRole('button', { name: 'Filtrlar' });
    await user.click(trigger);
    expect(screen.getByRole('textbox', { name: 'Narxdan' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('✕ va Drawer.Close yopadi', async () => {
    const user = userEvent.setup();
    render(<FilterDrawer />);
    await user.click(screen.getByRole('button', { name: 'Filtrlar' }));
    await user.click(screen.getByRole('button', { name: 'Yopish' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Filtrlar' }));
    await user.click(screen.getByRole('button', { name: 'Tozalash' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('tashqariga bosish yopadi; dismissible={false} da yopmaydi', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<FilterDrawer />);
    await user.click(screen.getByRole('button', { name: 'Filtrlar' }));
    await user.click(overlay());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    unmount();

    render(<FilterDrawer dismissible={false} />);
    await user.click(screen.getByRole('button', { name: 'Filtrlar' }));
    await user.click(overlay());
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('Tab fokusni panel ichida ushlab turadi', async () => {
    const user = userEvent.setup();
    render(<FilterDrawer />);
    await user.click(screen.getByRole('button', { name: 'Filtrlar' }));
    const drawer = screen.getByRole('dialog');
    for (let i = 0; i < 5; i++) {
      await user.tab();
      expect(drawer).toContainElement(document.activeElement as HTMLElement);
    }
  });

  it.each([
    ['right', 'right-0', 'data-[state=closed]:animate-slide-out-right'],
    ['left', 'left-0', 'data-[state=open]:animate-slide-in-left'],
    ['top', 'top-0', 'rounded-b-2xl'],
    ['bottom', 'bottom-0', 'rounded-t-2xl'],
  ] as const)('side=%s', (side, ...classes) => {
    render(
      <Drawer defaultOpen>
        <Drawer.Content title="Panel" side={side}>
          matn
        </Drawer.Content>
      </Drawer>,
    );
    const drawer = screen.getByRole('dialog');
    expect(drawer).toHaveAttribute('data-side', side);
    expect(drawer).toHaveClass(...classes);
    const handle = drawer.querySelector('[data-drawer-handle]');
    if (side === 'bottom') expect(handle).toHaveAttribute('aria-hidden', 'true');
    else expect(handle).toBeNull();
  });

  it.each([
    ['sm', 'right', 'w-[min(320px,100vw)]'],
    ['lg', 'left', 'w-[min(560px,100vw)]'],
    ['sm', 'bottom', 'h-[min(320px,calc(100dvh-32px))]'],
    ['lg', 'top', 'h-[min(560px,calc(100dvh-32px))]'],
  ] as const)('size=%s side=%s', (size, side, cls) => {
    render(
      <Drawer defaultOpen>
        <Drawer.Content title="Panel" side={side} size={size}>
          matn
        </Drawer.Content>
      </Drawer>,
    );
    expect(screen.getByRole('dialog')).toHaveClass(cls);
  });

  it('boshqariladigan rejim: open + onOpenChange', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Drawer open onOpenChange={onOpenChange}>
        <Drawer.Content title="Menyu">matn</Drawer.Content>
      </Drawer>,
    );
    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('hideTitle, labels, className va ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Drawer defaultOpen>
        <Drawer.Content
          title="Mobil menyu"
          hideTitle
          labels={{ close: 'Menyuni yopish' }}
          className="custom"
          ref={ref}
        >
          matn
        </Drawer.Content>
      </Drawer>,
    );
    const drawer = screen.getByRole('dialog', { name: 'Mobil menyu' });
    expect(ref.current).toBe(drawer);
    expect(drawer).toHaveClass('custom');
    expect(screen.getByText('Mobil menyu')).toHaveClass('sr-only');
    expect(screen.getByRole('button', { name: 'Menyuni yopish' })).toBeInTheDocument();
  });

  it('Content ichida modal qatlami konteksti yoqilgan', () => {
    function Probe() {
      return <span data-testid="layer">{String(useInModalLayer())}</span>;
    }
    render(
      <Drawer defaultOpen>
        <Drawer.Content title="Filtrlar">
          <Probe />
        </Drawer.Content>
      </Drawer>,
    );
    expect(screen.getByTestId('layer')).toHaveTextContent('true');
  });
});
