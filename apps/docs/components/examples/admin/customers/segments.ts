import type { BadgeColor } from '@akhatmirzo/ui';
import { DEMO_NOW, type Customer } from '../data';
import type { CustomerStats } from '../store';

export type Segment = 'vip' | 'regular' | 'new' | 'sleeping';

export const SEGMENT_META: Record<Segment, { label: string; color: BadgeColor }> = {
  vip: { label: 'VIP', color: 'primary' },
  regular: { label: 'Doimiy', color: 'success' },
  new: { label: 'Yangi', color: 'info' },
  sleeping: { label: 'Faol emas', color: 'neutral' },
};

const DAY = 86_400_000;

/** Mijoz segmenti: xarid summasi, soni va oxirgi faollik bo'yicha */
export function segmentOf(customer: Customer, stats: CustomerStats | undefined): Segment {
  if (stats && stats.spent >= 10_000_000) return 'vip';
  if (DEMO_NOW.getTime() - customer.createdAt < 30 * DAY) return 'new';
  if (stats && stats.orders >= 2) return 'regular';
  return 'sleeping';
}
