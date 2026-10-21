import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { VirtualList, type VirtualListHandle } from './virtual-list';

// jsdom layout hisoblamaydi: scroll konteyneri balandligini va scrollTo'ni taqlid qilamiz
const VIEWPORT = 480;
let restore: () => void = () => {};

beforeAll(() => {
  const clientHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight');
  const clientWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth');
  const scrollHeight = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollHeight');
  const scrollTo = HTMLElement.prototype.scrollTo;
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    get(this: HTMLElement) {
      return this.dataset.slot === 'virtual-list' ? VIEWPORT : 0;
    },
  });
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get: () => 320,
  });
  Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
    configurable: true,
    get(this: HTMLElement) {
      const list = this.firstElementChild as HTMLElement | null;
      return parseFloat(list?.style.height ?? '') || 0;
    },
  });
  HTMLElement.prototype.scrollTo = function (
    this: HTMLElement,
    options?: ScrollToOptions | number,
  ) {
    const top = typeof options === 'object' ? (options.top ?? 0) : 0;
    this.scrollTop = top;
    this.dispatchEvent(new Event('scroll'));
  } as typeof HTMLElement.prototype.scrollTo;
  restore = () => {
    if (clientHeight) Object.defineProperty(HTMLElement.prototype, 'clientHeight', clientHeight);
    if (clientWidth) Object.defineProperty(HTMLElement.prototype, 'clientWidth', clientWidth);
    HTMLElement.prototype.scrollTo = scrollTo;
    delete (HTMLElement.prototype as { scrollHeight?: number }).scrollHeight;
    if (scrollHeight) Object.defineProperty(Element.prototype, 'scrollHeight', scrollHeight);
  };
});

afterAll(() => restore());

const makeItems = (n: number) => Array.from({ length: n }, (_, i) => `Qator ${i + 1}`);

function scrollTo(top: number) {
  const el = document.querySelector<HTMLElement>('[data-slot="virtual-list"]')!;
  act(() => {
    el.scrollTop = top;
    fireEvent.scroll(el);
  });
}

