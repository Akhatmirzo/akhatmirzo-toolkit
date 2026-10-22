import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { forwardRef, type ComponentProps } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppShell, useAppShell, type AppShellProps } from './app-shell';
import { Sidebar } from './sidebar';

const HomeIcon = () => <svg data-testid="home-icon" />;

function setDesktop(desktop: boolean) {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: desktop && query.includes('min-width: 1024px'),
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList,
  );
}

function Shell(props: Partial<AppShellProps> & { onItem?: () => void }) {
  const { onItem, ...shellProps } = props;
  return (
    <AppShell {...shellProps}>
      <Sidebar>
        <Sidebar.Header>Chorsu</Sidebar.Header>
        <Sidebar.Content>
          <Sidebar.Group label="Asosiy">
            <Sidebar.Item icon={<HomeIcon />} href="/" active>
              Bosh sahifa
            </Sidebar.Item>
            <Sidebar.Item icon={<HomeIcon />} href="/orders" badge={12} onClick={onItem}>
              Buyurtmalar
            </Sidebar.Item>
            <Sidebar.Item icon={<HomeIcon />} disabled>
              Hisobotlar
            </Sidebar.Item>
          </Sidebar.Group>
        </Sidebar.Content>
        <Sidebar.Footer>Foydalanuvchi</Sidebar.Footer>
      </Sidebar>
      <AppShell.Main>
        <AppShell.Header>
          <AppShell.SidebarToggle />
        </AppShell.Header>
        <p>Kontent</p>
      </AppShell.Main>
    </AppShell>
  );
}

const root = (container: HTMLElement) =>
  container.querySelector('[data-slot="app-shell"]') as HTMLElement;

