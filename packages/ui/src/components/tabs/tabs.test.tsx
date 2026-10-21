import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Tabs, TabsContent, TabsList, TabsTrigger, type TabsProps } from './index';

function Demo(props: Partial<TabsProps>) {
  return (
    <Tabs defaultValue="info" {...props}>
      <Tabs.List aria-label="Buyurtma bo‘limlari">
        <Tabs.Trigger value="info">Ma’lumot</Tabs.Trigger>
        <Tabs.Trigger value="orders" badge={12}>
          Buyurtmalar
        </Tabs.Trigger>
        <Tabs.Trigger value="reviews">Sharhlar</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="info">Ma’lumot paneli</Tabs.Content>
      <Tabs.Content value="orders">Buyurtmalar paneli</Tabs.Content>
      <Tabs.Content value="reviews">Sharhlar paneli</Tabs.Content>
    </Tabs>
  );
}

describe('Tabs', () => {
  afterEach(() => vi.restoreAllMocks());

  it('tablist, tab va tabpanel rollari bilan render qilinadi', () => {
    render(<Demo />);
    expect(screen.getByRole('tablist', { name: 'Buyurtma bo‘limlari' })).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
    const active = screen.getByRole('tab', { name: 'Ma’lumot' });
    expect(active).toHaveAttribute('aria-selected', 'true');
    expect(active).toHaveAttribute('data-state', 'active');
    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveTextContent('Ma’lumot paneli');
    expect(panel).toHaveAttribute('aria-labelledby', active.id);
  });

  it('bosilganda boshqa tab ochiladi', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Demo onValueChange={onValueChange} />);
    await user.click(screen.getByRole('tab', { name: /Buyurtmalar/ }));
    expect(onValueChange).toHaveBeenCalledWith('orders');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Buyurtmalar paneli');
    expect(screen.getByRole('tab', { name: 'Ma’lumot' })).toHaveAttribute('aria-selected', 'false');
  });

  it('badge trigger ichida ko‘rinadi', () => {
    render(<Demo />);
    const tab = screen.getByRole('tab', { name: /Buyurtmalar/ });
    expect(tab).toHaveTextContent('12');
    expect(tab.querySelector('[data-tabs-badge]')).toHaveTextContent('12');
  });

  it('← → strelkalar, Home / End — fokus bilan darhol faollashadi', async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.tab();
    expect(screen.getByRole('tab', { name: 'Ma’lumot' })).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    const orders = screen.getByRole('tab', { name: /Buyurtmalar/ });
    expect(orders).toHaveFocus();
    expect(orders).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Buyurtmalar paneli');

    await user.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Sharhlar' })).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Ma’lumot' })).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'Sharhlar' })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('tab', { name: 'Ma’lumot' })).toHaveAttribute('aria-selected', 'true');
  });

  it('Tab tugmasi tablist’dan panelga o‘tadi', async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.tab();
    await user.tab();
    expect(screen.getByRole('tabpanel')).toHaveFocus();
  });

  it('vertikal yo‘nalishda ↑ ↓ ishlaydi', async () => {
    const user = userEvent.setup();
    render(<Demo orientation="vertical" />);
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
    await user.tab();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('tab', { name: /Buyurtmalar/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('tab', { name: 'Ma’lumot' })).toHaveAttribute('aria-selected', 'true');
  });

  it('boshqariladigan rejim: prop o‘zgarmaguncha tab almashmaydi', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(<Demo value="info" onValueChange={onValueChange} />);
    await user.click(screen.getByRole('tab', { name: 'Sharhlar' }));
    expect(onValueChange).toHaveBeenCalledWith('reviews');
    expect(screen.getByRole('tab', { name: 'Ma’lumot' })).toHaveAttribute('aria-selected', 'true');
    rerender(<Demo value="reviews" onValueChange={onValueChange} />);
    expect(screen.getByRole('tab', { name: 'Sharhlar' })).toHaveAttribute('aria-selected', 'true');
  });

  it('useState bilan boshqariladi', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [tab, setTab] = useState('info');
      return (
        <>
          <Demo value={tab} onValueChange={setTab} />
          <output>{tab}</output>
        </>
      );
    }
    render(<Controlled />);
    await user.click(screen.getByRole('tab', { name: 'Sharhlar' }));
    expect(screen.getByRole('status')).toHaveTextContent('reviews');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Sharhlar paneli');
  });

  it('disabled tab tanlanmaydi va klaviaturada o‘tkazib yuboriladi', async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b" disabled>
            B
          </TabsTrigger>
          <TabsTrigger value="c">C</TabsTrigger>
        </TabsList>
        <TabsContent value="a">A panel</TabsContent>
        <TabsContent value="c">C panel</TabsContent>
      </Tabs>,
    );
    const b = screen.getByRole('tab', { name: 'B' });
    expect(b).toBeDisabled();
    await user.click(b);
    expect(b).toHaveAttribute('aria-selected', 'false');
    await user.click(screen.getByRole('tab', { name: 'A' }));
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'C' })).toHaveFocus();
  });

  it('variant va size data-atributlarda; className va ref uzatiladi', () => {
    const listRef = createRef<HTMLDivElement>();
    const { container } = render(
      <Tabs defaultValue="a" variant="segmented" size="sm" className="mt-2" data-testid="root">
        <TabsList ref={listRef} className="w-full">
          <TabsTrigger value="a" className="font-bold">
            A
          </TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    const root = screen.getByTestId('root');
    expect(root).toHaveAttribute('data-variant', 'segmented');
    expect(root).toHaveAttribute('data-size', 'sm');
    expect(root).toHaveClass('mt-2');
    expect(listRef.current).toBe(screen.getByRole('tablist'));
    expect(listRef.current).toHaveClass('w-full');
    expect(screen.getByRole('tab')).toHaveClass('font-bold');
    expect(container.querySelector('[data-tabs-indicator]')).toHaveAttribute('aria-hidden', 'true');
  });

  it('indikator faol tab joyiga siljiydi', async () => {
    // jsdom layout hisoblamaydi — tab o'lchamlarini tartib raqamidan beramiz
    const indexOf = (el: HTMLElement) =>
      el.getAttribute('role') === 'tab' && el.parentElement
        ? Array.from(el.parentElement.querySelectorAll('[role="tab"]')).indexOf(el)
        : 0;
    vi.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(function (
      this: HTMLElement,
    ) {
      return indexOf(this) * 100;
    });
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (
      this: HTMLElement,
    ) {
      return 80 + indexOf(this) * 10;
    });

    const user = userEvent.setup();
    const { container } = render(<Demo />);
    const indicator = container.querySelector<HTMLElement>('[data-tabs-indicator]')!;
    expect(indicator.style.transform).toBe('translateX(0px)');
    expect(indicator.style.width).toBe('80px');
    expect(indicator.style.opacity).toBe('1');

    await user.click(screen.getByRole('tab', { name: 'Sharhlar' }));
    expect(indicator.style.transform).toBe('translateX(200px)');
    expect(indicator.style.width).toBe('100px');
  });

  it('pills va segmented’da indikator butun tabni egallaydi', () => {
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(40);
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(90);
    const { container } = render(<Demo variant="pills" />);
    const indicator = container.querySelector<HTMLElement>('[data-tabs-indicator]')!;
    expect(indicator.style.width).toBe('90px');
    expect(indicator.style.height).toBe('40px');
    expect(indicator).toHaveClass('bg-primary-soft');
  });
});
