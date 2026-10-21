import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Avatar, AvatarGroup, getAvatarColor, getInitials } from './avatar';

describe('getInitials', () => {
  it.each([
    ['Sarvar Abduxoliqov', 'SA'],
    ['  sarvar   abduxoliqov  ', 'SA'],
    ['Sarvar', 'S'],
    ["O'tkir Hoshimov", 'OH'],
    ['Jasur Karim o‘g‘li', 'JO'],
    ['Шахзод Рахимов', 'ШР'],
    ['', ''],
  ])('%s → %s', (name, expected) => {
    expect(getInitials(name)).toBe(expected);
  });
});

describe('getAvatarColor', () => {
  it('deterministik: bir ism — bir rang', () => {
    expect(getAvatarColor('Sarvar Abduxoliqov')).toBe(getAvatarColor('Sarvar Abduxoliqov'));
    expect(getAvatarColor('Sarvar Abduxoliqov')).toBe(getAvatarColor(' sarvar abduxoliqov '));
  });

  it('faqat semantik token klasslari (hex yo‘q)', () => {
    const names = ['Ali', 'Vali', 'Gulnora', 'Jasur', 'Malika', 'Rustam', 'Dilnoza', 'Bekzod'];
    const colors = new Set(names.map(getAvatarColor));
    expect(colors.size).toBeGreaterThan(1);
    for (const c of colors) {
      expect(c).toMatch(/^bg-[a-z-]+ text-[a-z-]+$/);
      expect(c).not.toMatch(/#/);
    }
  });
});

describe('Avatar', () => {
  it('ism → bosh harflar va accessible nom', () => {
    render(<Avatar name="Sarvar Abduxoliqov" />);
    const avatar = screen.getByRole('img', { name: 'Sarvar Abduxoliqov' });
    expect(avatar).toHaveTextContent('SA');
    expect(avatar).toHaveAttribute('data-state', 'fallback');
    expect(avatar).toHaveAttribute('data-size', 'md');
    expect(avatar).toHaveClass('size-10', 'rounded-full', 'font-sans');
    expect(avatar.className).toContain(getAvatarColor('Sarvar Abduxoliqov'));
  });

  it('rasm yuklanguncha loading, yuklangach loaded', () => {
    const { container } = render(<Avatar src="/a.png" name="Sarvar Abduxoliqov" />);
    const avatar = screen.getByRole('img', { name: 'Sarvar Abduxoliqov' });
    expect(avatar).toHaveAttribute('data-state', 'loading');
    const img = container.querySelector('img')!;
    expect(img).toHaveAttribute('alt', '');
    expect(img).toHaveClass('opacity-0');
    fireEvent.load(img);
    expect(avatar).toHaveAttribute('data-state', 'loaded');
    expect(img).toHaveClass('opacity-100');
  });

  it('rasm yuklanmasa bosh harflarga o‘tadi', () => {
    const { container } = render(<Avatar src="/yoq.png" name="Jasur Karimov" />);
    fireEvent.error(container.querySelector('img')!);
    expect(container.querySelector('img')).not.toBeInTheDocument();
    const avatar = screen.getByRole('img', { name: 'Jasur Karimov' });
    expect(avatar).toHaveAttribute('data-state', 'fallback');
    expect(avatar).toHaveTextContent('JK');
  });

  it('src o‘zgarsa yangi rasm qayta sinab ko‘riladi', () => {
    const { container, rerender } = render(<Avatar src="/1.png" name="Ali Valiyev" />);
    fireEvent.error(container.querySelector('img')!);
    rerender(<Avatar src="/2.png" name="Ali Valiyev" />);
    expect(container.querySelector('img')).toHaveAttribute('src', '/2.png');
  });

  it('alt accessible nomga ustun', () => {
    render(<Avatar src="/a.png" alt="Profil rasmi" name="Sarvar" />);
    expect(screen.getByRole('img', { name: 'Profil rasmi' })).toBeInTheDocument();
  });

  it('ism ham, rasm ham yo‘q — ikonka va aria-hidden', () => {
    const { container } = render(<Avatar data-testid="av" />);
    const avatar = screen.getByTestId('av');
    expect(avatar).toHaveAttribute('aria-hidden', 'true');
    expect(avatar).toHaveClass('bg-surface-muted', 'text-text-muted');
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it.each([
    ['xs', 'size-6'],
    ['sm', 'size-8'],
    ['md', 'size-10'],
    ['lg', 'size-12'],
    ['xl', 'size-16'],
  ] as const)('size %s → %s', (size, cls) => {
    render(<Avatar name="Ali" size={size} />);
    expect(screen.getByRole('img')).toHaveClass(cls);
  });

  it('shape square', () => {
    render(<Avatar name="Ali" shape="square" />);
    const avatar = screen.getByRole('img');
    expect(avatar).toHaveAttribute('data-shape', 'square');
    expect(avatar).not.toHaveClass('rounded-full');
  });

  it.each([
    ['online', 'bg-success', 'onlayn'],
    ['offline', 'bg-text-faint', 'oflayn'],
    ['busy', 'bg-danger', 'band'],
  ] as const)('status %s', (status, cls, label) => {
    const { container } = render(<Avatar name="Ali Valiyev" status={status} />);
    expect(container.querySelector(`[data-avatar-status="${status}"]`)).toHaveClass(cls);
    expect(screen.getByRole('img', { name: `Ali Valiyev (${label})` })).toHaveAttribute(
      'data-status',
      status,
    );
  });

  it('className, ref va qolgan atributlar', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Avatar ref={ref} name="Ali" className="size-20" id="av1" title="Ali" />);
    const avatar = screen.getByRole('img');
    expect(ref.current).toBe(avatar);
    expect(avatar).toHaveAttribute('id', 'av1');
    expect(avatar).toHaveClass('size-20');
    expect(avatar).not.toHaveClass('size-10');
  });
});

describe('AvatarGroup', () => {
  const people = ['Sarvar Abduxoliqov', 'Jasur Karimov', 'Malika Rahimova', 'Dilnoza Ali', 'Bek'];

  it('max dan ortiqchasi "+N"', () => {
    render(
      <AvatarGroup max={3} aria-label="Ishtirokchilar">
        {people.map((p) => (
          <Avatar key={p} name={p} />
        ))}
      </AvatarGroup>,
    );
    const group = screen.getByRole('group', { name: 'Ishtirokchilar' });
    expect(group.children).toHaveLength(4);
    const more = screen.getByRole('img', { name: 'Yana 2 ta' });
    expect(more).toHaveTextContent('+2');
  });

  it('max berilmasa hammasi ko‘rinadi', () => {
    render(
      <AvatarGroup>
        {people.map((p) => (
          <Avatar key={p} name={p} />
        ))}
      </AvatarGroup>,
    );
    expect(screen.getAllByRole('img')).toHaveLength(5);
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });

  it('size va shape bolalarga uzatiladi, halqa qo‘shiladi', () => {
    render(
      <AvatarGroup size="sm" shape="square" max={1} labels={{ more: (n) => `${n} kishi` }}>
        <Avatar name="Ali" />
        <Avatar name="Vali" />
      </AvatarGroup>,
    );
    const ali = screen.getByRole('img', { name: 'Ali' });
    expect(ali).toHaveAttribute('data-size', 'sm');
    expect(ali).toHaveAttribute('data-shape', 'square');
    expect(ali).toHaveClass('ring-2', 'ring-surface');
    expect(screen.getByRole('img', { name: '1 kishi' })).toHaveClass('size-8');
  });

  it('bolaning o‘z size prop’i ustun', () => {
    render(
      <AvatarGroup size="sm">
        <Avatar name="Ali" size="lg" />
      </AvatarGroup>,
    );
    expect(screen.getByRole('img')).toHaveAttribute('data-size', 'lg');
  });
});
