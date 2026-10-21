import { describe, expect, it } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('shartli klasslarni birlashtiradi', () => {
    const hidden = false;
    expect(cn('px-4', hidden && 'hidden', ['py-2'], { 'font-bold': true })).toBe(
      'px-4 py-2 font-bold',
    );
  });

  it('Tailwind konfliktida tashqaridan berilgan klass ustun turadi', () => {
    expect(cn('px-4 bg-primary', 'px-2')).toBe('bg-primary px-2');
  });
});
