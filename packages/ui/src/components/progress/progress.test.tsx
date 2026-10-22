import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Progress, ProgressCircle } from './progress';

describe('Progress', () => {
  it('role="progressbar" va aria qiymatlari', () => {
    render(<Progress value={64} label="Yuklanmoqda" />);
    const bar = screen.getByRole('progressbar', { name: 'Yuklanmoqda' });
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(bar).toHaveAttribute('aria-valuenow', '64');
    expect(bar).toHaveAttribute('aria-valuetext', '64%');
    expect(bar).toHaveAttribute('data-state', 'loading');
    expect(bar).toHaveAttribute('data-size', 'md');
    expect(bar).toHaveAttribute('data-color', 'primary');
  });

  it('to‘lgan qism transform bilan siljiydi va token rangida', () => {
    render(<Progress value={25} aria-label="Yuklash" color="success" />);
    const indicator = screen
      .getByRole('progressbar')
      .querySelector<HTMLElement>('[data-progress-indicator]')!;
    expect(indicator.style.transform).toBe('translateX(-75%)');
    expect(indicator).toHaveClass('bg-success', 'duration-slow', 'ease-out');
  });

  it('value={null} (standart) — noaniq holat, aria-valuenow yo‘q', () => {
    render(<Progress aria-label="Yuklanmoqda" showValue />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('data-state', 'indeterminate');
    expect(bar).not.toHaveAttribute('aria-valuenow');
    expect(bar).not.toHaveAttribute('aria-valuetext');
    expect(bar.querySelector('.animate-shimmer')).not.toBeNull();
    expect(bar.querySelector('[data-progress-indicator]')).toHaveClass(
      'motion-reduce:animate-pulse',
    );
    // showValue noaniq holatda hech narsa ko'rsatmaydi
    expect(bar).toHaveTextContent('');
  });

  it('value >= max → complete; qiymat 0..max oralig‘ida chegaralanadi', () => {
    const { rerender } = render(<Progress value={150} aria-label="x" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('data-state', 'complete');
    expect(bar).toHaveAttribute('aria-valuenow', '100');
    rerender(<Progress value={-5} aria-label="x" />);
    expect(bar).toHaveAttribute('aria-valuenow', '0');
  });

  it('max va formatValue', () => {
    render(
      <Progress
        value={3}
        max={5}
        label="Qadamlar"
        showValue
        formatValue={(v, max) => `${v} / ${max}`}
      />,
    );
    const bar = screen.getByRole('progressbar', { name: 'Qadamlar' });
    expect(bar).toHaveAttribute('aria-valuemax', '5');
    expect(bar).toHaveAttribute('aria-valuetext', '3 / 5');
    expect(screen.getByText('3 / 5')).toHaveAttribute('aria-hidden', 'true');
  });

  it('showValue — standart foiz matni', () => {
    render(<Progress value={1} max={3} showValue aria-label="x" />);
    expect(screen.getByText('33%')).toBeInTheDocument();
  });

  it.each([
    ['sm', 'h-1'],
    ['md', 'h-2'],
    ['lg', 'h-3'],
  ] as const)('size=%s → trek %s', (size, cls) => {
    render(<Progress value={10} size={size} aria-label="x" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('data-size', size);
    expect(bar.querySelector('[data-progress-track]')).toHaveClass(cls, 'bg-surface-muted');
  });

  it('className, ref va qolgan atributlar ildizga', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Progress ref={ref} value={5} className="max-w-xs" id="p1" aria-label="x" />);
    const bar = screen.getByRole('progressbar');
    expect(ref.current).toBe(bar);
    expect(bar).toHaveAttribute('id', 'p1');
    expect(bar).toHaveClass('max-w-xs');
  });
});

describe('ProgressCircle', () => {
  it('aria qiymatlari va label → aria-label', () => {
    render(<ProgressCircle value={72} label="Yuklash" />);
    const circle = screen.getByRole('progressbar', { name: 'Yuklash' });
    expect(circle).toHaveAttribute('aria-label', 'Yuklash');
    expect(circle).toHaveAttribute('aria-valuenow', '72');
    expect(circle).toHaveAttribute('aria-valuetext', '72%');
    expect(circle).toHaveAttribute('data-state', 'loading');
  });

  it('stroke-dashoffset qiymatga mos', () => {
    render(<ProgressCircle value={50} aria-label="x" size="lg" />);
    const indicator = screen.getByRole('progressbar').querySelector('[data-progress-indicator]')!;
    const dash = Number(indicator.getAttribute('stroke-dasharray'));
    const offset = Number(indicator.getAttribute('stroke-dashoffset'));
    expect(offset).toBeCloseTo(dash / 2);
    expect(indicator).toHaveAttribute('stroke-width', '6');
    expect(indicator).toHaveClass('stroke-primary');
  });

  it('noaniq holat — aylanadi, aria-valuenow yo‘q', () => {
    render(<ProgressCircle aria-label="Kutilmoqda" />);
    const circle = screen.getByRole('progressbar', { name: 'Kutilmoqda' });
    expect(circle).toHaveAttribute('data-state', 'indeterminate');
    expect(circle).not.toHaveAttribute('aria-valuenow');
    expect(circle.querySelector('svg')).toHaveClass('animate-spin', 'motion-reduce:animate-pulse');
  });

  it('showValue markazda; sm o‘lchamda ko‘rsatilmaydi', () => {
    const { rerender } = render(<ProgressCircle value={40} showValue aria-label="x" />);
    expect(screen.getByText('40%')).toHaveAttribute('aria-hidden', 'true');
    rerender(<ProgressCircle value={40} showValue size="sm" aria-label="x" />);
    expect(screen.queryByText('40%')).not.toBeInTheDocument();
  });

  it.each([
    ['sm', 'size-6'],
    ['md', 'size-10'],
    ['lg', 'size-16'],
  ] as const)('size=%s → %s', (size, cls) => {
    render(<ProgressCircle value={10} size={size} aria-label="x" />);
    expect(screen.getByRole('progressbar')).toHaveClass(cls);
  });

  it('ReactNode label — ko‘rinmas matn orqali nom beriladi', () => {
    render(<ProgressCircle value={10} label={<b>Fayl</b>} />);
    expect(screen.getByRole('progressbar', { name: 'Fayl' })).toBeInTheDocument();
  });

  it('formatValue aria-valuetext ga tushadi', () => {
    render(
      <ProgressCircle value={2} max={4} formatValue={(v, m) => `${v} dan ${m}`} aria-label="x" />,
    );
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '2 dan 4');
  });
});