describe('VirtualList', () => {
  it('10 000 elementdan faqat ko`rinadiganlarini chizadi; ARIA list/listitem', () => {
    render(
      <VirtualList
        aria-label="Jurnal"
        items={makeItems(10_000)}
        estimateSize={48}
        height={VIEWPORT}
        overscan={2}
        renderItem={(item) => <span>{item}</span>}
      />,
    );
    const list = screen.getByRole('list', { name: 'Jurnal' });
    expect(list).toHaveStyle({ height: `${10_000 * 48}px` });
    const rows = screen.getAllByRole('listitem');
    // 480 / 48 = 10 ko'rinadigan + 2 overscan
    expect(rows.length).toBeGreaterThanOrEqual(10);
    expect(rows.length).toBeLessThanOrEqual(13);
    expect(rows[0]).toHaveTextContent('Qator 1');
    expect(rows[0]).toHaveAttribute('aria-setsize', '10000');
    expect(rows[0]).toHaveAttribute('aria-posinset', '1');
    expect(rows[0]).toHaveStyle({ height: '48px', transform: 'translateY(0px)' });

    const root = document.querySelector('[data-slot="virtual-list"]')!;
    expect(root).toHaveStyle({ height: `${VIEWPORT}px` });
    expect(root).toHaveAttribute('tabindex', '0');
  });

  it('scroll qilinganda oyna siljiydi', () => {
    render(
      <VirtualList
        items={makeItems(10_000)}
        estimateSize={48}
        height={VIEWPORT}
        overscan={0}
        renderItem={(item) => <span>{item}</span>}
      />,
    );
    scrollTo(48 * 5000);
    const rows = screen.getAllByRole('listitem');
    expect(rows[0]).toHaveTextContent('Qator 5001');
    expect(rows[0]).toHaveAttribute('aria-posinset', '5001');
    expect(rows[0]).toHaveStyle({ transform: `translateY(${48 * 5000}px)` });
    expect(screen.queryByText('Qator 1')).not.toBeInTheDocument();
  });

  it('ref.scrollToIndex va element', () => {
    const ref = createRef<VirtualListHandle>();
    render(
      <VirtualList
        ref={ref}
        items={makeItems(1000)}
        estimateSize={40}
        height={VIEWPORT}
        overscan={0}
        renderItem={(item) => <span>{item}</span>}
      />,
    );
    expect(ref.current!.element).toBe(document.querySelector('[data-slot="virtual-list"]'));
    act(() => ref.current!.scrollToIndex(500, { align: 'start' }));
    expect(ref.current!.element!.scrollTop).toBe(500 * 40);
    expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Qator 501');
  });

  it('estimateSize funksiya sifatida va getItemKey', () => {
    const items = makeItems(100).map((label, id) => ({ id: `id-${id}`, label }));
    render(
      <VirtualList
        items={items}
        estimateSize={(i) => (i % 2 === 0 ? 40 : 80)}
        getItemKey={(item) => item.id}
        height={VIEWPORT}
        renderItem={(item, i) => (
          <span>
            {i}: {item.label}
          </span>
        )}
      />,
    );
    expect(screen.getByRole('list')).toHaveStyle({ height: `${50 * 40 + 50 * 80}px` });
    const rows = screen.getAllByRole('listitem');
    expect(rows[1]).toHaveStyle({ height: '80px', transform: 'translateY(40px)' });
    expect(rows[1]).toHaveTextContent('1: Qator 2');
  });

  it('dynamic: haqiqiy balandlik o`lchanadi va pozitsiyalar shunga moslanadi', () => {
    // Qator balandligi: 30 / 50 / 70 px (indeksga qarab)
    const offsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      get(this: HTMLElement) {
        const index = this.dataset.index;
        return index === undefined ? 0 : 30 + (Number(index) % 3) * 20;
      },
    });
    try {
      render(
        <VirtualList
          dynamic
          items={makeItems(50)}
          estimateSize={60}
          height={VIEWPORT}
          overscan={0}
          renderItem={(item) => <p>{item}</p>}
        />,
      );
      const rows = screen.getAllByRole('listitem');
      expect(rows[0]).toHaveAttribute('data-index', '0');
      expect(rows[0]!.style.height).toBe('');
      // 0 → 0, 1 → 30, 2 → 80, 3 → 150
      expect(rows[1]).toHaveStyle({ transform: 'translateY(30px)' });
      expect(rows[3]).toHaveStyle({ transform: 'translateY(150px)' });
      // 480px ga ko'proq qator sig'adi (taxminiy 60px bilan 8 ta edi)
      expect(rows.length).toBeGreaterThan(8);
    } finally {
      if (offsetHeight) Object.defineProperty(HTMLElement.prototype, 'offsetHeight', offsetHeight);
    }
  });

  it('onEndReached: oxiriga 5 qator qolganda, bir uzunlik uchun bir marta', () => {
    const onEndReached = vi.fn();
    const { rerender } = render(
      <VirtualList
        items={makeItems(100)}
        estimateSize={48}
        height={VIEWPORT}
        overscan={0}
        onEndReached={onEndReached}
        renderItem={(item) => <span>{item}</span>}
      />,
    );
    expect(onEndReached).not.toHaveBeenCalled();
    // Ko'rinadigan oxirgi qator — 84-indeks (100 - 1 - 5 = 94 ga yetmagan)
    scrollTo(48 * 75);
    expect(onEndReached).not.toHaveBeenCalled();
    // Oxirgi ko'rinadigan — 94-indeks
    scrollTo(48 * 85);
    expect(onEndReached).toHaveBeenCalledTimes(1);
    scrollTo(48 * 90);
    expect(onEndReached).toHaveBeenCalledTimes(1);

    // Yangi ma'lumot kelgach yana chaqiriladi
    rerender(
      <VirtualList
        items={makeItems(200)}
        estimateSize={48}
        height={VIEWPORT}
        overscan={0}
        onEndReached={onEndReached}
        renderItem={(item) => <span>{item}</span>}
      />,
    );
    expect(onEndReached).toHaveBeenCalledTimes(1);
    scrollTo(48 * 190);
    expect(onEndReached).toHaveBeenCalledTimes(2);
  });

  it('loadingMore: Spinner qatori, aria-busy, bu paytda onEndReached chaqirilmaydi', () => {
    const onEndReached = vi.fn();
    render(
      <VirtualList
        items={makeItems(5)}
        estimateSize={48}
        height={VIEWPORT}
        loadingMore
        onEndReached={onEndReached}
        labels={{ loadingMore: 'Yana yuklanmoqda' }}
        renderItem={(item) => <span>{item}</span>}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Yana yuklanmoqda');
    expect(screen.getByRole('list')).toHaveAttribute('aria-busy', 'true');
    expect(onEndReached).not.toHaveBeenCalled();
  });

  it('yuklash xato bilan tugasa (uzunlik o`zgarmasa) onEndReached qayta chaqiriladi', () => {
    const onEndReached = vi.fn();
    const props = {
      items: makeItems(3),
      estimateSize: 48,
      height: VIEWPORT,
      onEndReached,
      renderItem: (item: string) => <span>{item}</span>,
    };
    const { rerender } = render(<VirtualList {...props} />);
    expect(onEndReached).toHaveBeenCalledTimes(1);
    rerender(<VirtualList {...props} loadingMore />);
    expect(onEndReached).toHaveBeenCalledTimes(1);
    // Yangi qator kelmadi — qayta urinish
    rerender(<VirtualList {...props} loadingMore={false} />);
    expect(onEndReached).toHaveBeenCalledTimes(2);
    rerender(<VirtualList {...props} loadingMore={false} />);
    expect(onEndReached).toHaveBeenCalledTimes(2);
  });

  it('ro`yxat ekranga sig`sa onEndReached darhol chaqiriladi', () => {
    const onEndReached = vi.fn();
    render(
      <VirtualList
        items={makeItems(3)}
        estimateSize={48}
        height={VIEWPORT}
        onEndReached={onEndReached}
        renderItem={(item) => <span>{item}</span>}
      />,
    );
    expect(onEndReached).toHaveBeenCalledTimes(1);
  });

  it('bo`sh holat: default matn va emptyState', () => {
    const { rerender } = render(
      <VirtualList items={[]} estimateSize={48} height={200} renderItem={() => null} />,
    );
    expect(screen.getByText("Ro'yxat bo'sh")).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    rerender(
      <VirtualList
        items={[]}
        estimateSize={48}
        height={200}
        emptyState={<b>Hali yozuvlar yo&apos;q</b>}
        renderItem={() => null}
      />,
    );
    expect(screen.getByText("Hali yozuvlar yo'q")).toBeInTheDocument();
  });

  it('className, style va qolgan atributlar ildizga; klaviatura bilan fokuslanadi', async () => {
    const user = userEvent.setup();
    render(
      <VirtualList
        id="jurnal"
        data-testid="vl"
        className="rounded-xl border border-border"
        style={{ maxWidth: 400 }}
        height="60vh"
        items={makeItems(10)}
        estimateSize={48}
        renderItem={(item) => <span>{item}</span>}
      />,
    );
    const root = screen.getByTestId('vl');
    expect(root).toHaveAttribute('id', 'jurnal');
    expect(root).toHaveClass('rounded-xl', 'overflow-y-auto', 'focus-ring');
    expect(root.style.maxWidth).toBe('400px');
    expect(root.style.height).toBe('60vh');
    await user.tab();
    expect(root).toHaveFocus();
  });
});
