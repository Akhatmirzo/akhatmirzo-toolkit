import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Breadcrumb, type BreadcrumbItem } from './index';

const items: BreadcrumbItem[] = [
  { label: 'Bosh sahifa', href: '/' },
  { label: 'Katalog', href: '/catalog' },
  { label: 'Mahsulotlar', href: '/products' },
  { label: 'Telefonlar', href: '/products/phones' },
  { label: 'Apple', href: '/products/phones/apple' },
  { label: 'iPhone 17' },
];

const ellipsis = (container: HTMLElement, viewport: 'desktop' | 'mobile') =>
  container.querySelector<HTMLElement>(
    `[data-slot="breadcrumb-ellipsis"][data-viewport="${viewport}"]`,
  );

describe('Breadcrumb', () => {
  it('nav > ol, havolalar va joriy sahifa', () => {
    render(<Breadcrumb items={items.slice(0, 2).concat(items.slice(-1))} />);
    const nav = screen.getByRole('navigation', { name: "Sahifa yo'li" });
    const list = within(nav).getByRole('list');
    expect(list.tagName).toBe('OL');
    expect(screen.getByRole('link', { name: 'Bosh sahifa' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Katalog' })).toHaveAttribute('href', '/catalog');
    const current = screen.getByText('iPhone 17').closest('[aria-current]');
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByRole('link', { name: 'iPhone 17' })).not.toBeInTheDocument();
  });

  it('separator aria-hidden; birinchi elementda yo‘q', () => {
    const { container } = render(<Breadcrumb items={items.slice(0, 3)} separator="/" />);
    const seps = container.querySelectorAll('[data-slot="breadcrumb-separator"]');
    // 3 element: 2 ta separator + mobil "…"da yo'q
    expect(seps).toHaveLength(2);
    seps.forEach((s) => {
      expect(s).toHaveAttribute('aria-hidden', 'true');
      expect(s).toHaveTextContent('/');
    });
  });

  it('maxItems: birinchi + … + oxirgi 2 ta', () => {
    const { container } = render(<Breadcrumb items={items} maxItems={4} />);
    expect(screen.getByRole('link', { name: 'Bosh sahifa' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Apple' })).toBeInTheDocument();
    expect(screen.getByText('iPhone 17')).toBeInTheDocument();
    for (const name of ['Katalog', 'Mahsulotlar', 'Telefonlar']) {
      expect(screen.queryByRole('link', { name })).not.toBeInTheDocument();
    }
    expect(ellipsis(container, 'desktop')).toHaveClass('max-sm:hidden');
  });

  it('… bosilganda yashiringanlar DropdownMenu’da', async () => {
    const user = userEvent.setup();
    const { container } = render(<Breadcrumb items={items} maxItems={4} />);
    const trigger = within(ellipsis(container, 'desktop')!).getByRole('button', {
      name: 'Yashirilgan sahifalar',
    });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    await user.click(trigger);
    const menu = await screen.findByRole('menu');
    const menuItems = within(menu).getAllByRole('menuitem');
    expect(menuItems.map((m) => m.textContent)).toEqual(['Katalog', 'Mahsulotlar', 'Telefonlar']);
    expect(menuItems[1]).toHaveAttribute('href', '/products');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('klaviatura: Enter bilan menyu ochiladi, strelka bilan yuriladi', async () => {
    const user = userEvent.setup();
    const { container } = render(<Breadcrumb items={items} maxItems={4} />);
    within(ellipsis(container, 'desktop')!).getByRole('button').focus();
    await user.keyboard('{Enter}');
    const menu = await screen.findByRole('menu');
    const [first, second] = within(menu).getAllByRole('menuitem');
    expect(first).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(second).toHaveFocus();
  });

  it('tor ekran: … + ota + joriy (CSS breakpoint bilan)', async () => {
    const user = userEvent.setup();
    const { container } = render(<Breadcrumb items={items} maxItems={4} />);
    const mobile = ellipsis(container, 'mobile')!;
    expect(mobile).toHaveClass('sm:hidden');
    // mobil "…" birinchi ko'rinadigan element — separatorsiz
    expect(mobile.querySelector('[data-slot="breadcrumb-separator"]')).toBeNull();
    // birinchi element telefonda yashirin
    expect(screen.getByRole('link', { name: 'Bosh sahifa' }).closest('li')).toHaveClass(
      'max-sm:hidden',
    );
    await user.click(within(mobile).getByRole('button'));
    const menu = await screen.findByRole('menu');
    expect(
      within(menu)
        .getAllByRole('menuitem')
        .map((m) => m.textContent),
    ).toEqual(['Bosh sahifa', 'Katalog', 'Mahsulotlar', 'Telefonlar']);
  });

  it('2 ta elementda yig‘ilmaydi', () => {
    const { container } = render(<Breadcrumb items={items.slice(-2)} />);
    expect(container.querySelector('[data-slot="breadcrumb-ellipsis"]')).toBeNull();
  });

  it('renderLink — Next Link uchun', () => {
    const renderLink = vi.fn((props) => <a data-router="" {...props} />);
    render(<Breadcrumb items={items.slice(0, 2)} renderLink={renderLink} />);
    expect(screen.getByRole('link', { name: 'Bosh sahifa' })).toHaveAttribute('data-router');
    expect(renderLink).toHaveBeenCalledWith(expect.objectContaining({ href: '/' }));
  });

  it('href’siz onClick — tugma', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Breadcrumb items={[{ label: 'Orqaga', onClick }, { label: 'Joriy' }]} />);
    await user.click(screen.getByRole('button', { name: 'Orqaga' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('labels, size, className, ref', () => {
    const ref = createRef<HTMLElement>();
    render(
      <Breadcrumb
        ref={ref}
        items={items.slice(0, 2)}
        size="sm"
        className="mb-2"
        labels={{ nav: 'Breadcrumb' }}
      />,
    );
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(ref.current).toBe(nav);
    expect(nav).toHaveAttribute('data-size', 'sm');
    expect(nav).toHaveClass('mb-2');
    expect(within(nav).getByRole('list')).toHaveClass('text-xs');
  });

  it('maxItems juda kichik: yashiradigan element bo‘lmasa "…" chiqmaydi', () => {
    const { container } = render(<Breadcrumb items={items.slice(0, 2)} maxItems={1} />);
    expect(ellipsis(container, 'desktop')).toBeNull();
  });

  it('a11y: interaktiv elementlar nomga ega', () => {
    const { container } = render(<Breadcrumb items={items} maxItems={3} />);
    container.querySelectorAll('a, button').forEach((el) => {
      expect(el).toHaveAccessibleName();
    });
    expect(container.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
  });
});
