import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Pagination, PaginationInfo } from './index';

const full = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('[data-slot="pagination-list"]')!;

describe('Pagination', () => {
  it('nav > ul tuzilishi, nav nomi va joriy sahifa', () => {
    render(<Pagination defaultPage={5} total={200} pageSize={10} compact={false} />);
    const nav = screen.getByRole('navigation', { name: 'Sahifalash' });
    expect(within(nav).getByRole('list')).toBeInTheDocument();
    const current = screen.getByRole('button', { name: '5-sahifa' });
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(current).toHaveAttribute('data-active');
    expect(screen.getByRole('button', { name: '4-sahifa' })).not.toHaveAttribute('aria-current');
  });

  it('getPagination natijasi bo‘yicha sahifalar va ko‘p nuqta', () => {
    const { container } = render(
      <Pagination defaultPage={5} total={200} pageSize={10} compact={false} />,
    );
    const items = within(full(container))
      .getAllByRole('listitem')
      .map((li) => li.textContent);
    // ‹ 1 … 4 5 6 … 20 ›
    expect(items.slice(1, -1)).toEqual([
      '1',
      '…Boshqa sahifalar',
      '4',
      '5',
      '6',
      '…Boshqa sahifalar',
      '20',
    ]);
    // ko'p nuqta bosilmaydi
    expect(container.querySelectorAll('[data-slot="pagination-ellipsis"] button')).toHaveLength(0);
  });

  it('bosilganda onPageChange chaqiriladi (boshqarilmaydigan)', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination total={50} pageSize={10} onPageChange={onPageChange} compact={false} />);
    await user.click(screen.getByRole('button', { name: '3-sahifa' }));
    expect(onPageChange).toHaveBeenLastCalledWith(3);
    expect(screen.getByRole('button', { name: '3-sahifa' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await user.click(screen.getByRole('button', { name: 'Keyingi sahifa' }));
    expect(onPageChange).toHaveBeenLastCalledWith(4);
    await user.click(screen.getByRole('button', { name: 'Oldingi sahifa' }));
    expect(onPageChange).toHaveBeenLastCalledWith(3);
  });

  it('chekkada oldingi / keyingi o‘chiriladi', () => {
    const { rerender } = render(
      <Pagination page={1} total={30} pageSize={10} showFirstLast compact={false} />,
    );
    expect(screen.getByRole('button', { name: 'Oldingi sahifa' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Birinchi sahifa' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Keyingi sahifa' })).toBeEnabled();
    rerender(<Pagination page={3} total={30} pageSize={10} showFirstLast compact={false} />);
    expect(screen.getByRole('button', { name: 'Keyingi sahifa' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Oxirgi sahifa' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Oldingi sahifa' })).toBeEnabled();
  });

  it('pageCount to‘g‘ridan-to‘g‘ri beriladi', () => {
    render(<Pagination page={2} pageCount={3} compact={false} />);
    expect(screen.getByRole('button', { name: '3-sahifa' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '4-sahifa' })).not.toBeInTheDocument();
  });

  it('getHref — haqiqiy havolalar; chekkada havola emas', () => {
    render(
      <Pagination
        page={1}
        total={40}
        pageSize={10}
        getHref={(p) => `/blog?page=${p}`}
        compact={false}
      />,
    );
    const link = screen.getByRole('link', { name: '2-sahifa' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/blog?page=2');
    expect(screen.getByRole('link', { name: '1-sahifa' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Keyingi sahifa' })).toHaveAttribute(
      'href',
      '/blog?page=2',
    );
    expect(screen.queryByRole('link', { name: 'Oldingi sahifa' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Oldingi sahifa' })).toBeDisabled();
  });

  it('havola: Ctrl/⌘ bilan bosilsa sahifa holati o‘zgarmaydi', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        page={1}
        onPageChange={onPageChange}
        total={40}
        getHref={(p) => `#page-${p}`}
        compact={false}
      />,
    );
    const link = screen.getByRole('link', { name: '2-sahifa' });
    fireEvent.click(link, { ctrlKey: true });
    expect(onPageChange).not.toHaveBeenCalled();
    fireEvent.click(link);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('renderLink — o‘z havola komponenti (Next Link)', () => {
    const renderLink = vi.fn(({ page, ...props }) => (
      <a data-router="" data-page={page} {...props} />
    ));
    render(
      <Pagination
        page={2}
        pageCount={3}
        getHref={(p) => `/p/${p}`}
        renderLink={renderLink}
        compact={false}
      />,
    );
    const link = screen.getByRole('link', { name: '3-sahifa' });
    expect(link).toHaveAttribute('data-router');
    expect(link).toHaveAttribute('data-page', '3');
    expect(link).toHaveAttribute('href', '/p/3');
    expect(renderLink).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, 'aria-current': 'page', href: '/p/2' }),
    );
  });

  it('compact — "3 / 24" ko‘rinishi', () => {
    const { container } = render(<Pagination page={3} pageCount={24} compact />);
    expect(container.querySelector('[data-slot="pagination-list"]')).toBeNull();
    const short = container.querySelector('[data-slot="pagination-compact"]')!;
    expect(short).toHaveTextContent('3 / 24');
    expect(within(short as HTMLElement).getByText('3-sahifa, jami 24 ta')).toHaveClass('sr-only');
  });

  it("compact='auto' — ikkala ko'rinish, breakpoint klasslari bilan (SSR uchun xavfsiz)", () => {
    const { container } = render(<Pagination page={3} pageCount={24} />);
    expect(container.querySelector('[data-slot="pagination-list"]')).toHaveClass('max-sm:hidden');
    expect(container.querySelector('[data-slot="pagination-compact"]')).toHaveClass('sm:hidden');
  });

  it('klaviatura: Tab bilan yurish, Enter bilan tanlash', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination page={1} pageCount={3} onPageChange={onPageChange} compact={false} />);
    await user.tab(); // oldingi — o'chirilgan, o'tkazib yuboriladi
    expect(screen.getByRole('button', { name: '1-sahifa' })).toHaveFocus();
    await user.tab();
    await user.keyboard('{Enter}');
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('labels, size, className, ref va qolgan prop’lar', () => {
    const ref = createRef<HTMLElement>();
    render(
      <Pagination
        ref={ref}
        id="pg"
        size="sm"
        className="mt-4"
        pageCount={2}
        compact={false}
        labels={{ nav: 'Pages', page: (n) => `Page ${n}` }}
      />,
    );
    const nav = screen.getByRole('navigation', { name: 'Pages' });
    expect(ref.current).toBe(nav);
    expect(nav).toHaveAttribute('id', 'pg');
    expect(nav).toHaveAttribute('data-size', 'sm');
    expect(nav).toHaveClass('mt-4');
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('data-size', 'sm');
  });

  it('a11y: tugmalarning barchasi nomga ega, ikonkalar yashirin', () => {
    const { container } = render(<Pagination page={5} total={200} pageSize={10} showFirstLast />);
    container.querySelectorAll('button, a').forEach((el) => {
      expect(el).toHaveAccessibleName();
    });
    container.querySelectorAll('svg').forEach((svg) => {
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });
});

describe('PaginationInfo', () => {
  it('"21–30 / 230 ta" matni', () => {
    render(<PaginationInfo page={3} pageSize={10} total={230} />);
    expect(screen.getByText('21–30 / 230 ta')).toHaveAttribute('aria-live', 'polite');
  });

  it('oxirgi sahifa va template', () => {
    render(
      <PaginationInfo
        page={24}
        pageSize={10}
        total={233}
        labels={{ template: (f, t, n) => `${f}-${t} of ${n}` }}
      />,
    );
    expect(screen.getByText('231-233 of 233')).toBeInTheDocument();
  });

  it('bo‘sh ro‘yxat', () => {
    render(<PaginationInfo page={1} pageSize={10} total={0} />);
    expect(screen.getByText("Ma'lumot yo'q")).toBeInTheDocument();
  });
});
