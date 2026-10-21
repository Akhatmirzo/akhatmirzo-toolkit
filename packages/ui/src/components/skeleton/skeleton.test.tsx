import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Skeleton, SkeletonText } from './skeleton';

describe('Skeleton', () => {
  it('surface-muted fon, shimmer, reduced-motion pulsatsiya, aria-hidden', () => {
    render(<Skeleton data-testid="sk" className="h-4 w-32" />);
    const sk = screen.getByTestId('sk');
    expect(sk).toHaveAttribute('aria-hidden', 'true');
    expect(sk).toHaveAttribute('data-variant', 'rect');
    expect(sk).toHaveClass('bg-surface-muted', 'rounded-md', 'h-4', 'w-32');
    expect(sk).toHaveClass('before:animate-shimmer');
    expect(sk).toHaveClass('motion-reduce:animate-pulse', 'motion-reduce:before:hidden');
  });

  it("o'zining <style> elementini qo'shmaydi — keyframe tokenlarda", () => {
    render(<Skeleton />);
    expect(document.querySelector('style[data-href]')).toBeNull();
  });

  it('variant circle', () => {
    render(<Skeleton data-testid="sk" variant="circle" className="size-10" />);
    const sk = screen.getByTestId('sk');
    expect(sk).toHaveClass('rounded-full', 'size-10');
    expect(sk).not.toHaveClass('rounded-md');
  });

  it('ekran o‘quvchidan yashirin, ota aria-busy bilan', () => {
    render(
      <div aria-busy="true" aria-label="Yuklanmoqda" role="region">
        <Skeleton className="h-4" />
      </div>,
    );
    expect(screen.getByRole('region')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByRole('presentation')).not.toBeInTheDocument();
  });

  it('className, ref va qolgan atributlar', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Skeleton ref={ref} id="s1" data-testid="sk" className="rounded-xl" />);
    const sk = screen.getByTestId('sk');
    expect(ref.current).toBe(sk);
    expect(sk).toHaveAttribute('id', 's1');
    expect(sk).toHaveClass('rounded-xl');
    expect(sk).not.toHaveClass('rounded-md');
  });
});

describe('Skeleton.Text', () => {
  it('default 3 qator, oxirgisi 60%', () => {
    render(<Skeleton.Text data-testid="t" />);
    const root = screen.getByTestId('t');
    expect(root).toHaveAttribute('aria-hidden', 'true');
    const lines = Array.from(root.children);
    expect(lines).toHaveLength(3);
    expect(lines[0]).toHaveClass('w-full', 'h-4');
    expect(lines[1]).toHaveClass('w-full');
    expect(lines[2]).toHaveClass('w-3/5');
  });

  it('lines prop', () => {
    render(<SkeletonText lines={5} data-testid="t" />);
    expect(screen.getByTestId('t').children).toHaveLength(5);
  });

  it('bitta qator to‘liq kenglikda', () => {
    render(<SkeletonText lines={1} data-testid="t" />);
    const [line] = Array.from(screen.getByTestId('t').children);
    expect(line).toHaveClass('w-full');
  });

  it('Skeleton.Text === SkeletonText', () => {
    expect(Skeleton.Text).toBe(SkeletonText);
  });
});