describe('AppShell + Sidebar', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('tuzilma: nav, aria-current, badge, skip link → main', () => {
    const { container } = render(<Shell />);
    const nav = screen.getByRole('navigation', { name: 'Asosiy menyu' });
    const home = within(nav).getByRole('link', { name: 'Bosh sahifa' });
    expect(home).toHaveAttribute('aria-current', 'page');
    expect(home).toHaveAttribute('href', '/');
    expect(within(nav).getByRole('link', { name: /Buyurtmalar/ })).not.toHaveAttribute(
      'aria-current',
    );
    expect(within(nav).getByText('12')).toBeInTheDocument();
    expect(within(nav).getByRole('group', { name: 'Asosiy' })).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: 'Hisobotlar' })).toBeDisabled();

    const skip = screen.getByRole('link', { name: "Asosiy kontentga o'tish" });
    const main = screen.getByRole('main');
    expect(skip).toHaveAttribute('href', `#${main.id}`);
    expect(main).toHaveAttribute('tabindex', '-1');
    expect(root(container)).toHaveAttribute('data-sidebar-state', 'expanded');
    // skip link — birinchi fokuslanadigan element
    expect(root(container).firstElementChild).toBe(skip);
  });

  it('desktop: toggle yig‘adi/yoyadi, aria-expanded + aria-controls', async () => {
    setDesktop(true);
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(<Shell onSidebarOpenChange={onChange} />);
    const toggle = screen.getByRole('button', { name: 'Yon menyu' });
    const aside = container.querySelector('aside')!;
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).toHaveAttribute('aria-controls', aside.id);

    await user.click(toggle);
    expect(onChange).toHaveBeenLastCalledWith(false);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(root(container)).toHaveAttribute('data-sidebar-state', 'collapsed');
    expect(aside).toHaveAttribute('data-collapsed');

    await user.click(toggle);
    expect(root(container)).toHaveAttribute('data-sidebar-state', 'expanded');
  });

  it('yig‘ilgan holat: har Item’da aria-label va Tooltip, guruh sarlavhasi faqat sr-only', async () => {
    setDesktop(true);
    const user = userEvent.setup();
    render(<Shell defaultSidebarOpen={false} />);
    const nav = screen.getByRole('navigation', { name: 'Asosiy menyu' });
    const home = within(nav).getByRole('link', { name: 'Bosh sahifa' });
    expect(home).toHaveAttribute('aria-label', 'Bosh sahifa');
    expect(within(nav).getByRole('link', { name: 'Buyurtmalar' })).toHaveAttribute(
      'aria-label',
      'Buyurtmalar',
    );
    expect(within(nav).getByText('Asosiy')).toHaveClass('sr-only');

    await user.hover(home);
    await waitFor(() => expect(screen.getByRole('tooltip')).toHaveTextContent('Bosh sahifa'));
  });

  it('to‘liq holatda Item’da aria-label yo‘q (matn o‘zi nom)', () => {
    setDesktop(true);
    render(<Shell />);
    const nav = screen.getByRole('navigation', { name: 'Asosiy menyu' });
    expect(within(nav).getByRole('link', { name: 'Bosh sahifa' })).not.toHaveAttribute(
      'aria-label',
    );
  });

  it('mod+B yorlig‘i (desktop) yig‘adi', () => {
    setDesktop(true);
    const { container } = render(<Shell />);
    fireEvent.keyDown(window, { key: 'b', code: 'KeyB', ctrlKey: true });
    expect(root(container)).toHaveAttribute('data-sidebar-state', 'collapsed');
    fireEvent.keyDown(window, { key: 'b', code: 'KeyB', ctrlKey: true });
    expect(root(container)).toHaveAttribute('data-sidebar-state', 'expanded');
  });

  it('yig‘ishda fokus Item’da qoladi (body’ga tushmaydi)', () => {
    setDesktop(true);
    render(<Shell />);
    const nav = screen.getByRole('navigation', { name: 'Asosiy menyu' });
    within(nav)
      .getByRole('link', { name: /Buyurtmalar/ })
      .focus();
    fireEvent.keyDown(window, { key: 'b', code: 'KeyB', ctrlKey: true });
    expect(document.activeElement).toBe(within(nav).getByRole('link', { name: /Buyurtmalar/ }));
    fireEvent.keyDown(window, { key: 'b', code: 'KeyB', ctrlKey: true });
    expect(document.activeElement).toBe(within(nav).getByRole('link', { name: /Buyurtmalar/ }));
  });

  it('mod+B input ichida ishlamaydi', () => {
    setDesktop(true);
    const { container } = render(
      <AppShell>
        <AppShell.Main>
          <input aria-label="Qidiruv" />
        </AppShell.Main>
      </AppShell>,
    );
    const input = screen.getByRole('textbox', { name: 'Qidiruv' });
    input.focus();
    fireEvent.keyDown(input, { key: 'b', code: 'KeyB', ctrlKey: true });
    expect(root(container)).toHaveAttribute('data-sidebar-state', 'expanded');
  });

  it('shortcut={false} — yorliq o‘chadi', () => {
    setDesktop(true);
    const { container } = render(<Shell shortcut={false} />);
    fireEvent.keyDown(window, { key: 'b', code: 'KeyB', ctrlKey: true });
    expect(root(container)).toHaveAttribute('data-sidebar-state', 'expanded');
  });

  it('sidebarStorageKey: holat saqlanadi va mount’dan keyin tiklanadi', async () => {
    setDesktop(true);
    const user = userEvent.setup();
    const first = render(<Shell sidebarStorageKey="sb" />);
    await user.click(screen.getByRole('button', { name: 'Yon menyu' }));
    expect(window.localStorage.getItem('sb')).toBe('false');
    first.unmount();

    const { container } = render(<Shell sidebarStorageKey="sb" />);
    await waitFor(() => expect(root(container)).toHaveAttribute('data-sidebar-state', 'collapsed'));
  });

  it('storage xatosi tashlanmaydi', () => {
    setDesktop(true);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('taqiqlangan');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('taqiqlangan');
    });
    const { container } = render(<Shell sidebarStorageKey="sb" />);
    fireEvent.click(screen.getByRole('button', { name: 'Yon menyu' }));
    expect(root(container)).toHaveAttribute('data-sidebar-state', 'collapsed');
  });

  it('SSR: storage’da qiymat bo‘lsa ham serverda defaultSidebarOpen chiziladi', () => {
    window.localStorage.setItem('sb', 'false');
    const html = renderToString(<Shell sidebarStorageKey="sb" />);
    expect(html).toContain('data-sidebar-state="expanded"');
    expect(html).not.toContain('data-sidebar-state="collapsed"');
  });

  it('boshqariladigan rejim: sidebarOpen', () => {
    setDesktop(true);
    const { container, rerender } = render(<Shell sidebarOpen={false} />);
    expect(root(container)).toHaveAttribute('data-sidebar-state', 'collapsed');
    rerender(<Shell sidebarOpen />);
    expect(root(container)).toHaveAttribute('data-sidebar-state', 'expanded');
  });

  it('mobil: toggle Drawer’ni ochadi, Item bosilganda yopiladi', async () => {
    setDesktop(false);
    const user = userEvent.setup();
    const onItem = vi.fn();
    render(<Shell onItem={onItem} />);
    const toggle = screen.getByRole('button', { name: 'Yon menyu' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle);
    const dialog = await screen.findByRole('dialog', { name: 'Menyu' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).toHaveAttribute('aria-controls', dialog.id);

    const item = within(dialog).getByRole('link', { name: /Buyurtmalar/ });
    // jsdom navigatsiya qilmasin
    item.addEventListener('click', (e) => e.preventDefault(), { once: true });
    await user.click(item);
    expect(onItem).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('mobil: mod+B Drawer’ni ochadi', async () => {
    setDesktop(false);
    render(<Shell />);
    act(() => {
      fireEvent.keyDown(window, { key: 'b', code: 'KeyB', ctrlKey: true });
    });
    expect(await screen.findByRole('dialog', { name: 'Menyu' })).toBeInTheDocument();
  });

  it('renderLink: o‘z havola komponentiga prop’lar beriladi', () => {
    const MyLink = forwardRef<HTMLAnchorElement, ComponentProps<'a'>>((p, ref) => (
      <a ref={ref} data-my-link="" {...p} />
    ));
    render(
      <AppShell>
        <Sidebar>
          <Sidebar.Content>
            <Sidebar.Group>
              <Sidebar.Item
                href="/settings"
                active
                id="settings-link"
                target="_self"
                renderLink={(p) => <MyLink {...p} />}
              >
                Sozlamalar
              </Sidebar.Item>
            </Sidebar.Group>
          </Sidebar.Content>
        </Sidebar>
      </AppShell>,
    );
    const link = screen.getByRole('link', { name: 'Sozlamalar' });
    expect(link).toHaveAttribute('data-my-link');
    expect(link).toHaveAttribute('href', '/settings');
    expect(link).toHaveAttribute('aria-current', 'page');
    expect(link).toHaveAttribute('id', 'settings-link');
    expect(link).toHaveAttribute('target', '_self');
  });

  it('collapsible guruh: sarlavha bosilganda yig‘iladi', async () => {
    const user = userEvent.setup();
    render(
      <AppShell>
        <Sidebar>
          <Sidebar.Content>
            <Sidebar.Group label="Hisobotlar" collapsible>
              <Sidebar.Item href="/r/sales">Savdo</Sidebar.Item>
            </Sidebar.Group>
          </Sidebar.Content>
        </Sidebar>
      </AppShell>,
    );
    const trigger = screen.getByRole('button', { name: 'Hisobotlar' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Savdo' })).toBeInTheDocument();
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: 'Savdo' })).not.toBeInTheDocument();
  });

  it('useAppShell: holat va AppShell’siz xato', () => {
    function Probe() {
      const { sidebarOpen, collapsed, mobileOpen } = useAppShell();
      return <span data-testid="probe">{`${sidebarOpen}-${collapsed}-${mobileOpen}`}</span>;
    }
    render(
      <AppShell defaultSidebarOpen={false}>
        <Probe />
      </AppShell>,
    );
    expect(screen.getByTestId('probe')).toHaveTextContent('false-true-false');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/AppShell/);
  });

  it('className, ref va qolgan atributlar ildizga', () => {
    let node: HTMLDivElement | null = null;
    render(
      <AppShell
        ref={(n) => {
          node = n;
        }}
        className="custom"
        id="shell"
      />,
    );
    expect(node).toHaveAttribute('id', 'shell');
    expect(node).toHaveClass('custom');
  });
});
